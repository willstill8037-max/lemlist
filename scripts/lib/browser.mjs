// Headless Chromium wrapper: opens the stage in render mode and exposes
// seek / screenshot / motion-blur helpers.
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './server.mjs';

export function loadTimeline() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'src/timeline.json'), 'utf8'));
}

/** Scenes whose [in, out) interval intersects frames [a, b]. */
export function scenesForFrames(timeline, a, b) {
  return timeline.scenes.filter((s) => s.out > a && s.in <= b).map((s) => s.id);
}

export async function launchBrowser() {
  const exe = process.env.CHROMIUM_PATH || undefined;
  return chromium.launch({
    executablePath: exe,
    args: ['--force-color-profile=srgb', '--disable-lcd-text', '--font-render-hinting=none', '--hide-scrollbars',
      '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--autoplay-policy=no-user-gesture-required'],
  });
}

export async function openStage(browser, port, { scenes = null } = {}) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log(`[page:${m.type()}]`, m.text()); });
  page.on('pageerror', (e) => console.log('[page error]', e.message));
  const q = scenes ? `&scenes=${scenes.join(',')}` : '';
  await page.goto(`http://127.0.0.1:${port}/src/index.html?render=1${q}`);
  const info = await page.evaluate(() => window.__ready);
  return { page, info };
}

async function shot(page) {
  return page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1920, height: 1080 }, animations: 'disabled', caret: 'hide' });
}

/**
 * Render one frame to a PNG buffer.
 * Motion blur = temporal super-sampling (like After Effects: N sub-frames
 * spread over the shutter angle, centred on the frame time, averaged).
 */
export async function renderFrame(page, n, fps, { blur = true } = {}) {
  const t = n / fps;
  const mb = blur ? await page.evaluate((tt) => window.__motionBlurAt(tt), t) : { samples: 1 };
  if (!mb || mb.samples <= 1) {
    await page.evaluate((tt) => window.__seek(tt), t);
    return shot(page);
  }
  const K = mb.samples, span = (mb.shutter / 360) / fps;
  let acc = null, w = 0, h = 0;
  for (let i = 0; i < K; i++) {
    const ts = t + ((i + 0.5) / K - 0.5) * span;
    await page.evaluate(([tt, lock]) => window.__engine.seekSub(tt, lock), [ts, t]);
    const png = PNG.sync.read(await shot(page));
    if (!acc) { acc = new Float32Array(png.data.length); w = png.width; h = png.height; }
    const d = png.data;
    for (let j = 0; j < d.length; j++) acc[j] += d[j];
  }
  const out = new PNG({ width: w, height: h });
  for (let j = 0; j < acc.length; j++) out.data[j] = Math.round(acc[j] / K);
  return PNG.sync.write(out, { deflateLevel: 1 });
}
