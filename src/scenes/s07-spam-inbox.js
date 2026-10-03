// S07 · f546–833 · Dark inbox full of "Découvrez notre solution" emails.
//  f546–598  hard cut, window settles from x1.30 (pivot 958,565)
//  f550–598  white pointer slides in from the left onto row 1
//  f586      row 1 selected · f604/607/610 rows 2–4 selected by a downward sweep
//  f666      the 4 selected mails are deleted, the inbox refills (2,4,6,7 rows f666–f672)
//  f672–700  push-in on the upper-left (x2), f706 row 1 selected
//  f720–732  fast pan down (blur): rows 2–3 selected under the pointer, row 4 at ~f741
//  f774–781  the plane tilts in 3D, the dark email popup pops on row 5
//  f812–833  the popup twists off the plane (handed to S08, falling)
// Camera = screen = T + s·p (p: rest layout of f640), measured on the yellow
// traffic light / row text / red elements (docs/ANALYSIS.md §S07).

import { el, css } from '../engine/dom.js';
import { sampled, track, progress, clamp } from '../engine/anim.js';
import { easeOutBack } from '../engine/easing.js';
import { Background } from '../components/Background.js';
import { InboxWindow, DarkEmailPopup } from '../components/Inbox.js';
import { Cursor } from '../components/Cursor.js';
import { content } from '../content/texts.fr.js';

const F = (n) => n / 60;
const loc = (rows) => rows.map(([f, ...v]) => [F(f - 546), v.length === 1 ? v[0] : v]);
// camera [frame, s, Tx, Ty]
const CAM = loc([[546, 1.30, -287, -170], [550, 1.195, -187, -110], [554, 1.136, -130, -77], [558, 1.099, -95, -56], [562, 1.074, -71, -42],
  [566, 1.054, -52, -31], [570, 1.042, -40, -24], [574, 1.03, -29, -17], [578, 1.022, -21, -12], [582, 1.016, -15, -9], [586, 1.009, -9, -5],
  [590, 1.005, -5, -3], [598, 1, 0, 0], [672, 1, 0, 0], [676, 1.03, -2, -10], [680, 1.08, -6, -27], [684, 1.2, -16, -69], [688, 1.55, -70, -178],
  [692, 1.8, -137, -245], [696, 1.95, -186, -283], [700, 2.0, -200, -296], [704, 2.0, -196, -298], [712, 2.0, -196, -305], [716, 2.0, -196, -318],
  [720, 2.0, -196, -346], [723, 2.0, -198, -430], [726, 2.0, -200, -520], [729, 2.0, -205, -600], [732, 2.0, -209, -634], [750, 2.0, -209, -665],
  [772, 2.0, -209, -694], [781, 2.0, -209, -700], [834, 2.0, -209, -720]]);
// pointer tip, screen space [frame, x, y]
const PTR = loc([[546, -60, 428], [550, 86, 416], [554, 233, 421], [558, 310, 415], [562, 357, 403], [566, 388, 393], [570, 408, 386], [574, 422, 382],
  [578, 431, 379], [582, 437, 378], [586, 439, 379], [590, 441, 380], [594, 442, 385], [598, 443, 396], [602, 443, 418], [606, 440, 483],
  [610, 442, 541], [614, 442, 562], [618, 442, 572], [622, 442, 576], [626, 441, 578], [634, 440, 580], [670, 442, 581], [674, 448, 583],
  [678, 460, 587], [682, 486, 591], [686, 560, 578], [690, 640, 525], [694, 668, 497], [698, 680, 482], [706, 680, 462], [714, 682, 470],
  [720, 680, 480], [726, 670, 500], [732, 660, 505], [740, 655, 500], [756, 652, 520], [772, 659, 580], [781, 526, 562], [790, 517, 584],
  [799, 519, 640], [808, 521, 636], [817, 526, 562], [826, 533, 528], [834, 526, 697]]);
