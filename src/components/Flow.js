// Building blocks of the blue workflow canvas (S16): a horizontal connector
// line, the buying-signal pill, the AI email card (typed text), the Gmail
// node and the multichannel sequence tree. All in WORLD coordinates
// (world = screen pixels of reference frame f2256, line at y = 543).

import { el, css } from '../engine/dom.js';
import { TextLine } from './TextLine.js';
import { logoSvg } from './Logo.js';
import { gmailSvg } from './Inbox.js';

const abs = (x, y, w, h, s = {}) => ({ position: 'absolute', left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, ...s });
export const FLOW_Y = 543;
const FRAME = (x, y, w, h, r, extra = {}) => el('div', { style: abs(x, y, w, h, { borderRadius: `${r}px`, background: 'rgba(255,255,255,0.16)', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.35)', ...extra }) });

export function SignalPill({ text, avatar }) {
  const node = el('div', { style: abs(0, 0, 0, 0) });
  node.appendChild(FRAME(-463, FLOW_Y - 61, 774, 122, 34));
  node.appendChild(el('div', { style: abs(-447, FLOW_Y - 46, 741, 92, { borderRadius: '22px', background: 'linear-gradient(180deg, #5b84f8, #4a74f2)', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.45)' }) }));
  node.appendChild(el('img', { src: avatar, style: abs(-447 + 22, FLOW_Y - 31, 62, 62, { borderRadius: '50%', boxShadow: '0 0 0 2px rgba(255,255,255,0.5)' }) }));
  const t = TextLine({ text, size: 35.5, weight: 500, color: '#ffffff' });
  css(t.node, { transform: `translate(${-447 + 96}px, ${FLOW_Y + 12}px)` });
  node.appendChild(t.node);
  return { node };
}

/** AI email card with a typing body. lines: [] of strings ('' = blank line). */
export function AiEmailCard({ lines }) {
  const node = el('div', { style: abs(0, 0, 0, 0) });
  node.appendChild(el('div', { style: abs(605, 355, 717, 377, { borderRadius: '30px', background: 'linear-gradient(135deg, rgba(196,140,255,0.55), rgba(255,255,255,0.25))', boxShadow: '0 0 40px rgba(200,120,255,0.45)' }) }));
  node.appendChild(el('div', { style: abs(622, 372, 680, 340, { borderRadius: '20px', background: '#ffffff' }) }));
  // sparkle badge
  const badge = el('div', { style: abs(962 - 46, 355 - 46, 92, 92, { borderRadius: '22px', background: '#f7f4ff', boxShadow: '0 0 0 4px rgba(214,170,255,0.7), 0 4px 14px rgba(120,80,200,0.25)' }) });
  badge.innerHTML = '<svg width="92" height="92" viewBox="0 0 92 92"><path d="M38 26 C40 38 44 42 56 44 C44 46 40 50 38 62 C36 50 32 46 20 44 C32 42 36 38 38 26 Z" fill="#8b5cf6"/><path d="M60 20 C61 26 63 28 69 29 C63 30 61 32 60 38 C59 32 57 30 51 29 C57 28 59 26 60 20 Z" fill="#8b5cf6"/><path d="M60 50 C61 55 62 56 67 57 C62 58 61 59 60 64 C59 59 58 58 53 57 C58 56 59 55 60 50 Z" fill="#8b5cf6"/></svg>';
  node.appendChild(badge);
  // lemlist badge on the connector
  node.appendChild(el('div', { style: abs(560, FLOW_Y - 42, 84, 84, { borderRadius: '20px', background: 'rgba(255,255,255,0.85)', boxShadow: '0 4px 14px rgba(40,60,160,0.2)' }) }));
  node.appendChild(el('div', { html: logoSvg(62, { radius: 14 }), style: abs(571, FLOW_Y - 31, 62, 62) }));
  const items = [];
  let y = 418;
  for (const s of lines) {
    if (s) {
      const l = TextLine({ text: s, size: 24.8, weight: 500, color: '#2a3550', split: 'char' });
      css(l.node, { transform: `translate(655px, ${y}px)` });
      node.appendChild(l.node);
      items.push(l);
    } else items.push(null);
    y += s ? 30 : 30;
  }
  let total = 0;
  const offs = items.map((l) => { const o = total; total += l ? l.items.length : 0; return o; });
  function setTyped(n, freshColor = '#4f7cff') {
    items.forEach((l, li) => {
      if (!l) return;
      l.items.forEach((it, ci) => {
        const idx = offs[li] + ci;
        css(it.node, { opacity: n > idx ? 1 : 0, color: n - idx < 2 && n < total ? freshColor : '#2a3550' });
      });
    });
  }
  return { node, setTyped, total };
}

export function GmailNode({ name, to, subject }) {
  const node = el('div', { style: abs(0, 0, 0, 0) });
  node.appendChild(FRAME(1572, 444, 584, 190, 30));
  node.appendChild(el('div', { style: abs(1586, 459, 556, 160, { borderRadius: '20px', background: '#ffffff', boxShadow: '0 6px 20px rgba(30,50,140,0.18)' }) }));
  node.appendChild(el('div', { style: abs(1611, 483, 58, 58, { borderRadius: '50%', background: '#f1f2f6' }) }));
  node.appendChild(el('div', { html: gmailSvg(34), style: abs(1623, 500, 34, 24) }));
  const n = TextLine({ text: name, size: 26, weight: 600, color: '#1f2533' }); css(n.node, { transform: 'translate(1679px, 515px)' }); node.appendChild(n.node);
  const t = TextLine({ text: to, size: 16, weight: 500, color: '#8a90a0' }); css(t.node, { transform: 'translate(1679px, 540px)' }); node.appendChild(t.node);
  const s = TextLine({ text: subject, size: 25.3, weight: 500, color: '#1f2533', split: 'char' }); css(s.node, { transform: 'translate(1610px, 582px)' }); node.appendChild(s.node);
  function setTyped(k) { s.items.forEach((it, i) => css(it.node, { opacity: k > i ? 1 : 0 })); }
  return { node, setTyped, count: s.items.length };
}

/** Sequence tree. nodes: [{ kind:'cond'|'step'|'yes'|'no'|'plus', x, y, w, h, ... , appear }] world coords. */
export function SequenceTree({ nodes, links }) {
  const node = el('div', { style: abs(0, 0, 0, 0) });
  const parts = [];
  for (const L of links) {
    const d = el('div', { style: abs(L.x, L.y, L.w || 3, L.h || 3, { background: 'rgba(225,232,255,0.9)', borderRadius: '2px' }) });
    node.appendChild(d); parts.push({ el: d, appear: L.appear, origin: L.origin || '50% 0' });
  }
  for (const N of nodes) {
    let d;
    if (N.kind === 'yes' || N.kind === 'no') {
      d = el('div', { style: abs(N.x - 38, N.y - 22, 76, 44, { borderRadius: '22px', background: N.kind === 'yes' ? '#dcfce4' : '#ffe0e4', boxShadow: `0 0 0 3px ${N.kind === 'yes' ? 'rgba(160,240,180,0.6)' : 'rgba(255,170,180,0.6)'}` }) });
      const t = TextLine({ text: N.label, size: 25, weight: 600, color: N.kind === 'yes' ? '#2fb457' : '#e5374b', align: 'center' });
      css(t.node, { transform: 'translate(38px, 31px)' }); d.appendChild(t.node);
    } else if (N.kind === 'plus') {
      d = el('div', { style: abs(N.x - 22, N.y - 22, 44, 44, { borderRadius: '50%', background: '#ffffff', boxShadow: '0 0 0 3px rgba(225,232,255,0.6)' }) });
      d.innerHTML = '<svg width="44" height="44" viewBox="0 0 44 44"><path d="M22 14 V30 M14 22 H30" stroke="#9aa3b8" stroke-width="2" stroke-linecap="round"/></svg>';
    } else if (N.kind === 'cond') {
      d = el('div', { style: abs(N.x, N.y, N.w, N.h, { borderRadius: '12px', background: '#ffffff', boxShadow: '0 4px 14px rgba(30,50,140,0.15)' }) });
      d.innerHTML = `<svg width="30" height="30" viewBox="0 0 30 30" style="position:absolute;left:20px;top:${N.h / 2 - 15}px"><circle cx="15" cy="6" r="4" fill="none" stroke="#2a3346" stroke-width="2.2"/><circle cx="7" cy="24" r="4" fill="none" stroke="#2a3346" stroke-width="2.2"/><circle cx="23" cy="24" r="4" fill="none" stroke="#2a3346" stroke-width="2.2"/><path d="M15 10 V15 M15 15 L8 20 M15 15 L22 20" stroke="#2a3346" stroke-width="2.2" fill="none"/></svg>`;
      N.lines.forEach((ln, i) => {
        const t = TextLine({ tokens: ln.map((p) => p[0]), size: 23, weight: 500, color: '#2a3346' });
        t.items.forEach((it, k) => { const part = ln.find((p) => p[0].trim() === it.text.trim()); if (part && part[1]) it.node.style.color = part[1]; });
        css(t.node, { transform: `translate(64px, ${N.h / 2 + 8 + (i - (N.lines.length - 1) / 2) * 25}px)` }); d.appendChild(t.node);
      });
    } else {
      d = el('div', { style: abs(N.x, N.y, N.w, N.h, { borderRadius: '14px', background: '#ffffff', boxShadow: '0 6px 18px rgba(30,50,140,0.16)', overflow: 'hidden' }) });
      d.appendChild(el('div', { style: abs(0, 0, N.w, 52, { background: '#f6f7fa' }) }));
      d.innerHTML += '<svg width="18" height="18" viewBox="0 0 18 18" style="position:absolute;left:24px;top:17px"><circle cx="9" cy="9" r="7" fill="none" stroke="#9aa1ad" stroke-width="1.6"/><path d="M9 5 V9 L12 11" stroke="#9aa1ad" stroke-width="1.6" fill="none"/></svg>';
      const w1 = TextLine({ tokens: ['Attendre ', `${N.wait} jour`], size: 19.5, weight: 500, color: '#3a4152' });
      w1.items[1].node.style.color = '#3f68e8';
      css(w1.node, { transform: 'translate(52px, 33px)' }); d.appendChild(w1.node);
      d.innerHTML += `<svg width="18" height="18" viewBox="0 0 18 18" style="position:absolute;right:28px;top:17px"><path d="M3 15 L4 11 L12 3 L15 6 L7 14 Z" fill="none" stroke="#9aa1ad" stroke-width="1.5"/></svg>`;
      d.appendChild(el('div', { style: abs(24, 72, 50, 50, { borderRadius: '50%', background: '#f6f7fb', boxShadow: '0 0 0 1px #eef0f5' }) }));
      d.appendChild(el('div', { style: abs(38, 86, 22, 22, { borderRadius: '6px', background: N.color || '#888', opacity: 0.85, WebkitMask: 'radial-gradient(circle, #000 55%, transparent 58%)' }) }));
      const a = TextLine({ text: N.action, size: 26.5, weight: 500, color: '#1f2533' });
      css(a.node, { transform: 'translate(96px, 106px)' }); d.appendChild(a.node);
    }
    node.appendChild(d);
    parts.push({ el: d, appear: N.appear, origin: '50% 50%' });
  }
  function set(frame) {
    for (const p of parts) {
      const k = Math.max(0, Math.min(1, (frame - p.appear) / 6));
      const e = 1 - Math.pow(1 - k, 3);
      css(p.el, { opacity: k, transform: `scale(${(0.85 + 0.15 * e).toFixed(4)})`, transformOrigin: p.origin, display: k <= 0 ? 'none' : '' });
    }
  }
  return { node, set };
}
