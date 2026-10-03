// Pure, time-addressable animation helpers.
// Nothing here keeps state: every value is a function of the time you pass in,
// which is what makes `seek(t)` deterministic and frame-accurate.

import { resolveEase } from './easing.js';

export const FPS = 60;
export const clamp = (v, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a, b, p) => a + (b - a) * p;
export const invLerp = (a, b, v) => (a === b ? (v >= b ? 1 : 0) : (v - a) / (b - a));
/** Frames (60 fps reference) to seconds. */
export const f = (frames) => frames / FPS;

/**
 * Eased progress of an interval.
 * progress(t, t0, t1, ease) -> 0 before t0, 1 after t1, eased in between.
 */
export function progress(t, t0, t1, ease) {
  const p = clamp(invLerp(t0, t1, t));
  return resolveEase(ease)(p);
}

/** Interpolate a scalar between two times: tween(t, t0, t1, from, to, ease). */
export function tween(t, t0, t1, from, to, ease) {
  return lerp(from, to, progress(t, t0, t1, ease));
}

function mix(a, b, p) {
  if (typeof a === 'number') return lerp(a, b, p);
  if (Array.isArray(a)) return a.map((v, i) => mix(v, b[i], p));
  if (a && typeof a === 'object') {
    const o = {};
    for (const k of Object.keys(a)) o[k] = k in b ? mix(a[k], b[k], p) : a[k];
    return o;
  }
  return p < 1 ? a : b; // non-interpolable (strings, booleans): hold
}

/**
 * Keyframe track, After-Effects style.
 *   keys: [{ t, v, ease? }, ...] sorted by t. `ease` describes the segment that
 *   STARTS at this key (towards the next key). Values can be numbers, arrays or
 *   plain objects of numbers.
 *   Before the first key the first value is held, after the last key the last.
 */
export function keyframes(t, keys) {
  if (!keys.length) return undefined;
  if (t <= keys[0].t) return keys[0].v;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t < b.t) {
      if (a.hold) return a.v;
      const p = resolveEase(a.ease)(clamp(invLerp(a.t, b.t, t)));
      return mix(a.v, b.v, p);
    }
  }
  return keys[keys.length - 1].v;
}

/** Same as keyframes() but keys are given in frames: [[frame, value, ease], ...]. */
export function track(t, rows) {
  return keyframes(t, rows.map(([fr, v, ease, hold]) => ({ t: fr / FPS, v, ease, hold })));
}

/**
 * Damped spring response (closed form), for the few places where the
 * reference shows a real overshoot/settle. Returns position going 0 -> 1.
 */
export function spring(t, { stiffness = 170, damping = 26, mass = 1, velocity = 0 } = {}) {
  if (t <= 0) return 0;
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const x0 = -1, v0 = velocity;
  let x;
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    x = Math.exp(-zeta * w0 * t) * (x0 * Math.cos(wd * t) + ((v0 + zeta * w0 * x0) / wd) * Math.sin(wd * t));
  } else {
    x = (x0 + (v0 + w0 * x0) * t) * Math.exp(-w0 * t);
  }
  return 1 + x;
}

/** Linear sweep through a list of [t, value] samples (measured curves). */
export function sampled(t, samples) {
  if (t <= samples[0][0]) return samples[0][1];
  for (let i = 0; i < samples.length - 1; i++) {
    const [ta, va] = samples[i], [tb, vb] = samples[i + 1];
    if (t < tb) return mix(va, vb, (t - ta) / (tb - ta));
  }
  return samples[samples.length - 1][1];
}

/** Stepped (held) animation: e.g. a cel animation playing at 12 fps on a 60 fps timeline. */
export const stepTime = (t, fps) => Math.floor(t * fps + 1e-6) / fps;

/** Colours: '#rrggbb' or [r,g,b] / [r,g,b,a] arrays. */
export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function mixColor(a, b, p) {
  const ca = Array.isArray(a) ? a : hexToRgb(a);
  const cb = Array.isArray(b) ? b : hexToRgb(b);
  const r = Math.round(lerp(ca[0], cb[0], p));
  const g = Math.round(lerp(ca[1], cb[1], p));
  const bl = Math.round(lerp(ca[2], cb[2], p));
  const al = lerp(ca[3] ?? 1, cb[3] ?? 1, p);
  return `rgba(${r},${g},${bl},${al.toFixed(4)})`;
}
export const rgba = (c, a = 1) => {
  const [r, g, b] = Array.isArray(c) ? c : hexToRgb(c);
  return `rgba(${r},${g},${b},${a})`;
};
