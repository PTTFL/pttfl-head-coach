(() => {
'use strict';
/* PTTFL Head Coach. index.html plays the CPU; multiplayer.html (HC_MODE = 'mp') plays a friend online. */
const MP = window.HC_MODE === 'mp';
const SHELL = `
<div class="mx-ov" id="ov" aria-hidden="true"></div>

<!-- title -->
<section class="scr" id="title" aria-label="Title screen">
  <div class="tlogo"><div id="tl-logo"></div><div class="hc">HEAD COACH</div><div class="yr">PTTFL · 2026 SEASON EDITION</div></div>
  <button class="press" id="press">PRESS START</button>
  <a class="press2" id="press2" href="multiplayer.html">HEAD-TO-HEAD ONLINE ▸</a>
  <div class="tsub">Call the play, then play it: throw, run and tackle in the PTTFL stadium. Rosters are your league's current 2026 rosters.</div>
  <div class="career" id="career"></div>
</section>

<!-- setup -->
<section class="scr" id="setup" hidden aria-label="Choose teams">
  <div class="box">
    <div class="sec"><h2 id="setup-h">Choose Your Franchise</h2></div>
    <div class="steps" id="steps"></div>
    <div class="setup">
      <div class="panel"><div class="bar"><b>FRANCHISES</b> // 2026 PTTFL <span class="r">OVR</span></div><div class="tlist" id="tlist"></div></div>
      <div class="panel scout" id="scout"></div>
    </div>
  </div>
</section>

<!-- pregame -->
<section class="scr" id="pre" hidden aria-label="Game plan">
  <div class="box">
    <div class="sec"><h2>Game Plan</h2></div>
    <div class="panel"><div class="bar"><b>TALE OF THE TAPE</b> // <span id="pre-sub"></span></div><div id="tape"></div></div>
    <div class="opts" id="opts"></div>
  </div>
</section>

<!-- gameday HUD -->
<div id="hud" hidden>
  <div class="bug" id="bug"></div>
  <div class="hudrow"><div class="mom">MOMENTUM <i><b id="momb"></b></i></div><div class="wind" id="wind" aria-label="Wind"><span>WIND</span><i></i><b>0</b><small>MPH</small><em></em></div><button class="pb pill camb" id="camb"><i class="ps s">□</i><span class="lbl" id="camlbl">Broadcast</span></button></div>
  <div class="tick" id="tick"></div>
  <div class="mpstat" id="mpstat" hidden></div>
</div>
<div id="coin" hidden role="dialog" aria-label="Coin toss"><div class="ct-panel panel"><div class="bar"><b class="ct-h">Coin Toss</b></div>
  <div class="ct-stage"><div class="toss"><div class="coin"><div class="cface h"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" fill="none" stroke="#8A6400" stroke-width="1.2" stroke-dasharray="1.5 3.2"/><g class="eng"><path d="M15 58C13 34 31 18 53 18c18 0 31 11 33 27l-7 4c-5 1-8 4-8 8l-1 9c-7 5-17 6-29 5-14-1-24-5-26-13z" fill="#8A6400"/><path d="M22 54c0-18 13-29 31-30 13 0 24 6 28 18" fill="none" stroke="#5C3D00" stroke-width="5"/><path d="M27 47c3-11 12-17 23-18" fill="none" stroke="#FFF2A0" stroke-width="2" stroke-linecap="round" opacity=".55"/><circle cx="46" cy="52" r="4" fill="#5C3D00"/><path d="M34 65c7 3 15 3 22 1" fill="none" stroke="#5C3D00" stroke-width="2.4" stroke-linecap="round"/><g fill="none" stroke="#5C3D00" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M72 51h20c3 5 3 11-1 16H73"/><path d="M71 59h23"/><path d="M84 51v16"/></g></g></svg><small>HEADS</small></div><div class="cface t"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" fill="none" stroke="#8A6400" stroke-width="1.2" stroke-dasharray="1.5 3.2"/><g class="eng" transform="rotate(-32 50 50)"><ellipse cx="50" cy="50" rx="33" ry="19" fill="#8A6400"/><path d="M24 42c4-6 10-9 15-10M76 58c-4 6-10 9-15 10" fill="none" stroke="#5C3D00" stroke-width="3" stroke-linecap="round"/><path d="M36 50h28" stroke="#FFF2A0" stroke-width="2.6" stroke-linecap="round"/><path d="M41 45v10M47 45v10M53 45v10M59 45v10" stroke="#FFF2A0" stroke-width="2.2" stroke-linecap="round"/><path d="M30 39c6-5 14-7 22-7" fill="none" stroke="#FFF2A0" stroke-width="1.8" stroke-linecap="round" opacity=".5"/></g><g fill="#8A6400"><path d="M20 26l1.6 3.4 3.6.4-2.7 2.4.8 3.6-3.3-1.9-3.3 1.9.8-3.6-2.7-2.4 3.6-.4z"/><path d="M80 64l1.6 3.4 3.6.4-2.7 2.4.8 3.6-3.3-1.9-3.3 1.9.8-3.6-2.7-2.4 3.6-.4z"/></g></svg><small>TAILS</small></div></div></div><div class="ct-shadow"></div></div>
  <div class="ct-res" aria-live="polite"></div><div class="ct-sub"></div><div class="ct-btns"></div></div></div>
<button id="autobar" hidden><span class="dot"></span><b>OC AUTO</b><span class="x">Click to cancel</span></button>
<div id="banner"><span class="bn-t"></span><span class="bn-s"></span><span class="bn-c"></span></div>
<div id="toast"></div>
<div id="tablet" class="panel off"></div>

<!-- halftime / final / pause -->
<section class="scr" id="half" hidden aria-label="Halftime"><div class="box" style="max-width:760px"><div class="sec"><h2 id="half-h">Halftime</h2></div><div class="panel sheet" id="half-b"></div></div></section>
<section class="scr" id="final" hidden aria-label="Final"><div class="box" style="max-width:860px"><div class="sec"><h2>Final</h2></div><div class="panel sheet" id="final-b"></div></div></section>
<section class="scr" id="pause" hidden aria-label="Paused"><div class="box" style="max-width:420px"><div class="sec"><h2>Paused</h2></div><div class="panel"><div class="bar"><b>START</b> // MENU</div><div class="menu" id="menu"></div></div></div></section>

<!-- head-to-head: lobby and room -->
<section class="scr" id="lobby" hidden aria-label="Head-to-Head lobby">
  <div class="box">
    <div class="sec"><h2>Head-to-Head</h2></div>
    <div id="lb-resume"></div>
    <div class="panel lb-me"><div class="bar"><b>COACH</b> // YOUR NAME <span class="r" id="lb-net">CONNECTING…</span></div>
      <div class="lb-row"><input id="lb-name" maxlength="18" autocomplete="off" placeholder="Your name"><button class="chip" id="lb-work"></button><a class="chip" href="index.html">Play vs CPU</a></div></div>
    <div class="panel"><div class="bar"><b>ROOMS</b> // HOST A GAME OR JOIN ONE <span class="r"><button class="lb-ref" id="lb-refresh">↻ REFRESH</button></span></div>
      <div class="rooms" id="rooms"></div></div>
    <p class="lb-note" id="lb-note"></p>
  </div>
</section>
<section class="scr" id="room" hidden aria-label="Game room">
  <div class="box">
    <div class="sec"><h2 id="rm-h">Room</h2></div>
    <div class="panel"><div class="bar"><b>INVITE</b> // SEND THIS LINK <span class="r" id="rm-status"></span></div>
      <div class="rm-inv"><input id="rm-link" readonly aria-label="Invite link"><button class="spb" id="rm-copy">Copy Link</button></div></div>
    <div class="rm-vs"><div class="panel rm-side u" id="rm-u"></div><div class="vs">VS</div><div class="panel rm-side t" id="rm-t"></div></div>
    <div class="rm-pick">
      <div class="panel"><div class="bar"><b>YOUR FRANCHISE</b> // PICK A TEAM <span class="r">OVR</span></div><div class="tlist rm-list" id="rm-list"></div></div>
      <div class="rm-opts" id="rm-opts"></div>
    </div>
  </div>
</section>
<div id="netov" hidden role="alertdialog" aria-live="assertive"><div class="panel ct-panel"><div class="bar"><b id="no-h">Connection</b></div><div class="no-msg" id="no-msg"></div><div class="ct-btns" id="no-btns"></div></div></div>

<nav class="padbar" aria-label="Controller"><div class="in" id="pad"></div></nav>
`;
document.body.insertAdjacentHTML('afterbegin', SHELL);
const D = window.HC_DATA;
let LOGO_VB = '0 8 300 74';
const WORK_NAMES = {
    "Aaron's Ayahuasca Hut":"Aaron's Tea Hut", "Auchwitz Flames":"Auburn Flames", "Baltimore VasDeferens":"Baltimore Crabcakes",
    "Ceedees nuts":"CeeDee's Crew", "Cleveland PerineumFalcons":"Cleveland Falcons", "Drums' Dump":"Drums' Den",
    "EDP445's Daycare":"Elite Daycare", "Florida Methheads":"Florida Gladiators", "Green Bay Guidos":"Green Bay Gondoliers",
    "Hernandez's Jerkoffs":"Hernandez's Jerseys", "Jeff Epstein Island":"Jeff's Island",
    "Michael Vick's Dog Pound":"Michael Vick's Scramblers", "Pat Tillman's Gun Safety Tips":"Pat Tillman's Honor Guard",
    "Pools Closed Due to Aids":"Pools Closed for Repairs", "poolsclosedduetoaids":"poolsclosedforrepairs", "Prison Grape shame":"Grape Shame",
    "Ray Lewis' White Suit":"Ray Lewis' Linebackers", "Tampa Bay Exotic Dancers":"Tampa Bay Two-Steppers", "Team Dipshid":"Team Dipset",
    "Washington Alcoholics":"Washington Ales", "Watson Hands on Spa":"Watson's Day Spa", "Welfare White Knights":"Wisconsin Knights", "Wisconsin White Knights":"Wisconsin Knights", "Chicago Ignants":"Chicago Fan",
    "Henry Ruggs Car Dealership":"Henry's Car Dealership", "Henry Ruggs III car dealership":"Henry's car dealership",
    "Pass To Mouth":"Pass To Win", "Rock hard rock":"Rock Solid Rock"
  };
const LOGO = () => `<svg viewBox="${LOGO_VB}" aria-hidden="true"><g id="lw"><g transform="translate(14 0) skewX(-8)" style="font-feature-settings:'kern' 0,'liga' 0,'calt' 0,'clig' 0;font-kerning:none"><text x="10" y="74" text-anchor="start" font-family="Bowlby One" font-size="72" fill="none" stroke="#0E0B1A" stroke-width="6" stroke-linejoin="round"><tspan visibility="hidden">P</tspan><tspan visibility="hidden">T</tspan><tspan visibility="hidden">T</tspan><tspan visibility="hidden">F</tspan><tspan>L</tspan></text><text x="10" y="74" text-anchor="start" font-family="Bowlby One" font-size="72" fill="#FF2E88"><tspan visibility="hidden">P</tspan><tspan visibility="hidden">T</tspan><tspan visibility="hidden">T</tspan><tspan visibility="hidden">F</tspan><tspan>L</tspan></text><text x="10" y="74" text-anchor="start" font-family="Bowlby One" font-size="72" fill="none" stroke="#0E0B1A" stroke-width="6" stroke-linejoin="round"><tspan visibility="hidden">P</tspan><tspan visibility="hidden">T</tspan><tspan visibility="hidden">T</tspan><tspan>F</tspan><tspan visibility="hidden">L</tspan></text><text x="10" y="74" text-anchor="start" font-family="Bowlby One" font-size="72" fill="#FF2E88"><tspan visibility="hidden">P</tspan><tspan visibility="hidden">T</tspan><tspan visibility="hidden">T</tspan><tspan>F</tspan><tspan visibility="hidden">L</tspan></text><text x="10" y="74" text-anchor="start" font-family="Bowlby One" font-size="72" fill="none" stroke="#0E0B1A" stroke-width="6" stroke-linejoin="round"><tspan visibility="hidden">P</tspan><tspan visibility="hidden">T</tspan><tspan>T</tspan><tspan visibility="hidden">F</tspan><tspan visibility="hidden">L</tspan></text><text x="10" y="74" text-anchor="start" font-family="Bowlby One" font-size="72" fill="#FF2E88"><tspan visibility="hidden">P</tspan><tspan visibility="hidden">T</tspan><tspan>T</tspan><tspan visibility="hidden">F</tspan><tspan visibility="hidden">L</tspan></text><text x="10" y="74" text-anchor="start" font-family="Bowlby One" font-size="72" fill="none" stroke="#0E0B1A" stroke-width="6" stroke-linejoin="round"><tspan visibility="hidden">P</tspan><tspan>T</tspan><tspan visibility="hidden">T</tspan><tspan visibility="hidden">F</tspan><tspan visibility="hidden">L</tspan></text><text x="10" y="74" text-anchor="start" font-family="Bowlby One" font-size="72" fill="#FF2E88"><tspan visibility="hidden">P</tspan><tspan>T</tspan><tspan visibility="hidden">T</tspan><tspan visibility="hidden">F</tspan><tspan visibility="hidden">L</tspan></text><text x="10" y="74" text-anchor="start" font-family="Bowlby One" font-size="72" fill="none" stroke="#0E0B1A" stroke-width="6" stroke-linejoin="round"><tspan>P</tspan><tspan visibility="hidden">T</tspan><tspan visibility="hidden">T</tspan><tspan visibility="hidden">F</tspan><tspan visibility="hidden">L</tspan></text><text x="10" y="74" text-anchor="start" font-family="Bowlby One" font-size="72" fill="#FF2E88"><tspan>P</tspan><tspan visibility="hidden">T</tspan><tspan visibility="hidden">T</tspan><tspan visibility="hidden">F</tspan><tspan visibility="hidden">L</tspan></text><text x="6" y="70" text-anchor="start" font-family="Bowlby One" font-size="72" fill="none" stroke="#0E0B1A" stroke-width="6" stroke-linejoin="round"><tspan visibility="hidden">P</tspan><tspan visibility="hidden">T</tspan><tspan visibility="hidden">T</tspan><tspan visibility="hidden">F</tspan><tspan>L</tspan></text><text x="6" y="70" text-anchor="start" font-family="Bowlby One" font-size="72" fill="#FFE600"><tspan visibility="hidden">P</tspan><tspan visibility="hidden">T</tspan><tspan visibility="hidden">T</tspan><tspan visibility="hidden">F</tspan><tspan>L</tspan></text><text x="6" y="70" text-anchor="start" font-family="Bowlby One" font-size="72" fill="none" stroke="#0E0B1A" stroke-width="6" stroke-linejoin="round"><tspan visibility="hidden">P</tspan><tspan visibility="hidden">T</tspan><tspan visibility="hidden">T</tspan><tspan>F</tspan><tspan visibility="hidden">L</tspan></text><text x="6" y="70" text-anchor="start" font-family="Bowlby One" font-size="72" fill="#FFE600"><tspan visibility="hidden">P</tspan><tspan visibility="hidden">T</tspan><tspan visibility="hidden">T</tspan><tspan>F</tspan><tspan visibility="hidden">L</tspan></text><text x="6" y="70" text-anchor="start" font-family="Bowlby One" font-size="72" fill="none" stroke="#0E0B1A" stroke-width="6" stroke-linejoin="round"><tspan visibility="hidden">P</tspan><tspan visibility="hidden">T</tspan><tspan>T</tspan><tspan visibility="hidden">F</tspan><tspan visibility="hidden">L</tspan></text><text x="6" y="70" text-anchor="start" font-family="Bowlby One" font-size="72" fill="#FFE600"><tspan visibility="hidden">P</tspan><tspan visibility="hidden">T</tspan><tspan>T</tspan><tspan visibility="hidden">F</tspan><tspan visibility="hidden">L</tspan></text><text x="6" y="70" text-anchor="start" font-family="Bowlby One" font-size="72" fill="none" stroke="#0E0B1A" stroke-width="6" stroke-linejoin="round"><tspan visibility="hidden">P</tspan><tspan>T</tspan><tspan visibility="hidden">T</tspan><tspan visibility="hidden">F</tspan><tspan visibility="hidden">L</tspan></text><text x="6" y="70" text-anchor="start" font-family="Bowlby One" font-size="72" fill="#FFE600"><tspan visibility="hidden">P</tspan><tspan>T</tspan><tspan visibility="hidden">T</tspan><tspan visibility="hidden">F</tspan><tspan visibility="hidden">L</tspan></text><text x="6" y="70" text-anchor="start" font-family="Bowlby One" font-size="72" fill="none" stroke="#0E0B1A" stroke-width="6" stroke-linejoin="round"><tspan>P</tspan><tspan visibility="hidden">T</tspan><tspan visibility="hidden">T</tspan><tspan visibility="hidden">F</tspan><tspan visibility="hidden">L</tspan></text><text x="6" y="70" text-anchor="start" font-family="Bowlby One" font-size="72" fill="#FFE600"><tspan>P</tspan><tspan visibility="hidden">T</tspan><tspan visibility="hidden">T</tspan><tspan visibility="hidden">F</tspan><tspan visibility="hidden">L</tspan></text></g></g></svg>`;

/* ---------------- utilities ---------------- */
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
/* every random number in a game goes through RNG: Math.random against the CPU; in head-to-head both screens share
   a seed for each snap, so the same calls play out the same way on both computers */
let RNG = Math.random;
const seeded = s => { let a = s >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const rnd = () => RNG(), ri =(a, b) => a + Math.floor(rnd() * (b - a + 1)), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k;
const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const erf = x => { const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + .3275911 * x); return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - .284496736) * t + .254829592) * t * Math.exp(-x * x)); };
const Phi = x => .5 * (1 + erf(x / Math.SQRT2));
const pickW = w => { let s = 0; for (const k in w) s += Math.max(0, w[k]); let r = rnd() * s; for (const k in w){ r -= Math.max(0, w[k]); if (r <= 0) return k; } return Object.keys(w)[0]; };
const norm = w => { let s = 0; for (const k in w) s += Math.max(0, w[k]); const o = {}; for (const k in w) o[k] = s ? Math.max(0, w[k]) / s : 0; return o; };
const store = { get(k, d){ try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch(e){ return d; } }, set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} } };
const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){ return false; } };
let SPEED = store.get('hc-speed', 1);
const FF = 5, spd = () => SPEED * (G && G.auto ? FF : 1);
let EPOCH = 0, PAUSED = false, PQ = [];
// a throw key pressed during your pass play (see throwPlay)
const THROW = { on:false, req:null, ids:[], ver:0 };
// waits die quietly when a game is abandoned, and hold while the menu is open
const wait = ms => { const e = EPOCH; return new Promise(r => setTimeout(function go(){ if (e !== EPOCH) return; if (PAUSED){ PQ.push(go); return; } r(); }, ms / spd())); };
const ord = n => ['', '1ST', '2ND', '3RD', '4TH', 'OT'][n] || n + 'TH';
const mmss = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

