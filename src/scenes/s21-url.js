// S21 · f2915–3098 · Final card: a dark rounded field pops in (scale 1.19 ->
// 1, f2915–2940), "www.lemlist.fr" is typed (f2918–2937, ~1.4 frame/char)
// with a caret that then blinks with a 30-frame period (on 15 / off 15,
// first "on" window starts at f2961). Very slow vertical bob until the end.
// Field at rest: 396 x 100 px, centre (964, 538) (measured).

import { el, css } from '../engine/dom.js';
import { sampled, clamp } from '../engine/anim.js';
import { Background } from '../components/Background.js';
import { TextLine } from '../components/TextLine.js';
import { content } from '../content/texts.fr.js';

const G = (rows) => rows.map(([f, v]) => [f / 60, v]);
const SCALE = G([[2915, 1.19], [2916, 1.14], [2918, 1.105], [2920, 1.085], [2922, 1.068], [2926, 1.05], [2930, 1.035], [2934, 1.025], [2940, 1.012], [2950, 1.004], [2960, 1.0]]);
const BOB = G([[2915, 0], [2950, 0], [2980, 1.5], [3010, 4], [3040, 6], [3070, 3], [3099, 0]]);
const TYPED = G([[2917, 0], [2919, 1], [2920, 2], [2922, 3], [2923, 4], [2925, 5], [2926, 6], [2928, 7], [2929, 8], [2931, 9], [2932, 10], [2934, 11], [2935, 12], [2937, 14]]);

export default {
  mount(root) {
    root.appendChild(Background({ variant: 'light' }).node);
    this.box = el('div', { style: { position: 'absolute', left: '0', top: '0', width: '396px', height: '100px', borderRadius: '22px', background: '#16151d', boxShadow: '0 0 0 4px rgba(70,70,90,0.55), 0 14px 30px rgba(30,40,90,0.18)', transformOrigin: '50% 50%' } });
    this.text = TextLine({ text: content.s21.url, size: 37.7, weight: 700, color: '#ffffff', split: 'char', align: 'center' });
    css(this.text.node, { transform: 'translate(198px, 63px)' });
    this.box.appendChild(this.text.node);
    this.caret = el('div', { style: { position: 'absolute', left: '0', top: '29px', width: '3px', height: '42px', background: '#ffffff' } });
    this.box.appendChild(this.caret);
    root.appendChild(this.box);
  },
  update(t) {
    const fr = t * 60 + 2915, T = fr / 60;
    css(this.box, { transform: `translate(${964 - 198}px, ${538 - 50 + sampled(T, BOB)}px) scale(${sampled(T, SCALE).toFixed(4)})` });
    const n = sampled(T, TYPED);
    let endX = 198 + this.text.inkBox.left - 8;
    this.text.items.forEach((it, i) => {
      const vis = n > i;
      css(it.node, { opacity: vis ? 1 : 0 });
      if (vis) endX = 198 + it.x + it.advance;
    });
    const on = fr < 2946 || (fr >= 2961 && (fr - 2961) % 30 < 15);
    css(this.caret, { transform: `translateX(${(endX + 6).toFixed(1)}px)`, opacity: on ? 1 : 0 });
  },
};
