// lemlist leads table (S15), laid out FLAT in "table coordinates" = screen
// pixels of the front-facing frame f2110. Columns extend to the left of the
// screen (x < 0) because only the right part is visible in that framing.
// The scene places it in perspective with a homography (see engine/homography.js).
//
// Avatars/logos: simplified placeholders (the originals are tiny photos/brand
// marks seen in steep perspective, not extractable cleanly).

import { el, css } from '../engine/dom.js';
import { TextLine } from './TextLine.js';

export const TABLE = {
  rowY: [538, 644, 762, 878, 994, 1110, 1226, 1342, 1458],
  x: { left: -600, check: -560, avatar: -488, name: -443, linkedin: -117, email: -47, sep1: -130, sep2: 250, phone: 312, sep3: 668, pill: 702, signal: 778, sep4: 1376, logo: 1440, company: 1496, right: 1520 },
  top: 300, tabsBase: 362, headBase: 434,
};

const abs = (x, y, w, h, s = {}) => ({ position: 'absolute', left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, ...s });
const DOT = { purple: '#b9a3f2', red: '#ef7a85', yellow: '#e4b82a', pink: '#e8476a', blue: '#9db3f0', green: '#7ad8a0', orange: '#f08a6e', indigo: '#6f7ff0' };

function text(parent, s, x, y, size, weight, color, opts = {}) {
  const l = TextLine({ text: s, size, weight, color, ...opts });
  css(l.node, { transform: `translate(${x}px, ${y}px)` });
  parent.appendChild(l.node);
  return l;
}
function chip(parent, label, x, y) {
  const box = el('div', { style: abs(x, y - 20, 10, 40, { borderRadius: '20px', background: '#edf2ff', border: '2px solid #bccdfa' }) });
  parent.appendChild(box);
  const l = text(parent, label, 0, y + 7.5, 21.3, 700, '#3f68e8', { letterSpacing: 0.04 });
  const w = l.advance + 40;
  css(box, { width: `${w.toFixed(1)}px` });
  css(l.node, { transform: `translate(${(x + 20).toFixed(1)}px, ${(y + 7.5).toFixed(1)}px)` });
}