let WORK = false; try { WORK = localStorage.getItem('pttfl-work') === '1'; } catch(e){}
const abbrev = n => { const w = String(n).replace(/[^A-Za-z0-9' ]/g, ' ').replace(/'s\b/g, '').split(/\s+/).filter(Boolean);
  if (w.length === 1){ const caps = w[0].match(/[A-Z0-9]/g) || []; return caps.length > 1 ? caps.join('').slice(0, 5) : w[0].slice(0, 4).toUpperCase(); }
  return w.map(x => x[0]).join('').toUpperCase().slice(0, 5); };
const TEAMS = D.teams;
const byId = id => TEAMS.find(t => t.id === id);
const TN = t => (WORK && WORK_NAMES[t.n]) || t.n;
const AB = t => abbrev(TN(t));
const last = n => String(n || '').split(' ').filter(x => !/^(Jr\.?|Sr\.?|II|III|IV)$/.test(x)).slice(-1)[0] || n;

/* ---------------- the stadium ---------------- */
const cube = (cls, x, y, w, d, h) => `<div class="cb ${cls}" style="left:${x}px;top:${y}px;width:${w}px;height:${d}px">`
  + `<i class="bk" style="left:0;top:${-h}px;width:${w}px;height:${h}px;transform-origin:50% 100%;transform:rotateX(-90deg)"></i>`
  + `<i class="lf" style="left:${-h}px;top:0;width:${h}px;height:${d}px;transform-origin:100% 50%;transform:rotateY(90deg)"></i>`
  + `<i class="rt" style="left:${w}px;top:0;width:${h}px;height:${d}px;transform-origin:0 50%;transform:rotateY(-90deg)"></i>`
  + `<i class="tp" style="left:0;top:0;width:${w}px;height:${d}px;transform:translateZ(${h}px)"></i>`
  + `<i class="fr" style="left:0;top:${d - h}px;width:${w}px;height:${h}px;transform-origin:50% 100%;transform:rotateX(-90deg)"></i></div>`;
const coachSvg = (c, v) => {
  const r = (x, y, w, h, f) => `<rect x='${x}' y='${y}' width='${w}' height='${h}' fill='${f}'/>`;
  const s = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 24' shape-rendering='crispEdges'>`
    + r(3,0,8,7,'#FFFFFF') + r(1,6,12,8,'#FFFFFF') + r(2,13,10,6,'#FFFFFF') + r(3,16,4,8,'#FFFFFF') + r(7,16,4,8,'#FFFFFF') + r(10,8,4,6,'#FFFFFF')
    + r(4,1,6,2,v) + r(4,3,6,3,'#C98E66') + r(3,2,1,4,'#15111F') + r(4,5,4,1,'#15111F')
    + r(2,7,10,6,c) + r(2,8,1,5,c) + r(10,9,3,4,'#F4F0FF') + r(11,10,1,2,'#8C84B8')
    + r(4,13,6,5,'#C9B58A') + r(4,18,2,5,'#C9B58A') + r(8,18,2,5,'#C9B58A') + r(4,22,2,2,'#15111F') + r(8,22,2,2,'#15111F') + `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
};
const ov = $('#ov');
let rig, EL = { u:[], t:[], ball:null, cu:null, ct:null, los:null, fst:null, tgt:null };
function buildStadium(){
  const ez = LOGO().replace(' id="lw"', '');
  const nums = [10,20,30,40,50,40,30,20,10].map((n, i) => `<span class="mx-num t" style="left:${200 + i * 100}px">${n}</span><span class="mx-num b" style="left:${200 + i * 100}px">${n}</span>`).join('');
  const sp = (cls, n) => Array.from({ length:n }, () => `<div class="gp ${cls}"><i></i></div>`).join('');
  ov.innerHTML = `<div class="mx-cam"><div class="mx-rig">
    <div class="mx-std"></div>
    <div class="mx-sec n"><div class="mx-pbase">${cube('pbox', 450, -56, 380, 56, 70)}</div></div><div class="mx-sec w"></div><div class="mx-sec e"></div>
    <div class="mx-team"><span class="mx-bench a"></span><span class="mx-bench b"></span></div>
    <div class="mx-team far"><span class="mx-bench a"></span><span class="mx-bench b"></span></div>
    ${cube('tent', -430, 292, 120, 64, 62)}
    <i class="mx-gp l"></i><i class="mx-gp r"></i>${[[600, -28], [600, 28], [-600, -28], [-600, 28]].map(([x, y]) => `<div class="wflag" style="left:${x}px;top:${y}px"><b><i></i><span></span></b></div>`).join('')}
    ${cube('jpole', -712, -150, 14, 14, 158)}${cube('jpole', -712, 136, 14, 14, 158)}
    <div class="mx-jb" style="left:-905px;top:-210px;width:215px;height:420px"><div class="mx-jbi" id="jb"></div></div>
    <div class="mx-fld"><span class="mx-ez l"><span class="mx-ezl">${ez}</span></span><span class="mx-ez r"><span class="mx-ezl">${ez}</span></span>${nums}<span class="mx-mid">PTTFL</span><i class="gl los"></i><i class="gl fst"></i><svg class="rt-svg" viewBox="0 0 1194 527" preserveAspectRatio="none" aria-hidden="true"></svg><span class="mx-to">TIMEOUT</span></div>
  </div></div>
  <div class="mx-cam play"><div class="mx-rig">
    <div class="mx-game">${sp('u', 11)}${sp('t', 11)}<div class="gp co u"><i></i></div><div class="gp co t"><i></i></div><div class="gp ball"><i></i></div></div>
  </div></div>
  <div class="plates" aria-hidden="true"></div>
  <div class="ffx" aria-hidden="true"><i class="ffband"></i><div class="ffbadge"><span class="ffar"><i></i><i></i></span><b>FF</b><em>×${FF}</em></div></div>`;
  ov.style.setProperty('--coach-u', coachSvg('#19E3C4', '#FFE600'));
  ov.style.setProperty('--coach-t', coachSvg('#FF2E88', '#FFE600'));
  // players live in their own 3D layer over the stadium so no building wall can slice through them
  rig = [...ov.querySelectorAll('.mx-rig')];
  const all = [...ov.querySelectorAll('.gp')];
  EL.u = all.slice(0, 11); EL.t = all.slice(11, 22); EL.cu = all[22]; EL.ct = all[23]; EL.ball = all[24];
  EL.los = ov.querySelector('.gl.los'); EL.fst = ov.querySelector('.gl.fst'); 
  EL.cu.style.transition = EL.ct.style.transition = 'transform 1.4s linear';
  EL.los.style.transition = EL.fst.style.transition = 'left .5s ease';
}
const POS = new Map();
/* name plates over the offense's fantasy players: projected from each sprite's screen box every frame */
let PLF = null, plKey = '', plEls = [], plThr = -1;
function plateTick(){
  requestAnimationFrame(plateTick);
  const box = ov && ov.querySelector('.plates'); if (!box) return;
  const show = G && PLF && !ov.classList.contains('dim');
  box.style.display = show ? '' : 'none'; if (!show) return;
  const side = G.poss, key = side + PLF + (TM(side).ab || TM(side).n);
  if (key !== plKey){
    plKey = key;
    const T = TM(side), sk = skillPlayers(T), qb = (T.qb[0] || [])[0], kk = (T.k[0] || [])[0];
    const list = PLF === 'fg' ? [[7, kk, 'K']] : PLF === 'punt' ? [[6, kk, 'P']] : [[6, qb, 'QB'], [7, sk[7].n, 'RB'], [5, sk[5].n, 'TE'], [8, sk[8].n, 'WR'], [9, sk[9].n, 'WR'], ...(['i', 'jumbo'].includes(PLF) ? [] : [[10, sk[10].n, 'WR']])]
      .filter(x => x[1] && !/^the /.test(x[1]));
    box.className = 'plates ' + side;
    box.innerHTML = list.map(x => `<span class="npl"><i class="tk"></i><b>${esc(last(x[1]))}</b><em>${x[2]}</em></span>`).join('');
    plEls = list.map((x, j) => [x[0], box.children[j]]);
    plThr = -1;
  }
  // during your pass play each receiver's plate shows the key that throws it to him
  const tv = THROW.on && G.poss === ME ? THROW.ver : 0;
  if (tv !== plThr){ plThr = tv;
    for (const [i, el] of plEls){ const n = tv ? THROW.ids.indexOf(i) : -1, t = el.querySelector('.tk'); if (t) t.textContent = n >= 0 ? n + 1 : ''; el.classList.toggle('thr', n >= 0); el._w = 0; }
  }
  // place each plate over its man; when two would overlap (QB and back stacked), lift the farther one
  const pts = [];
  for (const [i, el] of plEls){
    const sprite = EL[side][i] && EL[side][i].firstElementChild; if (!sprite) continue;
    const r = sprite.getBoundingClientRect();
    if (!r.height){ el.style.opacity = '0'; continue; }
    el.style.opacity = '';
    if (!el._w){ el._w = el.offsetWidth; el._h = el.offsetHeight; }
    pts.push({ el, x:r.left + r.width / 2, y:r.top - 3, w:el._w, h:el._h, foot:r.bottom });
  }
  pts.sort((a, b) => b.foot - a.foot);
  const placed = [];
  for (const p of pts){
    let y = p.y;
    for (let k = 0; k < 6; k++){
      const hit = placed.find(q => Math.abs(q.x - p.x) < (q.w + p.w) / 2 + 2 && Math.abs(q.y - y) < p.h + 1);
      if (!hit) break; y = hit.y - p.h - 2;
    }
    p.y = y; placed.push(p);
    p.el.style.transform = `translate(${p.x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-100%)`;
  }
}
requestAnimationFrame(plateTick);
const put = (el, x, y, z) => { POS.set(el, [x, y, z || 0]); el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${(z || 0).toFixed(1)}px)`; };
const posOf = el => POS.get(el) || [0, 0, 0];

/* ---------------- camera ---------------- */
const CAMS = [
  { id:'bc', name:'Broadcast',     f:(x, d) => ({ x:clamp(x, -330, 330), y:24, z:0, tilt:60, spin:0, zoom:1.02 }) },
  { id:'qb', name:'Behind the QB', f:(x, d) => ({ x:clamp(x + (d < 0 ? -170 : -40), -540, 540), y:0, z:0, tilt:64, spin:90, zoom:1.26 }) },
  { id:'hi', name:'All-22',        f:(x, d) => ({ x:clamp(x, -260, 260), y:10, z:0, tilt:34, spin:0, zoom:.82 }) },
  { id:'sl', name:'Coach Cam',     f:(x, d) => ({ x:clamp(x, -420, 420), y:120, z:10, tilt:73, spin:0, zoom:1.45 }) }
];
const SPOT = {
  home:  { x:0, y:0, z:0, tilt:38, spin:0, zoom:.55 },
  title: { x:0, y:-110, z:0, tilt:60, spin:0, zoom:.62 },
  press: { x:0, y:-628, z:185, tilt:52, spin:0, zoom:.95 },
  mid:   { x:0, y:40, z:0, tilt:62, spin:0, zoom:1.25 },
  tent:  { x:-365, y:325, z:0, tilt:64, spin:-12, zoom:1.7 },
  goal:  { x:560, y:0, z:0, tilt:60, spin:30, zoom:1.35 }
};
// Player mode plays best from behind the QB (up on the stick is always upfield); Head Coach from the broadcast booth
let camIdx = store.get('hc-cam', 0); if (!CAMS[camIdx]) camIdx = 0;
if (window.HC_MODE !== 'mp' && store.get('hc-style', 'player') === 'player' && !store.get('hc-pcam', false)){ camIdx = 1; store.set('hc-cam', 1); store.set('hc-pcam', true); }
const cam = { x:0, y:0, z:0, tilt:38, spin:0, zoom:.55 }, camT = { ...cam };
let camFollow = null, camSnap = false;
const zf = () => innerWidth < 640 ? .64 : innerWidth < 1000 ? .84 : 1;
const pose = p => `scale(${(p.zoom * zf()).toFixed(4)}) rotateX(${p.tilt.toFixed(2)}deg) rotateZ(${p.spin.toFixed(2)}deg) translate3d(${(-p.x).toFixed(1)}px,${(-p.y).toFixed(1)}px,${(-(p.z || 0)).toFixed(1)}px)`;
function camTo(p, snap){ Object.assign(camT, { z:0, ...p }); if (snap || reduced()){ Object.assign(cam, camT); camSnap = true; } }
function camGame(x, d, snap){ camTo(CAMS[camIdx].f(x, d), snap); }

/* ---------------- render loop: camera ease + play animation ---------------- */
let ANIM = null, lastNow = 0;
function frame(now){
  const dt = lastNow ? now - lastNow : 0; lastNow = now;
  if (ANIM && PAUSED) ANIM.t0 += dt;
  else if (ANIM){
    const k = clamp((now - ANIM.t0) / ANIM.ms, 0, 1);
    const stop = ANIM.apply(k) === true;
    if (k >= 1 || stop){ const r = ANIM.res; ANIM = null; r(); }
  }
  if (camFollow){ const f = camFollow(); camGame(f[0], f[1]); }
  let moved = camSnap; camSnap = false;
  // the camera keeps up with fast forward
  const ffk = G && G.auto ? FF : 1, ease = b => ffk === 1 ? b : 1 - Math.pow(1 - b, ffk);
  for (const key of ['x', 'y', 'z', 'tilt', 'spin', 'zoom']){
    const d = camT[key] - cam[key];
    if (Math.abs(d) > (key === 'zoom' ? .0005 : .02)){ cam[key] += d * ease(ANIM ? .085 : .06); moved = true; }
    else if (d !== 0){ cam[key] = camT[key]; moved = true; }
  }
  if (moved && rig){ const tf = pose(cam); rig.forEach(r => r.style.transform = tf); windArrow(); }
  requestAnimationFrame(frame);
}
function runAnim(ms, apply){ return new Promise(res => { ANIM = { t0:performance.now(), ms:ms / spd(), apply, res }; }); }

/* ---------------- plays ---------------- */
const OFF = {
  dive:   { n:'HB Dive',    ff:'Singleback · A gap', fm:'single', cat:'run_in', k:'run', m:3.9, sd:2.6, big:.04, fum:.011, gap:'A' },
  power:  { n:'Power O',    ff:'I-Form · C gap',  fm:'i',      cat:'run_in',  k:'run',  m:4.2, sd:3.0, big:.045, fum:.012, loss:.07, gap:'C', vs:{ base:{ dm:-.3 }, blitz:{ dm:-.6 }, c2:{ dm:.3 }, c3:{ dm:.3 }, gl:{ dm:.4 } } },
  counter:{ n:'HB Counter', ff:'Singleback · B gap', fm:'single', cat:'run_in', k:'run', m:3.8, sd:4.0, big:.07, fum:.013, loss:.11, gap:'B', vs:{ blitz:{ dm:1.6, db:.03 }, gl:{ dm:-.6 }, prev:{ dm:.3 } } },
  draw:   { n:'HB Draw',    ff:'Shotgun · A gap', fm:'gun',    cat:'run_in',  k:'run',  m:3.6, sd:3.6, big:.06, fum:.012, loss:.08, gap:'A', vs:{ blitz:{ dm:3.2, db:.05 }, prev:{ dm:1.2 }, c2:{ dm:.6 }, c3:{ dm:.4 }, base:{ dm:-.8 }, gl:{ dm:-1.4 } } },
  sweep:  { n:'HB Toss',    ff:'I-Form · Edge',   fm:'i',      cat:'run_out', k:'run',  m:4.2, sd:3.6, big:.06, fum:.015, loss:.1, gap:'E' },
  sneak:  { n:'QB Sneak',   ff:'Jumbo',          fm:'jumbo',  cat:'sneak',   k:'run',  m:1.5, sd:1.1, big:0,    fum:.006, gap:'Q' },
  slant:  { n:'Slants',     ff:'Shotgun',        fm:'gun',    cat:'short',   k:'pass', cmp:.66, m:5.5, sd:3, yac:3.5, int:.025, sack:.035,  tgt:'WR', route:'slant', depth:'short' },
  curl:   { n:'TE Curl',    ff:'Shotgun Trips',  fm:'gun',    cat:'short',   k:'pass', cmp:.70, m:6.5, sd:2.5, yac:2, int:.022, sack:.04, tgt:'TE', route:'curl',  depth:'short' },
  mesh:   { n:'Mesh',       ff:'Shotgun · Crossers', fm:'gun', cat:'short',  k:'pass', cmp:.70, m:4.5, sd:2.5, yac:4.5, int:.02, sack:.035, tgt:'WR', route:'drag', depth:'short', vs:{ blitz:{ dc:.08, ds:-.02 }, gl:{ dc:.04 }, c2:{ dc:-.03 }, prev:{ dc:.02 } } },
  smash:  { n:'Smash',      ff:'Shotgun · Hitch-Corner', fm:'gun', cat:'short', k:'pass', cmp:.58, m:10, sd:4, yac:3, int:.03, sack:.045, tgt:'WR', route:'corner', depth:'short', vs:{ c2:{ dc:.16 }, c3:{ dc:-.04 }, prev:{ dc:-.03 } } },
  flood:  { n:'Flood',      ff:'Shotgun · Three-level', fm:'gun', cat:'deep', k:'pass', cmp:.55, m:12, sd:5, yac:3.5, int:.03, sack:.05, tgt:'WR', route:'corner', depth:'deep', vs:{ c3:{ dc:.17 }, base:{ dc:.04 }, c2:{ dc:-.05 }, prev:{ dc:-.03 } } },
  verts:  { n:'Four Verts', ff:'Shotgun Spread', fm:'gun',    cat:'deep',    k:'pass', cmp:.36, m:20, sd:8, yac:4, int:.05,  sack:.065,  tgt:'WR', route:'go',    depth:'deep' },
  pa:     { n:'PA Post',    ff:'I-Form',         fm:'i',      cat:'pa',      k:'pass', cmp:.46, m:15, sd:6, yac:4, int:.035, sack:.05,  tgt:'WR', route:'post',  depth:'pa' },
  boot:   { n:'PA Boot',    ff:'I-Form · Rollout', fm:'i',    cat:'pa',      k:'pass', cmp:.58, m:9, sd:4, yac:4, int:.025, sack:.03, tgt:'TE', route:'drag', depth:'pa', vs:{ blitz:{ ds:.04, dc:-.05 }, base:{ dc:.04 }, gl:{ dc:.05 } } },
  screen: { n:'HB Screen',  ff:'Shotgun',        fm:'gun',    cat:'screen',  k:'pass', cmp:.82, m:-2, sd:1,   yac:6.5, int:.012, sack:.012, tgt:'RB', route:'screen',  depth:'screen' }
};
const OKEYS = Object.keys(OFF);
const RUNK = OKEYS.filter(k => OFF[k].k === 'run'), PASSK = OKEYS.filter(k => OFF[k].k === 'pass');
// a defensive call's effect on a play: its category's line, plus anything special about this play against that call
function modOf(oK, dK, cat){ const a = DEFM[dK][cat || OFF[oK].cat] || {}, b = (OFF[oK].vs || {})[dK]; if (!b) return a; const o = { ...a }; for (const k in b) o[k] = (o[k] || 0) + b[k]; return o; }
const DEF = {
  base:  { n:'4-3 Base',       ff:'Cover 3 Sky' },
  c2:    { n:'Nickel Cover 2', ff:'Nickel' },
  c3:    { n:'Dime Cover 3',   ff:'Dime' },
  blitz: { n:'Cover 1 Blitz',  ff:'Fire Zone' },
  gl:    { n:'Goal Line',      ff:'Stack the Box' },
  prev:  { n:'Prevent',        ff:'Quarters Deep' }
};
const DKEYS = Object.keys(DEF);
// how each defensive call changes each kind of play: dm yards, dc completion, ds sack, di interception, dy yards after catch, db big-play chance
const DEFM = {
  base:  { run_in:{ dm:-1.4 }, run_out:{ dm:-.6 }, sneak:{ dm:-.4 }, short:{}, deep:{ dc:.04 }, pa:{ dc:.06 }, screen:{} },
  c2:    { run_in:{ dm:.8 }, run_out:{ dm:.4 }, sneak:{ dm:.3 }, short:{ dc:-.06, dy:-1 }, deep:{ dc:-.12, di:.015 }, pa:{ dc:-.06 }, screen:{ dy:1 } },
  c3:    { run_in:{ dm:1.6 }, run_out:{ dm:1.2 }, sneak:{ dm:.5 }, short:{ dc:.03, dy:1 }, deep:{ dc:-.15, di:.02 }, pa:{ dc:-.1, di:.01 }, screen:{ dy:1.5 } },
  blitz: { run_in:{ dm:-1.8, db:.05 }, run_out:{ dm:2.2, db:.08 }, sneak:{ dm:-.5 }, short:{ ds:.04, dc:-.04, db:.03 }, deep:{ ds:.09, dc:.05, db:.05 }, pa:{ ds:.07, dc:.08, db:.06 }, screen:{ dy:5, db:.15 } },
  gl:    { run_in:{ dm:-2.6 }, run_out:{ dm:-1.4 }, sneak:{ dm:-.9 }, short:{ dc:.14, dy:3 }, deep:{ dc:.2, db:.12 }, pa:{ dc:.22, db:.12 }, screen:{ dy:4 } },
  prev:  { run_in:{ dm:2.6 }, run_out:{ dm:2.4 }, sneak:{ dm:.6 }, short:{ dc:.1, dm:2, ds:-.03 }, deep:{ dc:-.26, di:.02, db:-.03, ds:-.04 }, pa:{ dc:-.2, ds:-.04 }, screen:{ dy:3 } }
};
const callEdge = M => -(M.dm || 0) - (M.dc || 0) * 25 + (M.ds || 0) * 40 + (M.di || 0) * 100 - (M.dy || 0) * .5 - (M.db || 0) * 40;
const OC = { n:'Rex Roster', i:'RR', c:'#19E3C4' }, DC = { n:'Chet Benchley', i:'CB', c:'#FF2E88' };
const OLINE = { run_in:'Pound it between the tackles.', run_out:'Get the back to the edge.', sneak:'Push the pile. One yard.', short:'Quick game. Get it out fast.', deep:'Take the shot down the field.', pa:"They're cheating on the run. Fake it and go.", screen:'Let them rush, then dump it off.' };
const DLINE = { base:'Stay home and play the run.', c2:'Take away the sidelines and the deep halves.', c3:'Keep everything in front of us.', blitz:'Send the house. Get home.', gl:'Load the box. Nobody gets the edge.', prev:'Nothing deep. Make them dink and dunk.' };

/* ---------------- play art ---------------- */
const OL_A = [[38,37],[44,37],[50,37],[56,37],[62,37]];
const FORM_A = {
  single: { qb:[50,42], rb:[50,52], te:[[68,37]], wr:[[8,37],[92,37],[22,38]] },
  gun:    { qb:[50,47], rb:[57,47], te:[[68,37]], wr:[[8,37],[92,37],[22,38]] },
  i:      { qb:[50,42], rb:[50,55], fb:[50,48], te:[[68,37]], wr:[[8,37],[92,37]] },
  jumbo:  { qb:[50,42], rb:[50,51], te:[[68,37],[32,37]], wr:[[8,37],[92,37]] }
};
const PATH_A = {
  dive:   [['M50 52 L50 41 L46 20', 'r']],
  sweep:  [['M50 55 Q68 54 76 40 L80 16', 'r']],
  sneak:  [['M50 42 L50 26', 'r']],
  power:  [['M44 37 Q50 43 60 40', 'd'], ['M50 48 L60 40', 'd'], ['M50 55 L53 45 L63 38 L66 16', 'r']],
  counter:[['M44 37 Q50 42 57 39', 'd'], ['M50 52 L43 50 L52 43 L56 38 L58 16', 'r']],
  draw:   [['M50 47 L50 52', 'd'], ['M57 47 L53 47 L49 38 L47 16', 'r']],
  slant:  [['M8 37 L8 31 L30 17', 'y'], ['M92 37 L92 31 L70 17', 't'], ['M22 38 L22 30 L42 20', 't'], ['M57 47 L57 41', 'd']],
  curl:   [['M68 37 L68 13 L64 17', 'y'], ['M57 47 Q70 46 82 39', 't'], ['M8 37 L8 6', 't'], ['M92 37 L92 6', 't'], ['M22 38 L26 14', 't']],
  verts:  [['M8 37 L8 4', 'y'], ['M92 37 L92 4', 't'], ['M22 38 L30 4', 't'], ['M68 37 L64 4', 't']],
  pa:     [['M50 55 L50 41', 'd'], ['M50 42 L50 50', 'd'], ['M8 37 L8 22 L30 5', 'y'], ['M92 37 L92 22 L66 22', 't'], ['M68 37 L68 30', 'd']],
  screen: [['M57 47 Q70 50 84 42', 'y'], ['M56 37 L68 40', 'd'], ['M62 37 L74 40', 'd'], ['M8 37 L8 6', 't'], ['M92 37 L92 10', 't']]
};
const DEF_A = {
  base:  { x:[[41,31],[47,31],[53,31],[59,31],[38,23],[50,23],[62,23],[8,29],[92,29],[30,13],[70,13]], z:[[15,9,14,5],[50,7,14,5],[85,9,14,5]] },
  c2:    { x:[[41,31],[47,31],[53,31],[59,31],[36,22],[50,22],[64,22],[8,32],[92,32],[25,8],[75,8]], z:[[25,8,22,6],[75,8,22,6],[10,25,9,5],[90,25,9,5]] },
  c3:    { x:[[41,31],[47,31],[53,31],[59,31],[36,22],[50,22],[64,22],[12,15],[88,15],[50,6],[72,22]], z:[[14,10,13,5],[50,6,14,5],[86,10,13,5]] },
  blitz: { x:[[41,31],[47,31],[53,31],[59,31],[40,29],[50,28],[60,29],[8,32],[92,32],[50,10],[70,24]], a:['M40 29 L46 42', 'M50 28 L50 42', 'M60 29 L54 42'] },
  gl:    { x:[[38,31],[44,31],[50,31],[56,31],[62,31],[40,27],[50,26],[60,27],[18,30],[82,30],[50,21]] },
  prev:  { x:[[41,31],[47,31],[53,31],[59,31],[36,18],[50,18],[64,18],[12,9],[88,9],[35,4],[65,4]], z:[[20,6,16,4],[50,4,16,4],[80,6,16,4]] }
};
const COL = { y:'#FFE600', t:'#19E3C4', r:'#FF2E88', d:'#B7B0E0' };
function artOff(k){
  const f = FORM_A[OFF[k].fm];
  let s = `<svg viewBox="0 0 100 60" aria-hidden="true"><path d="M2 34H98" stroke="#E8E4FF" stroke-opacity=".35" stroke-width=".6" stroke-dasharray="2 2"/>`;
  for (const [d, c] of PATH_A[k]) s += `<path d="${d}" fill="none" stroke="${COL[c]}" stroke-width="${c === 'y' || c === 'r' ? 2 : 1.4}" ${c === 'd' ? 'stroke-dasharray="2 1.6"' : ''} stroke-linecap="round" stroke-linejoin="round" marker-end="url(#ah${c})"/>`;
  const dots = [...OL_A, f.qb, f.rb, ...(f.fb ? [f.fb] : []), ...f.te, ...f.wr];
  dots.forEach(p => { s += `<circle cx="${p[0]}" cy="${p[1]}" r="2.3" fill="#0B2A24" stroke="#F4F0FF" stroke-width="1.1"/>`; });
  return s + MARK + `</svg>`;
}
function artDef(k){
  const a = DEF_A[k];
  let s = `<svg viewBox="0 0 100 60" aria-hidden="true"><path d="M2 34H98" stroke="#E8E4FF" stroke-opacity=".35" stroke-width=".6" stroke-dasharray="2 2"/>`;
  (a.z || []).forEach(z => { s += `<ellipse cx="${z[0]}" cy="${z[1]}" rx="${z[2]}" ry="${z[3]}" fill="rgba(25,227,196,.16)" stroke="#19E3C4" stroke-opacity=".6" stroke-width=".7"/>`; });
  (a.a || []).forEach(d => { s += `<path d="${d}" fill="none" stroke="#FF2E88" stroke-width="1.8" marker-end="url(#ahr)"/>`; });
  [...OL_A, [50,44], [8,37], [92,37], [68,37]].forEach(p => { s += `<circle cx="${p[0]}" cy="${p[1]}" r="2" fill="none" stroke="#8C84B8" stroke-width=".9"/>`; });
  a.x.forEach(p => { s += `<path d="M${p[0] - 2.2} ${p[1] - 2.2}l4.4 4.4M${p[0] + 2.2} ${p[1] - 2.2}l-4.4 4.4" stroke="#FFE600" stroke-width="1.5" stroke-linecap="round"/>`; });
  return s + MARK + `</svg>`;
}
const MARK = `<defs>${Object.entries(COL).map(([k, c]) => `<marker id="ah${k}" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="3.2" markerHeight="3.2" orient="auto"><path d="M0 0L6 3L0 6z" fill="${c}"/></marker>`).join('')}</defs>`;

/* ---------------- game state ---------------- */
let G = null;
const SET = { u:store.get('hc-u', '10'), t:store.get('hc-t', '7'), qlen:store.get('hc-qlen', 5), diff:store.get('hc-diff', 'pro'), po:'bal', pd:'base', style:store.get('hc-style', 'player') };
// Player mode: you play every snap yourself (assets/hc-live.js). Head Coach: you call it and watch. Head-to-head stays Head Coach.
const liveOn = () => !MP && typeof LIVE !== 'undefined' && LIVE && SET.style === 'player' && !(G && G.auto);
if (!byId(SET.u)) SET.u = TEAMS[0].id;
if (!byId(SET.t) || SET.t === SET.u) SET.t = TEAMS.find(t => t.id !== SET.u).id;
const opp = s => s === 'u' ? 't' : 'u';
const TM = s => s === 'u' ? G.U : G.T;
// which side this screen coaches: 'u' against the CPU and for the host of a head-to-head game, 't' for the guest
let ME = 'u';
const ytg = () => G.poss === 'u' ? 100 - G.ball : G.ball;
const ownYd = () => G.poss === 'u' ? G.ball : 100 - G.ball;
const dirOf = s => s === 'u' ? 1 : -1;          // direction in yard-line terms (your own goal line is 0)
const wdir = s => -dirOf(s);                       // direction on the field: you drive west, toward the scoreboard
/* wind: blows toward angle a (degrees on the field, 0 = east). Teams change ends every quarter in real life;
   here the field stays put, so the wind turns around each quarter instead, which works out the same for both teams */
const windA = () => !G || !G.wind ? 0 : G.wind.a + ((G.q || 1) % 2 === 0 ? 180 : 0);
// the HUD arrow shows the wind as it looks from the current camera, so it matches the flags on the uprights
function windArrow(){
  const el = G && G.wind && document.querySelector('#wind i'); if (!el) return;
  const r = windA() * Math.PI / 180, s = cam.spin * Math.PI / 180, x = Math.cos(r), y = Math.sin(r);
  const sx = x * Math.cos(s) - y * Math.sin(s), sy = (x * Math.sin(s) + y * Math.cos(s)) * Math.cos(cam.tilt * Math.PI / 180);
  el.style.transform = `rotate(${(Math.atan2(sy, sx) * 180 / Math.PI + 90).toFixed(0)}deg)`;
}
function windFor(side){
  if (!G || !G.wind) return { along:0, cross:0, mph:0 };
  const r = windA() * Math.PI / 180, wx = Math.cos(r) * G.wind.mph, wy = Math.sin(r) * G.wind.mph, d = wdir(side);
  return { along:wx * d, cross:wy * d, mph:G.wind.mph };   // along > 0: at the kicker's back; cross > 0: toward the offense's right
}
const fieldX = b => 500 - b * 10;
const spotTxt = () => { const o = ownYd(); return o < 50 ? 'OWN ' + o : o > 50 ? 'OPP ' + (100 - o) : 'MIDFIELD'; };
const downTxt = () => `${ord(G.down)} & ${G.togo >= ytg() ? 'GOAL' : G.togo}`;
const sideName = s => s === 'u' ? AB(G.U) : AB(G.T);
const newStats = () => ({ pts:0, plays:0, yds:0, pyds:0, cmp:0, att:0, ryds:0, ratt:0, to:0, sacks:0, fd:0, td:0, c3:0, a3:0, top:0, pen:0, pl:{} });
const pstat = (side, name, pos) => { const p = G.st[side].pl; return p[name] || (p[name] = { n:name, pos, pa:0, pc:0, py:0, ptd:0, pint:0, ra:0, ry:0, rtd:0, rc:0, rcy:0, rctd:0 }); };
function newGame(L){
  // L: a head-to-head room's settings (both teams, both game plans, quarter length); otherwise the single-player setup
  const C = L ? { u:L.u.team, t:L.t.team, qlen:L.qlen, diff:'pro', pu:{ o:L.u.o, d:L.u.d }, pt:{ o:L.t.o, d:L.t.d } }
    : { u:SET.u, t:SET.t, qlen:SET.qlen, diff:SET.diff, pu:{ o:SET.po, d:SET.pd }, pt:{ o:'bal', d:'base' } };
  G = { U:byId(C.u), T:byId(C.t), qlen:C.qlen * 60, diff:C.diff, plan:{ u:C.pu, t:C.pt },
    q:1, clock:SET.qlen * 60, poss:'u', ball:25, down:1, togo:10, sc:{ u:0, t:0 }, to:{ u:3, t:3 }, mom:0, runoff:0, tmw:{},
    st:{ u:newStats(), t:newStats() }, hist:{ o:{}, d:{} }, calls:{ w:0, l:0, e:0 }, over:false, pat:null, recv1:'u', busy:false, ot:false, drive:{ plays:0, start:25 },
    drv:{ u:{ n:0, td:0, fg:0, miss:0, punt:0, to:0, downs:0, safety:0, half:0, yds:0, plays:0 }, t:{ n:0, td:0, fg:0, miss:0, punt:0, to:0, downs:0, safety:0, half:0, yds:0, plays:0 } }, drOpen:null,
    wind:{ mph:Math.round(Math.pow(rnd(), 1.35) * 22), a:Math.round(rnd() * 360) } };
}

/* ---------------- ratings, edges and expected value ---------------- */
const DIFF = { rookie:{ bonus:-5, temp:6 }, pro:{ bonus:0, temp:2.6 }, allpro:{ bonus:3, temp:1.6 } };
function unitR(side, k){
  const t = TM(side), plan = G.plan[side].o; let r = k === 'run' ? t.rt.run : t.rt.pass;
  if (plan === 'air') r += k === 'run' ? -2 : 3; if (plan === 'ground') r += k === 'run' ? 3 : -2;
  if (side === 't') r += DIFF[G.diff].bonus;
  return r;
}
function defR(side){ let r = TM(side).rt.dfn; if (side === 't') r += DIFF[G.diff].bonus; return r; }
const momFor = side => side === 'u' ? G.mom : -G.mom;
function edgeOf(off, P){ return (unitR(off, P.k) - defR(opp(off))) / 10 + momFor(off) * .35; }
function paBonus(off){ const s = G.st[off]; return s.plays >= 6 && s.ratt / Math.max(1, s.plays) > .45 ? .06 : 0; }
// expected value of an offensive call against a defensive call, from the offense's side
const repOf = (off, oK) => (G.recent && G.recent[off] ? G.recent[off].slice(-3).filter(k => k === oK).length : 0);
// a defense that has seen the same call over and over sits on it
function keyed(M, n){ if (!n) return M; return { ...M, dm:(M.dm || 0) - .8 * n, dc:(M.dc || 0) - .025 * n, ds:(M.ds || 0) + .012 * n, dy:(M.dy || 0) - .4 * n }; }
function ev(oK, dK, off){
  const P = OFF[oK], M = keyed(modOf(oK, dK), repOf(off, oK)), e = edgeOf(off, P), pd = G.plan[opp(off)].d;
  const tg = Math.min(G.togo, ytg()), dn = G.down;
  let mean, conv, tov;
  if (P.k === 'run'){
    const m = P.m + (M.dm || 0) + e * 1.1 + (pd === 'bend' ? .4 : 0);
    const big = P.big + (M.db || 0) + e * .012 + (pd === 'agg' ? .02 : 0);
    mean = m + big * 25 - (P.loss ? P.loss * 3 : 0); conv = 1 - Phi((tg - .5 - m) / (P.sd + .8)); tov = P.fum;
  } else {
    const sack = clamp(P.sack + (M.ds || 0) - e * .012 + (pd === 'agg' ? .02 : 0), 0, .4), pint = Math.max(.004, P.int + (M.di || 0) - e * .006);
    const pc = clamp(P.cmp + (M.dc || 0) + e * .035 + (P.cat === 'pa' ? paBonus(off) : 0), .1, .93) * (1 - sack);
    const gain = P.m + (M.dm || 0) * .4 + P.yac + (M.dy || 0) + e * .6 + (P.cat === 'screen' ? 0 : 0);
    mean = pc * gain - sack * 6.5; conv = pc * (1 - Phi((tg - .5 - gain) / (P.sd + P.yac * .8 + .5))); tov = pint;
  }
  if (P.cat === 'sneak' && tg > 2) conv *= .3;
  // success rate: 45% of the distance on 1st down, 70% on 2nd, all of it on 3rd and 4th
  const thr = dn === 1 ? tg * .45 : dn === 2 ? tg * .7 : tg;
  const sc = conv === 0 ? 0 : P.k === 'run' ? 1 - Phi((thr - .5 - (mean)) / (P.sd + .8)) : conv / Math.max(.05, 1 - Phi((tg - .5 - (mean / .6)) / (P.sd + P.yac * .8 + .5))) * (1 - Phi((thr - .5 - (mean / .6)) / (P.sd + P.yac * .8 + .5)));
  const S = dn >= 3 ? 9 : dn === 2 ? 4 : 3;
  return mean * .55 + S * clamp(sc, 0, 1) - tov * 24;
}
const bucket = () => `${Math.min(G.down, 3)}${G.togo <= 3 ? 's' : G.togo <= 7 ? 'm' : 'l'}${ytg() <= 10 ? 'z' : ''}`;
function offW(side){
  const dn = G.down, tg = G.togo, y = ytg(), diff = G.sc[side] - G.sc[opp(side)], t = TM(side);
  let w;
  if (tg <= 1) w = { sneak:3, dive:3, sweep:1, pa:1.5, slant:1, curl:.6 };
  else if (tg <= 3) w = { dive:3, sweep:1.5, sneak:dn >= 3 ? 1.2 : .3, slant:2, curl:1.5, pa:1, screen:.5 };
  else if (dn === 1) w = { dive:2, sweep:1.6, slant:1.6, curl:1.3, verts:1, pa:1.6, screen:1.1 };
  else if (dn === 2) w = tg >= 7 ? { dive:1.2, sweep:1, slant:2, curl:1.8, verts:1.4, pa:1, screen:1.4 } : { dive:1.8, sweep:1.3, slant:1.8, curl:1.6, verts:.8, pa:1.2, screen:1 };
  else w = tg >= 8 ? { slant:2.6, curl:1.8, verts:2.8, screen:1.4, sweep:.3, pa:.5 } : { slant:3, curl:2.6, dive:.8, screen:1, verts:1, sweep:.4 };
  const add = (k, v) => { if (v > 0) w[k] = (w[k] || 0) + v; };
  if (tg > 1){ add('power', (w.dive || 0) * .7); add('counter', (w.dive || 0) * .45); add('draw', tg >= 6 ? .8 : .3); }
  else add('power', 1.5);
  add('mesh', (w.slant || 0) * .6); add('smash', (w.curl || 0) * .5); if (tg >= 4) add('flood', (w.curl || 0) * .55); add('boot', (w.pa || 0) * .6);
  if (y <= 6){ delete w.verts; w.pa = (w.pa || 0) + .5; }
  const tilt = clamp((t.rt.pass - t.rt.run) / 45, -.35, .35), plan = G.plan[side].o;
  for (const k in w){ const run = OFF[k].k === 'run'; w[k] *= 1 + (run ? -tilt : tilt); if (plan === 'air') w[k] *= run ? .7 : 1.25; if (plan === 'ground') w[k] *= run ? 1.35 : .8; }
  const late = (G.q === 2 || G.q >= 4) && G.clock <= 150;
  if (late && (diff <= 0 || G.q === 2)) for (const k in w) if (OFF[k].k === 'run') w[k] *= .35;
  if (G.q >= 4 && diff > 0 && G.clock <= 330) for (const k in w) w[k] *= OFF[k].k === 'run' ? 2 : .7;
  return w;
}
function defW(side){
  const off = opp(side), dn = G.down, tg = G.togo, y = ytg(), diff = G.sc[side] - G.sc[off], plan = G.plan[side].d;
  let w;
  if (y <= 4) w = { gl:2.6, base:1.4, blitz:1 };
  else if (tg <= 2) w = { base:2.2, gl:1.2, blitz:1.4, c2:.4 };
  else if (dn === 1) w = { base:2, c2:1.3, c3:.8, blitz:1 };
  else if (dn === 2) w = tg >= 7 ? { c2:1.6, c3:1.3, base:1, blitz:1.3 } : { base:1.6, c2:1.4, blitz:1.2, c3:.6 };
  else w = tg >= 8 ? { c3:1.8, c2:1.3, blitz:1.5, prev:.4 } : { c2:1.8, blitz:1.8, base:1, c3:.6 };
  if ((G.q === 2 || G.q >= 4) && G.clock <= 120 && diff > 0 && y > 35) w.prev = (w.prev || 0) + 2.2;
  if (plan === 'agg' && w.blitz) w.blitz *= 1.6; if (plan === 'bend'){ if (w.c3) w.c3 *= 1.4; if (w.blitz) w.blitz *= .6; }
  return w;
}
function histDist(kind){ const h = G.hist[kind][bucket()]; if (!h) return null; let n = 0; for (const k in h) n += h[k]; return n >= 2 ? norm(h) : null; }
function bestOff(side, dist){ let best = null, bv = -1e9, second = -1e9; const sc = {};
  for (const o of legalOff()){ let v = 0; for (const d in dist) v += dist[d] * ev(o, d, side); sc[o] = v; if (v > bv){ second = bv; bv = v; best = o; } else if (v > second) second = v; }
  return { k:best, gap:bv - second, sc }; }
function bestDef(side, dist){ const off = opp(side); let best = null, bv = 1e9, second = 1e9; const sc = {};
  for (const d of DKEYS){ let v = 0; for (const o in dist) v += dist[o] * ev(o, d, off); sc[d] = v; if (v < bv){ second = bv; bv = v; best = d; } else if (v < second) second = v; }
  return { k:best, gap:second - bv, sc }; }
function legalOff(){ return OKEYS.filter(k => !(k === 'sneak' && G.togo > 3 && !G.pat2) && !(k === 'verts' && ytg() <= 6)); }
function aiOff(){
  const w = offW('t'); for (const k in w) if (!legalOff().includes(k)) delete w[k];
  const b = bestOff('t', histDist('d') || norm(defW('u'))), T = DIFF[G.diff].temp, top = Math.max(...Object.values(b.sc));
  for (const k in w) w[k] *= Math.exp(((b.sc[k] == null ? top - 9 : b.sc[k]) - top) / T);
  return pickW(w);
}
function aiDef(){
  const w = defW('t');
  const b = bestDef('t', histDist('o') || norm(offW('u'))), T = DIFF[G.diff].temp, low = Math.min(...Object.values(b.sc));
  for (const k in w) w[k] *= Math.exp(-(b.sc[k] - low) / T);
  return pickW(w);
}
// the coordinator's pick: best value against what the other side tends to call, nudged toward what fits the down and distance
function recFor(mode){
  const sit = (sc, w, sign) => { const mx = Math.max(...Object.values(w)), out = {}; for (const k in sc) out[k] = sign * sc[k] + 2.2 * Math.log(Math.max(.02, (w[k] || 0) / mx)); return out; };
  let r; const me = ME, them = opp(ME);
  if (mode === 'off'){ const b = bestOff(me, norm(defW(them))); r = sit(b.sc, offW(me), 1); }
  else { const w = offW(them); for (const k in w) if (!legalOff().includes(k)) delete w[k]; const b = bestDef(me, norm(w)); r = sit(b.sc, defW(me), -1); }
  const ks = Object.keys(r).sort((a, b) => r[b] - r[a]);
  return { k:ks[0], conf:clamp(Math.round(56 + (r[ks[0]] - r[ks[1]]) * 9), 52, 94) };
}

/* ---------------- resolving a snap ---------------- */
const pickRB = t => { const r = t.rb; if (!r.length) return [last('Running back'), 'RB']; const n = r.length > 1 && rnd() < .36 ? r[1] : r[0]; return [n[0], 'RB']; };
/* every receiver runs a route; the QB reads them in order and throws to whoever gets open */
const RP = {   // route profiles: timing class, air yards, spread, yards after catch, catch rate, pick rate
  slant:{ d:'short',  m:6,  sd:2.5, yac:4.5, cmp:.90, int:.019 },
  out:  { d:'short',  m:6,  sd:2,   yac:3,   cmp:.88, int:.022 },
  curl: { d:'short',  m:8,  sd:2.5, yac:3,   cmp:.92, int:.017 },
  dig:  { d:'short',  m:12, sd:3,   yac:3.5, cmp:.81, int:.022 },
  seam: { d:'deep',   m:15, sd:5,   yac:4.5, cmp:.71, int:.026 },
  post: { d:'deep',   m:17, sd:6,   yac:4.5, cmp:.67, int:.026 },
  go:   { d:'deep',   m:22, sd:8,   yac:5,   cmp:.57, int:.037 },
  check:{ d:'short',  m:2,  sd:2,   yac:5,   cmp:.95, int:.008 },
  screen:{ d:'screen', m:-2, sd:1,  yac:7,   cmp:.95, int:.01 },
  flat: { d:'short',  m:2,  sd:1.5, yac:4.5, cmp:.95, int:.012 },
  drag: { d:'short',  m:4,  sd:1.5, yac:6,   cmp:.95, int:.012 },
  comeback:{ d:'short', m:12, sd:2.5, yac:2, cmp:.85, int:.025 },
  corner:{ d:'deep',  m:18, sd:5,   yac:3.5, cmp:.65, int:.03 },
  swing:{ d:'short',  m:1,  sd:1.5, yac:6,   cmp:.95, int:.01 },
  angle:{ d:'short',  m:5,  sd:2,   yac:5,   cmp:.89, int:.015 },
  wheel:{ d:'deep',   m:16, sd:5,   yac:5,   cmp:.61, int:.025 }
};
// who runs what on each pass play (8/9/10 = WR1/WR2/slot, 5 = TE, 7 = RB); p = the primary read
const TREE = {
  slant: { 8:'slant', 9:'slant', 10:'slant', 5:'drag', 7:'check', p:8 },
  curl:  { 5:'curl', 8:'go', 9:'dig', 10:'drag', 7:'swing', p:5 },
  verts: { 8:'go', 9:'go', 10:'seam', 5:'seam', 7:'check', p:8 },
  pa:    { 8:'post', 9:'dig', 5:'drag', p:8 },
  screen:{ 7:'screen', 8:'go', 9:'go', 10:'go', p:7 },
  mesh:  { 8:'curl', 9:'curl', 10:'drag', 5:'drag', 7:'check', p:10 },
  smash: { 8:'curl', 9:'curl', 10:'corner', 5:'seam', 7:'check', p:10 },
  flood: { 8:'go', 10:'corner', 5:'out', 7:'swing', 9:'dig', p:10 },
  boot:  { 8:'corner', 9:'post', 5:'drag', 7:'swing', p:5 }
};
const routeCat = (P, r) => P.cat === 'pa' && RP[r].d !== 'screen' && RP[r].m >= 8 ? 'pa' : RP[r].d === 'screen' ? (P.cat === 'screen' ? 'screen' : 'short') : RP[r].d === 'deep' ? 'deep' : 'short';
function skillPlayers(t){
  const healthy = (t.roster || []).filter(r => r[4] !== 'O' && r[4] !== 'IR');
  const wrs = [...t.rec.filter(r => r[1] === 'WR'), ...healthy.filter(r => r[1] === 'WR' && !t.rec.some(x => x[0] === r[0])).sort((a, b) => b[3] - a[3])];
  const te = t.rec.find(r => r[1] === 'TE') || healthy.filter(r => r[1] === 'TE').sort((a, b) => b[3] - a[3])[0];
  const rb = t.rb[0], m = {};
  [8, 9, 10].forEach((ix, j) => { const w = wrs[j]; m[ix] = w ? { n:w[0], pos:'WR', v:w[3] } : { n:'the slot receiver', pos:'WR', v:5 }; });
  m[5] = te ? { n:te[0], pos:'TE', v:te[3] } : { n:'the tight end', pos:'TE', v:5 };
  m[7] = rb ? { n:rb[0], pos:'RB', v:rb[3] } : { n:'the back', pos:'RB', v:5 };
  return m;
}
function playTree(oK, hot){
  const tree = { ...TREE[oK] };
  for (const k in hot || {}){ if (k === 'p') continue; if (hot[k] === 'block') delete tree[k]; else tree[k] = hot[k]; }
  // your chosen target becomes the QB's first read
  if (hot && hot.p != null && tree[hot.p]) tree.p = +hot.p;
  if (tree.p == null || !tree[tree.p]){ const first = Object.keys(tree).filter(k => k !== 'p').map(Number)[0]; tree.p = first; }
  return tree;
}
function readField(OT, oK, dK, e){
  const tree = playTree(oK, G.hot), who = skillPlayers(OT), P = OFF[oK];
  const ids = Object.keys(tree).filter(k => k !== 'p').map(Number), sc = {};
  for (const i of ids){
    const r = tree[i], M = modOf(oK, dK, routeCat(P, r));
    // separation: his own talent, how the coverage plays his route, and a little luck
    // a back's fantasy points are mostly rushing, so they count for less here
    let s = (who[i].v - 11) / (who[i].pos === 'RB' ? 16 : 7) + (M.dc || 0) * 9 + e * .25 + gauss() * .8;
    if (r === 'check') s -= .35;
    if (r === 'swing') s -= .2;
    if (dK === 'blitz' && RP[r].d !== 'deep') s += .45;
    if (dK === 'prev' && RP[r].d === 'deep') s -= .6;
    if (oK === 'screen' && i !== 7) s -= .8;
    sc[i] = s;
  }
  // progression: the primary, then deep to short, the check-down last
  const isCheck = r => r === 'check' || r === 'swing';
  const order = [tree.p, ...ids.filter(i => i !== tree.p && !isCheck(tree[i])).sort((a, b) => RP[tree[b]].m - RP[tree[a]].m), ...ids.filter(i => i !== tree.p && isCheck(tree[i]))];
  // the QB weighs everyone he sees: how open, a little extra for depth, a slight lean to earlier reads.
  // A clearly open primary gets it right away; otherwise a wide-open short route beats a covered deep one.
  const dv = r => RP[r].d === 'deep' ? .35 : RP[r].m >= 10 ? .15 : 0;
  let k = 0;
  if (sc[order[0]] < .6){ let bv = -99; order.forEach((i, j) => { const v = sc[i] + dv(tree[i]) - .12 * j; if (v > bv){ bv = v; k = j; } }); }
  const idx = order[k];
  return { idx, route:tree[idx], n:who[idx].n, pos:who[idx].pos, k, s:sc[idx], routes:tree, sc };
}
// catch and pick chances for one throw: the route, how open he is, the coverage, the QB, the pressure
function passOdds(oK, dK, off, route, s, hurry, rp, e, extra = 0){
  const P = OFF[oK], OT = TM(off), RF = RP[route], cat = routeCat(P, route), Mr = keyed(modOf(oK, dK, cat), rp);
  const qbv = (OT.qb[0] || [0, 0, 0, 15])[3], acc = clamp((qbv - 15) * .006, -.05, .07);
  const pint = Math.max(.004, RF.int + (Mr.di || 0) - e * .006 - s * .008 - Math.max(0, (qbv - 15) * .0008) + (hurry ? .012 : 0));
  const pc = clamp(RF.cmp + (Mr.dc || 0) + e * .035 + acc + (cat === 'pa' ? paBonus(off) : 0) + clamp(s * .05, -.1, .12) - (hurry ? .1 : 0) + extra, .1, .95);
  return { pint, pc, Mr, RF, cat };
}
function resolve(oK, dK){
  const off = G.poss, def = opp(off), OT = TM(off), DT = TM(def), P = OFF[oK], rp = repOf(off, oK), M = keyed(modOf(oK, dK), rp);
  const e = edgeOf(off, P), y0 = ytg(), back = 100 - y0, pd = G.plan[def].d;
  const qb = (OT.qb[0] || ['the quarterback'])[0], dst = (DT.dst[0] || ['the defense'])[0];
  const R = { oK, dK, off, def, fm:P.fm, kind:'', yards:0, td:false, qb, dst, callE:callEdge(M), P, keyed:rp, side:G.flip ? -1 : 1 };
  if (P.k === 'run'){
    const [carrier] = oK === 'sneak' ? [qb] : pickRB(OT);
    const s0 = R.side, gv0 = s0 * ({ Q:0, A:9, B:24, C:42, E:115 }[P.gap || 'A']);
    const blk = runBlock(off, oK, dK, M, gv0); R.blk = blk; R.side = s0;
    let y = P.m + (M.dm || 0) + e * 1.1 + gauss() * P.sd * .85 + blk.shift + (pd === 'bend' ? .4 : 0);
    if (P.loss && rnd() < P.loss * (blk.res === 'stuff' ? 2.2 : blk.res === 'open' ? .3 : 1) - e * .01 + ((M.dm || 0) < 0 ? .05 : 0)) y = -ri(1, 4);
    if (rnd() < P.big + (M.db || 0) + e * .012 + (pd === 'agg' ? .02 : 0)) y += ri(10, 48);
    y = Math.round(y);
    R.carrier = carrier; R.cIdx = oK === 'sneak' ? 6 : 7;
    if (rnd() < P.fum * (1 - e * .15)){ R.kind = 'fum'; y = clamp(Math.round(y * .6), -3, y0 - 1); }
    else R.kind = 'run';
    if (y >= y0 && R.kind === 'run'){ y = y0; R.td = true; }
    if (y <= -back){ y = -back; if (R.kind === 'run') R.safety = true; }
    R.yards = y; R.oob = oK === 'sweep' && !R.td && rnd() < .32;
  } else {
    const rd = readField(OT, oK, dK, e), tg = { n:rd.n, idx:rd.idx };
    R.tgt = rd.n; R.tIdx = rd.idx; R.tPos = rd.pos; R.route = rd.route; R.read = rd.k; R.routes = rd.routes; R.open = rd.s; R.sep = rd.sc;
    const RF = RP[rd.route], cat = routeCat(P, rd.route), Mr = keyed(modOf(oK, dK, cat), rp);
    R.depth = cat === 'pa' ? 'pa' : RF.d; R.e = e; R.rp = rp;
    // the longer he holds it going through his reads, the more time the rush gets
    // keeping a tight end or back in to block buys the QB time; sending an extra man out costs some
    const PR = passRush(off, oK, dK, RF, rd.k, rp); R.rush = PR;
    // a QB with time to spare can still slip a rusher now and then; sometimes he just throws it away
    const escaped = PR.sack && rnd() < .3;
    if (PR.sack && escaped){ R.kind = 'inc'; R.away = true; R.air = 0; }
    else if (PR.sack){
      R.kind = 'sack'; let y = -ri(4, 9); if (y <= -back){ y = -back; R.safety = true; } R.yards = y;
    } else {
      const { pint, pc } = passOdds(oK, dK, off, rd.route, rd.s, PR.hurry, rp, e);
      const scr = RF.d === 'screen';
      let air = Math.round(clamp(RF.m + (Mr.dm || 0) * .4 + gauss() * RF.sd, scr ? -4 : rd.route === 'swing' ? -2 : rd.route === 'check' || rd.route === 'flat' ? -1 : 1, 62));
      if (air >= y0) air = y0 + (scr ? 0 : ri(1, 6));
      if (scr && air >= y0) air = y0 - 1;
      R.air = air;
      const r = rnd();
      if (r < pint){
        R.kind = 'int';
        if (air >= y0){ R.ret = 0; R.tb = true; }
        else { let ret = ri(0, 22) + (rnd() < .07 ? ri(30, 70) : 0); if (air - ret <= -back){ ret = air + back; R.pick6 = true; } R.ret = ret; }
      } else if (r < pint + pc){
        let yac = Math.max(0, RF.yac + (Mr.dy || 0) + e * .6 + gauss() * RF.yac * .8);
        if (rnd() < .05 + (Mr.db || 0) + e * .01 + (pd === 'agg' ? .015 : 0)) yac += ri(8, 40);
        let y = Math.round(air + yac); R.kind = 'cmp';
        if (air >= y0 || y >= y0){ y = y0; R.td = true; }
        if (y <= -back){ y = -back + 1; }
        R.yards = y; R.yac = Math.max(0, y - Math.min(air, y0));
        if (!R.td && rnd() < .006){ R.kind = 'fum'; R.carrier = tg.n; R.cIdx = tg.idx; }
        R.oob = !R.td && rd.route !== 'go' && rnd() < .22;
      } else R.kind = 'inc';
    }
  }
  return R;
}

/* ---------------- the line of scrimmage ----------------
   Pass protection: each rusher gets a time to beat his block (better line vs worse front = longer). Extra blockers
   double-team the best rushers; more rushers than blockers means someone comes free. The first man home sets the
   pressure time; if that's before the throw, it's a sack (or a throwaway when the QB slips it), close behind it is a hurried throw. */
const logn = s => Math.exp(gauss() * s);
function passRush(off, oK, dK, RF, read, rp){
  const P = OFF[oK], Dd = DFORM[dK] || DFORM.base, pd = G.plan[opp(off)].d;
  const edge = (unitR(off, 'pass') - defR(opp(off))) / 10;
  const tree = playTree(oK, G.hot), hot = G.hot || {};
  // who rushes: the four down linemen, plus linebackers on a blitz; prevent drops a lineman
  const rush = dK === 'blitz' ? [0, 1, 2, 3, 4, 6] : dK === 'prev' ? [0, 1, 3] : dK === 'gl' ? [0, 1, 2, 3, 5] : [0, 1, 2, 3];
  // who blocks: five linemen, plus the tight end and back when they're not out on a route
  let blockers = 5 + (tree[5] ? 0 : 1) + (tree[7] ? 0 : 1) + (P.fm === 'i' && !tree[10] ? 1 : 0);
  if (P.cat === 'screen') blockers = 5;
  const R = rush.map(i => {
    const lb = i >= 4, edgeMan = i === 0 || i === 3;
    const t = (lb ? 5.2 : 4.4) * Math.exp(edge * .2) * logn(.48) * (pd === 'agg' ? .9 : pd === 'bend' ? 1.06 : 1) * (1 - rp * .06);
    return { i, t, travel:edgeMan ? .5 : lb ? .45 : .35 };
  }).sort((a, b) => a.t - b.t);
  const extra = blockers - R.length;
  if (extra > 0) for (let j = 0; j < Math.min(extra, R.length); j++) R[j].t *= 1.7;          // double teams on the best rushers
  else for (let j = 0; j < -extra; j++){
    const f = R[R.length - 1 - j];
    // a back running a check-down or swing looks for blitzers first and picks one up about half the time
    if (j === 0 && ['check', 'swing'].includes(tree[7]) && rnd() < .5){ f.t *= 1.2; continue; }
    f.t = 1.0 + rnd() * .6 + (oK === 'boot' ? .5 : 0); f.free = true;   // nobody picked him up (a bootleg rolls away from him)
  }
  // play action and bootlegs move the launch point; screens let them in on purpose
  const move = P.cat === 'pa' ? (oK === 'boot' ? .45 : .25) : 0;
  const arr = R.map(r => ({ ...r, at:r.t + r.travel + move })).sort((a, b) => a.at - b.at)[0];
  let throwT = (RF.d === 'screen' ? .85 : RF.m <= 2 ? 1.15 : RF.m <= 6 ? 1.55 : RF.m <= 12 ? 2.1 : 2.6) + .28 * read + (oK === 'boot' ? .15 : P.cat === 'pa' ? .45 : 0);
  // an unblocked rusher: the QB sees it and gets the ball out hot (hurried) if he can
  if (arr.free) throwT = Math.min(throwT, 1.0 + .12 * read);
  return { who:arr.i, at:arr.at, free:!!arr.free, throwT, sack:arr.at < throwT && (P.cat !== 'screen' || rnd() < .4), hurry:arr.at < throwT + .4 };
}
/* Run blocking: the two blocks at the point of attack. Win both and the hole is wide open; lose both and a lineman
   is in the backfield. It changes the spread of results, not the average, so ratings and the call still decide that. */
function runBlock(off, oK, dK, M, gv){
  if (oK === 'sneak') return { res:'mid', shift:0, pen:[] };
  const p = clamp(1 / (1 + Math.exp(-((unitR(off, 'run') - defR(opp(off))) / 9 + (M.dm || 0) * .18))) , .2, .85);
  const Dd = DFORM[dK] || DFORM.base, near = [0, 1, 2, 3].sort((a, b) => Math.abs(Dd[a][1] - gv) - Math.abs(Dd[b][1] - gv)).slice(0, 2);
  const w = near.map(() => rnd() < p), wins = w.filter(Boolean).length;
  const gain = { 2:2.2, 1:0, 0:-3 }, E = p * p * 2.2 - (1 - p) * (1 - p) * 3;
  return { res:wins === 2 ? 'open' : wins === 1 ? 'mid' : 'stuff', shift:gain[wins] - E, pen:near.filter((_, j) => !w[j]) };
}

/* ---------------- choreography: positions over time, in the offense's frame ---------------- */
// u = yards downfield from the line of scrimmage (px, 10 per yard), v = across the field
function kf(keys){
  return t => {
    if (t <= keys[0][0]) return [keys[0][1], keys[0][2], keys[0][3] || 0];
    for (let i = 1; i < keys.length; i++){ const b = keys[i]; if (t <= b[0]){ const a = keys[i - 1], k = (t - a[0]) / ((b[0] - a[0]) || 1); return [lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3] || 0, b[3] || 0, k)]; } }
    const l = keys[keys.length - 1]; return [l[1], l[2], l[3] || 0];
  };
}
const at = (f, t) => f(t);
/* Run a path at a real speed: v px/s over a play of `dur` seconds, a quick burst off the line, and past the end of
   the drawn path keep going the same way (or pull up, for blocks). `hold` parks him at a spot until a moment (a
   receiver who beats the ball to his spot settles there and waits for it). */