// [row index, frame when it turns red]
const SELECT_A = [[0, 586], [1, 604], [2, 607], [3, 610]]; // before the delete (f666)
const SELECT_B = [[0, 706], [1, 723], [2, 728], [3, 741]]; // after the refill

export default {
  mount(root) {
    root.appendChild(Background({ variant: 'dark' }).node);
    this.stage3d = el('div', { style: { position: 'absolute', inset: '0', perspective: '1500px', perspectiveOrigin: '960px 540px' } });
    this.tilt = el('div', { style: { position: 'absolute', inset: '0', transformStyle: 'preserve-3d', transformOrigin: '960px 540px' } });
    this.world = el('div', { style: { position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px', transformOrigin: '0 0', transformStyle: 'preserve-3d' } });
    this.stage3d.appendChild(this.tilt); this.tilt.appendChild(this.world); root.appendChild(this.stage3d);
    this.inbox = InboxWindow({ label: content.s07.row, unread: content.s07.unread });
    this.world.appendChild(this.inbox.node);
    this.popup = DarkEmailPopup({ avatar: '../assets/images/avatar-victor.png', lines: content.s06.body });
    this.popWrap = el('div', { style: { position: 'absolute', left: '0', top: '0', transformStyle: 'preserve-3d' } }, [this.popup.node]);
    this.world.appendChild(this.popWrap);
    this.cursor = Cursor({ shape: 'plane', fill: '#ffffff', stroke: 'rgba(0,0,0,0.15)', size: 1 });
    root.appendChild(this.cursor.node);
  },
  update(t) {
    const fr = t * 60 + 546;
    const [s, tx, ty] = sampled(t, CAM);
    css(this.world, { transform: `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${s.toFixed(4)})` });
    // 3D tilt of the whole plane (f774 -> f781), slow drift afterwards
    const rx = track(t, [[228, 0], [235, 26, 'easeOutCubic'], [288, 28]]);
    const rz = track(t, [[228, 0], [235, -9, 'easeOutCubic'], [288, -11]]);
    const ry = track(t, [[228, 0], [235, 10, 'easeOutCubic'], [288, 12]]);
    const tyT = track(t, [[228, 0], [235, 40, 'easeOutCubic'], [288, 55]]);
    css(this.tilt, { transform: `translateY(${tyT}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)` });

    // rows
    const refill = fr >= 666;
    const visibleRows = !refill ? 7 : sampled(fr / 60, [[666, 2], [668, 4], [670, 6], [672, 7]].map(([f, v]) => [F(f), v]));
    const sel = refill ? SELECT_B : SELECT_A;
    for (let i = 0; i < 7; i++) {
      const ent = sel.find(([r]) => r === i);
      const selected = ent ? progress(fr, ent[1] - 2, ent[1]) : 0; // measured: fully red AT the event frame
      const pop = ent ? Math.sin(Math.PI * clamp((fr - ent[1]) / 14)) : 0;
      const vis = clamp(visibleRows - i);
      this.inbox.setRow(i, { selected, pop, visible: vis });
    }
    // popup: pops onto the plane at f779, twists and lifts off from f812
    const pIn = progress(fr, 778, 783, easeOutBack(1.4));
    const pz = track(fr / 60, [[812, 0], [826, 40], [834, 120]]);
    const prz = track(fr / 60, [[812, 0], [817, -12], [826, -28], [834, -45]]);
    const pdy = track(fr / 60, [[826, 0], [834, 160]]);
    css(this.popWrap, { transform: `translate(565px, ${655 + pdy}px) translateZ(${pz}px) rotateZ(${prz}deg) scale(${(0.85 + 0.15 * pIn).toFixed(4)})`, opacity: clamp((fr - 778) / 2), display: fr >= 778 ? '' : 'none' });

    const [px, py] = sampled(t, PTR);
    this.cursor.set({ x: px, y: py, scale: fr < 672 ? 1 : s, rot: 0, opacity: fr >= 547 ? 1 : 0 });
  },
};
