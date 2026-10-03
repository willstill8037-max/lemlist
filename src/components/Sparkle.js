// 4-point "twinkle" star (long thin vertical/horizontal rays + soft core), S06.
//   const s = Sparkle({ color: '#4a6be8' });  s.set({ x, y, size, opacity, rot })

import { el, css } from '../engine/dom.js';

export function Sparkle({ color = '#4467e6' } = {}) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="-100 -100 200 200" style="overflow:visible">
    <defs><radialGradient id="spk" r="50%"><stop offset="0" stop-color="${color}" stop-opacity="0.45"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs>
    <circle r="22" fill="url(#spk)"/>
    <path d="M0 -100 C3 -22 22 -3 100 0 C22 3 3 22 0 100 C-3 22 -22 3 -100 0 C-22 -3 -3 -22 0 -100 Z" fill="${color}"/>
  </svg>`;
  const node = el('div', { html: svg, style: { position: 'absolute', left: '-100px', top: '-100px', width: '200px', height: '200px' } });
  const wrap = el('div', { style: { position: 'absolute', left: '0', top: '0' } }, [node]);
  function set({ x = 0, y = 0, size = 100, opacity = 1, rot = 0 } = {}) {
    const k = size / 200;
    css(wrap, { transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${rot}deg) scale(${k.toFixed(4)})`, opacity, display: k < 0.01 || opacity < 0.01 ? 'none' : '' });
  }
  return { node: wrap, set };
}
