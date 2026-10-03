// Deterministic timeline engine.
//
//   const engine = await createEngine({ stage, timeline, scenes });
//   engine.seek(12.5);          // draw the exact state at t = 12.5 s
//   engine.seekFrame(750);      // same, by frame index (60 fps)
//
// Scenes are plain objects { mount(root, ctx), update(t, ctx) } whose state is a
// pure function of time. Timing (in/out frames, events, motion-blur windows)
// lives in src/timeline.json so it can be read by code and by humans alike.

import { el, css } from './dom.js';

export async function createEngine({ stage, timeline, scenes, onlyScenes = null }) {
  const fps = timeline.fps;
  const W = timeline.width, H = timeline.height;
  const entries = [];

  for (const def of timeline.scenes) {
    if (onlyScenes && !onlyScenes.includes(def.id)) continue;
    const mod = scenes[def.id];
    if (!mod) { console.warn(`[engine] no module for scene ${def.id}`); continue; }
    const root = el('div', { class: 'scene', dataset: { scene: def.id } });
    css(root, { position: 'absolute', left: 0, top: 0, width: W, height: H, overflow: 'hidden', zIndex: def.z ?? 0, display: 'none' });
    stage.appendChild(root);
    const start = def.in / fps, end = def.out / fps;
    // Scene events: global frame numbers in the json -> local seconds for the scene code.
    const ev = {};
    for (const [k, v] of Object.entries(def.events || {})) ev[k] = (v - def.in) / fps;
    const ctx = { id: def.id, def, fps, W, H, start, end, duration: end - start, ev, root, params: def.params || {} };
    entries.push({ def, mod, root, ctx, start, end });
    mod.mount(root, ctx);
  }

  await waitForAssets(stage);

  function activeAt(t) {
    return entries.filter((e) => t >= e.start - 1e-9 && t < e.end - 1e-9);
  }

  let lastT = null;
  function seek(t) { seekSub(t, t); }

  /**
   * Evaluate the animation at time `t` but keep the scene visibility of time
   * `lockT`. Used for motion-blur sub-frames so that a sub-frame never leaks
   * across a hard cut (After Effects does not blur across layer in/out points).
   * Local times are clamped to the scene interval for the same reason.
   */
  function seekSub(t, lockT) {
    lastT = t;
    for (const e of entries) {
      const on = lockT >= e.start - 1e-9 && lockT < e.end - 1e-9;
      css(e.root, { display: on ? '' : 'none' });
      if (on) {
        const lt = Math.min(Math.max(t, e.start), e.end - 1e-6) - e.start;
        e.mod.update(lt, e.ctx, t);
      }
    }
  }

  /** Motion-blur settings at global time t: { samples, shutter } (shutter in degrees). */
  function motionBlurAt(t) {
    const frame = t * fps;
    let best = { samples: 1, shutter: 0 };
    for (const e of activeAt(t)) {
      for (const [a, b, samples, shutter] of e.def.motionBlur || []) {
        if (frame >= a - 1e-6 && frame <= b + 1e-6 && samples > best.samples) best = { samples, shutter: shutter ?? 180 };
      }
    }
    return best;
  }

  return {
    fps, W, H,
    duration: timeline.durationFrames / fps,
    frames: timeline.durationFrames,
    scenes: entries.map((e) => ({ id: e.def.id, in: e.def.in, out: e.def.out, title: e.def.title })),
    seek,
    seekSub,
    seekFrame: (n) => seek(n / fps),
    motionBlurAt,
    activeAt: (t) => activeAt(t).map((e) => e.def.id),
    get time() { return lastT; },
  };
}

/** Resolve once every font face used on the page and every <img> are decoded. */
export async function waitForAssets(root) {
  if (document.fonts) {
    const weights = [300, 400, 500, 600, 700, 800, 900];
    await Promise.all(weights.map((w) => document.fonts.load(`${w} 40px Inter`, 'AaéÉàç€’…'))).catch(() => {});
    await document.fonts.ready;
  }
  const imgs = [...root.querySelectorAll('img')];
  await Promise.all(imgs.map((img) => (img.complete && img.naturalWidth ? img.decode().catch(() => {}) : new Promise((res) => {
    img.addEventListener('load', () => img.decode().then(res, res), { once: true });
    img.addEventListener('error', () => { console.error('[engine] image failed', img.src); res(); }, { once: true });
  }))));
  const svgImages = [...root.querySelectorAll('image')];
  await Promise.all(svgImages.map((im) => new Promise((res) => {
    if (im.__loaded) return res();
    const i = new Image(); i.onload = res; i.onerror = res; i.src = im.getAttribute('href');
  })));
}
