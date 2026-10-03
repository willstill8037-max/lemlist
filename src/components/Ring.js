// Glossy blue ring (flat annulus with a conic gradient and two soft white
// specular streaks) used in the "OK" / "60.S" opening. Placed in a 3D context
// so perspective makes the near side of the band look thicker, as in the
// reference render.
//
//   const r = Ring({ diameter: 1000, band: 0.115 });
//   r.set({ x, y, scale, rx, ry, rz, spin })  // spin rotates the highlights

import { el, css, tf } from '../engine/dom.js';

export function Ring({ diameter = 1000, band = 0.115, color = '#3a66ea', dark = '#2f57d8', light = '#ffffff' } = {}) {
  const node = el('div', { style: { position: 'absolute', left: '0', top: '0', transformStyle: 'preserve-3d' } });
  const disc = el('div', {
    style: {
      position: 'absolute', left: `${-diameter / 2}px`, top: `${-diameter / 2}px`, width: `${diameter}px`, height: `${diameter}px`,
      borderRadius: '50%',
      WebkitMask: `radial-gradient(closest-side, transparent ${(100 * (1 - 2 * band)).toFixed(2)}%, #000 ${(100 * (1 - 2 * band) + 0.6).toFixed(2)}%, #000 99.2%, transparent 100%)`,
      mask: `radial-gradient(closest-side, transparent ${(100 * (1 - 2 * band)).toFixed(2)}%, #000 ${(100 * (1 - 2 * band) + 0.6).toFixed(2)}%, #000 99.2%, transparent 100%)`,
    },
  });
  node.appendChild(disc);
  function set({ x = 0, y = 0, z = 0, scale = 1, rx = 0, ry = 0, rz = 0, spin = 0, opacity = 1, filter = 'none' } = {}) {
    // highlight streaks at ~1:30 and ~8:30 o'clock (measured on f12-f40)
    const g = `conic-gradient(from ${spin}deg, ${dark} 0deg, ${color} 20deg, ${color} 30deg, ${light} 55deg, ${color} 80deg, ${color} 130deg, `
      + `${dark} 170deg, ${color} 240deg, ${color} 268deg, ${light} 292deg, ${color} 318deg, ${color} 340deg, ${dark} 360deg)`;
    css(disc, { background: g });
    css(node, { transform: tf({ x, y, z, rz, ry, rx, scale }), opacity, filter });
  }
  set();
  return { node, set };
}
