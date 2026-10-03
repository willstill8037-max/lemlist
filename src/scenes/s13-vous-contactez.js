// S13 · f1748–1891 · Back to the light world.
//  f1748–1772 the "lemlist" pill (bigger than in S05: logo 84 px at rest)
//            pulls back from x2.75 with defocus; the logo square pops from a
//            dot with an overshoot (x1.43 at f1758); "le" / "mli" / "st" typed
//            at f1749 / 1758 / 1766 (light blue, then navy).
//  f1790–1812 the pill shoots up to the top (fast, motion blur), the prompt
//            card rises from the bottom, a big navy pointer enters bottom-left.
//  f1812–1846 "Vous" "contactez" / "les" "bonnes" "personnes" appear word by
//            word (from 25 px lower, light colour -> final colour).
//  f1862–1886 the pointer flies into the input field, shrinking.
// Layout ("world") = screen pixels of f1880; group camera k = pill logo / 91 px.

import { el, css } from '../engine/dom.js';
import { sampled, progress, clamp, mixColor } from '../engine/anim.js';
import { Background } from '../components/Background.js';
import { LogoPill } from '../components/LogoPill.js';
import { PromptCard } from '../components/PromptCard.js';
import { TextLine } from '../components/TextLine.js';
import { Cursor } from '../components/Cursor.js';
import { content } from '../content/texts.fr.js';

const G = (rows) => rows.map(([f, v]) => [f / 60, v]);
const NAVY = '#1f2a44', BLUE = '#3f68e8';
// pill logo centre (screen) and size; pill scale for f1748-1772 from the outer box width
const PILL = G([[1748, [560, 545, 231]], [1750, [583, 542, 218]], [1752, [600, 540, 202]], [1754, [660, 539, 172]], [1756, [714, 538, 151]],
  [1758, [735, 537, 139]], [1760, [758, 537, 126]], [1762, [773, 537, 118]], [1764, [786, 537, 111]], [1766, [796, 537, 105]],
  [1768, [805, 537, 99]], [1770, [812, 537, 95]], [1772, [819, 536, 88]], [1780, [834, 537, 84]], [1790, [838, 528, 83.5]],
  [1792, [838, 521, 83.5]], [1794, [838, 511, 83.5]], [1796, [838, 498, 83.5]], [1798, [838, 477, 83.5]], [1800, [838, 445, 83.5]],
  [1804, [838, 303, 83.5]], [1808, [837, 214, 83.5]], [1812, [837, 180, 83.5]], [1816, [837, 160, 84]], [1820, [836, 142, 85]],
  [1824, [833, 119, 86]], [1828, [830, 93, 88]], [1832, [828, 73, 89]], [1836, [826, 60, 89]], [1840, [825, 50, 89.5]],
  [1848, [824, 41, 90]], [1856, [823, 37, 90.5]], [1864, [823, 34, 91]], [1872, [822, 33, 91]], [1880, [820, 32, 91]],
  [1884, [812, 31, 91]], [1888, [785, 31, 91]], [1892, [770, 31, 91]]]);
const LOGO_POP = G([[1749, 0.08], [1750, 0.3], [1752, 0.72], [1754, 1.07], [1756, 1.34], [1758, 1.43], [1760, 1.4], [1762, 1.28], [1764, 1.14], [1766, 1.02], [1768, 0.96], [1772, 1.0]]);
const BLUR = G([[1748, 6], [1752, 4], [1756, 2], [1762, 0]]);
const TYPE = [1749, 1749, 1758, 1758, 1758, 1766, 1766];
const WORDS = [[0, 0, 1812], [0, 1, 1818], [1, 0, 1824], [1, 1, 1836], [1, 2, 1842]]; // [line, word, frame]
const CARD_RISE = G([[1804, 700], [1806, 500], [1808, 260], [1812, 60], [1816, 0]]);
const PTR = G([[1805, [60, 1130, 2.6]], [1808, [40, 1075, 2.6]], [1820, [38, 1042, 2.6]], [1862, [40, 1035, 2.6]], [1866, [150, 1000, 2.4]],
  [1868, [300, 960, 2.2]], [1872, [560, 840, 1.6]], [1874, [640, 790, 1.3]], [1878, [710, 720, 1.1]], [1880, [735, 700, 1.0]], [1886, [760, 690, 0.8]], [1892, [770, 690, 0.75]]]);

export default {
  mount(root) {
    root.appendChild(Background({ variant: 'light' }).node);
    const c = content.s13;
    this.group = el('div', { style: { position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px', transformOrigin: '0 0' } });
    root.appendChild(this.group);
    this.card = PromptCard({ title: c.title, placeholder: c.placeholder, button: c.button });
    this.group.appendChild(this.card.node);
    this.l1 = TextLine({ text: c.line1, size: 83, weight: 700, color: NAVY, align: 'center' });
    this.l2 = TextLine({ text: c.line2, size: 83, weight: 700, color: BLUE, align: 'center' });
    css(this.l1.node, { transform: 'translate(957px, 282px)' });
    css(this.l2.node, { transform: 'translate(959px, 389px)' });
    this.group.append(this.l1.node, this.l2.node);
    this.pill = LogoPill({ L: 91 });
    root.appendChild(this.pill.node);
    this.cursor = Cursor({ shape: 'planeL', fill: '#1f2a44', stroke: 'rgba(255,255,255,0.9)' });
    root.appendChild(this.cursor.node);
  },
  update(t) {
    const fr = t * 60 + 1748, T = fr / 60;
    const [px, py, pl] = sampled(T, PILL);
    const pop = sampled(T, LOGO_POP);
    this.pill.set({
      cx: px, cy: py, scale: pl / 91, blur: sampled(T, BLUR) + (fr > 1798 && fr < 1810 ? 1.5 : 0),
      chars: TYPE.filter((f) => fr >= f).length, settle: (i) => progress(fr, TYPE[i] + 1, TYPE[i] + 8),
      logoScale: fr < 1772 ? pop : 1,
    });
    // group camera from the pill (k = logo / 91, pill world centre = (820, 32))
    const k = pl / 91;
    const gx = px - k * 820, gy = py - k * 32;
    css(this.group, { transform: `translate(${gx.toFixed(2)}px, ${gy.toFixed(2)}px) scale(${k.toFixed(4)})`, display: fr >= 1800 ? '' : 'none' });
    css(this.card.node, { transform: `translateY(${sampled(T, CARD_RISE).toFixed(1)}px)` });
    for (const [li, wi, f0] of WORDS) {
      const it = (li ? this.l2 : this.l1).items[wi];
      const p = progress(fr, f0, f0 + 10, 'easeOutCubic');
      const light = li ? '#a9bff7' : '#a3a8b8', fin = li ? BLUE : NAVY;
      css(it.node, { opacity: fr >= f0 ? clamp((fr - f0 + 1) / 3) : 0, transform: `translateY(${(25 * (1 - p)).toFixed(1)}px)`, color: mixColor(light, fin, p) });
    }
    const [cx, cy, cs] = sampled(T, PTR);
    this.cursor.set({ x: cx, y: cy, scale: cs * 1.1, opacity: fr >= 1805 ? 1 : 0 });
  },
};
