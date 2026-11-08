/* Cloud progress layer for the original six-module AI Passport.
 * Runs only in preview until explicitly promoted. No names/emails sent to Neon.
 */
(function(){
"use strict";
const overlay=document.getElementById("passportPinOverlay");
const form=document.getElementById("passportPinForm");
const input=document.getElementById("passportPinInput");
const message=document.getElementById("passportPinMessage");
const button=document.getElementById("passportPinButton");
const status=document.getElementById("passportCloudStatus");
const SESSION="room115_passport_cloud_session";
let token="",revision=0,section="",semester="",dirty=false,saving=false,timer=null,block=false;
function notice(text,error=false){if(status){status.textContent=text;status.style.color=error?"#a32922":"#146e63"}}
function gate(text){overlay.hidden=false;document.body.classList.add("passport-cloud-pending");if(text)message.textContent=text;if(input)input.focus()}
function snapshot(progress=state){
  const copy=JSON.parse(JSON.stringify(progress));
  // A student can type a name for their PDF report, but the cloud database is PIN-only.
  delete copy.progressName;
  return copy;
}
function merge(saved){
  const defaults=JSON.parse(JSON.stringify(CLOUD_DEFAULT_STATE));
  const incoming=migratePassportProgress(saved&&typeof saved==="object"&&!Array.isArray(saved)?saved:{});
  const merged={...defaults,...incoming};
  merged.pathDone=Array.from({length:6},(_,i)=>Boolean((Array.isArray(incoming.pathDone)?incoming.pathDone:defaults.pathDone)[i]));
  if(!Array.isArray(merged.sessions))merged.sessions=defaults.sessions;
  if(!Array.isArray(merged.study))merged.study=defaults.study;
  if(!pages.some(p=>p[0]===merged.page))merged.page="home";
  return merged;
}
async function request(action,payload={},authorization=token){
  const headers={"Content-Type":"application/json"};
  if(authorization)headers.Authorization="Bearer "+authorization;
  const response=await fetch("/api/passport",{method:"POST",headers,body:JSON.stringify({action,...payload}),cache:"no-store"});
  let result={};
  try{result=await response.json()}catch{}
  if(!response.ok){
    const err=new Error(result.error||"Cloud service unavailable");
    err.status=response.status;
    throw err;
  }
  return result;
}
function apply(record,auth){
  block=true;clearTimeout(timer);
  token=auth;revision=record.revision;section=record.classGroup;semester=record.semester||"S1";
  state=merge(record.progress);
  try{localStorage.setItem(NAVID,JSON.stringify(state))}catch{}
  draw();updatePrompt();
  dirty=false;saving=false;
  overlay.hidden=true;document.body.classList.remove("passport-cloud-pending");
  input.value="";
  notice("☁ Saved · "+semester+" · "+section);
  block=false;
}
function schedule(){
  if(block||!token)return;
  dirty=true;
  notice("● Saving to cloud…");
  clearTimeout(timer);
  timer=setTimeout(flush,750);
}
async function flush(){
  if(block||!token||saving||!dirty)return;
  dirty=false;saving=true;
  const progress=snapshot();
  try{
    const result=await request("save",{progress,revision});
    revision=result.revision;
    if(!dirty)notice("☁ Saved · "+semester+" · "+section);
  }catch(err){
    dirty=true;
    notice("⚠ Not saved · "+err.message,true);
    if(err.status===401||err.status===409){
      clearTimeout(timer);
      // Preserve the local copy until the PIN session can safely be restored.
      gate("Save was interrupted. Your work is still on this device. Contact your teacher before switching devices.");
      token="";
      return;
    }
  }finally{
    saving=false;
    if(dirty&&token){clearTimeout(timer);timer=setTimeout(flush,6000)}
  }
}
async function login(event){
  event.preventDefault();
  const pin=input.value.trim();
  if(!/^\d{8}$/.test(pin)){message.textContent="Enter exactly eight digits.";return}
  button.disabled=true;message.textContent="Restoring your saved learning…";
  try{
    const record=await request("login",{pin},"");
    try{sessionStorage.setItem(SESSION,record.token)}catch{}
    apply(record,record.token);
  }catch(err){message.textContent=err.message}
  finally{button.disabled=false}
}
async function logout(){
  if(!token)return gate("Enter your student PIN.");
  clearTimeout(timer);
  if(dirty)await flush();
  if(saving||dirty){alert("Some progress has not reached the cloud yet. Check your connection and try again.");return}
  token="";revision=0;
  try{sessionStorage.removeItem(SESSION)}catch{}
  try{localStorage.removeItem(NAVID)}catch{}
  gate("Signed out. Enter your personal PIN to reopen your work.");
  notice("Signed out");
}
async function restoreBackup(progress){
  if(!token)throw new Error("Sign in with your PIN first.");
  if(saving)throw new Error("Finish the current cloud save before restoring.");
  if(dirty){await flush();if(dirty)throw new Error("Could not save current work; restore cancelled.");}
  const staged=merge(progress);
  const result=await request("save",{progress:snapshot(staged),revision});
  revision=result.revision;block=true;
  state=staged;
  try{localStorage.setItem(NAVID,JSON.stringify(state))}catch{}
  draw();updatePrompt();
  notice("☁ Backup restored and saved · "+semester+" · "+section);
  block=false;
}
async function start(){
  let previous="";
  try{previous=sessionStorage.getItem(SESSION)||""}catch{}
  if(!previous)return gate("Your teacher will give you a personal eight-digit PIN.");
  message.textContent="Restoring your latest cloud progress…";
  try{
    const record=await request("load",{},previous);
    apply(record,previous);
  }catch(err){
    try{sessionStorage.removeItem(SESSION)}catch{}
    gate("Please enter your PIN to continue. "+(err.status===503?"The cloud service is not configured yet.":""));
  }
}
form.addEventListener("submit",login);
window.PassportCloud={schedule,logout,restoreBackup,isActive:()=>Boolean(token),saveNow:flush};
window.addEventListener("beforeunload",event=>{if(token&&(dirty||saving)){event.preventDefault();event.returnValue="";}});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&dirty)flush()});
start();
})();