function paced(f, v, dur, opt = {}){
  const N = 90, P = [], A = [0];
  for (let j = 0; j <= N; j++){ P.push(f(j / N)); if (j) A.push(A[j - 1] + Math.hypot(P[j][0] - P[j - 1][0], P[j][1] - P[j - 1][1])); }
  const L = A[N];
  const pos = s => {
    if (s <= 0) return [P[0][0], P[0][1], 0];
    if (s >= L){
      if (opt.stop || L < 1) return [P[N][0], P[N][1], 0];
      let a = N - 1; while (a > 0 && Math.hypot(P[N][0] - P[a][0], P[N][1] - P[a][1]) < 4) a--;
      const dx = P[N][0] - P[a][0], dy = P[N][1] - P[a][1], d = Math.hypot(dx, dy) || 1, ex = s - L;
      return [P[N][0] + dx / d * ex, clamp(P[N][1] + dy / d * ex, -255, 255), 0];
    }
    let lo = 0, hi = N; while (hi - lo > 1){ const m = (lo + hi) >> 1; if (A[m] < s) lo = m; else hi = m; }
    const k = (s - A[lo]) / ((A[hi] - A[lo]) || 1);
    return [lerp(P[lo][0], P[hi][0], k), lerp(P[lo][1], P[hi][1], k), 0];
  };
  const r = .28, dist = ts => ts <= 0 ? 0 : ts < r ? v * ts * ts / (2 * r) : v * (ts - r / 2);
  const H = opt.hold;
  return t => {
    let s = dist(t * dur);
    if (H){ if (t < H.until) s = Math.min(s, H.s); else s = Math.max(H.s, dist(t * dur) - Math.max(0, dist(H.until * dur) - H.s)); }
    return pos(s);
  };
}
const arcTo = (f, t1) => { let s = 0, p = f(0); for (let j = 1; j <= 60; j++){ const q = f(t1 * j / 60); s += Math.hypot(q[0] - p[0], q[1] - p[1]); p = q; } return s; };
const freeze = (f, tf) => t => f(Math.min(t, tf));
const chase = (pre, t0, tgt, t1) => t => { if (t <= t0) return pre(t); const p = pre(t0), k = clamp((t - t0) / ((t1 - t0) || 1), 0, 1); return [lerp(p[0], tgt[0], k), lerp(p[1], tgt[1], k), 0]; };
const hop = (f, t0) => t => { const p = f(t); if (t > t0){ p[2] = Math.abs(Math.sin((t - t0) / (1 - t0) * Math.PI * 2)) * 11; } return p; };
const carried = f => t => { const p = f(t); return [p[0] + 3, p[1] + 3, p[2] + 7]; };
const arc = (from, tA, to, tB, peak, zEnd) => t => { const a = from(tA), k = clamp((t - tA) / (tB - tA), 0, 1); return [lerp(a[0], to[0], k), lerp(a[1], to[1], k), lerp(a[2], zEnd == null ? 7 : zEnd, k) + peak * 4 * k * (1 - k)]; };
const seq = list => t => { for (const [tt, f] of list) if (t <= tt) return f(t); return list[list.length - 1][1](t); };
function offForm(fm){
  const b = [[-8,0],[-8,-16],[-8,16],[-8,-32],[-8,32],[-8,48]];
  if (fm === 'punt') return [...b, [-140,0], [-60,0], [-10,-200], [-10,200], [-8,-48]];
  if (fm === 'fg') return [...b, [-70,0], [-92,-16], [-10,-64], [-10,64], [-8,-48]];
  let qb, rb, sl = [-12,-115];
  if (fm === 'gun'){ qb = [-50,0]; rb = [-50,18]; }
  else if (fm === 'i'){ qb = [-16,0]; rb = [-72,0]; sl = [-42,0]; }
  else if (fm === 'jumbo'){ qb = [-16,0]; rb = [-60,0]; sl = [-8,-48]; }
  else { qb = [-16,0]; rb = [-62,0]; }
  return [...b, qb, rb, [-10,-190], [-10,190], sl];
}
const DFORM = {
  base:  [[10,-30],[10,-10],[10,10],[10,30],[48,-40],[45,0],[48,40],[14,-190],[14,190],[115,-80],[115,80]],
  c2:    [[10,-30],[10,-10],[10,10],[10,30],[50,-50],[48,0],[50,50],[10,-190],[10,190],[150,-110],[150,110]],
  c3:    [[10,-30],[10,-10],[10,10],[10,30],[45,-45],[45,0],[45,45],[75,-180],[75,180],[165,0],[60,115]],
  blitz: [[10,-30],[10,-10],[10,10],[10,30],[20,-24],[18,4],[20,30],[8,-190],[8,190],[120,0],[40,60]],
  gl:    [[8,-30],[8,-10],[8,10],[8,30],[24,-40],[22,0],[24,40],[10,-150],[10,150],[38,-70],[38,70]],
  prev:  [[10,-30],[10,-10],[10,10],[10,30],[85,-60],[80,0],[85,60],[130,-170],[130,170],[230,-90],[230,90]],
  punt:  [[10,-30],[10,-10],[10,10],[10,30],[30,-50],[30,0],[30,50],[12,-200],[12,200],[420,0],[140,0]],
  fg:    [[8,-30],[8,-10],[8,10],[8,30],[10,-46],[14,0],[10,46],[10,-70],[10,70],[40,-30],[40,30]]
};
function forms(oFm, dFm, y0){
  const maxU = y0 * 10 + 92, minU = -(100 - y0) * 10 - 92;
  const fl = G && G.flip && !['punt', 'fg'].includes(oFm) ? -1 : 1;
  const O = offForm(oFm).map(([u, v]) => [Math.max(u, minU), v * fl]);
  const Dd = DFORM[dFm].map(([u, v]) => [Math.min(u, maxU), v]);
  return { O, Dd };
}
// defenders close on a point
function converge(Dd, pre, t0, T, t1, opts = {}){
  let best = -1, bd = 1e9;
  if (!opts.noTackle) Dd.forEach((s, i) => { const p = pre[i](t0), d = Math.hypot(T[0] - p[0], T[1] - p[1]); if (d < bd){ bd = d; best = i; } });
  const out = Dd.map((s, i) => {
    const p = pre[i](t0), dist = Math.hypot(T[0] - p[0], T[1] - p[1]);
    const ring = [Math.cos(i * 2.17) * 18, Math.sin(i * 2.17) * 18];
    let tgt;
    if (i === best) tgt = [T[0] + 7, T[1] + 3];
    else { const reach = clamp(1.05 - dist / (opts.far || 650), opts.lo || .4, .93); tgt = [lerp(p[0], T[0] + ring[0], reach), lerp(p[1], T[1] + ring[1], reach)]; }
    return chase(pre[i], t0, tgt, t1);
  });
  out.best = best;
  return out;
}
let PASS_SCALE = 1;
// a route as keyframes for a player starting at S0, running to depth D (px downfield); tTh/tC are the throw and catch times
function routeKeysFor(S0, type, D, tTh, tC, sgo){
  const u0 = S0[0], v0 = S0[1], sg = sgo || (v0 >= 0 ? 1 : -1);
  switch (type){
    case 'go':    return [[0, u0, v0], [tC, D, v0 * .9], [1, D + 90, v0 * .88]];
    case 'seam':  return [[0, u0, v0], [tC, D, v0 * .8 - sg * 10], [1, D + 80, v0 * .75]];
    case 'slant': return [[0, u0, v0], [tTh * .45, u0 + 28, v0], [tC, D, v0 * .5], [1, D + 60, v0 * .2]];
    case 'post':  return [[0, u0, v0], [tTh * .7, D * .55, v0], [tC, D, v0 * .35], [1, D + 70, v0 * .1]];
    case 'dig':   return [[0, u0, v0], [tTh * .75, D, v0], [tC, D, v0 * .3], [1, D, -v0 * .1]];
    case 'out':   return [[0, u0, v0], [tTh * .75, D, v0], [tC, D, clamp(v0 * 1.15 + sg * 40, -245, 245)], [1, D, clamp(v0 * 1.2 + sg * 70, -250, 250)]];
    case 'curl':  return [[0, u0, v0], [tC * .8, D + 22, v0 * .9], [tC, D, v0 * .9], [1, D - 4, v0 * .9]];
    case 'check': return [[0, u0, v0], [tTh * .6, u0 + 12, sg * 55], [tC, D, sg * 85], [1, D + 15, sg * 95]];
    case 'screen':return [[0, u0, v0], [.18, -32, sg * 45], [tC, Math.min(D, -12), sg * 95], [1, Math.min(D, -12) + 10, sg * 100]];
    case 'flat':  return [[0, u0, v0], [tTh * .45, Math.max(u0 + 14, Math.min(D, 20)), v0], [tC, D, clamp(v0 + sg * 70, -250, 250)], [1, D + 4, clamp(v0 + sg * 100, -255, 255)]];
    case 'drag':  return [[0, u0, v0], [tTh * .3, u0 + 28, v0 * .95], [tC, D, -sg * 40], [1, D + 6, -sg * 170]];
    case 'comeback': return [[0, u0, v0], [tC * .8, D + 40, v0], [tC, D, clamp(v0 + sg * 26, -250, 250)], [1, D - 6, clamp(v0 + sg * 32, -252, 252)]];
    case 'corner':return [[0, u0, v0], [tTh * .7, D * .55, v0], [tC, D, clamp(v0 + sg * 95, -250, 250)], [1, D + 60, clamp(v0 + sg * 135, -255, 255)]];
    case 'swing': return [[0, u0, v0], [tC, Math.min(D, 0) + 6, sg * 115], [1, Math.min(D, 0) + 20, sg * 145]];
    case 'angle': return [[0, u0, v0], [tTh * .5, u0 + 10, sg * 45], [tC, D, sg * 10], [1, D + 30, -sg * 25]];
    case 'wheel': return [[0, u0, v0], [tTh * .45, u0 + 10, sg * 110], [tC, D, sg * 150], [1, D + 80, sg * 158]];
    case 'block': return [[0, u0, v0], [.3, u0 - 6, v0], [1, u0 - 8, v0]];
  }
  return [[0, u0, v0]];
}
// re-time a route so the runner covers it at an even speed up to the catch (no sprint-then-crawl)
const defDepth = r => r === 'check' ? 20 : r === 'drag' ? 40 : r === 'flat' ? 20 : r === 'swing' ? 0 : r === 'block' ? 0 : RP[r].m * 10;
function retime(keys, tC){
  const pre = keys.filter(k => k[0] <= tC + 1e-6); if (pre.length < 2) return keys;
  const cum = [0]; for (let i = 1; i < pre.length; i++) cum.push(cum[i - 1] + Math.hypot(pre[i][1] - pre[i - 1][1], pre[i][2] - pre[i - 1][2]));
  const L = cum[cum.length - 1] || 1, out = pre.map((k, i) => [i === 0 ? 0 : tC * cum[i] / L, k[1], k[2]]);
  out[out.length - 1][0] = tC;
  return out.concat(keys.filter(k => k[0] > tC + 1e-6));
}
const pathLen = (keys, t1) => { let L = 0; for (let i = 1; i < keys.length && keys[i - 1][0] < t1; i++) L += Math.hypot(keys[i][1] - keys[i - 1][1], keys[i][2] - keys[i - 1][2]); return L; };
function choreo(R){
  const y0 = ytg(), Y = R.yards * 10;
  const { O, Dd } = forms(R.fm, R.dK, y0);
  const of = [], df = [];
  let ball, dur = 3, focus, hero = [], tk = -1, live = null, PX = null; PASS_SCALE = 1;
  const s = R.side || 1;
  const ol = i => kf([[0, O[i][0], O[i][1]], [.25, O[i][0] + 6, O[i][1]], [1, O[i][0] + 12, O[i][1] * 1.05]]);
  const olPass = i => kf([[0, O[i][0], O[i][1]], [.3, O[i][0] - 12, O[i][1] * 1.1], [1, O[i][0] - 16, O[i][1] * 1.15]]);
  const goRoute = i => kf([[0, O[i][0], O[i][1]], [.5, O[i][0] + 120, O[i][1] * .92], [1, O[i][0] + 175, O[i][1] * .9]]);
  if (R.P.k === 'run'){
    const big = Math.abs(R.yards) > 12;
    // every run has a hole: A gap (center-guard), B (guard-tackle), C (off tackle) or the edge
    const k0 = R.oK, sweep = k0 === 'sweep', sneak = k0 === 'sneak', draw = k0 === 'draw', counter = k0 === 'counter', power = k0 === 'power';
    const gapV = { Q:0, A:9, B:24, C:42, E:115 }[R.P.gap || 'A'], gv = s * gapV;
    const endV = sweep ? s * (125 + rnd() * 30) : gv + s * (rnd() * 18 - 4);
    const T = [R.td ? y0 * 10 + 30 : Y, big ? endV * .6 : endV];
    const ci0 = R.cIdx, P0 = O[ci0], v = speeds(G.poss, {})[ci0] * .92, dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    const H = sneak ? [-4, 0] : sweep ? [-38, s * 30] : draw ? [-56, s * 5] : counter ? [-30, s * 2] : power ? [-34, s * 14] : [-28, s * 4];
    const W = counter ? [-46, -s * 16] : null;   // counter: jab the wrong way first
    const M = sneak ? [0, 0] : sweep ? [Y < 0 ? -30 : -12, s * 115] : [Y < 0 ? -6 : 0, gv];
    // seconds: take the handoff, hit the hole, then run to the tackle at his own speed
    const sW = W ? Math.max(.25, dist(P0, W) / v) : 0;
    const sH = Math.max(sneak ? .3 : draw ? .85 : W ? sW + .3 : .45, sW + dist(W || P0, H) / v), sM = sH + Math.max(.18, dist(H, M) / v), sT = sM + Math.max(.2, dist(M, T) / v);
    dur = sT + (R.td ? 1 : R.kind === 'fum' ? 1 : .55);
    const tW = sW / dur, tH = sH / dur, tM = sM / dur, tT = sT / dur;
    let C = kf([[0, P0[0], P0[1]], ...(W ? [[tW, W[0], W[1]]] : draw ? [[tH * .6, P0[0], P0[1]]] : []), [tH, H[0], H[1]], [tM, M[0], M[1]], [tT, T[0], T[1]]]);
    // the line opens the hole: everyone blocks his man away from it; on power and counter the backside guard pulls through it
    const pen = (R.blk && R.blk.pen) || [];
    const away = p => Math.sign(p[1] - gv) || -s, puller = (power || counter) ? [1, 2].find(i => Math.sign(O[i][1]) === -s) : -1;
    const olRun = i => {
      const p = O[i], a = away(p);
      if (i === puller) return kf([[0, p[0], p[1]], [tH * .75, -16, p[1] * .4], [tM, 2, gv - s * 6], [1, 14, gv + s * 4]]);
      if (draw) return kf([[0, p[0], p[1]], [tH * .7, p[0] - 10, p[1] * 1.05], [tM, p[0] - 2, p[1] + a * 6], [1, p[0] + 4, p[1] + a * 10]]);
      return kf([[0, p[0], p[1]], [.25, p[0] + 6, p[1] + a * 4], [tM, p[0] + 10, p[1] + a * 9], [1, p[0] + 12, p[1] + a * 11]]);
    };
    if (R.td) C = hop(C, tT);
    const fum = R.kind === 'fum', tF = lerp(tM, tT, .6);
    if (fum) C = freeze(C, tF);
    const ci = R.cIdx;
    for (let i = 0; i < 11; i++){
      if (i === ci){ of[i] = C; continue; }
      if (i <= 5) of[i] = sneak ? ol(i) : olRun(i);
      else if (i === 6 && draw) of[i] = kf([[0, O[6][0], O[6][1]], [tH, -60, s * 2], [1, -66, -s * 6]]);
      else if (i === 6) of[i] = kf([[0, O[6][0], O[6][1]], [tH, -26, s * 6], [Math.min(.9, tH + .2), -36, -s * 12], [1, -38, -s * 14]]);
      else if (i === 7) of[i] = kf([[0, O[7][0], O[7][1]], [tM, -20, 0], [1, -14, 0]]);
      else if (i === 10 && R.fm === 'i') of[i] = kf([[0, O[10][0], O[10][1]], [tM * .8, -2, sweep ? s * 20 : gv], [1, 8, sweep ? s * 24 : gv + s * 6]]);
      else of[i] = paced(kf([[0, O[i][0], O[i][1]], [.5, O[i][0] + 70, O[i][1] * .9], [1, O[i][0] + 90, O[i][1] * .85]]), speeds(G.poss, {})[i] * .75, dur, { stop:true });
    }
    const pre = Dd.map((p, i) => {
      // linemen get driven away from the hole; linebackers and DBs flow to the ball
      if (i < 4 && !sneak && pen.includes(i)) return kf([[0, p[0], p[1]], [tH * .8, p[0] - 6, lerp(p[1], gv, .4)], [tM, -8, lerp(p[1], gv, .85)]]);
      if (i < 4 && !sneak){ const a = away(p); return kf([[0, p[0], p[1]], [tH * .8, p[0] + 2, p[1] + a * 5], [tM, p[0] + 8, p[1] + a * 16]]); }
      const tgt = C(tM); return kf([[0, p[0], p[1]], [tH * .8, p[0] + (i < 4 ? -3 : -6), p[1]], [tM, lerp(p[0], tgt[0], .35), lerp(p[1], tgt[1], .35)]]); });
    if (fum){
      const L = [at(C, tF)[0] + 18, at(C, tF)[1] + (rnd() < .5 ? -14 : 14)];
      const dv = converge(Dd, pre, tM, L, Math.min(.95, tF + .3)); tk = dv.best; hero = [ci];
      for (let i = 0; i < 11; i++) df[i] = dv[i];
      R.yards = Math.round(L[0] / 10); R.fumSpot = L;
      const carriedB = carried(i => (ci === 6 && i < tH) ? of[6](i) : (i < tH ? of[6](i) : C(i)));
      ball = seq([[tF, carriedB], [tF + .14, arc(carriedB, tF, [L[0], L[1]], tF + .14, 16, 2)], [1, () => [L[0], L[1], 2]]]);
    } else {
      const dv = converge(Dd, pre, tM, T, tT, R.td ? { noTackle:true, lo:.3, far:500 } : {}); tk = dv.best; hero = [ci];
      for (let i = 0; i < 11; i++) df[i] = R.td ? freeze(dv[i], tT) : dv[i];
      // anything past a short gain is played out live from the hole
      if (R.kind === 'run' && !R.safety && R.oK !== 'sneak' && R.yards >= 2){ live = { ci, t0:tM, target:R.yards, run:true, lane:sweep ? null : gv, who:R.carrier, pen }; for (let i = 0; i < 11; i++) df[i] = pre[i]; tk = -1; }
      if (ci === 6) ball = carried(C);
      else if (sweep) ball = seq([[tH - .04, carried(of[6])], [tH + .05, arc(carried(of[6]), tH - .04, at(C, tH + .05), tH + .05, 10)], [1, carried(C)]]);
      else ball = seq([[tH, carried(of[6])], [1, carried(C)]]);
    }
    focus = ball;
  } else {
    const dcls = R.depth || R.P.depth;
    const base = { short:[.36, .15], deep:[.44, .26], pa:[.5, .22], screen:[.3, .1] }[dcls] || [.36, .15];
    // a later read means the QB held it longer before letting it go
    const timing = [Math.min(.62, base[0] + .07 * (R.read || 0)), base[1]];
    const tTh = timing[0], tC = tTh + timing[1];
    const gun = R.fm === 'gun';
    let QB = gun ? kf([[0, O[6][0], 0], [.22, O[6][0] - 10, 0], [1, O[6][0] - 12, 0]])
      : R.oK === 'pa' ? kf([[0, O[6][0], 0], [.16, -30, 6], [.36, -56, -4], [1, -58, -4]])
      : kf([[0, O[6][0], 0], [.28, -52, 0], [1, -54, 0]]);
    const ti = R.tIdx == null ? 8 : R.tIdx, tree = R.routes || {};
    const air = (R.air != null ? R.air : 8) * 10;
    const routeKeys = (i, type, D) => retime(routeKeysFor(O[i], type, D, tTh, tC, i === 7 ? s : 0), tC);
    const rKeys = routeKeys(ti, R.route || 'go', air), RCV0 = kf(rKeys);
    const Cp = RCV0(tC).slice(0, 2);
    // the ball comes out when the receiver can actually get there at his own speed: no slow motion
    let Db = 2.6 + timing[1] * 2;
    const SPD = speeds(G.poss, {});
    const need = pathLen(rKeys, tC) / (SPD[ti] * .92);
    if (need > tC * Db) Db = need / tC;
    const Lc = arcTo(RCV0, tC);
    const RCV = paced(RCV0, SPD[ti] * .9, Db, { hold:{ s:Lc, until:tC } });
    for (let i = 0; i < 11; i++){
      if (i === 6) of[i] = QB;
      else if (i === ti) of[i] = RCV;
      else if (i <= 4) of[i] = olPass(i);
      else if (tree[i]) of[i] = paced(kf(routeKeys(i, tree[i], defDepth(tree[i]))), SPD[i] * .88, Db);
      else if (i === 7) of[i] = R.oK === 'pa' ? kf([[0, O[7][0], 0], [.16, -26, -4], [.4, -6, -10], [1, 0, -12]]) : kf([[0, O[7][0], O[7][1]], [.3, O[7][0] + 8, O[7][1] * .6 - 14], [1, O[7][0] + 10, -18]]);
      else if (i === 5 || i === 10) of[i] = kf([[0, O[i][0], O[i][1]], [.3, O[i][0] - 6, O[i][1]], [1, O[i][0] - 8, O[i][1]]]);
      else of[i] = paced(goRoute(i), SPD[i] * .85, Db);
    }
    // coverage
    const covOf = { 8:7, 9:8, 10:9, 5:6, 7:5 };
    const ci = covOf[ti] != null ? covOf[ti] : 9;
    // how open each receiver got decides how far his defender is: tight trail when covered, a step or three behind when he won
    const sepOf = i => clamp((i === ti ? R.open : (R.sep || {})[i]) ?? 0, -.5, 2.5);
    const mirror = (rc, d0, sep) => t => { const lagT = Math.max(0, t - (.05 + Math.max(0, sep) * .06)), p = rc(lagT), k = clamp(t / .2, 0, 1), ramp = clamp((t - .15) / .3, 0, 1);
      const back = (12 - Math.max(0, sep) * 16) * ramp + 12 * (1 - ramp), side = (p[1] > 0 ? -1 : 1) * (8 + Math.max(0, sep) * 14 * ramp);
      return [lerp(d0[0], p[0] + back, k), lerp(d0[1], p[1] + side, k), 0]; };
    // every man running a route has someone on him (blitzing linebackers aside)
    const covBy = {}; for (const r in covOf) covBy[covOf[r]] = +r;
    const pre = Dd.map((p, i) => {
      if (i === ci) return mirror(RCV, p, sepOf(ti));
      const cr = covBy[i];
      if (cr != null && cr !== ti && tree[cr] && !(R.dK === 'blitz' && (i === 4 || i === 6))) return mirror(of[cr], p, sepOf(cr));
      if (i <= 3) return kf([[0, p[0], p[1]], [.3, -4, p[1] * .9], [1, -18, p[1] * .7]]);
      if (R.dK === 'blitz' && (i === 4 || i === 6)) return kf([[0, p[0], p[1]], [.4, -30, p[1] * .4], [1, -44, p[1] * .2]]);
      return kf([[0, p[0], p[1]], [.4, p[0] + (i <= 6 ? 32 : 16), p[1] * .95], [1, p[0] + (i <= 6 ? 40 : 22), p[1] * .95]]);
    });
    const px = { QB, of0:of.slice(), pre, Db, tTh, tC, ci, covOf, dcls, kLimit:tTh };
    if (R.kind === 'sack'){
      const atS = R.rush ? R.rush.at : 1.1, dS = Math.max(2.5, atS + 1.2), tS = clamp(atS / dS, .22, .7), rIdx = R.rush ? R.rush.who : 1;
      const qp = at(QB, tS), dn = [Y, qp[1] + 4];
      const QB2 = t => t <= tS ? QB(t) : (k => [lerp(qp[0], dn[0], k), lerp(qp[1], dn[1], k), 0])(clamp((t - tS) / .14, 0, 1));
      of[6] = QB2;
      for (let i = 0; i < 11; i++) if (i !== 6) of[i] = freeze(of[i], tS + .15);
      pre[rIdx] = t => t <= tS ? (k => { const d0 = Dd[rIdx]; return [lerp(d0[0], qp[0] + 6, k), lerp(d0[1], qp[1] + 4, k), 0]; })(clamp(t / tS, 0, 1)) : (p => [p[0] + 7, p[1] + 2, 0])(QB2(t));
      for (let i = 0; i < 11; i++) df[i] = i === rIdx ? pre[i] : freeze(pre[i], tS + .15);
      ball = carried(QB2); dur = dS; focus = ball; hero = [6, 11 + rIdx];
      px.kLimit = tS - .01; px.rIdx = rIdx; px.tS = tS;
    } else if (R.kind === 'inc'){
      const land = [Cp[0] + 26, Cp[1] + 6];
      for (let i = 0; i < 11; i++) of[i] = freeze(of[i], tC + .12);
      for (let i = 0; i < 11; i++) df[i] = freeze(pre[i], tC + .12);
      ball = seq([[tTh, carried(QB)], [tC + .05, arc(carried(QB), tTh, [land[0], land[1]], tC + .05, dcls === 'deep' ? 72 : dcls === 'pa' ? 58 : dcls === 'screen' ? 12 : 34, 1)], [1, () => [land[0] + 6, land[1], 1]]]);
      dur = Db; focus = t => ball(Math.min(t, tC));
    } else if (R.kind === 'int'){
      const ret = (R.ret || 0) * 10, Rt = [Cp[0] - ret, Cp[1] + (rnd() - .5) * 120], tE = R.tb ? tC + .05 : Math.min(.95, tC + .15 + R.ret * .012);
      const pc = pre[ci];
      const intr = t => t <= tC ? (k => { const p = pc(t), q = [Cp[0] + 4, Cp[1]]; return [lerp(p[0], q[0], k), lerp(p[1], q[1], k), 0]; })(clamp((t - (tC - .14)) / .14, 0, 1)) : (k => [lerp(Cp[0] + 4, Rt[0], k), lerp(Cp[1], Rt[1], k), 0])(clamp((t - tC) / (tE - tC), 0, 1));
      const INT = R.pick6 ? hop(intr, tE) : intr;
      px.kLimit = Math.min(px.kLimit, tC - .145);
      for (let i = 0; i < 11; i++) df[i] = i === ci ? INT : chase(pre[i], tC, [lerp(at(pre[i], tC)[0], Rt[0], .6), lerp(at(pre[i], tC)[1], Rt[1], .6)], tE);
      const opre = of.slice();
      const conv = converge(opre, opre.map(f => f), tC, Rt, tE, { noTackle:!!R.pick6 || R.tb });
      for (let i = 0; i < 11; i++) of[i] = conv[i];
      ball = seq([[tTh, carried(QB)], [tC, arc(carried(QB), tTh, [Cp[0], Cp[1]], tC, dcls === 'deep' ? 72 : 40)], [1, carried(INT)]]);
      dur = Db + .4 + R.ret * .04; focus = ball; hero = [11 + ci]; if (conv.best >= 0) hero.push(conv.best);
    } else {
      // completion (or a fumble after the catch)
      const T = [R.td ? Math.max(Cp[0], y0 * 10 + 25) : Y, Cp[1] + (rnd() - .5) * 90];
      // times here are in units of the pre-catch play (Db seconds); the whole play is rescaled at the end
      const yacS = Math.max(.3, Math.hypot(T[0] - Cp[0], T[1] - Cp[1]) / (speeds(G.poss, {})[ti] * .92));
      const tT = tC + yacS / Db;
      const isLive = R.kind === 'cmp';
      PASS_SCALE = isLive ? 1 : (tT * Db + (R.td ? 1 : .55)) / Db;
      let CAR = t => t <= tC ? RCV(t) : (k => [lerp(Cp[0], T[0], k), lerp(Cp[1], T[1], k), 0])(clamp((t - tC) / (tT - tC), 0, 1));
      if (R.td) CAR = hop(CAR, Math.max(tT, .8));
      const fum = R.kind === 'fum';
      if (fum) CAR = freeze(CAR, tT);
      of[ti] = CAR;
      const dv = converge(Dd, pre, tC, T, tT, R.td ? { noTackle:true, lo:.3, far:520 } : {}); tk = dv.best; hero = [ti];
      for (let i = 0; i < 11; i++) df[i] = dv[i];
      for (let i = 0; i < 11; i++) if (i !== ti) of[i] = freeze(of[i], tT);
      const pk = dcls === 'deep' ? 72 : dcls === 'pa' ? 58 : dcls === 'screen' ? 12 : 34;
      ball = seq([[tTh, carried(QB)], [tC, arc(carried(QB), tTh, [Cp[0], Cp[1]], tC, pk)], [1, carried(CAR)]]);
      if (fum){ const L = [T[0] + 14, T[1] + 10]; ball = seq([[tTh, carried(QB)], [tC, arc(carried(QB), tTh, [Cp[0], Cp[1]], tC, pk)], [tT, carried(CAR)], [tT + .1, arc(carried(CAR), tT, L, tT + .1, 14, 2)], [1, () => [L[0], L[1], 2]]]); R.yards = Math.round(L[0] / 10); }
      dur = Db * PASS_SCALE; focus = ball;
      // after the catch the receiver runs it live
      if (isLive){ live = { ci:ti, t0:tC, target:R.yards, who:R.tgt }; for (let i = 0; i < 11; i++) df[i] = pre[i]; of[ti] = RCV; tk = -1;
        ball = seq([[tTh, carried(QB)], [tC, arc(carried(QB), tTh, [Cp[0], Cp[1]], tC, pk)], [1, carried(RCV)]]); focus = ball; }
    }
    R.cp = Cp; R.tC = tC; PX = px;
  }
  if (PX) PX.scale = PASS_SCALE;
  if (PASS_SCALE !== 1){
    // stretch time so the post-catch run (built past 1.0) lands inside the play
    const k = PASS_SCALE, W = f => t => f(t * k);
    for (let i = 0; i < 11; i++){ of[i] = W(of[i]); df[i] = W(df[i]); }
    ball = W(ball); focus = W(focus); PASS_SCALE = 1;
  }
  return { dur, of, df, ball, focus, hero, tk, live, px:PX };
}
/* ---------------- throwing it yourself ----------------
   While the QB still has the ball, a throw key sends it to that receiver right then. The throw is decided again with
   the same odds as the QB's own read (route, separation, coverage, the QB, pressure), plus how far down the route he
   is: a quick throw before the route gets deep is an easier completion for fewer yards. Everything before the throw
   stays exactly as it was shown; the rest of the play is built from that moment on. */
