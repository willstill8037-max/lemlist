// S06 · f346–545 · The email window swings in from the top-right (rotated
// -32°, ~2x, motion blur) over the defocusing website, lands centred (f374),
// overshoots into a slow push-in while the message is typed (f366–f428),
// quick pull-back (f424–f428), twinkling sparkles (f436–f490), the cursor
// comes in from the right (f500) and hovers/clicks "Envoyer" (button turns
// blue f530–f542), hard cut at f546.
// Card keyframes = centre of the underline + scale (underline length / 527),
// measured every 2 frames (docs/ANALYSIS.md §S06).

import { el, css } from '../engine/dom.js';
import { sampled, track, progress, clamp, tween } from '../engine/anim.js';
import { noise1 } from '../engine/random.js';
import { Background } from '../components/Background.js';
import { EmailComposer } from '../components/EmailComposer.js';
import { Sparkle } from '../components/Sparkle.js';
import { Cursor } from '../components/Cursor.js';
import { content } from '../content/texts.fr.js';

const F = (n) => n / 60;
const loc = (rows) => rows.map(([f, ...v]) => [F(f - 346), v]);
// [frame, cx, cy, scale, rotZ]
const CARD = loc([[346, 2380, 60, 2.1, -32], [350, 2190, 180, 2.1, -32], [356, 2171, 284, 2.14, -32], [362, 2150, 300, 2.2, -30],
  [365, 2110, 315, 2.2, -29], [368, 1700, 450, 1.9, -22], [371, 1160, 600, 1.45, -7], [374, 990, 655, 1.2, -1], [377, 978, 670, 1.22, 0],
  [380, 976, 677, 1.258, 0], [384, 966, 677, 1.304, 0], [388, 966, 691, 1.406, 0], [392, 966.5, 693, 1.423, 0], [396, 966.5, 690, 1.393, 0],
  [400, 966, 687, 1.368, 0], [412, 965, 687, 1.357, 0], [418, 965, 686, 1.334, 0], [420, 964.5, 684, 1.321, 0], [422, 964, 682, 1.300, 0],
  [424, 964.5, 679, 1.260, 0], [426, 964, 657, 1.057, 0], [428, 963.5, 653, 1.021, 0], [430, 963.5, 651, 0.998, 0], [440, 962.5, 647, 0.956, 0],
  [460, 962.5, 646, 0.930, 0], [480, 963, 643, 0.909, 0], [500, 964, 640, 0.894, 0], [520, 963.5, 637, 0.884, 0], [532, 963.5, 635, 0.877, 0],
  [536, 963, 635, 0.871, 0], [538, 963, 634, 0.863, 0], [540, 963, 633, 0.852, 0], [542, 963, 631, 0.833, 0], [545, 963, 625, 0.80, 0]]);
// typed characters (measured on the frames)
const TYPED = [[365, 0], [374, 21], [380, 35], [382, 39], [388, 52], [394, 63], [400, 72], [406, 81], [412, 88], [418, 93], [424, 98], [428, 101]]
  .map(([f, n]) => [F(f - 346), n]);
// cursor tip
const CURSOR = loc([[499, 1500, 790], [502, 1432, 778], [506, 1300, 774], [510, 1180, 770], [514, 1130, 752], [520, 1087, 738], [526, 1066, 723],
  [532, 1055, 715], [538, 1050, 709], [545, 1047, 705]]);

export default {
  mount(root) {
    this.bg = Background({ variant: 'light' });
    root.appendChild(this.bg.node);
    // soft concentric rings behind the card while it is pushed in (f374–f428)
    this.rings = el('div', { style: { position: 'absolute', left: '0', top: '0' } });
    for (const r of [430, 700]) {
      this.rings.appendChild(el('div', { style: { position: 'absolute', left: `${-r}px`, top: `${-r}px`, width: `${2 * r}px`, height: `${2 * r}px`, borderRadius: '50%', boxShadow: 'inset 0 0 0 46px rgba(255,255,255,0.55), 0 0 30px rgba(255,255,255,0.4)' } }));
    }
    root.appendChild(this.rings);
    const view = el('div', { style: { position: 'absolute', inset: '0', perspective: '1600px', perspectiveOrigin: '960px 540px' } });
    root.appendChild(view);
    const c = content.s06;
    this.card = EmailComposer({ lines: c.body, avatar: '../assets/images/avatar-victor.png', bigAvatar: '../assets/images/avatar-woman.png' });
    view.appendChild(this.card.node);
    this.sparkles = [
      { s: Sparkle(), at: [840, 322], keys: [[436, 0], [440, 40], [446, 120], [454, 110], [462, 100], [470, 60], [478, 16], [484, 0]] },
      { s: Sparkle(), at: [1250, 466], keys: [[442, 0], [446, 22], [454, 120], [462, 118], [470, 90], [478, 50], [486, 14], [490, 0]] },
      { s: Sparkle(), at: [1020, 730], keys: [[442, 0], [446, 30], [454, 66], [462, 60], [470, 34], [478, 14], [484, 0]] },
    ];
    for (const sp of this.sparkles) root.appendChild(sp.s.node);
    this.cursor = Cursor({ shape: 'mac', fill: '#111111', stroke: '#ffffff', size: 0.9 });
    root.appendChild(this.cursor.node);
  },
  update(t) {
    const fr = t * 60 + 346;
    // background only once the website (S05, underneath) is gone
    css(this.bg.node, { opacity: fr < 368 ? 0 : 1 });
    const [cx, cy, s, rz] = sampled(t, CARD);
    const ry = track(t, [[22, 0], [25, 18], [28, 6], [31, 0]]); // swing of the landing (f368-f377)
    const rx = track(t, [[22, 0], [25, 12], [28, 3], [31, 0]]);
    this.card.set({ x: cx, y: cy, scale: s, rot: rz, rx, ry, typed: sampled(t, TYPED), fresh: 2, button: progress(fr, 530, 541) });
    // rings: visible during the push-in, centred under the card
    const ro = clamp(Math.min((fr - 372) / 6, (428 - fr) / 4));
    css(this.rings, { transform: `translate(${cx}px, ${cy + 30 * s}px) scale(${(s / 1.35).toFixed(4)})`, opacity: ro, display: ro > 0 ? '' : 'none' });
    for (const sp of this.sparkles) {
      const size = track(fr / 60, sp.keys);
      sp.s.set({ x: sp.at[0], y: sp.at[1], size, opacity: size > 0 ? 1 : 0, rot: 4 * noise1(3, fr / 8) });
    }
    const [mx, my] = sampled(t, CURSOR);
    this.cursor.set({ x: mx, y: my, opacity: fr >= 499 ? 1 : 0, press: progress(fr, 528, 531) - progress(fr, 534, 538) });
  },
};
