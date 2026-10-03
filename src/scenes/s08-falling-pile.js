// S08 · f836–939 · Two shots.
//  A) f836–873 the dark email popup (x2.1, rotated ~75°) drops in from the
//     top, hangs (f846–f858) then falls out of frame, through vertical white
//     speed lines that move upward. Measured: the lines are updated every 2nd
//     frame (30 fps stepping, alternating frame differences), the card at 60 fps.
//  B) f874–939 hard cut: a pile of identical dark emails at the bottom over a
//     red glow; a last small email tumbles onto the top (f874–f886), two white
//     smoke puffs (f890–f912), slow push-in (top of pile 770 -> 748 px).

import { el, css } from '../engine/dom.js';
import { sampled, track, clamp, progress, stepTime } from '../engine/anim.js';
import { rand } from '../engine/random.js';
import { Background } from '../components/Background.js';
import { DarkEmailPopup } from '../components/Inbox.js';
import { content } from '../content/texts.fr.js';

const F = (n) => n / 60;
const loc = (rows) => rows.map(([f, ...v]) => [F(f - 836), v.length === 1 ? v[0] : v]);
// card centre x, y, rotation (deg)
const CARD = loc([[836, 1100, -120, 84], [838, 1057, 340, 82], [840, 1015, 462, 80], [842, 993, 512, 78], [844, 979, 533, 76], [846, 971, 539, 75],
  [852, 960, 540, 72], [856, 958, 561, 71], [860, 960, 604, 70], [864, 966, 660, 70], [868, 979, 816, 69], [870, 995, 899, 68], [872, 1010, 985, 68], [874, 1030, 1100, 67]]);
// pile cards measured on f936: [cx, cy, width, rotation]
const PILE = [[380, 1100, 190, -2], [560, 1110, 190, 2], [760, 1105, 200, -1], [960, 1112, 200, 1], [1160, 1105, 200, -2], [1360, 1110, 190, 2], [1540, 1100, 190, -2],
  [590, 1040, 180, 3], [745, 1030, 175, -3], [900, 1045, 170, -2], [1060, 1040, 180, 2], [1250, 1050, 175, 2], [1380, 1070, 170, -3], [480, 1075, 170, -2], [1500, 1085, 160, 3],
  [650, 955, 150, 2], [1222, 952, 175, 3], [1110, 988, 160, -4], [772, 945, 175, 3], [871, 865, 167, 5], [1034, 860, 188, -6]];
const LINES = 46;