function throwPlay(R, ch, th){
  const px = ch.px, sc = px.scale || 1, W = f => sc === 1 ? f : t => f(t * sc);
  const j = th.j, k = th.k, dur = th.dur, y0 = ytg(), route = R.routes[j];
  const QB = W(px.QB), of0 = px.of0.map(W), pre = px.pre.map(W), fj = of0[j];
  const who = skillPlayers(TM(R.off))[j];
  // the ball flies about 32 yards a second, plus the release: find where he'll be when it gets there
  const q = QB(k); let tc = k + .3 / dur;
  for (let n = 0; n < 5; n++){ const p = fj(tc); tc = k + (.22 + Math.hypot(p[0] - q[0], p[1] - q[1]) / 320) / dur; }
  tc = Math.min(tc, .9);
  const Cp = fj(tc).slice(0, 2);
  const air = Math.round(Cp[0] / 10), RF = RP[route];
  // a throw just before the rush gets home is a hurried one; getting it out early beats the pressure
  const hurry = R.kind === 'sack' || ((R.rush && R.rush.hurry) && k >= px.kLimit / sc - .06);
  const early = clamp((RF.m - air) * .007, -.08, .1);
  const { pint, pc, Mr } = passOdds(R.oK, R.dK, R.off, route, (R.sep || {})[j] ?? 0, hurry, R.rp || 0, R.e || 0, early);
  const outOfPlay = Math.abs(Cp[1]) > 258 || Cp[0] > y0 * 10 + 98;
  const pd = G.plan[R.def].d, e = R.e || 0;
  Object.assign(R, { tgt:who.n, tIdx:j, tPos:who.pos, route, air, open:(R.sep || {})[j] ?? 0, read:0, manual:true, away:false, safety:false, td:false, tb:false, pick6:false, ret:0, yac:0, oob:false });
  R.depth = routeCat(R.P, route) === 'pa' ? 'pa' : RF.d;
  const r = rnd();
  if (!outOfPlay && r < pint) R.kind = 'int';
  else if (!outOfPlay && r < pint + pc) R.kind = 'cmp';
  else R.kind = 'inc';
  if (R.kind === 'cmp'){
    let yac = Math.max(0, RF.yac + (Mr.dy || 0) + e * .6 + gauss() * RF.yac * .8);
    if (rnd() < .05 + (Mr.db || 0) + e * .01 + (pd === 'agg' ? .015 : 0)) yac += ri(8, 40);
    let y = Math.round(air + yac);
    if (air >= y0 || y >= y0){ y = y0; R.td = true; }
    R.yards = Math.max(y, -(100 - y0) + 1); R.yac = Math.max(0, R.yards - Math.min(air, y0));
  } else if (R.kind === 'int'){
    if (air >= y0){ R.ret = 0; R.tb = true; }
    else { let ret = ri(0, 22) + (rnd() < .07 ? ri(30, 70) : 0); if (air - ret <= -(100 - y0)){ ret = air + (100 - y0); R.pick6 = true; } R.ret = ret; }
    R.yards = 0;
  } else R.yards = 0;
  // the play from the throw on
  const dcls = R.depth, pk = dcls === 'deep' ? 72 : dcls === 'pa' ? 58 : dcls === 'screen' ? 12 : 34;
  const of = of0.slice(); of[6] = QB;
  const df = pre.slice();
  if (px.rIdx != null) df[px.rIdx] = freeze(df[px.rIdx], Math.max(k + .02, px.tS / sc - .005));   // he gets there just as it's out
  const toCp = arc(carried(QB), k, [Cp[0], Cp[1]], tc, pk);
  const out = { dur, of, df, focus:null, hero:[j], tk:-1, live:null };
  if (R.kind === 'cmp'){
    for (let i = 0; i < 11; i++) if (i !== j && i !== 6) of[i] = freeze(of[i], tc + .15);
    out.ball = seq([[k, carried(QB)], [tc, toCp], [1, carried(fj)]]);
    out.live = { ci:j, t0:tc, target:R.yards, who:R.tgt };
  } else if (R.kind === 'inc'){
    const land = [Cp[0] + 26, Cp[1] + 6];
    for (let i = 0; i < 11; i++){ of[i] = freeze(of[i], tc + .12); df[i] = freeze(df[i], tc + .12); }
    out.ball = seq([[k, carried(QB)], [tc + .05, arc(carried(QB), k, [land[0], land[1]], tc + .05, pk, 1)], [1, () => [land[0] + 6, land[1], 1]]]);
    out.endK = Math.min(1, tc + .3); out.hero = [];
  } else {
    const ci = px.covOf[j] != null ? px.covOf[j] : 9, ret = R.ret * 10, Rt = [Cp[0] - ret, Cp[1] + (rnd() - .5) * 120];
    const tE = R.tb ? tc + .05 : Math.min(.95, tc + .15 + R.ret * .012), pc0 = pre[ci];
    const tj = Math.max(k, tc - .14);   // he breaks on it once it's in the air
    const intr = t => t <= tc ? (kk => { const p = pc0(t), qq = [Cp[0] + 4, Cp[1]]; return [lerp(p[0], qq[0], kk), lerp(p[1], qq[1], kk), 0]; })(clamp((t - tj) / ((tc - tj) || 1), 0, 1)) : (kk => [lerp(Cp[0] + 4, Rt[0], kk), lerp(Cp[1], Rt[1], kk), 0])(clamp((t - tc) / ((tE - tc) || 1), 0, 1));
    const INT = R.pick6 ? hop(intr, tE) : intr;
    for (let i = 0; i < 11; i++) if (i !== ci){ const pi = df[i]; df[i] = chase(pi, tc, [lerp(at(pi, tc)[0], Rt[0], .6), lerp(at(pi, tc)[1], Rt[1], .6)], tE); }
    df[ci] = INT;
    const conv = converge(of, of.slice(), tc, Rt, tE, { noTackle:!!R.pick6 || R.tb });
    for (let i = 0; i < 11; i++) of[i] = conv[i];
    out.ball = seq([[k, carried(QB)], [tc, toCp], [1, carried(INT)]]);
    out.hero = [11 + ci]; if (conv.best >= 0) out.hero.push(conv.best);
    out.endK = Math.min(1, tE + .06);
  }
  out.focus = out.ball;
  R.cp = Cp; R.tC = tc;
  return out;
}
function choreoPunt(P){
  const y0 = ytg(), { O, Dd } = forms('punt', 'punt', y0);
  const land = [P.land * 10, (rnd() - .5) * 120], Rt = [land[0] - P.ret * 10, land[1] + (rnd() - .5) * 140];
  Dd[9] = [Math.min(P.land * 10 + 40, y0 * 10 + 60), 0];
  const of = [], df = [];
  for (let i = 0; i < 11; i++){
    if (i === 6) of[i] = kf([[0, O[6][0], 0], [.24, O[6][0] + 8, 0], [1, O[6][0] + 20, 0]]);
    else if (i === 8 || i === 9) of[i] = kf([[0, O[i][0], O[i][1]], [.72, land[0] - 70, O[i][1] * .35], [.96, Rt[0] + 10, Rt[1] + (i === 8 ? -14 : 14)]]);
    else of[i] = kf([[0, O[i][0], O[i][1]], [.3, O[i][0] + 40, O[i][1]], [.96, lerp(O[i][0], Rt[0], .7), lerp(O[i][1], Rt[1], .5)]]);
  }
  for (let i = 0; i < 11; i++){
    if (i === 9) df[i] = P.tb ? kf([[0, Dd[9][0], 0], [.7, land[0] + 30, land[1] * .5]]) : kf([[0, Dd[9][0], 0], [.68, land[0], land[1]], [.72, land[0], land[1]], [.96, Rt[0], Rt[1]]]);
    else if (i <= 3) df[i] = kf([[0, Dd[i][0], Dd[i][1]], [.25, -50, Dd[i][1] * .6], [1, -40, Dd[i][1] * .5]]);
    else df[i] = kf([[0, Dd[i][0], Dd[i][1]], [.7, Dd[i][0] + 160, Dd[i][1] * .7], [1, lerp(Dd[i][0] + 160, Rt[0], .4), Dd[i][1] * .6]]);
  }
  const snap = arc(() => [-8, 0, 3], 0, [O[6][0] + 2, 0], .12, 6, 7);
  const kick = arc(() => [O[6][0] + 8, 0, 7], .26, land, .72, 150, P.tb ? 0 : 8);
  const ball = seq([[.12, snap], [.26, () => [O[6][0] + 4, 0, 7]], [.72, kick], [1, P.tb ? (() => [land[0] + 10, land[1], 1]) : carried(df[9])]]);
  return { dur:4.4, of, df, ball, focus:ball, hero:[20] };
}
function choreoFG(F){
  const y0 = F.ytg, { O, Dd } = forms('fg', 'fg', y0), post = (y0 + 10) * 10;
  const of = [], df = [];
  for (let i = 0; i < 11; i++){
    if (i === 6) of[i] = kf([[0, O[6][0], 0]]);
    else if (i === 7) of[i] = kf([[0, O[7][0], O[7][1]], [.22, O[7][0], O[7][1]], [.3, -74, -4], [1, -64, -2]]);
    else of[i] = kf([[0, O[i][0], O[i][1]], [.3, O[i][0] - 6, O[i][1]], [1, O[i][0] - 8, O[i][1]]]);
  }
  for (let i = 0; i < 11; i++) df[i] = kf([[0, Dd[i][0], Dd[i][1]], [.3, Dd[i][0] - 6, Dd[i][1]], [.33, Dd[i][0] - 7, Dd[i][1], i === 5 ? 14 : 0], [.38, Dd[i][0] - 8, Dd[i][1]], [1, Dd[i][0] - 10, Dd[i][1]]]);
  const wd = clamp((F.drift || 0) * .9, -14, 14);
  const pv = F.good ? clamp((rnd() - .5) * 14 + wd, -20, 20) : (F.short ? (rnd() - .5) * 20 + wd : (Math.abs(wd) > 6 ? Math.sign(wd) : rnd() < .5 ? -1 : 1) * (36 + rnd() * 20));
  const zP = F.good ? 62 + rnd() * 30 : F.short ? 22 : 55 + rnd() * 25;
  const k1 = t => { const k = clamp((t - .3) / .48, 0, 1); return [lerp(-68, post, k), lerp(0, pv, k), 6 + (zP - 6) * k + 120 * k * (1 - k)]; };
  const k2 = t => { const k = clamp((t - .78) / .22, 0, 1); return [post + 50 * k, pv * (1 + .3 * k), zP * (1 - k * .8)]; };
  const ball = seq([[.12, arc(() => [-8, 0, 3], 0, [-68, 0], .12, 5, 4)], [.3, () => [-68, 0, 4]], [.78, k1], [1, k2]]);
  return { dur:3.4, of, df, ball, focus:t => ball(Math.min(t, .45)) };
}
function choreoKneel(){
  const y0 = ytg(), { O, Dd } = forms('single', 'base', y0);
  const of = O.map((p, i) => i === 6 ? kf([[0, p[0], 0], [.3, -26, 0]]) : kf([[0, p[0], p[1]], [.3, p[0] - 2, p[1]]]));
  const df = Dd.map(p => kf([[0, p[0], p[1]], [.4, p[0] - 4, p[1]]]));
  return { dur:1.5, of, df, ball:carried(of[6]), focus:carried(of[6]) };
}
// formation for a play (before the snap)
function formFor(oFm, dFm){ PLF = G ? oFm : null; const { O, Dd } = forms(oFm, dFm, ytg()); return { of:O.map(p => () => [p[0], p[1], 0]), df:Dd.map(p => () => [p[0], p[1], 0]), ball:() => [-8, 0, 3] }; }
// map an offense-frame choreography onto the field
function worldFns(ch){
  const off = G.poss, d = wdir(off), X0 = fieldX(G.ball);
  const W = f => t => { const p = f(t); return [X0 + d * p[0], p[1] * d, p[2] || 0]; };
  return { els:[...EL[off], ...EL[opp(off)], EL.ball], fns:[...ch.of.map(W), ...ch.df.map(W), W(ch.ball)], focus:ch.focus ? W(ch.focus) : W(ch.ball), d, X0 };
}
/* top speeds in field px per second (10 px = 1 yard). Defense by position; offense by the team's ratings. */
function speeds(off, ch){
  const T = TM(off), D = TM(opp(off)), pr = unitR(off, 'pass'), rr = unitR(off, 'run'), dr = defR(opp(off));
  const o = [48, 48, 48, 48, 48, 60 + (pr - 60) * .9, 56 + (pr - 60) * .4, 62 + (rr - 60) * 1.3, 68 + (pr - 60) * 1.3, 68 + (pr - 60) * 1.3, 66 + (pr - 60) * 1.2];
  if (ch.fb) o[10] = 54;
  const db = (dr - 78) * .5, d = [62, 62, 62, 62, 80, 80, 80, 96, 96, 92, 92].map(v => v + db);
  return [...o, ...d, Infinity];
}
/* opt.win: a throw window ({ until }) — a throw key pressed before `until` stops the play there and returns { thrown }.
   opt.k0 / opt.dur: pick a play back up mid-way (after a throw), on the same clock as the part already shown. */
async function animate(ch, opt = {}){
  const w = worldFns(ch);
  camFollow = null;
  const sp = speeds(G.poss, ch);
  // the featured player moves at his own top speed: stretch the play until his path fits it
  let dur = opt.dur || ch.dur;
  const span = ch.live ? ch.live.t0 : 1;
  if (!opt.dur) for (const h of ch.hero || []){
    if (!isFinite(sp[h])) continue;
    let mx = 0, prev = w.fns[h](0);
    for (let j = 1; j <= 80; j++){ const p = w.fns[h](j / 80 * span); mx = Math.max(mx, Math.hypot(p[0] - prev[0], p[1] - prev[1]) * 80 / span); prev = p; }
    if (mx / dur > sp[h]) dur = Math.min(ch.dur * 1.25, mx / sp[h]);
  }
  const free = new Set([...(ch.hero || []), 22]);
  if (ch.tk >= 0) sp[11 + ch.tk] *= 1.45;   // the tackler gets a closing burst
  const kS = opt.k0 || 0;
  const cur = kS ? w.els.map(el => posOf(el)) : w.fns.map(f => f(0));
  let lastT = kS * dur, fx = w.focus(kS)[0], thrown = null;
  const end = ch.live ? ch.live.t0 : (ch.endK || 1);
  const win = opt.win;
  await runAnim(dur * Math.max(.01, end - kS) * 1000, k0 => {
    const k = kS + k0 * (end - kS), t = k * dur, dt = Math.max(0, t - lastT); lastT = t;
    if (win && THROW.req != null && k >= (win.from || 0) && k < win.until){ thrown = { j:THROW.req, k, dur }; THROW.req = null; return true; }
    if (win && THROW.on && k >= win.until){ THROW.on = false; THROW.req = null; THROW.ver++; }   // the QB let it go himself
    w.els.forEach((el, i) => {
      const p = w.fns[i](k);
      if (free.has(i) || reduced()){ cur[i] = p; }
      else { const dx = p[0] - cur[i][0], dy = p[1] - cur[i][1], dist = Math.hypot(dx, dy), step = sp[i] * dt;
        if (dist > step && dist > 0){ cur[i] = [cur[i][0] + dx / dist * step, cur[i][1] + dy / dist * step, p[2]]; } else cur[i] = p; }
      put(el, cur[i][0], cur[i][1], cur[i][2]);
    });
    fx = w.focus(k)[0]; camGame(fx, w.d);
  });
  if (thrown) return { thrown };
  if (ch.live) return liveRun(ch, w, sp, cur, dur);
  return null;
}
/* The live part of a play: the ball carrier runs until somebody actually brings him down.
   He cuts away from nearby tacklers; each defender reacts after a delay (linemen are tied up in blocks),
   then takes a pursuit angle at his own top speed. Tackle attempts can be missed, which leaves the
   defender stumbling. Before the carrier reaches the gain the call earned, most tackles are missed;
   past it, most are made, so a great call with a fast back can go the distance. */
