// S02 · f52–135 · "60.S" ring with alarm clocks, two starburst flashes and a
// light sweep; the camera then pulls back hard (motion blur) while the ring
// becomes the "o" of "pour vous expliquer", whose words swing in one by one
// with a moving colour highlight (pour → vous → expliquer).
// Measurements: docs/ANALYSIS.md §S02 (ring width/centre, 60.S box, text ink
// box per frame, background tint #ACBEFC f60–f73).

import { el, css } from '../engine/dom.js';
import { track, sampled, tween, mixColor, clamp, progress } from '../engine/anim.js';
import { noise1 } from '../engine/random.js';
import { Background } from '../components/Background.js';
import { Ring } from '../components/Ring.js';
import { ExtrudedText } from '../components/Extruded.js';
import { AlarmClock } from '../components/AlarmClock.js';
import { Starburst } from '../components/Starburst.js';
import { TextLine } from '../components/TextLine.js';

const F = (n) => n / 60;
const NAVY = '#22364f', BLUE = '#4066db', BLUE_LIGHT = '#4c74e2';
const kk = (rows) => rows.map(([f, v]) => [F(f - 52), v]); // global frames -> local seconds

// Ring bbox width and centre (screen px), measured.
const RING = [[52, 1900, [960, 560]], [53, 1560, [966, 560]], [54, 1485, [967, 560]], [60, 1410, [960, 560]], [72, 1340, [935, 560]],
  [84, 1275, [907, 560]], [86, 1200, [900, 557]], [88, 1110, [870, 555]], [90, 1020, [825, 552]], [92, 840, [765, 547]],
  [94, 555, [652, 552]], [96, 375, [607, 560]], [98, 291, [550, 548]], [100, 216, [522, 546]]];
// Text ink box: left edge, centre y, scale (ink height / 118), measured f98-f134.
const TXT = [[96, 18, 654, 4.6], [98, 135, 624, 3.6], [100, 210, 607, 2.76], [102, 262, 600, 2.03], [104, 300, 586, 1.70], [106, 329, 576, 1.45],
  [108, 350, 571, 1.254], [110, 365, 564, 1.16], [112, 376, 558, 1.11], [114, 383, 551, 1.034], [116, 387, 547, 1.0], [118, 389, 544, 1.0],
  [120, 392, 544, 0.996], [124, 399, 544, 0.983], [128, 409, 544, 0.966], [132, 427, 544, 0.935], [134, 444, 544, 0.906], [136, 470, 544, 0.86]];

