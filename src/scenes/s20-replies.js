// S20 · f2435–2585 · Replies.
//  f2435–2470 hard cut: the LinkedIn conversation card (Victor -> Claire,
//            Claire's reply) drops in; its header fades and the thread scrolls.
//  f2470–2491 the card is "eaten" from the top (clip) until only Claire's
//            reply remains, which becomes the top of a stack of reply cards.
//  f2491–2519 the stack fans out along a diagonal (step +170, -97 px) while
//            the camera zooms out (x0.5 at f2505) and back in.
//  f2519–2540 "Plus" / "de" / "réponses" appear word by word (light -> white).
//  f2575–2585 everything slides left with blur (the title faster: parallax),
//            while the dark calendar card of S21 rises from the bottom.
// World = screen pixels of f2547.

import { el, css } from '../engine/dom.js';
import { sampled, progress, clamp, mixColor, track } from '../engine/anim.js';
import { Background } from '../components/Background.js';
import { LinkedInThread, ReplyCard } from '../components/ReplyCard.js';
import { TextLine } from '../components/TextLine.js';
import { gmailSvg } from '../components/Inbox.js';
import { content } from '../content/texts.fr.js';

const G = (rows) => rows.map(([f, ...v]) => [f / 60, v.length === 1 ? v[0] : v]);
const THREAD = G([[2435, 772, 30, 0.97, 1, 105, 0], [2442, 773, 88, 1, 1, 105, 0], [2449, 774, 120, 1, 1, 96, 0], [2456, 775, 150, 1, 0.6, 80, 0],
  [2463, 776, 176, 1, 0.1, 62, 0], [2466, 776, 176, 1, 0, 50, 0], [2470, 776, 176, 1, 0, 50, 0], [2477, 776, 176, 1, 0, 50, 216],
  [2484, 776, 176, 1, 0, 50, 300], [2491, 760, 200, 1, 0, 50, 330]]);
// group camera [s, Tx, Ty]
const CAM = G([[2491, 1, 0, 0], [2498, 0.7, 270, 170], [2505, 0.5, 645, 460], [2512, 0.82, 190, 110], [2519, 1, 0, 0], [2575, 1, 0, 0], [2586, 1, -130, -10]]);

export default {
  mount(root) {
    root.appendChild(Background({ variant: 'blue' }).node);
    const c = content.s20;
    this.thread = LinkedInThread({ header: c.header, messages: c.thread, avatar: '../assets/images/avatar-woman.png' });
    root.appendChild(this.thread.node);
    this.group = el('div', { style: { position: 'absolute', left: '0', top: '0', width: '0', height: '0', transformOrigin: '0 0' } });
    root.appendChild(this.group);
    this.fan = c.fan.map((r, j) => {
      const card = ReplyCard(r);
      this.group.appendChild(card.node);
      return { card, j: r.j };
    });
    // front card (Chloe, Gmail) + badges
    this.front = ReplyCard(c.front);
    this.group.appendChild(this.front.node);
    this.badge = el('div', { html: `<div style="position:absolute;left:0;top:0;width:96px;height:96px;border-radius:24px;background:#fff;box-shadow:0 0 0 6px rgba(255,255,255,0.35),0 6px 18px rgba(30,50,140,0.2)"></div><div style="position:absolute;left:24px;top:31px">${gmailSvg(48)}</div>`, style: { position: 'absolute', left: '1176px', top: '326px' } });
    this.chip = el('div', { style: { position: 'absolute', left: '586px', top: '552px', width: '190px', height: '52px', borderRadius: '12px', background: '#ffffff', boxShadow: '0 0 0 5px rgba(255,255,255,0.3)' } });
    const ct = TextLine({ text: c.chip, size: 24.8, weight: 600, color: '#3f68e8', align: 'center' });
    css(ct.node, { transform: 'translate(95px, 35px)' }); this.chip.appendChild(ct.node);
    this.group.append(this.badge, this.chip);
    this.l1 = TextLine({ tokens: ['Plus', ' ', 'de'], size: 77.4, weight: 700, color: '#ffffff' });
    this.l2 = TextLine({ text: 'réponses', size: 77.4, weight: 700, color: '#ffffff' });
    css(this.l1.node, { transform: 'translate(660px, 700px)' }); css(this.l2.node, { transform: 'translate(660px, 780px)' });
    this.group.append(this.l1.node, this.l2.node);
  },
  update(t) {
    const fr = t * 60 + 2435, T = fr / 60;
    const [tx, ty, ts, hop, bodyTop, clipTop] = sampled(T, THREAD);
    css(this.thread.node, { transform: `translate(${tx}px, ${ty}px) scale(${ts})`, display: fr < 2493 ? '' : 'none', filter: fr < 2439 ? 'blur(3px)' : 'none' });
    this.thread.set({ headerOpacity: hop, bodyTop, clipTop });
    const [s, gx, gy] = sampled(T, CAM);
    const blur = fr > 2575 ? 6 * progress(fr, 2575, 2585) : fr > 2493 && fr < 2516 ? 3 : 0;
    css(this.group, { transform: `translate(${gx}px, ${gy}px) scale(${s})`, display: fr >= 2491 ? '' : 'none', filter: blur > 0.1 ? `blur(${blur.toFixed(2)}px)` : 'none' });
    // fan-out of the reply cards (stagger 1 frame per card)
    for (const { card, j } of this.fan) {
      const p = progress(fr, 2491 + Math.abs(j - 2), 2512 + Math.abs(j - 2), 'easeOutCubic');
      const fx = -184 + 170 * j, fy = 282 - 97 * j;
      const sx = 686 + 6 * j, sy = 374 - 5 * j;
      css(card.node, { transform: `translate(${(sx + (fx - sx) * p).toFixed(1)}px, ${(sy + (fy - sy) * p).toFixed(1)}px)` });
    }
    css(this.front.node, { transform: 'translate(686px, 374px)' });
    const fe = clamp((fr - 2512) / 6);
    css(this.badge, { opacity: fe, transform: `scale(${(0.6 + 0.4 * fe).toFixed(3)})` });
    css(this.chip, { opacity: fe });
    const word = (it, f0) => {
      const p = progress(fr, f0, f0 + 7);
      css(it.node, { opacity: fr >= f0 ? 1 : 0, color: mixColor('#86a6ff', '#ffffff', p) });
    };
    word(this.l1.items[0], 2519); word(this.l1.items[1], 2526); word(this.l2.items[0], 2533);
    const px = -160 * progress(fr, 2575, 2586, 'easeInQuad');
    css(this.l1.node, { transform: `translate(${660 + px}px, 700px)` }); css(this.l2.node, { transform: `translate(${660 + px}px, 780px)` });
  },
};