function liveRun(ch, w, sp, cur, dur){
  const L = ch.live, d = w.d, X0 = w.X0, ci = L.ci, off = G.poss;
  const goalX = X0 + d * ytg() * 10, vmax = sp[ci] * .92;
  const adj = (defR(opp(off)) - unitR(off, L.run ? 'run' : 'pass')) / 120;
  /* hidden stamina: every player has a tank. Sprinting drains it, breaking a tackle drains a lot and kills his momentum,
     and a tired man loses top speed. Heavy use over a drive carries over until he gets a breather on the sideline. */
  const fkey = off + ':' + (L.who || ci), G0 = G.fat || (G.fat = {});
  // everyone starts from where the play put them on paper (not where they happen to be drawn), so the run comes out
  // the same at any frame rate, and the same on both screens of a head-to-head game
  const at0 = i => { const p = w.fns[i](L.t0); return [p[0], p[1]]; };
  const car = { p:at0(ci), spd:sp[ci] * (L.run ? .75 : .6), vx:0, vy:0, E:Math.max(.45, 1 - (G0[fkey] || 0)) };
  const D = [];
  for (let j = 0; j < 11; j++){
    const r = L.run && (L.pen || []).includes(j) ? .02 : L.run ? (j <= 3 ? .45 + rnd() * .5 : j <= 6 ? .12 + rnd() * .3 : .05 + rnd() * .2) : (j <= 3 ? .3 + rnd() * .4 : j <= 6 ? .1 + rnd() * .25 : rnd() * .15);
    // linemen tire fast, linebackers in between, defensive backs are built to run all day
    D.push({ i:11 + j, p:at0(11 + j), s:sp[11 + j], react:r, stun:0, tried:-9, E:1, drain:j <= 3 ? .14 : j <= 6 ? .07 : .035 });
  }
  // drawn players glide from where they were drawn onto the simulated spots over the first moments
  const vo = [ci, ...D.map(q => q.i)].map(i => { const s = i === ci ? car.p : D[i - 11].p; return [i, (cur[i] || s)[0] - s[0], (cur[i] || s)[1] - s[1]]; });
  const others = []; for (let i = 0; i < 11; i++) if (i !== ci) others.push(i);
  let t = 0, done = null, hold = 0, broken = 0;
  const yardsNow = () => (car.p[0] - X0) * d / 10;
  function upd(dt){
    t += dt;
    if (!done){
      // carrier: head downfield, slide away from tacklers in front of him, stay off the sideline
      let dx = d, dy = 0;
      const inHole = L.run && L.lane != null && yardsNow() < 3 && t < 1.3;
      for (const q of D){
        if (L.run && t < q.react) continue;
        const rx = car.p[0] - q.p[0], ry = car.p[1] - q.p[1], dist = Math.hypot(rx, ry) || 1, ahead = (q.p[0] - car.p[0]) * d;
        if (dist < 95 && ahead > -12 && q.stun <= 0){ const wgt = (95 - dist) / 95 * (inHole ? .3 : 1); dy += ry / dist * wgt * 1.5; dx -= d * wgt * (ahead < 20 ? .35 : 0); }
      }
      if (inHole) dy += clamp((L.lane * d - car.p[1]) / 18, -1.4, 1.4);
      if (Math.abs(car.p[1]) > 200) dy -= Math.sign(car.p[1]) * (Math.abs(car.p[1]) - 200) / 50;
      if (dx * d < .25) dx = d * .25;
      const n = Math.hypot(dx, dy);
      const vcap = vmax * (.74 + .26 * car.E);
      car.spd = Math.min(vcap, car.spd + vmax * dt * 1.4);
      car.E = Math.max(0, car.E - dt * .1 * car.spd / vmax);
      car.vx = dx / n * car.spd; car.vy = dy / n * car.spd;
      car.p[0] += car.vx * dt; car.p[1] += car.vy * dt;
      const y = yardsNow();
      if ((car.p[0] - goalX) * d >= 0) done = 'td';
      else if (Math.abs(car.p[1]) > 262) done = 'oob';
      else if (t > 10) done = 'tackle';
      // defenders: react, then take an angle on him
      for (const q of D){
        if (done) break;
        if (q.stun > 0){ q.stun -= dt; continue; }
        if (t < q.react) continue;
        const rx = car.p[0] - q.p[0], ry = car.p[1] - q.p[1], dist = Math.hypot(rx, ry);
        const lead = Math.min(.9, dist / q.s) * .75, ax = car.p[0] + car.vx * lead - q.p[0], ay = car.p[1] + car.vy * lead - q.p[1], an = Math.hypot(ax, ay) || 1;
        const stepv = Math.min(an, q.s * (.84 + .16 * q.E) * dt); q.E = Math.max(0, q.E - dt * q.drain);
        q.p[0] += ax / an * stepv; q.p[1] += ay / an * stepv;
        if (dist < 11 && t - q.tried > .45){
          q.tried = t;
          // a second tackler arriving makes it a gang tackle
          const help = D.some(o => o !== q && o.stun <= 0 && t >= o.react && Math.hypot(car.p[0] - o.p[0], car.p[1] - o.p[1]) < 16);
          const over = y - L.target;
          const p = (over < -2 ? .38 : over < 4 ? .84 : .95) + adj + (help ? .22 : 0);
          if (rnd() < p){ done = 'tackle'; q.p = [car.p[0] + d * 6, car.p[1] + 3]; }
          else { q.stun = .6; broken++; car.E = Math.max(0, car.E - .17); car.spd *= .55; }
        }
      }
    } else hold += dt;
  }
  // run the whole thing first in fixed 60ths of a second, keeping every frame...
  const FR = [], rec = () => { const f = [car.p[0], car.p[1], hold, done === 'td' ? 2 : done ? 1 : 0]; for (const q of D) f.push(q.p[0], q.p[1]); FR.push(f); };
  rec();
  while (!(done && hold > (done === 'td' ? .95 : .5))){ upd(1 / 60); rec(); }
  // what this run took out of him stays with him until his team's next drive
  G0[fkey] = clamp((G0[fkey] || 0) + .04 + (1 - car.E) * .25, 0, .5);
  const out = { how:done, yards:Math.round(yardsNow()), broken, secs:t };
  // ...then play it back on screen at whatever speed the game is running
  const e = EPOCH;
  return new Promise(res => {
    let pt = 0, last = performance.now();
    function draw(f, fi, dt){
      const k = Math.max(0, 1 - pt / .3), off0 = i => vo.find(v => v[0] === i);
      const hz = f[3] === 2 ? Math.abs(Math.sin(f[2] * 7)) * 10 : 0, c0 = off0(ci);
      put(w.els[ci], f[0] + c0[1] * k, f[1] + c0[2] * k, hz);
      put(EL.ball, f[0] + c0[1] * k + 3, f[1] + c0[2] * k + 3, 7 + hz);
      D.forEach((q, j) => { const o = off0(q.i); put(w.els[q.i], f[4 + j * 2] + o[1] * k, f[5 + j * 2] + o[2] * k, 0); });
      const kk = Math.min(1, L.t0 + (fi / 60) / dur);
      for (const i of others){ const p = w.fns[i](kk), c = posOf(w.els[i]); const dx = p[0] - c[0], dy = p[1] - c[1], dist = Math.hypot(dx, dy), stp = sp[i] * dt; put(w.els[i], dist > stp ? c[0] + dx / dist * stp : p[0], dist > stp ? c[1] + dy / dist * stp : p[1], 0); }
      camGame(f[0], d);
    }
    function step(now){
      if (e !== EPOCH) return;
      if (PAUSED){ last = now; requestAnimationFrame(step); return; }
      // (a frame's timestamp can be a hair before the moment we started, so never step backwards)
      const fdt = clamp((now - last) / 1000, 0, .05) * spd(); pt += fdt; last = Math.max(last, now);
      const fi = clamp(Math.floor(pt * 60), 0, FR.length - 1);
      draw(FR[fi], fi, fdt);
      if (fi >= FR.length - 1){ res(out); return; }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}
// jog everyone from where they are into a formation
async function jogTo(ch, ms = 650){
  const w = worldFns(ch);
  const from = w.els.map(el => posOf(el)), to = w.fns.map(f => f(0));
  camGame(fieldX(G.ball), w.d);
  if (reduced()){ w.els.forEach((el, i) => put(el, to[i][0], to[i][1], to[i][2])); return; }
  await runAnim(ms, k => { const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; w.els.forEach((el, i) => put(el, lerp(from[i][0], to[i][0], e), lerp(from[i][1], to[i][1], e), lerp(from[i][2], to[i][2], e))); });
}
function placeLines(){
  const d = dirOf(G.poss), x = fieldX(G.ball);
  EL.los.style.left = (x + 597) + 'px'; EL.los.style.opacity = '.9';
  const fd = G.ball + d * G.togo;
  EL.fst.style.left = (fieldX(clamp(fd, 0, 100)) + 597) + 'px';
  EL.fst.style.opacity = G.togo >= ytg() || G.pat ? '0' : '.9';
  put(EL.cu, clamp(x - 30, -470, 470), 300, 0); put(EL.ct, clamp(x + 30, -470, 470), -300, 0);
}

/* ---------------- HUD ---------------- */
function updateHUD(){
  if (!G) return;
  const tos = s => Array.from({ length:3 }, (_, i) => `<i class="${i < G.to[s] ? '' : 'x'}"></i>`).join('');
  const lead = G.sc.u === G.sc.t ? '' : G.sc.u > G.sc.t ? 'u' : 't';
  $('#bug').innerHTML = `<div class="bt u${G.poss === 'u' ? ' poss' : ''}"><span class="ab">${esc(AB(G.U))}</span><span class="tos">${tos('u')}</span><b class="lcd${lead === 'u' ? ' win' : ''}">${G.sc.u}</b></div>`
    + `<div class="bt t${G.poss === 't' ? ' poss' : ''}"><span class="ab">${esc(AB(G.T))}</span><span class="tos">${tos('t')}</span><b class="lcd${lead === 't' ? ' win' : ''}">${G.sc.t}</b></div>`
    + `<div class="bq"><span>${G.q > 4 ? 'OT' : ord(G.q) + ' QTR'}</span><b>${mmss(G.clock)}</b></div>`
    + `<div class="bd"><span>${G.pat ? (G.pat2 ? '2-PT TRY' : 'PAT') : downTxt()}</span><small>${spotTxt()}</small></div>`;
  $('#momb').style.left = (50 + G.mom * 48) + '%';
  const wc = $('#wind');
  if (wc && G.wind){
    const w = windFor(G.poss);
    windArrow();
    wc.querySelector('b').textContent = G.wind.mph;
    wc.querySelector('em').textContent = G.wind.mph < 4 ? 'CALM' : Math.abs(w.along) >= Math.abs(w.cross) ? (w.along > 0 ? 'AT THEIR BACK' : 'IN THEIR FACE') : 'CROSSWIND';
    wc.title = `Wind ${G.wind.mph} mph`;
  }
  if (ov && G.wind){ ov.style.setProperty('--wa', windA() + 'deg'); ov.style.setProperty('--wl', Math.min(1, G.wind.mph / 18).toFixed(2)); ov.style.setProperty('--wf', (1.2 - Math.min(1, G.wind.mph / 20) * .85).toFixed(2) + 's'); }
  const cl = $('#camlbl'); if (cl) cl.textContent = camName();
  const jb = $('#jb');
  if (jb) jb.innerHTML = `<div class="jb-top"><b>PTTFL</b><span>Head Coach</span><span>${G.q > 4 ? 'OT' : 'Q' + G.q} · ${mmss(G.clock)}</span></div>`
    + `<div class="jb-row u"><span>${esc(AB(G.U))}${G.poss === 'u' ? ' ◂' : ''}</span><b>${G.sc.u}</b></div><div class="jb-row t"><span>${esc(AB(G.T))}${G.poss === 't' ? ' ◂' : ''}</span><b>${G.sc.t}</b></div>`
    + `<div class="jb-foot"><span>${G.pat ? 'TRY' : downTxt()}</span><span>${spotTxt()}</span></div>`;
  padGame();
}
function tick(html, side){ const t = $('#tick'); t.innerHTML = html; t.className = 'tick' + (side === 't' ? ' t' : ''); }
let toastT = null;
function toast(msg, cls){ const t = $('#toast'); t.textContent = msg; t.className = 'on' + (cls ? ' ' + cls : ''); clearTimeout(toastT); toastT = setTimeout(() => t.className = '', 1900 / spd()); }
async function banner(title, sub, cls, chip, ms = 1500){
  const b = $('#banner');
  b.querySelector('.bn-t').textContent = title; b.querySelector('.bn-s').textContent = sub || ''; b.querySelector('.bn-s').style.display = sub ? '' : 'none';
  const c = b.querySelector('.bn-c'); c.textContent = chip ? chip[1] : ''; c.className = 'bn-c' + (chip ? ' ' + chip[0] : ''); c.style.display = chip ? '' : 'none';
  // good / bad are written from the home side's view; the guest of a head-to-head game sees them the other way round
  b.className = (cls || '').replace(/\b(good|bad)\b/, m => ME === 't' ? (m === 'good' ? 'bad' : 'good') : m); void b.offsetWidth; b.classList.add('on');
  await wait(ms); b.classList.remove('on'); await wait(160);
}

/* ---------------- the play-call tablet ---------------- */
const tablet = $('#tablet');
let TAB = null;
function hideTablet(){ tablet.classList.add('off'); ov.classList.remove('calling'); TAB = null; padGame(); }
function showTablet(mode, grp){
  const off = mode === 'off', rec = recFor(mode);
  TAB = { mode, rec, keys:off ? legalOff() : DKEYS, grp:off ? grp || null : null };
  // offense: pick run or pass first, then the play
  const vis = !off ? DKEYS : TAB.grp ? TAB.keys.filter(k => OFF[k].k === TAB.grp) : null;
  TAB.vk = vis || ['run', 'pass', rec.k];
  const co = off ? OC : DC;
  let line = off ? OLINE[OFF[rec.k].cat] : DLINE[rec.k];
  let scout = scoutLine(off);
  if (off && G.recent && G.recent[ME].length >= 2){ const l = G.recent[ME].slice(-2); if (l[0] === l[1]) scout = `(Careful, they're keying on ${OFF[l[1]].n}.)`; }
  const sp = specialsFor(mode);
  tablet.className = 'panel off' + (off ? '' : ' def') + (off && G.flip ? ' flip' : '');
  tablet.style.setProperty('--n', vis ? (vis.length > 6 ? Math.ceil(vis.length / 2) : vis.length) : 3);
  tablet.innerHTML = `<div class="bar"><span class="side">${off ? 'OFFENSE' : 'DEFENSE'}</span><b>${G.pat2 ? '2-PT TRY' : downTxt()}</b> · ${spotTxt()} <span class="r">${G.q > 4 ? 'OT' : 'Q' + G.q} · ${mmss(G.clock)}${G.runoff ? ' ▸ RUNNING' : ''}</span></div>`
    + `<div class="coord" style="--c:${co.c}"><span class="av">${co.i}</span><div>${off ? 'OC' : 'DC'} <b>${esc(co.n)}</b>: “${esc((off ? OFF : DEF)[rec.k].n)}. ${esc(line)}”${scout ? ` <span style="color:#B7B0E0">${esc(scout)}</span>` : ''}</div><span class="cf">CONFIDENCE ${rec.conf}%</span>${off ? `<button class="spb audb flipb" id="flipb" aria-pressed="${!!G.flip}" title="Mirror the play to the other side (M)">⇄ Flip${G.flip ? 'ped' : ''}</button><button class="spb audb" id="audb" aria-pressed="${AUDIBLES}" title="Stop at the line on pass plays to change routes">Audibles ${AUDIBLES ? 'On' : 'Off'}</button>` : ''}<button class="spb auto" id="autob" title="Let ${off ? 'the OC' : 'the DC'} call every play for the rest of this drive">${off ? 'OC' : 'DC'} Auto</button></div>`
    + (vis ? '' : rpPicker(rec))
    + (!vis ? '' : `<div class="cards">${vis.map((k, i) => { const P = off ? OFF[k] : DEF[k]; return `<button class="pc${k === rec.k ? ' rec' : ''}" data-k="${k}"><span class="k">${i + 1}</span>${off ? (TREE[k] ? artCustom(k, {}) : artOff(k)) : artDef(k)}<span class="nm">${esc(P.n)}</span><span class="fm">${esc(P.ff)}</span></button>`; }).join('')}</div>`)
    + `<div class="specials">${off && TAB.grp ? `<button class="spb alt" id="grpback">◂ Run / Pass</button>` : ''}${sp}</div>`
    + (off && TAB.grp !== 'run' ? myPlaysRow() : '');
  tablet.querySelectorAll('.pc').forEach(b => b.onclick = () => userCall(b.dataset.k));
  tablet.querySelectorAll('[data-g]').forEach(b => b.onclick = () => pickGroup(b.dataset.g));
  tablet.querySelectorAll('.rpb.oc').forEach(b => b.onclick = () => userCall(b.dataset.k));
  const gb = $('#grpback'); if (gb) gb.onclick = () => pickGroup(null);
  tablet.querySelectorAll('[data-sp]').forEach(b => b.onclick = () => userSpecial(b.dataset.sp));
  $('#autob').onclick = () => startAuto(mode);
  tablet.querySelectorAll('[data-mp]').forEach(b => b.onclick = () => callMyPlay(b.dataset.mp));
  tablet.querySelectorAll('[data-del]').forEach(b => b.onclick = ev => { ev.stopPropagation(); deleteMyPlay(b.dataset.del, b); });
  const fb = $('#flipb'); if (fb) fb.onclick = toggleFlip;
  const ab = $('#audb'); if (ab) ab.onclick = () => { AUDIBLES = !AUDIBLES; store.set('hc-aud', AUDIBLES); showTablet(mode, TAB.grp); };
  if (G.auto === mode){
    // fourth downs and two-point tries are always the head coach's call
    if (G.down === 4 || G.pat2) toast(G.pat2 ? 'TWO-POINT TRY · YOUR CALL' : '4TH DOWN · YOUR CALL', 'p');
    else { autoPick(mode); return; }
  }
  slideIn();
}
function toggleFlip(){
  if (!G || G.busy || !TAB || !(TAB.mode === 'off' || TAB.mode === 'pre')) return;
  G.flip = !G.flip; lastForm = '';
  toast(G.flip ? 'PLAY FLIPPED' : 'PLAY UNFLIPPED', 'g');
  if (PRE){ const k = PRE.k; idleFormation(OFF[k].fm, 'base').then(() => { if (PRE && PRE.k === k){ drawRoutes(); renderPresnap(); } }); return; }
  showTablet('off', TAB.grp); idleFormation('single', 'base');
}
function pickGroup(grp){ if (!TAB || TAB.mode !== 'off' || (G && G.busy)) return; showTablet('off', grp); const c = tablet.querySelector('.pc,.rpb'); if (c) c.focus({ preventScroll:true }); }
function rpPicker(rec){
  const box = (g, n, art, i) => { const ks = TAB.keys.filter(k => OFF[k].k === g), mine = OFF[rec.k].k === g;
    return `<button class="rpb ${g}" data-g="${g}"><span class="k">${i}</span>${art}<b>${n}</b><small>${ks.length} PLAYS</small>${mine ? `<em>OC LIKES ${esc(OFF[rec.k].n)}</em>` : ''}</button>`; };
  return `<div class="rpick">${box('run', 'Run', artOff('power'), 1)}${box('pass', 'Pass', artCustom('flood', {}), 2)}`
    + `<button class="rpb oc" data-k="${rec.k}"><span class="k">3</span>${TREE[rec.k] ? artCustom(rec.k, {}) : artOff(rec.k)}<b>OC Pick</b><small>${esc(OFF[rec.k].n)}</small></button></div>`;
}
/* ---------------- OC / DC auto: the coordinator calls the rest of the drive ---------------- */
function startAuto(mode){
  if (!G || G.busy) return;
  G.auto = mode; G.autoSide = mode === 'off' ? ME : opp(ME);
  showAutoBar();
  autoPick(mode);
}
function cancelAuto(){
  if (!G || !G.auto) return;
  const mode = G.auto; G.auto = null; showAutoBar();
  toast((mode === 'off' ? 'OC' : 'DC') + ' AUTO OFF · YOUR CALL', 'g');
  // if the coordinator hadn't snapped yet, hand the tablet back
  if (!G.busy && TAB && (TAB.mode === 'off' || TAB.mode === 'def')) slideIn();
}
function showAutoBar(){
  const b = $('#autobar'); if (!b) return;
  const on = !!(G && G.auto);
  b.hidden = !on;
  ov.classList.toggle('ff', on);
  if (on) b.querySelector('b').textContent = G.auto === 'off' ? `OC AUTO · ${OC.n.toUpperCase()} HAS THE CALL` : `DC AUTO · ${DC.n.toUpperCase()} HAS THE CALL`;
  padGame();
}
function autoPick(mode){
  const tag = mode === 'off' ? 'OC' : 'DC';
  wait(650).then(() => {
    if (!G || G.busy || !TAB || TAB.mode !== mode) return;
    if (G.auto !== mode || G.down === 4 || G.pat2) return;
    const k = TAB.rec.k;
    toast(`${tag} AUTO · ${(mode === 'off' ? OFF : DEF)[k].n.toUpperCase()}`, mode === 'off' ? 'g' : 'p');
    userCall(k);
  });
}
// (only if the tablet is still wanted two frames later: a call made in between has already put it away)
function slideIn(){ ov.classList.add('calling'); const tk = TAB; requestAnimationFrame(() => requestAnimationFrame(() => { if (TAB && TAB === tk) tablet.classList.remove('off'); })); padGame(); }
function scoutLine(off){
  const h = (G.hist[(off ? 'd' : 'o') + (MP ? opp(ME) : '')] || {})[bucket()]; if (!h) return '';
  let best = null, n = 0, tot = 0; for (const k in h){ tot += h[k]; if (h[k] > n){ n = h[k]; best = k; } }
  if (tot < 2 || n < 2) return '';
  return off ? `(They've shown ${DEF[best].n} ${n} of ${tot} times here.)` : `(They've run ${OFF[best].n} ${n} of ${tot} times here.)`;
}
const fgDist = () => ytg() + 17;
function windTag(side){ const w = windFor(side); if (w.mph < 4) return ''; const a = Math.round(w.along); return Math.abs(a) >= 3 ? ` · WIND ${a > 0 ? '+' : ''}${a}` : ' · CROSSWIND'; }
function specialsFor(mode){
  if (mode !== 'off' || G.pat2) return '';
  let s = '';
  if (G.down === 4){ s += `<button class="spb" data-sp="punt">Punt</button>`; }
  if (G.down === 4 || ((G.q === 2 || G.q >= 4) && G.clock <= 30)){ if (fgDist() <= 72) s += `<button class="spb alt" data-sp="fg">Field Goal<small>${fgDist()} YD · ${Math.round(fgProb(fgDist(), ME) * 100)}%${windTag(ME)}</small></button>`; }
  if (G.sc[ME] > G.sc[opp(ME)] && (G.q >= 4) && G.clock <= 120 && G.down < 4) s += `<button class="spb red" data-sp="kneel">Victory Kneel</button>`;
  return s;
}
function showPAT(){
  TAB = { mode:'pat', keys:[] };
  tablet.className = 'panel off';
  const diff = G.sc[ME] - G.sc[opp(ME)];
  const tip = G.q >= 4 && [-2, 1, -5, -10, 5, -9].includes(diff) ? 'The chart says go for two.' : 'Take the point.';
  tablet.innerHTML = `<div class="bar"><span class="side">OFFENSE</span><b>TRY</b> · AFTER TOUCHDOWN <span class="r">${esc(AB(G.U))} ${G.sc.u} – ${G.sc.t} ${esc(AB(G.T))}</span></div>`
    + `<div class="coord" style="--c:${OC.c}"><span class="av">${OC.i}</span><div>OC <b>${esc(OC.n)}</b>: “${tip}”</div></div>`
    + `<div class="specials" style="padding-top:12px"><button class="spb alt" data-sp="xp">Kick Extra Point<small>${Math.round(fgProb(33, ME) * 100)}%</small></button><button class="spb" data-sp="two">Go For Two</button></div>`;
  tablet.querySelectorAll('[data-sp]').forEach(b => b.onclick = () => userSpecial(b.dataset.sp));
  slideIn();
}

/* ---------------- clock ---------------- */
function tickClock(sec, during){
  const q = G.q;
  if ((q === 2 || q === 4) && !G.tmw[q] && G.clock > 120 && G.clock - sec <= 120){
    G.tmw[q] = true;
    if (!during){ G['tmwShown' + q] = true; charge(G.clock - 120); G.clock = 120; return 'tmw'; }
    G.clock = Math.max(0, G.clock - sec); charge(sec); return 'tmw';
  }
  const used = Math.min(sec, G.clock); G.clock = Math.max(0, G.clock - sec); charge(used);
  return '';
}
const charge = s => { if (G && G.poss) G.st[G.poss].top += s; };
function setRunoff(R, runs){
  if (!runs){ G.runoff = 0; return; }
  const late = (G.q === 2 || G.q >= 4) && G.clock <= 120, off = G.poss, diff = G.sc[off] - G.sc[opp(off)];
  let r = ri(25, 34);
  if (late && (diff <= 0 || G.q === 2)) r = ri(9, 15);
  if (G.q >= 4 && diff > 0) r = ri(36, 40);
  if (R && R.oob) r = late ? 0 : ri(10, 16);
  G.runoff = r;
}
function aiTimeout(){
  if (G.to.t <= 0 || !G.runoff) return false;
  const late = (G.q === 4 || G.q === 2 || G.q > 4) && G.clock <= 125, diff = G.sc.t - G.sc.u;
  if (!late) return false;
  if (G.poss === 'u' && (G.q >= 4 ? diff <= 8 && diff > -16 : G.clock <= 70 && rnd() < .5)) return true;
  if (G.poss === 't' && diff <= 0 && G.q >= 4) return true;
  if (G.poss === 't' && G.q === 2 && ytg() < 50) return true;
  return false;
}
async function callTimeout(side){
  G.to[side]--; G.runoff = 0;
  ov.classList.add('timeout'); toast(`TIMEOUT · ${sideName(side)} (${G.to[side]} LEFT)`, side === 't' ? 'p' : 'g');
  updateHUD();
  await wait(1100); ov.classList.remove('timeout');
}

/* ---------------- flow ---------------- */
async function preSnap(){
  if (G.runoff && !MP){
    if (aiTimeout()) await callTimeout('t');
  }
  if (G.runoff){
    const r = G.runoff; G.runoff = 0;
    const tw = tickClock(r, false);
    if (tw === 'tmw'){ updateHUD(); toast('TWO-MINUTE WARNING'); await wait(900); }
  }
  updateHUD();
  if (G.clock <= 0){ await endQuarter(); return false; }
  return true;
}
// a drive opens the first time a team snaps it at scrimmage and closes with how it ended
function openDrive(){ if (!G || G.pat || G.pat2) return; if (G.drOpen && G.drOpen.side === G.poss) return;
  if (G.drOpen) endDrive('half'); G.drOpen = { side:G.poss, ball:G.ball, plays:G.st[G.poss].plays };
  if (G.fat) for (const k in G.fat) if (k.startsWith(G.poss + ':')) G.fat[k] *= .35; }
function endDrive(how){
  const o = G && G.drOpen; if (!o) return; G.drOpen = null;
  const d = G.drv[o.side]; d.n++; d[how] = (d[how] || 0) + 1; d.plays += G.st[o.side].plays - o.plays;
}
async function nextSnap(){
  if (G.over) return;
  G.busy = false; G.flip = false;
  openDrive();
  if (G.auto && G.poss !== G.autoSide){ const was = G.auto; G.auto = null; showAutoBar(); toast(`DRIVE OVER · ${was === 'off' ? 'OC' : 'DC'} AUTO OFF`, 'g'); }
  placeLines(); updateHUD();
  if (MP) return NET.enter({ kind:G.pat && !G.pat2 ? 'pat' : 'snap' });
  if (G.pat){
    if (G.pat === 'u' && !G.pat2){ await idleFormation('single', 'base'); showPAT(); return; }
    if (G.pat === 't' && !G.pat2){
      const diff = G.sc.t - G.sc.u;
      if (G.q >= 4 && [-2, 1, -5, -10, 5, -9].includes(diff) && rnd() < .8){ G.pat2 = 't'; G.ball = 2; G.down = 1; G.togo = 2; toast(`${sideName('t')} GOING FOR TWO`, 'p'); }
      else { G.busy = true; await idleFormation('single', 'base'); await wait(500); return doKick('xp'); }
    }
  }
  if (G.poss === 't' && !G.pat2){
    const sp = aiSpecial();
    if (sp){ G.busy = true; await idleFormation(sp === 'kneel' ? 'single' : sp, sp === 'kneel' ? 'base' : sp); await wait(450); if (!(await preSnap())) return; return sp === 'punt' ? doPunt() : sp === 'fg' ? doKick('fg') : doKneel(); }
  }
  await idleFormation(G.poss === 'u' ? 'single' : 'single', 'base');
  showTablet(G.poss === 'u' ? 'off' : 'def');
}
let lastForm = '';
async function idleFormation(oFm, dFm){
  const key = G.poss + G.ball + oFm + dFm + (G.flip ? 'F' : '');
  if (lastForm === key) return; lastForm = key;
  await jogTo(formFor(oFm, dFm), 700);
}
function aiSpecial(){
  const y = ytg(), tg = G.togo, fgd = y + 17, diff = G.sc.t - G.sc.u, clk = G.clock - (G.runoff || 0), endHalf = (G.q === 2 || G.q >= 4) && clk <= 12;
  if (G.q >= 4 && diff > 0 && G.down < 4 && clk <= (4 - G.down) * 40 - G.to.u * 38 + 40) return 'kneel';
  const pk = fgProb(fgd, 't');
  if (endHalf && pk >= .2 && !(G.q >= 4 && diff < -3)) return 'fg';
  if (G.down !== 4) return null;
  const late = G.q >= 4 && clk <= 300;
  if (late && diff < 0 && (diff < -3 || pk < .35)) return null;
  if (late && diff === -3 && pk >= .45) return 'fg';
  if (tg <= 1 && y <= 55 && rnd() < .55) return null;
  if (pk >= .5) return 'fg';
  if (tg <= 2 && y <= 45) return null;
  return 'punt';
}
let AUDIBLES = store.get('hc-aud', true);
async function userCall(k, fromPre, keepHot){
  if (G.busy || !TAB) return;
  if (TAB.mode === 'off' && !TAB.keys.includes(k)) return;
  if (TAB.mode === 'def' && !DEF[k]) return;
  if (TAB.mode === 'pre' && !fromPre) return;
  // pass plays stop at the line so you can change routes
  if (TAB.mode === 'off' && AUDIBLES && !G.auto && OFF[k].k === 'pass' && !keepHot){ enterPresnap(k); return; }
  const mode = TAB.mode === 'pre' ? 'off' : TAB.mode;
  if (TAB.mode !== 'pre' && !keepHot) G.hot = null;
  if (MP){ const call = mode === 'off' ? { k, hot:G.hot && Object.keys(G.hot).length ? { ...G.hot } : null, flip:!!G.flip } : { k }; hideTablet(); return NET.submit(call); }
  G.busy = true; hideTablet();
  if (!G.pat2 && !(await preSnap())) return;
  let oK, dK;
  if (mode === 'off'){ oK = k; dK = aiDef(); const b = bucket(); (G.hist.o[b] = G.hist.o[b] || {})[k] = (G.hist.o[b][k] || 0) + 1; }
  else { dK = k; oK = aiOff(); G.flip = rnd() < .5; lastForm = ''; const b = bucket(); (G.hist.d[b] = G.hist.d[b] || {})[k] = (G.hist.d[b][k] || 0) + 1; }
  await runPlay(oK, dK);
}
async function userSpecial(sp){
  if (G.busy) return;
  if (MP){ if (!TAB) return; hideTablet(); return NET.submit({ sp }); }
  if (sp === 'xp' || sp === 'two'){
    G.busy = true; hideTablet();
    if (sp === 'xp') return doKick('xp');
    G.pat2 = 'u'; G.ball = 98; G.down = 1; G.togo = 2; lastForm = ''; G.busy = false; placeLines(); updateHUD(); await idleFormation('gun', 'gl'); showTablet('off'); return;
  }
  G.busy = true; hideTablet();
  if (!(await preSnap())) return;
  if (sp === 'punt') return doPunt();
  if (sp === 'fg') return doKick('fg');
  if (sp === 'kneel') return doKneel();
}
/* ---------------- my plays: saved audibles ---------------- */
let MYPLAYS = store.get('hc-myplays', []);
if (!Array.isArray(MYPLAYS)) MYPLAYS = [];
const saveMyPlays = () => store.set('hc-myplays', MYPLAYS);
// small play-art for a saved play: the base formation with its routes drawn in
const ART_POS = { gun:{ 8:[8,37], 9:[92,37], 10:[22,38], 5:[68,37], 7:[57,47], 6:[50,47] }, i:{ 8:[8,37], 9:[92,37], 5:[68,37], 7:[50,55], 10:[50,48], 6:[50,42] } };
function artRoute(p, r){
  const [x, y] = p, o = x < 50 ? -1 : 1, i = -o;   // o = toward the sideline, i = toward the middle
  const P = pts => 'M' + pts.map(q => q.join(' ')).join(' L');
  switch (r){
    case 'go':    return P([[x, y], [x, y - 30]]);
    case 'seam':  return P([[x, y], [x + i * 3, y - 30]]);
    case 'post':  return P([[x, y], [x, y - 16], [x + i * 14, y - 30]]);
    case 'slant': return P([[x, y], [x, y - 5], [x + i * 18, y - 16]]);
    case 'out':   return P([[x, y], [x, y - 13], [x + o * 10, y - 13]]);
    case 'dig':   return P([[x, y], [x, y - 17], [x + i * 18, y - 17]]);
    case 'curl':  return P([[x, y], [x, y - 20], [x + i * 3, y - 16]]);
    case 'check': return P([[x, y], [x + (x < 50 ? -1 : 1) * 20, y - 7]]);
    case 'screen':return P([[x, y], [x + 14, y + 2], [x + 26, y - 4]]);
    case 'flat':  return P([[x, y], [x, y - 4], [x + o * 14, y - 4]]);
    case 'drag':  return P([[x, y], [x + i * 4, y - 6], [x + i * 30, y - 7]]);
    case 'comeback': return P([[x, y], [x, y - 22], [x + o * 5, y - 17]]);
    case 'corner':return P([[x, y], [x, y - 15], [x + o * 12, y - 28]]);
    case 'swing': return P([[x, y], [x + 10, y + 1], [x + 22, y - 4]]);
    case 'angle': return P([[x, y], [x + 9, y - 3], [x + 4, y - 14]]);
    case 'wheel': return P([[x, y], [x + 16, y - 3], [x + 22, y - 26]]);
  }
  return '';
}
function artCustom(base, hot){
  const fm = OFF[base].fm === 'i' ? 'i' : 'gun', pos = ART_POS[fm], tree = playTree(base, hot);
  let s = `<svg viewBox="0 0 100 60" aria-hidden="true"><path d="M2 34H98" stroke="#E8E4FF" stroke-opacity=".35" stroke-width=".6" stroke-dasharray="2 2"/>`;
  for (const k of Object.keys(pos)){
    const i = +k, r = i === 6 ? null : (tree[i] || 'block');
    if (r && r !== 'block'){ const c = tree.p === i ? COL.y : hot && hot[i] ? COL.r : COL.t; s += `<path d="${artRoute(pos[i], r)}" fill="none" stroke="${c}" stroke-width="${tree.p === i ? 2 : 1.4}" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#ah${tree.p === i ? 'y' : hot && hot[i] ? 'r' : 't'})"/>`; }
    if (r === 'block') s += `<path d="M${pos[i][0] - 3} ${pos[i][1] - 4}h6" stroke="${COL.d}" stroke-width="1.4"/>`;
  }
  [...OL_A, ...Object.values(pos)].forEach(p => { s += `<circle cx="${p[0]}" cy="${p[1]}" r="2.3" fill="#0B2A24" stroke="#F4F0FF" stroke-width="1.1"/>`; });
  return s + MARK + `</svg>`;
}
function myPlaysRow(){
  if (!MYPLAYS.length) return `<div class="myplays empty"><span class="hud">MY PLAYS</span><span class="mpe">Build one: pick a pass play, change routes at the line, then Save Play.</span></div>`;
  return `<div class="myplays"><span class="hud">MY PLAYS</span><div class="mpcards">${MYPLAYS.map(p => `<div class="mpc" data-id="${p.id}"><button class="pc mp" data-mp="${p.id}" title="${esc(OFF[p.base].n)} with your routes">${artCustom(p.base, p.hot)}<span class="nm">${esc(p.name)}</span><span class="fm">${esc(OFF[p.base].n)} · ${(n => n + ' route' + (n === 1 ? '' : 's'))(Object.keys(p.hot).filter(k => k !== 'p').length)}${p.hot.p != null ? ' · ★ ' + esc(POSN[p.hot.p]) : ''}</span></button><button class="mpx" data-del="${p.id}" aria-label="Delete ${esc(p.name)}">✕</button></div>`).join('')}</div></div>`;
}
function callMyPlay(id){
  if (!G || G.busy || !TAB || TAB.mode !== 'off') return;
  const p = MYPLAYS.find(x => x.id === id); if (!p || !TAB.keys.includes(p.base)) return;
  if (AUDIBLES) enterPresnap(p.base, p.hot, p.name);
  else { G.hot = { ...p.hot }; userCall(p.base, false, true); }
}
function deleteMyPlay(id, btn){
  if (btn.dataset.sure !== '1'){ btn.dataset.sure = '1'; btn.textContent = 'Delete?'; btn.classList.add('sure'); setTimeout(() => { if (btn.isConnected){ btn.dataset.sure = ''; btn.textContent = '✕'; btn.classList.remove('sure'); } }, 2500); return; }
  MYPLAYS = MYPLAYS.filter(x => x.id !== id); saveMyPlays(); toast('PLAY DELETED');
  if (TAB && TAB.mode === 'off') showTablet('off', TAB.grp);
}
function savePresnap(name){
  name = String(name || '').trim().slice(0, 24);
  if (!name){ const inp = $('#pname'); if (inp){ inp.focus(); inp.classList.add('bad'); } return; }
  const hot = { ...(G.hot || {}) };
  const ex = MYPLAYS.find(x => x.name.toLowerCase() === name.toLowerCase());
  if (ex){ ex.base = PRE.k; ex.hot = hot; }
  else { if (MYPLAYS.length >= 16) MYPLAYS.shift(); MYPLAYS.push({ id:'p' + Date.now().toString(36), name, base:PRE.k, hot }); }
  saveMyPlays(); PRE.name = name; PRE.saving = false;
  toast(`SAVED TO MY PLAYS · ${name.toUpperCase()}`, 'g');
  renderPresnap();
}

/* ---------------- audibles: hot routes at the line ---------------- */
const RNAME = { go:'Go', post:'Post', seam:'Seam', slant:'Slant', out:'Out', dig:'Dig', curl:'Curl', check:'Check-down', screen:'Screen', block:'Block', flat:'Flat', drag:'Drag', comeback:'Comeback', corner:'Corner', swing:'Swing', angle:'Angle', wheel:'Wheel' };
/* the route tree graphic: [route, polyline points (x,y in a 300x210 box, stem at x 150, LOS at y 196), number, label]
   drawn for a receiver on the left; mirrored for one on the right so "out" always points to the sideline */
const TREE_WR = [
  ['go',       [[150, 196], [150, 16]],               9, 'GO'],
  ['post',     [[150, 94], [214, 34]],                8, 'POST'],
  ['corner',   [[150, 94], [86, 34]],                 7, 'CORNER'],
  ['dig',      [[150, 94], [240, 94]],                6, 'DIG'],
  ['out',      [[150, 94], [60, 94]],                 5, 'OUT'],
  ['curl',     [[150, 94], [194, 132]],               4, 'CURL'],
  ['comeback', [[150, 94], [106, 132]],               3, 'COMEBACK'],
  ['slant',    [[150, 188], [208, 154]],              2, 'SLANT'],
  ['flat',     [[150, 168], [62, 168]],               1, 'FLAT'],
  ['drag',     [[150, 182], [168, 180], [252, 180]], 0, 'DRAG']
];
const TREE_RB = [
  ['swing',  [[150, 186], [110, 182], [64, 168]],              1, 'SWING'],
  ['check',  [[150, 186], [150, 156], [124, 140]],             2, 'CHECK'],
  ['angle',  [[150, 186], [196, 166], [168, 110]],             3, 'ANGLE'],
  ['wheel',  [[150, 186], [86, 170], [64, 120], [64, 30]],     4, 'WHEEL'],
  ['drag',   [[150, 186], [170, 150], [254, 140]],             5, 'DRAG']
];
const POSN = { 8:'WR1', 9:'WR2', 10:'SLOT', 5:'TE', 7:'RB' };
function eligibleFor(k){ const fm = OFF[k].fm; return fm === 'i' ? [8, 9, 5, 7] : [8, 9, 10, 5, 7]; }
function curTree(){ return playTree(PRE.k, G.hot); }
let PRE = null;
async function enterPresnap(k, hot, name){
  G.hot = hot ? { ...hot } : {}; PRE = { k, sel:null, name:name || '' };
  TAB = { mode:'pre', keys:[k], rec:{ k } };
  tablet.classList.add('off');
  lastForm = '';
  await idleFormation(OFF[k].fm, 'base');
  if (!PRE || PRE.k !== k) return;
  ov.classList.add('presnap');
  drawRoutes(); renderPresnap();
}
function leavePresnap(){ PRE = null; ov.classList.remove('presnap'); const r = ov.querySelector('.rt-svg'); if (r) r.innerHTML = ''; }
function treeSvg(i, cur){
  const rb = i === 7, side = rb ? 1 : ((forms(OFF[PRE.k].fm, 'base', ytg()).O[i][1] * wdir(G.poss)) >= 0 ? 1 : -1);
  const mir = rb ? !G.flip : side < 0, X = x => mir ? 300 - x : x;
  let list = rb ? TREE_RB : TREE_WR;
  if (rb && PRE.k === 'screen') list = [['screen', [[150, 186], [118, 190], [70, 182]], 0, 'SCREEN'], ...list];
  let s = `<svg class="rtsvg" viewBox="-46 0 392 210" role="group" aria-label="Route tree"><defs><marker id="tra" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="3.4" markerHeight="3.4" orient="auto"><path d="M0 0L6 3L0 6z" fill="#19E3C4"/></marker><marker id="trc" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="3.4" markerHeight="3.4" orient="auto"><path d="M0 0L6 3L0 6z" fill="#FFE600"/></marker></defs>`;
  s += `<path d="M-40 196H340" stroke="#E8E4FF" stroke-opacity=".3" stroke-dasharray="4 4"/>`;
  if (rb) s += `<circle cx="150" cy="196" r="6" fill="#0B2A24" stroke="#F4F0FF" stroke-width="2"/>`;
  else s += `<path d="M150 196V16" stroke="#3B3158" stroke-width="3"/>`;
  // current route last so it sits on top
  const ordered = [...list.filter(b => b[0] !== cur), ...list.filter(b => b[0] === cur)];
  for (const [r, pts, n, lab] of ordered){
    const P = pts.map(p => X(p[0]).toFixed(0) + ',' + p[1]).join(' '), end = pts[pts.length - 1], ex = X(end[0]), ey = end[1];
    const on = r === cur, anchor = r === 'go' || (rb && r === 'wheel') ? 'middle' : ex < 150 ? 'end' : 'start';
    const lx = anchor === 'middle' ? ex : ex + (anchor === 'end' ? -8 : 8), ly = anchor === 'middle' ? ey - 6 : ey + 4;
    s += `<g class="trb${on ? ' on' : ''}" data-r="${r}" tabindex="0" role="button" aria-label="${lab} route${on ? ', selected' : ''}">`
      + `<polyline points="${P}" class="hit"/><polyline points="${P}" class="ln" marker-end="url(#${on ? 'trc' : 'tra'})"/>`
      + `<text x="${lx}" y="${ly}" text-anchor="${anchor}">${lab}${n ? ` <tspan class="n">(${n})</tspan>` : ''}</text></g>`;
  }
  return s + `</svg>`;
}
function renderPresnap(){
  const tree = curTree(), who = skillPlayers(TM(G.poss)), els = eligibleFor(PRE.k);
  const chip = i => { const r = tree[i] || 'block', w = who[i]; return `<button class="prc${PRE.sel === i ? ' on' : ''}${tree.p === i ? ' pri' : ''}" data-i="${i}"><span class="ps2">${POSN[i]}</span><b>${esc(last(w.n))}</b><em>${RNAME[r]}${G.hot[i] ? ' *' : ''}${tree.p === i ? ' · TARGET' : ''}</em></button>`; };
  let opts = '';
  if (PRE.sel != null){
    const pos = PRE.sel === 7 ? 'RB' : PRE.sel === 5 ? 'TE' : 'WR', cur = tree[PRE.sel] || 'block';
    const extra = pos === 'RB' ? ['block'] : pos === 'TE' ? ['seam', 'block'] : ['seam'];
    const isP = tree.p === PRE.sel, canP = cur !== 'block';
    opts = `<div class="rtree"><div class="rtgfx">${treeSvg(PRE.sel, cur)}</div><div class="rtside"><span class="hud">ROUTE TREE · ${POSN[PRE.sel]}</span><b class="rtn">${esc(who[PRE.sel].n)}</b><span class="rtcur">${RNAME[cur]}${cur !== 'block' && RP[cur] ? ` · ${RP[cur].d === 'deep' ? 'deep' : RP[cur].m >= 10 ? 'intermediate' : 'short'}` : ''}</span>`
      + `<div class="chips">${extra.map(r => `<button class="chip" aria-pressed="${r === cur}" data-r="${r}">${RNAME[r]}</button>`).join('')}</div>`
      + `<button class="chip tgtb" id="mkp" aria-pressed="${isP}"${canP && !isP ? '' : ' disabled'}>★ ${isP ? 'Primary Target' : 'Make Primary Target'}</button>`
      + `<span class="rthint">Click a route on the tree${pos === 'RB' ? '' : ' or press its number'}</span></div></div>`;
  }
  tablet.className = 'panel off';
  tablet.innerHTML = `<div class="bar"><span class="side">AUDIBLE</span><b>${PRE.name ? esc(PRE.name) + ' · ' : ''}${esc(OFF[PRE.k].n)}</b> · ${downTxt()} · ${spotTxt()} <span class="r">Click a receiver to change his route or make him the ★ primary target</span></div>`
    + `<div class="psbody"><div class="prlist">${els.map(chip).join('')}</div>${opts}</div>`
    + `<div class="specials" style="padding-top:8px"><button class="spb" id="snapb">Snap Ball</button><button class="spb alt" id="psreset">Reset Routes</button><button class="spb alt" id="psback">Change Play</button><button class="spb alt flipb" id="psflip" aria-pressed="${!!G.flip}">⇄ Flip${G.flip ? 'ped' : ''}</button><button class="spb save" id="pssave">${PRE.name ? 'Save Changes' : 'Save Play'}</button></div>`
    + (PRE.saving ? `<div class="saverow"><label for="pname" class="hud">NAME THIS PLAY</label><input id="pname" maxlength="24" autocomplete="off" placeholder="e.g. Jefferson Deep Shot" value="${esc(PRE.name || '')}"><button class="spb" id="psdo">Save to My Plays</button><button class="spb alt" id="pscancel">Cancel</button></div>` : '');
  tablet.querySelectorAll('.prc').forEach(b => b.onclick = () => selectRcv(+b.dataset.i));
  tablet.querySelectorAll('[data-r]').forEach(b => { b.onclick = () => { if (PRE) setRoute(PRE.sel, b.dataset.r); }; b.onkeydown = ev => { if (ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); ev.stopPropagation(); if (PRE) setRoute(PRE.sel, b.dataset.r); } }; });
  const mk = $('#mkp'); if (mk) mk.onclick = () => { if (PRE) setPrimary(PRE.sel); };
  $('#snapb').onclick = () => snapPresnap();
  $('#pssave').onclick = () => { if (PRE.name && !PRE.saving){ savePresnap(PRE.name); return; } PRE.saving = true; renderPresnap(); setTimeout(() => { const i = $('#pname'); if (i){ i.focus(); i.select(); } }, 30); };
  if (PRE.saving){
    $('#psdo').onclick = () => savePresnap($('#pname').value);
    $('#pscancel').onclick = () => { PRE.saving = false; renderPresnap(); };
    $('#pname').addEventListener('keydown', ev => { ev.stopPropagation(); if (ev.key === 'Enter'){ ev.preventDefault(); savePresnap(ev.target.value); } if (ev.key === 'Escape'){ PRE.saving = false; renderPresnap(); } });
  }
  $('#psreset').onclick = () => { G.hot = {}; PRE.sel = null; drawRoutes(); renderPresnap(); };
  $('#psflip').onclick = toggleFlip;
  $('#psback').onclick = () => { leavePresnap(); G.hot = null; showTablet('off', 'pass'); };
  slideIn();
}
function selectRcv(i){ if (!PRE || !eligibleFor(PRE.k).includes(i)) return; PRE.sel = PRE.sel === i ? null : i; drawRoutes(); renderPresnap(); }
function setPrimary(i){
  if (!PRE || i == null) return;
  const tree = curTree(); if (!tree[i]) return;
  if (i === TREE[PRE.k].p) delete G.hot.p; else G.hot.p = i;
  toast(`★ PRIMARY TARGET · ${last(skillPlayers(TM(G.poss))[i].n).toUpperCase()}`, 'g');
  drawRoutes(); renderPresnap();
}
function setRoute(i, r){
  if (!PRE || i == null) return;
  const base = TREE[PRE.k][i] || 'block';
  if (r === base) delete G.hot[i]; else G.hot[i] = r;
  if (r === 'block' && G.hot.p === i) delete G.hot.p;
  drawRoutes(); renderPresnap();
}
function snapPresnap(){ if (!PRE) return; const k = PRE.k; leavePresnap(); G.snapNow = true; userCall(k, true); }
// the routes painted on the field, under the players
function drawRoutes(){
  const svg = ov.querySelector('.rt-svg'); if (!svg || !PRE) return;
  const tree = curTree(), d = wdir(G.poss), X0 = fieldX(G.ball), { O } = forms(OFF[PRE.k].fm, 'base', ytg());
  const F = (u, v) => [(X0 + d * u + 597).toFixed(1), (v * d + 263.5).toFixed(1)];
  let s = '';
  for (const i of eligibleFor(PRE.k)){
    const r = tree[i] || 'block', D = defDepth(r);
    const keys = routeKeysFor(O[i], r, D, .4, .58, i === 7 ? (G.flip ? -1 : 1) : 0).filter(k => k[0] <= .9);
    const col = PRE.sel === i ? '#FF2E88' : tree.p === i ? '#FFE600' : '#19E3C4';
    if (r === 'block'){ const [x, y] = F(O[i][0] - 10, O[i][1]); s += `<path d="M${x - 6} ${y - 8}h12" stroke="${col}" stroke-width="4" stroke-linecap="round"/>`; continue; }
    s += `<polyline points="${keys.map(k => F(k[1], k[2]).join(',')).join(' ')}" fill="none" stroke="${col}" stroke-width="${PRE.sel === i ? 6 : 4}" stroke-linejoin="round" stroke-linecap="round" opacity=".9" marker-end="url(#rtarrow${PRE.sel === i ? 's' : tree.p === i ? 'p' : 'n'})"/>`;
    if (tree.p === i){ const [x, y] = F(keys[keys.length - 1][1], keys[keys.length - 1][2]); s += `<text x="${x}" y="${(+y - 12).toFixed(1)}" text-anchor="middle" font-size="22" fill="#FFE600" stroke="#0E0B1A" stroke-width="4" paint-order="stroke">★</text>`; }
  }
  svg.innerHTML = `<defs>${[['n', '#19E3C4'], ['p', '#FFE600'], ['s', '#FF2E88']].map(([k, c]) => `<marker id="rtarrow${k}" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="3" markerHeight="3" orient="auto"><path d="M0 0L6 3L0 6z" fill="${c}"/></marker>`).join('')}</defs>` + s;
}
async function runPlay(oK, dK){
  if (liveOn()) return runLive(oK, dK);
  const R = resolve(oK, dK);
  G.recent = G.recent || { u:[], t:[] }; G.recent[R.off].push(oK); if (G.recent[R.off].length > 6) G.recent[R.off].shift();
  lastForm = '';
  await jogTo(formFor(R.fm, dK), 520);
  await wait(260);
  const ch = choreo(R);
  let L;
  // your pass play: you can throw it to anyone running a route until the QB lets it go (or gets hit)
  if (canThrow(R, ch)){
    THROW.ids = eligibleFor(oK).filter(i => R.routes[i]); THROW.req = null; THROW.on = true; THROW.ver++;
    if (!G.thrHint){ G.thrHint = true; toast(`PRESS ${THROW.ids.map((_, n) => n + 1).join(' ')} TO THROW TO A RECEIVER`); }
    try {
      const a = await animate(ch, { win:{ from:.25 / ch.dur, until:ch.px.kLimit / (ch.px.scale || 1) } });
      THROW.on = false; THROW.ver++;
      if (a && a.thrown){ const ch2 = throwPlay(R, ch, a.thrown); L = await animate(ch2, { k0:a.thrown.k, dur:a.thrown.dur }); }
      else L = a;
    } finally { THROW.on = false; THROW.req = null; THROW.ver++; }
  } else L = await animate(ch);
  if (L){
    const y0 = ytg();
    R.yards = Math.min(L.yards, y0); R.td = L.how === 'td' || R.yards >= y0; if (R.td) R.yards = y0;
    R.oob = L.how === 'oob'; R.broken = L.broken; R.liveSecs = L.secs;
    if (R.kind === 'cmp') R.yac = Math.max(0, R.yards - Math.min(R.air || 0, y0));
  }
  // the call itself: who won the chess match
  const uOff = R.off === 'u';
  const ce = R.callE, verdict = ce > .6 ? (uOff ? 'l' : 'w') : ce < -.6 ? (uOff ? 'w' : 'l') : 'e';
  G.calls[verdict]++;
  G.hot = null;
  await applyResult(R, verdict);
}
/* Player mode: the snap is played out live, and its result goes through the same downs, clock and stats as always */
async function runLive(oK, dK){
  const off = G.poss, def = opp(off), OT = TM(off), DT = TM(def), P = OFF[oK], rp = repOf(off, oK), M = keyed(modOf(oK, dK), rp);
  const qb = (OT.qb[0] || ['the quarterback'])[0], dst = (DT.dst[0] || ['the defense'])[0];
  const R = { oK, dK, off, def, fm:P.fm, kind:'', yards:0, td:false, qb, dst, callE:callEdge(M), P, keyed:rp, M, side:G.flip ? -1 : 1, e:edgeOf(off, P) };
  if (P.k === 'run'){ R.carrier = oK === 'sneak' ? qb : pickRB(OT)[0]; R.cIdx = oK === 'sneak' ? 6 : 7; }
  G.recent = G.recent || { u:[], t:[] }; G.recent[off].push(oK); if (G.recent[off].length > 6) G.recent[off].shift();
  const quick = !!G.snapNow; G.snapNow = false;
  lastForm = '';
  await jogTo(formFor(R.fm, dK), 520);
  const L = await LIVE.play(R, { user:off === ME ? 'o' : 'd', autoSnap:quick });
  if (!G) return;
  Object.assign(R, L);
  if (R.kind === 'run' && R.cIdx === 6) R.carrier = qb;
  const uOff = R.off === 'u';
  const ce = R.callE, verdict = ce > .6 ? (uOff ? 'l' : 'w') : ce < -.6 ? (uOff ? 'w' : 'l') : 'e';
  G.calls[verdict]++;
  G.hot = null;
  await applyResult(R, verdict);
}
function canThrow(R, ch){ return !MP && R.P.k === 'pass' && R.off === ME && !G.auto && ch.px && R.routes && Object.keys(R.routes).some(k => k !== 'p'); }
function throwKey(n){ if (!THROW.on) return false; const j = THROW.ids[n - 1]; if (j != null && THROW.req == null) THROW.req = j; return true; }
function addStats(R){
  const so = G.st[R.off], sd = G.st[R.def];
  so.plays++;
  if (R.P.k === 'run' || R.scramble){
    so.ratt++; so.ryds += R.yards; so.yds += R.yards;
    const p = pstat(R.off, R.carrier, R.cIdx === 6 ? 'QB' : 'RB'); p.ra++; p.ry += R.yards; if (R.td) p.rtd++;
  } else {
    const q = pstat(R.off, R.qb, 'QB');
    if (R.kind === 'sack' || R.sackFum){ so.sacks++; so.yds += R.yards; so.pyds += R.yards; }
    else {
      so.att++; q.pa++;
      if (R.kind === 'cmp' || (R.kind === 'fum' && R.P.k === 'pass')){ so.cmp++; so.pyds += R.yards; so.yds += R.yards; q.pc++; q.py += R.yards; if (R.td) q.ptd++; const r = pstat(R.off, R.tgt, R.tPos); r.rc++; r.rcy += R.yards; if (R.td) r.rctd++; }
      if (R.kind === 'int'){ q.pint++; }
    }
  }
  if (R.kind === 'int' || R.kind === 'fum'){ so.to++; endDrive('to'); }
  if (G.down === 3){ so.a3++; if (R.yards >= G.togo && R.kind !== 'int' && R.kind !== 'fum') so.c3++; }
}
function bumpMom(side, v){ G.mom = clamp((G.mom * .94) + (side === 'u' ? v : -v), -1, 1); }
async function applyResult(R, verdict){
  const off = R.off, def = R.def, d = dirOf(off), chip = null;
  const oName = `${OFF[R.oK].n} vs ${DEF[R.dK].n}`;
  if (G.pat2){
    // two-point try
    const good = (R.kind === 'run' || R.kind === 'cmp') && R.td;
    if (good){ G.sc[off] += 2; G.st[off].pts += 2; }
    tick(`<b>2-PT:</b> ${esc(playText(R))} — ${good ? 'GOOD' : 'NO GOOD'}`, off);
    updateHUD();
    await banner(good ? 'Two-Point Good!' : 'No Good', oName, good ? (off === 'u' ? 'good' : 'bad') : (off === 'u' ? 'bad' : 'good'), chip);
    G.pat = null; G.pat2 = null;
    if (await checkSuddenDeath()) return;
    return kickoff(opp(off), off);
  }
  addStats(R);
  tickClock(R.kind === 'inc' ? ri(4, 6) : clamp(Math.round(3 + (R.liveSecs || 3)), 4, 14), true);
  const twoMinHit = (G.q === 2 || G.q === 4) && G.tmw[G.q] && !G['tmwShown' + G.q];
  if (twoMinHit) G['tmwShown' + G.q] = true;
  const txt = playText(R);
  tick(`<b>${G.q > 4 ? 'OT' : 'Q' + G.q} ${mmss(G.clock)}</b> · ${esc(txt)}`, off);
  updateHUD();
  let title = '', cls = '', sub = oName;
  if (R.kind === 'int'){
    bumpMom(off, -.35);
    if (R.pick6){ G.poss = def; G.ball = def === 'u' ? 100 : 0; await score(def, 6, 'Pick Six!', `${R.dst} take it to the house`, chip); return; }
    G.poss = def;
    const spot = R.tb ? (def === 'u' ? 20 : 80) : clamp(G.ball + d * (R.air - R.ret), 1, 99);
    G.ball = R.tb ? spot : spot; G.down = 1; G.togo = Math.min(10, ytg()); G.runoff = 0;
    await banner('Intercepted!', `${R.dst} · ${R.tb ? 'touchback' : 'returned ' + R.ret + ' yds'}`, def === 'u' ? 'good' : 'bad', chip);
    return afterPlay();
  }
  if (R.kind === 'fum'){
    bumpMom(off, -.35);
    G.ball = clamp(G.ball + d * R.yards, 1, 99); G.poss = def; G.down = 1; G.togo = Math.min(10, ytg()); G.runoff = 0;
    await banner('Fumble!', `${R.dst} recover`, def === 'u' ? 'good' : 'bad', chip);
    return afterPlay();
  }
  if (R.safety){ endDrive('safety'); bumpMom(off, -.3); await banner('Safety!', `${sideName(def)} +2`, def === 'u' ? 'good' : 'bad', chip); G.sc[def] += 2; G.st[def].pts += 2; updateHUD(); if (await checkSuddenDeath()) return; return kickoff(def, off, true); }
  if (R.kind === 'inc'){
    G.runoff = 0;
    title = 'Incomplete'; cls = off === 'u' ? 'bad' : 'good';
    if (R.read) sub = `${['', '2nd', '3rd', '4th', '5th'][R.read]} read · ${sub}`;
    return downs(R, 0, title, sub, cls, chip);
  }
  // run, completion or sack
  G.ball = clamp(G.ball + d * R.yards, 0, 100);
  if (R.td){ bumpMom(off, .35); G.st[off].td++; await score(off, 6, 'Touchdown!', `${R.kind === 'cmp' ? R.qb + ' to ' + R.tgt : R.carrier} · ${R.yards} yds${R.broken ? ' · ' + R.broken + ' broken tackle' + (R.broken > 1 ? 's' : '') : ''}`, chip); return; }
  if (R.kind === 'sack'){ bumpMom(off, -.12); title = 'Sacked!'; cls = off === 'u' ? 'bad' : 'good'; sub = `${R.dst} · ${R.yards} yds`; }
  else if (R.yards >= 20){ bumpMom(off, .2); title = `Big Play! +${R.yards}`; cls = off === 'u' ? 'good' : 'bad'; }
  else if (R.yards < 0) { title = `Loss of ${-R.yards}`; cls = off === 'u' ? 'bad' : 'good'; }
  else title = R.yards === 0 ? 'No Gain' : `+${R.yards} Yds`;
  if (R.broken) sub = `${R.broken} broken tackle${R.broken > 1 ? 's' : ''} · ${sub}`;
  if (R.P.k === 'pass' && R.read) sub = `${['', '2nd', '3rd', '4th', '5th'][R.read]} read · ${sub}`;
  setRunoff(R, true);
  if (twoMinHit) G.runoff = 0;
  return downs(R, R.yards, title, sub, cls, chip, twoMinHit);
}
async function downs(R, y, title, sub, cls, chip, tmw){
  const off = R.off;
  if (y >= G.togo){
    G.down = 1; G.togo = Math.min(10, ytg()); G.st[off].fd++; bumpMom(off, .06);
    if (y < 20 && R.kind !== 'sack'){ title = 'First Down!'; sub = `+${y} yds · ${sub}`; }
    await banner(title, sub, cls || (off === 'u' ? 'good' : 'bad'), chip);
  } else {
    G.down++; G.togo -= y;
    if (G.down > 4){
      await banner(title, sub, cls, chip, 900);
      bumpMom(off, -.25);
      endDrive('downs');
      await banner('Turnover on Downs', '', off === 'u' ? 'bad' : 'good', null, 1300);
      G.poss = opp(off); G.down = 1; G.togo = Math.min(10, ytg()); G.runoff = 0;
    } else await banner(title, sub, cls, chip);
  }
  if (tmw){ toast('TWO-MINUTE WARNING'); }
  return afterPlay();
}
async function afterPlay(){
  updateHUD();
  if (G.clock <= 0){ await endQuarter(); return; }
  nextSnap();
}
async function score(side, pts, title, sub, chip){
  G.sc[side] += pts; G.st[side].pts += pts; G.runoff = 0;
  if (G.drOpen && G.drOpen.side === side) endDrive(pts === 6 ? 'td' : 'fg');
  updateHUD();
  await banner(title, sub, 'td', chip, 1900);
  if (pts === 6){
    if (await checkSuddenDeath()) return;
    G.pat = side; G.poss = side; G.ball = side === 'u' ? 85 : 15; G.down = 1; G.togo = 15; lastForm = '';
    return nextSnap();
  }
  if (await checkSuddenDeath()) return;
  return kickoff(opp(side), side);
}
async function checkSuddenDeath(){ if (G.q > 4 && G.sc.u !== G.sc.t){ G.pat = null; G.pat2 = null; await finalScreen(); return true; } return false; }
// make chance by distance: the kicker's leg sets where it's a coin flip (about 54 yds for the weakest leg, 67 for the best),
// a tailwind adds range, a headwind takes it away, a crosswind costs some accuracy
function fgRange(side){ const k = TM(side).rt.kick, w = windFor(side); return 60 + (k - 78) * .5 + w.along * .25 - Math.abs(w.cross) * .1; }
function fgProb(dist, side){ return clamp(.985 / (1 + Math.exp((dist - fgRange(side)) / 5)), .01, .985); }
async function doKick(kind){
  const side = G.poss, isXP = kind === 'xp';
  const y0 = isXP ? 15 : ytg(), dist = y0 + 17, p = fgProb(dist, side);
  let good = rnd() < p, short = !good && dist > fgRange(side) - 6 && rnd() < .6, aimOff = 0;
  const kick = (TM(side).k[0] || ['The kicker'])[0];
  if (isXP){ G.ball = side === 'u' ? 85 : 15; }
  lastForm = '';
  await jogTo(Object.assign(formFor('fg', 'fg')), 520);
  const w = windFor(side);
  if (liveOn() && side === ME){
    // your kick: enough leg to get there, then keep the needle inside the uprights (a crosswind pushes it)
    const reach = fgRange(side) + 7, need = clamp((dist - 17) / (reach - 17), .12, 1), tol = clamp(.4 - (dist - 20) * .007 - Math.abs(w.cross) * .004, .1, .38);
    // a better kicker's needle moves slower
    const km = await LIVE.kickMeter({ label:isXP ? 'EXTRA POINT' : `${dist}-YD FIELD GOAL`, need, tol, period:.75 + (TM(side).rt.kick - 78) * .012 });
    if (!G) return;
    const aim = km.aim + w.cross * .008 + (km.power > 1.01 ? (km.aim >= 0 ? 1 : -1) * (km.power - 1) * 2 : 0);
    short = km.power < need; good = !short && Math.abs(aim) <= tol; aimOff = good ? 0 : aim * 30;
  }
  await wait(220);
  const F = { ytg:y0, good, short, drift:w.cross + aimOff };
  await animate(choreoFG(F));
  if (isXP){
    if (good){ G.sc[side] += 1; G.st[side].pts += 1; }
    tick(`<b>PAT:</b> ${esc(kick)} extra point ${good ? 'is good' : 'is NO GOOD'}`, side);
    updateHUD();
    await banner(good ? 'Extra Point Good' : 'PAT No Good', kick, good ? (side === 'u' ? 'good' : '') : (side === 'u' ? 'bad' : 'good'), null, 1100);
    G.pat = null;
    if (await checkSuddenDeath()) return;
    return kickoff(opp(side), side);
  }
  G.st[side].plays++;
  tickClock(5, true);
  tick(`<b>${G.q > 4 ? 'OT' : 'Q' + G.q} ${mmss(G.clock)}</b> · ${esc(kick)} ${dist}-yd field goal ${good ? 'is GOOD' : 'is NO GOOD'}`, side);
  if (good){ bumpMom(side, .12); return score(side, 3, 'It\'s Good!', `${kick} · ${dist} yds`, null); }
  bumpMom(side, -.15); endDrive('miss');
  await banner('No Good!', `${kick} · ${dist} yds`, side === 'u' ? 'bad' : 'good', null);
  const spot = clamp(G.ball - dirOf(side) * 7, 0, 100);
  G.poss = opp(side); G.ball = spot; if (ownYd() < 20) G.ball = G.poss === 'u' ? 20 : 80; G.down = 1; G.togo = 10; G.runoff = 0;
  return afterPlay();
}
async function doPunt(){
  const side = G.poss, y0 = ytg();
  let dist = Math.round(clamp(44 + gauss() * 5 + (TM(side).rt.kick - 78) * .15 + windFor(side).along * .3, 26, 66));
  if (liveOn() && side === ME){
    await jogTo(formFor('punt', 'punt'), 520);
    const km = await LIVE.kickMeter({ label:'PUNT', need:.85, tol:.3, period:.8 });
    if (!G) return;
    dist = Math.round(clamp((44 + (TM(side).rt.kick - 78) * .15 + windFor(side).along * .3) * (.5 + .55 * Math.min(1, km.power)) - Math.abs(km.aim) * 9 + gauss() * 2, 18, 68));
  }
  let tb = false, ret = 0;
  if (dist >= y0){ tb = true; dist = y0 + 6; }
  else { ret = rnd() < .25 ? 0 : clamp(Math.round(7 + gauss() * 5 + (rnd() < .04 ? 40 : 0)), 0, 80); if (dist - ret <= 0) ret = dist - 1; }
  lastForm = '';
  endDrive('punt');
  await jogTo(formFor('punt', 'punt'), 520);
  await wait(220);
  await animate(choreoPunt({ land:tb ? y0 + 6 : dist, ret, tb }));
  G.st[side].plays++;
  tickClock(ri(7, 10), true);
  const kick = (TM(side).k[0] || ['The punter'])[0];
  const net = tb ? y0 - 20 : dist - ret;
  tick(`<b>${G.q > 4 ? 'OT' : 'Q' + G.q} ${mmss(G.clock)}</b> · ${esc(kick)} punts ${tb ? 'into the end zone, touchback' : dist + ' yds, returned ' + ret}`, side);
  G.poss = opp(side);
  G.ball = tb ? (G.poss === 'u' ? 20 : 80) : clamp(G.ball + dirOf(side) * net, 1, 99);
  G.down = 1; G.togo = Math.min(10, ytg()); G.runoff = 0;
  bumpMom(side, -.05);
  await banner(tb ? 'Touchback' : `Punt · ${dist} Yds`, tb ? '' : ret ? `Returned ${ret} yds` : 'Fair catch', '', null, 1200);
  return afterPlay();
}
async function doKneel(){
  const side = G.poss;
  lastForm = '';
  await jogTo(formFor('single', 'base'), 450);
  await animate(choreoKneel());
  G.st[side].plays++;
  tickClock(2, true);
  G.ball = clamp(G.ball - dirOf(side) * 1, 1, 99);
  tick(`<b>${G.q > 4 ? 'OT' : 'Q' + G.q} ${mmss(G.clock)}</b> · ${esc((TM(side).qb[0] || ['QB'])[0])} takes a knee`, side);
  G.down++; G.togo += 1; G.runoff = 40;
  await banner('Victory Formation', '', '', null, 900);
  if (G.down > 4){ G.poss = opp(side); G.down = 1; G.togo = 10; G.runoff = 0; }
  return afterPlay();
}
async function kickoff(recv, kicker, safety){
  PLF = null;
  G.pat = null; G.pat2 = null; G.poss = recv;
  let own, txt;
  const r = rnd();
  if (safety){ own = ri(28, 42); txt = `Free kick returned to the ${own}`; }
  else if (r < clamp(.62 + (kicker ? windFor(kicker).along * .012 : 0), .3, .9)){ own = 25; txt = 'Touchback'; }
  else { own = clamp(ri(14, 24) + ri(0, 20), 10, 45); txt = `Returned to the ${own}`; if (rnd() < .04){ own = ri(46, 62); txt = 'Big return!'; } }
  G.ball = recv === 'u' ? own : 100 - own; G.down = 1; G.togo = 10; G.runoff = 0;
  if (own !== 25) tickClock(5, true);
  lastForm = '';
  placeLines(); updateHUD();
  toast(`KICKOFF · ${sideName(recv)} ${txt.toUpperCase()}`, recv === 'u' ? 'g' : 'p');
  tick(`<b>Kickoff:</b> ${esc(sideName(kicker))} kicks to ${esc(sideName(recv))} — ${esc(txt)}`, recv);
  await wait(700);
  if (G.clock <= 0){ await endQuarter(); return; }
  nextSnap();
}
async function endQuarter(){
  G.runoff = 0;
  if (G.q === 1 || G.q === 3){ G.q++; G.clock = G.qlen; toast(`END OF ${ord(G.q - 1)} QUARTER`); updateHUD(); await wait(900); return nextSnap(); }
  if (G.q === 2){ return halftime(); }
  if (G.q === 4 && G.sc.u === G.sc.t && !G.ot){
    G.ot = true; G.q = 5; G.clock = Math.max(180, G.qlen); G.to = { u:2, t:2 }; G.tmw = {};
    await banner('Overtime', 'Sudden death · next score wins', '', null, 1800);
    if (MP) return mpCoin(true);
    const recv = await coinToss(true); if (!G) return;
    return kickoff(recv, opp(recv));
  }
  return finalScreen();
}

/* ---------------- play-by-play text ---------------- */
function playText(R){
  const y = R.yards, yd = n => `${n} yd${Math.abs(n) === 1 ? '' : 's'}`;
  switch (R.kind){
    case 'run': return R.scramble && !R.td ? `${R.carrier} scrambles${y > 0 ? ' for ' + yd(y) : y === 0 ? ', no gain' : ', loss of ' + yd(-y)}${R.oob ? ', out of bounds' : ''}` : R.td ? `${R.carrier} ${R.oK === 'sneak' ? 'sneaks in' : 'runs it in'} from ${yd(y)} out. TOUCHDOWN` : y > 0 ? `${R.carrier} ${R.oK === 'sweep' ? 'takes the toss' : 'runs'} for ${yd(y)}${R.oob ? ', out of bounds' : ''}` : y === 0 ? `${R.carrier} stopped for no gain` : `${R.carrier} dropped for a loss of ${yd(-y)}`;
    case 'cmp': return R.td ? `${R.qb} finds ${R.tgt} for a ${yd(y)} TOUCHDOWN` : `${R.qb} to ${R.tgt} for ${yd(y)}${R.oob ? ', out of bounds' : ''}`;
    case 'inc': return R.away ? `${R.qb} throws it away` : `${R.qb} incomplete, intended for ${R.tgt}`;
    case 'sack': return `${R.qb} sacked by the ${R.dst} for a loss of ${yd(-y)}`;
    case 'int': return `${R.qb} INTERCEPTED by the ${R.dst}${R.tb ? ' in the end zone' : ', returned ' + yd(R.ret)}`;
    case 'fum': return R.sackFum ? `${R.qb} strip-sacked, recovered by the ${R.dst}` : `${R.carrier || R.tgt} FUMBLES — recovered by the ${R.dst}`;
  }
  return '';
}

/* ---------------- screens ---------------- */
const screens = ['title', 'setup', 'pre', 'half', 'final', 'pause', 'lobby', 'room'];
let SCR = 'title';
function show(id){
  SCR = id;
  screens.forEach(s => $('#' + s).hidden = s !== id && !(id === 'pause' && s === 'pause'));
  const inGame = id === 'game' || id === 'pause';
  $('#hud').hidden = !inGame;
  if (!inGame) hideTablet();
  ov.classList.toggle('dim', ['setup', 'pre', 'half', 'final', 'pause', 'lobby', 'room'].includes(id));
  pad();
}
function pad(){
  const B = (g, l, fn, dis, cls) => ({ g, l, fn, dis, cls });
  let items = [];
  if (SCR === 'title') items = [B('x', 'Start', () => toSetup(0))];
  else if (SCR === 'setup') items = [B('o', 'Back', () => setupBack()), B('x', setupStep === 0 ? 'Pick Opponent' : 'Game Plan', () => setupNext())];
  else if (SCR === 'pre') items = [B('o', 'Back', () => toSetup(1)), B('x', 'Kick Off', () => startGame())];
  else if (SCR === 'half') items = MP ? [B('x', 'Ready', () => NET.halfReady())] : [B('x', 'Start 2nd Half', () => secondHalf())];
  else if (SCR === 'final' && !MP) items = [B('x', 'Rematch', () => startGame()), B('s', 'New Matchup', () => toSetup(0)), B('t', 'Title', () => toTitle())];
  else if (SCR === 'pause') items = [B('x', 'Resume', () => resume()), MP ? B('t', 'Leave Game', () => mpLeaveAsk()) : B('t', 'Quit to Title', () => toTitle())];
  else if (SCR === 'lobby') items = [B('x', 'Refresh Rooms', () => NET.probeAll()), B('o', 'Play vs CPU', () => { location.href = 'index.html'; })];
  else if (SCR === 'room') items = NET.padItems();
  else if (SCR === 'final' && MP) items = NET.finalItems();
  else if (SCR === 'game') return padGame();
  renderPad(items);
}
function padGame(){
  if (SCR !== 'game') return;
  const canTO = G && G.to[ME] > 0 && !G.busy && G.runoff > 0 && TAB && (TAB.mode === 'off' || TAB.mode === 'def' || (MP && TAB.mode === 'pre'));
  const canOC = G && !G.busy && TAB && (TAB.mode === 'off' || TAB.mode === 'def');
  if (PRE){ renderPad([{ g:'x', l:'Snap', fn:() => snapPresnap() }, { g:'o', l:'Change Play', fn:() => { leavePresnap(); G.hot = null; showTablet('off', 'pass'); } }, { g:'s', l:'Camera', fn:() => cycleCam() }], true); return; }
  if (G && G.auto){ renderPad([{ g:'o', l:`Cancel ${G.auto === 'off' ? 'OC' : 'DC'} Auto`, fn:() => cancelAuto() }, { g:'s', l:'Camera', fn:() => cycleCam() }, { g:'st', l:'Menu', fn:() => pauseGame() }], true); return; }
  renderPad([
    { g:'t', l:TAB && TAB.mode === 'def' ? 'DC Call' : 'OC Call', fn:() => { if (TAB && TAB.rec) userCall(TAB.rec.k); }, dis:!canOC },
    { g:'sel', l:`Timeout (${G ? G.to[ME] : 3})`, fn:() => { if (!canTO) return; if (MP) return NET.timeout(); callTimeout('u').then(() => { if (TAB) showTablet(TAB.mode); }); }, dis:!canTO },
    { g:'s', l:'Camera', fn:() => cycleCam() },
    { g:'st', l:'Menu', fn:() => pauseGame() }
  ], true);
}
function renderPad(items, game){
  const g = { x:'<i class="ps x">✕</i>', o:'<i class="ps o">○</i>', t:'<i class="ps t">△</i>', s:'<i class="ps s">□</i>', sel:'<i class="sel"></i>', st:'<span class="shoulder">START</span>' };
  $('#pad').innerHTML = items.map((it, i) => `<button class="pb pill" data-i="${i}"${it.dis ? ' disabled' : ''}>${g[it.g]}<span class="lbl">${esc(it.l)}</span></button>`).join('') + `<span class="sp"></span><span class="ver">PTTFL HEAD COACH · ${esc(String(D.season))}</span>`;
  $('#pad').querySelectorAll('button').forEach(b => b.onclick = () => { const it = items[+b.dataset.i]; if (!it.dis) it.fn(); });
  PADK = items;
}
let PADK = [];
const camName = () => CAMS[camIdx].id === 'qb' && G && G.poss !== ME ? 'Behind the Defense' : CAMS[camIdx].name;
function cycleCam(){ camIdx = (camIdx + 1) % CAMS.length; store.set('hc-cam', camIdx); $('#camlbl').textContent = CAMS[camIdx].name; if (G) camGame(fieldX(G.ball), wdir(G.poss)); $('#camlbl').textContent = camName(); toast('CAMERA · ' + camName().toUpperCase()); }
let pausedFrom = null;
function pauseGame(){ pausedFrom = SCR; PAUSED = true; MENU_VIEW = 'menu'; show('pause'); renderMenu(); }
function resume(){ PAUSED = false; show('game'); const q = PQ; PQ = []; q.forEach(f => f()); padGame(); }
let MENU_VIEW = 'menu';
function renderMenu(){
  const box = $('#pause .box');
  if (MENU_VIEW === 'keys'){ box.style.maxWidth = '760px'; $('#pause h2').textContent = 'Controls'; $('#menu').innerHTML = keysPage(); $('#menu').querySelector('[data-m="b"]').onclick = () => { MENU_VIEW = 'menu'; renderMenu(); }; return; }
  if (MENU_VIEW === 'stats' && G){ box.style.maxWidth = '980px'; $('#pause h2').textContent = 'Game Stats'; $('#menu').innerHTML = statsPage(); $('#menu').querySelector('[data-m="b"]').onclick = () => { MENU_VIEW = 'menu'; renderMenu(); }; return; }
  box.style.maxWidth = '420px'; $('#pause h2').textContent = 'Paused';
  $('#menu').innerHTML = `<button class="chip" data-m="r">Resume</button><button class="chip" data-m="st">Game Stats</button><button class="chip" data-m="ky">Controls</button><button class="chip" data-m="c">Camera: ${esc(CAMS[camIdx].name)}</button><button class="chip" data-m="s">Play Speed: ${SPEED > 1 ? 'Fast' : 'Normal'}</button>${MP ? '' : `<button class="chip" data-m="sty">Play Style: ${SET.style === 'player' ? 'Player' : 'Head Coach'}</button>`}<button class="chip" data-m="q">${MP ? 'Leave Game' : 'Quit to Title'}</button>`;
  $('#menu').querySelectorAll('[data-m]').forEach(b => b.onclick = () => { const m = b.dataset.m; if (m === 'r') resume(); if (m === 'c'){ cycleCam(); renderMenu(); } if (m === 's'){ SPEED = SPEED > 1 ? 1 : 1.8; store.set('hc-speed', SPEED); renderMenu(); } if (m === 'q'){ if (MP) mpLeaveAsk(); else toTitle(); } if (m === 'st'){ MENU_VIEW = 'stats'; renderMenu(); } if (m === 'ky'){ MENU_VIEW = 'keys'; renderMenu(); } if (m === 'sty'){ SET.style = SET.style === 'player' ? 'coach' : 'player'; store.set('hc-style', SET.style); toast(SET.style === 'player' ? 'PLAYER MODE · FROM THE NEXT SNAP' : 'HEAD COACH MODE · FROM THE NEXT SNAP'); renderMenu(); } });
}
function toTitle(){
  EPOCH++; PAUSED = false; PQ = []; const ab = $('#autobar'); if (ab) ab.hidden = true;
  G = null; ANIM = null; camFollow = null; camTo(SPOT.title);
  if (MP){ titleScene(); return NET.toLobby(); }
  show('title');
  titleScene();
}
function jbIdle(){ const jb = $('#jb'); if (jb) jb.innerHTML = `<div class="jb-top"><b>PTTFL</b><span>Head Coach</span><span>${D.season}</span></div><div class="jb-row u"><span>Your sideline</span><b>00</b></div><div class="jb-row t"><span>Their sideline</span><b>00</b></div><div class="jb-foot"><span>PRESS START</span><span>${TEAMS.length} FRANCHISES</span></div>`; }
function titleScene(){
  jbIdle();
  const c = store.get('pttfl-hc-career', null);
  $('#career').innerHTML = c && (c.w + c.l + c.t) ? `COACH CAREER <span class="lcd good">${c.w}-${c.l}${c.t ? '-' + c.t : ''}</span> JOB SECURITY <span class="lcd${c.job >= 50 ? ' win' : ''}">${c.job}</span>` : '';
  // both teams lined up at midfield
  G = { poss:'u', ball:50, down:1, togo:10, sc:{ u:0, t:0 }, q:1, clock:0, to:{ u:3, t:3 }, tmw:{}, st:{}, pat:null };
  const ch = formFor('single', 'base'), w = worldFns(ch);
  w.els.forEach((el, i) => { const p = w.fns[i](0); put(el, p[0], p[1], p[2]); });
  placeLines(); EL.fst.style.opacity = '0'; EL.los.style.opacity = '0';
  G = null;
}

/* setup */
let setupStep = 0;
function toSetup(step){ if (G){ EPOCH++; PAUSED = false; PQ = []; ANIM = null; G = null; jbIdle(); } setupStep = step; show('setup'); camTo(SPOT.press); renderSetup(); }
function setupBack(){ if (setupStep === 1) return toSetup(0); toTitle(); }
function setupNext(){ if (setupStep === 0){ setupStep = 1; if (SET.t === SET.u) SET.t = TEAMS.find(t => t.id !== SET.u).id; renderSetup(); pad(); return; } store.set('hc-u', SET.u); store.set('hc-t', SET.t); show('pre'); renderPre(); camTo(SPOT.mid); }
function wk5(a, b){ const m = (D.wk || []).find(x => (x[0] === a && x[2] === b) || (x[0] === b && x[2] === a)); if (!m) return null; const as = m[0] === a ? m[1] : m[3], bs = m[0] === a ? m[3] : m[1]; return [as, bs]; }
function renderSetup(){
  $('#setup-h').textContent = setupStep === 0 ? 'Choose Your Franchise' : 'Choose Your Opponent';
  $('#steps').innerHTML = [['Your Team', 0], ['Opponent', 1], ['Game Plan', 2]].map(([l, i]) => `<button class="chip" aria-pressed="${i === setupStep}" data-s="${i}">${i + 1} · ${l}</button>`).join('')
    + `<button class="chip" aria-pressed="${WORK}" id="workb" title="Swap edgy team names for tame ones">Work Mode: ${WORK ? 'On' : 'Off'}</button>`;
  $('#steps').querySelectorAll('[data-s]').forEach(b => b.onclick = () => { const s = +b.dataset.s; if (s === 2) return setupNext2(); toSetup(s); });
  $('#workb').onclick = () => { WORK = !WORK; try { localStorage.setItem('pttfl-work', WORK ? '1' : '0'); } catch(e){} renderSetup(); };
  const cur = setupStep === 0 ? SET.u : SET.t;
  const list = [...TEAMS].sort((a, b) => b.rt.ovr - a.rt.ovr || TN(a).localeCompare(TN(b)));
  $('#tlist').innerHTML = list.map(t => { const lock = setupStep === 1 && t.id === SET.u;
    return `<button class="trow${lock ? ' lock' : ''}" data-id="${t.id}" aria-pressed="${t.id === cur}"${lock ? ' disabled' : ''}><span class="ab">${esc(AB(t))}</span><span class="tn"><b>${esc(TN(t))}</b><small>${esc(t.m)}${t.id === SET.u && setupStep === 1 ? ' · you' : ''}</small></span><span class="rec">${esc(t.r)}</span><span class="lcd${t.rt.ovr >= 82 ? ' win' : ''}">${t.rt.ovr}</span></button>`; }).join('');
  $('#tlist').querySelectorAll('.trow').forEach(b => { b.onclick = () => { if (setupStep === 0) SET.u = b.dataset.id; else SET.t = b.dataset.id; renderSetup(); }; b.ondblclick = () => setupNext(); });
  renderScout(byId(cur));
}
function setupNext2(){ if (SET.t === SET.u) SET.t = TEAMS.find(t => t.id !== SET.u).id; setupStep = 1; setupNext(); }
function renderScout(t){
  const bar = (l, v) => `<div class="rb"><span>${l}</span><i><b style="width:${clamp((v - 55) / 42 * 100, 4, 100)}%"></b></i><em>${v}</em></div>`;
  const pl = (pos, p) => p ? `<div class="p-${pos === 'D/ST' ? 'DST' : pos}"><span>${pos}</span><b>${esc(p[0])}</b></div>` : '';
  const rows = [pl('QB', t.qb[0]), ...t.rb.slice(0, 2).map(p => pl('RB', p)), ...t.rec.slice(0, 4).map(p => pl(p[1], p)), pl('K', t.k[0]), pl('D/ST', t.dst[0])].join('');
  const r5 = setupStep === 1 ? wk5(SET.u, t.id) : null;
  const used = new Set([t.qb, t.rb, t.rec, t.k, t.dst].flat().map(p => p[0]));
  const ro = t.roster || [], out = ro.filter(r => r[4] === 'O' || r[4] === 'IR');
  const bench = ro.filter(r => !used.has(r[0]) && r[4] !== 'O' && r[4] !== 'IR').map(r => `<div class="p-${r[1] === 'D/ST' ? 'DST' : r[1]}" style="opacity:.75"><span>${r[1]}</span><b>${esc(r[0])}${r[4] === 'Q' ? ' <i style="color:#FFE600;font-style:normal">Q</i>' : ''}</b></div>`).join('');
  $('#scout').innerHTML = `<div class="bar"><b>SCOUTING REPORT</b> // ${esc(t.seed || '')} <span class="r">${esc(t.r)} · ${t.pf.toFixed(2)} PF</span></div>`
    + `<div class="tnm" style="color:${setupStep === 0 ? '#19E3C4' : '#FF5CA8'}">${esc(TN(t))}</div><div class="mgr">HEAD COACH · ${esc(t.m)}</div>`
    + (r5 ? `<span class="ribbon">Week ${D.week} rematch · ${r5[0] > r5[1] ? 'you won' : 'you lost'} ${r5[0].toFixed(2)}–${r5[1].toFixed(2)}</span>` : '')
    + `<div class="ovr"><span class="hud">OVERALL</span><span class="lcd win">${t.rt.ovr}</span></div>`
    + `<div class="rbars">${bar('PASS', t.rt.pass)}${bar('RUN', t.rt.run)}${bar('DEFENSE', t.rt.dfn)}${bar('KICKING', t.rt.kick)}</div>`
    + `<div class="hud" style="padding:6px 14px 4px">DEPTH CHART · ${esc(D.asof || '')}</div><div class="roster">${rows}</div>`
    + (bench.length ? `<div class="hud" style="padding:10px 14px 4px;color:#B7B0E0">BENCH</div><div class="roster">${bench}</div>` : '')
    + (out.length ? `<div class="note"><b style="color:#FF5A6E">Out:</b> ${out.map(r => `${esc(r[0])} (${r[4] === 'IR' ? 'IR' : 'out'})`).join(', ')}</div>` : '')
    + `<div class="note">Current ESPN rosters. The depth chart is each team's healthiest top producers; ratings come from ${D.season} fantasy points and ESPN's season projection, ranked across the league.</div>`;
}

/* pregame */
const PLAN_O = { ground:['Ground & Pound', 'Lean on the backs. Run rating up, pass rating down.'], bal:['Balanced', 'Take what the defense gives you.'], air:['Air Raid', 'Spread it out. Pass rating up, run rating down.'] };
const PLAN_D = { bend:["Bend Don't Break", 'Fewer big plays allowed, more short gains.'], base:['Base', 'Sound, fundamental football.'], agg:['Aggressive', 'More sacks and takeaways, more big plays given up.'] };
function renderPre(){
  const u = byId(SET.u), t = byId(SET.t);
  $('#pre-sub').textContent = `${AB(u)} vs ${AB(t)}`;
  const row = (l, a, b) => `<div class="row"><em class="${a > b ? 'up' : ''}">${a}</em><i class="l"><b style="width:${clamp((a - 55) / 42 * 100, 4, 100)}%"></b></i><span>${l}</span><i class="r"><b style="width:${clamp((b - 55) / 42 * 100, 4, 100)}%"></b></i><em class="${b > a ? 'up' : ''}">${b}</em></div>`;
  const r5 = wk5(SET.u, SET.t);
  $('#tape').innerHTML = `<div class="tape"><div class="side l"><div class="nm">${esc(TN(u))}</div><div class="mg">${esc(u.m)} · ${esc(u.r)} · YOU</div></div><div class="vs">VS</div><div class="side r"><div class="nm">${esc(TN(t))}</div><div class="mg">${esc(t.m)} · ${esc(t.r)}</div></div></div>`
    + (r5 ? `<div style="text-align:center;margin:-6px 0 10px"><span class="ribbon">Week ${D.week} rematch · ${r5[0] > r5[1] ? 'won' : 'lost'} ${r5[0].toFixed(2)}–${r5[1].toFixed(2)}</span></div>` : '')
    + `<div class="cmp">${row('OVR', u.rt.ovr, t.rt.ovr)}${row('PASS', u.rt.pass, t.rt.pass)}${row('RUN', u.rt.run, t.rt.run)}${row('DEF', u.rt.dfn, t.rt.dfn)}${row('KICK', u.rt.kick, t.rt.kick)}</div>`;
  const chips = (obj, cur, key) => Object.entries(obj).map(([k, v]) => `<button class="chip" aria-pressed="${k === cur}" data-${key}="${k}">${v[0]}</button>`).join('');
  $('#opts').innerHTML = `<div class="panel opt"><div class="bar"><b>OFFENSE</b> // PHILOSOPHY</div><div class="chips">${chips(PLAN_O, SET.po, 'po')}</div><p>${PLAN_O[SET.po][1]}</p></div>`
    + `<div class="panel opt"><div class="bar"><b>DEFENSE</b> // PHILOSOPHY</div><div class="chips">${chips(PLAN_D, SET.pd, 'pd')}</div><p>${PLAN_D[SET.pd][1]}</p></div>`
    + `<div class="panel opt"><div class="bar"><b>QUARTER</b> // LENGTH</div><div class="chips">${[3, 5, 8].map(n => `<button class="chip" aria-pressed="${n === SET.qlen}" data-ql="${n}">${n} Min</button>`).join('')}</div><p>${SET.qlen === 3 ? 'Quick game, about 4 minutes.' : SET.qlen === 5 ? 'About 6–8 minutes of play calling.' : 'Long game, about 12 minutes.'}</p></div>`
    + `<div class="panel opt"><div class="bar"><b>OPPONENT</b> // COACHING</div><div class="chips">${[['rookie', 'Rookie'], ['pro', 'Pro'], ['allpro', 'All-Pro']].map(([k, l]) => `<button class="chip" aria-pressed="${k === SET.diff}" data-df="${k}">${l}</button>`).join('')}</div><p>${SET.diff === 'rookie' ? 'Predictable play calls, ratings knocked down.' : SET.diff === 'pro' ? 'A real coordinator who learns your tendencies.' : 'Reads your tendencies and counters them. Ratings bumped up.'}</p></div>`
    + `<div class="panel opt"><div class="bar"><b>PLAY STYLE</b> // ON THE FIELD</div><div class="chips">${[['player', 'Player'], ['coach', 'Head Coach']].map(([k, l]) => `<button class="chip" aria-pressed="${k === SET.style}" data-sty="${k}">${l}</button>`).join('')}</div><p>${SET.style === 'player' ? 'Call it, then play it: throw with the meter, run with jukes and spins, take a defender and make the tackle. Press H in a game for the controls.' : 'Call the play and watch it from the sideline.'}</p></div>`
    + `<div class="go-row" style="grid-column:1/-1"><button class="pb pill big" id="kick"><i class="ps x">✕</i>Kick Off</button></div>`;
  $('#opts').querySelectorAll('[data-po]').forEach(b => b.onclick = () => { SET.po = b.dataset.po; renderPre(); });
  $('#opts').querySelectorAll('[data-pd]').forEach(b => b.onclick = () => { SET.pd = b.dataset.pd; renderPre(); });
  $('#opts').querySelectorAll('[data-ql]').forEach(b => b.onclick = () => { SET.qlen = +b.dataset.ql; store.set('hc-qlen', SET.qlen); renderPre(); });
  $('#opts').querySelectorAll('[data-df]').forEach(b => b.onclick = () => { SET.diff = b.dataset.df; store.set('hc-diff', SET.diff); renderPre(); });
  $('#opts').querySelectorAll('[data-sty]').forEach(b => b.onclick = () => { SET.style = b.dataset.sty; store.set('hc-style', SET.style); renderPre(); });
  $('#kick').onclick = () => startGame();
}
async function startGame(){
  EPOCH++; PAUSED = false; PQ = []; ANIM = null;
  newGame(); showAutoBar();
  show('game');
  $('#camlbl').textContent = CAMS[camIdx].name;
  tick(`Welcome to the PTTFL stadium. <b>${esc(TN(G.U))}</b> host <b>${esc(TN(G.T))}</b>.`, 'u');
  lastForm = '';
  placeLines(); updateHUD();
  camTo(SPOT.mid);
  const recv = await coinToss(false); if (!G) return;
  G.recv1 = recv;
  G.poss = recv; G.ball = recv === 'u' ? 25 : 75;
  placeLines(); updateHUD();
  camGame(fieldX(G.ball), wdir(recv));
  kickoff(recv, opp(recv));
}
/* ---------------- coin toss: you call it, the coin flips, the winner takes the ball (you can defer) ---------------- */
function coinToss(ot){
  const box = $('#coin'), e = EPOCH;
  return new Promise(res => {
    const done = side => { box.hidden = true; document.removeEventListener('keydown', key, true); res(side); };
    const set = (sub, btns) => {
      box.querySelector('.ct-sub').textContent = sub;
      const b = box.querySelector('.ct-btns'); b.innerHTML = btns.map(([id, l, k]) => `<button class="spb${id === 'kick' || id === 'tails' ? ' alt' : ''}" data-c="${id}"><span class="kk">${k}</span>${l}</button>`).join('');
      b.querySelectorAll('[data-c]').forEach(x => x.onclick = () => pick(x.dataset.c));
      const f = b.querySelector('button'); if (f) f.focus({ preventScroll:true });
    };
    let stage = 'call';
    const key = ev => { const k = ev.key.toLowerCase(); const b = [...box.querySelectorAll('[data-c]')]; if (k === '1' && b[0]){ ev.preventDefault(); ev.stopPropagation(); b[0].click(); } if (k === '2' && b[1]){ ev.preventDefault(); ev.stopPropagation(); b[1].click(); } };
    document.addEventListener('keydown', key, true);
    const pick = async c => {
      if (stage === 'call' && (c === 'heads' || c === 'tails')){
        stage = 'flip'; box.querySelector('.ct-btns').innerHTML = '';
        const res = rnd() < .5 ? 'heads' : 'tails', won = res === c;
        box.querySelector('.ct-sub').textContent = `${AB(G.U)} calls ${c.toUpperCase()}…`;
        await flipCoin(res);
        if (e !== EPOCH || !G) return done('u');
        box.querySelector('.ct-res').textContent = res.toUpperCase();
        if (won){ stage = 'choose'; set(`${TN(G.U)} win the toss${ot ? ' · sudden death' : ''}`, [['recv', 'Receive', '1'], ...(ot ? [] : [['kick', 'Defer · Kick Off', '2']])]); }
        else { box.querySelector('.ct-sub').textContent = `${TN(G.T)} win the toss and will receive`; await wait(1500); done('t'); }
        return;
      }
      if (stage === 'choose'){ toast(c === 'recv' ? `${AB(G.U)} WILL RECEIVE` : `${AB(G.U)} DEFER · KICKING OFF`, 'g'); done(c === 'recv' ? 'u' : 't'); }
    };
    box.querySelector('.ct-res').textContent = '';
    box.querySelector('.ct-h').textContent = ot ? 'Overtime Coin Toss' : 'Coin Toss';
    const coin = box.querySelector('.coin'); coin.getAnimations().forEach(a => a.cancel()); coin.style.transform = '';
    box.hidden = false;
    set(`${TN(G.U)}, call it in the air`, [['heads', 'Heads', '1'], ['tails', 'Tails', '2']]);
  });
}
function flipCoin(res){
  const coin = $('#coin .coin'), toss = $('#coin .toss');
  const turns = 7 * 360 + (res === 'tails' ? 180 : 0), ms = reduced() ? 10 : 1900;
  return new Promise(r => {
    const a = coin.animate([{ transform:'rotateX(0deg)' }, { transform:`rotateX(${turns}deg)` }], { duration:ms, easing:'cubic-bezier(.2,.65,.35,1)', fill:'forwards' });
    toss.animate([{ transform:'translateY(0) scale(1)' }, { transform:'translateY(-150px) scale(1.15)', offset:.45 }, { transform:'translateY(0) scale(1)', offset:.85 }, { transform:'translateY(-12px) scale(1)', offset:.92 }, { transform:'translateY(0) scale(1)' }], { duration:ms, easing:'ease-in-out' });
    a.onfinish = () => setTimeout(r, reduced() ? 0 : 350);
  });
}
function halftime(){
  endDrive('half'); G.fat = {};
  if (MP) return NET.enter({ kind:'half' });
  show('half');
  $('#half-h').textContent = 'Halftime';
  $('#half-b').innerHTML = scoreBlock() + statTable() + `<div class="adj"><span class="hud">HALFTIME ADJUSTMENTS · OFFENSE</span><div class="chips">${Object.entries(PLAN_O).map(([k, v]) => `<button class="chip" aria-pressed="${G.plan.u.o === k}" data-ho="${k}">${v[0]}</button>`).join('')}</div></div>`
    + `<div class="adj"><span class="hud">HALFTIME ADJUSTMENTS · DEFENSE</span><div class="chips">${Object.entries(PLAN_D).map(([k, v]) => `<button class="chip" aria-pressed="${G.plan.u.d === k}" data-hd="${k}">${v[0]}</button>`).join('')}</div></div>`
    + `<div class="go-row" style="padding:0 14px"><button class="pb pill big" id="h2"><i class="ps x">✕</i>Start 2nd Half</button></div>`;
  $('#half-b').querySelectorAll('[data-ho]').forEach(b => b.onclick = () => { G.plan.u.o = b.dataset.ho; halftime(); });
  $('#half-b').querySelectorAll('[data-hd]').forEach(b => b.onclick = () => { G.plan.u.d = b.dataset.hd; halftime(); });
  $('#h2').onclick = () => secondHalf();
  // the AI adjusts too
  const d = G.sc.t - G.sc.u; G.plan.t.o = d < -10 ? 'air' : d > 10 ? 'ground' : 'bal'; G.plan.t.d = d > 7 ? 'bend' : d < -7 ? 'agg' : 'base';
}
function secondHalf(){
  if (!G || G.q !== 2) return;
  G.q = 3; G.clock = G.qlen; G.to = { u:3, t:3 };
  show('game');
  const recv = opp(G.recv1);
  kickoff(recv, opp(recv));
}
function scoreBlock(){
  const u = G.sc.u, t = G.sc.t;
  return `<div class="final-score"><div class="side l"><div class="nm">${esc(TN(G.U))}</div><div class="mg">${esc(G.U.m)}</div><span class="lcd${u > t ? ' win' : ''}">${u}</span></div><div class="vs">VS</div><div class="side r"><div class="nm">${esc(TN(G.T))}</div><div class="mg">${esc(G.T.m)}</div><span class="lcd${t > u ? ' win' : ''}">${t}</span></div></div>`;
}
function statTable(){
  const a = G.st.u, b = G.st.t;
  const top = s => mmss(s);
  const rows = [
    ['Total yards', a.yds, b.yds, 1], ['Passing', `${a.cmp}/${a.att} · ${a.pyds}`, `${b.cmp}/${b.att} · ${b.pyds}`, 0, a.pyds, b.pyds], ['Rushing', `${a.ratt}-${a.ryds}`, `${b.ratt}-${b.ryds}`, 0, a.ryds, b.ryds],
    ['First downs', a.fd, b.fd, 1], ['3rd down', `${a.c3}/${a.a3}`, `${b.c3}/${b.a3}`, 0, a.a3 ? a.c3 / a.a3 : 0, b.a3 ? b.c3 / b.a3 : 0], ['Turnovers', a.to, b.to, -1], ['Sacks taken', a.sacks, b.sacks, -1], ['Possession', top(a.top), top(b.top), 0, a.top, b.top], ['Plays', a.plays, b.plays, 0]
  ];
  return `<div class="tbl"><table class="stats"><thead><tr><th>Team stats</th><th>${esc(AB(G.U))}</th><th>${esc(AB(G.T))}</th></tr></thead><tbody>${rows.map(r => {
    const va = r[4] != null ? r[4] : r[1], vb = r[5] != null ? r[5] : r[2], dir = r[3] || (r[4] != null ? 1 : 0);
    const ua = dir && va !== vb && (dir > 0 ? va > vb : va < vb), ub = dir && va !== vb && !ua;
    return `<tr><td>${r[0]}</td><td class="${ua ? 'up' : 'u'}">${r[1]}</td><td class="${ub ? 'up' : 't'}">${r[2]}</td></tr>`; }).join('')}</tbody></table></div>`;
}
function driveTable(){
  const a = G.drv.u, b = G.drv.t, pc = (x, n) => n ? ` <small>${Math.round(x / n * 100)}%</small>` : '';
  const rows = [['Drives', a.n, b.n], ['Touchdowns', a.td + pc(a.td, a.n), b.td + pc(b.td, b.n)], ['Field goals', a.fg, b.fg], ['Missed FGs', a.miss, b.miss], ['Punts', a.punt, b.punt], ['Turnovers', a.to, b.to], ['Turnover on downs', a.downs, b.downs], ['End of half', a.half, b.half], ['Plays per drive', a.n ? (a.plays / a.n).toFixed(1) : '–', b.n ? (b.plays / b.n).toFixed(1) : '–']];
  return `<div class="tbl"><table class="stats"><thead><tr><th>Drives</th><th>${esc(AB(G.U))}</th><th>${esc(AB(G.T))}</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td class="u">${r[1]}</td><td class="t">${r[2]}</td></tr>`).join('')}</tbody></table></div>`;
}
function playerTable(side){
  const pl = Object.values(G.st[side].pl);
  const row = (p, line) => `<tr><td><b>${esc(p.n)}</b> <small>${p.pos || ''}</small></td><td>${line}</td></tr>`;
  const qb = pl.filter(p => p.pa > 0).map(p => row(p, `${p.pc}/${p.pa} · ${p.py} yds · ${p.ptd} TD${p.pint ? ' · ' + p.pint + ' INT' : ''}`));
  const ru = pl.filter(p => p.ra > 0).sort((x, y) => y.ry - x.ry).map(p => row(p, `${p.ra} car · ${p.ry} yds${p.rtd ? ' · ' + p.rtd + ' TD' : ''}`));
  const rc = pl.filter(p => p.rc > 0).sort((x, y) => y.rcy - x.rcy).map(p => row(p, `${p.rc} rec · ${p.rcy} yds${p.rctd ? ' · ' + p.rctd + ' TD' : ''}`));
  const sec = (h, r) => r.length ? `<tr class="sh"><th colspan="2">${h}</th></tr>${r.join('')}` : '';
  const body = sec('Passing', qb) + sec('Rushing', ru) + sec('Receiving', rc);
  return `<div class="tbl"><table class="stats pl ${side}"><thead><tr><th colspan="2">${esc(TN(TM(side)))}</th></tr></thead><tbody>${body || '<tr><td colspan="2">No stats yet</td></tr>'}</tbody></table></div>`;
}
const KEYS_HC0 = [
  ['Play call', [['1–9', 'Pick a card'], ['Enter / Space', "Call the coordinator's pick"], ['R', 'Run plays'], ['F', 'Pass plays'], ['Backspace', 'Back to Run / Pass'], ['M', 'Flip the play'], ['A', 'OC / DC Auto on or off'], ['U', 'Audibles on or off']]],
  ['During your pass play', [['1–5', 'Throw it to that receiver (same numbers as at the line; shown on the name plates)'], ['Tap a receiver', 'Throw it to him']]],
  ['Special teams', [['K', 'Field goal / extra point'], ['N', 'Punt'], ['X', 'Go for two'], ['V', 'Kneel']]],
  ['At the line (audibles)', [['1–5', 'Select a receiver'], ['0–9', 'Pick a route off the tree'], ['T', 'Make him the primary target'], ['M', 'Flip the play'], ['S', 'Save the play'], ['Enter / Space', 'Snap'], ['Esc', 'Change play']]],
  ['Anytime', [['C', 'Change camera'], ['T', 'Timeout'], ['Esc / P', 'Pause (Esc also cancels Auto)'], ['H / ?', 'This list']]]
];
const KEYS_HC = KEYS_HC0;
const KEYS = MP ? KEYS_HC : [
  ['Player mode · at the line', [['Space', 'Snap the ball (CPU snaps when you are on defense)'], ['Tab', 'Defense: pick your man before the snap']]],
  ['Player mode · quarterback', [['1–5', 'Throw to that receiver. Tap = lob over the top; hold = bullet, let go when the needle is in the green'], ['WASD / Arrows', 'Move in the pocket or scramble; held while throwing, leads the receiver'], ['Shift', 'Sprint'], ['X', 'Throw it away'], ['Tap a receiver', 'Lob it to him']]],
  ['Player mode · with the ball', [['WASD / Arrows', 'Run'], ['Shift', 'Sprint (tires him out)'], ['Q / E', 'Juke left / right (best just before contact)'], ['Space', 'Spin'], ['F', 'Stiff arm'], ['Z', 'Dive forward / QB slide']]],
  ['Player mode · defense', [['WASD / Arrows', 'Move (the CPU plays your man until you touch it)'], ['Tab / Q', 'Switch to the man nearest the ball'], ['Space', 'Dive tackle'], ['E', 'Hit stick: big hit, can jar it loose'], ['X', 'Play the ball when it is in the air'], ['F', 'Shed a block']]],
  ['Player mode · kicking', [['Hold Space', 'Power: let go at the line in the meter'], ['Space again', 'Aim: stop the needle in the middle']]],
  ['Player mode · gamepad', [['LS', 'Move'], ['RT', 'Sprint'], ['A B X Y RB', 'Receivers 1–5'], ['B / Y / X', 'Spin / stiff arm / dive'], ['RS or LB RB', 'Juke'], ['A / B / X / Y', 'Defense: switch / tackle / hit stick / play the ball']]],
  ...KEYS_HC0
];

function keysPage(){
  return `<div class="statpg"><div class="keys">${KEYS.map(([h, rows]) => `<div class="kgrp"><span class="hud">${h}</span>${rows.map(([k, d]) => `<div class="krow"><span>${k.split(' / ').map(x => `<kbd>${esc(x)}</kbd>`).join(' ')}</span><em>${esc(d)}</em></div>`).join('')}</div>`).join('')}</div><button class="chip" data-m="b">◂ Back</button></div>`;
}
function statsPage(){
  return `<div class="statpg"><div class="sp-score"><span class="u">${esc(AB(G.U))} <b class="lcd">${G.sc.u}</b></span><span class="q">${G.q > 4 ? 'OT' : ord(G.q) + ' QTR'} · ${mmss(G.clock)}</span><span class="t"><b class="lcd">${G.sc.t}</b> ${esc(AB(G.T))}</span></div>`
    + `<div class="sp-grid">${statTable()}${driveTable()}</div><div class="sp-grid">${playerTable('u')}${playerTable('t')}</div>`
    + `<button class="chip" data-m="b">◂ Back</button></div>`;
}
function leaders(side){
  const pl = Object.values(G.st[side].pl);
  const by = f => pl.filter(p => f(p) > 0).sort((a, b) => f(b) - f(a))[0];
  const pass = by(p => p.pa), rush = by(p => p.ry + p.ra * .1), rec = by(p => p.rcy + p.rc * .1);
  const out = [];
  if (pass) out.push(['PASSING', pass.n, `${pass.pc}/${pass.pa} · ${pass.py} yds · ${pass.ptd} TD${pass.pint ? ' · ' + pass.pint + ' INT' : ''}`, 'QB']);
  if (rush) out.push(['RUSHING', rush.n, `${rush.ra} car · ${rush.ry} yds${rush.rtd ? ' · ' + rush.rtd + ' TD' : ''}`, rush.pos === 'QB' ? 'QB' : 'RB']);
  if (rec) out.push(['RECEIVING', rec.n, `${rec.rc} rec · ${rec.rcy} yds${rec.rctd ? ' · ' + rec.rctd + ' TD' : ''}`, rec.pos]);
  return out;
}
async function finalScreen(){
  if (MP) return mpFinal();
  endDrive('half');
  G.over = true; G.busy = true; G.auto = null; showAutoBar(); hideTablet();
  await wait(300);
  const u = G.sc.u, t = G.sc.t, res = u > t ? 'w' : u < t ? 'l' : 'e';
  const tot = G.calls.w + G.calls.l + G.calls.e, pct = tot ? Math.round(G.calls.w / Math.max(1, G.calls.w + G.calls.l) * 100) : 50;
  let sc = 70 + clamp((u - t) * 1.2, -24, 24) + (pct - 50) * .35 - G.st.u.to * 4 + G.st.t.to * 2 + (res === 'w' ? 8 : res === 'l' ? -8 : 0);
  const grade = sc >= 88 ? 'A' : sc >= 76 ? 'B' : sc >= 62 ? 'C' : sc >= 50 ? 'D' : 'F';
  const car = store.get('pttfl-hc-career', { w:0, l:0, t:0, job:60 });
  const before = car.job;
  const delta = Math.round((res === 'w' ? 6 : res === 'l' ? -7 : -1) + ({ A:4, B:2, C:0, D:-2, F:-4 })[grade] + (G.diff === 'allpro' && res === 'w' ? 3 : 0));
  car.job = clamp(car.job + delta, 0, 100); car[res === 'e' ? 't' : res]++; store.set('pttfl-hc-career', car);
  const owner = car.job >= 80 ? 'The owner is thrilled. Season tickets are flying off the shelf.' : car.job >= 55 ? 'The owner likes the direction. Keep it rolling.' : car.job >= 30 ? 'The owner wants a word Monday morning. Bring the playbook.' : 'The owner has stopped returning your calls. Your seat is very hot.';
  const lu = leaders('u'), lt = leaders('t');
  const pog = [...lu.map(x => [...x, 'u']), ...lt.slice(0, 1).map(x => [...x, 't'])];
  show('final');
  $('#final-b').innerHTML = `<div class="bar"><b>FINAL${G.q > 4 ? ' / OT' : ''}</b> // PTTFL STADIUM <span class="r">${esc(DIFF_N[G.diff])} · ${G.qlen / 60} MIN QTRS</span></div>`
    + scoreBlock()
    + `<div class="verdict"><span class="${res}">${res === 'w' ? 'Victory' : res === 'l' ? 'Defeat' : 'Tie'}</span></div>`
    + statTable()
    + `<div class="pogs">${pog.map(p => `<div class="pog p-${p[3]}${p[4] === 't' ? ' t' : ''}"><span class="hud">${p[0]} · ${esc(p[4] === 'u' ? AB(G.U) : AB(G.T))}</span><b>${esc(p[1])}</b><small>${esc(p[2])}</small></div>`).join('')}</div>`
    + `<div class="coach"><div class="grade g-${grade}">${grade}</div><div><span class="hud">COACH REPORT · ${esc(G.U.m)}</span><div class="q">Your offense put up <b>${G.st.u.yds}</b> yards and <b>${G.st.u.fd}</b> first downs with ${G.st.u.to} turnover${G.st.u.to === 1 ? '' : 's'}. ${esc(owner)}</div>`
    + `<div class="job"><span>JOB SECURITY</span><i><b style="width:${before}%"></b></i><em class="${delta >= 0 ? 'up' : 'dn'}">${car.job} (${delta >= 0 ? '+' : ''}${delta})</em></div>`
    + `<div class="hud" style="margin-top:6px;color:#B7B0E0">CAREER ${car.w}-${car.l}${car.t ? '-' + car.t : ''}</div></div></div>`
    + `<div class="go-row" style="padding:0 14px"><button class="pb pill big" id="fr"><i class="ps x">✕</i>Rematch</button><button class="pb pill big" id="fn"><i class="ps s">□</i>New Matchup</button></div>`;
  requestAnimationFrame(() => { const b = $('#final-b .job i b'); if (b) b.style.width = car.job + '%'; });
  $('#fr').onclick = () => startGame();
  $('#fn').onclick = () => toSetup(0);
  camTo({ ...SPOT.goal, x:res === 'l' ? 560 : -560, spin:res === 'l' ? 30 : -30 });
}
const DIFF_N = { rookie:'ROOKIE', pro:'PRO', allpro:'ALL-PRO' };

