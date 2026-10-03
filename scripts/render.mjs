#!/usr/bin/env node
// Frame-by-frame renderer.
//
//   node scripts/render.mjs                       full video  -> renders/lemlist_reconstruction.mp4
//   node scripts/render.mjs --scene s08           one scene   -> renders/scenes/s08.mp4
//   node scripts/render.mjs --frames 540-900      frame range -> renders/range_540-900.mp4
//   node scripts/render.mjs --frame 1234          one frame   -> renders/frames/f01234.png
//   node scripts/render.mjs --time 12.5           one frame at t = 12.5 s
//
// Options: --workers N (default 3) · --no-blur · --crf 16 · --out file
//          --keep (keep PNG frames) · --reuse (skip PNG frames that already exist)
//          --no-audio · --frames-dir dir
//
// Every frame is rendered from scratch with window.__seek(t): no real-time
// capture is involved, so the output is identical whatever the machine speed.

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { startServer, ROOT } from './lib/server.mjs';
import { launchBrowser, openStage, renderFrame, loadTimeline, scenesForFrames } from './lib/browser.mjs';

const argv = process.argv.slice(2);
const opt = (name, def) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true) : def; };

const timeline = loadTimeline();
const fps = timeline.fps;
let first = 0, last = timeline.durationFrames - 1, mode = 'full';
if (opt('scene')) {
  const s = timeline.scenes.find((x) => x.id === opt('scene'));
  if (!s) throw new Error(`unknown scene ${opt('scene')}`);
  first = s.in; last = s.out - 1; mode = 'scene';
} else if (opt('frames')) {
  [first, last] = String(opt('frames')).split('-').map(Number); mode = 'range';
} else if (opt('frame') !== undefined || opt('time') !== undefined) {
  first = last = opt('frame') !== undefined ? +opt('frame') : Math.round(+opt('time') * fps); mode = 'single';
}
const workers = +opt('workers', mode === 'single' ? 1 : 3);
const blur = !argv.includes('--no-blur');
const crf = opt('crf', '16');
const framesDir = path.resolve(ROOT, opt('frames-dir', mode === 'full' ? 'renders/.frames/full' : `renders/.frames/${mode}`));
fs.mkdirSync(framesDir, { recursive: true });
const reuse = argv.includes('--reuse');

const { port, close } = await startServer();
const browser = await launchBrowser();
const sceneIds = mode === 'full' ? null : scenesForFrames(timeline, first, last);

const queue = [];
for (let n = first; n <= last; n++) queue.push(n);
const total = queue.length;
let done = 0;
const t0 = Date.now();
const framePath = (n) => path.join(framesDir, `f${String(n).padStart(5, '0')}.png`);

async function worker(id) {
  const { page } = await openStage(browser, port, { scenes: sceneIds });
  while (queue.length) {
    const n = queue.shift();
    if (reuse && fs.existsSync(framePath(n))) { done++; continue; }
    const png = await renderFrame(page, n, fps, { blur });
    fs.writeFileSync(framePath(n), png);
    done++;
    if (done % 30 === 0 || done === total) {
      const el = (Date.now() - t0) / 1000;
      process.stdout.write(`\r[render] ${done}/${total} frames · ${el.toFixed(0)}s · eta ${((el / done) * (total - done)).toFixed(0)}s   `);
    }
  }
  await page.close();
}
await Promise.all(Array.from({ length: Math.min(workers, total) }, (_, i) => worker(i)));
process.stdout.write('\n');
await browser.close();
await close();

if (mode === 'single') {
  const out = path.resolve(ROOT, opt('out', `renders/frames/f${String(first).padStart(5, '0')}.png`));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.copyFileSync(framePath(first), out);
  console.log(`[render] wrote ${path.relative(ROOT, out)}`);
  process.exit(0);
}

const outDefault = mode === 'full' ? 'renders/lemlist_reconstruction.mp4'
  : mode === 'scene' ? `renders/scenes/${opt('scene')}.mp4` : `renders/range_${first}-${last}.mp4`;
const out = path.resolve(ROOT, opt('out', outDefault));
fs.mkdirSync(path.dirname(out), { recursive: true });
const audio = path.join(ROOT, 'assets/audio/source-mix.m4a');
const withAudio = !argv.includes('--no-audio') && fs.existsSync(audio);

const args = ['-y', '-v', 'error', '-framerate', String(fps), '-start_number', String(first), '-i', path.join(framesDir, 'f%05d.png')];
if (withAudio) {
  if (mode === 'full') args.push('-i', audio);
  else args.push('-ss', (first / fps).toFixed(6), '-t', ((last - first + 1) / fps).toFixed(6), '-i', audio);
}
args.push('-frames:v', String(total), '-map', '0:v');
if (withAudio) args.push('-map', '1:a');
args.push('-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-profile:v', 'high',
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
  '-r', String(fps), '-movflags', '+faststart');
// Full render: the original AAC stream is copied bit-for-bit (source audio reused, not recreated).
if (withAudio) args.push(...(mode === 'full' ? ['-c:a', 'copy'] : ['-c:a', 'aac', '-b:a', '192k']));
args.push(out);

console.log(`[encode] ffmpeg → ${path.relative(ROOT, out)}`);
await new Promise((res, rej) => {
  const p = spawn('ffmpeg', args, { stdio: 'inherit' });
  p.on('exit', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`))));
});
if (!argv.includes('--keep') && mode !== 'full') fs.rmSync(framesDir, { recursive: true, force: true });
console.log(`[done] ${path.relative(ROOT, out)} (${(fs.statSync(out).size / 1e6).toFixed(1)} MB, ${((Date.now() - t0) / 1000).toFixed(0)}s)`);
