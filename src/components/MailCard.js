// Large dark email card of S11 ("Emilie Paris — Coucou c'est encore moi 👋").
// Local origin = card centre; scale 1 = f1548 framing (outer frame 865 x 390).
import { el, css } from '../engine/dom.js';
import { TextLine } from './TextLine.js';

const abs = (x, y, w, h, s = {}) => ({ position: 'absolute', left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, ...s });

export function MailCard({ avatar, name, email, body }) {
  const W = 865, H = 390;
  const node = el('div', { style: { position: 'absolute', left: '0', top: '0', transformStyle: 'preserve-3d' } });
  const card = el('div', { style: abs(-W / 2, -H / 2, W, H, { borderRadius: '34px', background: '#2c2a35', boxShadow: '0 30px 60px rgba(0,0,0,0.35)' }) });
  const win = el('div', { style: abs(14, 14, W - 28, H - 28, { borderRadius: '24px', background: '#121117', overflow: 'hidden' }) });
  card.appendChild(win);
  win.appendChild(el('div', { style: abs(0, 0, W - 28, 92, { background: '#0e0d12' }) }));
  [['#e0444f', 68], ['#f3b23f', 103], ['#46ad54', 137]].forEach(([c, x]) => win.appendChild(el('div', { style: abs(x - 14 - 10.5, 52 - 14 - 10.5 + 0, 21, 21, { borderRadius: '50%', background: c }) })));
  win.appendChild(el('img', { src: avatar, style: abs(96 - 14 - 36, 172 - 14 - 36, 72, 72, { borderRadius: '50%' }) }));
  const n = TextLine({ text: name, size: 28.4, weight: 600, color: '#ffffff' });
  css(n.node, { transform: `translate(${148 - 14}px, ${188 - 14}px)` }); win.appendChild(n.node);
  const m = TextLine({ text: email, size: 18, weight: 500, color: '#8c8a9c' });
  css(m.node, { transform: `translate(${328 - 14}px, ${196 - 14}px)` }); win.appendChild(m.node);
  win.appendChild(el('div', { style: abs(666 - 14, 205 - 14, 112, 8, { borderRadius: '4px', background: '#f2f2f6' }) }));
  const b = TextLine({ text: body, size: 25.5, weight: 500, color: '#f4f4f8' });
  css(b.node, { transform: `translate(${54 - 14}px, ${292 - 14}px)` }); win.appendChild(b.node);
  node.appendChild(card);
  function set({ x = 960, y = 870, scale = 1, rot = 0, rx = 0, ry = 0, blur = 0, opacity = 1 } = {}) {
    css(node, {
      transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotateZ(${rot.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${scale.toFixed(4)})`,
      filter: blur > 0.1 ? `blur(${blur.toFixed(2)}px)` : 'none', opacity, display: opacity <= 0.001 ? 'none' : '',
    });
  }
  return { node, set, W, H };
}
