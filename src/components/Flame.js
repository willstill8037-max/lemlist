// Cartoon flamethrower jet (S11 end, f1652–1716). The reference is a looping
// cel-style flame (period measured at 24 frames). Here: a tapered jet from a
// source point to a head point, with wavy edges whose phase loops every 24
// frames, a bulbous head made of 3 lobes that bud off, glow, and embers.
// All randomness is seeded; the shape at frame n is a pure function of n.
//
//   const f = Flame();  f.set({ from: [x, y], to: [x, y], frame, reach: 0..1, opacity })

import { el, css } from '../engine/dom.js';
import { rand, noise1 } from '../engine/random.js';

const LOOP = 24;

function jetPath(len, width, phase, seed, k) {
  // axis along +x from 0 to len; half-width grows towards the head
  const pts = 28, top = [], bot = [];
  for (let i = 0; i <= pts; i++) {
    const u = i / pts;
    const w = width * (0.08 + 0.92 * Math.pow(u, 1.6)) * k;
    const wob = 0.35 * width * k * u * noise1(seed, u * 6 - phase * 6);
    const wob2 = 0.3 * width * k * u * noise1(seed + 9, u * 7 - phase * 6 + 3);
    top.push([u * len, -w + wob]);
    bot.push([u * len, w + wob2]);
  }
  const d = top.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
    + ' ' + bot.reverse().map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`).join(' ') + ' Z';
  return d;
}

function blob(cx, cy, r, phase, seed) {
  const n = 14, pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 + 0.28 * noise1(seed, i * 0.9 + phase * 4) + (i % 3 === 0 ? 0.22 : 0));
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L') + ' Z';
}

export function Flame() {
  const node = el('div', { style: { position: 'absolute', left: '0', top: '0', width: '0', height: '0' } });
  const glow = el('div', { style: { position: 'absolute', left: '-500px', top: '-500px', width: '1000px', height: '1000px', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,170,30,0.45), rgba(255,140,20,0.12) 60%, rgba(255,140,20,0) 100%)' } });
  const svgWrap = el('div', { style: { position: 'absolute', left: '0', top: '0', filter: 'drop-shadow(0 0 18px rgba(255,170,20,0.75))' } });
  node.append(glow, svgWrap);
  const embers = [];
  for (let i = 0; i < 26; i++) {
    const e = el('div', { style: { position: 'absolute', left: '0', top: '0', width: `${3 + 6 * rand(55, i)}px`, height: `${3 + 6 * rand(55, i, 1)}px`, borderRadius: '40%', background: '#ff8a1c', boxShadow: '0 0 6px #ff9a20' } });
    node.appendChild(e); embers.push(e);
  }
  function set({ from = [1920, 1080], to = [960, 520], frame = 0, reach = 1, opacity = 1 } = {}) {
    css(node, { opacity, display: opacity <= 0.001 || reach <= 0.001 ? 'none' : '' });
    if (opacity <= 0.001 || reach <= 0.001) return;
    const phase = (((frame % LOOP) + LOOP) % LOOP) / LOOP;
    const dx = to[0] - from[0], dy = to[1] - from[1];
    const full = Math.hypot(dx, dy), ang = (Math.atan2(dy, dx) * 180) / Math.PI;
    const len = full * reach;
    const width = 165;
    const outer = jetPath(len, width, phase, 3, 1.0);
    const inner = jetPath(len * 0.97, width, phase, 3, 0.62);
    // head lobes: one main, two budding off (sideways / up), looping
    const lobes = [
      [len - 40, -20, 150], [len - 150 - 40 * Math.sin(phase * 2 * Math.PI), -120 - 60 * phase, 95 + 25 * Math.sin(phase * 2 * Math.PI)],
      [len + 40 * Math.cos(phase * 2 * Math.PI), 110 + 40 * phase, 55],
    ];
    const lobesOuter = lobes.map(([x, y, r], i) => blob(x, y, r * Math.min(1, reach * 1.4), phase, 20 + i)).join(' ');
    const lobesInner = lobes.map(([x, y, r], i) => blob(x + 8, y + 4, r * 0.62 * Math.min(1, reach * 1.4), phase, 30 + i)).join(' ');
    svgWrap.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" style="overflow:visible;position:absolute;left:0;top:0">
      <g transform="translate(${from[0]} ${from[1]}) rotate(${ang.toFixed(2)})">
        <path d="${outer} ${lobesOuter}" fill="#ffb412"/>
        <path d="${inner} ${lobesInner}" fill="#ffe81a"/>
      </g></svg>`;
    const head = [from[0] + Math.cos((ang * Math.PI) / 180) * len, from[1] + Math.sin((ang * Math.PI) / 180) * len];
    css(glow, { transform: `translate(${head[0].toFixed(1)}px, ${head[1].toFixed(1)}px)` });
    embers.forEach((e, i) => {
      const life = ((frame / 60 + rand(56, i) * 0.8) % 0.8) / 0.8;
      const ex = head[0] - 260 * rand(57, i) + 40 - 120 * life * (rand(58, i) - 0.3);
      const ey = head[1] - 200 * rand(59, i) + 120 - 160 * life;
      css(e, { transform: `translate(${ex.toFixed(1)}px, ${ey.toFixed(1)}px)`, opacity: (1 - life) * Math.min(1, reach * 1.5) });
    });
  }
  return { node, set };
}
