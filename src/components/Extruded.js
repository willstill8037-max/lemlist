// 3D extruded text / shapes built from stacked DOM layers in a preserve-3d
// container (used for "OK", "60.S", the "?" and "bzzzz").
//
//   const t = ExtrudedText({ text: 'OK', size: 120, depth: 26, layers: 18,
//                            face: 'linear-gradient(...)', side: '#2448c0' });
//   t.node -> append to a parent that has `perspective` set
//   t.set({ rx, ry, rz, x, y, z, scale, opacity })

import { el, css, tf } from '../engine/dom.js';
import { mixColor } from '../engine/anim.js';

export function ExtrudedText({
  text, size = 100, weight = 900, depth = 24, layers = 16, letterSpacing = '-0.02em',
  face = '#3f6ff2', faceImage = null, side = '#2448c0', sideFar = null, font = 'Inter', origin = '50% 50%',
  shine = null,
} = {}) {
  const node = el('div', { style: { position: 'absolute', left: '0', top: '0', transformStyle: 'preserve-3d', transformOrigin: origin } });
  const base = {
    position: 'absolute', left: '0', top: '0', whiteSpace: 'pre', fontFamily: font, fontWeight: String(weight),
    fontSize: `${size}px`, lineHeight: '1', letterSpacing, transform: 'translate(-50%, -50%)',
  };
  const stack = [];
  for (let i = layers; i >= 1; i--) {
    const z = -(depth * i) / layers;
    const c = sideFar ? mixColor(side, sideFar, i / layers) : side;
    const wrap = el('div', { style: { position: 'absolute', left: '0', top: '0', transform: `translateZ(${z.toFixed(2)}px)`, transformStyle: 'preserve-3d' } });
    wrap.appendChild(el('div', { text, style: { ...base, color: c } }));
    node.appendChild(wrap);
    stack.push(wrap);
  }
  const front = el('div', { text, style: { ...base, color: faceImage ? 'transparent' : face } });
  if (faceImage) Object.assign(front.style, { backgroundImage: faceImage, WebkitBackgroundClip: 'text', backgroundClip: 'text' });
  const frontWrap = el('div', { style: { position: 'absolute', left: '0', top: '0', transform: 'translateZ(0.5px)' } }, [front]);
  node.appendChild(frontWrap);
  let shineEl = null;
  if (shine) {
    shineEl = el('div', { text, style: { ...base, color: 'transparent', backgroundImage: shine, WebkitBackgroundClip: 'text', backgroundClip: 'text', backgroundSize: '300% 100%' } });
    frontWrap.appendChild(shineEl);
  }
  function set({ x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, scale = 1, opacity = 1, shinePos = null, filter = 'none' } = {}) {
    css(node, { transform: tf({ x, y, z, rx, ry, rz, scale }), opacity, filter });
    if (shineEl && shinePos !== null) css(shineEl, { backgroundPosition: `${shinePos}% 0` });
  }
  return { node, front, set };
}
