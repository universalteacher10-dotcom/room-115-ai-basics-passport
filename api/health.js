import pg from "pg";
export const config={runtime:"nodejs"};
export default async function handler(req,res){
  res.setHeader("Cache-Control","no-store");
  res.setHeader("Content-Type","application/json; charset=utf-8");
  if(req.method!=="GET")return res.status(405).json({ready:false});
  if(!process.env.DATABASE_URL||!process.env.PIN_PEPPER||!process.env.SESSION_SECRET||!process.env.TEACHER_API_KEY)return res.status(503).json({ready:false,reason:"Server configuration incomplete"});
  const client=new pg.Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:8000});
  try{
    await client.connect();
    const result=await client.query("SELECT to_regclass('public.passport_students') IS NOT NULL AS students, to_regclass('public.passport_login_limits') IS NOT NULL AS limits");
    const ready=Boolean(result.rows[0]?.students&&result.rows[0]?.limits);
    return res.status(ready?200:503).json({ready,service:"AI Passport PIN cloud records"});
  }catch(error){
    console.error("Passport health check failed",error.code||error.name);
    return res.status(503).json({ready:false,reason:"Database connection not ready"});
  }finally{try{await client.end()}catch{}}
}
