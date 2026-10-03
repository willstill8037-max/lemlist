// S19 · f2586–2694 · Booked demos.
//  f2582–2606 a dark calendar window rises from the bottom-right (blur) next
//            to four floating reply cards (James Foster, Oliver Reed, Lucas
//            Grant, Ethan Brooks) that drift slowly.
//  f2624–2640 the reply cards are sucked into the calendar (motion blur)…
//  f2640–2694 …and become events "<Name> X Victor - Demo" stacked under
//            "RDV Alex.F X Victor - Demo.F"; the calendar slides left and the
//            list scrolls up while new events keep popping in. Cut at f2695.
// Coordinates = screen pixels (measured on the 1/4 index sheets, ±8 px).

import { el, css } from '../engine/dom.js';
import { sampled, progress, clamp } from '../engine/anim.js';
import { Background } from '../components/Background.js';
import { ReplyCard } from '../components/ReplyCard.js';
import { TextLine } from '../components/TextLine.js';
import { content } from '../content/texts.fr.js';

const G = (rows) => rows.map(([f, ...v]) => [f / 60, v]);
const abs = (x, y, w, h, s = {}) => ({ position: 'absolute', left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, ...s });
// calendar panel: left x, top y (the event list scroll is folded into y)
const PANEL = G([[2582, 300, 1080], [2588, 360, 680], [2594, 720, 352], [2600, 840, 248], [2606, 888, 200], [2612, 920, 192], [2624, 912, 188],
  [2630, 920, 192], [2636, 840, 192], [2642, 680, 192], [2648, 592, 192], [2654, 540, 158], [2660, 520, 54], [2666, 520, -156], [2672, 520, -320],
  [2678, 552, -426], [2684, 552, -498], [2690, 540, -556], [2695, 540, -590]]);
const EV_H = 206; // vertical pitch of the events

export default {
  mount(root) {
    root.appendChild(Background({ variant: 'blue' }).node);
    const c = content.s19;
    this.panel = el('div', { style: abs(0, 0, 920, 2200, { borderRadius: '28px', background: '#18171f', boxShadow: '0 30px 80px rgba(10,20,60,0.35)' }) });
    [['#e0444f', 36], ['#e9b33c', 58], ['#43a95a', 80]].forEach(([col, x]) => this.panel.appendChild(el('div', { style: abs(x - 7, 30, 14, 14, { borderRadius: '50%', background: col }) })));
    this.events = c.events.map(([title, time], i) => {
      const ev = el('div', { style: abs(40, 88 + EV_H * i, 840, 178, { borderRadius: '14px', background: '#234856', overflow: 'hidden' }) });
      ev.appendChild(el('div', { style: abs(0, 0, 12, 178, { background: '#1e9bd3' }) }));
      const t1 = TextLine({ text: title, size: 37, weight: 600, color: '#f2f6f8' }); css(t1.node, { transform: 'translate(36px, 54px)' }); ev.appendChild(t1.node);
      const t2 = TextLine({ text: time, size: 27, weight: 500, color: '#4f8da1' }); css(t2.node, { transform: 'translate(36px, 100px)' }); ev.appendChild(t2.node);
      this.panel.appendChild(ev);
      return ev;
    });
    for (let k = 0; k < 3; k++) this.panel.appendChild(el('div', { style: abs(30, 352 + 200 * k, 22, 6, { borderRadius: '3px', background: '#c9c9d4', opacity: 0.8 }) }));
    root.appendChild(this.panel);
    this.cards = c.cards.map((r) => { const card = ReplyCard(r); root.appendChild(card.node); return { card, at: r.at }; });
  },
  update(t) {
    const fr = t * 60 + 2586, T = fr / 60;
    const [px, py] = sampled(T, PANEL);
    css(this.panel, { transform: `translate(${px}px, ${py}px)`, filter: fr < 2600 ? `blur(${(6 * (1 - progress(fr, 2582, 2600))).toFixed(2)}px)` : 'none' });
    // events: the first one is there from the start, the next ones pop in (6 frames apart)
    this.events.forEach((ev, i) => {
      const f0 = i === 0 ? -1 : 2638 + 6 * (i - 1);
      const p = progress(fr, f0, f0 + 8, 'easeOutCubic');
      css(ev, { opacity: i === 0 ? 1 : clamp((fr - f0) / 3), transform: `translateX(${(60 * (1 - p)).toFixed(1)}px) scale(${(0.86 + 0.14 * p).toFixed(3)})`, transformOrigin: '0 50%' });
    });
    // reply cards: drift, then get sucked into the panel (f2624-2640)
    this.cards.forEach(({ card, at }, i) => {
      const drift = 0.6 * (fr - 2600);
      const suck = progress(fr, 2622 + i, 2638 + i, 'easeInCubic');
      const target = [px + 120, py + 88 + EV_H * (i + 1)];
      const x = at[0] + drift * (i % 2 ? -0.3 : 0.4), y = at[1] - drift * 0.2;
      const s = 0.97 * (1 - 0.15 * suck);
      css(card.node, { transform: `translate(${(x + (target[0] - x) * suck).toFixed(1)}px, ${(y + (target[1] - y) * suck).toFixed(1)}px) scale(${s.toFixed(3)})`, opacity: fr < 2640 + i ? 1 : 0, filter: suck > 0.05 && suck < 0.98 ? 'blur(3px)' : 'none' });
    });
  },
};