/* ======================================================================================================
   HEAD-TO-HEAD (multiplayer.html)
   The two browsers talk directly over WebRTC (PeerJS; its free public server only introduces them).
   Rooms 1-8 are fixed names on that server: hosting a room claims its name, the lobby asks each name who's there.
   The host's browser keeps the official game. At each decision both coaches lock a sealed call (the guest sends a
   hash first, the host's call follows, then the guest's is revealed), the random seed for the snap comes from both
   sides' secrets, and both screens play the same snap with the same numbers. The host also sends its game state at
   every decision, so if the two ever drift apart the guest is put back in step.
   ====================================================================================================== */
const NETV = 1, ROOMS = 8, PFX = 'pttfl-hc1-room-';
const TESTNET = /[?&]net=local\b/.test(location.search);
const rid = n => PFX + n;
const randHex = (n = 16) => { const a = new Uint8Array(n); crypto.getRandomValues(a); return [...a].map(x => x.toString(16).padStart(2, '0')).join(''); };
const randSeed = () => { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0]; };
async function sha(s){ const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
const fnv = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); };
// fields that belong to one screen, never to the shared game
const LOCAL_KEYS = new Set(['auto', 'autoSide', 'busy', 'hot', 'flip']);
const serG = g => JSON.stringify(g, function(k, v){ if (this === g){ if (LOCAL_KEYS.has(k)) return undefined; if (k === 'U' || k === 'T') return v && v.id; } return v; });
function adoptG(str){ const o = JSON.parse(str); o.U = byId(o.U); o.T = byId(o.T); for (const k of LOCAL_KEYS) o[k] = G && k in G ? G[k] : (k === 'busy' ? false : null); G = o; }
const lsDel = k => { try { localStorage.removeItem(k); } catch(e){} };
const inviteLink = n => location.origin + location.pathname + '?room=' + n + (TESTNET ? '&net=local' : '');

