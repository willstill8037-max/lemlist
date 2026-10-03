// Easing functions. Every function maps progress p in [0,1] to an eased value
// (usually in [0,1], overshooting curves may leave that range).
//
// `cubicBezier(x1, y1, x2, y2)` reproduces CSS / After Effects style bezier
// easing exactly, so curves fitted on the reference video can be pasted here.

export function cubicBezier(x1, y1, x2, y2) {
  // Newton-Raphson + bisection fallback, same approach as WebKit's UnitBezier.
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sampleX = (t) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t) => (3 * ax * t + 2 * bx) * t + cx;
  function solveX(x) {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-7) return t;
      const d = sampleDX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    let lo = 0, hi = 1; t = x;
    while (lo < hi) {
      const v = sampleX(t);
      if (Math.abs(v - x) < 1e-7) return t;
      if (x > v) lo = t; else hi = t;
      t = (lo + hi) / 2;
      if (hi - lo < 1e-9) break;
    }
    return t;
  }
  const fn = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : sampleY(solveX(p)));
  fn.bezier = [x1, y1, x2, y2];
  return fn;
}

const pow = Math.pow;
export const linear = (p) => p;
export const easeInQuad = (p) => p * p;
export const easeOutQuad = (p) => 1 - (1 - p) * (1 - p);
export const easeInOutQuad = (p) => (p < 0.5 ? 2 * p * p : 1 - pow(-2 * p + 2, 2) / 2);
export const easeInCubic = (p) => p * p * p;
export const easeOutCubic = (p) => 1 - pow(1 - p, 3);
export const easeInOutCubic = (p) => (p < 0.5 ? 4 * p * p * p : 1 - pow(-2 * p + 2, 3) / 2);
export const easeInQuart = (p) => p * p * p * p;
export const easeOutQuart = (p) => 1 - pow(1 - p, 4);
export const easeInOutQuart = (p) => (p < 0.5 ? 8 * p * p * p * p : 1 - pow(-2 * p + 2, 4) / 2);
export const easeOutQuint = (p) => 1 - pow(1 - p, 5);
export const easeInQuint = (p) => p * p * p * p * p;
export const easeInOutQuint = (p) => (p < 0.5 ? 16 * pow(p, 5) : 1 - pow(-2 * p + 2, 5) / 2);
export const easeInExpo = (p) => (p === 0 ? 0 : pow(2, 10 * p - 10));
export const easeOutExpo = (p) => (p === 1 ? 1 : 1 - pow(2, -10 * p));
export const easeInOutExpo = (p) =>
  p === 0 ? 0 : p === 1 ? 1 : p < 0.5 ? pow(2, 20 * p - 10) / 2 : (2 - pow(2, -20 * p + 10)) / 2;
export const easeInSine = (p) => 1 - Math.cos((p * Math.PI) / 2);
export const easeOutSine = (p) => Math.sin((p * Math.PI) / 2);
export const easeInOutSine = (p) => -(Math.cos(Math.PI * p) - 1) / 2;
export const easeOutCirc = (p) => Math.sqrt(1 - pow(p - 1, 2));
export const easeInCirc = (p) => 1 - Math.sqrt(1 - p * p);

/** Overshooting ease-out (only used where the reference visibly overshoots). */
export const easeOutBack = (s = 1.70158) => (p) => 1 + (s + 1) * pow(p - 1, 3) + s * pow(p - 1, 2);

/** After Effects "Easy Ease" (keyframe velocity 0, influence 33.33%). */
export const aeEasyEase = cubicBezier(0.333, 0, 0.667, 1);
export const aeEaseOut = cubicBezier(0.333, 0, 0.667, 1); // alias used in docs
/** Strong "speed ramp" curves typical of motion-design presets (fast in, long tail). */
export const expoOut = cubicBezier(0.16, 1, 0.3, 1);
export const expoInOut = cubicBezier(0.87, 0, 0.13, 1);
export const quintOut = cubicBezier(0.22, 1, 0.36, 1);
export const circInOut = cubicBezier(0.85, 0, 0.15, 1);

/** Lookup by name, so timeline.json can reference easings as strings. */
export const named = {
  linear, easeInQuad, easeOutQuad, easeInOutQuad, easeInCubic, easeOutCubic, easeInOutCubic,
  easeInQuart, easeOutQuart, easeInOutQuart, easeInQuint, easeOutQuint, easeInOutQuint,
  easeInExpo, easeOutExpo, easeInOutExpo, easeInSine, easeOutSine, easeInOutSine,
  easeOutCirc, easeInCirc, aeEasyEase, expoOut, expoInOut, quintOut, circInOut,
};

export function resolveEase(e) {
  if (!e) return linear;
  if (typeof e === 'function') return e;
  if (Array.isArray(e)) return cubicBezier(...e);
  if (named[e]) return named[e];
  throw new Error(`Unknown easing "${e}"`);
}
