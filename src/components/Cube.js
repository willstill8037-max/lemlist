// Rounded "glossy" lemlist cube built from 6 CSS 3D faces (S04).
// The reference is a 3D render with bevels and lighting; here each face is a
// rounded square with a fixed shading gradient and the logo glyph drawn in a
// face-specific orientation (front: rotated 90° = "m", top: upright, left: 90° CCW).
//
//   const c = Cube({ size: 300 });  c.set({ x, y, scale, rx, ry, rz })

import { el, css } from '../engine/dom.js';
import { logoGlyphPaths } from './Logo.js';

function face(size, bg, glyphRot, glyphColor, shade) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100" style="display:block">
    <defs><linearGradient id="g${glyphRot}${shade}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient></defs>
    <rect x="0" y="0" width="100" height="100" rx="20" fill="url(#g${glyphRot}${shade})"/>
    <g transform="rotate(${glyphRot} 50 50) translate(50 50) scale(0.92) translate(-50 -50)">${logoGlyphPaths(glyphColor)}</g>
    <rect x="1.5" y="1.5" width="97" height="97" rx="19" fill="none" stroke="rgba(255,255,255,${shade})" stroke-width="2"/>
  </svg>`;
  return el('div', { html: svg, style: { position: 'absolute', left: `${-size / 2}px`, top: `${-size / 2}px`, width: `${size}px`, height: `${size}px`, backfaceVisibility: 'hidden' } });
}

export function Cube({ size = 300 } = {}) {
  const node = el('div', { style: { position: 'absolute', left: '0', top: '0', transformStyle: 'preserve-3d' } });
  const h = size / 2 - 0.5;
  const faces = [
    [face(size, ['#3a6df6', '#2a55de'], 90, '#ffffff', 0.25), `translateZ(${h}px)`],                // front
    [face(size, ['#1f3ea8', '#17318c'], -90, '#8a8fa8', 0.05), `rotateY(-90deg) translateZ(${h}px)`], // left
    [face(size, ['#3f72f7', '#2f5fe6'], 0, '#ffffff', 0.3), `rotateX(90deg) translateZ(${h}px)`],    // top
    [face(size, ['#2448b8', '#1b3a9c'], 180, '#ffffff', 0.05), `rotateY(90deg) translateZ(${h}px)`],  // right
    [face(size, ['#1a3592', '#142a78'], 0, '#7c84a6', 0.05), `rotateX(-90deg) translateZ(${h}px)`],  // bottom
    [face(size, ['#20409f', '#1a3488'], 0, '#ffffff', 0.05), `rotateY(180deg) translateZ(${h}px)`],  // back
  ];
  // inner core so the rounded corners never show the background through the cube
  const core = el('div', { style: { position: 'absolute', left: `${-size * 0.42}px`, top: `${-size * 0.42}px`, width: `${size * 0.84}px`, height: `${size * 0.84}px`, background: '#1d3a9e', transformStyle: 'preserve-3d' } });
  for (const [f, tr] of faces) { f.style.transform = tr; node.appendChild(f); }
  for (const tr of ['rotateY(0deg)', 'rotateY(90deg)', 'rotateX(90deg)']) {
    const c = core.cloneNode(); c.style.transform = tr; node.appendChild(c);
  }
  function set({ x = 0, y = 0, z = 0, scale = 1, rx = 0, ry = 0, rz = 0, opacity = 1, blur = 0 } = {}) {
    css(node, { transform: `translate3d(${x}px, ${y}px, ${z}px) rotateZ(${rz}deg) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(${scale}, ${scale}, ${scale})`, opacity, filter: blur > 0.05 ? `blur(${blur}px)` : 'none' });
  }
  return { node, set, size };
}
