// Small "reply" message cards of S20 (LinkedIn / WhatsApp / Gmail replies),
// 556 x 186 px at scale 1 (f2547 framing), plus the tall LinkedIn
// conversation card that opens the scene.
import { el, css } from '../engine/dom.js';
import { TextLine } from './TextLine.js';
import { gmailSvg } from './Inbox.js';

const abs = (x, y, w, h, s = {}) => ({ position: 'absolute', left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, ...s });
const ICON = {
  linkedin: (s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 18 18"><rect width="18" height="18" rx="3" fill="#c2913b"/><text x="9" y="13.5" font-size="11" font-weight="700" fill="#fff" text-anchor="middle" font-family="Inter">in</text></svg>`,
  whatsapp: (s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 18 18"><rect width="18" height="18" rx="4" fill="#3fc35b"/><circle cx="9" cy="9" r="5" fill="none" stroke="#fff" stroke-width="1.6"/></svg>`,
  gmail: (s = 18) => gmailSvg(s),
};

export function ReplyCard({ name, channel = 'linkedin', lines = [], avatarColor = '#c9a27e', bars = 0 }) {
  const node = el('div', { style: abs(0, 0, 0, 0) });
  node.appendChild(el('div', { style: abs(-10, -10, 576, 206, { borderRadius: '26px', background: 'rgba(255,255,255,0.22)', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.45)' }) }));
  node.appendChild(el('div', { style: abs(0, 0, 556, 186, { borderRadius: '18px', background: '#ffffff', boxShadow: '0 8px 24px rgba(30,50,140,0.18)' }) }));
  node.appendChild(el('div', { style: abs(22, 18, 48, 48, { borderRadius: '50%', background: `radial-gradient(circle at 50% 36%, #e8c3a5 0 30%, ${avatarColor} 31% 58%, #7d8aa8 59%)` }) }));
  const n = TextLine({ text: name, size: 20, weight: 600, color: '#1f2533' });
  css(n.node, { transform: 'translate(84px, 49px)' }); node.appendChild(n.node);
  node.appendChild(el('div', { html: ICON[channel](18), style: abs(84 + n.advance + 10, 34, 18, 18) }));
  lines.forEach((s, i) => {
    if (!s) return;
    const l = TextLine({ text: s, size: 18.5, weight: 500, color: '#1f2533' });
    css(l.node, { transform: `translate(${i === 0 ? 84 : 84}px, ${86 + 23 * i}px)` }); node.appendChild(l.node);
  });
  for (let i = 0; i < bars; i++) node.appendChild(el('div', { style: abs(84 + (i % 2) * 0, 92 + 22 * i, i === 0 ? 260 : 180, 9, { borderRadius: '5px', background: '#e7eaf1' }) }));
  return { node };
}

/** Tall LinkedIn conversation card (S20 opening). Local origin = top-left of the white card (544 px wide). */
export function LinkedInThread({ header, messages, avatar }) {
  const node = el('div', { style: abs(0, 0, 0, 0) });
  const frame = el('div', { style: abs(-16, -16, 576, 576, { borderRadius: '30px', background: 'rgba(255,255,255,0.25)', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.5)' }) });
  const card = el('div', { style: abs(0, 0, 544, 544, { borderRadius: '20px', background: '#ffffff', overflow: 'hidden' }) });
  node.append(frame, card);
  const head = el('div', { style: abs(0, 0, 544, 80) });
  const hn = TextLine({ text: header, size: 21, weight: 600, color: '#1f2533' }); css(hn.node, { transform: 'translate(79px, 41px)' }); head.appendChild(hn.node);
  head.appendChild(el('div', { style: abs(79, 56, 80, 6, { borderRadius: '3px', background: '#e3e6ee' }) }));
  head.appendChild(el('div', { html: '<svg width="76" height="62" viewBox="0 0 76 62"><rect x="1" y="-20" width="74" height="80" rx="16" fill="#e8f0fb"/><rect x="9" y="-12" width="58" height="62" rx="12" fill="#2a66c8"/><text x="38" y="38" font-size="26" font-weight="700" fill="#fff" text-anchor="middle" font-family="Inter">in</text></svg>', style: abs(224, -6, 76, 62) }));
  head.appendChild(el('div', { html: '<svg width="70" height="20" viewBox="0 0 70 20"><circle cx="6" cy="10" r="2.2" fill="#2a3040"/><circle cx="13" cy="10" r="2.2" fill="#2a3040"/><circle cx="20" cy="10" r="2.2" fill="#2a3040"/><path d="M44 4 L56 16 M56 4 L44 16" stroke="#2a3040" stroke-width="2"/></svg>', style: abs(462, 30, 70, 20) }));
  card.appendChild(head);
  const body = el('div', { style: abs(0, 0, 544, 900) });
  card.appendChild(body);
  let y = 0;
  for (const m of messages) {
    if (m.avatar) body.appendChild(el('img', { src: avatar, style: abs(19, y - 9, 50, 50, { borderRadius: '50%', boxShadow: '0 0 0 3px #e6ecff' }) }));
    const nm = TextLine({ text: m.name, size: 20.5, weight: 600, color: '#2a3346' }); css(nm.node, { transform: `translate(79px, ${y + 8}px)` }); body.appendChild(nm.node);
    body.appendChild(el('div', { style: abs(79 + nm.advance + 26, y, 95, 6, { borderRadius: '3px', background: '#e3e6ee' }) }));
    y += 31;
    for (const s of m.lines) {
      if (s) { const l = TextLine({ text: s, size: 20.2, weight: 500, color: '#2a3346' }); css(l.node, { transform: `translate(79px, ${y + 8}px)` }); body.appendChild(l.node); }
      y += s ? 25 : 24;
    }
    y += 18;
  }
  /** headerOpacity, scroll (px content moved up), clipTop (px hidden from the top of the card). */
  function set({ headerOpacity = 1, scroll = 0, clipTop = 0, bodyTop = 113 } = {}) {
    css(head, { opacity: headerOpacity });
    css(body, { transform: `translateY(${(bodyTop - scroll).toFixed(1)}px)` });
    css(card, { clipPath: `inset(${clipTop.toFixed(1)}px 0 0 0 round 20px)` });
    css(frame, { clipPath: `inset(${clipTop.toFixed(1)}px 0 0 0 round 30px)` });
  }
  return { node, set };
}
