(function(){
"use strict";
const KEY="room115_ai_basics_v2";
const panel=document.createElement("section");
panel.style.cssText="margin:18px 0;padding:20px;border:2px solid #22b6c4;border-radius:18px;background:#e8f9fa;color:#12354c";
panel.innerHTML='<h2>🛡️ My AI Passport · Save & Restore</h2><p id="backup-stats"></p><div style="display:flex;gap:9px;flex-wrap:wrap"><button id="backup-download">💾 Download Progress</button><button id="backup-copy">🔑 Copy Recovery Code</button><button id="backup-doc">📄 Open Recovery Doc</button><button id="backup-file-button">📂 Upload Progress</button><button id="backup-code-button">🔓 Enter Recovery Code</button></div><input id="backup-file" type="file" accept=".json" hidden><textarea id="backup-code" placeholder="Paste recovery code" aria-label="Recovery code" style="display:none;width:100%;min-height:90px;margin-top:12px"></textarea><button id="backup-apply" style="display:none">Restore Code</button><p id="backup-message" role="status" aria-live="polite"></p><small>Local browser storage can be cleared. Back up after major steps. A backup is not proof of teacher approval.</small>';
const host=document.getElementById("content");if(host)host.before(panel);else document.body.prepend(panel);
const get=id=>document.getElementById(id),say=t=>get("backup-message").textContent=t;
const snapshot=()=>({format:"ai-passport-v1",savedAt:new Date().toISOString(),progress:JSON.parse(localStorage.getItem(KEY)||"{}")});
const valid=o=>o&&o.format==="ai-passport-v1"&&o.progress&&typeof o.progress==="object"&&!Array.isArray(o.progress)&&JSON.stringify(o).length<100000;
function code(o){const bytes=new TextEncoder().encode(JSON.stringify(o));let raw="";bytes.forEach(b=>raw+=String.fromCharCode(b));return "AIP1-"+btoa(raw).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
function parseCode(s){if(!s.startsWith("AIP1-"))throw Error("Incorrect recovery code");const raw=atob(s.slice(5).replace(/-/g,"+").replace(/_/g,"/"));return JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(Uint8Array.from(raw,c=>c.charCodeAt(0))))}
function restore(o){if(!valid(o))throw Error("Invalid backup");const n=(o.progress.pathDone||[]).filter(Boolean).length;if(!confirm("Restore backup dated "+new Date(o.savedAt).toLocaleString()+" with "+n+" completed path steps? This replaces current device progress."))return;localStorage.setItem(KEY,JSON.stringify(o.progress));location.reload()}
get("backup-download").onclick=()=>{try{const url=URL.createObjectURL(new Blob([JSON.stringify(snapshot(),null,2)],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download="AI-Passport-"+new Date().toISOString().slice(0,10)+".json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);say("Progress downloaded. Save the file to Drive.")}catch(e){say(e.message)}};
get("backup-copy").onclick=async()=>{const c=code(snapshot());try{await navigator.clipboard.writeText(c);say("Recovery code copied. Paste it into your dated Google Doc.")}catch(e){get("backup-code").style.display="block";get("backup-code").value=c;get("backup-code").select();say("Copy this selected code into your Google Doc.")}};
get("backup-doc").onclick=()=>{window.open("https://docs.google.com/document/d/18Ych8QKPQNaYZWK9hS0WZJFzifiCPoqJhBf1v6g2Bks/copy","_blank","noopener");say("Create a private document named AI Passport Recovery Log. Paste the code with today's date and badge progress.")};
get("backup-file-button").onclick=()=>get("backup-file").click();
get("backup-file").onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>100000)throw Error("File too large");restore(JSON.parse(await f.text()))}catch(err){say(err.message)}finally{e.target.value=""}};
get("backup-code-button").onclick=()=>{get("backup-code").style.display="block";get("backup-apply").style.display="inline-block";get("backup-code").focus()};
get("backup-apply").onclick=()=>{try{restore(parseCode(get("backup-code").value.trim()))}catch(err){say(err.message)}};
function update(){let p={};try{p=JSON.parse(localStorage.getItem(KEY)||"{}")}catch{}const done=(p.pathDone||[]).filter(Boolean).length;get("backup-stats").textContent="📊 Learning Path: "+done+" / 5 completed · "+Math.round(done/5*100)+"% · Progress saved on this device";}
update();setInterval(update,2500);
})();