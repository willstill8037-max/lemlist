// S12 · f1510–1716 · "et c'est exactement" + flamethrower.
//  f1510     cut: close on a dark email card (Emilie Paris) that pulls back to
//            the bottom of the frame (f1510–f1520, defocus 6 -> 0 px); "et" at
//            the top, the mosquito enters from the right.
//  f1523–32  "c'est" scales in next to "et"; f1535–48 grey "exactement" grows in.
//  f1540–90  the mosquito crosses behind the text to the left and hovers.
//  f1568–80  the card tilts and drops out; f1584–1600 the text tips over and falls.
//  f1596     a big "bzzzz" (grey, fading downward) appears behind the mosquito.
//  f1652     a cartoon flame jet bursts in from the bottom-right corner and
//            roasts the mosquito (24-frame loop) until the cut to black at f1717.

import { el, css } from '../engine/dom.js';
import { sampled, track, clamp, progress } from '../engine/anim.js';
import { Background } from '../components/Background.js';
import { MailCard } from '../components/MailCard.js';
import { Mosquito } from '../components/Mosquito.js';
import { TextLine } from '../components/TextLine.js';
import { Flame } from '../components/Flame.js';
import { content } from '../content/texts.fr.js';

const G = (rows) => rows.map(([f, v]) => [f / 60, v]);
const CARD = G([[1510, [950, 1160, 2.15, 0, 7]], [1512, [950, 1104, 1.97, 0, 6]], [1516, [960, 961, 1.34, 1, 3]], [1520, [966, 875, 0.96, 2, 0.5]],
  [1524, [950, 907, 0.994, 2, 0]], [1540, [960, 879, 0.99, 2.5, 0]], [1548, [962, 870, 1.0, 3, 0]], [1556, [966, 871, 1.0, 4, 0]],
  [1568, [968, 931, 1.0, 6, 0]], [1572, [970, 983, 1.0, 8, 0]], [1576, [975, 1103, 1.0, 12, 0]], [1580, [980, 1400, 1.0, 16, 0]]]);
const MOSQ = G([[1510, [1990, 380, 1.9, 0, 4]], [1512, [1840, 380, 1.7, 0, 3]], [1516, [1520, 420, 1.4, 0, 2]], [1520, [1200, 340, 1.05, 0, 0.5]],
  [1524, [1160, 312, 1.0, 0, 0.4]], [1532, [1140, 292, 1.0, 0, 0.4]], [1536, [1160, 292, 1.0, 0, 0.4]], [1540, [1040, 304, 1.05, 0, 0.6]],
  [1544, [820, 384, 1.1, 0, 0.8]], [1548, [680, 484, 1.15, 0, 0.8]], [1552, [600, 484, 1.1, 0, 0.6]], [1560, [560, 536, 1.05, 0, 0.5]],
  [1568, [540, 516, 1.05, 0, 0.5]], [1576, [540, 548, 1.05, 0, 0.5]], [1584, [560, 488, 1.0, 0, 0.5]], [1588, [680, 520, 0.95, 0, 0.5]],
  [1592, [840, 520, 0.9, 0, 0.5]], [1596, [880, 500, 0.85, 0, 0.5]], [1604, [920, 480, 0.85, 0, 0.4]], [1640, [960, 500, 1.0, 0, 0.4]],
  [1652, [960, 500, 1.0, 0, 0.4]], [1716, [960, 500, 1.0, 0, 0.4]]]);
// group of the two text lines: dx, dy, scale, rotation
const TXT = G([[1548, [0, 0, 1, 0]], [1572, [0, 0, 0.9, 0]], [1584, [0, 40, 0.88, 3]], [1588, [0, 110, 0.86, 6]], [1592, [0, 190, 0.84, 12]],
  [1596, [0, 340, 0.82, 22]], [1600, [0, 560, 0.8, 32]], [1606, [0, 900, 0.8, 40]]]);