/* a stand-in for PeerJS between tabs of one browser (add ?net=local): lets two tabs play each other on one computer */
class Emit { constructor(){ this.h = {}; } on(e, f){ (this.h[e] = this.h[e] || []).push(f); return this; } emit(e, ...a){ (this.h[e] || []).slice().forEach(f => { try { f(...a); } catch(err){ console.error(err); } }); } }
class FakeConn extends Emit {
  constructor(peer, cid, remote, metadata){ super(); this.peer = peer; this.cid = cid; this.peer2 = remote; this.metadata = metadata; this.open = false; }
  send(data){ if (this.open) this.peer.ch.postMessage({ type:'data', cid:this.cid, to:this.peer2, data:JSON.stringify(data) }); }
  close(){ if (this.gone) return; this.gone = true; this.open = false; delete this.peer.conns[this.cid]; this.peer.ch.postMessage({ type:'close', cid:this.cid, to:this.peer2 }); setTimeout(() => this.emit('close'), 0); }
}
class FakePeer extends Emit {
  constructor(id){
    super(); this.id = id || 'anon-' + randHex(6); this.conns = {}; this.destroyed = false; this.open = false;
    this.ch = new BroadcastChannel('hc-fakenet'); this.ch.onmessage = ev => this.onMsg(ev.data);
    if (id){ this.nonce = randHex(4); this.ch.postMessage({ type:'who', id, nonce:this.nonce });
      setTimeout(() => { if (this.destroyed) return; if (this.taken) return this.emit('error', { type:'unavailable-id', message:'ID "' + id + '" is taken' }); this.open = true; this.emit('open', this.id); }, 250); }
    else setTimeout(() => { this.open = true; this.emit('open', this.id); }, 30);
  }
  onMsg(m){
    if (this.destroyed) return;
    if (m.type === 'who' && m.id === this.id && this.open) this.ch.postMessage({ type:'taken', nonce:m.nonce });
    else if (m.type === 'taken' && m.nonce === this.nonce) this.taken = true;
    else if (m.type === 'conn' && m.to === this.id && this.open){
      const c = new FakeConn(this, m.cid, m.from, m.metadata); c.open = true; this.conns[m.cid] = c;
      this.ch.postMessage({ type:'ack', cid:m.cid, to:m.from }); this.emit('connection', c); setTimeout(() => c.emit('open'), 0);
    }
    else if (m.type === 'ack' && m.to === this.id){ const c = this.conns[m.cid]; if (c && !c.open){ c.acked = c.open = true; c.emit('open'); } }
    else if (m.type === 'data' && m.to === this.id){ const c = this.conns[m.cid]; if (c && c.open) c.emit('data', JSON.parse(m.data)); }
    else if (m.type === 'close' && m.to === this.id){ const c = this.conns[m.cid]; if (c){ c.gone = true; c.open = false; delete this.conns[m.cid]; c.emit('close'); } }
    else if (m.type === 'gone'){ for (const c of Object.values(this.conns)) if (c.peer2 === m.id){ c.gone = true; c.open = false; delete this.conns[c.cid]; c.emit('close'); } }
  }
  connect(remote, opts = {}){
    const cid = randHex(6), c = new FakeConn(this, cid, remote, opts.metadata); this.conns[cid] = c;
    this.ch.postMessage({ type:'conn', cid, from:this.id, to:remote, metadata:opts.metadata });
    setTimeout(() => { if (!c.acked && !this.destroyed && !c.gone){ delete this.conns[cid]; this.emit('error', { type:'peer-unavailable', message:'Could not connect to peer ' + remote }); } }, 1200);
    return c;
  }
  reconnect(){}
  destroy(){ if (this.destroyed) return; for (const c of Object.values(this.conns)) c.close(); this.ch.postMessage({ type:'gone', id:this.id }); this.destroyed = true; setTimeout(() => this.ch.close(), 50); }
}
const peerLib = () => window.Peer || (window.peerjs && window.peerjs.Peer) || null;
async function waitLib(){ if (TESTNET) return true; for (let i = 0; i < 60 && !peerLib(); i++) await new Promise(r => setTimeout(r, 200)); return !!peerLib(); }
function newPeer(id){
  if (TESTNET) return new FakePeer(id);
  const P = peerLib(), o = { debug:1 };
  return id ? new P(id, o) : new P(o);
}

/* ---------------- connection overlay ---------------- */
function netOv(title, msg, btns){
  const o = $('#netov'); o.hidden = false; $('#no-h').textContent = title; $('#no-msg').textContent = msg;
  const b = $('#no-btns'); b.innerHTML = (btns || []).map((x, i) => `<button class="spb${x[2] ? ' ' + x[2] : ''}" data-i="${i}">${esc(x[0])}</button>`).join('');
  b.querySelectorAll('button').forEach(x => x.onclick = () => { const f = btns[+x.dataset.i][1]; if (f) f(); });
}
const hideNetOv = () => { $('#netov').hidden = true; };

