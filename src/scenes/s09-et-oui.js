// S09 · f940–1121 · Kinetic typography on the dark background.
//  f940–975  "Et" grows from 30 px to 95 px (Inter Bold), "oui…" scales in
//            next to it (f958–f972) and the gap closes.
//  f976      cut: an outline crown tumbles up, the prospect's avatar spins in
//            (f977–f988) and the sentence is built word by word under it.
//            New words appear in red, turn white when the next one comes.
//  f989–1000 camera zooms out (x1.65 -> x1.07), anchor = frame centre.
//  f1010     line 1 turns grey and the avatar background turns red at the
//            instant the crown hits the avatar; the crown bounces back.
//  f1036–1056 the crown slips off and falls down behind the text.
//  f1072     cut to "vous êtes / ce moustique" (grey line 1, white line 2).
// World layout (camera k = 1): avatar (970,474) r 62.5, Inter Bold 52 px,
// line baselines 613 / 672. Measured: docs/ANALYSIS.md §S09.

import { el, css } from '../engine/dom.js';
import { sampled, track, clamp, progress } from '../engine/anim.js';
import { Background } from '../components/Background.js';
import { TextLine } from '../components/TextLine.js';
import { Crown } from '../components/Crown.js';
import { content } from '../content/texts.fr.js';

const F = (n) => n / 60;
const G = (rows) => rows.map(([f, v]) => [F(f), v]); // global-frame samples
const WHITE = '#ffffff', RED = '#b8344b', GREY = '#8a8699';
// camera zoom (anchor = 960,540)
const CAM = G([[976, 1.646], [988, 1.646], [990, 1.55], [992, 1.27], [994, 1.2], [996, 1.152], [1000, 1.072], [1004, 1.056], [1008, 1.04],
  [1012, 1.024], [1020, 1.008], [1028, 1.0], [1072, 1.0], [1080, 1.024], [1084, 1.04], [1088, 1.072], [1096, 1.088], [1104, 1.104], [1112, 1.12], [1122, 1.125]]);
// avatar pop-in (local scale, rotation)
const AV_S = G([[976, 0], [977, 0.08], [978, 0.35], [979, 0.49], [980, 0.64], [983, 0.87], [984, 0.94], [988, 1.0]]);
const AV_R = G([[976, -100], [978, -70], [980, -45], [983, -12], [986, 0]]);
// crown screen position / rotation
const CROWN = G([[975, [880, 360, -40]], [976, [900, 306, -30]], [978, [941, 220, 10]], [979, [946, 196, 25]], [980, [951, 181, 40]], [982, [971, 150, 20]],
  [983, [966, 138, -10]], [988, [976, 124, -30]], [994, [972, 228, 20]], [1000, [972, 260, -15]], [1004, [975, 300, 30]], [1008, [981, 356, -20]],
  [1010, [970, 380, 0]], [1012, [992, 351, -4]], [1016, [1017, 348, -3]], [1024, [1014, 330, -2]], [1032, [1017, 343, 0]], [1036, [1016, 362, 4]],
  [1040, [1014, 407, 22]], [1044, [1016, 499, 35]], [1048, [1017, 626, 40]], [1056, [1020, 1010, 50]], [1060, [1020, 1200, 55]]]);
// [word index, appear frame, white frame] for phrase A, B
const A1 = [[0, 979, 983], [1, 986, 990], [2, 996, 1008]];
const A2 = [[0, 1012, 1016], [1, 1016, 1020], [2, 1020, 1024], [3, 1024, 1032], [4, 1032, 1044]];
const B1 = [[0, 1072], [1, 1082]];

