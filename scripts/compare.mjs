#!/usr/bin/env node
// Side-by-side fidelity check against the reference video.
//
//   node scripts/compare.mjs --frames 0,12,24,48          explicit frames
//   node scripts/compare.mjs --scene s05 --step 6          every 6th frame of a scene
//   node scripts/compare.mjs --frames 100-160 --step 4
//
// For each frame it writes renders/compare/cmp_fNNNNN.jpg, a 2x2 mosaic:
//   [ reference | reconstruction ]
//   [ |difference| x3 | 50 % overlay ]
// plus renders/compare/sheet_<label>.jpg (all mosaics tiled) and prints the
// mean absolute error per frame. A low global error is NOT a proof of
// fidelity (a matching background hides wrong motion): look at the mosaics.
//
// Reference frames are read from reference/frames/fNNNNN.jpg if present
// (ffmpeg -i reference/lemlist_1080p.mp4 -vsync 0 -q:v 2 -start_number 0 reference/frames/f%05d.jpg)
// otherwise extracted on the fly from --source (default reference/lemlist_1080p.mp4).

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';
import { startServer, ROOT } from './lib/server.mjs';
import { launchBrowser, openStage, renderFrame, loadTimeline, scenesForFrames } from './lib/browser.mjs';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : d; };
const timeline = loadTimeline();
const fps = timeline.fps;
const step = +opt('step', 1);
let frames = [];
let label = 'custom';
if (opt('scene')) {
  const s = timeline.scenes.find((x) => x.id === opt('scene'));
  for (let n = s.in; n < s.out; n += step) frames.push(n);
  label = s.id;
} else if (opt('frames')) {
  const spec = opt('frames');
  for (const part of spec.split(',')) {
    if (part.includes('-')) { const [a, b] = part.split('-').map(Number); for (let n = a; n <= b; n += step) frames.push(n); }
    else frames.push(+part);
  }
  label = spec.replace(/,/g, '_').slice(0, 40);
}
if (!frames.length) { console.error('usage: compare.mjs --frames a,b,c | --scene id [--step n]'); process.exit(1); }
const blur = !argv.includes('--no-blur');
const source = path.resolve(ROOT, opt('source', 'reference/lemlist_1080p.mp4'));
const outDir = path.join(ROOT, 'renders/compare');
const tmp = path.join(outDir, '.tmp');
fs.mkdirSync(tmp, { recursive: true });

function refFrame(n) {
  const p = path.join(ROOT, 'reference/frames', `f${String(n).padStart(5, '0')}.jpg`);
  if (fs.existsSync(p)) return p;
  const q = path.join(tmp, `ref_${n}.png`);
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', source, '-vf', `select=eq(n\\,${n})`, '-vsync', '0', '-frames:v', '1', q]);
  return q;
}

const { port, close } = await startServer();
const browser = await launchBrowser();
const { page } = await openStage(browser, port, { scenes: scenesForFrames(timeline, Math.min(...frames), Math.max(...frames)) });
const outs = [];
for (const n of frames) {
  const recon = path.join(tmp, `rec_${n}.png`);
  fs.writeFileSync(recon, await renderFrame(page, n, fps, { blur }));
  const ref = refFrame(n);
  const out = path.join(outDir, `cmp_f${String(n).padStart(5, '0')}.jpg`);
  const fc = '[0:v]scale=960:540,format=rgb24,split=3[a][a2][a3];[1:v]scale=960:540,format=rgb24,split=3[b][b2][b3];'
    + '[a2][b2]blend=all_mode=difference,lutrgb=r=val*3:g=val*3:b=val*3[d];[a3][b3]blend=all_mode=average[o];'
    + `[a][b]hstack[top];[d][o]hstack[bot];[top][bot]vstack,drawtext=text='f${n}  t=${(n / fps).toFixed(3)}s':x=10:y=10:fontcolor=yellow:fontsize=28:box=1:boxcolor=black@0.5`;
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', ref, '-i', recon, '-filter_complex', fc, '-q:v', '3', out]);
  // mean absolute error (0-255) on the full-resolution images
  const refPng = path.join(tmp, `refpng_${n}.png`);
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', ref, '-pix_fmt', 'rgba', refPng]);
  const A = PNG.sync.read(fs.readFileSync(refPng)).data, B = PNG.sync.read(fs.readFileSync(recon)).data;
  let s = 0; for (let i = 0; i < A.length; i += 4) s += Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]);
  const mae = s / (A.length / 4) / 3;
  console.log(`f${n}\tt=${(n / fps).toFixed(3)}\tMAE=${mae.toFixed(2)}\t${path.relative(ROOT, out)}`);
  outs.push(out);
}
await browser.close();
await close();
if (outs.length > 1) {
  const cols = Math.min(3, outs.length);
  const list = outs.map((o) => ['-i', o]).flat();
  const rows = Math.ceil(outs.length / cols);
  const layout = outs.map((_, i) => `${(i % cols) * 960}_${Math.floor(i / cols) * 540}`).join('|');
  const sheet = path.join(outDir, `sheet_${label}.jpg`);
  execFileSync('ffmpeg', ['-y', '-v', 'error', ...list, '-filter_complex',
    `${outs.map((_, i) => `[${i}:v]scale=960:540[s${i}]`).join(';')};${outs.map((_, i) => `[s${i}]`).join('')}xstack=inputs=${outs.length}:layout=${layout}:fill=black`, '-q:v', '3', sheet]);
  console.log(`sheet: ${path.relative(ROOT, sheet)} (${cols}x${rows})`);
}
fs.rmSync(tmp, { recursive: true, force: true });
