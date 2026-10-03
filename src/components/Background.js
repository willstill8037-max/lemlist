// Full-frame backgrounds: elliptical radial gradient + dot grid.
// The three variants (light / dark / blue) were fitted on clean reference
// frames (f2990, f960/f1290, f2410): mean absolute error < 1 level.
// Dot grid: period 41.6 px in x and y, ~5 px dots, very low contrast.

import { el, css } from '../engine/dom.js';

export const BG = {
  light: {
    at: [960, 300], radii: [900, 700],
    stops: [[0, '#f9fafe'], [0.3, '#f8fafe'], [0.5, '#f6f8fe'], [0.7, '#f3f6ff'], [0.9, '#eef1fd'], [1.1, '#eaeffd'], [1.25, '#e7effc']],
    dot: 'rgba(70, 80, 160, 0.075)',
  },
  dark: {
    at: [960, 250], radii: [700, 600],
    stops: [[0, '#242232'], [0.45, '#242231'], [0.55, '#242230'], [0.75, '#23212f'], [0.95, '#201e2c'], [1.15, '#1c1a27'], [1.35, '#181621'], [1.55, '#16141f']],
    dot: 'rgba(0, 0, 0, 0.22)',
  },
  blue: {
    at: [960, 250], radii: [700, 600],
    stops: [[0, '#658afc'], [0.45, '#6489fb'], [0.65, '#6287fa'], [0.75, '#6085fa'], [0.85, '#5b83fa'], [0.95, '#567ff9'], [1.05, '#507afa'],
      [1.15, '#4a75f9'], [1.25, '#4370f8'], [1.35, '#3f6df8'], [1.45, '#3b6af9'], [1.55, '#3967f9']],
    dot: 'rgba(255, 255, 255, 0.07)',
  },
};

export function gradientCss(v) {
  const stops = v.stops.map(([p, c]) => `${c} ${(p * 100).toFixed(1)}%`).join(', ');
  return `radial-gradient(${v.radii[0]}px ${v.radii[1]}px at ${v.at[0]}px ${v.at[1]}px, ${stops})`;
}

export const DOT_PERIOD = 41.6;

/**
 * Background({ variant: 'light'|'dark'|'blue', dotOffset: [x, y] })
 * returns { node, set({ variant?, dotOffset?, dotScale?, dotOpacity? }) }
 */
export function Background({ variant = 'light', dotOffset = [16.5, 17.2], dotSize = 2.6 } = {}) {
  const node = el('div', { class: 'bg', style: { position: 'absolute', inset: '0', overflow: 'hidden' } });
  const grad = el('div', { style: { position: 'absolute', inset: '0' } });
  const dots = el('div', { style: { position: 'absolute', left: '-1000px', top: '-1000px', width: '3920px', height: '3080px', transformOrigin: '1960px 1540px' } });
  node.append(grad, dots);
  let cur = {};
  function set({ variant: v = cur.variant, dotOffset: off = cur.dotOffset, dotScale = 1, dotOpacity = 1, dotX = 0, dotY = 0 } = {}) {
    if (v !== cur.variant) {
      const def = BG[v];
      css(grad, { background: gradientCss(def) });
      css(dots, { backgroundImage: `radial-gradient(circle, ${def.dot} ${dotSize - 0.6}px, transparent ${dotSize + 0.4}px)`, backgroundSize: `${DOT_PERIOD}px ${DOT_PERIOD}px` });
    }
    // background-position of the dot lattice so a dot centre lands on dotOffset (+1000 px canvas margin)
    const ox = ((off[0] + 1000 - DOT_PERIOD / 2) % DOT_PERIOD), oy = ((off[1] + 1000 - DOT_PERIOD / 2) % DOT_PERIOD);
    css(dots, { backgroundPosition: `${ox.toFixed(2)}px ${oy.toFixed(2)}px`, transform: `translate(${dotX}px, ${dotY}px) scale(${dotScale})`, opacity: dotOpacity });
    cur = { variant: v, dotOffset: off };
  }
  set({ variant, dotOffset });
  return { node, set };
}