export default {
  mount(root) {
    root.appendChild(Background({ variant: 'dark' }).node);
    // ---- shot A
    this.shotA = el('div', { style: { position: 'absolute', inset: '0' } });
    root.appendChild(this.shotA);
    this.lines = [];
    for (let i = 0; i < LINES; i++) {
      const l = el('div', { style: { position: 'absolute', left: '0', top: '0', width: `${(1.5 + 2 * rand(81, i, 1)).toFixed(2)}px`, borderRadius: '2px', background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 25%, rgba(255,255,255,0.95) 75%, rgba(255,255,255,0) 100%)' } });
      this.shotA.appendChild(l); this.lines.push(l);
    }
    const view = el('div', { style: { position: 'absolute', inset: '0', perspective: '1400px', perspectiveOrigin: '960px 540px' } });
    this.card = DarkEmailPopup({ avatar: '../assets/images/avatar-victor.png', lines: content.s06.body });
    this.cardWrap = el('div', { style: { position: 'absolute', left: '0', top: '0', transformStyle: 'preserve-3d' } }, [this.card.node]);
    view.appendChild(this.cardWrap); this.shotA.appendChild(view);
    // ---- shot B
    this.shotB = el('div', { style: { position: 'absolute', inset: '0', transformOrigin: '960px 1080px' } });
    root.appendChild(this.shotB);
    this.shotB.appendChild(el('div', { style: { position: 'absolute', left: '160px', top: '640px', width: '1600px', height: '880px', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(190,40,52,0.85) 0%, rgba(150,30,45,0.55) 45%, rgba(90,22,38,0.2) 75%, rgba(30,26,40,0) 100%)' } }));
    const pile = el('div', { style: { position: 'absolute', inset: '0', filter: 'blur(1.6px)' } });
    for (const [cx, cy, w, r] of PILE) {
      const c = DarkEmailPopup({ avatar: '../assets/images/avatar-victor.png', lines: content.s06.body });
      css(c.node, { transform: `translate(${cx}px, ${cy}px) rotate(${r}deg) scale(${(w / 300).toFixed(4)})`, filter: 'brightness(0.5)' });
      pile.appendChild(c.node);
    }
    this.last = DarkEmailPopup({ avatar: '../assets/images/avatar-victor.png', lines: content.s06.body });
    pile.appendChild(this.last.node);
    this.shotB.appendChild(pile);
    this.puffs = [-1, 1].map((side) => {
      const p = el('div', { html: `<svg width="90" height="80" viewBox="0 0 90 80"><path d="M${side < 0 ? 80 : 10} 70 C ${side < 0 ? 20 : 70} 60, ${side < 0 ? 60 : 30} 20, ${side < 0 ? 15 : 75} 8" stroke="rgba(255,255,255,0.55)" stroke-width="10" fill="none" stroke-linecap="round"/></svg>`, style: { position: 'absolute', left: '0', top: '0', filter: 'blur(4px)' } });
      this.shotB.appendChild(p); return { p, side };
    });
  },
  update(t) {
    const fr = t * 60 + 836;
    const A = fr < 874;
    css(this.shotA, { display: A ? '' : 'none' });
    css(this.shotB, { display: A ? 'none' : '' });
    if (A) {
      const ts = stepTime(t, 30); // lines move on twos
      for (let i = 0; i < LINES; i++) {
        const len = 90 + 320 * rand(81, i, 2);
        const speed = 1800 + 2600 * rand(81, i, 3); // px/s upward
        const x = 30 + 1860 * rand(81, i, 4);
        const y0 = 1200 * rand(81, i, 5);
        const y = ((y0 - speed * ts) % (1080 + len) + (1080 + len)) % (1080 + len) - len;
        css(this.lines[i], { transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`, height: `${len.toFixed(1)}px`, opacity: (0.35 + 0.65 * rand(81, i, 6)).toFixed(3) });
      }
      const [cx, cy, rot] = sampled(t, CARD);
      css(this.cardWrap, { transform: `translate(${cx}px, ${cy}px) rotateZ(${rot}deg) rotateX(18deg) scale(2.1)` });
    } else {
      const zoom = track(fr / 60, [[874, 1], [940, 1.075]]);
      css(this.shotB, { transform: `scale(${zoom.toFixed(4)})` });
      // last email: falls from the top, tumbling, lands on the pile at f886
      const lx = track(fr / 60, [[874, 925], [876, 932], [878, 948], [880, 965], [886, 962]]);
      const ly = track(fr / 60, [[874, 60], [876, 206], [878, 366], [880, 500], [884, 760], [886, 802]]);
      const lr = track(fr / 60, [[874, 70], [880, 30], [886, 0]]);
      const ls = track(fr / 60, [[874, 0.35], [880, 0.45], [886, 0.507]]);
      css(this.last.node, { transform: `translate(${lx}px, ${ly}px) rotate(${lr}deg) scale(${ls})`, filter: fr < 886 ? 'brightness(0.8)' : 'brightness(0.68)' });
      for (const { p, side } of this.puffs) {
        const k = progress(fr, 888, 912, 'easeOutCubic');
        css(p, { transform: `translate(${(962 + side * (110 + 30 * k) - 45).toFixed(1)}px, ${(735 - 30 * k).toFixed(1)}px) scale(${(0.7 + 0.5 * k).toFixed(3)})`, opacity: fr < 888 ? 0 : clamp(Math.min((fr - 888) / 4, (914 - fr) / 10)) });
      }
    }
  },
};
