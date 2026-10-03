// S20 · f2695–2914 · Outro: hard cut to the light world; the "lemlist" pill
// pops again (logo from a dot, overshoot to 100 px at f2707, settles ~86 px)
// while "lemlist" is typed; f2731–2752 it rises to y 391 as the blue CTA
// "Démarrez votre essai gratuit" rises from the bottom (words lifting in one
// after another) with the navy pointer, then the English app table slides
// up at the bottom. The pointer hovers/clicks (two pulses f2784, f2802), then
// everything holds until the cut at f2915.
// Coordinates = screen pixels (measured; f2865 is the rest layout).

import { el, css } from '../engine/dom.js';
import { sampled, progress, clamp, mixColor } from '../engine/anim.js';
import { Background } from '../components/Background.js';
import { LogoPill } from '../components/LogoPill.js';
import { AppTable } from '../components/AppTable.js';
import { TextLine } from '../components/TextLine.js';
import { Cursor } from '../components/Cursor.js';
import { content } from '../content/texts.fr.js';

const G = (rows) => rows.map(([f, ...v]) => [f / 60, v.length === 1 ? v[0] : v]);
// logo square: centre x, centre y, size
const PILL = G([[2695, 862, 536, 4], [2698, 862, 536, 31], [2701, 854, 536, 72], [2704, 848, 535, 99], [2707, 845, 535, 100], [2710, 843, 535, 91],
  [2713, 840, 535, 80], [2716, 839, 534, 75], [2719, 838, 534, 77], [2722, 837, 534, 82], [2725, 836, 533, 87], [2728, 836, 531, 88], [2731, 835, 527, 88],
  [2734, 834, 521, 88], [2737, 834, 507, 87], [2740, 834, 478, 86], [2743, 833, 432, 86], [2746, 833, 411, 86], [2749, 833, 400, 87],
  [2752, 833, 395, 87], [2755, 833, 392, 87], [2758, 833, 391, 87], [2914, 833, 391, 87]]);
const CTA_Y = G([[2737, 1200], [2740, 854], [2743, 735], [2746, 681], [2749, 654], [2752, 640], [2755, 631], [2758, 628], [2914, 628]]);
const TABLE_Y = G([[2740, 400], [2748, 236], [2757, 196], [2766, 0], [2914, 0]]);
const PTR = G([[2740, 300, 960], [2744, 330, 880], [2748, 410, 806], [2752, 540, 720], [2757, 600, 690], [2766, 630, 670], [2784, 640, 662], [2914, 642, 660]]);
const TYPE = [2699, 2699, 2706, 2706, 2706, 2713, 2713];
const WORDS = [2742, 2747, 2752, 2757];

export default {
  mount(root) {
    root.appendChild(Background({ variant: 'light' }).node);
    const c = content.s20;
    this.table = AppTable({ data: c.table });
    root.appendChild(this.table.node);
    this.pill = LogoPill({ L: 87 });
    root.appendChild(this.pill.node);
    this.cta = el('div', { style: { position: 'absolute', left: '664px', top: '0', width: '602px', height: '104px', borderRadius: '16px', background: '#3d6bf3', boxShadow: '0 0 0 3px rgba(150,180,255,0.6), 0 12px 40px rgba(61,107,243,0.35)' } });
    this.ctaText = TextLine({ tokens: c.cta, size: 37, weight: 700, color: '#ffffff', align: 'center' });
    css(this.ctaText.node, { transform: 'translate(301px, 65px)' });
    this.cta.appendChild(this.ctaText.node);
    root.appendChild(this.cta);
    this.ring = el('div', { style: { position: 'absolute', left: '-26px', top: '-26px', width: '52px', height: '52px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.9)' } });
    root.appendChild(this.ring);
    this.cursor = Cursor({ shape: 'planeL', fill: '#1f2a44', stroke: 'rgba(255,255,255,0.9)', size: 0.75 });
    root.appendChild(this.cursor.node);
  },
  update(t) {
    const fr = t * 60 + 2695, T = fr / 60;
    const [px, py, pl] = sampled(T, PILL);
    this.pill.set({ cx: px, cy: py, scale: pl / 87, chars: TYPE.filter((f) => fr >= f).length, settle: (i) => progress(fr, TYPE[i] + 1, TYPE[i] + 8) });
    const cy = sampled(T, CTA_Y);
    css(this.cta, { transform: `translateY(${cy - 50}px)`, display: fr >= 2738 ? '' : 'none' });
    this.ctaText.items.forEach((it, i) => {
      const p = progress(fr, WORDS[i], WORDS[i] + 8, 'easeOutCubic');
      css(it.node, { opacity: fr >= WORDS[i] ? 1 : 0, transform: `translateY(${(14 * (1 - p)).toFixed(1)}px)`, color: mixColor('#c9d7ff', '#ffffff', p) });
    });
    css(this.table.node, { transform: `translateY(${sampled(T, TABLE_Y)}px)`, display: fr >= 2744 ? '' : 'none' });
    const [mx, my] = sampled(T, PTR);
    const press = progress(fr, 2782, 2785) - progress(fr, 2788, 2792);
    this.cursor.set({ x: mx, y: my, opacity: fr >= 2742 ? 1 : 0, press });
    const r1 = progress(fr, 2784, 2800), r2 = progress(fr, 2800, 2816);
    const rp = fr < 2800 ? r1 : r2;
    css(this.ring, { transform: `translate(${mx + 4}px, ${my + 4}px) scale(${(0.5 + rp).toFixed(3)})`, opacity: fr >= 2784 && fr < 2816 ? (1 - rp) * 0.9 : 0 });
  },
};
