// Seeded, random-access pseudo random numbers.
// `rand(seed, i)` always returns the same value for the same (seed, i), so
// particle systems can be evaluated at any time without replaying history.

function hash32(a) {
  // Integer hash (lowbias32 by Chris Wellons).
  a |= 0;
  a ^= a >>> 16; a = Math.imul(a, 0x7feb352d);
  a ^= a >>> 15; a = Math.imul(a, 0x846ca68b);
  a ^= a >>> 16;
  return a >>> 0;
}

/** Uniform float in [0,1) for (seed, index[, salt]). */
export function rand(seed, i = 0, salt = 0) {
  return hash32(hash32(hash32(seed) ^ (i * 0x9e3779b1)) ^ (salt * 0x85ebca6b)) / 4294967296;
}

/** Uniform float in [lo, hi). */
export const randRange = (seed, i, lo, hi, salt = 0) => lo + (hi - lo) * rand(seed, i, salt);

/** Approximately normal (sum of uniforms), mean 0, std ~1. */
export function randNormal(seed, i, salt = 0) {
  let s = 0;
  for (let k = 0; k < 4; k++) s += rand(seed, i, salt * 4 + k);
  return (s - 2) * Math.sqrt(3);
}

/** Classic sequential generator, for build-time layout (never for per-frame state). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth 1-D value noise in [-1, 1] (deterministic), for wobble / flicker. */
export function noise1(seed, x) {
  const i = Math.floor(x), fr = x - i;
  const a = rand(seed, i) * 2 - 1, b = rand(seed, i + 1) * 2 - 1;
  const u = fr * fr * (3 - 2 * fr);
  return a + (b - a) * u;
}