export default {
  mount(root) {
    root.appendChild(Background({ variant: 'dark' }).node);
    const c = content.s09;
    // ---- "Et oui…" (screen space)
    this.etoui = TextLine({ tokens: ['Et', ' ', c.etoui[1]], size: 94.5, weight: 700, color: WHITE });
    this.etPen = 820 - this.etoui.inkBox.left;
    root.appendChild(this.etoui.node);
    // ---- world (camera)
    this.world = el('div', { style: { position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px', transformOrigin: '960px 540px' } });
    root.appendChild(this.world);
    this.avWrap = el('div', { style: { position: 'absolute', left: '970px', top: '474px', width: '0', height: '0' } });
    const img = (src) => el('img', { src, style: { position: 'absolute', left: '-62.5px', top: '-62.5px', width: '125px', height: '125px', borderRadius: '50%' } });
    this.avGrey = img('../assets/images/avatar-woman-grey-lg.png');
    this.avRed = img('../assets/images/avatar-woman-red.png');
    this.avWrap.append(this.avGrey, this.avRed);
    this.world.appendChild(this.avWrap);
    const line = (tokens, cx, base) => {
      const l = TextLine({ tokens, size: 52, weight: 700, color: WHITE, align: 'center' });
      css(l.node, { transform: `translate(${cx}px, ${base}px)` });
      this.world.appendChild(l.node);
      return l;
    };
    this.a1 = line(c.a1, 969.5, 613);
    this.a2 = line(c.a2, 975, 672);
    this.b1 = line(c.b1, 964.5, 614);
    this.b2a = line(['ce'], 964.5, 671);
    this.b2 = line(c.b2, 964.5, 671);
    // ---- crown + impact sparks (screen space)
    this.crown = Crown({ width: 48 });
    root.appendChild(this.crown.node);
    this.sparks = el('div', { html: '<svg width="40" height="40" viewBox="0 0 40 40"><path d="M6 34 L16 14 M20 36 L24 10 M30 34 L36 18" stroke="#c8364b" stroke-width="2.6" stroke-linecap="round"/></svg>', style: { position: 'absolute', left: '0', top: '0' } });
    root.appendChild(this.sparks);
  },
  update(t) {
    const fr = t * 60 + 940;
    const T = fr / 60;
    // ---------- shot 1: Et oui…
    const shot1 = fr < 976;
    css(this.etoui.node, { display: shot1 ? '' : 'none' });
    if (shot1) {
      const [et, oui] = this.etoui.items;
      const etSize = sampled(T, G([[940, 30], [944, 49], [948, 68], [952, 87], [956, 94.5]]));
      const etLeft = sampled(T, G([[940, 906], [944, 877], [948, 846], [952, 818], [956, 805], [958, 804], [964, 811], [968, 817], [972, 820]]));
      const etCy = sampled(T, G([[940, 534], [948, 528.5], [956, 524], [972, 521]]));
      const s = etSize / 94.5;
      const inkCy = (et.ink.top + et.ink.bottom) / 2;
      // place "Et": ink-left at etLeft, ink centre at etCy
      css(this.etoui.node, { transform: `translate(${(etLeft - et.ink.left * s).toFixed(2)}px, ${(etCy - inkCy * s).toFixed(2)}px) scale(${s.toFixed(4)})`, transformOrigin: '0 0' });
      // "oui…": scales in about its own left/baseline; gap closes
      const p = sampled(T, G([[957, 0], [958, 0.55], [960, 0.62], [964, 0.8], [968, 0.95], [972, 1]]));
      css(oui.node, { opacity: fr >= 958 ? 1 : 0, transform: `translateX(${(28 * (1 - p)).toFixed(2)}px) scale(${Math.max(p, 0.01).toFixed(4)})`, transformOrigin: `0px ${this.etoui.baselineOffset.toFixed(1)}px` });
    }
    // ---------- shot 2: avatar + sentence
    const shot2 = !shot1;
    css(this.world, { display: shot2 ? '' : 'none', transform: `scale(${sampled(T, CAM).toFixed(4)})` });
    if (!shot2) { this.crown.set({ opacity: 0 }); css(this.sparks, { opacity: 0 }); return; }
    const avS = sampled(T, AV_S), avR = sampled(T, AV_R);
    css(this.avWrap, { transform: `rotate(${avR.toFixed(2)}deg) scale(${avS.toFixed(4)})` });
    css(this.avRed, { opacity: fr >= 1010 ? 1 : 0 });
    const phaseB = fr >= 1072;
    const showWords = (line, rows, greyFrom = Infinity) => line.items.forEach((it, i) => {
      const r = rows.find(([w]) => w === i);
      const vis = r && fr >= r[1];
      let col = WHITE;
      if (r && r[2] !== undefined && fr < r[2]) col = RED;
      if (fr >= greyFrom) col = GREY;
      css(it.node, { opacity: vis ? 1 : 0, color: col });
    });
    css(this.a1.node, { display: phaseB ? 'none' : '' }); css(this.a2.node, { display: phaseB ? 'none' : '' });
    css(this.b1.node, { display: phaseB ? '' : 'none' }); css(this.b2.node, { display: phaseB && fr >= 1106 ? '' : 'none' });
    css(this.b2a.node, { display: phaseB && fr >= 1094 && fr < 1106 ? '' : 'none' });
    if (!phaseB) { showWords(this.a1, A1, 1010); showWords(this.a2, A2); } else {
      this.b1.items.forEach((it, i) => css(it.node, { opacity: fr >= B1[i][1] ? 1 : 0, color: GREY }));
    }
    // crown (screen space, size follows the camera)
    const [cx, cy, cr] = sampled(T, CROWN);
    const k = sampled(T, CAM);
    const squash = fr >= 1009 && fr < 1012 ? 0.75 : 1;
    this.crown.set({ x: cx, y: cy, rot: cr, scale: k, sy: squash, sx: 2 - squash, opacity: fr < 1060 ? 1 : 0 });
    const so = clamp(Math.min((fr - 1012) / 2, (1028 - fr) / 6));
    css(this.sparks, { transform: `translate(${(cx - 22).toFixed(1)}px, ${(cy + 18).toFixed(1)}px)`, opacity: fr >= 1012 && fr < 1028 ? so : 0 });
  },
};
