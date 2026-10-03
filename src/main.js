// Bootstrap: builds every scene, then exposes the deterministic API used by
// the render scripts (window.__seek / __seekFrame / __motionBlurAt / __ready).
//
// URL parameters
//   ?render=1           no preview UI, stage at 1:1 (used by scripts/render.mjs)
//   &scenes=s01,s02     mount only these scenes (faster iteration)
//   &t=12.5 | &f=750    initial time (seconds) or frame

import { createEngine } from './engine/engine.js';
import { scenes } from './scenes/index.js';

const params = new URLSearchParams(location.search);
const renderMode = params.has('render');
document.body.classList.add(renderMode ? 'render' : 'preview');

window.__ready = (async () => {
  const timeline = await (await fetch(new URL('./timeline.json', import.meta.url))).json();
  const stage = document.getElementById('stage');
  const only = params.get('scenes') ? params.get('scenes').split(',') : null;
  const engine = await createEngine({ stage, timeline, scenes, onlyScenes: only });
  window.__engine = engine;
  window.__timeline = timeline;
  window.__seek = (t) => engine.seek(t);
  window.__seekFrame = (n) => engine.seekFrame(n);
  window.__motionBlurAt = (t) => engine.motionBlurAt(t);

  const startFrame = params.has('f') ? +params.get('f') : params.has('t') ? Math.round(+params.get('t') * engine.fps) : 0;
  engine.seekFrame(startFrame);
  if (!renderMode) setupPreview(engine, startFrame);
  return { fps: engine.fps, frames: engine.frames, width: engine.W, height: engine.H };
})();

function setupPreview(engine, startFrame) {
  const viewport = document.getElementById('viewport');
  const stage = document.getElementById('stage');
  const scrub = document.getElementById('scrub');
  const tc = document.getElementById('tc');
  const playBtn = document.getElementById('play');
  const sel = document.getElementById('scenes');
  const snd = document.getElementById('snd');
  const audioOn = document.getElementById('audio');
  scrub.max = engine.frames - 1;

  function fit() {
    const k = Math.min((innerWidth - 24) / engine.W, (innerHeight - 90) / engine.H, 1);
    stage.style.transform = `scale(${k})`;
    viewport.style.width = `${engine.W * k}px`;
    viewport.style.height = `${engine.H * k}px`;
  }
  addEventListener('resize', fit); fit();

  for (const s of engine.scenes) {
    const o = document.createElement('option');
    o.value = s.in; o.textContent = `${s.id} · f${s.in}–${s.out} · ${s.title || ''}`;
    sel.appendChild(o);
  }
  let frame = startFrame, playing = false, t0 = 0, f0 = 0;
  const fmt = (n) => {
    const s = n / engine.fps;
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${(s % 60).toFixed(3).padStart(6, '0')} · f${n}`;
  };
  function go(n) {
    frame = Math.max(0, Math.min(engine.frames - 1, n));
    engine.seekFrame(frame);
    scrub.value = frame;
    tc.textContent = `${fmt(frame)} · ${engine.activeAt(frame / engine.fps).join(', ')}`;
  }
  function tick(now) {
    if (!playing) return;
    const n = f0 + Math.floor(((now - t0) / 1000) * engine.fps);
    if (n >= engine.frames) { playing = false; playBtn.textContent = '▶ play'; snd.pause(); return; }
    if (n !== frame) go(n);
    requestAnimationFrame(tick);
  }
  function toggle() {
    playing = !playing;
    playBtn.textContent = playing ? '❚❚ pause' : '▶ play';
    if (playing) {
      t0 = performance.now(); f0 = frame;
      if (audioOn.checked) { snd.currentTime = frame / engine.fps; snd.play().catch(() => {}); }
      requestAnimationFrame(tick);
    } else snd.pause();
  }
  playBtn.onclick = toggle;
  scrub.oninput = () => { if (playing) toggle(); go(+scrub.value); };
  sel.onchange = () => go(+sel.value);
  addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); toggle(); }
    if (e.code === 'ArrowRight') go(frame + (e.shiftKey ? engine.fps : 1));
    if (e.code === 'ArrowLeft') go(frame - (e.shiftKey ? engine.fps : 1));
  });
  go(frame);
}
