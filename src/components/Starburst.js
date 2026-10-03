// Jagged comic-style starburst (SVG polygon). Spike lengths/angles are drawn
// from a seeded random generator so the shape is identical on every render.
//
//   const b = Starburst({ spikes: 26, inner: 0.55, seed: 7, fill: '#aebff7' });
//   b.set({ x, y, scale, rot, opacity })

import { el, css } from '../engine/dom.js';
import { mulberry32 } from '../engine/random.js';

export function starPath({ spikes = 24, inner = 0.55, jitter = 0.35, seed = 1, r = 500 } = {}) {
  const rnd = mulberry32(seed);
  const pts = [];
  for (let i = 0; i < spikes; i++) {
    const a0 = (i / spikes) * Math.PI * 2;
    const a1 = ((i + 0.5) / spikes) * Math.PI * 2 + (rnd() - 0.5) * (Math.PI / spikes) * 0.8;
    const ro = r * (1 - jitter * rnd());
    const ri = r * inner * (0.85 + 0.3 * rnd());
    pts.push([Math.cos(a0) * ri, Math.sin(a0) * ri], [Math.cos(a1) * ro, Math.sin(a1) * ro]);
  }
  return 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L') + ' Z';
}

export function Starburst({ fill = '#aebff7', size = 1000, ...shape } = {}) {
  const d = starPath({ r: size / 2, ...shape });
  const node = el('div', {
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${-size / 2} ${-size / 2} ${size} ${size}"><path d="${d}" fill="${fill}"/></svg>`,
    style: { position: 'absolute', left: `${-size / 2}px`, top: `${-size / 2}px`, width: `${size}px`, height: `${size}px` },
  });
  const wrap = el('div', { style: { position: 'absolute', left: '0', top: '0' } }, [node]);
  function set({ x = 0, y = 0, scale = 1, rot = 0, opacity = 1, blur = 0 } = {}) {
    css(wrap, { transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`, opacity, filter: blur ? `blur(${blur}px)` : 'none', display: opacity <= 0.001 || scale <= 0.001 ? 'none' : '' });
  }
  return { node: wrap, set };
}
