// Tiny DOM helpers used by components and scenes.

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * el('div', { class: 'card', style: { left: '10px' }, text: 'hi' }, [children])
 */
export function el(tag, opts = {}, children = []) {
  const isSvg = opts.svg || ['svg', 'path', 'g', 'circle', 'rect', 'defs', 'linearGradient', 'radialGradient',
    'stop', 'filter', 'feGaussianBlur', 'polygon', 'ellipse', 'line', 'polyline', 'clipPath', 'mask', 'text',
    'feColorMatrix', 'feOffset', 'feMerge', 'feMergeNode', 'feComposite', 'feFlood', 'use', 'pattern',
    'feTurbulence', 'feDisplacementMap', 'tspan'].includes(tag);
  const node = isSvg ? document.createElementNS(SVG_NS, tag) : document.createElement(tag);
  for (const [k, v] of Object.entries(opts)) {
    if (v === undefined || v === null || k === 'svg') continue;
    if (k === 'class') node.setAttribute('class', v);
    else if (k === 'style') {
      if (typeof v === 'string') node.style.cssText = v; else Object.assign(node.style, v);
    } else if (k === 'text') node.textContent = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'attrs') for (const [a, av] of Object.entries(v)) node.setAttribute(a, av);
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c === null || c === undefined || c === false) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

export const svg = (tag, attrs = {}, children = []) => el(tag, { svg: true, attrs }, children);

/** Build a CSS transform string. Units: px and degrees. */
export function tf({ x = 0, y = 0, z = 0, scale = 1, sx = 1, sy = 1, rx = 0, ry = 0, rz = 0, skewX = 0, skewY = 0, persp } = {}) {
  let s = '';
  if (persp) s += `perspective(${persp}px) `;
  if (x || y || z) s += `translate3d(${x}px,${y}px,${z}px) `;
  if (rz) s += `rotateZ(${rz}deg) `;
  if (ry) s += `rotateY(${ry}deg) `;
  if (rx) s += `rotateX(${rx}deg) `;
  if (skewX || skewY) s += `skew(${skewX}deg,${skewY}deg) `;
  const kx = scale * sx, ky = scale * sy;
  if (kx !== 1 || ky !== 1) s += `scale(${kx},${ky}) `;
  return s || 'none';
}

/** Set a style property only when it changed (cheap guard for per-frame updates). */
export function css(node, props) {
  const cache = node.__cssCache || (node.__cssCache = {});
  for (const [k, v] of Object.entries(props)) {
    const val = typeof v === 'number' && !UNITLESS.has(k) ? `${v}px` : String(v);
    if (cache[k] !== val) {
      cache[k] = val;
      if (k.startsWith('--')) node.style.setProperty(k, val); else node.style[k] = val;
    }
  }
}
const UNITLESS = new Set(['opacity', 'zIndex', 'scale', 'fontWeight', 'lineHeight', 'flexGrow']);

export const show = (node, visible) => css(node, { display: visible ? '' : 'none' });

/** Absolutely positioned box helper: box(x, y, w, h, extra) */
export function box(x, y, w, h, style = {}) {
  return { position: 'absolute', left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, ...style };
}