export function LeadsTable({ rows, tabs, headers }) {
  const X = TABLE.x;
  const node = el('div', { style: { position: 'absolute', left: '0', top: '0', width: '0', height: '0', clipPath: `polygon(${X.left}px ${TABLE.top}px, ${X.right}px ${TABLE.top}px, ${X.right}px 1900px, ${X.left}px 1900px)` } });
  node.appendChild(el('div', { style: abs(X.left, TABLE.top, X.right - X.left, 1500, { borderRadius: '28px', background: '#ffffff', boxShadow: '0 20px 60px rgba(60,80,160,0.10)' }) }));
  node.appendChild(el('div', { style: abs(X.left, TABLE.top, X.right - X.left, 92, { borderRadius: '28px 28px 0 0', background: '#fafbfd' }) }));
  // tabs
  let tx = -509;
  for (const [label, count, close] of tabs) {
    const l = text(node, label, tx, TABLE.tabsBase, 29, 500, '#6a7180');
    const w = l.advance;
    node.appendChild(el('div', { style: abs(tx + w + 12, TABLE.tabsBase - 25, count.length * 13 + 18, 30, { borderRadius: '7px', background: '#eef0f4' }) }));
    text(node, count, tx + w + 21, TABLE.tabsBase - 4, 19, 500, '#7d8494');
    if (close) text(node, '×', tx + w + count.length * 13 + 44, TABLE.tabsBase, 26, 400, '#8b92a0');
    tx += w + count.length * 13 + (close ? 100 : 60);
  }
  node.appendChild(el('div', { style: abs(X.left, 392, X.right - X.left, 1.5, { background: '#edf0f5' }) }));
  // column headers
  for (const [label, x] of headers) {
    node.appendChild(el('div', { html: '<svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="9" fill="none" stroke="#9aa1ad" stroke-width="1.6"/><circle cx="8" cy="9" r="1.2" fill="#9aa1ad"/><circle cx="14" cy="9" r="1.2" fill="#9aa1ad"/><path d="M7 13 Q11 16 15 13" stroke="#9aa1ad" stroke-width="1.4" fill="none"/></svg>', style: abs(x - 34, TABLE.headBase - 19, 22, 22) }));
    text(node, label, x, TABLE.headBase, 25.2, 500, '#7d8494');
  }
  node.appendChild(el('div', { style: abs(X.left, 470, X.right - X.left, 1.5, { background: '#edf0f5' }) }));
  for (const sx of [X.sep1, X.sep2, X.sep3, X.sep4]) node.appendChild(el('div', { style: abs(sx, 392, 1.5, 1300, { background: '#eef1f6' }) }));
  const pills = [];
  rows.forEach((r, i) => {
    const y = TABLE.rowY[i];
    if (i > 0) node.appendChild(el('div', { style: abs(X.left, y - 58, X.right - X.left, 1.5, { background: '#f0f2f6' }) }));
    node.appendChild(el('div', { style: abs(X.check - 11, y - 11, 22, 22, { borderRadius: '5px', border: '1.6px solid #dfe3ea' }) }));
    node.appendChild(el('div', { style: abs(X.avatar - 20, y - 20, 40, 40, { borderRadius: '50%', background: `radial-gradient(circle at 50% 38%, ${r.skin || '#d9a98a'} 0 34%, ${r.hair || '#3a2a22'} 35% 60%, #c9ced8 61%)` }) }));
    text(node, r.name, X.name, y + 10, 29, 500, '#1f2533');
    node.appendChild(el('div', { html: '<svg width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" rx="3" fill="#2f63d8"/><text x="12" y="17" font-size="13" font-weight="700" fill="#fff" text-anchor="middle" font-family="Inter">in</text></svg>', style: abs(X.linkedin - 12, y - 12, 24, 24) }));
    if (r.email === 'TROUVER E-MAIL') chip(node, r.email, X.email - 10, y); else text(node, r.email, X.email, y + 10, 29, 500, r.email.startsWith('Aucun') ? '#9aa0ab' : '#4a5160');
    if (r.phone === 'TROUVER TÉLÉPHONE') chip(node, r.phone, X.phone - 10, y); else text(node, r.phone, X.phone, y + 10, 29, 500, r.phone.startsWith('Aucun') ? '#9aa0ab' : '#2a3040');
    const pill = el('div', { style: abs(X.pill, y - 28, 10, 56, { borderRadius: '12px', background: '#ffffff', border: '1.5px solid #e6e9f0', boxShadow: '0 2px 6px rgba(40,50,90,0.04)' }) });
    node.appendChild(pill);
    node.appendChild(el('div', { style: abs(X.pill + 30 - 8, y - 8, 16, 16, { borderRadius: '50%', background: DOT[r.dot] || '#ccc' }) }));
    const st = text(node, r.signal, X.signal, y + 10, 29, 500, '#262c3a');
    const pillW = X.signal - X.pill + st.advance + 26;
    css(pill, { width: `${pillW.toFixed(1)}px` });
    pills.push({ pill, text: st, w: pillW, y });
    node.appendChild(el('div', { style: abs(X.logo - 16, y - 16, 32, 32, { borderRadius: '4px', background: r.logoColor || '#111' }) }));
    text(node, r.company, X.company, y + 10, 29, 500, '#1f2533');
  });
  // highlighted signal (row 1): blue pill with avatar, glow
  const hl = el('div', { style: abs(X.pill - 2, TABLE.rowY[0] - 30, 640, 62, { borderRadius: '14px', background: 'linear-gradient(90deg, #3f6cf2, #3d63ea)', boxShadow: '0 0 0 rgba(70,110,255,0)' }) });
  hl.appendChild(el('img', { src: '../assets/images/avatar-woman.png', style: abs(14, 13, 36, 36, { borderRadius: '50%' }) }));
  const hlt = TextLine({ text: rows[0].signal, size: 29.8, weight: 500, color: '#ffffff' });
  css(hlt.node, { transform: 'translate(64px, 41px)' });
  hl.appendChild(hlt.node);
  node.appendChild(hl);
  return { node, highlight: hl, pills };
}
