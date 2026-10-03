// Light "new email" window of S06 (Victor -> prospect).
// Local origin (0, 0) = centre of the dark underline; scale 1 = layout of f430
// (underline 527 px long). All offsets below were measured on f430.
//
//   const c = EmailComposer({ text, avatar, sender, email });
//   c.set({ x, y, scale, rot, chars, button: 0..1 (grey -> blue), freshColor })

import { el, css } from '../engine/dom.js';
import { mixColor, clamp } from '../engine/anim.js';
import { TextLine } from './TextLine.js';

const abs = (x, y, w, h, s = {}) => ({ position: 'absolute', left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, ...s });

export function EmailComposer({ lines, sender = 'Victor', email = 'Victor@gmail.com', avatar, bigAvatar, textColor = '#2c3650', freshColor = '#8193de' }) {
  const node = el('div', { style: { position: 'absolute', left: '0', top: '0', transformOrigin: '0 0' } });
  // frosted bezel + white window
  node.appendChild(el('div', { style: abs(-308.5, -281, 620, 420, { borderRadius: '26px', background: 'rgba(236,240,252,0.6)', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.95), 0 12px 40px rgba(60,80,160,0.07)' }) }));
  const win = el('div', { style: abs(-298.5, -271, 595, 398, { borderRadius: '18px', background: '#ffffff', overflow: 'hidden', boxShadow: '0 2px 10px rgba(40,50,100,0.06)' }) });
  node.appendChild(win);
  win.appendChild(el('div', { style: abs(0, 0, 595, 52, { background: '#f7f8fb' }) }));
  [['#e0414f', -262.5], ['#f4b63f', -236.5], ['#4caf50', -211.5]].forEach(([c, x]) => {
    win.appendChild(el('div', { style: abs(x + 298.5 - 7, -243 + 271 - 7, 14, 14, { borderRadius: '50%', background: c }) }));
  });
  const L = (x, y) => [x + 298.5, y + 271];
  const [ax, ay] = L(-237.5 - 27, -159 - 27);
  win.appendChild(el('img', { src: avatar, style: abs(ax, ay, 54, 54, { borderRadius: '50%' }) }));
  const name = TextLine({ text: sender, size: 20.8, weight: 600, color: '#2a3449' });
  css(name.node, { transform: `translate(${L(-198.5, -151)[0]}px, ${L(-198.5, -151)[1]}px)` });
  win.appendChild(name.node);
  const mail = TextLine({ text: email, size: 13.3, weight: 500, color: '#6b7385' });
  css(mail.node, { transform: `translate(${L(-35.5, -154)[0]}px, ${L(-35.5, -154)[1]}px)` });
  win.appendChild(mail.node);
  win.appendChild(el('div', { style: abs(L(181.5, 0)[0], L(0, -161)[1], 80, 6, { borderRadius: '3px', background: '#eceef3' }) }));
  // body text, two lines, typed character by character
  const bodyLines = lines.map((s, i) => {
    const l = TextLine({ text: s, size: 19.1, weight: 400, color: textColor, split: 'char' });
    css(l.node, { transform: `translate(${L(-265.5, 0)[0]}px, ${L(0, i === 0 ? -74 : -43)[1]}px)` });
    win.appendChild(l.node);
    return l;
  });
  win.appendChild(el('div', { style: abs(L(-263.5, 0)[0], L(0, -0.75)[1], 527, 1.5, { background: '#23293a' }) }));
  const btn = el('div', { style: abs(L(-125.5, 0)[0], L(0, 34)[1], 250, 58, { borderRadius: '9px', background: '#e8e9ee' }) });
  const btnLabel = TextLine({ text: 'Envoyer', size: 20.9, weight: 600, color: '#ffffff', align: 'center' });
  css(btnLabel.node, { transform: 'translate(125px, 37px)' });
  btn.appendChild(btnLabel.node);
  win.appendChild(btn);
  // prospect avatar above the window (white ring)
  const big = el('img', { src: bigAvatar, style: abs(-1.5 - 56, -306 - 56, 112, 112, { borderRadius: '50%', boxShadow: '0 0 0 3px rgba(255,255,255,0.9), 0 6px 18px rgba(30,30,60,0.18)' }) });
  node.appendChild(big);
  const chars = lines.map((s) => [...s].length);

  function set({ x = 960, y = 540, scale = 1, rot = 0, rx = 0, ry = 0, typed = 1e9, fresh = 2, button = 0, opacity = 1 } = {}) {
    css(node, { transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotateZ(${rot.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${scale.toFixed(4)})`, opacity });
    let k = 0;
    bodyLines.forEach((l, li) => {
      l.items.forEach((it) => {
        const idx = k + it.start;
        const vis = clamp(typed - idx);
        const age = typed - idx; // chars typed since
        css(it.node, { opacity: vis, color: age < fresh + 1 ? freshColor : textColor });
      });
      k += chars[li] + 1; // +1 for the (invisible) line-break space
    });
    css(btn, { background: mixColor('#e8e9ee', '#8b9fe8', clamp(button)) });
  }
  return { node, set, totalChars: chars[0] + 1 + chars[1] };
}
