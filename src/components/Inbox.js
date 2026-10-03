// Dark Gmail-like inbox of S07 (rest layout = screen pixels of f640) and the
// dark email popup that lands on it. Colours sampled on f640.
//
//   const w = InboxWindow({ rows: 7, label, unread });
//   w.setRow(i, { selected: 0..1, pop: 0..1, visible: 0..1 })

import { el, css } from '../engine/dom.js';
import { mixColor, clamp } from '../engine/anim.js';
import { TextLine } from './TextLine.js';

const abs = (x, y, w, h, s = {}) => ({ position: 'absolute', left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, ...s });

/** Multicolour Gmail "M" (simplified redraw). */
export function gmailSvg(w = 34) {
  const h = w * 24 / 34;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 34 24" style="display:block">
    <path d="M2 24 V5 L9 10 V24 Z" fill="#4285f4"/><path d="M25 24 V10 L32 5 V24 Z" fill="#34a853"/>
    <path d="M25 10 V3 L28.5 0.6 A2.6 2.6 0 0 1 32 3 V5 Z" fill="#fbbc04"/>
    <path d="M2 5 V3 A2.6 2.6 0 0 1 5.5 0.6 L17 9 L28.5 0.6 L25 3 V10 L17 16 L9 10 V3 Z" fill="#ea4335"/>
    <path d="M2 5 L9 10 V3 L5.5 0.6 A2.6 2.6 0 0 0 2 3 Z" fill="#c5221f"/></svg>`;
}

export const ROW_Y = [383, 447, 511, 575, 638, 703, 767]; // row centres at rest

export function InboxWindow({ label = 'Découvrez notre solution', unread = '52 E-mails non lus' } = {}) {
  const node = el('div', { style: abs(0, 0, 1920, 1080, { transformOrigin: '0 0' }) });
  // glow + gradient border (red sides, greyish top) + body
  node.appendChild(el('div', { style: abs(386, 174, 1152, 642, { borderRadius: '30px', boxShadow: '0 0 60px 6px rgba(225, 50, 80, 0.22), 0 30px 80px rgba(0,0,0,0.35)' }) }));
  node.appendChild(el('div', { style: abs(386, 174, 1152, 642, { borderRadius: '30px', background: 'linear-gradient(90deg, #e0465f 0%, #6b3646 12%, #3a3443 35%, #3a3443 65%, #6b3646 88%, #e0465f 100%)' }) }));
  node.appendChild(el('div', { style: abs(388, 176, 1148, 638, { borderRadius: '28px', background: '#2b2934' }) }));
  const win = el('div', { style: abs(396, 184, 1132, 622, { borderRadius: '22px', background: '#131218', overflow: 'hidden' }) });
  node.appendChild(win);
  win.appendChild(el('div', { style: abs(0, 0, 1132, 42, { background: '#0f0e13' }) }));
  [['#e0444f', 423], ['#e9b33c', 443], ['#43a95a', 463]].forEach(([c, x]) => win.appendChild(el('div', { style: abs(x - 396 - 5.5, 205 - 184 - 5.5, 11, 11, { borderRadius: '50%', background: c }) })));
  win.appendChild(el('div', { html: gmailSvg(34), style: abs(416 - 396, 247 - 184, 34, 24) }));
  win.appendChild(el('div', { style: abs(464 - 396, 257 - 184, 112, 6, { borderRadius: '3px', background: '#2f2d3a' }) }));
  const un = TextLine({ text: unread, size: 15.4, weight: 600, color: '#e3475b', align: 'right' });
  css(un.node, { transform: `translate(${1505 - 396}px, ${260 - 184}px)` });
  win.appendChild(un.node);
  const rows = ROW_Y.map((y) => {
    const r = el('div', { style: abs(417 - 396, y - 25 - 184, 1088, 50, { borderRadius: '9px', border: '1px solid #26242f', background: '#141319', transformOrigin: '30% 50%' }) });
    const cb = el('div', { style: abs(437 - 418, 25 - 7.5 - 1, 13, 13, { borderRadius: '2.5px', border: '1.5px solid #3b3944' }) });
    const tl = TextLine({ text: label, size: 15.5, weight: 600, color: '#f6f5f8' });
    css(tl.node, { transform: `translate(${461 - 418}px, ${30.5}px)` });
    const b1 = el('div', { style: abs(668 - 418, 25 - 4.5 - 1, 41, 9, { borderRadius: '4.5px', background: '#6d6677' }) });
    const b2 = el('div', { style: abs(717 - 418, 25 - 4.5 - 1, 243, 9, { borderRadius: '4.5px', background: '#33323b' }) });
    const p = el('div', { style: abs(1449 - 418, 25 - 3.5 - 1, 41, 7, { borderRadius: '3.5px', background: '#ffffff' }) });
    r.append(cb, tl.node, b1, b2, p);
    win.appendChild(r);
    return { r, cb, b1, b2, p };
  });
  function setRow(i, { selected = 0, pop = 0, visible = 1, dy = 0 } = {}) {
    const R = rows[i]; const s = clamp(selected);
    css(R.r, {
      background: mixColor('#141319', '#2b0d17', s), borderColor: mixColor('#26242f', '#5a1c2c', s),
      transform: `translateY(${dy}px) scale(${(1 + 0.012 * pop).toFixed(4)}, ${(1 + 0.02 * pop).toFixed(4)})`, opacity: visible, display: visible <= 0 ? 'none' : '',
    });
    css(R.cb, { background: s > 0.5 ? '#d8353a' : 'transparent', borderColor: s > 0.5 ? '#d8353a' : '#3b3944' });
    css(R.b1, { background: mixColor('#6d6677', '#7b5c6b', s) });
    css(R.b2, { background: mixColor('#33323b', '#462a38', s) });
    css(R.p, { background: mixColor('#ffffff', '#ffe1eb', s) });
  }
  return { node, setRow, rows };
}

/** Dark email popup (Victor) with "Supprimer" / "Répondre". Local origin = card centre. */
export function DarkEmailPopup({ avatar, lines, sender = 'Victor', email = 'Victor@gmail.com' }) {
  const W = 300, H = 210;
  const node = el('div', { style: { position: 'absolute', left: '0', top: '0', transformStyle: 'preserve-3d' } });
  const card = el('div', { style: abs(-W / 2, -H / 2, W, H, { borderRadius: '14px', background: '#16151b', border: '1.5px solid #34323d', boxShadow: '0 18px 40px rgba(0,0,0,0.55)' }) });
  node.appendChild(card);
  card.appendChild(el('div', { style: abs(0, 0, W, 28, { background: '#111015', borderRadius: '13px 13px 0 0' }) }));
  [['#e0444f', 14], ['#e9b33c', 26], ['#43a95a', 38]].forEach(([c, x]) => card.appendChild(el('div', { style: abs(x - 3.5, 12, 7, 7, { borderRadius: '50%', background: c }) })));
  card.appendChild(el('div', { style: abs(232, 13, 42, 3, { borderRadius: '2px', background: '#e8e8ee' }) }));
  card.appendChild(el('img', { src: avatar, style: abs(14, 40, 22, 22, { borderRadius: '50%' }) }));
  const n = TextLine({ text: sender, size: 10.5, weight: 600, color: '#f2f2f6' });
  css(n.node, { transform: 'translate(42px, 55px)' }); card.appendChild(n.node);
  const m = TextLine({ text: email, size: 6.5, weight: 500, color: '#7d7a88' });
  css(m.node, { transform: 'translate(90px, 54px)' }); card.appendChild(m.node);
  lines.forEach((s, i) => {
    const l = TextLine({ text: s, size: 9.2, weight: 500, color: '#eeeef3' });
    css(l.node, { transform: `translate(14px, ${86 + 13 * i}px)` }); card.appendChild(l.node);
  });
  card.appendChild(el('div', { style: abs(14, 112, 272, 1, { background: '#2c2a34' }) }));
  const b1 = el('div', { style: abs(14, 148, 118, 30, { borderRadius: '6px', background: '#24232c' }) });
  const t1 = TextLine({ text: 'Supprimer', size: 10.5, weight: 600, color: '#e9e9ef', align: 'center' }); css(t1.node, { transform: 'translate(59px, 19px)' }); b1.appendChild(t1.node);
  const b2 = el('div', { style: abs(146, 146, 128, 30, { borderRadius: '6px', background: '#4d74e6' }) });
  const t2 = TextLine({ text: 'Répondre', size: 10.5, weight: 600, color: '#ffffff', align: 'center' }); css(t2.node, { transform: 'translate(64px, 19px)' }); b2.appendChild(t2.node);
  card.append(b1, b2);
  return { node, W, H };
}
