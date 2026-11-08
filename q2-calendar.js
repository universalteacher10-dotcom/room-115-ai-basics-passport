/* Semester A / Quarter 2: public deadlines only. No student identifiers or PINs.
   This page shares the published Class 5 milestone schedule and never modifies saved progress. */
(function(){
"use strict";
const classroom="https://classroom.google.com/w/ODc1MTc5NTAzNjU1/tc/ODg4OTE4MjAxOTk4";
const events=[
 {iso:"2026-11-09",short:"Nov 9",title:"Studio Self-Defense video",detail:"Complete the Portrait of a Learner video assignment and submit it in Google Classroom.",kind:"assessment",cal:"Defense"},
 {iso:"2026-11-20",short:"Nov 20",title:"Orientation + Module 1",detail:"Complete AI Basics Badge Step 1. Begin your ongoing Learning Log.",kind:"checkpoint",cal:"M1"},
 {iso:"2026-12-04",short:"Dec 4",title:"Modules 1–2 complete",detail:"Finish the foundations and prompting activities. Update the Learning Log.",kind:"checkpoint",cal:"M1–2"},
 {iso:"2026-12-11",short:"Dec 11",title:"Module 3 + first study tool",detail:"Practice source verification and create your first original study tool.",kind:"checkpoint",cal:"M3"},
 {iso:"2026-12-18",short:"Dec 18",title:"Module 4 + second study tool",detail:"Finish learning-partner activities and make a second DIFFERENT study format.",kind:"checkpoint",cal:"M4"},
 {iso:"2027-01-08",short:"Jan 8",title:"Module 5 · AI Risks & Safety",detail:"Complete the safety/data-center Edpuzzles and an original risk reflection.",kind:"checkpoint",cal:"Safety"},
 {iso:"2027-01-13",short:"Jan 13",title:"All six modules + 14 topic badges",detail:"Complete Module 6, review and unlock all 14 learning-topic badges.",kind:"major",cal:"14 badges"},
 {iso:"2027-01-15",short:"Jan 15",title:"Three study tools + test request",detail:"Submit progress evidence, three different original study formats and Classroom Step 4 registration request.",kind:"major",cal:"Evidence"},
 {iso:"2027-01-19",end:"2027-01-20",short:"Jan 19–20",title:"Official AI Basics certification test",detail:"Take the separate teacher-issued Step 5 test and review feedback.",kind:"assessment",cal:"Test"},
 {iso:"2027-01-21",short:"Jan 21",title:"Corrections + final reflection",detail:"Complete permitted test corrections and Classroom Step 6 final reflection.",kind:"checkpoint",cal:"Reflect"},
 {iso:"2027-01-22",short:"Jan 22",title:"FINAL student submission deadline",detail:"All regular AI Basics evidence and Step 7 badge-receipt request submitted. Do not wait until Quarter 2's last day.",kind:"final",cal:"FINAL"},
 {iso:"2027-01-25",end:"2027-01-29",short:"Jan 25–29",title:"Teacher review cushion",detail:"Teacher verification, approved makeup work, retakes, and evidence corrections only.",kind:"buffer",cal:"Review"}
];
const htmlEscape=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function dateNum(str){const [y,m,d]=str.split("-").map(Number);return Date.UTC(y,m-1,d)}
function todayUtc(){const now=new Date();return Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())}
function upcoming(){
 const t=todayUtc();
 return events.find(e=>dateNum(e.end||e.iso)>=t)||null;
}
function month(year,monthNum){
 const first=new Date(Date.UTC(year,monthNum,1)),start=(first.getUTCDay()+6)%7,days=new Date(Date.UTC(year,monthNum+1,0)).getUTCDate();
 const label=first.toLocaleString("en-US",{month:"long",year:"numeric",timeZone:"UTC"});
 let cells=["M","T","W","T","F","S","S"].map(s=>'<span class="q2-weekday">'+s+'</span>').join("");
 for(let i=0;i<start;i++)cells+='<span aria-hidden="true" class="q2-day is-empty"></span>';
 for(let day=1;day<=days;day++){
  const iso=year+"-"+String(monthNum+1).padStart(2,"0")+"-"+String(day).padStart(2,"0");
  const event=events.find(e=>e.iso<=iso&&(e.end||e.iso)>=iso),primary=event?.kind||"";
  const current=dateNum(iso)===todayUtc();
  cells+='<div class="q2-day'+(event?' is-'+primary:'')+(current?' is-today':'')+'"'+(event?' title="'+htmlEscape(event.title)+'"':'')+'><span class="q2-daynum">'+day+'</span>'+(event?'<small>'+htmlEscape(event.cal)+'</small>':'')+'</div>';
 }
 return '<section class="q2-month"><h3>'+label+'</h3><div class="q2-monthgrid">'+cells+'</div></section>';
}
function render(){
 const next=upcoming(),now=todayUtc();
 const days=next?Math.max(0,Math.ceil((dateNum(next.iso)-now)/86400000)):0;
 const nextMessage=!next?"Quarter 2 dates have concluded":days===0?"Today · "+next.title:days===1?"Tomorrow · "+next.title:next.short+" · "+next.title;
 return '<div class="q2-calendar-page"><div class="q2-calendar-hero"><div class="q2-hero-copy">'+
 '<div class="q2-eyebrow">AI STUDY STUDIO · SEMESTER A · QUARTER 2</div>'+
 '<h1>📅 Q2 Deadline Calendar</h1><p>Stay ahead of the AI Basics Badge requirements. Your Passport shows learning progress; official work is submitted in Google Classroom.</p>'+
 '<div class="q2-actionrow"><a href="'+classroom+'" target="_blank" rel="noopener noreferrer">Open Badge Classroom Topic ↗</a><button type="button" onclick="setPage(\'progress\')">View My Progress Report</button></div></div>'+
 '<aside class="q2-duebox"><span>ALL STUDENT WORK DUE</span><strong>JAN 22</strong><small>Friday · 2027</small><em>Jan 25–29 = teacher review buffer</em></aside></div>'+
 '<div class="q2-nextmilestone" aria-live="polite"><span>⏳ NEXT CHECKPOINT</span><strong>'+htmlEscape(nextMessage)+'</strong>'+
 (next?'<p>'+htmlEscape(next.detail)+'</p>':'')+'</div>'+
 '<h2 class="q2-sectiontitle">Three-month deadline calendar</h2><div class="q2-months">'+month(2026,10)+month(2026,11)+month(2027,0)+'</div>'+
 '<div class="q2-legend"><span><b class="is-checkpoint"></b>Module checkpoint</span><span><b class="is-major"></b>Major evidence</span><span><b class="is-assessment"></b>Assessment</span><span><b class="is-final"></b>Jan 22 final</span><span><b class="is-buffer"></b>Teacher review</span></div>'+
 '<h2 class="q2-sectiontitle">Milestones &amp; what to submit</h2><ol class="q2-checkpoints">'+events.map(e=>'<li class="q2-checkpoint is-'+e.kind+'"><time>'+htmlEscape(e.short)+'</time><div><h3>'+htmlEscape(e.title)+'</h3><p>'+htmlEscape(e.detail)+'</p></div></li>').join("")+'</ol>'+
 '<div class="q2-note"><strong>Important:</strong> January 22 is the normal student deadline; January 25–29 is a teacher review cushion, not an automatic extension. These milestones guide pacing. Check your Google Classroom assignments for official submission instructions.</div>'+
 '</div>';
}
window.Q2Calendar={render,events:events.map(x=>({iso:x.iso,title:x.title,kind:x.kind}))};
})();
