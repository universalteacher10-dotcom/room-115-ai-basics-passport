import crypto from 'node:crypto';
import pg from 'pg';

export const config = { runtime: 'nodejs' };
const { Pool } = pg;
const MAX_PROGRESS = 65000;
const FIELDS = ['page','pathStep','pathDone','pathChecks','pathAnswers','sessions','study','flash','responses','quizIndex','quizAnswers','quizHistory','vocabSearch','vocabFilter','wordIndex','wordFlip','progressName'];
let pool;
function db() {
  if (!pool) pool = new Pool({connectionString:process.env.DATABASE_URL, max:2, idleTimeoutMillis:5000, connectionTimeoutMillis:10000});
  return pool;
}
function send(res, status, obj) {
  res.statusCode=status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.end(JSON.stringify(obj));
}
function digest(text, secret) {return crypto.createHmac('sha256',secret).update(text).digest('hex')}
function equal(a,b) {
  const x=Buffer.from(String(a||'')), y=Buffer.from(String(b||''));
  return x.length===y.length && crypto.timingSafeEqual(x,y);
}
function makeToken(id) {
  const body=Buffer.from(JSON.stringify({id,expires:Date.now()+12*3600*1000})).toString('base64url');
  return body+'.'+digest(body,process.env.SESSION_SECRET);
}
function verifyToken(token) {
  if(typeof token!=='string' || token.length>1000) return null;
  const parts=token.split('.');
  if(parts.length!==2 || !equal(digest(parts[0],process.env.SESSION_SECRET),parts[1])) return null;
  try{
    const p=JSON.parse(Buffer.from(parts[0],'base64url').toString('utf8'));
    return /^[0-9a-f-]{36}$/i.test(p.id) && Number.isFinite(p.expires) && Date.now()<p.expires ? p.id : null;
  }catch{return null}
}
function progressShape(input) {
  if (!input || typeof input!=='object' || Array.isArray(input)) throw new Error('Invalid progress');
  const out={};
  for(const field of FIELDS) if(Object.prototype.hasOwnProperty.call(input,field)) out[field]=input[field];
  const encoded=JSON.stringify(out);
  if(!encoded || encoded.length>MAX_PROGRESS) throw new Error('Progress too large');
  return encoded;
}
function auth(req) {
  const header=req.headers.authorization||'';
  return header.startsWith('Bearer ') ? header.substring(7) : '';
}
function needTeacher(req) {
  return Boolean(process.env.TEACHER_API_KEY) && equal(auth(req),process.env.TEACHER_API_KEY);
}
function makePin(){return String(crypto.randomInt(0,100000000)).padStart(8,'0')}
function validPin(pin){return typeof pin==='string' && /^\d{8}$/.test(pin)}
async function throttle(req) {
  const ip=String(req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const bucket=digest(ip,process.env.PIN_PEPPER);
  const result=await db().query(
    "INSERT INTO passport_login_limits(bucket,attempts,window_start) VALUES($1,1,now()) ON CONFLICT(bucket) DO UPDATE SET attempts=CASE WHEN passport_login_limits.window_start < now()-interval '15 minutes' THEN 1 ELSE passport_login_limits.attempts+1 END, window_start=CASE WHEN passport_login_limits.window_start < now()-interval '15 minutes' THEN now() ELSE passport_login_limits.window_start END RETURNING attempts",
    [bucket]
  );
  return result.rows[0].attempts<=60;
}
export default async function handler(req,res){
  if(req.method!=='POST') return send(res,405,{error:'POST required'});
  if(!process.env.DATABASE_URL || !process.env.PIN_PEPPER || !process.env.SESSION_SECRET || !process.env.TEACHER_API_KEY) return send(res,503,{error:'Cloud records are not configured. No data has been saved.'});
  try{
    const b=typeof req.body==='object' && req.body!==null ? req.body : JSON.parse(String(req.body||'{}'));
    if(b.action==='login'){
      if(!validPin(b.pin)) return send(res,400,{error:'Enter your eight-digit PIN'});
      if(!await throttle(req)) return send(res,429,{error:'Too many sign-in attempts. Please try again later.'});
      const rows=await db().query('SELECT id,class_group,semester,progress,revision FROM passport_students WHERE pin_digest=$1',[digest(b.pin,process.env.PIN_PEPPER)]);
      if(!rows.rowCount) return send(res,401,{error:'PIN not recognized. Ask your teacher to check your PIN.'});
      const st=rows.rows[0];
      return send(res,200,{token:makeToken(st.id),classGroup:st.class_group,semester:st.semester,progress:st.progress,revision:st.revision});
    }
    if(b.action==='load'||b.action==='save'){
      const id=verifyToken(auth(req));
      if(!id) return send(res,401,{error:'Session expired. Enter your PIN again.'});
      if(b.action==='load'){
        const rows=await db().query('SELECT class_group,semester,progress,revision FROM passport_students WHERE id=$1',[id]);
        if(!rows.rowCount) return send(res,401,{error:'PIN record not found'});
        return send(res,200,{classGroup:rows.rows[0].class_group,semester:rows.rows[0].semester,progress:rows.rows[0].progress,revision:rows.rows[0].revision});
      }
      if(!Number.isInteger(b.revision) || b.revision<0) return send(res,400,{error:'Invalid revision'});
      const serialized=progressShape(b.progress);
      const rows=await db().query('UPDATE passport_students SET progress=$1::jsonb,revision=revision+1,updated_at=now() WHERE id=$2 AND revision=$3 RETURNING revision,updated_at',[serialized,id,b.revision]);
      if(!rows.rowCount) return send(res,409,{error:'Progress changed on another device. Sign in again to load the newest version.'});
      return send(res,200,{revision:rows.rows[0].revision,savedAt:rows.rows[0].updated_at});
    }
    if(b.action==='provision'||b.action==='report'||b.action==='reset-pin'||b.action==='create-demo'||b.action==='import-pins'){
      if(!needTeacher(req)) return send(res,403,{error:'Teacher access denied'});
      if(b.action==='report'){
        const rows=await db().query('SELECT id,class_group,semester,is_demo,progress,revision,created_at,updated_at FROM passport_students ORDER BY class_group,created_at');
        return send(res,200,{records:rows.rows});
      }
      if(b.action==='import-pins'){
        // Explicit teacher-only enrollment of PINs assigned in an offline roster.
        // PINs are HMAC-hashed; plaintext is never stored in the database.
        if(!Array.isArray(b.pins)||b.pins.length<1||b.pins.length>100) return send(res,400,{error:'Import 1–100 PINs per batch'});
        const normalized=b.pins.map((x,i)=>{
          if(!x||!['5A','5B'].includes(x.classGroup)||!['S1','S2'].includes(x.semester||'S1')||!validPin(x.pin)||x.pin==='48271936') throw new Error('Invalid class or PIN at row '+(i+1));
          return {classGroup:x.classGroup,semester:x.semester||'S1',pin:x.pin,digest:digest(x.pin,process.env.PIN_PEPPER)};
        });
        if(new Set(normalized.map(x=>x.digest)).size!==normalized.length) return send(res,400,{error:'PINs repeated in the upload'});
        const client=await db().connect();
        try {
          await client.query('BEGIN');
          const enrolled=[];
          for(const record of normalized){
            const result=await client.query(
              'INSERT INTO passport_students(class_group,semester,pin_digest) VALUES($1,$2,$3) ON CONFLICT(pin_digest) DO NOTHING RETURNING id',
              [record.classGroup,record.semester,record.digest]);
            if(!result.rowCount) throw new Error('One or more PINs already registered. The entire import was cancelled; no duplicate records created.');
            enrolled.push({classGroup:record.classGroup,semester:record.semester,studentId:result.rows[0].id,pin:record.pin});
          }
          await client.query('COMMIT');
          return send(res,200,{enrolled});
        }catch(e){await client.query('ROLLBACK');return send(res,409,{error:e.message})}
        finally{client.release()}
      }
      if(b.action==='create-demo'){
        const demoPin='48271936';
        const existed=await db().query('SELECT id,class_group,is_demo FROM passport_students WHERE pin_digest=$1',[digest(demoPin,process.env.PIN_PEPPER)]);
        if(existed.rowCount){
          if(!existed.rows[0].is_demo) return send(res,409,{error:'That PIN is used by a regular student record.'});
          return send(res,200,{studentId:existed.rows[0].id,classGroup:existed.rows[0].class_group,semester:'S1',pin:demoPin,isDemo:true});
        }
        const inserted=await db().query('INSERT INTO passport_students(class_group,semester,pin_digest,is_demo) VALUES($1,'S1',$2,true) RETURNING id,class_group',['5A',digest(demoPin,process.env.PIN_PEPPER)]);
        return send(res,200,{studentId:inserted.rows[0].id,classGroup:inserted.rows[0].class_group,semester:'S1',pin:demoPin,isDemo:true});
      }
      if(b.action==='reset-pin'){
        if(typeof b.studentId!=='string'|| !/^[0-9a-f-]{36}$/i.test(b.studentId)) return send(res,400,{error:'Invalid record ID'});
        for(let i=0;i<8;i++){
          const pin=makePin();
          try{
            const rows=await db().query('UPDATE passport_students SET pin_digest=$1 WHERE id=$2 RETURNING id,class_group',[digest(pin,process.env.PIN_PEPPER),b.studentId]);
            if(!rows.rowCount) return send(res,404,{error:'Record not found'});
            return send(res,200,{studentId:rows.rows[0].id,classGroup:rows.rows[0].class_group,pin});
          }catch(e){if(e.code!=='23505') throw e}
        }
        return send(res,500,{error:'Could not issue unique PIN'});
      }
      if(!['5A','5B'].includes(b.classGroup) || !['S1','S2'].includes(b.semester||'S1') || !Number.isInteger(b.count) || b.count<1 || b.count>40) return send(res,400,{error:'Choose 5A or 5B and 1–40 students'});
      const issued=[];
      for(let n=0;n<b.count;n++){
        let row;
        for(let tries=0;tries<8;tries++){
          const pin=makePin();
          try{
            const result=await db().query('INSERT INTO passport_students(class_group,semester,pin_digest) VALUES($1,$2,$3) RETURNING id',[b.classGroup,b.semester||'S1',digest(pin,process.env.PIN_PEPPER)]);
            row={studentId:result.rows[0].id,classGroup:b.classGroup,semester:b.semester||'S1',pin};
            break;
          }catch(e){if(e.code!=='23505') throw e}
        }
        if(!row) return send(res,500,{error:'Could not issue enough unique PINs',issued});
        issued.push(row);
      }
      return send(res,200,{issued,message:'Download these codes now. They cannot be retrieved from the database.'});
    }
    return send(res,400,{error:'Unknown action'});
  }catch(e){
    console.error('Passport API failure', e.code||e.name||'error');
    return send(res,e.message==='Progress too large'?413:500,{error:e.message==='Progress too large'?e.message:'Cloud record service unavailable. Retry; do not clear this page.'});
  }
}
