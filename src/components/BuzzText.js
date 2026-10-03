// "bzzzz" lettering: Inter Bold, grey gradient (light top -> dark bottom),
// slight perspective (the word recedes to the right and fades out), as in S10.
//   const b = BuzzText({ text: 'bzzzz' });  b.set({ x, y, width, rot, opacity, blur })
//   (x, y) = centre of the word, width = rendered ink width in px.

import { el, css } from '../engine/dom.js';
import { TextLine } from './TextLine.js';

export function BuzzText({ text = 'bzzzz', size = 100, ry = -28 } = {}) {
  const line = TextLine({ text, size, weight: 700, color: '#8a879e', align: 'center' });
  for (const it of line.items) {
    Object.assign(it.node.style, {
      color: 'transparent', backgroundImage: 'linear-gradient(180deg, #a9a6bd 0%, #85829a 45%, #4a4860 85%)', WebkitBackgroundClip: 'text', backgroundClip: 'text',
      WebkitMaskImage: 'linear-gradient(90deg, #000 0%, #000 45%, rgba(0,0,0,0.25) 100%)', maskImage: 'linear-gradient(90deg, #000 0%, #000 45%, rgba(0,0,0,0.25) 100%)',
    });
  }
  const inkW = line.inkBox.right - line.inkBox.left;
  const cy = (line.inkBox.top + line.inkBox.bottom) / 2;
  css(line.node, { transform: `translate(0px, ${(-cy).toFixed(2)}px)` });
  const persp = el('div', { style: { position: 'absolute', left: '0', top: '0', perspective: `${size * 6}px`, transformStyle: 'preserve-3d' } });
  const inner = el('div', { style: { position: 'absolute', left: '0', top: '0', transform: `rotateY(${ry}deg)`, transformStyle: 'preserve-3d' } }, [line.node]);
  persp.appendChild(inner);
  const node = el('div', { style: { position: 'absolute', left: '0', top: '0' } }, [persp]);
  function set({ x = 0, y = 0, width = inkW, rot = 0, opacity = 1, blur = 0 } = {}) {
    css(node, {
      transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scale(${(width / inkW).toFixed(4)})`,
      opacity, filter: blur > 0.1 ? `blur(${blur.toFixed(2)}px)` : 'none', display: opacity <= 0.001 || width <= 0.5 ? 'none' : '',
    });
  }
  return { node, set };
}
