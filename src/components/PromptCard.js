// White "Bonjour Victor, que voulez-vous faire ?" prompt card (S13–S14).
// Coordinates = screen pixels of reference frame f1880 (card 465–1451 x 490–931).
import { el, css } from '../engine/dom.js';
import { TextLine } from './TextLine.js';

const abs = (x, y, w, h, s = {}) => ({ position: 'absolute', left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, ...s });

export function PromptCard({ title, placeholder, button }) {
  const node = el('div', { style: { position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px', transformOrigin: '0 0' } });
  node.appendChild(el('div', { style: abs(455, 480, 1006, 461, { borderRadius: '36px', background: 'rgba(225,231,250,0.6)' }) }));
  node.appendChild(el('div', { style: abs(465, 490, 986, 441, { borderRadius: '28px', background: '#ffffff', boxShadow: '0 10px 30px rgba(60,80,160,0.08)' }) }));
  const t = TextLine({ text: title, size: 29.1, weight: 700, color: '#1f2a44', align: 'center' });
  css(t.node, { transform: 'translate(959px, 582px)' });
  node.appendChild(t.node);
  node.appendChild(el('div', { style: abs(551, 629, 816, 236, { borderRadius: '14px', border: '1.5px solid #e3e6ee', background: '#ffffff' }) }));
  const ph = TextLine({ text: placeholder, size: 16.3, weight: 500, color: '#6c7385' });
  css(ph.node, { transform: 'translate(578px, 672px)' });
  node.appendChild(ph.node);
  const btn = el('div', { style: abs(1208, 783, 132, 54, { borderRadius: '9px', background: '#3a64f3' }) });
  const bl = TextLine({ text: button, size: 17.4, weight: 600, color: '#ffffff', align: 'center' });
  css(bl.node, { transform: 'translate(66px, 33px)' });
  btn.appendChild(bl.node);
  node.appendChild(btn);
  return { node, placeholder: ph, button: btn };
}
