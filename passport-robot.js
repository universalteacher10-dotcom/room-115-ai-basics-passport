/* Friendly local AI buddy mascot. No external images, network calls, or student data. */
(function(){
"use strict";
const art='<span class="robotSpeech" aria-hidden="true">Hi! ✨</span>'+
'<svg aria-hidden="true" focusable="false" viewBox="0 0 190 205" xmlns="http://www.w3.org/2000/svg">'+
'<defs><linearGradient id="buddyShell" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#dcffff"/><stop offset=".52" stop-color="#a4d8f8"/><stop offset="1" stop-color="#979ce8"/></linearGradient><linearGradient id="buddyScreen" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#163e64"/><stop offset="1" stop-color="#071d3a"/></linearGradient><linearGradient id="buddyBody" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#69e8ea"/><stop offset="1" stop-color="#377ab3"/></linearGradient><radialGradient id="buddyGlow"><stop stop-color="#72ffe6" stop-opacity=".8"/><stop offset="1" stop-color="#72ffe6" stop-opacity="0"/></radialGradient></defs>'+
'<ellipse cx="95" cy="187" rx="56" ry="10" fill="#001426" opacity=".35"/><circle cx="97" cy="96" r="80" fill="url(#buddyGlow)" opacity=".5"/>'+
'<g class="robotFloat"><g class="robotAntenna"><path d="M95 43V26" stroke="#c5f8ff" stroke-width="7" stroke-linecap="round"/><circle cx="95" cy="20" r="10" fill="#ffd46c" stroke="#fff6cd" stroke-width="3"/></g>'+
'<g class="robotSparkle" fill="#fff1a7"><path d="M22 45l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/><circle cx="166" cy="53" r="4"/></g>'+
'<g stroke-linecap="round" stroke-linejoin="round"><path d="M61 141Q37 145 34 128" fill="none" stroke="#8bcbeb" stroke-width="13"/><rect x="22" y="117" width="24" height="23" rx="11" fill="#b4ecff" stroke="#4b90c1" stroke-width="3"/>'+
'<g class="robotWaveArm"><path d="M139 140Q162 137 164 110" fill="none" stroke="#8bcbeb" stroke-width="13"/><rect x="151" y="95" width="24" height="25" rx="11" fill="#b4ecff" stroke="#4b90c1" stroke-width="3" transform="rotate(-16 163 108)"/></g>'+
'<path d="M79 166l-4 15M111 166l4 15" stroke="#789cc8" stroke-width="12"/><ellipse cx="71" cy="185" rx="18" ry="8" fill="#82a5cd" stroke="#b7def7" stroke-width="3"/><ellipse cx="119" cy="185" rx="18" ry="8" fill="#82a5cd" stroke="#b7def7" stroke-width="3"/>'+
'<rect x="54" y="121" width="82" height="49" rx="18" fill="url(#buddyBody)" stroke="#c1ffff" stroke-width="5"/><rect x="78" y="133" width="34" height="25" rx="8" fill="#10436d" stroke="#78eae4" stroke-width="3"/><path class="robotHeart" d="M95 152c-16-10-11-20-4-18 2 0 3 2 4 4 3-7 12-6 12 2 0 6-8 11-12 12Z" fill="#ff95b3"/>'+
'<rect x="32" y="45" width="124" height="87" rx="30" fill="url(#buddyShell)" stroke="#ddffff" stroke-width="5"/><path d="M42 60q10-16 27-15h40" fill="none" stroke="#fff" stroke-width="5" opacity=".7"/><rect x="45" y="59" width="98" height="60" rx="22" fill="url(#buddyScreen)" stroke="#599dc3" stroke-width="3"/>'+
'<g class="robotEye" fill="#8afbf3"><rect x="63" y="78" width="14" height="19" rx="7"/><rect x="111" y="78" width="14" height="19" rx="7"/></g><g fill="#ff9db9" opacity=".84"><ellipse cx="57" cy="104" rx="7" ry="4"/><ellipse cx="131" cy="104" rx="7" ry="4"/></g><path d="M88 105q8 8 16 0" stroke="#a3fff2" stroke-width="4" fill="none"/><rect x="26" y="79" width="12" height="27" rx="6" fill="#56c9e2" stroke="#a2fbff" stroke-width="2"/><rect x="152" y="79" width="12" height="27" rx="6" fill="#56c9e2" stroke="#a2fbff" stroke-width="2"/></g></g></svg>';
window.PassportRobot={
 card:function(kind){return '<div class="passportRobotCard passportRobotCard--'+(kind==="cert"?"cert":"hero")+'" role="img" aria-label="A friendly robot waving hello">'+art+'</div>'; }
};
})();