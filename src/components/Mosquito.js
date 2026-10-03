// Stylised 3D-looking mosquito (S10–S13). The reference is a 3D render;
// this is a vector redraw: navy body with a light rim, 6 thin legs, and two
// motion-blurred white wings that flap at ~14 Hz (sampled per frame, so the
// pose at time t is deterministic).
//
// Local origin = thorax centre. At scale 1 (f1216–f1308 framing):
// thorax ~47 px, abdomen ~110 px (pointing left), wings ~133 px, legs ~150 px.
//
//   const m = Mosquito();  m.set({ x, y, scale, rot, t, blur, opacity })

import { el, css } from '../engine/dom.js';
import { rand } from '../engine/random.js';

let uid = 0;
export function Mosquito() {
  const id = `mq${uid++}`;
  const legs = [
    'M-8 14 C -30 60, -55 110, -78 150', 'M2 18 C -6 70, -14 120, -18 170', 'M10 16 C 14 70, 22 120, 30 165',
    'M14 6 C 40 -20, 52 -40, 48 -40 M48 -40 C 60 10, 90 80, 120 110', 'M-14 10 C -40 40, -70 70, -95 120', 'M6 12 C 30 50, 70 90, 100 140',
  ];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="420" viewBox="-210 -210 420 420" style="overflow:visible;display:block">
    <defs>
      <radialGradient id="${id}t" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#3b4a78"/><stop offset="0.6" stop-color="#1f2848"/><stop offset="1" stop-color="#121730"/></radialGradient>
      <linearGradient id="${id}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#55628f"/><stop offset="0.35" stop-color="#232c4d"/><stop offset="1" stop-color="#111528"/></linearGradient>
      <linearGradient id="${id}w" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity="0.85"/><stop offset="0.7" stop-color="#eef0f8" stop-opacity="0.6"/><stop offset="1" stop-color="#ffffff" stop-opacity="0.15"/></linearGradient>
      <filter id="${id}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6.5"/></filter>
    </defs>
    <g stroke="#0d1022" stroke-width="4.2" fill="none" stroke-linecap="round">${legs.map((d) => `<path d="${d}"/>`).join('')}</g>
    <g data-wings="1">
      <path data-wing="0" d="M0 0 C -14 -40, -18 -100, -6 -133 C 6 -100, 10 -40, 0 0 Z" fill="url(#${id}w)" filter="url(#${id}b)"/>
      <path data-wing="1" d="M0 0 C -14 -40, -18 -100, -6 -133 C 6 -100, 10 -40, 0 0 Z" fill="url(#${id}w)" filter="url(#${id}b)"/>
    </g>
    <path d="M-118 -12 C -80 -26, -30 -22, -6 -8 C -30 6, -80 8, -118 -4 Z" fill="url(#${id}a)"/>
    <path d="M-116 -10 C -80 -23, -32 -20, -8 -9" stroke="#dfe3f5" stroke-width="2.2" fill="none" opacity="0.85"/>
    <ellipse cx="4" cy="2" rx="24" ry="22" fill="url(#${id}t)"/>
    <path d="M-12 -16 A 24 22 0 0 1 22 -8" stroke="#aab4dc" stroke-width="2" fill="none" opacity="0.6"/>
    <circle cx="18" cy="26" r="9" fill="#151a33"/>
    <path d="M22 32 L 34 70" stroke="#0d1022" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
  const inner = el('div', { html: svg, style: { position: 'absolute', left: '-210px', top: '-210px', width: '420px', height: '420px' } });
  const node = el('div', { style: { position: 'absolute', left: '0', top: '0' } }, [inner]);
  const wings = [...inner.querySelectorAll('[data-wing]')];

  /** t: seconds (drives the flapping), blur: px defocus, flip: mirror horizontally. */
  function set({ x = 0, y = 0, scale = 1, rot = 0, t = 0, blur = 0, opacity = 1, flip = false } = {}) {
    css(node, {
      transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scale(${(flip ? -scale : scale).toFixed(4)}, ${scale.toFixed(4)})`,
      filter: blur > 0.1 ? `blur(${blur.toFixed(2)}px)` : 'none', opacity, display: opacity <= 0.001 ? 'none' : '',
    });
    // flapping: the wings sweep between ~ -75° (back) and +5° (up), out of phase,
    // with a per-frame jitter like a rendered motion-blurred wing.
    const f = Math.floor(t * 60);
    const ph = t * 2 * Math.PI * 14;
    const a0 = -55 + 32 * Math.sin(ph) + 6 * (rand(77, f) - 0.5);
    const a1 = -28 + 24 * Math.sin(ph + 2.1) + 6 * (rand(78, f) - 0.5);
    wings[0].setAttribute('transform', `rotate(${a0.toFixed(2)}) scale(1, ${(0.9 + 0.1 * Math.cos(ph)).toFixed(3)})`);
    wings[1].setAttribute('transform', `rotate(${a1.toFixed(2)})`);
  }
  return { node, set };
}