const NET = {
  role:null, peer:null, lobbyPeer:null, conn:null, room:0, L:null, n:0, dec:null, inbox:[], token:null,
  rooms:{}, joining:0, retryT:null, pendingResume:false, desyncs:0, rematch:{ u:false, t:false }, halfPlan:null, closing:false,
  name(){ const v = ($('#lb-name') && $('#lb-name').value || store.get('hc-mp-name', '') || '').trim(); return v.slice(0, 18) || 'Coach'; },
  send(m){ const c = NET.conn; if (c && c.open){ try { c.send(m); } catch(e){ console.warn('send failed', e); } } },
  pub(){ const L = JSON.parse(JSON.stringify(NET.L)); for (const s of ['u', 't']) if (L[s]) delete L[s].token; return L; },

  /* ---------- lobby ---------- */
  async toLobby(){
    show('lobby'); camTo(SPOT.title); hideNetOv();
    const nm = $('#lb-name'); nm.value = store.get('hc-mp-name', ''); nm.oninput = () => store.set('hc-mp-name', nm.value.trim());
    const wb = $('#lb-work'); const wr = () => { wb.textContent = 'Work Mode: ' + (WORK ? 'On' : 'Off'); wb.setAttribute('aria-pressed', WORK); };
    wr(); wb.onclick = () => { WORK = !WORK; try { localStorage.setItem('pttfl-work', WORK ? '1' : '0'); } catch(e){} wr(); NET.renderLobby(); };
    $('#lb-refresh').onclick = () => NET.probeAll();
    $('#lb-note').textContent = 'Host a room and send your friend the link, or join a room someone is hosting. Your browsers connect to each other directly; nobody needs an account. If a game won’t connect, try a different network (some work and school Wi-Fi blocks it).';
    NET.renderResume(); NET.renderLobby();
    if (!(await NET.ensureLobbyPeer())) return;
    // an invite link: join right away when we already know your name, otherwise ask for it first
    const q = /[?&]room=(\d+)/.exec(location.search), n = q ? +q[1] : 0;
    if (n >= 1 && n <= ROOMS && !NET.invited){ NET.invited = true;
      if (store.get('hc-mp-name', '')) return NET.joinRoom(n);
      $('#lb-resume').insertAdjacentHTML('afterbegin', `<div class="panel lb-res inv"><span>You’re invited to <b>Room ${n}</b>. Type your name above, then join.</span><button class="spb" id="lb-inv">Join Room ${n}</button></div>`);
      $('#lb-inv').onclick = () => NET.joinRoom(n); $('#lb-name').focus();
    }
    NET.probeAll();
    clearInterval(NET.probeT); NET.probeT = setInterval(() => { if (SCR === 'lobby' && !document.hidden) NET.probeAll(); }, 20000);
  },
  async ensureLobbyPeer(){
    if (NET.lobbyPeer && !NET.lobbyPeer.destroyed) return true;
    $('#lb-net').textContent = 'CONNECTING…';
    if (!(await waitLib())){ $('#lb-net').textContent = 'OFFLINE'; netOv('Can’t go online', 'The multiplayer library didn’t load. Check your connection and reload the page.', [['Reload', () => location.reload()]]); return false; }
    const p = NET.lobbyPeer = newPeer();
    return new Promise(res => {
      let done = false; const fin = v => { if (!done){ done = true; res(v); } };
      p.on('open', () => { $('#lb-net').textContent = 'ONLINE'; fin(true); });
      p.on('disconnected', () => { setTimeout(() => { if (!p.destroyed) try { p.reconnect(); } catch(e){} }, 1500); });
      p.on('error', err => {
        const t = err && err.type;
        if (t === 'peer-unavailable'){ const m = /(\S+)$/.exec(String(err.message || '')), id = m && m[1]; const n = id && id.startsWith(PFX) ? +id.slice(PFX.length) : 0; if (n) NET.peerGone(n); return; }
        if (['network', 'server-error', 'socket-error', 'socket-closed', 'browser-incompatible'].includes(t)){ $('#lb-net').textContent = 'OFFLINE'; if (!done){ fin(false); netOv('Can’t reach the matchmaking server', t === 'browser-incompatible' ? 'This browser can’t make direct connections. Try Chrome, Edge, Firefox or Safari.' : 'Check your internet connection, then try again.', [['Try Again', () => { hideNetOv(); try { p.destroy(); } catch(e){} NET.lobbyPeer = null; NET.toLobby(); }]]); } }
      });
      setTimeout(() => fin(!!p.open), 15000);
    });
  },
  peerGone(n){
    const r = NET.rooms[n] || (NET.rooms[n] = {});
    if (r.st === 'checking') { r.st = 'empty'; NET.renderLobby(); }
    if (NET.role === 'guest' && NET.room === n && !(NET.conn && NET.conn.open)){
      if (NET.retryT) return;   // still trying to get back in; keep at it
      NET.role = null; NET.room = 0;
      netOv(`Room ${n} isn’t open`, 'Nobody is hosting that room right now. You can host it yourself and send your friend the link.', [[`Host Room ${n}`, () => { hideNetOv(); NET.hostRoom(n); }], ['Back to Lobby', () => { hideNetOv(); NET.toLobby(); }, 'alt']]);
    }
  },
  probeAll(){ for (let n = 1; n <= ROOMS; n++) NET.probe(n); },
  probe(n){
    const p = NET.lobbyPeer; if (!p || p.destroyed || !p.open) return;
    const r = NET.rooms[n] = { ...(NET.rooms[n] || {}), st:'checking' }; NET.renderLobby();
    let c; try { c = p.connect(rid(n), { metadata:{ probe:true }, serialization:'json', reliable:true }); } catch(e){ r.st = 'unknown'; return; }
    c.on('data', m => { if (m && m.t === 'info'){ NET.rooms[n] = { ...m, st:m.status }; NET.renderLobby(); try { c.close(); } catch(e){} } });
    setTimeout(() => { if (NET.rooms[n] && NET.rooms[n].st === 'checking'){ NET.rooms[n].st = 'unknown'; NET.renderLobby(); } try { c.close(); } catch(e){} }, 9000);
  },
  renderResume(){
    const box = $('#lb-resume'), h = store.get('hc-mp-host', null), g = store.get('hc-mp-guest', null), fresh = x => x && Date.now() - x.ts < 3 * 3600e3;
    let s = '';
    if (fresh(h)) s += `<div class="panel lb-res"><span>You were hosting <b>Room ${h.room}</b>${h.L && h.L.phase === 'game' ? ' with a game in progress' : ''}.</span><button class="spb" data-r="h">Resume</button><button class="spb alt" data-r="hx">Close It</button></div>`;
    if (fresh(g)) s += `<div class="panel lb-res"><span>You were playing in <b>Room ${g.room}</b>.</span><button class="spb" data-r="g">Rejoin</button><button class="spb alt" data-r="gx">Forget It</button></div>`;
    box.innerHTML = s;
    box.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { const r = b.dataset.r;
      if (r === 'h') NET.hostRoom(h.room, h); if (r === 'hx'){ lsDel('hc-mp-host'); NET.renderResume(); }
      if (r === 'g') NET.joinRoom(g.room); if (r === 'gx'){ lsDel('hc-mp-guest'); NET.renderResume(); } });
  },
  renderLobby(){
    if (SCR !== 'lobby') return;
    const g = store.get('hc-mp-guest', null);
    const tn = id => { const t = byId(id); return t ? TN(t) : ''; };
    $('#rooms').innerHTML = Array.from({ length:ROOMS }, (_, i) => {
      const n = i + 1, r = NET.rooms[n] || { st:'checking' }, mine = g && g.room === n;
      let tag = 'CHECKING', body = '<span class="rmsub">Looking…</span>', btn = '';
      if (r.st === 'empty' || r.st === 'unknown'){ tag = r.st === 'empty' ? 'OPEN ROOM' : 'NO ANSWER'; body = `<span class="rmsub">${r.st === 'empty' ? 'Nobody here yet' : 'Couldn’t check this room'}</span>`; btn = `<button class="spb" data-h="${n}">Host Here</button>`; }
      if (r.st === 'open'){ tag = 'WAITING'; body = `<b>${esc(r.host)}</b><span class="rmsub">${esc(tn(r.team))}</span>`; btn = `<button class="spb" data-j="${n}">Join</button>`; }
      if (r.st === 'full' || r.st === 'game'){ tag = r.st === 'game' ? 'IN GAME' : 'FULL'; body = `<b>${esc(r.host)} vs ${esc(r.guest || '…')}</b><span class="rmsub">${esc(tn(r.team))} vs ${esc(tn(r.gteam))}</span>`; btn = mine ? `<button class="spb" data-j="${n}">Rejoin</button>` : ''; }
      return `<div class="rmcard ${r.st}"><div class="rmn"><span class="hud">ROOM</span><b class="lcd">${n}</b></div><div class="rmb"><span class="rmtag">${tag}</span>${body}</div>${btn}</div>`;
    }).join('');
    $('#rooms').querySelectorAll('[data-h]').forEach(b => b.onclick = () => NET.hostRoom(+b.dataset.h));
    $('#rooms').querySelectorAll('[data-j]').forEach(b => b.onclick = () => NET.joinRoom(+b.dataset.j));
  },

  /* ---------- hosting ---------- */
  async hostRoom(n, save){
    if (NET.role) return;
    if (!(await waitLib())) return NET.toLobby();
    store.set('hc-mp-name', NET.name());
    NET.role = 'host'; NET.room = n; ME = 'u'; NET.closing = false;
    netOv(`Room ${n}`, save ? 'Getting your room back…' : 'Opening the room…', []);
    let tries = 0;
    const attempt = () => {
      const p = NET.peer = newPeer(rid(n));
      p.on('open', () => { tries = -1; hideNetOv(); NET.hosting(save); });
      p.on('connection', c => NET.hostOnConn(c));
      p.on('disconnected', () => { setTimeout(() => { if (!p.destroyed && NET.peer === p) try { p.reconnect(); } catch(e){} }, 1500); });
      p.on('error', err => {
        const t = err && err.type;
        if (t === 'unavailable-id'){
          try { p.destroy(); } catch(e){}
          // after a reload the server can take a little while to let go of the old connection
          if (save && tries >= 0 && ++tries < 25) return setTimeout(attempt, 2500);
          NET.role = null; NET.room = 0; NET.peer = null;
          netOv(`Room ${n} is taken`, save ? 'Someone else is hosting this room now.' : 'Someone just started hosting this room. Pick another one, or join theirs.', [['Back to Lobby', () => { hideNetOv(); NET.toLobby(); }]]);
          if (save) lsDel('hc-mp-host');
          return;
        }
        if (t === 'peer-unavailable') return;
        console.warn('host peer error', t, err);
      });
    };
    attempt();
  },
  hosting(save){
    const n = NET.room;
    if (save && save.L){
      NET.L = save.L; NET.L.room = n;
      if (save.L.phase === 'game' && save.G && save.meta){
        EPOCH++; PAUSED = false; PQ = []; ANIM = null;
        G = null; adoptG(save.G); show('game'); showAutoBar(); lastForm = ''; placeLines(); updateHUD(); camGame(fieldX(G.ball), wdir(G.poss));
        NET.n = save.n - 1; NET.dec = null; NET.inbox = [];
        netOv('Waiting for your opponent', 'Your game is back. Waiting for your opponent to reconnect…', [['End Game', () => NET.endGameNoGuest(), 'alt']]);
        NET.enter(save.meta);
        return;
      }
      if (save.L.phase === 'final' && save.G){ G = null; adoptG(save.G); G.over = true; NET.n = save.n; NET.renderFinal(); return; }
      NET.L.phase = 'lobby';
      return NET.showRoom();
    }
    const myTeam = byId(store.get('hc-u', '')) ? store.get('hc-u', '') : TEAMS[0].id;
    NET.L = { room:n, qlen:[3, 5, 8].includes(SET.qlen) ? SET.qlen : 5, phase:'lobby', u:{ name:NET.name(), team:myTeam, o:'bal', d:'base', ready:true }, t:null };
    NET.saveHost(); NET.showRoom();
  },
  hostOnConn(c){
    const md = c.metadata || {};
    if (md.probe){ c.on('open', () => { const L = NET.L; c.send({ t:'info', v:NETV, room:NET.room, status:!L ? 'open' : L.phase !== 'lobby' ? 'game' : L.t ? 'full' : 'open', host:L ? L.u.name : NET.name(), team:L && L.u.team, guest:L && L.t ? L.t.name : '', gteam:L && L.t ? L.t.team : '' }); setTimeout(() => { try { c.close(); } catch(e){} }, 1500); }); return; }
    c.on('data', m => NET.hostRecv(c, m));
    c.on('close', () => { if (NET.conn === c){ NET.conn = null; NET.hostLostGuest(); } });
  },
  hostRecv(c, m){
    if (!m || typeof m !== 'object') return;
    const L = NET.L; if (!L) return;
    if (m.t === 'hello'){
      const same = L.t && m.token && m.token === L.t.token;
      if (!same && (L.t || L.phase !== 'lobby')){ c.send({ t:'full' }); setTimeout(() => { try { c.close(); } catch(e){} }, 800); return; }
      if (NET.conn && NET.conn !== c){ const old = NET.conn; NET.conn = null; try { old.close(); } catch(e){} }
      NET.conn = c; hideNetOv();
      if (same){
        L.t.name = String(m.name || L.t.name).slice(0, 18);
        toast(`${L.t.name.toUpperCase()} IS BACK`, 'g');
        if (L.phase === 'game'){ const d = NET.dec; if (d && !d.done) NET.sendState(); else NET.pendingResume = true; }
        else if (L.phase === 'final') c.send({ t:'state', phase:'final', n:NET.n, G:serG(G), L:NET.pub(), rm:NET.rematch });
        else { NET.sendLobby(); NET.showRoom(); }
        return;
      }
      const opts = TEAMS.filter(t => t.id !== L.u.team), pref = store.get('hc-u', '');
      L.t = { name:String(m.name || 'Coach').slice(0, 18), token:String(m.token || ''), team:(opts[0] || TEAMS[0]).id, o:'bal', d:'base', ready:false };
      if (m.team && byId(m.team) && m.team !== L.u.team) L.t.team = m.team; else if (pref && pref !== L.u.team && byId(pref)) L.t.team = (opts.find(t => t.id !== pref) || opts[0]).id;
      toast(`${L.t.name.toUpperCase()} JOINED`, 'g');
      NET.sendLobby(); NET.saveHost(); NET.showRoom();
      return;
    }
    if (c !== NET.conn) return;
    if (m.t === 'g' && L.t && L.phase === 'lobby'){
      if (m.team && byId(m.team) && m.team !== L.u.team) L.t.team = m.team;
      if (PLAN_O[m.o]) L.t.o = m.o; if (PLAN_D[m.d]) L.t.d = m.d;
      if (typeof m.ready === 'boolean') L.t.ready = m.ready;
      NET.sendLobby(); NET.saveHost(); NET.renderRoom(); return;
    }
    if (m.t === 'bye') return NET.oppLeft();
    if (m.t === 'rematch'){ NET.rematch.t = true; NET.send({ t:'rmst', r:NET.rematch }); NET.renderFinal(); if (NET.rematch.u) NET.startMatch(); return; }
    if (m.t === 'toRoom') return NET.backToRoom();
    NET.onGame(m);
  },
  hostLostGuest(){
    const L = NET.L; if (!L || NET.closing) return;
    if (L.phase === 'lobby'){ toast(`${(L.t ? L.t.name : 'OPPONENT').toUpperCase()} LEFT`, 'p'); L.t = null; NET.saveHost(); NET.renderRoom(); return; }
    netOv('Opponent disconnected', `Waiting for ${L.t ? L.t.name : 'your opponent'} to come back. Their seat is saved, and the game picks up where it left off.`, [['End Game', () => NET.endGameNoGuest(), 'alt']]);
  },
  endGameNoGuest(){ hideNetOv(); EPOCH++; PAUSED = false; ANIM = null; const L = NET.L; L.t = null; L.phase = 'lobby'; NET.dec = null; NET.saveHost(); NET.showRoom(); },
  sendLobby(){ NET.send({ t:'lobby', L:NET.pub() }); },
  saveHost(gs){
    if (NET.role !== 'host' || !NET.L) return;
    const d = NET.dec, keep = { room:NET.room, L:NET.L, ts:Date.now() };
    if (NET.L.phase !== 'lobby' && G){ keep.G = gs || serG(G); keep.n = NET.n; keep.meta = d ? { kind:d.kind, w:d.w, res:d.res } : null; }
    store.set('hc-mp-host', keep);
  },

  /* ---------- joining ---------- */
  async joinRoom(n){
    if (NET.role) return;
    store.set('hc-mp-name', NET.name());
    if (!(await NET.ensureLobbyPeer())) return;
    const g = store.get('hc-mp-guest', null);
    NET.role = 'guest'; NET.room = n; ME = 't'; NET.closing = false; NET.L = null;
    NET.token = g && g.room === n && g.token ? g.token : randHex(12);
    store.set('hc-mp-guest', { room:n, token:NET.token, ts:Date.now() });
    netOv(`Room ${n}`, 'Joining…', [['Cancel', () => { NET.leave(); }, 'alt']]);
    NET.connectHost();
  },
  connectHost(){
    const p = NET.lobbyPeer; if (!p || p.destroyed){ NET.lobbyPeer = null; NET.ensureLobbyPeer().then(ok => { if (ok) NET.connectHost(); }); return; }
    if (NET.pending && !NET.pending.open){ try { NET.pending.close(); } catch(e){} }
    const c = NET.pending = p.connect(rid(NET.room), { metadata:{ join:true }, serialization:'json', reliable:true });
    c.on('open', () => {
      if (NET.role !== 'guest'){ try { c.close(); } catch(e){} return; }
      NET.pending = null; NET.conn = c; clearInterval(NET.retryT); NET.retryT = null;
      c.send({ t:'hello', v:NETV, name:NET.name(), token:NET.token, team:store.get('hc-u', '') });
      netOv(`Room ${NET.room}`, 'Connected. Getting the room (if a game is on, you’re back in at the next snap)…', []);
    });
    c.on('data', m => { if (NET.conn === c) NET.guestRecv(m); });
    c.on('close', () => { if (NET.conn === c){ NET.conn = null; NET.guestLost(); } });
  },
  guestLost(){
    if (NET.closing || NET.role !== 'guest') return;
    netOv('Connection lost', 'Trying to get back to the host… This usually takes a few seconds.', [['Leave', () => NET.leave(), 'alt']]);
    if (NET.retryT) return;
    const t0 = Date.now();
    NET.retryT = setInterval(() => {
      if (NET.conn && NET.conn.open){ clearInterval(NET.retryT); NET.retryT = null; return; }
      if (Date.now() - t0 > 5 * 60e3){ clearInterval(NET.retryT); NET.retryT = null; netOv('Couldn’t reach the host', 'The host may have closed the game.', [['Back to Lobby', () => NET.leave()]]); return; }
      NET.connectHost();
    }, 3500);
    NET.connectHost();
  },
  guestRecv(m){
    if (!m || typeof m !== 'object') return;
    if (m.t === 'full'){ NET.closing = true; const n = NET.room; NET.role = null; NET.room = 0; lsDel('hc-mp-guest'); try { NET.conn.close(); } catch(e){} NET.conn = null; netOv(`Room ${n} is full`, 'Someone else is already playing in that room.', [['Back to Lobby', () => { hideNetOv(); NET.toLobby(); }]]); return; }
    if (m.t === 'lobby'){ NET.L = m.L; store.set('hc-mp-guest', { room:NET.room, token:NET.token, ts:Date.now() });
      if (m.L.phase === 'lobby'){ if (SCR !== 'room'){ EPOCH++; PAUSED = false; ANIM = null; G = null; } hideNetOv(); NET.showRoom(); } return; }
    if (m.t === 'start') return NET.begin(m.L, m.seed);
    if (m.t === 'state') return NET.adoptState(m);
    if (m.t === 'bye'){ NET.closing = true; const n = NET.room; NET.role = null; NET.room = 0; lsDel('hc-mp-guest'); try { NET.conn && NET.conn.close(); } catch(e){} NET.conn = null; EPOCH++; netOv('The host left', `Room ${n} was closed by the host.`, [['Back to Lobby', () => { hideNetOv(); toTitle(); }]]); return; }
    if (m.t === 'rmst'){ NET.rematch = m.r; if (SCR === 'final') NET.renderFinal(); return; }
    NET.onGame(m);
  },

  /* ---------- the room screen (both sides) ---------- */
  showRoom(){ if (SCR !== 'room'){ EPOCH++; PAUSED = false; ANIM = null; hideTablet(); $('#coin').hidden = true; show('room'); camTo(SPOT.press); } hideNetOv(); NET.renderRoom(); },
  setMine(patch){
    const L = NET.L; if (!L || L.phase !== 'lobby') return;
    const me = L[ME], other = L[opp(ME)]; if (!me) return;
    if (patch.team && other && patch.team === other.team) return;
    if (patch.team) store.set('hc-u', patch.team);
    Object.assign(me, patch);
    if (NET.role === 'host'){ NET.sendLobby(); NET.saveHost(); }
    else NET.send({ t:'g', ...patch });
    NET.renderRoom();
  },
  renderRoom(){
    const L = NET.L; if (!L || SCR !== 'room') return;
    const host = NET.role === 'host', me = L[ME];
    $('#rm-h').textContent = `Room ${L.room}`;
    $('#rm-link').value = inviteLink(L.room);
    $('#rm-copy').onclick = () => { const v = $('#rm-link').value; const ok = () => toast('INVITE LINK COPIED', 'g');
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(ok, () => { $('#rm-link').select(); }); else { $('#rm-link').select(); try { document.execCommand('copy'); ok(); } catch(e){} } };
    $('#rm-status').textContent = host ? (!L.t ? 'WAITING FOR OPPONENT' : L.t.ready ? 'OPPONENT READY' : 'OPPONENT PICKING') : (L.t && L.t.ready ? 'YOU’RE READY' : 'PICK A TEAM, THEN READY UP');
    const bar = (l, v) => `<div class="rb"><span>${l}</span><i><b style="width:${clamp((v - 55) / 42 * 100, 4, 100)}%"></b></i><em>${v}</em></div>`;
    const card = side => {
      const s = L[side], label = side === 'u' ? 'HOME · HOST' : 'AWAY';
      if (!s) return `<div class="bar"><b>${label}</b></div><div class="rm-empty">Waiting for an opponent…<br><small>Send them the invite link, or they can pick Room ${L.room} in the lobby.</small></div>`;
      const t = byId(s.team), rdy = side === 'u' || s.ready;
      return `<div class="bar"><b>${label}</b> // ${esc(s.name)}${side === ME ? ' (YOU)' : ''} <span class="r">${rdy ? 'READY' : 'NOT READY'}</span></div>`
        + `<div class="tnm">${esc(TN(t))}</div><div class="mgr">${esc(t.m)} · ${esc(t.r)}</div><div class="ovr"><span class="hud">OVERALL</span><span class="lcd win">${t.rt.ovr}</span></div>`
        + `<div class="rbars">${bar('PASS', t.rt.pass)}${bar('RUN', t.rt.run)}${bar('DEFENSE', t.rt.dfn)}${bar('KICKING', t.rt.kick)}</div>`
        + `<div class="rm-plan">${esc(PLAN_O[s.o][0])} · ${esc(PLAN_D[s.d][0])}</div>`;
    };
    $('#rm-u').innerHTML = card('u'); $('#rm-t').innerHTML = card('t');
    const other = L[opp(ME)], locked = !host && me && me.ready;
    const list = [...TEAMS].sort((a, b) => b.rt.ovr - a.rt.ovr || TN(a).localeCompare(TN(b)));
    $('#rm-list').innerHTML = me ? list.map(t => { const lock = (other && other.team === t.id) || locked;
      return `<button class="trow${lock ? ' lock' : ''}" data-id="${t.id}" aria-pressed="${t.id === me.team}"${lock ? ' disabled' : ''}><span class="ab">${esc(AB(t))}</span><span class="tn"><b>${esc(TN(t))}</b><small>${esc(t.m)}${other && other.team === t.id ? ' · taken' : ''}</small></span><span class="rec">${esc(t.r)}</span><span class="lcd${t.rt.ovr >= 82 ? ' win' : ''}">${t.rt.ovr}</span></button>`; }).join('') : '';
    $('#rm-list').querySelectorAll('.trow').forEach(b => b.onclick = () => NET.setMine({ team:b.dataset.id }));
    const chips = (obj, cur, key) => Object.entries(obj).map(([k, v]) => `<button class="chip" aria-pressed="${k === cur}" data-${key}="${k}"${locked ? ' disabled' : ''}>${v[0]}</button>`).join('');
    const canGo = host && L.t && L.t.ready;
    $('#rm-opts').innerHTML = !me ? '' : `<div class="panel opt"><div class="bar"><b>OFFENSE</b> // PHILOSOPHY</div><div class="chips">${chips(PLAN_O, me.o, 'po')}</div><p>${PLAN_O[me.o][1]}</p></div>`
      + `<div class="panel opt"><div class="bar"><b>DEFENSE</b> // PHILOSOPHY</div><div class="chips">${chips(PLAN_D, me.d, 'pd')}</div><p>${PLAN_D[me.d][1]}</p></div>`
      + `<div class="panel opt"><div class="bar"><b>QUARTER</b> // LENGTH${host ? '' : ' · HOST PICKS'}</div><div class="chips">${[3, 5, 8].map(n => `<button class="chip" aria-pressed="${n === L.qlen}" data-ql="${n}"${host ? '' : ' disabled'}>${n} Min</button>`).join('')}</div><p>${L.qlen === 3 ? 'Quick game, about 6 minutes.' : L.qlen === 5 ? 'About 10 minutes of play calling.' : 'Long game, about 18 minutes.'}</p></div>`
      + `<div class="go-row"><button class="pb pill big" id="rm-leave"><i class="ps o">○</i>Leave Room</button>`
      + (host ? `<button class="pb pill big" id="rm-go"${canGo ? '' : ' disabled'}><i class="ps x">✕</i>${canGo ? 'Kick Off' : L.t ? 'Waiting for opponent to ready up' : 'Waiting for opponent'}</button>`
        : `<button class="pb pill big" id="rm-go"><i class="ps x">✕</i>${me.ready ? 'Not Ready' : 'Ready'}</button>`) + `</div>`;
    $('#rm-opts').querySelectorAll('[data-po]').forEach(b => b.onclick = () => NET.setMine({ o:b.dataset.po }));
    $('#rm-opts').querySelectorAll('[data-pd]').forEach(b => b.onclick = () => NET.setMine({ d:b.dataset.pd }));
    if (host) $('#rm-opts').querySelectorAll('[data-ql]').forEach(b => b.onclick = () => { L.qlen = +b.dataset.ql; NET.sendLobby(); NET.saveHost(); NET.renderRoom(); });
    const lv = $('#rm-leave'); if (lv) lv.onclick = () => NET.leave();
    const go = $('#rm-go'); if (go) go.onclick = () => host ? NET.startMatch() : NET.setMine({ ready:!me.ready });
    pad();
  },
  padItems(){
    const L = NET.L; if (!L) return [];
    const host = NET.role === 'host', me = L[ME];
    return [host ? { g:'x', l:'Kick Off', fn:() => NET.startMatch(), dis:!(L.t && L.t.ready) } : { g:'x', l:me && me.ready ? 'Not Ready' : 'Ready', fn:() => me && NET.setMine({ ready:!me.ready }) }, { g:'o', l:'Leave Room', fn:() => NET.leave() }];
  },
  startMatch(){
    const L = NET.L; if (NET.role !== 'host' || !L || !L.t || (L.phase === 'lobby' && !L.t.ready) || L.u.team === L.t.team) return;
    if (!(NET.conn && NET.conn.open)) return toast('OPPONENT NOT CONNECTED', 'p');
    const seed = randSeed(); L.phase = 'game'; NET.rematch = { u:false, t:false };
    NET.send({ t:'start', L:NET.pub(), seed });
    NET.begin(L, seed);
  },
  leave(){
    NET.closing = true; clearInterval(NET.retryT); NET.retryT = null;
    NET.send({ t:'bye' });
    const c = NET.conn; NET.conn = null; setTimeout(() => { try { c && c.close(); } catch(e){} }, 300);
    if (NET.role === 'host'){ const p = NET.peer; NET.peer = null; setTimeout(() => { try { p && p.destroy(); } catch(e){} }, 400); lsDel('hc-mp-host'); }
    else lsDel('hc-mp-guest');
    lsDel('hc-mp-lock');
    NET.role = null; NET.room = 0; NET.L = null; NET.dec = null; NET.inbox = []; ME = 'u';
    hideNetOv(); toTitle();
  },
  oppLeft(){
    NET.conn = null;
    const L = NET.L; const who = L && L.t ? L.t.name : 'Your opponent';
    if (L) L.t = null;
    if (L && L.phase === 'lobby'){ toast(`${who.toUpperCase()} LEFT`, 'p'); NET.saveHost(); NET.renderRoom(); return; }
    EPOCH++; PAUSED = false; ANIM = null; hideTablet();
    if (L) L.phase = 'lobby'; NET.dec = null; NET.saveHost();
    netOv('Opponent left', `${who} left the game.`, [['Back to Room', () => { hideNetOv(); NET.showRoom(); }]]);
  },
  backToRoom(){
    const L = NET.L; if (!L) return;
    if (NET.role !== 'host') return NET.send({ t:'toRoom' });
    L.phase = 'lobby'; if (L.t) L.t.ready = false; NET.dec = null; NET.saveHost(); NET.sendLobby(); NET.showRoom();
  },

  /* ---------- the game ---------- */
  begin(L, seed){
    hideNetOv();
    NET.L = L; NET.n = 0; NET.dec = null; NET.inbox = []; NET.rematch = { u:false, t:false }; lsDel('hc-mp-lock');
    EPOCH++; PAUSED = false; PQ = []; ANIM = null;
    RNG = seeded(seed);
    newGame(L); G.hist = { o:{}, d:{} };
    showAutoBar(); show('game');
    $('#camlbl').textContent = CAMS[camIdx].name;
    tick(`Head-to-head at the PTTFL stadium. <b>${esc(TN(G.U))}</b> (${esc(L.u.name)}) host <b>${esc(TN(G.T))}</b> (${esc(L.t.name)}).`, 'u');
    lastForm = ''; placeLines(); updateHUD(); camTo(SPOT.mid);
    if (NET.role === 'host') NET.saveHost();
    mpCoin(false);
  },
  enter(meta){
    NET.n++;
    const d = NET.dec = { kind:meta.kind, w:meta.w, res:meta.res, n:NET.n, mine:null, salt:null, theirs:{}, hostSent:false, done:false };
    d.need = d.kind === 'snap' || d.kind === 'half' ? ['u', 't'] : d.kind === 'pat' ? [G.poss] : [d.w];
    if (NET.role === 'host'){
      const gs = serG(G);
      if (NET.pendingResume && NET.conn && NET.conn.open){ NET.pendingResume = false; NET.sendState(gs); }
      else NET.send({ t:'sync', n:d.n, h:fnv(gs), G:gs });
      NET.saveHost(gs);
    }
    mpShow(d);
    NET.restoreLock();
    NET.pump();
  },
  sendState(gs){
    const d = NET.dec; if (!d) return;
    NET.send({ t:'state', phase:'game', n:d.n, meta:{ kind:d.kind, w:d.w, res:d.res }, G:gs || serG(G), L:NET.pub() });
    // the guest calls again from scratch (their saved call comes back with them); ours stands
    d.theirs = {}; d.hostSent = false;
    if (d.mine && d.need.length > 1) NET.send({ t:'locked', n:d.n });
    hideNetOv(); renderStat();
  },
  adoptState(m){
    hideNetOv(); clearInterval(NET.retryT); NET.retryT = null;
    EPOCH++; PAUSED = false; PQ = []; ANIM = null; $('#coin').hidden = true; hideTablet(); if (PRE) leavePresnap();
    NET.L = m.L; adoptG(m.G);
    if (m.phase === 'final'){ NET.n = m.n; NET.dec = null; G.over = true; NET.rematch = m.rm || NET.rematch; NET.renderFinal(); return; }
    show('game'); showAutoBar(); lastForm = ''; placeLines(); updateHUD(); camGame(fieldX(G.ball), wdir(G.poss));
    NET.inbox = NET.inbox.filter(x => x.n == null || x.n >= m.n);
    NET.n = m.n - 1; NET.enter(m.meta);
  },
  saveLock(d){ store.set('hc-mp-lock', { room:NET.room, role:NET.role, n:d.n, call:d.mine, salt:d.salt }); },
  restoreLock(){
    const d = NET.dec, s = store.get('hc-mp-lock', null);
    if (!d || d.mine || d.done || !s || s.room !== NET.room || s.role !== NET.role || s.n !== d.n || !d.need.includes(ME)) return;
    d.salt = s.salt; hideTablet(); if (PRE) leavePresnap(); $('#coin').hidden = d.kind !== 'coin';
    NET.submit(s.call);
  },
  async submit(call){
    const d = NET.dec; if (!d || d.done || d.mine || !d.need.includes(ME)) return;
    d.mine = call; d.salt = d.salt || randHex();
    NET.saveLock(d); if (NET.role === 'host') NET.saveHost();
    renderStat(); padGame();
    if (d.need.length === 1){
      if (NET.role === 'host') return NET.exec({ [ME]:call }, randSeed());
      return NET.send({ t:'call', n:d.n, call });
    }
    if (d.kind === 'snap') toast(`LOCKED IN · WAITING ON ${AB(TM(opp(ME)))}`, 'g');
    if (NET.role === 'host'){ NET.send({ t:'locked', n:d.n }); NET.sendHostCall(); }
    else NET.send({ t:'commit', n:d.n, h:await sha(JSON.stringify(call) + d.salt) });
  },
  sendHostCall(){ const d = NET.dec; if (d && d.mine && d.theirs.commit && !d.hostSent && !d.done){ d.hostSent = true; NET.send({ t:'hostcall', n:d.n, call:d.mine, salt:d.salt }); } },
  exec(calls, seed){ const d = NET.dec; if (!d || d.done) return; NET.send({ t:'exec', n:d.n, calls, seed }); NET.run(calls, seed); },
  run(calls, seed){
    const d = NET.dec; if (!d || d.done) return;
    d.done = true; lsDel('hc-mp-lock'); renderStat();
    RNG = seeded(seed);
    if (d.kind === 'snap') return mpExecSnap(calls.u, calls.t);
    if (d.kind === 'pat') return mpExecPat(calls[G.poss]);
    if (d.kind === 'coin') return mpExecCoin(d, calls[d.w]);
    if (d.kind === 'half') return mpExecHalf(calls);
  },
  timeout(){
    const d = NET.dec; if (!d || d.kind !== 'snap' || d.done || d.mine) return;
    if (NET.role === 'host'){ if (G.to.u > 0 && G.runoff > 0){ NET.send({ t:'to', n:d.n, side:'u' }); applyTO('u'); } }
    else NET.send({ t:'toReq', n:d.n });
  },
  onGame(m){
    if (m.t === 'fin' || m.n != null){ NET.inbox.push(m); NET.pump(); }
  },
  async pump(){
    if (NET.pumping) return; NET.pumping = true;
    try {
      for (;;){
        const i = NET.inbox.findIndex(m => m.n <= NET.n); if (i < 0) break;
        const m = NET.inbox.splice(i, 1)[0];
        if (m.n === NET.n) await NET.handle(m);
      }
    } finally { NET.pumping = false; }
  },
  async handle(m){
    const d = NET.dec, host = NET.role === 'host';
    if (m.t === 'fin' && !host){
      if (fnv(serG(G)) !== fnv(m.G)){ NET.desyncs++; console.warn('resync at final'); }
      EPOCH++; PAUSED = false; ANIM = null; hideTablet(); adoptG(m.G); G.over = true; NET.dec = null; NET.renderFinal(); return;
    }
    if (!d || d.n !== m.n) return;
    switch (m.t){
      case 'sync': if (host) return;
        if (fnv(serG(G)) !== m.h){ NET.desyncs++; console.warn('resync at decision', m.n); adoptG(m.G); lastForm = ''; placeLines(); updateHUD(); if (!d.mine) mpShow(d); }
        return;
      case 'locked': if (host) return; d.theirs.locked = true; renderStat(); if (!d.mine) toast(`${AB(TM(opp(ME)))} LOCKED IN`, 'p'); return;
      case 'commit': if (!host || d.done) return; d.theirs.commit = m.h; d.theirs.locked = true; renderStat(); if (!d.mine) toast(`${AB(TM(opp(ME)))} LOCKED IN`, 'p'); NET.sendHostCall(); return;
      case 'hostcall': if (host) return; d.theirs.call = m.call; d.theirs.salt = m.salt; d.theirs.locked = true; if (d.mine) NET.send({ t:'reveal', n:d.n, call:d.mine, salt:d.salt }); return;
      case 'reveal': {
        if (!host || d.done || !d.theirs.commit || !d.mine) return;
        if (await sha(JSON.stringify(m.call) + m.salt) !== d.theirs.commit){ console.warn('reveal does not match the sealed call'); return; }
        const s = await sha(d.salt + '|' + m.salt);
        NET.exec({ u:d.mine, t:m.call }, parseInt(s.slice(0, 8), 16)); return;
      }
      case 'call': if (!host || d.done || d.need.length !== 1 || d.need[0] !== 't') return; NET.exec({ t:m.call }, randSeed()); return;
      case 'toReq': if (!host || d.kind !== 'snap' || d.done || d.theirs.commit || !(G.to.t > 0) || !(G.runoff > 0)) return; NET.send({ t:'to', n:d.n, side:'t' }); applyTO('t'); return;
      case 'to': if (host) return; applyTO(m.side); return;
      case 'exec': if (host) return;
        if (d.theirs.call && JSON.stringify(m.calls.u) !== JSON.stringify(d.theirs.call)) console.warn('host call changed after it was sent');
        NET.run(m.calls, m.seed); return;
    }
  },

  /* ---------- final ---------- */
  renderFinal(){
    if (!G) return;
    const a = G.sc[ME], b = G.sc[opp(ME)], res = a > b ? 'w' : a < b ? 'l' : 'e', L = NET.L || {};
    show('final'); hideTablet(); $('#coin').hidden = true;
    const pog = [...leaders('u').map(x => [...x, 'u']), ...leaders('t').map(x => [...x, 't'])];
    const rm = NET.rematch || {}, oppWants = rm[opp(ME)], iWant = rm[ME];
    $('#final-b').innerHTML = `<div class="bar"><b>FINAL${G.q > 4 ? ' / OT' : ''}</b> // HEAD-TO-HEAD · ROOM ${NET.room} <span class="r">${G.qlen / 60} MIN QTRS</span></div>`
      + scoreBlock()
      + `<div class="verdict"><span class="${res}">${res === 'w' ? 'Victory' : res === 'l' ? 'Defeat' : 'Tie'}</span></div>`
      + statTable()
      + `<div class="pogs">${pog.map(p => `<div class="pog p-${p[3]}${p[4] === 't' ? ' t' : ''}"><span class="hud">${p[0]} · ${esc(p[4] === 'u' ? AB(G.U) : AB(G.T))}</span><b>${esc(p[1])}</b><small>${esc(p[2])}</small></div>`).join('')}</div>`
      + `<div class="coach"><div class="grade g-${res === 'w' ? 'A' : res === 'l' ? 'F' : 'C'}">${a}-${b}</div><div><span class="hud">${esc((L.u || {}).name || 'HOME')} vs ${esc((L.t || {}).name || 'AWAY')}</span><div class="q">${oppWants && !iWant ? '<b>Your opponent wants a rematch.</b>' : iWant ? 'Waiting on your opponent for the rematch…' : 'Run it back, or head back to the room to change teams.'}</div></div></div>`
      + `<div class="go-row" style="padding:0 14px"><button class="pb pill big" id="fr"${iWant ? ' disabled' : ''}><i class="ps x">✕</i>${iWant ? 'Rematch Requested' : 'Rematch'}</button><button class="pb pill big" id="fb"><i class="ps s">□</i>Back to Room</button><button class="pb pill big" id="fl"><i class="ps t">△</i>Leave Room</button></div>`;
    $('#fr').onclick = () => NET.wantRematch(); $('#fb').onclick = () => NET.backToRoom(); $('#fl').onclick = () => NET.leave();
    camTo({ ...SPOT.goal, x:res === 'l' ? 560 : -560, spin:res === 'l' ? 30 : -30 });
    pad();
  },
  finalItems(){ return [{ g:'x', l:'Rematch', fn:() => NET.wantRematch() }, { g:'s', l:'Back to Room', fn:() => NET.backToRoom() }, { g:'t', l:'Leave Room', fn:() => NET.leave() }]; },
  wantRematch(){
    NET.rematch[ME] = true;
    if (NET.role === 'host'){ NET.send({ t:'rmst', r:NET.rematch }); if (NET.rematch.t) return NET.startMatch(); }
    else NET.send({ t:'rematch' });
    NET.renderFinal();
  }
};

/* ---------------- decisions on screen ---------------- */
async function mpShow(d){
  if (PRE) leavePresnap();
  hideTablet(); renderStat();
  if (d.kind === 'snap' || d.kind === 'pat'){
    if (SCR !== 'game' && SCR !== 'pause') show('game');
    await idleFormation('single', 'base');
    if (NET.dec !== d || d.mine || d.done) return;
    if (d.kind === 'pat') return G.poss === ME ? showPAT() : waitTablet('TRY', `${TN(TM(G.poss))} are deciding: kick the extra point or go for two.`);
    return showTablet(G.poss === ME ? 'off' : 'def');
  }
  if (d.kind === 'coin') return coinPanel(d);
  if (d.kind === 'half') return halfPanel(d);
}
function waitTablet(head, msg){
  TAB = { mode:'wait', keys:[] };
  tablet.className = 'panel off' + (G.poss === ME ? '' : ' def');
  tablet.innerHTML = `<div class="bar"><span class="side">${G.poss === ME ? 'OFFENSE' : 'DEFENSE'}</span><b>${esc(head)}</b> <span class="r">${esc(AB(G.U))} ${G.sc.u} – ${G.sc.t} ${esc(AB(G.T))}</span></div>`
    + `<div class="coord" style="--c:#8C84B8"><span class="av">··</span><div>${esc(msg)}</div></div>`;
  slideIn();
}
// who has locked in: shown under the play-by-play while either coach is still deciding
function renderStat(){
  const el = $('#mpstat'); if (!el) return;
  const d = MP && NET.dec;
  if (!d || d.done || !(d.kind === 'snap' || d.kind === 'half') || !G){ el.hidden = true; return; }
  const them = AB(TM(opp(ME)));
  el.hidden = false;
  el.innerHTML = `<span class="${d.mine ? 'on' : ''}"><b>YOU</b> ${d.mine ? 'LOCKED IN ✓' : 'CALLING…'}</span><span class="${d.theirs.locked ? 'on' : ''}"><b>${esc(them)}</b> ${d.theirs.locked ? 'LOCKED IN ✓' : 'CALLING…'}</span>`;
}
async function applyTO(side){
  await callTimeout(side);
  const d = NET.dec; if (!d || d.done || d.mine) return;
  if (PRE) renderPresnap(); else if (TAB && (TAB.mode === 'off' || TAB.mode === 'def')) showTablet(TAB.mode, TAB.grp);
  padGame();
}
async function mpCoin(ot){
  const w = rnd() < .5 ? 'u' : 't', res = rnd() < .5 ? 'heads' : 'tails', e = EPOCH;
  const box = $('#coin');
  box.querySelector('.ct-h').textContent = ot ? 'Overtime Coin Toss' : 'Coin Toss';
  box.querySelector('.ct-res').textContent = ''; box.querySelector('.ct-btns').innerHTML = '';
  const coin = box.querySelector('.coin'); coin.getAnimations().forEach(a => a.cancel()); coin.style.transform = '';
  box.querySelector('.ct-sub').textContent = `${TN(G.T)} call it in the air…`;
  box.hidden = false;
  await flipCoin(res);
  if (e !== EPOCH || !G) return;
  box.querySelector('.ct-res').textContent = res.toUpperCase();
  if (ot){
    box.querySelector('.ct-sub').textContent = `${TN(TM(w))} win the toss and will receive · sudden death`;
    await wait(1600); if (e !== EPOCH) return;
    box.hidden = true; return kickoff(w, opp(w));
  }
  NET.enter({ kind:'coin', w, res });
}
function coinPanel(d){
  if (SCR !== 'game') show('game');
  const box = $('#coin'); box.hidden = false;
  box.querySelector('.ct-h').textContent = 'Coin Toss';
  box.querySelector('.ct-res').textContent = String(d.res || '').toUpperCase();
  const coin = box.querySelector('.coin'); if (!coin.getAnimations().length) coin.style.transform = d.res === 'tails' ? 'rotateX(180deg)' : '';
  const b = box.querySelector('.ct-btns');
  if (d.w === ME && !d.mine && !d.done){
    box.querySelector('.ct-sub').textContent = `${TN(TM(ME))} win the toss`;
    b.innerHTML = `<button class="spb" data-c="recv"><span class="kk">1</span>Receive</button><button class="spb alt" data-c="kick"><span class="kk">2</span>Defer · Kick Off</button>`;
    b.querySelectorAll('[data-c]').forEach(x => x.onclick = () => { b.innerHTML = ''; NET.submit({ c:x.dataset.c }); });
    const f = b.querySelector('button'); if (f) f.focus({ preventScroll:true });
  } else { b.innerHTML = ''; box.querySelector('.ct-sub').textContent = d.w === ME ? 'Got it. Heading out…' : `${TN(TM(d.w))} win the toss and are choosing…`; }
}
function halfPanel(d){
  show('half'); $('#half-h').textContent = 'Halftime';
  if (!NET.halfPlan || NET.halfPlan.n !== d.n) NET.halfPlan = { n:d.n, o:G.plan[ME].o, d:G.plan[ME].d };
  const hp = NET.halfPlan, locked = !!d.mine;
  $('#half-b').innerHTML = scoreBlock() + statTable()
    + `<div class="adj"><span class="hud">HALFTIME ADJUSTMENTS · OFFENSE</span><div class="chips">${Object.entries(PLAN_O).map(([k, v]) => `<button class="chip" aria-pressed="${hp.o === k}" data-ho="${k}"${locked ? ' disabled' : ''}>${v[0]}</button>`).join('')}</div></div>`
    + `<div class="adj"><span class="hud">HALFTIME ADJUSTMENTS · DEFENSE</span><div class="chips">${Object.entries(PLAN_D).map(([k, v]) => `<button class="chip" aria-pressed="${hp.d === k}" data-hd="${k}"${locked ? ' disabled' : ''}>${v[0]}</button>`).join('')}</div></div>`
    + `<div class="go-row" style="padding:0 14px"><button class="pb pill big" id="h2"${locked ? ' disabled' : ''}><i class="ps x">✕</i>${locked ? `Waiting on ${esc(AB(TM(opp(ME))))}…` : 'Ready for the 2nd Half'}</button></div>`;
  $('#half-b').querySelectorAll('[data-ho]').forEach(b => b.onclick = () => { hp.o = b.dataset.ho; halfPanel(d); });
  $('#half-b').querySelectorAll('[data-hd]').forEach(b => b.onclick = () => { hp.d = b.dataset.hd; halfPanel(d); });
  $('#h2').onclick = () => NET.halfReady();
  pad();
}
NET.halfReady = () => { const d = NET.dec; if (!d || d.kind !== 'half' || d.mine) return; NET.submit({ o:NET.halfPlan.o, d:NET.halfPlan.d }); halfPanel(d); };

/* ---------------- running a decision (identical on both screens) ---------------- */
async function mpExecSnap(cu, ct){
  const off = G.poss, oc = (off === 'u' ? cu : ct) || {}, dc = (off === 'u' ? ct : cu) || {};
  G.busy = true; hideTablet(); if (PRE) leavePresnap();
  if (!G.pat2 && ['punt', 'fg', 'kneel'].includes(oc.sp)){
    if (!(await preSnap())) return;
    return oc.sp === 'punt' ? doPunt() : oc.sp === 'fg' ? doKick('fg') : doKneel();
  }
  const legal = legalOff(), k = legal.includes(oc.k) ? oc.k : legal[0], dK = DEF[dc.k] ? dc.k : 'base';
  G.hot = oc.hot && typeof oc.hot === 'object' && OFF[k].k === 'pass' ? { ...oc.hot } : null; G.flip = !!oc.flip; lastForm = '';
  const b = bucket(), add = (key, c) => { const h = G.hist[key] || (G.hist[key] = {}); (h[b] = h[b] || {})[c] = (h[b][c] || 0) + 1; };
  add('o' + off, k); add('d' + opp(off), dK);
  if (!G.pat2 && !(await preSnap())) return;
  await runPlay(k, dK);
}
async function mpExecPat(call){
  G.busy = true; hideTablet();
  if (call && call.sp === 'two'){ G.pat2 = G.poss; G.ball = G.poss === 'u' ? 98 : 2; G.down = 1; G.togo = 2; lastForm = ''; G.busy = false; toast(`${sideName(G.poss)} GOING FOR TWO`, G.poss === ME ? 'g' : 'p'); return nextSnap(); }
  return doKick('xp');
}
function mpExecCoin(d, call){
  $('#coin').hidden = true;
  const recv = call && call.c === 'kick' ? opp(d.w) : d.w;
  toast(`${sideName(d.w)} ${recv === d.w ? 'WILL RECEIVE' : 'DEFER · KICKING OFF'}`, 'g');
  G.recv1 = recv; G.poss = recv; G.ball = recv === 'u' ? 25 : 75;
  placeLines(); updateHUD(); camGame(fieldX(G.ball), wdir(recv));
  kickoff(recv, opp(recv));
}
function mpExecHalf(calls){
  for (const s of ['u', 't']){ const c = calls[s] || {}; if (PLAN_O[c.o]) G.plan[s].o = c.o; if (PLAN_D[c.d]) G.plan[s].d = c.d; }
  secondHalf();
}
async function mpFinal(){
  endDrive('half');
  G.over = true; G.busy = true; G.auto = null; showAutoBar(); hideTablet();
  NET.n++; NET.dec = { kind:'final', n:NET.n, done:true, need:[], theirs:{} }; renderStat();
  if (NET.role === 'host'){ NET.L.phase = 'final'; const gs = serG(G); NET.send({ t:'fin', n:NET.n, G:gs }); NET.saveHost(gs); }
  else { NET.pump(); if (NET.dec === null) return; }
  await wait(300);
  NET.renderFinal();
}
function mpLeaveAsk(){
  netOv('Leave the game?', 'Your opponent will be told you left, and this game ends.', [['Leave Game', () => NET.leave(), 'red'], ['Stay', () => hideNetOv(), 'alt']]);
}
// closing or reloading the page hangs up properly, so the other screen knows right away (the game itself is saved)
addEventListener('pagehide', () => { if (!MP) return; for (const p of [NET.peer, NET.lobbyPeer]) try { p && !p.destroyed && p.destroy(); } catch(e){} });
addEventListener('pageshow', e => { if (MP && e.persisted) location.reload(); });
window.__hc = { NET, get G(){ return G; }, serG, fnv, get ME(){ return ME; }, get TAB(){ return TAB; }, get PRE(){ return PRE; } };   // for testing from the console


/* ---------------- input ---------------- */
document.addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  const k = e.key.toLowerCase();
  if (MP && !$('#netov').hidden) return;
  if (MP && !$('#coin').hidden){ const b = [...$('#coin').querySelectorAll('[data-c]')]; if (k === '1' && b[0]){ e.preventDefault(); b[0].click(); } if (k === '2' && b[1]){ e.preventDefault(); b[1].click(); } return; }
  if (SCR === 'game' && THROW.on && /^[1-5]$/.test(k)){ e.preventDefault(); throwKey(+k); return; }
  if (SCR === 'game' && PRE){
    if (k === 'enter' || k === ' '){ e.preventDefault(); snapPresnap(); return; }
    if (k === 'escape'){ leavePresnap(); G.hot = null; showTablet('off', 'pass'); return; }
    if (/^[0-9]$/.test(k) && PRE.sel != null){ const list = PRE.sel === 7 ? TREE_RB : TREE_WR, b = list.find(x => x[2] === +k); if (b){ setRoute(PRE.sel, b[0]); } return; }
    if (/^[1-5]$/.test(k)){ const els = eligibleFor(PRE.k); if (els[+k - 1] != null) selectRcv(els[+k - 1]); return; }
    if (k === 't' && PRE.sel != null){ setPrimary(PRE.sel); return; }
    if (k === 's'){ const b = $('#pssave'); if (b){ e.preventDefault(); b.click(); } return; }
    if (k === 'm'){ e.preventDefault(); toggleFlip(); return; }
    if (k === 'c'){ cycleCam(); return; }
    return;
  }
  if (k === '?' || k === 'h'){ e.preventDefault(); if (SCR === 'game'){ pauseGame(); MENU_VIEW = 'keys'; renderMenu(); } else if (SCR === 'pause'){ MENU_VIEW = MENU_VIEW === 'keys' ? 'menu' : 'keys'; renderMenu(); } return; }
  if (SCR === 'game' && TAB && !(G && G.busy)){
    const sp = s => { const b = tablet.querySelector(`[data-sp="${s}"]`); if (b){ e.preventDefault(); b.click(); return true; } return false; };
    if (k === 'a'){ e.preventDefault(); if (G.auto) cancelAuto(); else startAuto(TAB.mode); return; }
    if (k === 'm' && TAB.mode === 'off'){ e.preventDefault(); toggleFlip(); return; }
    if (k === 'u' && TAB.mode === 'off'){ const b = $('#audb'); if (b){ e.preventDefault(); b.click(); } return; }
    if (k === 'r' && TAB.mode === 'off'){ e.preventDefault(); pickGroup('run'); return; }
    if (k === 'f' && TAB.mode === 'off'){ e.preventDefault(); pickGroup('pass'); return; }
    if (k === 'k'){ if (sp('fg') || sp('xp')) return; }
    if (k === 'n'){ if (sp('punt')) return; }
    if (k === 'x'){ if (sp('two')) return; }
    if (k === 'v'){ if (sp('kneel')) return; }
  }
  if (SCR === 'game'){
    if (/^[1-9]$/.test(k) && TAB && TAB.vk && TAB.vk[+k - 1]){ e.preventDefault(); const v = TAB.vk[+k - 1]; if (v === 'run' || v === 'pass') pickGroup(v); else userCall(v); return; }
    if ((k === 'backspace' || k === 'escape') && TAB && TAB.grp && !(G && G.auto)){ e.preventDefault(); pickGroup(null); return; }
    if (k === 'enter' || k === ' '){ if (TAB && TAB.rec){ e.preventDefault(); userCall(TAB.rec.k); } return; }
    if (k === 'c'){ cycleCam(); return; }
    if (k === 't'){ const b = PADK[1]; if (b && !b.dis) b.fn(); return; }
    if (k === 'escape' && G && G.auto){ cancelAuto(); return; }
    if (k === 'escape' || k === 'p'){ pauseGame(); return; }
    return;
  }
  if (k === 'enter' || k === ' '){ const b = PADK.find(x => x.g === 'x'); if (b && document.activeElement && document.activeElement.tagName === 'BUTTON' && !document.activeElement.closest('.padbar')) return; if (b){ e.preventDefault(); b.fn(); } return; }
  if (k === 'escape' || k === 'backspace'){ const b = PADK.find(x => x.g === 'o') || (SCR === 'pause' ? { fn:resume } : null); if (b){ e.preventDefault(); b.fn(); } }
});
$('#press').onclick = () => toSetup(0);
$('#camb').onclick = () => cycleCam();
$('#autobar').onclick = () => cancelAuto();
ov.addEventListener('click', e => {
  if (THROW.on && G){ const sp = e.target.closest('.gp'); if (!sp) return; const i = EL[G.poss].indexOf(sp), n = THROW.ids.indexOf(i); if (n >= 0) throwKey(n + 1); return; }
  if (!PRE) return;
  const sp = e.target.closest('.gp'); if (!sp) return;
  const i = EL[G.poss].indexOf(sp); if (i >= 0) selectRcv(i);
});
addEventListener('resize', () => { camSnap = true; });

/* ---------------- Player mode engine ---------------- */
const LIVE = window.HC_LIVE ? window.HC_LIVE({
  get G(){ return G; }, get ME(){ return ME; }, TM, ytg, wdir, fieldX, forms, skillPlayers, playTree, routeKeysFor, defDepth, unitR, defR,
  clamp, lerp, rnd, gauss, put, EL, camGame, cam, ov, THROW, esc, last, pauseGame,
  epoch:() => EPOCH, paused:() => PAUSED, eligible:k => eligibleFor(k), posName:i => POSN[i] || 'OL'
}) : null;
window.__hcLive = { get LIVE(){ return LIVE; }, get G(){ return G; }, OFF, DEF, modOf, keyed, callEdge, edgeOf, pickRB, repOf, TM, opp, get SET(){ return SET; }, newGame:L => newGame(L), set G(v){ G = v; }, ytg, test:{ doKick:k => doKick(k), doPunt:() => doPunt() } };

/* ---------------- boot ---------------- */
buildStadium();
$('#tl-logo').innerHTML = LOGO();
cam.x = 0; cam.y = 0; cam.tilt = 20; cam.zoom = .42; camSnap = true;
toTitle();
requestAnimationFrame(frame);
})();

