// Hand-drawn style outline crown (S09). Origin = crown centre.
import { el, css } from '../engine/dom.js';

export function Crown({ width = 48, color = '#d9d8e4' } = {}) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width * 0.8}" viewBox="0 0 60 48" style="display:block;overflow:visible">
    <path d="M8 38 L4 12 L18 24 L30 6 L42 24 L56 12 L52 38 Z" fill="none" stroke="${color}" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M9 44 H51" stroke="${color}" stroke-width="3.2" stroke-linecap="round"/>
    <circle cx="4" cy="11" r="2.6" fill="${color}"/><circle cx="30" cy="5" r="2.6" fill="${color}"/><circle cx="56" cy="11" r="2.6" fill="${color}"/></svg>`;
  const inner = el('div', { html: svg, style: { position: 'absolute', left: `${-width / 2}px`, top: `${-width * 0.4}px` } });
  const node = el('div', { style: { position: 'absolute', left: '0', top: '0' } }, [inner]);
  function set({ x = 0, y = 0, rot = 0, scale = 1, opacity = 1, sx = 1, sy = 1 } = {}) {
    css(node, { transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scale(${(scale * sx).toFixed(4)}, ${(scale * sy).toFixed(4)})`, opacity, display: opacity <= 0.001 ? 'none' : '' });
  }
  return { node, set };
}
