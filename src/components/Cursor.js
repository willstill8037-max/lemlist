// Mouse pointers seen in the video.
//  - 'mac'  : black macOS arrow with white outline (S06 light scenes)
//  - 'plane': solid "send"-style triangular pointer (S07 white on dark, S15/S24 navy on light)
// The hot spot (tip) is at (0, 0) of the node, so set({ x, y }) = tip position.

import { el, css } from '../engine/dom.js';

const SHAPES = {
  mac: (fill, stroke) => `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="34" viewBox="0 0 28 34" style="overflow:visible">
      <path d="M1.5 1.5 L1.5 26 L7.6 20.4 L11.6 30 L15.6 28.3 L11.7 19 L19.8 19 Z" fill="${fill}" stroke="${stroke}" stroke-width="2.2" stroke-linejoin="round"/></svg>`,
  // navigation arrow, tip at the top-right corner (S07, measured on f640: 58 x 54 px)
  plane: (fill, stroke) => `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="56" viewBox="-59 -1 60 56" style="overflow:visible;position:absolute;left:-59px;top:-1px">
      <path d="M0 0 L-58 19 L-26 27 L-28 54 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  // same arrow mirrored: tip at the top-left (S15–S16, S24, navy on light)
  planeL: (fill, stroke) => `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="56" viewBox="-1 -1 60 56" style="overflow:visible;position:absolute;left:-1px;top:-1px">
      <path d="M0 0 L58 19 L26 27 L28 54 Z" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/></svg>`,
};

export function Cursor({ shape = 'mac', fill = '#111', stroke = '#fff', size = 1 } = {}) {
  const node = el('div', { html: SHAPES[shape](fill, stroke), style: { position: 'absolute', left: '0', top: '0', transformOrigin: '0 0', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))' } });
  function set({ x = 0, y = 0, scale = 1, rot = 0, opacity = 1, press = 0 } = {}) {
    const s = size * scale * (1 - 0.12 * press);
    css(node, { transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${rot}deg) scale(${s.toFixed(4)})`, opacity, display: opacity <= 0.001 ? 'none' : '' });
  }
  return { node, set };
}
