// S03 · f136–154 · "Pourquoi" (Inter Bold, blue gradient) over a huge pale,
// defocused "?"; both settle (scale 1.10 -> 0.93) then drop out of frame
// with an ease-in (f146–f153). f154 is the empty background.
// Measured ink boxes: docs/ANALYSIS.md §S03.

import { el, css } from '../engine/dom.js';
import { track } from '../engine/anim.js';
import { Background } from '../components/Background.js';
import { TextLine } from '../components/TextLine.js';

export default {
  mount(root) {
    root.appendChild(Background({ variant: 'light' }).node);
    // "?" : Inter Bold, light lavender, vertical gradient, out of focus
    this.q = el('div', {
      text: '?',
      style: {
        position: 'absolute', left: '0', top: '0', font: '700 560px Inter', lineHeight: '1', whiteSpace: 'pre',
        color: 'transparent', backgroundImage: 'linear-gradient(180deg, #e9eefc 0%, #d6dff9 45%, #ccd7f8 100%)',
        WebkitBackgroundClip: 'text', backgroundClip: 'text', transformOrigin: '50% 50%',
      },
    });
    this.qWrap = el('div', { style: { position: 'absolute', left: '0', top: '0' } }, [this.q]);
    root.appendChild(this.qWrap);
    this.line = TextLine({ text: 'Pourquoi', size: 128, weight: 700, color: '#4f78e9', align: 'center' });
    for (const it of this.line.items) {
      Object.assign(it.node.style, { color: 'transparent', backgroundImage: 'linear-gradient(180deg, #6884e4 10%, #5a7fe6 45%, #426cef 85%)', WebkitBackgroundClip: 'text', backgroundClip: 'text' });
    }
    this.tWrap = el('div', { style: { position: 'absolute', left: '0', top: '0' } }, [this.line.node]);
    root.appendChild(this.tWrap);
    const ink = this.line.inkBox;
    this.inkCy = (ink.top + ink.bottom) / 2;
  },
  update(t) {
    const fr = t * 60 + 136;
    const T = (rows) => track(fr / 60, rows);
    // measured: width 600 -> 546 (f140) -> 510 (f152); centre y 546 -> 559 (f144) -> 850 (f153)
    const s = T([[136, 1.099], [137, 1.048], [138, 1.026], [139, 1.011], [140, 1.0], [142, 0.982], [144, 0.967], [146, 0.954], [148, 0.945], [150, 0.936], [153, 0.934]]);
    const cx = T([[136, 963], [140, 962], [144, 960], [146, 960], [148, 966], [150, 974], [152, 983], [153, 985]]);
    const cy = T([[136, 546], [139, 548], [142, 553], [144, 559], [146, 570], [148, 594], [150, 642], [152, 743], [153, 850], [154, 990]]);
    css(this.tWrap, { transform: `translate(${cx}px, ${(cy - this.inkCy * s).toFixed(2)}px) scale(${s.toFixed(4)})`, opacity: fr < 154 ? 1 : 0 });
    // "?": ink box 600 px tall at f136 -> 411 px at f144, centre follows the word
    const qh = T([[136, 600], [137, 559], [138, 525], [139, 497], [140, 473], [142, 436], [144, 411], [146, 395], [148, 382], [150, 372], [153, 367]]);
    const qcy = T([[136, 437], [138, 477], [140, 507], [142, 530], [144, 548], [146, 568], [148, 599], [150, 652], [152, 760], [153, 881], [154, 1000]]);
    const qcx = T([[136, 945], [140, 966], [144, 960], [146, 958], [150, 960]]);
    const qs = qh / (0.74 * 560);
    css(this.qWrap, { transform: `translate(${qcx}px, ${qcy}px) scale(${qs.toFixed(4)}) translate(-50%, -50%)`, filter: `blur(${(4 / qs).toFixed(2)}px)`, opacity: fr < 154 ? 1 : 0 });
    css(this.q, { transform: 'translate(-50%, -54%)' });
  },
};
