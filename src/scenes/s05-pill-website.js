// S05 · f204–369 · The cube has become the logo square of the "lemlist" pill:
// speed marks, the word is typed in three bursts ("le" f205, "mli" f213,
// "st" f221; new letters light blue then navy), the pill rises to the top
// while the lemlist homepage swings up from below (rotateX 50° -> 0, f226–f246),
// slow push/drift, then everything recedes and defocuses (f350–f368) behind
// the incoming Victor card (S06).
// Tracking data: pill logo square centre/size and site CTA centre/width per
// frame (docs/ANALYSIS.md §S05).

import { el, css } from '../engine/dom.js';
import { track, sampled, progress, clamp } from '../engine/anim.js';
import { Background } from '../components/Background.js';
import { LogoPill } from '../components/LogoPill.js';
import { Website } from '../components/Website.js';

const F = (n) => n / 60;
const rows = (r) => r.map(([f, ...v]) => [F(f - 204), v.length === 1 ? v[0] : v]);
// pill logo square: centre x, centre y, size (px)
const PILL = rows([[204, 947, 534, 84], [206, 955, 543, 76], [210, 955, 542, 64], [214, 912, 536, 64], [218, 888, 534, 68], [222, 875, 514, 72],
  [226, 868, 459, 72], [230, 864, 391, 70], [234, 860, 349, 69], [238, 859, 322, 69], [242, 858, 303, 69], [246, 858, 290, 69],
  [250, 859, 281, 69], [254, 859, 275, 69], [262, 860, 270, 67], [270, 862, 272, 66], [280, 862, 278, 65], [290, 863, 283, 63],
  [300, 864, 288, 63], [320, 866, 293, 62], [342, 868, 296, 61], [350, 870, 300, 58]]);
// site: CTA centre x, y, scale (CTA width / 343) — f300 is the rest layout
const SITE = rows([[226, 962, 1250, 0.80], [230, 962, 1160, 0.88], [234, 962, 1080, 0.95], [238, 961, 1019, 0.99], [242, 961, 970, 1.03],
  [246, 962, 935, 1.052], [250, 963, 907, 1.064], [254, 964, 887, 1.067], [262, 964, 860, 1.058], [270, 964, 846, 1.044],
  [280, 963, 841, 1.026], [290, 963, 837, 1.009], [300, 962.5, 835.5, 1.0], [310, 962, 833, 0.985], [320, 961, 831, 0.983],
  [334, 962, 829, 0.971], [342, 963, 827, 0.965], [350, 963, 821, 0.942]]);
const TYPE = [205, 205.6, 213, 213.6, 214.2, 221, 221.6]; // frame at which each letter of "lemlist" appears

export default {
  mount(root) {
    root.appendChild(Background({ variant: 'light' }).node);
    this.all = el('div', { style: { position: 'absolute', inset: '0', transformOrigin: '960px 560px' } });
    root.appendChild(this.all);
    this.persp = el('div', { style: { position: 'absolute', inset: '0', perspective: '1500px', perspectiveOrigin: '960px 700px' } });
    this.site = Website();
    this.persp.appendChild(this.site.node);
    this.all.appendChild(this.persp);
    this.pill = LogoPill({ L: 63 });
    this.all.appendChild(this.pill.node);
    // speed marks left of the logo when the pill pops (f204–f214)
    this.marks = el('div', { html: '<svg width="120" height="90" viewBox="0 0 120 90"><path d="M110 20 Q70 18 40 34" stroke="#3866f9" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M118 60 Q80 52 20 58" stroke="#3866f9" stroke-width="7" fill="none" stroke-linecap="round"/></svg>', style: { position: 'absolute', left: '0', top: '0', transformOrigin: '120px 45px' } });
    this.all.appendChild(this.marks);
  },
  update(t) {
    const fr = t * 60 + 204;
    const [px, py, ps] = sampled(t, PILL);
    this.pill.set({
      cx: px, cy: py, scale: ps / 63,
      chars: TYPE.filter((f) => fr >= f).length,
      settle: (i) => progress(fr, TYPE[i] + 3, TYPE[i] + 7),
    });
    // speed marks: start 1 logo-width left of the logo, slide left, shrink, fade
    const mp = clamp((fr - 204) / 10);
    css(this.marks, { transform: `translate(${(px - ps * 0.6 - 120 - 60 * mp).toFixed(1)}px, ${(py - 45 - 20 * mp).toFixed(1)}px) scale(${(ps / 84 * (1 - 0.5 * mp)).toFixed(3)})`, opacity: fr < 214 ? 1 - mp : 0 });

    // site
    const [sx, sy, ss] = sampled(t, SITE);
    const rx = track(t, [[22, 55], [26, 36], [30, 16], [34, 4], [38, 0]]);
    const rz = track(t, [[22, -5], [30, -2], [34, -0.5], [38, 0]]);
    css(this.site.node, {
      transform: `translate(${sx.toFixed(2)}px, ${sy.toFixed(2)}px) rotateX(${rx.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${ss.toFixed(4)}) translate(-962.5px, -835.5px)`,
      display: fr >= 224 ? '' : 'none',
    });
    // exit (f350–f368): recede towards (960, 560), defocus, fade
    const e = track(t, [[146, 1], [152, 0.84, 'easeInQuad'], [155, 0.66], [158, 0.49], [161, 0.33], [164, 0.2]]);
    const blur = track(t, [[146, 0], [149, 2], [152, 4], [155, 6], [158, 8], [164, 10]]);
    const op = track(t, [[154, 1], [158, 0.8], [161, 0.5], [164, 0]]);
    css(this.all, { transform: e < 1 ? `scale(${e.toFixed(4)})` : 'none', filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none', opacity: op });
  },
};