export default {
  mount(root) {
    this.bg = Background({ variant: 'light' });
    root.appendChild(this.bg.node);
    // flash layer (blue starburst fills the frame, then a white one restores it)
    this.burstBlue = Starburst({ size: 1000, spikes: 30, inner: 0.62, jitter: 0.42, seed: 11, fill: '#acbefc' });
    this.burstWhite = Starburst({ size: 1000, spikes: 34, inner: 0.6, jitter: 0.45, seed: 23, fill: '#f4f6fe' });
    this.burstSmall = Starburst({ size: 1000, spikes: 14, inner: 0.45, jitter: 0.3, seed: 5, fill: '#aebff7' });
    this.burstStar = Starburst({ size: 1000, spikes: 10, inner: 0.25, jitter: 0.25, seed: 9, fill: '#f7f9ff' });
    this.group = el('div', { style: { position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px', transformOrigin: '0 0' } });
    root.appendChild(this.group);
    this.group.append(this.burstBlue.node, this.burstWhite.node, this.burstSmall.node, this.burstStar.node);

    const view = el('div', { style: { position: 'absolute', inset: '0', perspective: '6000px', perspectiveOrigin: '960px 540px', transformStyle: 'preserve-3d' } });
    this.group.appendChild(view);
    this.ring = Ring({ diameter: 1000, band: 0.12, color: '#3f66e6', dark: '#4267dc', light: '#eef1fb' });
    this.ringWrap = el('div', { style: { position: 'absolute', left: '960px', top: '540px', transformStyle: 'preserve-3d' } }, [this.ring.node]);
    view.appendChild(this.ringWrap);

    this.sixtyWrap = el('div', { style: { position: 'absolute', left: '0', top: '0', perspective: '900px', transformStyle: 'preserve-3d' } });
    this.sixty = ExtrudedText({
      text: '60.S', size: 100, weight: 900, depth: 18, layers: 14, letterSpacing: '-0.02em',
      faceImage: 'linear-gradient(170deg, #6c9cf6 0%, #4a7cf0 45%, #3f6ee6 75%, #3a63da 100%)', side: '#3354b4', sideFar: '#24398a',
    });
    this.sixtyWrap.appendChild(this.sixty.node);
    this.group.appendChild(this.sixtyWrap);

    this.clocks = [
      { c: AlarmClock({ size: 150, hour: -40, minute: 100 }), at: [[54, 306, 420], [84, 315, 414]], rot: -12, blur: 0, phase: 0.1 },
      { c: AlarmClock({ size: 210, hour: -50, minute: 90 }), at: [[54, 1410, 300], [84, 1320, 309]], rot: -18, blur: 0.6, phase: 0.6 },
      { c: AlarmClock({ size: 380, hour: -30, minute: 120 }), at: [[54, 1650, 905], [84, 1635, 924]], rot: -14, blur: 7, phase: 0.3 },
      { c: AlarmClock({ size: 112, hour: -60, minute: 80 }), at: [[54, 741, 615], [84, 705, 609]], rot: -28, blur: 0.4, phase: 0.85 },
    ];
    for (const cl of this.clocks) this.group.appendChild(cl.c.node);

    // light sweep: thin bright diagonal streak with a soft glow
    this.sweep = el('div', { style: { position: 'absolute', left: '0', top: '-600px', width: '70px', height: '2400px', background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 35%, rgba(255,255,255,1) 48%, rgba(255,255,255,1) 52%, rgba(255,255,255,0.35) 65%, rgba(255,255,255,0) 100%)', mixBlendMode: 'screen', transformOrigin: '35px 1200px' } });
    this.group.appendChild(this.sweep);

    // "pour vous expliquer" (Inter Bold 119 px; ink box at rest: x 389–1537, centre y 544)
    this.textWrap = el('div', { style: { position: 'absolute', left: '0', top: '0', transformOrigin: '0 0', transformStyle: 'preserve-3d', perspective: '1400px', perspectiveOrigin: '960px 560px' } });
    this.line = TextLine({ tokens: ['p', 'o', 'ur', ' ', 'vous', ' ', 'expliquer'], size: 119, weight: 700, color: NAVY });
    this.textWrap.appendChild(this.line.node);
    root.appendChild(this.textWrap);
    const ink = this.line.inkBox;
    this.penX = 389 - ink.left;                    // pen position so that the ink box starts at x = 389
    this.baseY = 544 - (ink.top + ink.bottom) / 2; // baseline so that the ink box is centred on y = 544
    css(this.line.node, { transform: `translate(${this.penX}px, ${this.baseY}px)` });
    const [p, o, ur, vous, expl] = this.line.items;
    this.words = { p, o, ur, vous, expl };
    this.oCenter = [this.penX + o.cx, this.baseY + (o.ink.top + o.ink.bottom) / 2];
    this.oSize = o.ink.right - o.ink.left;
  },

  update(t) {
    const fr = t * 60 + 52; // global frame (float)
    // ---------- background flashes ----------
    const blueS = sampled(t, [[F(2.5), 0], [F(3), 0.35], [F(4), 1.3], [F(6), 2.2], [F(9), 4.5], [F(30), 5]]);
    this.burstBlue.set({ x: 960, y: 545, scale: blueS, rot: tween(t, F(2), F(25), -8, 6), opacity: fr < 82 ? 1 : 0 });
    const whiteS = sampled(t, [[F(14.5), 0], [F(15), 0.25], [F(18), 0.7], [F(20), 1.05], [F(24), 2.5], [F(28), 4.4], [F(30), 6]]);
    this.burstWhite.set({ x: 960, y: 545, scale: whiteS, rot: tween(t, F(14), F(30), 4, -10), opacity: fr < 82 ? 1 : 0 });
    // when the white burst has covered the frame both bursts are removed (f82): background is light again
    this.burstSmall.set({ x: 965, y: 548, scale: fr < 56 ? tween(t, F(0), F(3), 0.28, 0.42) : 0, rot: 10, opacity: fr < 56 ? 1 : 0 });
    const starS = sampled(t, [[F(15), 0], [F(16), 0.35], [F(18), 0.6], [F(20), 0.95], [F(23), 1.6]]);
    this.burstStar.set({ x: 965, y: 548, scale: starS, rot: 0, opacity: fr >= 67 && fr < 76 ? 1 : 0 });

    // ---------- light sweep (f55–f80) ----------
    const sx = tween(t, F(3), F(28), 420, 1560);
    css(this.sweep, { transform: `translate(${sx}px, 540px) rotate(-28deg)`, opacity: clamp(Math.min((fr - 55) / 3, (81 - fr) / 4)), display: fr > 54 && fr < 82 ? '' : 'none' });

    // ---------- group camera (pull back into the "o", f84–f101) ----------
    const ringRows = RING.map(([f, w, c]) => [F(f - 52), [w, c[0], c[1]]]);
    let [rw, rcx, rcy] = sampled(t, ringRows);
    // after f100 keep shrinking onto the final "o" of the text
    const textState = this.textState(t);
    if (fr > 100) {
      const p = progress(fr, 100, 103, 'easeOutQuad');
      const oPos = textState.oScreen;
      rw = rw + (textState.oScreenSize * 1.12 - rw) * p;
      rcx = rcx + (oPos[0] - rcx) * p; rcy = rcy + (oPos[1] - rcy) * p;
    }
    const gS = fr <= 84 ? 1 : rw / 1275;
    const anchor = fr <= 84 ? [rcx, rcy] : [907, 560];
    const gx = fr <= 84 ? 0 : rcx - anchor[0] * gS, gy = fr <= 84 ? 0 : rcy - anchor[1] * gS;
    css(this.group, { transform: `translate(${gx.toFixed(2)}px, ${gy.toFixed(2)}px) scale(${gS.toFixed(5)})`, opacity: fr < 103 ? 1 : 0, display: fr < 104 ? '' : 'none' });
    // ring inside the group: before f84 its own measured width/centre, afterwards fixed (group scales it)
    const rIn = fr <= 84 ? [rw, rcx, rcy] : [1275, 907, 560];
    const rz = -33, rx = 33;
    const rad = (d) => (d * Math.PI) / 180;
    const unitW = 1000 * Math.sqrt(Math.cos(rad(rz)) ** 2 + (Math.cos(rad(rx)) * Math.sin(rad(rz))) ** 2);
    this.ring.set({ x: rIn[1] - 960, y: rIn[2] - 540, scale: rIn[0] / unitW, rx, rz, spin: 30, opacity: clamp((102 - fr) / 2) });

    // "60.S": measured box (f53-f83): width 339 -> 368 (f71) -> 320 (f83)
    const sw = sampled(t, kk([[52, 330], [56, 344], [62, 354], [71, 368], [77, 356], [83, 320], [100, 320]]));
    const sc = sampled(t, kk([[52, [958, 546]], [62, [962, 552]], [71, [966, 550]], [80, [955, 545]], [84, [940, 540]]]));
    if (!this.sixtyBase) this.sixtyBase = this.sixty.front.offsetWidth || 230; // layout width, transform-independent
    css(this.sixtyWrap, { transform: `translate(${sc[0]}px, ${sc[1]}px) scale(${(sw / this.sixtyBase).toFixed(4)})` });
    this.sixty.set({ rx: -18, ry: 6 });

    // clocks: measured positions f54/f84, small "ringing" wobble
    for (const cl of this.clocks) {
      const [[f0, x0, y0], [f1, x1, y1]] = cl.at;
      const p = clamp((fr - f0) / (f1 - f0));
      const wob = 7 * noise1(17 + cl.phase * 10, t * 9 + cl.phase * 5);
      const enter = fr < 54 ? tween(fr, 52, 54, 1.8, 1) : 1;
      cl.c.set({ x: (x0 + (x1 - x0) * p - 960) * enter + 960, y: (y0 + (y1 - y0) * p - 540) * enter + 540, rot: cl.rot + wob, scale: enter, blur: cl.blur + (fr < 54 ? 6 : 0) });
    }

    // ---------- text ----------
    this.applyText(t, textState, fr);
  },

  /** Text container state: scale s and the screen position of the "o". */
  textState(t) {
    const rows = TXT.map(([f, L, cy, s]) => [F(f - 52), [L, cy, s]]);
    const [L, cy, s] = sampled(t, rows);
    // container transform maps the rest layout (ink-left 389, centre 544) to (L, cy) with scale s
    const tx = L - 389 * s, ty = cy - 544 * s;
    return { s, tx, ty, oScreen: [tx + this.oCenter[0] * s, ty + this.oCenter[1] * s], oScreenSize: this.oSize * s };
  },

  applyText(t, st, fr) {
    css(this.textWrap, { transform: `translate(${st.tx.toFixed(2)}px, ${st.ty.toFixed(2)}px) scale(${st.s.toFixed(5)})`, display: fr >= 95 ? '' : 'none' });
    const { p, o, ur, vous, expl } = this.words;
    // the whole line swings flat: right side recedes (rotateY) and dips (rotateZ) until ~f116
    const ry = track(fr / 60, [[96, 24], [100, 20, 'easeOutQuad'], [106, 13], [110, 7], [114, 2], [117, 0]]);
    const rz = track(fr / 60, [[96, 2.5], [104, 1.8], [110, 0.8], [116, 0]]);
    css(this.line.node, { transform: `translate(${this.penX}px, ${this.baseY}px) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg)`, transformOrigin: `${(389 - this.penX).toFixed(1)}px 0px` });
    // colour highlight travels pour -> vous -> expliquer (measured: vous blue f104-f112, expliquer blue from f114)
    const pourCol = mixColor(BLUE, NAVY, progress(fr, 99, 102));
    css(p.node, { color: pourCol }); css(ur.node, { color: pourCol });
    css(o.node, { color: mixColor('#9aa6bb', NAVY, progress(fr, 102, 106)), opacity: clamp((fr - 100.5) / 2) });
    const vousCol = fr < 103 ? NAVY : mixColor(BLUE_LIGHT, NAVY, progress(fr, 112, 114.5));
    css(vous.node, { color: fr < 102 ? NAVY : fr < 104 ? mixColor(NAVY, BLUE_LIGHT, progress(fr, 102, 104)) : vousCol });
    css(expl.node, { color: mixColor(NAVY, BLUE, progress(fr, 112, 114.5)) });
  },
};
