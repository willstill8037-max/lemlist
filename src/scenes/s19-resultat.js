// S19 · f2385–2434 · Hard cut to "Résultat" (Inter Bold, white) centred on the
// blue background; slow linear push-in (ink width 664 px -> 752 px).
import { css } from '../engine/dom.js';
import { tween } from '../engine/anim.js';
import { Background } from '../components/Background.js';
import { TextLine } from '../components/TextLine.js';
import { content } from '../content/texts.fr.js';

export default {
  mount(root) {
    root.appendChild(Background({ variant: 'blue' }).node);
    this.l = TextLine({ text: content.s19.word, size: 168, weight: 700, color: '#ffffff', align: 'center' });
    this.cy = (this.l.inkBox.top + this.l.inkBox.bottom) / 2;
    root.appendChild(this.l.node);
  },
  update(t) {
    const s = tween(t, 0, 49 / 60, 1, 752 / 664);
    css(this.l.node, { transform: `translate(960px, 542px) scale(${s.toFixed(4)}) translateY(${(-this.cy).toFixed(2)}px)` });
  },
};