export default {
  mount(root) {
    this.bg = Background({ variant: 'dark' });
    root.appendChild(this.bg.node);
    const c = content.s12;
    // big bzzzz (S12 end): grey, fading to the bottom
    this.bzz = TextLine({ text: c.buzz, size: 230, weight: 700, color: '#77748a', align: 'center' });
    for (const it of this.bzz.items) Object.assign(it.node.style, { color: 'transparent', backgroundImage: 'linear-gradient(180deg, #a3a0b6 0%, #8a879d 40%, rgba(60,58,76,0.35) 90%)', WebkitBackgroundClip: 'text', backgroundClip: 'text' });
    this.bzzWrap = el('div', { style: { position: 'absolute', left: '0', top: '0' } }, [this.bzz.node]);
    root.appendChild(this.bzzWrap);
    this.mosq = Mosquito();
    root.appendChild(this.mosq.node);
    this.view = el('div', { style: { position: 'absolute', inset: '0', perspective: '1800px', perspectiveOrigin: '960px 400px' } });
    this.card = MailCard({ avatar: '../assets/images/avatar-woman.png', name: c.name, email: c.email, body: c.body });
    this.view.appendChild(this.card.node);
    root.appendChild(this.view);
    // text: final layout "et c'est" (85 px) / "exactement" (99 px, grey)
    this.txt = el('div', { style: { position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px', transformOrigin: '960px 520px' } });
    this.l1 = TextLine({ tokens: ['et', ' ', 'c’est'], size: 85, weight: 700, color: '#ffffff', align: 'center' });
    this.l2 = TextLine({ text: c.exact, size: 99, weight: 700, color: '#7d7a92', align: 'center' });
    const b1 = 472 - (this.l1.inkBox.top + this.l1.inkBox.bottom) / 2, b2 = 575 - (this.l2.inkBox.top + this.l2.inkBox.bottom) / 2;
    css(this.l1.node, { transform: `translate(960px, ${b1}px)` });
    css(this.l2.node, { transform: `translate(952px, ${b2}px)` });
    this.txt.append(this.l1.node, this.l2.node);
    root.appendChild(this.txt);
    const [et, cest] = this.l1.items;
    this.et = et; this.cest = cest; this.b1 = b1;
    this.flame = Flame();
    root.appendChild(this.flame.node);
  },
  update(t) {
    const fr = t * 60 + 1510, T = fr / 60;
    const [cx, cy, cs, cr, cb] = sampled(T, CARD);
    this.card.set({ x: cx, y: cy, scale: cs, rot: cr, rx: 8, ry: -6, blur: cb });
    const [mx, my, ms, mr, mb] = sampled(T, MOSQ);
    this.mosq.set({ x: mx, y: my, scale: ms * 1.18, rot: mr, blur: mb, t: T });
    // "et" alone first (moves while the camera settles), then joins "c'est"
    const etC = sampled(T, G([[1510, [840, 400]], [1516, [848, 440]], [1520, [860, 472]], [1524, [820, 472]], [1528, [800, 464]], [1532, [0, 0]]]));
    const etFinal = [960 + this.et.cx, 472];
    const joined = fr >= 1532;
    css(this.et.node, { transform: joined ? 'none' : `translate(${(etC[0] - etFinal[0]).toFixed(1)}px, ${(etC[1] - etFinal[1]).toFixed(1)}px)` });
    const cs2 = sampled(T, G([[1523, 0.45], [1528, 0.72], [1532, 1]]));
    const cOff = sampled(T, G([[1523, [20, 48]], [1528, [12, 12]], [1532, [0, 0]]]));
    css(this.cest.node, { opacity: fr >= 1523 ? 1 : 0, transform: `translate(${cOff[0]}px, ${cOff[1]}px) scale(${cs2.toFixed(3)})` });
    const es = sampled(T, G([[1535, 0.53], [1540, 0.75], [1544, 0.94], [1548, 1]]));
    css(this.l2.items[0].node, { opacity: fr >= 1535 ? 1 : 0, transform: `scale(${es.toFixed(3)})` });
    const [tdx, tdy, tsc, trot] = sampled(T, TXT);
    css(this.txt, { transform: `translate(${tdx}px, ${tdy}px) rotate(${trot}deg) scale(${tsc})`, display: fr < 1606 ? '' : 'none' });
    // big bzzzz behind the mosquito
    const bw = sampled(T, G([[1595, 0.6], [1598, 1.0], [1640, 1.05], [1716, 1.08]]));
    css(this.bzzWrap, { transform: `translate(960px, 590px) scale(${bw.toFixed(4)})`, opacity: fr >= 1595 ? clamp((fr - 1595) / 2) : 0 });
    // flamethrower
    const reach = progress(fr, 1651, 1659, 'easeOutQuad');
    this.flame.set({ from: [2060, 1180], to: [870, 470], frame: fr, reach, opacity: fr >= 1651 ? 1 : 0 });
  },
};
