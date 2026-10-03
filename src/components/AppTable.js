// English lemlist app table shown at the bottom of the outro (S20), redrawn in
// HTML. Coordinates = screen pixels of f2865 (panel 128–1800, top 794).
import { el, css } from '../engine/dom.js';
import { TextLine } from './TextLine.js';

const abs = (x, y, w, h, s = {}) => ({ position: 'absolute', left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, ...s });

export function AppTable({ data }) {
  const node = el('div', { style: abs(0, 0, 1920, 1080, { transformOrigin: '0 0' }) });
  const panel = el('div', { style: abs(128, 794, 1672, 600, { borderRadius: '22px', background: '#ffffff', boxShadow: '0 -4px 30px rgba(60,80,160,0.08)', overflow: 'hidden' }) });
  node.appendChild(panel);
  const T = (s, x, y, size, w, color, opt = {}) => { const l = TextLine({ text: s, size, weight: w, color, ...opt }); css(l.node, { transform: `translate(${x - 128}px, ${y - 794}px)` }); panel.appendChild(l.node); return l; };
  // sidebar
  panel.appendChild(el('div', { style: abs(502 - 128, 0, 1.5, 600, { background: '#eef0f4' }) }));
  T('People', 156, 844, 17, 500, '#1f2533'); panel.appendChild(el('div', { style: abs(148 - 128, 870 - 794, 70, 2, { background: '#1f2533' }) }));
  T('Companies', 240, 844, 17, 500, '#6a7180'); T('+  +  +', 388, 844, 22, 400, '#4a5160');
  data.sidebar.forEach((s, i) => {
    const y = 908 + 54 * i;
    panel.appendChild(el('div', { style: abs(150 - 128, y - 22 - 794, 336, 44, { borderRadius: '8px', border: '1.5px solid #eceef3' }) }));
    T(s, 162, y + 6, 17, 500, '#2a3040');
  });
  // tabs + headers
  let x = 540;
  for (const [label, n, close] of data.tabs) {
    const l = T(label, x, 838, 17, 500, close ? '#1f2533' : '#8a90a0');
    panel.appendChild(el('div', { style: abs(x + l.advance + 8 - 128, 822 - 794, n.length * 9 + 12, 22, { borderRadius: '5px', background: '#eef0f4' }) }));
    T(n, x + l.advance + 14, 838, 13, 500, '#7d8494');
    if (close) T('×', x + l.advance + n.length * 9 + 30, 838, 18, 400, '#8a90a0');
    x += l.advance + n.length * 9 + (close ? 70 : 52);
  }
  panel.appendChild(el('div', { style: abs(510 - 128, 856 - 794, 1300, 1.5, { background: '#eef0f4' }) }));
  for (const [h, hx] of data.headers) T(h, hx, 882, 15, 500, '#8a90a0');
  panel.appendChild(el('div', { style: abs(510 - 128, 900 - 794, 1300, 1.5, { background: '#eef0f4' }) }));
  data.rows.forEach((r, i) => {
    const y = 932 + 68 * i;
    panel.appendChild(el('div', { style: abs(548 - 128, y - 9 - 794, 18, 18, { borderRadius: '4px', border: '1.5px solid #dfe3ea' }) }));
    panel.appendChild(el('div', { style: abs(574 - 128, y - 15 - 794, 30, 30, { borderRadius: '50%', background: `radial-gradient(circle at 50% 38%, #e3b591 0 32%, ${r.hair} 33% 60%, #c9ced8 61%)` }) }));
    T(r.name, 620, y + 6, 17.5, 500, '#1f2533');
    panel.appendChild(el('div', { style: abs(822 - 128, y - 9 - 794, 18, 18, { borderRadius: '3px', background: r.li ? '#2f63d8' : '#9aa1ad' }) }));
    const chip = (label, cx) => {
      const l = T(label, cx + 14, y + 5, 12.5, 700, '#3f68e8', { letterSpacing: 0.04 });
      panel.insertBefore(el('div', { style: abs(cx - 128, y - 14 - 794, l.advance + 28, 28, { borderRadius: '14px', background: '#edf2ff', border: '1.5px solid #c9d6fb' }) }), l.node);
    };
    if (r.email.startsWith('FIND')) chip(r.email, 876); else T(r.email, 878, y + 6, 17, 500, r.email.startsWith('No') ? '#8a90a0' : '#4a5160');
    if (r.phone.startsWith('FIND')) chip(r.phone, 1094); else T(r.phone, 1096, y + 6, 17, 500, '#2a3040');
    panel.appendChild(el('div', { style: abs(1310 - 128, y - 11 - 794, 22, 22, { borderRadius: '3px', background: r.logo }) }));
    const c = T(r.company, 1342, y + 6, 17, 500, '#1f2533');
    panel.appendChild(el('div', { style: abs(1342 - 128, y + 9 - 794, Math.min(c.advance, 166), 1.2, { background: '#1f2533' }) }));
    T(r.job, 1552, y + 6, 17, 500, '#2a3040');
  });
  return { node };
}
