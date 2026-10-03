// Pastel-blue "3D" alarm clock (SVG redraw of the rendered clocks of S02;
// the original is a 3D render — shading is approximated with gradients).
//
//   const c = AlarmClock({ size: 200 });  c.node … c.set({ x, y, rot, scale, blur, opacity })

import { el, css } from '../engine/dom.js';

let uid = 0;
export function AlarmClock({ size = 200, hour = -60, minute = 90 } = {}) {
  const id = `clk${uid++}`;
  const svgMarkup = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="${size}" height="${size * 1.1}" style="overflow:visible">
    <defs>
      <radialGradient id="${id}b" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#b6c6fa"/><stop offset="0.6" stop-color="#8aa2f3"/><stop offset="1" stop-color="#5d7ced"/></radialGradient>
      <radialGradient id="${id}f" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#e3e9fd"/><stop offset="0.75" stop-color="#cdd8fb"/><stop offset="1" stop-color="#a9bbf7"/></radialGradient>
      <linearGradient id="${id}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a9bcf8"/><stop offset="1" stop-color="#5675ea"/></linearGradient>
    </defs>
    <!-- feet -->
    <path d="M58 182 L44 206" stroke="#6f8cf0" stroke-width="12" stroke-linecap="round"/>
    <path d="M142 182 L156 206" stroke="#6f8cf0" stroke-width="12" stroke-linecap="round"/>
    <!-- bells -->
    <path d="M26 70 A38 38 0 0 1 82 26 Z" fill="url(#${id}b)"/>
    <path d="M174 70 A38 38 0 0 0 118 26 Z" fill="url(#${id}b)"/>
    <path d="M30 66 L80 30" stroke="#5d7ced" stroke-width="6" stroke-linecap="round" opacity="0.7"/>
    <path d="M170 66 L120 30" stroke="#5d7ced" stroke-width="6" stroke-linecap="round" opacity="0.7"/>
    <!-- hammer -->
    <rect x="93" y="22" width="14" height="22" rx="5" fill="#7f99f2"/>
    <ellipse cx="100" cy="20" rx="16" ry="7" fill="#9db1f6"/>
    <!-- body -->
    <circle cx="100" cy="120" r="80" fill="url(#${id}r)"/>
    <circle cx="100" cy="120" r="68" fill="url(#${id}f)"/>
    <!-- hands -->
    <path d="M100 120 L${100 + 34 * Math.sin((hour * Math.PI) / 180)} ${120 - 34 * Math.cos((hour * Math.PI) / 180)}" stroke="#5a78e8" stroke-width="8" stroke-linecap="round"/>
    <path d="M100 120 L${100 + 46 * Math.sin((minute * Math.PI) / 180)} ${120 - 46 * Math.cos((minute * Math.PI) / 180)}" stroke="#5a78e8" stroke-width="8" stroke-linecap="round"/>
    <circle cx="100" cy="120" r="7" fill="#5a78e8"/>
  </svg>`;
  const node = el('div', { html: svgMarkup, style: { position: 'absolute', left: '0', top: '0', width: `${size}px`, height: `${size * 1.1}px`, transformOrigin: '50% 55%' } });
  function set({ x = 0, y = 0, rot = 0, scale = 1, blur = 0, opacity = 1 } = {}) {
    css(node, {
      transform: `translate(${(x - size / 2).toFixed(2)}px, ${(y - size * 0.55).toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(4)})`,
      filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none', opacity,
    });
  }
  return { node, set };
}
