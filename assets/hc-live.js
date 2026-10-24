/* PTTFL Head Coach · PLAYER MODE
   Every snap played out live, Madden style: all 22 players move at 60 steps a second. Linemen engage and fight,
   receivers run their routes and coverage plays man or zone off the call, the ball flies through the air and is
   caught (or knocked down, or picked) by whoever actually gets to it, and the carrier runs until somebody brings
   him down. You play the snap: drop back and throw with a timing meter, run with jukes and spins, or take a
   defender and go make the tackle.

   Coordinates are in the offense's frame: u = px downfield from the line of scrimmage (10 px = 1 yard),
   v = px across the field. The game maps that onto the stadium the same way its own animations do. */
(() => {
'use strict';
window.HC_LIVE = function(H){
const { clamp, lerp } = H;
const rnd = () => H.rnd(), gauss = () => H.gauss();
const DT = 1 / 60, SL = 266;            // sideline: |v| past this is out of bounds
const hyp = Math.hypot;
const dist = (a, b) => hyp(a[0] - b[0], a[1] - b[1]);
const nrm = (x, y) => { const l = hyp(x, y); return l ? [x / l, y / l] : [0, 0]; };
const logn = s => Math.exp(gauss() * s);
const DEEP_R = new Set(['go', 'seam', 'post', 'corner', 'wheel']);

/* ---------------- on-screen pieces ---------------- */
let UI = null;
function ui(){
  if (UI) return UI;
  const box = document.createElement('div'); box.id = 'lvhud'; box.setAttribute('aria-live', 'polite');
  box.innerHTML = `<div class="lv-prompt" hidden></div><div class="lv-call"></div>
    <div class="lv-meter" hidden><div class="lv-mtr"><i class="lv-band"></i><i class="lv-fill"></i><i class="lv-needle"></i></div><b class="lv-mlbl"></b></div>
    <div class="lv-hint" hidden></div>`;
  document.body.appendChild(box);
  const touch = document.createElement('div'); touch.id = 'lvtouch'; touch.hidden = true;
  touch.innerHTML = `<div class="lv-stick"><i></i></div><div class="lv-btns"></div>`;
  document.body.appendChild(touch);
  const game = H.ov.querySelector('.mx-game');
  const mk = cls => { const e = document.createElement('div'); e.className = 'lvx ' + cls; e.innerHTML = '<i></i>'; game.appendChild(e); return e; };
  UI = { box, prompt:box.querySelector('.lv-prompt'), call:box.querySelector('.lv-call'), meter:box.querySelector('.lv-meter'),
    band:box.querySelector('.lv-band'), fill:box.querySelector('.lv-fill'), needle:box.querySelector('.lv-needle'), mlbl:box.querySelector('.lv-mlbl'),
    hint:box.querySelector('.lv-hint'), touch, stick:touch.querySelector('.lv-stick'), knob:touch.querySelector('.lv-stick i'), btns:touch.querySelector('.lv-btns'),
    ring:mk('ring'), tgt:mk('tgt') };
  UI.ring.style.display = UI.tgt.style.display = 'none';
  setupTouch();
  return UI;
}
let callT = 0;
function callout(txt, cls){
  if (!S || S.headless) return;
  const c = ui().call; c.textContent = txt; c.className = 'lv-call on' + (cls ? ' ' + cls : '');
  clearTimeout(callT); callT = setTimeout(() => { c.className = 'lv-call'; }, 1100);
}
const isTouch = () => { try { return matchMedia('(pointer: coarse)').matches; } catch(e){ return false; } };

/* ---------------- input: keyboard, gamepad, touch ----------------
   Everything lands as named buttons: u d l r (move), spr, t1..t5, act, q, e, f, z, x, sw. What a button does
   depends on who you have: the snap, the QB, a ball carrier or a defender. */
const IN = { held:new Set(), hit:new Set(), up:new Set(), stick:[0, 0], tstick:null, pad:false, padPrev:[] };
const KEYMAP = { arrowup:'u', w:'u', arrowdown:'d', s:'d', arrowleft:'l', a:'l', arrowright:'r', d:'r', shift:'spr',
  '1':'t1', '2':'t2', '3':'t3', '4':'t4', '5':'t5', ' ':'act', enter:'act', q:'q', e:'e', f:'f', z:'z', x:'x', tab:'sw' };
function press(b){ if (!IN.held.has(b)){ IN.held.add(b); IN.hit.add(b); } }
function release(b){ if (IN.held.has(b)){ IN.held.delete(b); IN.up.add(b); } }
function onKey(e){
  if (!S || S.headless || S.done) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  const k = e.key.toLowerCase(), b = KEYMAP[k];
  if (!b) return;
  // leave the menu and camera keys to the game
  e.preventDefault(); e.stopPropagation();
  IN.pad = false;
  if (e.type === 'keydown'){ if (!e.repeat) press(b); } else release(b);
}
function onBlur(){ for (const b of [...IN.held]) release(b); }
function pollPad(){
  let gp = null; try { gp = [...(navigator.getGamepads ? navigator.getGamepads() : [])].find(g => g && g.connected); } catch(e){}
  if (!gp){ IN.padStick = null; return; }
  const B = i => !!(gp.buttons[i] && (gp.buttons[i].pressed || gp.buttons[i].value > .5));
  const ax = i => gp.axes[i] || 0;
  let lx = ax(0), ly = ax(1);
  if (B(12)) ly = -1; if (B(13)) ly = 1; if (B(14)) lx = -1; if (B(15)) lx = 1;
  IN.padStick = hyp(lx, ly) > .22 ? [lx, ly] : null;
  if (IN.padStick || gp.buttons.some(b => b && b.pressed)) IN.pad = true;
  const ctx = S ? context() : '';
  const map = {};
  if (ctx === 'pre') map[0] = 'act';
  else if (ctx === 'qb'){ map[0] = 't1'; map[1] = 't2'; map[2] = 't3'; map[3] = 't4'; map[5] = 't5'; map[4] = 'x'; map[7] = 'spr'; }
  else if (ctx === 'car'){ map[1] = 'act'; map[3] = 'f'; map[2] = 'z'; map[4] = 'q'; map[5] = 'e'; map[7] = 'spr'; }
  else if (ctx === 'def'){ map[0] = 'sw'; map[1] = 'act'; map[3] = 'x'; map[2] = 'e'; map[5] = 'f'; map[7] = 'spr'; }
  const now = {};
  for (const i in map) now[map[i]] = (now[map[i]] || false) || B(+i);
  // right stick: jukes for a runner, hit stick on defense
  const rx = ax(2), ry = ax(3);
  if (ctx === 'car'){ now.q = now.q || rx < -.65; now.e = now.e || rx > .65; }
  if (ctx === 'def') now.e = now.e || ry < -.7;
  for (const b in now){ const was = !!IN.padPrev[b]; if (now[b] && !was) press(b); if (!now[b] && was) release(b); }
  IN.padPrev = now;
  if (B(9) && !IN.padStart){ IN.padStart = true; H.pauseGame(); } else if (!B(9)) IN.padStart = false;
}
// the stick, as a vector in the offense's frame (screen-relative, so "up" is always up on your screen)
function stick(){
  let sx = 0, sy = 0;
  if (IN.tstick){ [sx, sy] = IN.tstick; }
  else if (IN.padStick){ [sx, sy] = IN.padStick; }
  else { if (IN.held.has('l')) sx -= 1; if (IN.held.has('r')) sx += 1; if (IN.held.has('u')) sy -= 1; if (IN.held.has('d')) sy += 1; }
  const m = Math.min(1, hyp(sx, sy)); if (m < .2) return [0, 0, 0];
  const n = nrm(sx, sy), a = H.cam.spin * Math.PI / 180;
  const wx = n[0] * Math.cos(a) + n[1] * Math.sin(a), wy = -n[0] * Math.sin(a) + n[1] * Math.cos(a);
  return [wx * S.d * m, wy * S.d * m, m];
}
function setupTouch(){
  const st = UI.stick; let id = null, c0 = null;
  const set = e => { const r = st.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, R = r.width / 2;
    let dx = (e.clientX - cx) / R, dy = (e.clientY - cy) / R; const m = hyp(dx, dy); if (m > 1){ dx /= m; dy /= m; }
    IN.tstick = [dx, dy]; UI.knob.style.transform = `translate(${dx * 34}px,${dy * 34}px)`; };
  st.addEventListener('pointerdown', e => { id = e.pointerId; st.setPointerCapture(id); set(e); e.preventDefault(); });
  st.addEventListener('pointermove', e => { if (e.pointerId === id) set(e); });
  const end = e => { if (e.pointerId !== id) return; id = null; IN.tstick = null; UI.knob.style.transform = ''; };
  st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
  UI.btns.addEventListener('pointerdown', e => { const b = e.target.closest('[data-b]'); if (!b) return; e.preventDefault(); b.setPointerCapture(e.pointerId); press(b.dataset.b); b.classList.add('on'); });
  const up = e => { const b = e.target.closest('[data-b]'); if (!b) return; release(b.dataset.b); b.classList.remove('on'); };
  UI.btns.addEventListener('pointerup', up); UI.btns.addEventListener('pointercancel', up);
}
const TBTN = {
  pre:[['act', 'SNAP', 'big']],
  qb:[['t1', '1'], ['t2', '2'], ['t3', '3'], ['t4', '4'], ['t5', '5'], ['x', 'AWAY'], ['spr', 'SPRINT']],
  car:[['spr', 'SPRINT', 'big'], ['q', '◂ JUKE'], ['e', 'JUKE ▸'], ['act', 'SPIN'], ['f', 'STIFF'], ['z', 'DIVE']],
  def:[['act', 'TACKLE', 'big'], ['sw', 'SWITCH'], ['e', 'HIT'], ['x', 'BALL'], ['f', 'SHED'], ['spr', 'SPRINT']],
  none:[]
};
const HINT = {
  pre:[['Space', 'Snap'], ['C', 'Camera']],
  qb:[['1–5', 'Throw: tap = lob, hold = bullet (let go in the green)'], ['WASD', 'Move · aim while throwing'], ['Shift', 'Sprint'], ['X', 'Throw it away']],
  car:[['WASD', 'Run'], ['Shift', 'Sprint'], ['Q / E', 'Juke'], ['Space', 'Spin'], ['F', 'Stiff arm'], ['Z', 'Dive / slide']],
  def:[['WASD', 'Move'], ['Shift', 'Sprint'], ['Tab', 'Switch'], ['Space', 'Tackle'], ['E', 'Hit stick'], ['X', 'Play the ball'], ['F', 'Shed block']],
  none:[]
};
const PADH = {
  pre:[['A', 'Snap']],
  qb:[['A B X Y RB', 'Receivers 1–5 · tap lob, hold bullet'], ['LS', 'Move · aim'], ['RT', 'Sprint'], ['LB', 'Throw away']],
  car:[['LS', 'Run'], ['RT', 'Sprint'], ['RS / LB RB', 'Juke'], ['B', 'Spin'], ['Y', 'Stiff arm'], ['X', 'Dive']],
  def:[['LS', 'Move'], ['RT', 'Sprint'], ['A', 'Switch'], ['B', 'Tackle'], ['X / RS↑', 'Hit stick'], ['Y', 'Play the ball'], ['RB', 'Shed']],
  none:[]
};
let lastCtx = '';
function showControls(ctx){
  const key = ctx + (IN.pad ? 'p' : 'k') + (S && S.ids ? S.ids.length : 0);
  if (key === lastCtx) return; lastCtx = key;
  const u = ui();
  const list = (IN.pad ? PADH : HINT)[ctx] || [];
  u.hint.hidden = !list.length || isTouch();
  u.hint.innerHTML = list.map(([k, d]) => `<span><kbd>${H.esc(k)}</kbd>${H.esc(d)}</span>`).join('');
  const tb = (TBTN[ctx] || []).filter(b => ctx !== 'qb' || !/^t\d$/.test(b[0]) || +b[0][1] <= S.ids.length);
  u.touch.hidden = !isTouch() || !tb.length;
  u.btns.innerHTML = tb.map(([b, l, c]) => `<button type="button" class="lv-b${c ? ' ' + c : ''}${/^t\d$/.test(b) ? ' rcv' : ''}" data-b="${b}">${l}</button>`).join('');
}

/* ---------------- the play ---------------- */
let S = null;
// zone landmarks: [depth, width, radius, deep?]
const ZN = { deepL:[200,-175,120,1], deepM:[225,0,120,1], deepR:[200,175,120,1], halfL:[190,-125,140,1], halfR:[190,125,140,1],
  q1:[215,-200,95,1], q2:[230,-70,95,1], q3:[230,70,95,1], q4:[215,200,95,1],
  flatL:[40,-205,85,0], flatR:[40,205,85,0], curlL:[104,-135,85,0], curlR:[104,135,85,0], hookL:[95,-60,75,0], hookR:[95,60,75,0], hookM:[98,0,75,0] };
const COV = {
  base:{ rush:[0, 1, 2, 3], z:{ 4:'curlL', 5:'hookM', 6:'hookR', 10:'curlR', 7:'deepL', 8:'deepR', 9:'deepM' } },
  c2:  { rush:[0, 1, 2, 3], z:{ 4:'curlL', 5:'hookM', 6:'curlR', 7:'flatL', 8:'flatR', 9:'halfL', 10:'halfR' } },
  c3:  { rush:[0, 1, 2, 3], z:{ 4:'curlL', 5:'hookM', 6:'hookR', 10:'curlR', 7:'deepL', 8:'deepR', 9:'deepM' } },
  blitz:{ rush:[0, 1, 2, 3, 4, 6], man:[7, 8, 10, 5], z:{ 9:'deepM' } },
  gl:  { rush:[0, 1, 2, 3, 5], man:[7, 8, 4, 6, 10], z:{ 9:'hookM' } },
  prev:{ rush:[0, 1, 3], z:{ 2:'hookM', 4:'curlL', 5:'hookL', 6:'curlR', 7:'q1', 8:'q4', 9:'q2', 10:'q3' } }
};

function mkP(team, i, pos, p0, o){
  return Object.assign({ team, i, pos, p:[p0[0], p0[1]], vel:[0, 0], want:null, role:'', eng:null, stun:0, down:0, tried:-9, react:0,
    E:1, move:null, moveCD:0, hist:[], cth:.5, tkl:.55, agi:.5, brk:.4, str:.5, cov:.4, hands:.3, aw:.6, rte:.4, sprint:true }, o);
}
function build(R, opt){
  const G = H.G, off = R.off, def = R.def, OT = H.TM(off), DTm = H.TM(def);
  const y0 = H.ytg(), d = H.wdir(off), X0 = H.fieldX(G.ball);
  const { O, Dd } = H.forms(R.fm, R.dK, y0);
  const pr = H.unitR(off, 'pass'), rr = H.unitR(off, 'run'), dr = H.defR(def);
  const who = H.skillPlayers(OT), qbv = (OT.qb[0] || [0, 0, 0, 15])[3];
  const jit = () => 1 + gauss() * .025;
  const P = R.P, fm = R.fm;
  const tree = P.k === 'pass' ? H.playTree(R.oK, G.hot) : {};
  const M = R.M || {};
  // offense
  const Op = O.map((p0, i) => {
    if (i <= 4) return mkP('o', i, 'OL', p0, { name:'', vmax:52 * jit(), accT:.6, str:.5, tkl:.5, brk:.2 });
    if (i === 6){
      const qa = clamp(.55 + (qbv - 15) * .025 + (pr - 75) * .01, .25, .92);
      return mkP('o', i, 'QB', p0, { name:R.qb, vmax:68 * jit() + (qbv - 15) * .3, accT:.75, qa, brk:.35, agi:.5, cth:.5, tkl:.35 });
    }
    const w = who[i] || { n:'', v:6, pos:i === 10 && fm === 'i' ? 'FB' : 'TE' };
    const v = w.v || 6;
    if (i === 7){
      const nm = R.carrier && P.k === 'run' && R.oK !== 'sneak' ? R.carrier : w.n;
      return mkP('o', i, 'RB', p0, { name:nm, vmax:(81 + (rr - 75) * .3 + clamp(v - 12, -6, 8) * .6) * jit(), accT:.8, cth:clamp(.74 + (v - 12) * .008, .62, .88),
        brk:clamp(.5 + (v - 12) * .025 + (rr - 75) * .006, .25, .85), agi:clamp(.55 + (v - 12) * .02, .3, .9), str:.55, rte:.4, tkl:.45 });
    }
    if (i === 5 || (i === 10 && (fm === 'i' || fm === 'jumbo')))
      return mkP('o', i, i === 10 && fm === 'i' ? 'FB' : 'TE', p0, { name:i === 5 ? w.n : '', vmax:(74 + (pr - 75) * .2 + clamp(v - 9, -5, 6) * .6) * jit(), accT:.85,
        cth:clamp(.8 + (v - 8) * .01, .68, .92), brk:.55, agi:.45, str:.6, rte:clamp(.42 + (v - 9) * .03, .2, .7), tkl:.5 });
    return mkP('o', i, 'WR', p0, { name:w.n, vmax:(83 + (pr - 75) * .3 + clamp(v - 11, -6, 8) * .7) * jit(), accT:.9,
      cth:clamp(.82 + (v - 11) * .01 + (pr - 75) * .003, .68, .95), brk:.42, agi:clamp(.6 + (v - 11) * .02, .35, .9), str:.4,
      rte:clamp(.5 + (v - 11) * .04 + (pr - 75) * .01, .2, .92), tkl:.45 });
  });
  // defense
  const db = dr - 75;
  const Dp = Dd.map((p0, j) => {
    if (j <= 3) return mkP('d', j, 'DL', p0, { vmax:((j === 0 || j === 3) ? 69 : 63) + db * .2, accT:.7, tkl:clamp(.8 + db * .008, .55, .94), str:.6, cov:.15, hands:.15, aw:.55 });
    if (j <= 6) return mkP('d', j, 'LB', p0, { vmax:(79 + db * .25) * jit(), accT:.75, tkl:clamp(.87 + db * .008, .6, .96), str:.55, cov:clamp(.45 + db * .01, .2, .7), hands:.3, aw:clamp(.6 + db * .01, .3, .9) });
    if (j <= 8) return mkP('d', j, 'CB', p0, { vmax:(87 + db * .3) * jit(), accT:.85, tkl:clamp(.75 + db * .008, .5, .9), str:.38, cov:clamp(.6 + db * .012, .3, .88), hands:.45, aw:clamp(.65 + db * .01, .35, .95) });
    return mkP('d', j, 'S', p0, { vmax:(85 + db * .3) * jit(), accT:.85, tkl:clamp(.81 + db * .008, .55, .93), str:.45, cov:clamp(.55 + db * .012, .3, .85), hands:.45, aw:clamp(.68 + db * .01, .35, .95) });
  });
  const s = R.side || 1, fl = G.flip ? -1 : 1;
  const st = {
    R, G, off, def, d, X0, y0, goalU:y0 * 10, ownU:-(100 - y0) * 10, O:Op, D:Dp, t:0, phase:'pre', s, fl, P, oK:R.oK, dK:R.dK, M, tree,
    pr, rr, dr, edge:(pr - dr) / 10, redge:(rr - dr) / 10, ball:{ st:'held', h:null, p:[-8, 0], z:3 }, holder:null, carrier:null,
    thrown:false, caught:null, chase:-1, handoff:-1, broken:0, end:null, deadT:0, done:false, headless:!!opt.headless,
    userSide:opt.user || null, ctl:null, ids:[], hold:null, snapAt:0, scramble:false, epoch:H.epoch(), plan:G.plan[def].d,
    tackleAdj:-(M.dy || 0) * .03 - (M.db || 0) * .8 + (G.plan[def].d === 'agg' ? -.02 : G.plan[def].d === 'bend' ? .03 : 0),
    lagMul:clamp(1 + (M.dc || 0) * 4, .6, 1.8), shedMul:1 / (1 + Math.max(-.08, M.ds || 0) * 6), intAdj:(M.di || 0) * 4,
    yac:0, airU:0, ev:[]
  };
  st.QB = Op[6]; st.RB = Op[7];
  st.all = [...Op, ...Dp];
  return st;
}

/* ---------------- assignments at the snap ---------------- */
function assign(){
  const { O, D, P, oK, dK, tree, s, fl } = S;
  const cov = COV[dK] || COV.base;
  const run = P.k === 'run';
  S.run = run;
  // offense
  S.routes = [];
  for (const p of O){
    if (p.i <= 4) p.role = run ? 'rblk' : 'pblk';
    else if (p.i === 6) p.role = 'qb';
    else if (!run && tree[p.i]){ p.role = 'route'; p.route = mkRoute(p, tree[p.i]); S.routes.push(p); }
    else if (run && p.i === 7 && oK !== 'sneak') p.role = 'rb';
    else if (run && (p.i === 8 || p.i === 9 || (p.i === 10 && p.pos === 'WR'))) p.role = 'stalk';
    else if (run && p.i === 10 && p.pos === 'FB') p.role = 'lead';
    else p.role = run ? 'rblk' : 'pblk';
  }
  S.ids = (H.eligible(oK) || []).filter(i => O[i].role === 'route');
  // QB launch point
  const gun = S.R.fm === 'gun', Q = S.QB;
  const deep = S.routes.some(r => DEEP_R.has(r.route.type));
  if (run){
    if (oK === 'sneak'){ Q.path = [[16, 0], [60, 0]]; }
    else if (oK === 'draw'){ Q.path = [[-52, s * 2]]; }
    else if (oK === 'sweep'){ Q.path = [[-20, s * 8], [-24, -s * 10]]; }
    else if (gun){ Q.path = [[Q.p[0] + 2, 0]]; }
    else Q.path = [[-24, s * 5]];
  } else if (oK === 'pa' || oK === 'boot'){
    Q.path = [[-30, s * 6], ...(oK === 'boot' ? [[-44, -fl * 75]] : [[-56, -4]])]; Q.fake = true;
  } else if (oK === 'screen') Q.path = [[Q.p[0] - 22, 0]];
  else if (gun) Q.path = [[Q.p[0] - 10, 0]];
  else Q.path = [[deep ? -58 : -42, 0]];
  Q.pi = 0;
  // the back on a run: the mesh point, then the hole
  if (run && oK !== 'sneak'){
    const gapV = { Q:0, A:9, B:24, C:42, E:115 }[P.gap || 'A'], gv = s * gapV;
    S.hole = [0, oK === 'sweep' ? s * 120 : gv];
    const R0 = S.RB, pts = [];
    if (oK === 'counter') pts.push([-52, -s * 9]);
    if (oK === 'sweep') pts.push([-38, s * 34], [-14, s * 118], [40, s * 150]);
    else if (oK === 'draw') pts.push([-50, s * 6], [-4, gv], [60, gv]);
    else if (oK === 'power') pts.push([-34, s * 12], [0, gv], [60, gv + s * 6]);
    else pts.push([oK === 'counter' ? -30 : -28, s * 4 + (oK === 'counter' ? s * -2 : 0)], [0, gv], [60, gv]);
    R0.path = pts; R0.pi = 0; R0.wait = oK === 'draw' ? .4 : 0;
    // pulling guard on power and counter
    if (oK === 'power' || oK === 'counter'){ const g = [1, 2].find(i => Math.sign(O[i].p[1]) === -s); if (g != null){ O[g].role = 'pull'; O[g].path = [[-16, O[g].p[1] * .4], [2, gv - s * 6]]; O[g].pi = 0; } }
    if (oK === 'draw') O.forEach(p => { if (p.i <= 4) p.drawSet = .6; });
  }
  if (run && oK === 'sneak'){ S.hole = [0, 0]; }
  // defense
  const rushSet = new Set(cov.rush);
  // a call with run in mind: goal line and base read run first
  for (const x of D){
    x.react = .12 + (1 - x.aw) * .35 + rnd() * .15;
    if (rushSet.has(x.i)){ x.role = 'rush'; continue; }
    if (cov.z && cov.z[x.i]){ x.role = 'zone'; x.zone = ZN[cov.z[x.i]]; continue; }
    x.role = 'zone'; x.zone = ZN.hookM;
  }
  if (cov.man){
    // man defenders pick up receivers by who lines up closest (so a flipped formation still matches up)
    const men = cov.man.map(j => D[j]);
    const rc = O.filter(p => [5, 7, 8, 9, 10].includes(p.i) && p.pos !== 'OL');
    const pairs = [];
    for (const x of men) for (const r of rc) pairs.push([dist(x.p, r.p) + (r.i === 7 ? 40 : 0), x, r]);
    pairs.sort((a, b) => a[0] - b[0]);
    const tx = new Set(), tr = new Set();
    for (const [, x, r] of pairs){ if (tx.has(x) || tr.has(r)) continue; tx.add(x); tr.add(r); x.role = 'man'; x.man = r; }
    for (const x of men) if (!tx.has(x)){ x.role = 'zone'; x.zone = ZN.hookM; }
  }
  S.rushers = D.filter(x => x.role === 'rush');
  // blocking assignments
  if (run) assignRunBlocks(); else assignPassPro();
  // press: a corner lined up on a receiver gets a jam in
  for (const x of D) if (x.role === 'man' && x.pos === 'CB' && dist(x.p, x.man.p) < 30 && x.man.role === 'route') x.man.jam = .25 + (x.str - x.man.str) * .3;
}
function mkRoute(p, type){
  const D = H.defDepth(type);
  const keys = H.routeKeysFor([p.p[0], p.p[1]], type, D, .4, .55, p.i === 7 ? S.s : 0);
  const pts = [];
  for (let k = 1; k < keys.length; k++){ const q = [keys[k][1], clamp(keys[k][2], -258, 258)]; const prev = pts.length ? pts[pts.length - 1] : p.p; if (dist(q, prev) > 3) pts.push(q); }
  const settle = type === 'curl' || type === 'comeback';
  return { type, pts, idx:0, settle, brk:DEEP_R.has(type) && type !== 'post' && type !== 'corner' ? -1 : (pts.length > 1 ? 0 : -1), done:false };
}
function assignPassPro(){
  const B = S.O.filter(p => p.role === 'pblk'), R = S.rushers.slice();
  const pairs = [];
  for (const b of B) for (const x of R) pairs.push([Math.abs(b.p[1] - x.p[1]) + Math.abs(b.p[0] - x.p[0]) * .3 + (b.i > 4 ? 18 : 0), b, x]);
  pairs.sort((a, b) => a[0] - b[0]);
  const hb = new Set(), hx = new Set();
  for (const [, b, x] of pairs){ if (hb.has(b) || hx.has(x)) continue; hb.add(b); hx.add(x); b.target = x; }
  // spare blockers help on the most dangerous man next to them; a back waits a beat and picks up anybody free
  for (const b of B) if (!hb.has(b)){
    if (b.i === 7){ b.scan = true; continue; }
    const near = R.filter(x => Math.abs(x.p[1] - b.p[1]) < 46).sort((a, c) => Math.abs(a.p[1]) - Math.abs(c.p[1]))[0];
    if (near){ b.target = near; b.help = true; }
  }
  for (const x of R){ const n = B.filter(b => b.target === x).length; x.dbl = n >= 2; }
}
function assignRunBlocks(){
  const B = S.O.filter(p => p.role === 'rblk'), DL = S.D.filter(x => x.i <= 3 || (x.role === 'rush' && x.i > 3));
  const pairs = [];
  for (const b of B) for (const x of DL) pairs.push([dist(b.p, x.p), b, x]);
  pairs.sort((a, b) => a[0] - b[0]);
  const hb = new Set(), hx = new Set();
  for (const [dd, b, x] of pairs){ if (hb.has(b) || hx.has(x) || dd > 70) continue; hb.add(b); hx.add(x); b.target = x; }
  for (const b of B) if (!hb.has(b)) b.climb = true;
  // receivers block the man across from them
  const DB = S.D.filter(x => x.pos === 'CB' || x.pos === 'S');
  for (const w of S.O.filter(p => p.role === 'stalk')){ const x = DB.filter(y => !y.stalked).sort((a, b) => dist(a.p, w.p) - dist(b.p, w.p))[0]; if (x){ w.target = x; x.stalked = true; } }
}

/* ---------------- movement ---------------- */
function seek(p, tgt, f = 1, through){
  const dx = tgt[0] - p.p[0], dy = tgt[1] - p.p[1], L = hyp(dx, dy);
  if (L < 1.2 && !through){ p.want = [0, 0]; return; }
  // ease in to a stop instead of orbiting the spot (unless he's chasing somebody: then run through it)
  const sp = through ? p.vmax * f : Math.min(p.vmax * f, L / DT * .9, L * 6);
  p.want = [dx / L * sp, dy / L * sp];
}
function topSpeed(p){ return p.vmax * (.8 + .2 * p.E); }
function integrate(p){
  if (p.down > 0){ p.down -= DT; p.vel[0] *= .8; p.vel[1] *= .8; p.p[0] += p.vel[0] * DT; p.p[1] += p.vel[1] * DT; return; }
  if (p.eng) return;
  let w = p.want || [0, 0];
  if (p.stun > 0){ p.stun -= DT; w = [w[0] * .25, w[1] * .25]; }
  if (p.jam > 0){ p.jam -= DT; w = [w[0] * .35, w[1] * .35]; }
  // nobody runs faster than his top speed
  const ws = hyp(w[0], w[1]), cap = topSpeed(p) * (p.burst > S.t ? 1.1 : 1) * (p === S.holder && !p.sprint ? .9 : 1);
  if (ws > cap){ w = [w[0] / ws * cap, w[1] / ws * cap]; }
  const acc = p.vmax / p.accT * (p.move && S.t - p.move.t0 < .25 ? 3 : 1);
  const dv = [w[0] - p.vel[0], w[1] - p.vel[1]], dl = hyp(dv[0], dv[1]);
  // braking and cutting is harder than speeding up in a straight line
  const turn = hyp(p.vel[0], p.vel[1]) > 20 && (w[0] * p.vel[0] + w[1] * p.vel[1]) < 0 ? .7 + p.agi * .5 : 1.25;
  const mx = acc * turn * DT;
  if (dl > mx){ p.vel[0] += dv[0] / dl * mx; p.vel[1] += dv[1] / dl * mx; } else { p.vel[0] = w[0]; p.vel[1] = w[1]; }
  p.p[0] += p.vel[0] * DT; p.p[1] += p.vel[1] * DT;
  const sp = hyp(p.vel[0], p.vel[1]);
  if (p === S.holder && sp > p.vmax * .9 && p.sprint) p.E = Math.max(0, p.E - DT * .07);
}
function separate(){
  const A = S.all;
  for (let a = 0; a < A.length; a++) for (let b = a + 1; b < A.length; b++){
    const p = A[a], q = A[b];
    if (p.eng === q || q.eng === p || p.down > 0 || q.down > 0) continue;
    if (p === S.holder || q === S.holder) continue;
    const dx = q.p[0] - p.p[0], dy = q.p[1] - p.p[1], L = hyp(dx, dy);
    if (L > 0 && L < 7){ const k = (7 - L) / 2 / L; p.p[0] -= dx * k; p.p[1] -= dy * k; q.p[0] += dx * k; q.p[1] += dy * k; }
  }
}

/* ---------------- blocking ----------------
   A block is two men locked together. In pass protection the rusher walks the pair back toward the QB until he
   sheds it (when depends on the rush against the protection, like the old pressure model); in the run game the
   blocker who wins the block drives his man away from the hole, and the one who loses gets shed quickly. */
function engage(b, x){
  if (x.eng && x.eng !== b){
    // second man on him: a double team holds him a lot longer
    if (!x.eng2 && S.t < x.shedAt){ x.eng2 = b; b.eng = x; b.dbl = true; x.shedAt += (x.shedAt - S.t) * .8; }
    return;
  }
  b.eng = x; x.eng = b; x.engT = S.t; x.isB = true; b.isB = false;
  if (S.run){
    const p = clamp(1 / (1 + Math.exp(-((S.redge * 10) / 9 + (S.M.dm || 0) * .18))), .2, .85);
    // three ways a run block goes: the blocker drives him off the ball, they stalemate (he holds his gap), or he gets beat
    // clean and the defender is in the backfield. On a draw the line invites the rush upfield and rides it wide.
    const pw = b.drawSet ? Math.min(.9, p + .3) : b.pos === 'WR' ? p * .8 : b.pos === 'OL' ? p : p * .9;
    const u = rnd(), res = u < pw ? 'w' : u < pw + (1 - pw) * .75 ? 's' : 'l';
    b.win = res === 'w'; b.res = res;
    // linebackers and DBs get off blocks quicker than the big men up front
    const lv2 = x.pos !== 'DL';
    x.shedAt = S.t + (res === 'w' ? (lv2 ? .5 + rnd() * .9 : 1.1 + rnd() * 1.7) : res === 's' ? (lv2 ? .35 + rnd() * .6 : .9 + rnd() * 1.3) : (lv2 ? .2 + rnd() * .35 : .45 + rnd() * .6));
    const away = Math.sign(x.p[1] - (S.hole ? S.hole[1] : 0)) || (rnd() < .5 ? 1 : -1);
    b.drive = nrm(.35, away);
  } else {
    const lb = x.pos === 'LB';
    const pd = S.plan === 'agg' ? .9 : S.plan === 'bend' ? 1.06 : 1;
    const rp = S.R.keyed || 0;
    let t = (lb ? 5.2 : 4.4) * Math.exp(S.edge * .2) * logn(.48) * pd * (1 - rp * .06) * S.shedMul;
    if (b.pos !== 'OL') t *= b.pos === 'RB' ? .55 : .75;
    if (x.dbl) t *= 1.5;
    x.shedAt = S.t + Math.max(.35, t - .45);
    b.win = false;
  }
}
function unlock(x, beat){
  for (const b of [x.eng, x.eng2]) if (b){ b.eng = null; if (beat) b.stun = .4; }
  x.eng = null; x.eng2 = null; x.shed = S.t; x.isB = false;
}
function blocks(){
  for (const x of S.all){
    const b = x.eng; if (!b || !x.isB) continue;
    if (b.eng !== x){ x.eng = null; x.isB = false; continue; }
    if (S.t >= x.shedAt || x.down > 0 || b.down > 0){ unlock(x, true); continue; }
    const g = goalOf(x);
    const mid = [(b.p[0] + x.p[0]) / 2, (b.p[1] + x.p[1]) / 2];
    let mv = [0, 0];
    if (!S.run || x.team === 'o'){
      // the rusher walks the pocket back; a quick shed means he's winning, so he walks it faster
      const left = Math.max(.4, x.shedAt - S.t), n = nrm(g[0] - mid[0], g[1] - mid[1]);
      const v = clamp(14 / left, 3, 24) * (x.eng2 ? .4 : 1);
      mv = [n[0] * v, n[1] * v];
    } else if (b.win){ const k = Math.max(0, 1 - (S.t - x.engT) / 1.6); mv = [b.drive[0] * 16 * k, b.drive[1] * 16 * k]; }
    else { const n = nrm(g[0] - mid[0], g[1] - mid[1]), v = b.res === 's' ? 3 : 12; mv = [n[0] * v, n[1] * v]; }
    mid[0] += mv[0] * DT; mid[1] += mv[1] * DT;
    // keep the blocker between his man and the ball
    let n = nrm(x.p[0] - b.p[0], x.p[1] - b.p[1]);
    const want = nrm(mid[0] - g[0], mid[1] - g[1]);
    n = nrm(lerp(n[0], -want[0], .06), lerp(n[1], -want[1], .06));
    b.p = [mid[0] - n[0] * 6, mid[1] - n[1] * 6]; x.p = [mid[0] + n[0] * 6, mid[1] + n[1] * 6];
    b.vel = mv.slice(); x.vel = mv.slice();
    if (x.eng2){ const h = x.eng2; h.p = [mid[0] - n[0] * 6 - n[1] * 8, mid[1] - n[1] * 6 + n[0] * 8]; h.vel = mv.slice(); }
  }
}
// where a defender (or, on a return, an offensive player) is trying to get to
function goalOf(x){
  const h = S.holder;
  if (S.ball.st === 'air' && S.ball.kind === 'pass') return S.ball.to;
  if (h) return [h.p[0] + h.vel[0] * .3, h.p[1] + h.vel[1] * .3];
  return S.QB.p;
}

/* ---------------- the ball ---------------- */
function holdBy(p){ S.ball = { st:'held', h:p, p:p.p.slice(), z:7 }; S.holder = p; }
function throwBall(from, to, speed, peak, kind, tgt, extra){
  const D = dist(from.p, to), Tf = .06 + D / speed;
  S.ball = Object.assign({ st:'air', from:[from.p[0], from.p[1]], to:[to[0], to[1]], T0:S.t, Tf:S.t + Tf, peak, kind, tgt, thrower:from, tips:new Set(), p:from.p.slice(), z:7 }, extra || {});
  S.holder = null;
}
function ballStep(){
  const B = S.ball;
  if (B.st === 'held'){ const h = B.h; B.p = [h.p[0] + 3, h.p[1] + 3]; B.z = 7; return; }
  if (B.st === 'snap'){
    const k = clamp((S.t - B.T0) / (B.Tf - B.T0), 0, 1);
    B.p = [lerp(B.from[0], S.QB.p[0], k), lerp(B.from[1], S.QB.p[1], k)]; B.z = 4 + 6 * k;
    if (k >= 1) holdBy(S.QB);
    return;
  }
  if (B.st === 'air'){
    const k = clamp((S.t - B.T0) / (B.Tf - B.T0), 0, 1.6);
    const kk = Math.min(k, 1);
    const kh = k <= 1 ? k : 1 + (k - 1) * .35;
    B.p = [lerp(B.from[0], B.to[0], kh), lerp(B.from[1], B.to[1], kh)];
    B.z = k <= 1 ? lerp(7, 6, kk) + B.peak * 4 * kk * (1 - kk) : Math.max(0, 6 - (k - 1) * 30);
    if (B.kind === 'pass' && k < 1) tipCheck(B, k);
    if (S.ball !== B) return;
    if (k >= 1 && !B.resolved){ B.resolved = true; arrive(B); }
    else if (B.resolved && B.landed && k >= 1.25 && !S.end) endPlay('inc');
    return;
  }
  if (B.st === 'loose'){
    const k = clamp((S.t - B.T0) / .45, 0, 1);
    B.p = [lerp(B.from[0], B.to[0], k), lerp(B.from[1], B.to[1], k)]; B.z = Math.abs(Math.sin(k * Math.PI * 2)) * 6;
    if (S.t - B.T0 > .55){
      // whoever gets on it first
      let best = null, bd = 1e9;
      for (const p of S.all){ if (p.down > 0) continue; const dd = dist(p.p, B.p) - (p.team === B.last ? 0 : 3); if (dd < bd){ bd = dd; best = p; } }
      if (best && bd < 12){ best.down = .6; S.recover = best; endPlay(best.team === 'o' ? 'ownrec' : 'fum'); }
      else if (S.t - B.T0 > 3){ S.recover = S.O[0]; endPlay('ownrec'); }
    }
  }
}
// a low throw through traffic can get tipped or picked by someone underneath it
function tipCheck(B, k){
  if (k < .08 || k > .9 || B.z > 20) return;
  for (const x of S.D){
    if (x.down > 0 || B.tips.has(x) || dist(x.p, B.p) > 7) continue;
    if (x.pos === 'DL' ? k > .3 : k < .45) continue;
    B.tips.add(x);
    const pDef = x.pos === 'DL' ? .18 : .3;
    if (rnd() < pDef){
      if (rnd() < .22 * (1 + x.hands)){ return intercept(x, B); }
      callout('TIPPED!', S.userSide === 'd' ? 'g' : 'b'); S.incWhy = 'tip';
      if (S.dbg) S.dbg.push(`TIP by d${x.i} ${x.pos} k=${k.toFixed(2)} z=${B.z.toFixed(0)}`);
      B.to = [B.p[0] + (rnd() - .5) * 30, B.p[1] + (rnd() - .5) * 30]; B.from = B.p.slice(); B.T0 = S.t; B.Tf = S.t + .35; B.peak = 8; B.kind = 'tip'; B.resolved = false;
      return;
    }
  }
}
function arrive(B){
  if (B.kind === 'pitch'){
    const r = B.tgt;
    if (dist(r.p, B.to) < 18 && rnd() < .985){ holdBy(r); S.carrier = r; if (S.chase < 0) S.chase = S.t; return; }
    S.ball = { st:'loose', from:B.to.slice(), to:[B.to[0] - 8, B.to[1]], T0:S.t, last:'o', p:B.to.slice(), z:2 }; S.fumbleBy = r; return;
  }
  if (B.kind === 'away' || B.kind === 'tip'){ B.landed = true; return; }
  const L = B.to;
  if (Math.abs(L[1]) > SL - 2 || L[0] > S.goalU + 98){ B.landed = true; S.incWhy = 'oob'; return; }
  // who can get a hand on it
  const reachO = 13, rc = S.O.filter(p => (p.role === 'route' || p === B.tgt) && p.down <= 0);
  let r = B.tgt, dR = r ? dist(r.p, L) : 1e9;
  for (const p of rc){ const dd = dist(p.p, L); if (dd < dR - 4){ r = p; dR = dd; } }
  let x = null, dD = 1e9;
  for (const q of S.D){
    if (q.down > 0 || q.eng) continue;
    const jump = q.jump != null && S.t - q.jump < .6 ? 9 : 0;
    const aware = q.ballSeen != null && S.t >= q.ballSeen;
    const dd = dist(q.p, L) - jump - (aware ? 0 : -4);
    if (dd < dD){ dD = dd; x = q; }
  }
  const reachD = B.lob ? 15 : 11;   // a ball that hangs up gives the man in coverage time to get a hand in
  if (S.dbg) S.dbg.push(`ARRIVE t=${S.t.toFixed(2)} L=${L.map(Math.round)} r=o${r && r.i} dR=${dR.toFixed(1)} at ${r && r.p.map(Math.round)} x=d${x && x.i} dD=${dD.toFixed(1)}`);
  const inR = dR <= reachO, inD = dD <= reachD;
  const grade = B.grade || 'GOOD';
  if (inR && !inD){
    let pc = r.cth * (1 - Math.max(0, dR - 8) / 5 * .3) + .04;
    // a man in his hip pocket makes it a tougher catch, more so on a ball that hangs up; deep balls are hard anyway
    pc -= clamp((26 - dD) / 26, 0, 1) * (B.lob ? .38 : .22);
    if (L[0] - B.from[0] > 220) pc -= .08;
    if (grade === 'PERFECT') pc = Math.min(.99, pc + .07);
    if (rnd() < pc) return catchBy(r, B);
    callout('DROPPED', S.userSide === 'o' ? 'b' : 'g'); B.landed = true; S.incWhy = 'drop'; return;
  }
  if (inR && inD){
    const pc = clamp(.42 + (dD - dR) * .035 + (r.cth - .8) * .8 - (x.cov - .6) * .3 + (grade === 'PERFECT' ? .08 : 0) - (S.M.dc ? 0 : 0), .08, .86);
    const u = rnd();
    if (u < pc) return catchBy(r, B, true);
    const pint = (1 - pc) * clamp(x.hands * .55 + S.intAdj + (x.jump != null && S.t - x.jump < .6 ? .15 : 0), .05, .5);
    if (u < pc + pint) return intercept(x, B);
    callout('BROKEN UP', S.userSide === 'd' ? 'g' : 'b'); B.landed = true; S.incWhy = 'pbu'; S.pbu = x; return;
  }
  if (inD){
    const pint = clamp(.14 + x.hands * .45 - Math.max(0, dD) * .02 + S.intAdj + (x.jump != null && S.t - x.jump < .6 ? .2 : 0), .06, .62);
    if (rnd() < pint) return intercept(x, B);
    callout('BROKEN UP', S.userSide === 'd' ? 'g' : 'b'); B.landed = true; S.incWhy = 'pbu'; S.pbu = x; return;
  }
  B.landed = true; S.incWhy = 'miss';
}
function catchBy(r, B, contested){
  holdBy(r); S.carrier = r; S.caught = { p:r, u:r.p[0], at:S.t }; S.chase = S.t;
  // anybody who was already breaking on the throw goes straight at him
  for (const x of S.D) if (x.ballSeen != null && x.ballSeen <= S.t) x.react = Math.min(x.react, .05);
  r.vel = [r.vel[0] * .6, r.vel[1] * .6];
  if (contested) callout('WHAT A CATCH!', S.userSide === 'o' ? 'g' : 'b');
  for (const p of S.O) if (p !== r && p.role === 'route') p.role = 'dblk';
  if (S.userSide === 'o') setCtl(r);
  if (r.p[0] >= S.goalU) endPlay('td');
}
function intercept(x, B){
  holdBy(x); S.carrier = x; S.intAt = { u:x.p[0], at:S.t }; S.chase = S.t;
  x.vel = [-Math.abs(x.vel[0]) * .4, x.vel[1] * .4];
  callout('INTERCEPTED!', S.userSide === 'd' ? 'g' : 'b');
  for (const p of S.all){ p.eng = null; p.eng2 = null; p.isB = false; p.target = null; }
  for (const p of S.O){ p.role = 'pursue'; p.react = .2 + rnd() * .4; }
  for (const q of S.D){ if (q !== x) q.role = 'dblk'; }
  if (S.userSide === 'd') setCtl(x); else if (S.userSide === 'o') setCtl(null);
  // caught in the end zone: touchback unless he runs it out (he won't — down it)
  if (x.p[0] >= S.goalU){ S.tb = true; endPlay('int'); }
}

/* ---------------- brains ---------------- */
function aiOffense(p){
  const h = S.holder;
  switch (p.role){
    case 'qb': return qbAI(p);
    case 'pblk': {
      if (S.thrown && S.ball.st === 'held' && S.ball.h !== S.QB) return dblkAI(p);
      if (S.R.oK === 'screen' && S.t > 1.1){ p.role = 'dblk'; return dblkAI(p); }
      if (p.scan && !p.target && S.t > .45){
        const free = S.rushers.filter(x => !x.eng && x.down <= 0).sort((a, b) => dist(a.p, S.QB.p) - dist(b.p, S.QB.p))[0];
        if (free) p.target = free;
      }
      let x = p.target;
      if (!x || (x.shed && x.shed < S.t - .1 && dist(x.p, S.QB.p) < dist(p.p, S.QB.p))){
        // he's beaten (or had nobody): pick up anybody coming free nearby
        const near = S.rushers.filter(y => !y.eng && y.down <= 0 && dist(y.p, p.p) < 36)[0];
        if (near){ p.target = near; x = near; }
        else { seek(p, [Math.max(S.QB.p[0] + 18, p.p[0] - 4), p.p[1] * 1.02], .5); return; }
      }
      const g = S.QB.p, n = nrm(g[0] - x.p[0], g[1] - x.p[1]);
      const spot = [x.p[0] + n[0] * 11, x.p[1] + n[1] * 11];
      seek(p, spot, 1);
      if (dist(p.p, x.p) < 13 && x.down <= 0 && (!x.eng || p.help) && !(x.shed && S.t - x.shed < .6)) engage(p, x);
      return;
    }
    case 'rblk': {
      if (S.t < (p.drawSet || 0)){
        // the draw: sell pass protection (get between him and the QB), then ride him past
        const x = p.target;
        if (x){ const n = nrm(S.QB.p[0] - x.p[0], S.QB.p[1] - x.p[1]); seek(p, [x.p[0] + n[0] * 11, x.p[1] + n[1] * 11], 1); if (dist(p.p, x.p) < 13 && !x.eng) engage(p, x); }
        else seek(p, [p.p[0] - 3, p.p[1]], .4);
        return;
      }
      if (h && h !== S.QB && h.p[0] > 25 && !p.target) return dblkAI(p);
      let x = p.target;
      if (!x && p.climb && S.t > .12){
        const lbs = S.D.filter(y => y.pos === 'LB' && !y.eng && y.down <= 0 && !y.climbed).sort((a, b) => dist(a.p, p.p) - dist(b.p, p.p));
        if (lbs[0] && dist(lbs[0].p, p.p) < 100){ x = p.target = lbs[0]; lbs[0].climbed = true; }
      }
      if (!x || (x.shed && x.shed < S.t)){ p.target = null; return dblkAI(p); }
      seek(p, x.p, 1);
      if (dist(p.p, x.p) < 13 && !x.eng && x.down <= 0) engage(p, x);
      return;
    }
    case 'pull': case 'lead': {
      if (!p.path){ const hole = S.hole || [0, 0]; p.path = [[-4, hole[1]], [12, hole[1]]]; p.pi = 0; }
      if (p.pi < p.path.length && !p.target){
        const w = p.path[p.pi]; seek(p, w, 1, p.pi < p.path.length - 1); if (dist(p.p, w) < 8) p.pi++;
        // first unblocked man near the hole
        const x = S.D.filter(y => !y.eng && y.down <= 0 && dist(y.p, S.hole || [0, 0]) < 60).sort((a, b) => dist(a.p, p.p) - dist(b.p, p.p))[0];
        if (x && dist(x.p, p.p) < 40) p.target = x;
        return;
      }
      const x = p.target; if (!x || (x.shed && x.shed < S.t)) return dblkAI(p);
      seek(p, x.p, 1); if (dist(p.p, x.p) < 13 && !x.eng) engage(p, x); return;
    }
    case 'stalk': {
      const x = p.target; if (!x || (x.shed && x.shed < S.t)) return dblkAI(p);
      if (S.t < .5){ seek(p, [p.p[0] + 20, p.p[1]], .5); return; }
      seek(p, x.p, .9); if (dist(p.p, x.p) < 12 && !x.eng) engage(p, x); return;
    }
    case 'route': return routeAI(p);
    case 'rb': return rbAI(p);
    case 'dblk': return dblkAI(p);
    case 'pursue': return pursueAI(p);
  }
}
function routeAI(p){
  const B = S.ball;
  // the ball is in the air to him: go get it
  if (B.st === 'air' && B.kind === 'pass' && B.tgt === p){
    const left = Math.max(.05, B.Tf - S.t), dd = dist(p.p, B.to);
    seek(p, B.to, dd / left > p.vmax * .8 ? 1 : Math.max(.55, dd / left / p.vmax * 1.05));
    return;
  }
  if (S.scramble && S.holder === S.QB){ // scramble drill: get open moving the same way as the QB
    seek(p, [Math.max(p.p[0], 30), clamp(p.p[1] + Math.sign(S.QB.p[1] - p.p[1] || 1) * 40, -230, 230)], .8); return;
  }
  const r = p.route;
  if (S.t < .05) { p.want = [0, 0]; return; }
  if (r.idx < r.pts.length){
    const w = r.pts[r.idx]; seek(p, w, 1, !(r.settle && r.idx === r.pts.length - 1));
    if (dist(p.p, w) < 6){
      r.idx++;
      if (r.idx === 1 && r.brk >= 0) r.brkAt = S.t;
      // cutting costs speed: a sharp cut more, a better route runner less
      if (r.idx < r.pts.length){
        // plant and cut: he comes out of the break going the new way, a little slower (less so for a good route runner)
        const nx = r.pts[r.idx], b = nrm(nx[0] - p.p[0], nx[1] - p.p[1]);
        const sp = hyp(p.vel[0], p.vel[1]), vn = nrm(p.vel[0], p.vel[1]), cos = vn[0] * b[0] + vn[1] * b[1];
        const keep = cos > .85 ? 1 : Math.min(1, lerp(.5, .82, p.rte) + (cos + 1) * .12);
        p.vel = [b[0] * sp * keep, b[1] * sp * keep];
      }
    }
    return;
  }
  if (r.settle){ // sit down in the soft spot, turn back to the QB
    const near = S.D.filter(x => dist(x.p, p.p) < 30)[0];
    if (near) seek(p, [p.p[0] - 2, p.p[1] + Math.sign(p.p[1] - near.p[1] || 1) * 20], .4); else p.want = [0, 0];
    return;
  }
  // past the end of the route: keep going the same way, then drift away from the nearest defender
  const last = r.pts[r.pts.length - 1], prev = r.pts.length > 1 ? r.pts[r.pts.length - 2] : p.p;
  let n = nrm(last[0] - prev[0], last[1] - prev[1]);
  if (Math.abs(p.p[1]) > 240 && Math.sign(n[1]) === Math.sign(p.p[1])) n = nrm(n[0] + .3, 0);
  if (p.p[0] > S.goalU + 80) n = [0, Math.sign(n[1] || 1)];
  seek(p, [p.p[0] + n[0] * 40, clamp(p.p[1] + n[1] * 40, -250, 250)], .92);
}
function qbAI(p){
  // before the ball gets to him or after he gives it up
  if (S.holder !== p){
    if (S.run && S.handoff >= 0){ seek(p, [Math.min(p.p[0], -40), p.p[1] - S.s * 30], .5); return; }
    if (S.thrown){ p.want = [0, 0]; return; }
  }
  if (S.ctl === p && S.userMoved) return;   // the user has him
  if (p.pi < (p.path || []).length){
    const w = p.path[p.pi]; seek(p, w, p.pi === 0 && S.R.fm === 'gun' ? .5 : .78, p.pi < p.path.length - 1);
    if (dist(p.p, w) < 5) p.pi++;
    if (!S.run && p.fake && p.pi === 1 && !p.faked){ p.faked = true; }
    return;
  }
  if (S.run){ p.want = [0, 0]; return; }
  // in the pocket: slide away from the nearest rusher
  const r = S.rushers.filter(x => !x.eng && x.down <= 0).sort((a, b) => dist(a.p, p.p) - dist(b.p, p.p))[0];
  if (r && dist(r.p, p.p) < 40){ const n = nrm(p.p[0] - r.p[0], p.p[1] - r.p[1]); seek(p, [p.p[0] + n[0] * 10 + 6, clamp(p.p[1] + n[1] * 20, -80, 80)], .6); }
  else seek(p, [Math.min(p.p[0] + 4, -30), p.p[1]], .2);
  if (S.userSide !== 'o') cpuRead(p);
}
// where a receiver will be `tau` seconds from now if he keeps running his route
function future(r, tau){
  if (!r.route || S.caught) return [r.p[0] + r.vel[0] * tau, r.p[1] + r.vel[1] * tau];
  let pos = r.p.slice(), left = tau, idx = r.route.idx;
  const v = Math.max(hyp(r.vel[0], r.vel[1]), r.vmax * .85);
  while (left > 0 && idx < r.route.pts.length){
    const w = r.route.pts[idx], dd = dist(pos, w), tt = dd / v;
    if (tt >= left){ const k = left / tt; return [lerp(pos[0], w[0], k), lerp(pos[1], w[1], k)]; }
    pos = w.slice(); left -= tt; idx++;
  }
  if (left > 0 && !r.route.settle){
    const pts = r.route.pts, a = pts[pts.length - 2] || r.p, b = pts[pts.length - 1] || r.p, n = nrm(b[0] - a[0], b[1] - a[1]);
    pos = [pos[0] + n[0] * v * left, clamp(pos[1] + n[1] * v * left, -250, 250)];
  }
  return pos;
}
// how open a throw to him would be: seconds he'd beat the closest defender to the spot by
function openness(r, speed){
  const Q = S.QB.p;
  let tau = .3; for (let k = 0; k < 4; k++){ const f = future(r, tau); tau = .06 + dist(Q, f) / speed; }
  const L = future(r, tau);
  let best = 9;
  for (const x of S.D){
    if (x.down > 0) continue;
    const tx = Math.max(0, dist(x.p, L) - 9) / x.vmax + (x.eng ? .6 : .12) - (x.role === 'man' && x.man === r ? .05 : 0);
    best = Math.min(best, tx - tau);
    // in the throwing lane on a line drive
    if (speed > 260 && !x.eng){ const lane = segDist(x.p, Q, L); if (lane < 9 && dist(x.p, Q) > 25 && dist(x.p, L) > 25) best = Math.min(best, -.25); }
  }
  if (Math.abs(L[1]) > 250 || L[0] > S.goalU + 90) best -= 1;
  return { open:best, L, tau };
}
function segDist(p, a, b){ const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1, k = clamp(((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2, 0, 1); return hyp(p[0] - a[0] - dx * k, p[1] - a[1] - dy * k); }
function pressure(){
  let m = 1e9; for (const x of S.D) if (!x.eng && x.down <= 0) m = Math.min(m, dist(x.p, S.QB.p));
  return m;
}
function cpuRead(p){
  if (S.holder !== p || S.thrown || S.t < (S.cpuNext || 0)) return;
  S.cpuNext = S.t + .1;
  const pathDone = p.pi >= (p.path || []).length;
  if (!pathDone && S.t < 1.4 && !(p.fake && p.pi >= 1 && S.t > .8)) return;
  const rd = S.ids.map(i => S.O[i]).filter(r => r.role === 'route');
  if (!rd.length) return;
  // the primary first, then the rest as time goes on
  const tree = S.tree, order = [S.O[tree.p] || rd[0], ...rd.filter(r => r.i !== tree.p)];
  const since = S.t - (S.dropT || S.t);
  if (!S.dropT) S.dropT = S.t;
  const nRead = Math.min(order.length, 1 + Math.floor(since / .5));
  const pr = pressure();
  let best = null, bv = -9;
  for (let k = 0; k < nRead; k++){
    const r = order[k]; if (!r || r.role !== 'route') continue;
    const deep = DEEP_R.has(r.route.type);
    // a timing route goes when he comes out of his break, not later
    const R0 = r.route, broke = R0.brk < 0 || R0.idx > R0.brk;
    if (!broke && !deep && since < 1.2) continue;
    const o = openness(r, deep ? 210 : 300);
    const late = R0.brkAt ? Math.max(0, S.t - R0.brkAt - .5) : 0;
    const v = o.open + o.L[0] / 900 + (o.L[0] >= S.G.togo * 10 ? .12 : 0) - k * .04 - (deep ? 0 : late * .25);
    if (v > bv){ bv = v; best = [r, o, deep]; }
  }
  const need = pr < 16 ? -.12 : pr < 30 ? .02 : since > 2 ? .06 : .14;
  if (best && bv > need) return cpuThrow(p, best[0], best[2]);
  if (pr < 13 && since > .5){
    if (best && bv > -.35) return cpuThrow(p, best[0], best[2]);
    if (rnd() < .5) return throwAway(p);
  }
}
function cpuThrow(p, r, lob){
  const qa = p.qa, speed = lob ? 210 : 300 + (qa - .6) * 60;
  let tau = .3; for (let k = 0; k < 4; k++){ const f = future(r, tau); tau = .06 + dist(p.p, f) / speed; }
  const L = future(r, tau), D = dist(p.p, L), pr = pressure();
  const sd = (2.5 + (1 - qa) * 10) * (1 + D / 450) * (pr < 15 ? 2 : pr < 30 ? 1.4 : 1) * (lob ? 1.1 : 1);
  const to = [L[0] + gauss() * sd, L[1] + gauss() * sd * .8];
  if (S.dbg) S.dbg.push(`THROW t=${S.t.toFixed(2)} to o${r.i} ${r.route.type} idx=${r.route.idx}/${r.route.pts.length} at ${r.p.map(Math.round)} vel ${r.vel.map(Math.round)} L=${L.map(Math.round)} tau=${tau.toFixed(2)} pts=${JSON.stringify(r.route.pts.map(q=>q.map(Math.round)))}`);
  releaseBall(p, r, to, speed, lob, 'GOOD');
}
function releaseBall(p, r, to, speed, lob, grade){
  const D = dist(p.p, to);
  const peak = lob ? 30 + D * .2 : 7 + D * .055;
  throwBall(p, to, speed, peak, 'pass', r, { lob, grade });
  S.thrown = true; S.airU = to[0]; S.target = r; S.thrT = S.t;
  // the defense sees it come out and breaks on it
  for (const x of S.D){
    const facing = x.role === 'man' && x.man && x.man.p[0] > x.p[0] - 4 ? .18 : 0;
    x.ballSeen = S.t + clamp(.06 + (1 - x.aw) * .25 + facing + rnd() * .1, .05, .5);
  }
  H.THROW.on = false; H.THROW.ver++;
}
function throwAway(p){
  const to = [p.p[0] + 60, (Math.sign(p.p[1]) || 1) * 300];
  throwBall(p, to, 220, 20, 'away', null); S.thrown = true; S.awayT = true;
  H.THROW.on = false; H.THROW.ver++;
}
function rbAI(p){
  if (S.holder === p) return carrierAI(p);
  if (S.ctl === p && S.userMoved) return;
  if (S.t < (p.wait || 0)){ p.want = [0, 0]; return; }
  if (p.pi < p.path.length){
    const w = p.path[p.pi]; seek(p, w, p.pi === 0 && S.oK !== 'counter' ? .85 : 1, true);
    if (dist(p.p, w) < 7) p.pi++;
    return;
  }
  // he never got the ball (it's been fumbled or pitched over his head): go to it
  seek(p, S.ball.p, 1);
}
// the man with the ball, when the CPU is running him
function carrierAI(p){
  if (p.path && p.team === 'o' && !S.caught && p.pi < p.path.length - 1){
    const w = p.path[p.pi]; seek(p, w, 1, true); if (dist(p.p, w) < 8 || (p.pi > 0 && p.p[0] > w[0] + 4)) p.pi++;
    // somebody's in his face in the backfield: improvise
    if (!S.D.some(q => q.down <= 0 && !q.eng && dist(q.p, p.p) < 18)) return;
  }
  const fwd = p.team === 'o' ? 1 : -1;
  let dx = fwd, dy = 0;
  const pursuers = p.team === 'o' ? S.D : S.O;
  let threat = null, td = 1e9;
  for (const q of pursuers){
    if (q.down > 0 || q.eng) continue;
    const rx = p.p[0] - q.p[0], ry = p.p[1] - q.p[1], dd = hyp(rx, ry) || 1, ahead = (q.p[0] - p.p[0]) * fwd;
    // he reads blockers and pursuit from a distance; once a man is right on him he commits (or puts a move on him)
    if (dd < 80 && dd > 26 && ahead > -10){ const w = (80 - dd) / 54; dy += ry / dd * w * .7; }
    if (dd < td && ahead > -6){ td = dd; threat = q; }
  }
  // vision: at the line, pick the lane with the most daylight near the one the play was designed for
  if (S.hole && p.team === 'o' && p.p[0] < 14 && S.t - S.chase < 1.6){
    if (!p.laneT || S.t - p.laneT > .15){
      p.laneT = S.t; let best = S.hole[1], bv = -1e9;
      for (const o of [-40, -20, 0, 20, 40]){
        const lv = clamp(S.hole[1] + o, -230, 230); let room = 60;
        for (const q of S.D){ if (q.down > 0 || (q.eng && q.eng.res === 'w')) continue; if (q.p[0] < -25 || q.p[0] > 45) continue; room = Math.min(room, Math.abs(q.p[1] - lv) + Math.max(0, q.p[0] - 10) * .4); }
        const v = room - Math.abs(o) * .25 - Math.abs(lv - p.p[1]) * .15;
        if (v > bv){ bv = v; best = lv; }
      }
      p.lane = best;
    }
    dy += clamp((p.lane - p.p[1]) / 18, -1.4, 1.4);
  }
  if (Math.abs(p.p[1]) > 205) dy -= Math.sign(p.p[1]) * (Math.abs(p.p[1]) - 205) / 45;
  if (dx * fwd < .55) dx = fwd * .55;
  const n = nrm(dx, dy);
  p.sprint = false;
  // a CPU runner hits the hole under control, then opens it up (but never quite as fast as you can when you sprint)
  const sp = p.vmax * (p.p[0] * fwd > 40 || p.team === 'd' ? 1.04 : .97);
  p.want = [n[0] * sp, n[1] * sp];
  // a CPU runner throws a move now and then when somebody's about to hit him
  if (threat && td < 26 && td > 9 && S.t > p.moveCD && rnd() < .03 * (.4 + p.agi)){
    const side = Math.sign((threat.p[1] - p.p[1]) * fwd) || 1;
    doMove(p, rnd() < .6 ? (side > 0 ? 'jukeL' : 'jukeR') : rnd() < .5 ? 'spin' : 'stiff');
  }
}
function dblkAI(p){
  // find somebody chasing the ball and get in his way
  const h = S.holder; if (!h){ p.want = [0, 0]; return; }
  const them = p.team === 'o' ? S.D : S.O, fwd = h.team === 'o' ? 1 : -1;
  if (!p.target || p.target.eng || p.target.down > 0 || dist(p.target.p, h.p) > 120){
    p.target = null;
    let best = null, bd = 1e9;
    for (const x of them){
      if (x.eng || x.down > 0 || x.marked > S.t) continue;
      const ahead = (x.p[0] - h.p[0]) * fwd;
      if (ahead < -10 || dist(x.p, h.p) > 90 || dist(x.p, p.p) > 70) continue;
      const dd = dist(x.p, p.p); if (dd < bd){ bd = dd; best = x; }
    }
    if (best && bd < 90){ p.target = best; best.marked = S.t + .5; }
  }
  const x = p.target;
  if (!x){ seek(p, [h.p[0] + fwd * 30, h.p[1] + (p.p[1] > h.p[1] ? 25 : -25)], .7); return; }
  const n = nrm(h.p[0] - x.p[0], h.p[1] - x.p[1]);
  seek(p, [x.p[0] + n[0] * 8, x.p[1] + n[1] * 8], 1);
  if (dist(p.p, x.p) < 12 && !x.eng && x !== h){
    x.eng = p; p.eng = x; x.engT = S.t; x.isB = true; p.isB = false; x.shedAt = S.t + .35 + rnd() * .9 + (p.pos === 'OL' ? .4 : 0);
    if (x.team === 'o') x.shedAt = S.t + .3 + rnd() * .6;
  }
}
function pursueAI(p){
  const h = S.holder;
  if (!h){ seek(p, S.ball.p, 1); return; }
  if (h.team === p.team){ return dblkAI(p); }
  if (S.t - S.chase < p.react){ p.want = [p.want ? p.want[0] * .9 : 0, p.want ? p.want[1] * .9 : 0]; return; }
  // flying to the ball: a closing burst once he's near
  if (dist(p.p, h.p) < 40) p.burst = S.t + .2;
  seek(p, cutoff(p, h), 1, true);
}
// a pursuit angle: the spot where he can meet the runner, using where the runner has been heading lately
function cutoff(x, h){
  const H0 = h.hist, k = Math.min(H0.length - 1, 8), old = H0[H0.length - 1 - k] || h.p;
  const vx = k ? (h.p[0] - old[0]) / (k * DT) : h.vel[0], vy = k ? (h.p[1] - old[1]) / (k * DT) : h.vel[1];
  const rx = h.p[0] - x.p[0], ry = h.p[1] - x.p[1], sp = x.vmax * .97;
  const a = vx * vx + vy * vy - sp * sp, b = 2 * (rx * vx + ry * vy), c = rx * rx + ry * ry;
  let t = null;
  if (Math.abs(a) < 1e-6){ if (b < 0) t = -c / b; }
  else { const disc = b * b - 4 * a * c; if (disc >= 0){ const q = Math.sqrt(disc), t1 = (-b - q) / (2 * a), t2 = (-b + q) / (2 * a); t = [t1, t2].filter(v => v > 0).sort((m, n) => m - n)[0]; } }
  if (t == null || t > 2.2) t = Math.min(2.2, Math.sqrt(c) / sp);
  // close the last few yards straight at him
  if (Math.sqrt(c) < 22) t = Math.min(t, .12);
  return [h.p[0] + vx * t, clamp(h.p[1] + vy * t, -272, 272)];
}
function aiDefense(x){
  const h = S.holder, B = S.ball;
  // the ball's out and it's live: everybody runs to it
  if (S.chase >= 0 && S.t >= S.chase && h && h.team === 'o' && h === S.carrier){
    if (S.t - S.chase >= x.react) return pursueAI(x);
    // still reading it: keep going the way he was
    if (x.want && (x.role !== 'zone' || S.caught)){ return; }
  }
  if (h && h.team === 'd'){ return x === h ? carrierAI(x) : dblkAI(x); }
  // ball in the air: break on it once he sees it
  if (B.st === 'air' && B.kind === 'pass' && x.ballSeen != null && S.t >= x.ballSeen && !x.eng){
    const left = Math.max(.01, B.Tf - S.t), dd = dist(x.p, B.to);
    if (dd / x.vmax < left + .35 || (x.role === 'man' && x.man === B.tgt)){ seek(x, dd / x.vmax < left + .35 ? B.to : x.man.p, 1); return; }
    seek(x, B.to, .85); return;
  }
  switch (x.role){
    case 'rush': return rushAI(x);
    case 'man': return manAI(x);
    case 'zone': return zoneAI(x);
  }
}
function rushAI(x){
  const g = S.holder || S.QB;
  if (S.run && S.t > x.react + .3 && S.handoff >= 0 && S.holder !== S.QB){ return pursueAI(x); }
  // edge rushers come around the corner, inside men go straight at him
  const dv = x.p[1] - g.p[1], dd = dist(x.p, g.p);
  if (Math.abs(dv) > 34 && dd > 30 && (x.i === 0 || x.i === 3 || x.pos === 'LB')) seek(x, [g.p[0] + 4, g.p[1] + Math.sign(dv) * 26], 1);
  else seek(x, [g.p[0] + g.vel[0] * .2, g.p[1] + g.vel[1] * .2], 1);
}
function manAI(x){
  const r = x.man;
  if (r.role !== 'route' && r.role !== 'dblk'){
    // his man stayed in to block: a linebacker comes after the QB, a DB plays the middle
    if (x.pos === 'LB'){ x.role = 'rush'; S.rushers.push(x); return rushAI(x); }
    x.role = 'zone'; x.zone = ZN.hookM; return zoneAI(x);
  }
  if (S.t < .05){ x.want = [0, 0]; return; }
  // he reacts to the route a beat late: how late depends on coverage skill against route running
  const lag = clamp((.13 + (r.rte - x.cov) * .25) * S.lagMul, .04, .45);
  const hp = histAt(r, lag);
  const deep = r.p[0] > 60;
  const off = [x.pos === 'LB' ? -6 : deep ? 7 : 2, -(Math.sign(hp[1]) || 1) * (x.pos === 'LB' ? 2 : 4)];
  const tgt = [hp[0] + off[0] + r.vel[0] * lag * .3, hp[1] + off[1] + r.vel[1] * lag * .3];
  seek(x, tgt, dist(x.p, tgt) > 18 ? 1 : .95);
}
function histAt(r, lag){ const H0 = r.hist, n = Math.round(lag / DT); return H0.length > n ? H0[H0.length - 1 - n] : (H0[0] || r.p); }
function zoneAI(x){
  const z = x.zone;
  const lm = [Math.min(z[0], S.goalU + 75), z[1]];
  if (S.run && x.pos === 'LB' && !(S.oK === 'draw' && S.handoff < 0)){
    // run fit: read it, then fill toward the ball
    if (S.t < x.react + .15){ x.want = [0, 0]; return; }
    const h = S.holder, bv = h ? h.p[1] : (S.hole ? S.hole[1] : 0);
    // fill the gap at the second level and let the runner come to you
    const depth = h && h.p[0] > -6 ? Math.max(4, h.p[0] + 6) : 30;
    seek(x, [Math.max(depth, Math.min(x.p[0], depth + 14)), lerp(x.p[1], bv, .6)], .75); return;
  }
  if (S.QB.fake && !S.QB.faked2 && S.t < .55 && x.pos === 'LB' && S.dK !== 'prev'){ seek(x, [Math.max(10, x.p[0] - 12), x.p[1]], .6); return; }   // play action: the linebackers bite
  // threats: route runners in or headed into his area
  let r = null, rv = -1e9;
  for (const p of S.O){
    if (p.role !== 'route') continue;
    const dlat = Math.abs(p.p[1] - lm[1]), ddep = p.p[0] - lm[0];
    if (dlat > z[2] * 1.15) continue;
    if (z[3]){ if (p.p[0] < 50) continue; const v = p.p[0]; if (v > rv){ rv = v; r = p; } }
    else { if (Math.abs(ddep) > z[2] * 1.2) continue; const v = -hyp(p.p[0] - lm[0], dlat); if (v > rv){ rv = v; r = p; } }
  }
  let tgt;
  // deep: stay deeper than the deepest man in your area and shade toward him
  if (z[3]) tgt = r ? [Math.max(lm[0] - 60, r.p[0] + 22), lerp(lm[1], r.p[1], .75)] : lm;
  // underneath: get in his throwing lane, but hold your depth and your area until the ball is out
  else tgt = r ? [Math.max(lm[0] - 22, lerp(lm[0], r.p[0] + 8, .7)), clamp(lerp(lm[1], r.p[1], .88), lm[1] - 75, lm[1] + 75)] : lm;
  // eyes on the QB: if he takes off, come up
  if (S.scramble) tgt = S.QB.p;
  seek(x, tgt, S.t < .5 ? .75 : 1);
}

/* ---------------- moves and tackling ---------------- */
const MOVES = {
  jukeL:{ win:.32, cd:.75, slow:.9, lat:-1 }, jukeR:{ win:.32, cd:.75, slow:.9, lat:1 },
  spin:{ win:.42, cd:.9, slow:.72 }, stiff:{ win:.5, cd:.8, slow:.94 }, dive:{ win:.3, cd:9, slow:1 }
};
function doMove(p, m){
  const M = MOVES[m]; if (!M || S.t < p.moveCD || p.down > 0) return false;
  p.move = { m, t0:S.t }; p.moveCD = S.t + M.cd;
  const sp = hyp(p.vel[0], p.vel[1]);
  if (M.lat){
    // cut hard to the side: momentum mostly carries forward, plus a big lateral burst
    const f = sp > 5 ? nrm(p.vel[0], p.vel[1]) : [p.team === 'o' ? 1 : -1, 0];
    const side = [-f[1] * M.lat, f[0] * M.lat];
    const lat = p.vmax * (.55 + .35 * p.agi);
    p.vel = [f[0] * sp * .62 + side[0] * lat, f[1] * sp * .62 + side[1] * lat];
    p.want = [p.vel[0], p.vel[1]];
  } else { p.vel = [p.vel[0] * M.slow, p.vel[1] * M.slow]; }
  if (m === 'dive'){ const f = sp > 5 ? nrm(p.vel[0], p.vel[1]) : [p.team === 'o' ? 1 : -1, 0]; p.vel = [f[0] * 120, f[1] * 120]; p.diving = S.t; }
  return true;
}
// how much a move he's in the middle of helps against this tackler
function moveEff(c, q){
  const m = c.move; if (!m) return 0;
  const M = MOVES[m.m], age = S.t - m.t0; if (age > M.win) return 0;
  const to = nrm(q.p[0] - c.p[0], q.p[1] - c.p[1]), f = nrm(c.vel[0], c.vel[1]), front = to[0] * f[0] + to[1] * f[1];
  if (m.m === 'jukeL' || m.m === 'jukeR'){
    // a juke works on the man in front of you, and best when you start it just before he gets there
    const d0 = m.d0 == null ? 99 : m.d0;
    const tq = d0 >= 12 && d0 <= 22 ? 1 : d0 >= 8 && d0 <= 30 ? .5 : .15;
    return front > -.2 ? (.12 + (.34 + .3 * c.agi) * tq) : .04;
  }
  if (m.m === 'spin') return .2 + .3 * c.agi;
  if (m.m === 'stiff') return front > -.3 ? clamp(.25 + (c.str - q.str) * .9 + (q.pos === 'CB' || q.pos === 'S' ? .12 : 0), .08, .62) : .05;
  return 0;
}
function tackleTry(q, c, kind){
  q.tried = S.t;
  const help = (c.team === 'o' ? S.D : S.O).some(o => o !== q && o.down <= 0 && !o.eng && dist(o.p, c.p) < 16);
  const to = nrm(c.p[0] - q.p[0], c.p[1] - q.p[1]), f = nrm(c.vel[0], c.vel[1]), behind = to[0] * f[0] + to[1] * f[1];
  let p = q.tkl - (c.brk - .45) * .35 + (behind > .5 ? .06 : 0) + (help ? .2 : 0) + (q.team === 'd' ? S.tackleAdj : 0);
  const sp = hyp(c.vel[0], c.vel[1]); if (sp > c.vmax * .8) p -= .04;
  if (kind === 'arm') p *= .24; if (kind === 'dive') p += .06; if (kind === 'hit') p -= .07; if (kind === 'lunge') p *= 1 - (q.diveR || 0) * .3;
  const me = moveEff(c, q); p *= 1 - me;
  if (c === S.QB && !S.run && !S.thrown && !S.scramble) p += .1;   // a QB in the pocket goes down easy
  p = clamp(p, .04, .97);
  if (S.caught && S.fa == null) S.fa = (c.p[0] - S.caught.u) / 10;
  if (S.caught && kind !== 'arm' && p > 0) S.missYds = S.missYds || 0;
  S.tA = (S.tA || 0) + 1; S.tP = (S.tP || 0) + p; (S.tK = S.tK || {})[kind] = ((S.tK || {})[kind] || 0) + 1;
  if (S.dbg) S.dbg.push(`${S.t.toFixed(2)} ${q.team}${q.i}${q.pos} tries ${c.team}${c.i} ${kind} p=${p.toFixed(2)} at ${c.p.map(Math.round)}`);
  if (rnd() < p){
    // down he goes, falling forward
    const fwd = c.team === 'o' ? 1 : -1;
    c.p[0] += fwd * clamp(sp / 18, 1, 5);
    c.down = 1; q.down = .7;
    let fum = .005 + (kind === 'hit' ? .1 : 0) + (help ? .006 : 0);
    if (c === S.QB && !S.thrown && !S.run) fum += behind > .3 ? .05 : .02;
    if (c.diving) fum = 0;
    if (rnd() < fum){ fumble(c, q); return true; }
    if (kind === 'hit') callout('BIG HIT!', q.team === S.userSide ? 'g' : 'b');
    S.tackler = q;
    endPlay('tackle');
    return true;
  }
  // missed him
  q.stun = kind === 'dive' || kind === 'hit' || kind === 'lunge' ? 0 : .55 + rnd() * .3; if (kind === 'dive' || kind === 'hit' || kind === 'lunge') q.down = .9;
  if (dist(q.p, c.p) < 12 || me > 0){ S.broken++; c.vel = [c.vel[0] * .8, c.vel[1] * .8];
    if (me > .3) callout(c.move.m === 'spin' ? 'SPIN MOVE!' : c.move.m === 'stiff' ? 'STIFF ARM!' : 'JUKE!', c.team === S.userSide ? 'g' : 'b');
    else if (c.team === S.userSide || q.team === S.userSide) callout('BROKEN TACKLE!', c.team === S.userSide ? 'g' : 'b'); }
  return false;
}
function fumble(c, q){
  callout('FUMBLE!', q.team === S.userSide ? 'g' : 'b');
  S.fumbleBy = c; S.holder = null;
  const n = nrm(c.vel[0], c.vel[1]);
  S.ball = { st:'loose', from:c.p.slice(), to:[c.p[0] + n[0] * 12 + (rnd() - .5) * 26, clamp(c.p[1] + n[1] * 12 + (rnd() - .5) * 26, -270, 270)], T0:S.t, last:c.team, p:c.p.slice(), z:6 };
}
function contacts(){
  const c = S.holder; if (!c || S.end) return;
  const them = c.team === 'o' ? S.D : S.O;
  // remember how close the nearest man was when a move started (that's what decides a juke)
  if (c.move && c.move.d0 == null){ let m = 1e9; for (const q of them) if (q.down <= 0 && !q.eng) m = Math.min(m, dist(q.p, c.p)); c.move.d0 = m; }
  for (const q of them){
    if (q.down > 0 || q.stun > 0 || S.t - q.tried < .45) continue;
    const dd = dist(q.p, c.p);
    // a man still locked up can only reach out if he's holding his ground (not being driven off the ball)
    if (q.eng){ const bk = q.eng; if (dd < 7 && !(bk && bk.res === 'w') && tackleTry(q, c, 'arm')) return; continue; }
    if (c === S.QB && !S.thrown && S.t < .25) continue;
    if (dd < 11.5){ if (tackleTry(q, c, 'norm')) return; }
    else if (dd < 15 && q.role !== 'rush' || dd < 15 && (S.thrown || S.run || S.scramble)){
      // closing burst, then leave his feet if he has to
      q.burst = S.t + .4;
      // only leave his feet if the runner is getting away from him
      const u = nrm(c.p[0] - q.p[0], c.p[1] - q.p[1]), closing = (q.vel[0] - c.vel[0]) * u[0] + (q.vel[1] - c.vel[1]) * u[1];
      if (closing < 8){ q.diveR = (dd - 11.5) / 3.5; if (tackleTry(q, c, 'lunge')) return; }
    }
  }
}

/* ---------------- you ---------------- */
function setCtl(p){
  S.ctl = p; S.userMoved = false; S.ctlT = S.t;
}
function context(){
  if (!S || !S.userSide || S.end) return 'none';
  if (S.phase === 'pre') return S.userSide === 'o' ? 'pre' : 'def';
  const c = S.ctl;
  if (!c) return 'none';
  if (S.userSide === 'd' && c.team === 'd' && S.holder !== c) return 'def';
  if (c === S.QB && S.holder === c && !S.run && !S.thrown && !S.scramble) return 'qb';
  if (S.holder === c) return 'car';
  return 'none';
}
function userTick(){
  const c = S.ctl; if (!c || S.end) return;
  const ctx = context();
  const st = stick();
  if (st[2] > 0){ S.userMoved = true; S.lastIn = S.t; }
  // on defense the CPU keeps playing your man until you touch the stick, and takes him back if you let go a while
  if (ctx === 'def' && S.userMoved && S.t - (S.lastIn || 0) > 1.1) S.userMoved = false;
  if (S.userMoved && (ctx === 'qb' || ctx === 'car' || ctx === 'def' || (S.run && c === S.QB))){
    const spr = IN.held.has('spr') || (IN.tstick && hyp(IN.tstick[0], IN.tstick[1]) > .92) || ctx === 'def';
    c.sprint = spr;
    const sp = topSpeed(c) * (spr ? 1 : .86) * st[2];
    if (!(c.move && S.t - c.move.t0 < .22)) c.want = [st[0] * sp, st[1] * sp];
  }
  if (ctx === 'qb') qbInput(c, st);
  else if (ctx === 'car'){
    const f = hyp(c.vel[0], c.vel[1]) > 5 ? nrm(c.vel[0], c.vel[1]) : [c.team === 'o' ? 1 : -1, 0];
    // jukes are left/right of where he's running; on screen that's what you'd expect from behind him
    if (IN.hit.has('q')) doMove(c, 'jukeL');
    if (IN.hit.has('e')) doMove(c, 'jukeR');
    if (IN.hit.has('act')) doMove(c, 'spin');
    if (IN.hit.has('f')) doMove(c, 'stiff');
    if (IN.hit.has('z')){ if (doMove(c, 'dive')){ S.slideAt = S.t + (c === S.QB ? .15 : .32); } }
    void f;
  } else if (ctx === 'def'){
    if (IN.hit.has('sw') || (IN.hit.has('q'))) switchMan();
    const h = S.holder, B = S.ball;
    if (IN.hit.has('act') && h && h.team !== c.team){
      const dd = dist(c.p, h.p);
      if (dd < 24 && S.t - c.tried > .3){ c.p[0] += (h.p[0] - c.p[0]) * .55; c.p[1] += (h.p[1] - c.p[1]) * .55; tackleTry(c, h, 'dive'); }
      else if (dd < 60){ c.vel = [c.vel[0] * 1.2, c.vel[1] * 1.2]; c.down = .8; callout('WHIFF', 'b'); }
    }
    if (IN.hit.has('e') && h && h.team !== c.team){ const dd = dist(c.p, h.p); if (dd < 17 && S.t - c.tried > .3) tackleTry(c, h, 'hit'); }
    if (IN.hit.has('x') && B.st === 'air'){ c.jump = S.t; if (B.kind === 'pass' && dist(c.p, B.to) < 30) c.ballSeen = Math.min(c.ballSeen || 9, S.t); }
    if (IN.hit.has('f') && c.eng){ if (S.t > (c.shedTry || 0)){ c.shedTry = S.t + .9; if (rnd() < .38 + (c.str - .5) * .5){ unlock(c, true); callout('SHED!', 'g'); } } }
  }
}
function qbInput(q, st){
  // a tap on a receiver (mouse or touch) throws him a lob
  if (H.THROW.req != null){ const j = H.THROW.req; H.THROW.req = null; const r = S.O[j]; if (r && r.role === 'route') return userThrow(q, r, 'LOB', st); }
  if (IN.hit.has('x')){ throwAway(q); callout('THROWN AWAY'); return; }
  if (!S.hold){
    for (let n = 1; n <= 5; n++) if (IN.hit.has('t' + n)){ const r = S.O[S.ids[n - 1]]; if (r && r.role === 'route'){ S.hold = { n, r, t0:S.t }; } break; }
  }
  if (S.hold){
    const hd = S.t - S.hold.t0;
    if (IN.up.has('t' + S.hold.n) || !IN.held.has('t' + S.hold.n)){
      const r = S.hold.r, pw = meterVal(hd);
      S.hold = null; ui().meter.hidden = true;
      if (hd < .14) return userThrow(q, r, 'LOB', st);
      return userThrow(q, r, 'BULLET', st, pw);
    }
  }
}
const meterVal = hd => clamp((hd - .14) / .8, 0, 1.08);
function idealOf(q, r){
  const speed = 300 + (q.qa - .6) * 60;
  let tau = .3; for (let k = 0; k < 4; k++){ const f = future(r, tau); tau = .06 + dist(q.p, f) / speed; }
  const L = future(r, tau), D = dist(q.p, L);
  const pr = pressure();
  return { c:clamp(.42 + D / 560 * .5, .42, .93), hw:clamp(.045 + q.qa * .055 - (pr < 25 ? .02 : 0), .03, .11), L, tau, speed, D };
}
function userThrow(q, r, type, st, pw){
  const id = idealOf(q, r);
  const lob = type === 'LOB';
  const speed = lob ? 205 + (q.qa - .6) * 30 : id.speed;
  let tau = .3; for (let k = 0; k < 4; k++){ const f = future(r, tau); tau = .06 + dist(q.p, f) / speed; }
  let L = future(r, tau);
  let grade = lob ? 'LOB' : 'GOOD', errMul = lob ? 1 : .85, distF = 1;
  if (!lob){
    const diff = pw - id.c;
    if (Math.abs(diff) <= id.hw){ grade = 'PERFECT'; errMul = .3; }
    else if (Math.abs(diff) <= id.hw * 2.3){ grade = 'GOOD'; errMul = .75; distF = 1 + diff * .45; }
    else if (diff < 0){ grade = 'SHORT'; errMul = 1.25; distF = 1 + diff * 1.05; }
    else { grade = 'OVERTHROWN'; errMul = 1.25; distF = 1 + diff * .95; }
  }
  // anticipation: let it go before he breaks and it gets there right as he comes out of it
  const R0 = r.route;
  if (R0 && R0.brk >= 0 && R0.idx <= R0.brk){ const tb = dist(r.p, R0.pts[0]) / Math.max(30, hyp(r.vel[0], r.vel[1]) || r.vmax * .8); if (tb < tau + .1){ errMul *= .65; callout(grade === 'PERFECT' ? 'PERFECT · ON TIME' : 'ON TIME', 'g'); } else callout(grade, grade === 'PERFECT' ? 'g' : grade === 'GOOD' || grade === 'LOB' ? '' : 'b'); }
  else callout(grade, grade === 'PERFECT' ? 'g' : grade === 'GOOD' || grade === 'LOB' ? '' : 'b');
  // placement: the stick moves the ball (lead him upfield, to the sideline, back to you)
  if (st[2] > 0){ L = [L[0] + st[0] * 24, L[1] + st[1] * 24]; }
  const Q = q.p;
  L = [Q[0] + (L[0] - Q[0]) * distF, Q[1] + (L[1] - Q[1]) * distF];
  const D = dist(Q, L), pr = pressure(), moving = hyp(q.vel[0], q.vel[1]) > 35;
  const sd = (2.5 + (1 - q.qa) * 10) * errMul * (1 + D / 450) * (pr < 15 ? 2 : pr < 30 ? 1.4 : 1) * (moving ? 1.3 : 1);
  L = [L[0] + gauss() * sd, L[1] + gauss() * sd * .8];
  releaseBall(q, r, L, speed, lob, grade);
  S.grade = grade;
}
function switchMan(){
  const B = S.ball, at = B.st === 'air' ? B.to : B.p;
  const c = S.D.filter(x => x !== S.ctl && x.down <= 0).sort((a, b) => dist(a.p, at) - dist(b.p, at))[0];
  if (c){ setCtl(c); c.want = c.vel.slice(); }
}

/* ---------------- running the clock on a play ---------------- */
function snap(){
  S.phase = 'live'; S.snapT = S.t; S.t = 0;
  assign();
  const Q = S.QB, gun = S.R.fm === 'gun';
  S.ball = { st:'snap', from:[-8, 0], T0:0, Tf:gun ? .28 : .1, p:[-8, 0], z:4 };
  if (S.R.oK === 'sneak'){ S.ball.Tf = .08; }
  if (S.userSide === 'o') setCtl(S.run && S.R.oK !== 'sneak' ? null : Q);
  if (S.userSide === 'd' && !S.ctl) setCtl(S.D[5]);
  for (const p of S.all) p.hist = [p.p.slice()];
  if (!S.run && S.userSide === 'o'){ H.THROW.ids = S.ids.slice(); H.THROW.req = null; H.THROW.on = true; H.THROW.ver++; }
}
function step(){
  if (S.phase === 'pre'){ preTick(); clearEdges(); return; }
  S.t += DT;
  if (S.end){ S.deadT += DT; for (const p of S.all){ if (!p.eng){ p.want = [p.vel[0] * .8, p.vel[1] * .8]; } integrate(p); } ballStep(); if (S.deadT > (S.end === 'td' || S.end === 'pick6' ? 1.25 : .85)) S.done = true; clearEdges(); return; }
  if (S.userSide) userTick();
  // the exchange: handoff, pitch, sneak
  if (S.run && S.handoff < 0 && S.holder === S.QB){
    const Q = S.QB, RB = S.RB, k = S.oK;
    if (k === 'sneak'){ S.handoff = S.t; S.carrier = Q; S.chase = S.t + .1; Q.role = 'car'; }
    else if (k === 'sweep' && S.t > .28){ const to = future({ p:RB.p, vel:RB.vel, vmax:RB.vmax, route:{ pts:RB.path.slice(RB.pi), idx:0 } }, .38); throwBall(Q, to, 150, 9, 'pitch', RB); S.handoff = S.t; }
    else if ((dist(Q.p, RB.p) < 16 || RB.p[0] > Q.p[0] + 4) && S.t > (S.oK === 'draw' ? .6 : .3)){ holdBy(RB); S.carrier = RB; S.handoff = S.t; S.chase = S.t; }
  }
  if (S.run && S.handoff >= 0 && S.carrier && S.userSide === 'o' && S.ctl !== S.carrier && S.holder === S.carrier) setCtl(S.carrier);
  // QB takes off past the line: no throwing now
  if (!S.run && S.holder === S.QB && !S.thrown && S.QB.p[0] > 2 && !S.scramble){ S.scramble = true; S.carrier = S.QB; S.chase = S.t; S.hold = null; if (!S.headless) ui().meter.hidden = true; H.THROW.on = false; H.THROW.ver++; }
  for (const p of S.O){
    if (S.ctl === p && S.userMoved) continue;
    if (p === S.holder && (p !== S.QB || S.scramble || S.carrier === S.QB)){ carrierAI(p); continue; }
    aiOffense(p);
  }
  for (const x of S.D){ if (S.ctl === x && S.userMoved) continue; aiDefense(x); }
  blocks();
  for (const p of S.all) integrate(p);
  separate();
  for (const p of S.all){ p.hist.push(p.p.slice()); if (p.hist.length > 50) p.hist.shift(); }
  ballStep();
  if (!S.end) contacts();
  if (!S.end) checkDead();
  clearEdges();
}
function preTick(){
  S.t += DT;
  if (S.userSide === 'o'){
    if (IN.hit.has('act') || (S.autoSnap && S.t > .3)) return snap();
    if (S.t > 25) return snap();   // the play clock runs out on you: the ball's snapped anyway
  } else {
    if (S.userSide === 'd' && (IN.hit.has('sw') || IN.hit.has('q'))){
      const order = [5, 4, 6, 9, 10, 7, 8, 0, 1, 2, 3], cur = S.ctl ? order.indexOf(S.ctl.i) : -1;
      setCtl(S.D[order[(cur + 1) % order.length]]);
    }
    if (S.t > S.cpuSnap) return snap();
  }
}
function clearEdges(){ IN.hit.clear(); IN.up.clear(); }
function checkDead(){
  const h = S.holder;
  if (h){
    if (Math.abs(h.p[1]) > SL){ return endPlay('oob'); }
    if (h.team === 'o' && h.p[0] >= S.goalU) return endPlay('td');
    if (h.team === 'd' && h.p[0] <= S.ownU) return endPlay('pick6');
    if (S.slideAt && S.t >= S.slideAt){ h.down = 1; return endPlay('tackle'); }
    if (h.team === 'd' && h.p[0] > S.goalU + 100){ S.tb = true; return endPlay('int'); }
  }
  if (S.t > 22) endPlay(h ? 'tackle' : 'inc');
}
function endPlay(how){
  if (S.end) return;
  S.end = how; S.deadT = 0; S.endT = S.t;
  if (how === 'tackle' && S.holder && S.holder.team === 'd') S.end = 'int';
  if (how === 'oob' && S.holder && S.holder.team === 'd') S.end = 'int';
  S.endSpot = S.holder ? S.holder.p.slice() : S.ball.p.slice();
  H.THROW.on = false; H.THROW.ver++;
  if (!S.headless){ const u = ui(); u.meter.hidden = true; }
}

/* ---------------- what happened ---------------- */
function result(){
  const R = S.R, y0 = S.y0, out = { liveSecs:S.endT || S.t, broken:S.broken, read:0, manual:true, safety:false, td:false, oob:false, pick6:false, tb:false, ret:0, yac:0 };
  const yd = u => Math.round(u / 10);
  const e = S.end, h = S.holder, sp = S.endSpot || [0, 0];
  const tgt = S.target;
  if (tgt){ out.tgt = tgt.name || H.posName(tgt.i); out.tIdx = tgt.i; out.tPos = tgt.pos === 'FB' ? 'RB' : tgt.pos; out.route = tgt.route && tgt.route.type; }
  if (S.caught){ out.air = yd(S.caught.u); }
  else if (S.thrown && S.ball.to) out.air = yd(S.ball.to[0]);
  if (e === 'int' || e === 'pick6'){
    out.kind = 'int';
    const cu = S.intAt ? S.intAt.u : sp[0];
    out.air = yd(Math.min(cu, S.goalU + 9));
    if (S.tb || cu >= S.goalU){ out.tb = true; out.ret = 0; }
    else { out.ret = Math.max(0, yd(cu - sp[0])); if (e === 'pick6'){ out.pick6 = true; out.ret = out.air + (100 - y0); } }
    if (!out.tb && sp[0] >= S.goalU){ out.tb = true; out.ret = 0; }
    return out;
  }
  if (e === 'inc'){ out.kind = 'inc'; out.yards = 0; out.why = S.incWhy || (S.awayT ? 'away' : '?'); if (S.awayT) out.away = true; return out; }
  if (e === 'fum' || e === 'ownrec'){
    const fb = S.fumbleBy;
    const pre = fb === S.QB && !S.thrown && !S.run && !S.scramble;
    const rs = S.recover ? S.recover.p : sp;
    out.yards = clamp(yd(rs[0]), -(100 - y0) + 1, y0 - 1);
    out.carrier = fb ? (fb.name || H.posName(fb.i)) : R.carrier;
    if (e === 'fum'){ out.kind = 'fum'; if (pre){ out.sackFum = true; } if (S.caught) out.yac = Math.max(0, out.yards - out.air); return out; }
    // the offense fell on it
    if (pre){ out.kind = 'sack'; return out; }
    if (S.caught){ out.kind = 'cmp'; out.yac = Math.max(0, out.yards - (out.air || 0)); return out; }
    out.kind = 'run'; if (S.scramble || fb === S.QB){ out.carrier = R.qb; out.cIdx = 6; out.scramble = !S.run; } else out.cIdx = 7;
    return out;
  }
  // tackled, out of bounds, touchdown
  let u = sp[0];
  out.yards = yd(u);
  out.oob = e === 'oob';
  if (e === 'td' || u >= S.goalU){ out.td = true; out.yards = y0; }
  else if (u <= S.ownU){ out.safety = true; out.yards = -(100 - y0); }
  if (S.caught){ out.kind = 'cmp'; out.yac = Math.max(0, out.yards - Math.min(out.air || 0, y0)); return out; }
  if (!S.run && !S.scramble && h === S.QB){ out.kind = 'sack'; return out; }
  out.kind = 'run';
  if (h === S.QB){ out.carrier = R.qb; out.cIdx = 6; if (!S.run) out.scramble = true; }
  else { out.carrier = (h && h.name) || R.carrier; out.cIdx = h ? h.i : 7; }
  return out;
}

/* ---------------- drawing ---------------- */
function render(){
  const off = S.off, def = S.def, d = S.d, X0 = S.X0;
  const W = (u, v, z) => [X0 + d * u, v * d, z || 0];
  const EO = H.EL[off], ED = H.EL[def];
  const hop = S.end === 'td' || S.end === 'pick6' ? Math.abs(Math.sin(S.deadT * 7)) * 10 : 0;
  S.O.forEach((p, i) => { const w = W(p.p[0], p.p[1], p === S.holder ? hop : 0); H.put(EO[i], w[0], w[1], p.down > 0 ? -2 : w[2]); EO[i].style.setProperty('--op', p.down > 0 ? .7 : 1); });
  S.D.forEach((x, j) => { const w = W(x.p[0], x.p[1], x === S.holder ? hop : 0); H.put(ED[j], w[0], w[1], x.down > 0 ? -2 : w[2]); ED[j].style.setProperty('--op', x.down > 0 ? .7 : 1); });
  const B = S.ball, wb = W(B.p[0], B.p[1], (B.z || 0) + (S.holder ? hop : 0));
  H.put(H.EL.ball, wb[0], wb[1], wb[2]);
  const u = ui();
  // your man
  if (S.ctl && !S.end){ const w = W(S.ctl.p[0], S.ctl.p[1]); u.ring.style.display = ''; H.put(u.ring, w[0], w[1], 0); u.ring.classList.toggle('d', S.ctl.team === 'd'); }
  else u.ring.style.display = 'none';
  // where the ball is coming down
  if (B.st === 'air' && B.kind === 'pass' && !B.resolved){ const w = W(B.to[0], B.to[1]); u.tgt.style.display = ''; H.put(u.tgt, w[0], w[1], 0); }
  else u.tgt.style.display = 'none';
  // the throw meter
  if (S.hold && S.holder === S.QB){
    const hd = S.t - S.hold.t0, id = idealOf(S.QB, S.hold.r);
    u.meter.hidden = hd < .1;
    const m = meterVal(hd) / 1.08;
    u.fill.style.transform = `scaleX(${m.toFixed(3)})`;
    u.band.style.left = ((id.c - id.hw) / 1.08 * 100).toFixed(1) + '%'; u.band.style.width = (id.hw * 2 / 1.08 * 100).toFixed(1) + '%';
    u.needle.style.left = (m * 100).toFixed(1) + '%';
    u.mlbl.textContent = `${S.hold.n} · ${(S.hold.r.name ? H.last(S.hold.r.name) : H.posName(S.hold.r.i)).toUpperCase()}`;
  }
  // the camera follows the ball
  const fx = W(B.st === 'air' ? lerp(B.p[0], B.to[0], .35) : B.p[0], 0)[0];
  H.camGame(fx, d);
  // prompts and the controls strip
  const ctx = context();
  if (S.phase === 'pre'){
    u.prompt.hidden = false;
    u.prompt.innerHTML = S.userSide === 'o' ? `<b>${isTouch() ? 'TAP SNAP' : IN.pad ? 'PRESS A' : 'PRESS SPACE'}</b> TO SNAP THE BALL` : `<b>DEFENSE</b> · ${isTouch() ? 'TAP SWITCH' : IN.pad ? 'A' : 'TAB'} TO PICK YOUR MAN`;
  } else u.prompt.hidden = true;
  showControls(ctx);
}

/* ---------------- one snap ---------------- */
function play(R, opt = {}){
  S = build(R, opt);
  if (opt.trace) S.dbg = [];
  S.cpuSnap = 1.3 + rnd() * .5; S.autoSnap = !!opt.autoSnap;
  if (opt.headless || !S.userSide){ if (!opt.headless) S.cpuSnap = .35; }
  if (opt.headless){
    S.phase = 'pre'; snap();
    let n = 0; const tr = opt.trace ? [] : null;
    while (!S.done && n < 60 * 30){ step(); n++; if (tr && n % 6 === 0) tr.push({ t:+S.t.toFixed(2), O:S.O.map(p => [Math.round(p.p[0]), Math.round(p.p[1]), p.role, p.eng ? 1 : 0, p.down > 0 ? 1 : 0]), D:S.D.map(p => [Math.round(p.p[0]), Math.round(p.p[1]), p.role, p.eng ? 1 : 0, p.down > 0 ? 1 : 0]), b:[Math.round(S.ball.p[0]), Math.round(S.ball.p[1]), S.ball.st, Math.round(S.ball.z || 0)], h:S.holder ? (S.holder.team + S.holder.i) : '' }); }
    const r = result(); r.thrT = S.thrT; r.tA = S.tA || 0; r.fa = S.fa; r.tP = S.tP || 0; r.tK = S.tK || {}; if (tr){ r.trace = tr; r.goalU = S.goalU; r.end = S.end; r.dbg = S.dbg; } S = null; return Promise.resolve(r);
  }
  ui();
  lastCtx = '';
  IN.held.clear(); IN.hit.clear(); IN.up.clear(); IN.padPrev = {};
  addEventListener('keydown', onKey, true); addEventListener('keyup', onKey, true); addEventListener('blur', onBlur);
  if (S.userSide === 'd') setCtl(S.D[COV[S.dK] && COV[S.dK].rush.includes(5) ? 4 : 5]);
  return new Promise(res => {
    let acc = 0, last = performance.now();
    const epoch = S.epoch;
    const cleanup = () => {
      removeEventListener('keydown', onKey, true); removeEventListener('keyup', onKey, true); removeEventListener('blur', onBlur);
      const u = ui(); u.prompt.hidden = true; u.meter.hidden = true; u.hint.hidden = true; u.touch.hidden = true; u.ring.style.display = 'none'; u.tgt.style.display = 'none';
      IN.tstick = null; H.THROW.on = false; H.THROW.req = null; H.THROW.ver++;
      H.EL[H.G ? S.off : 'u'] && [...H.EL.u, ...H.EL.t].forEach(el => el.style.removeProperty('--op'));
    };
    function loop(now){
      if (!S || epoch !== H.epoch()){ if (S && S.epoch === epoch) { cleanup(); S = null; } return; }
      if (H.paused()){ last = now; requestAnimationFrame(loop); return; }
      pollPad();
      acc += Math.min(.1, Math.max(0, (now - last) / 1000)); last = now;
      while (acc >= DT && !S.done){ step(); acc -= DT; }
      render();
      if (S.done){ const r = result(); cleanup(); S = null; res(r); return; }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  });
}

/* ---------------- kicking meter: hold to power, let go, then stop the needle ---------------- */
function kickMeter(opt = {}){
  const u = ui();
  return new Promise(res => {
    let ph = 0, t0 = 0, pw = 0, acc = 0, holding = false, last = performance.now();
    const epoch = H.epoch();
    u.meter.hidden = false; u.meter.classList.add('kick'); u.prompt.hidden = false;
    u.prompt.innerHTML = `<b>${isTouch() ? 'HOLD KICK' : 'HOLD SPACE'}</b> FOR POWER, LET GO, THEN PRESS AGAIN TO AIM`;
    u.band.style.left = (clamp(opt.need || .7, .3, .98) * 100 - 1) + '%'; u.band.style.width = ((1.08 - clamp(opt.need || .7, .3, .98)) / 1.08 * 100) + '%';
    u.fill.style.transform = 'scaleX(0)'; u.needle.style.left = '0%'; u.mlbl.textContent = opt.label || 'KICK';
    u.touch.hidden = !isTouch(); u.btns.innerHTML = `<button type="button" class="lv-b big" data-b="act">KICK</button>`; u.stick.style.visibility = 'hidden';
    const down = () => { if (ph === 0 && !holding){ holding = true; ph = 1; t0 = performance.now(); } else if (ph === 2){ finish(); } };
    const up = () => { if (ph === 1){ pw = clamp((performance.now() - t0) / 1000 / .9, .05, 1.06); ph = 2; t0 = performance.now(); u.mlbl.textContent = 'AIM'; } holding = false; };
    const kd = e => { if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); e.stopPropagation(); if (!e.repeat) down(); } };
    const ku = e => { if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); e.stopPropagation(); up(); } };
    const pd = e => { const b = e.target.closest('[data-b]'); if (!b) return; e.preventDefault(); down(); };
    const pu = e => { const b = e.target.closest('[data-b]'); if (!b) return; up(); };
    addEventListener('keydown', kd, true); addEventListener('keyup', ku, true); u.btns.addEventListener('pointerdown', pd); u.btns.addEventListener('pointerup', pu);
    let padWas = false, aimV = 0;
    function finish(){
      ph = 3;
      removeEventListener('keydown', kd, true); removeEventListener('keyup', ku, true); u.btns.removeEventListener('pointerdown', pd); u.btns.removeEventListener('pointerup', pu);
      const a = aimV;
      setTimeout(() => { u.meter.hidden = true; u.meter.classList.remove('kick'); u.prompt.hidden = true; u.touch.hidden = true; u.stick.style.visibility = ''; res({ power:pw, aim:a }); }, 350);
    }
    function loop(now){
      if (epoch !== H.epoch()){ removeEventListener('keydown', kd, true); removeEventListener('keyup', ku, true); u.meter.hidden = true; u.prompt.hidden = true; u.touch.hidden = true; return; }
      if (ph === 3) return;
      if (!H.paused()){
        let gp = null; try { gp = [...(navigator.getGamepads ? navigator.getGamepads() : [])].find(g => g && g.connected); } catch(e){}
        const pb = !!(gp && gp.buttons[0] && gp.buttons[0].pressed); if (pb && !padWas) down(); if (!pb && padWas) up(); padWas = pb;
        if (ph === 1){ const m = clamp((now - t0) / 1000 / .9, 0, 1.06); u.fill.style.transform = `scaleX(${(m / 1.08).toFixed(3)})`; u.needle.style.left = (m / 1.08 * 100) + '%'; if (m >= 1.06) up(); }
        if (ph === 2){
          // the aim needle swings across; the middle is dead straight
          const k = (now - t0) / 1000;
          aimV = Math.sin(k * (opt.swing || 4.2)) * 1;
          u.needle.style.left = (50 + aimV * 48) + '%'; u.fill.style.transform = 'scaleX(0)';
          u.band.style.left = (50 - (opt.tol || .25) * 48) + '%'; u.band.style.width = ((opt.tol || .25) * 96) + '%';
          if (k > 4) finish();
        }
      } else t0 += now - last;
      last = now;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    void acc;
  });
}

return { play, kickMeter, get busy(){ return !!S; } };
};
})();
