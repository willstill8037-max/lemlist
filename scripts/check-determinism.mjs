#!/usr/bin/env node
// Determinism check: renders a set of frames in two independent browser
// sessions, in two different orders (forward / shuffled), and verifies the
// PNGs are pixel-identical. Exit code 1 on any difference.
//
//   node scripts/check-determinism.mjs [--frames 0,300,900,1500,2200,3000]

import { PNG } from 'pngjs';
import { startServer } from './lib/server.mjs';
import { launchBrowser, openStage, renderFrame, loadTimeline } from './lib/browser.mjs';

const i = process.argv.indexOf('--frames');
const frames = (i > 0 ? process.argv[i + 1] : '0,40,120,300,620,1000,1180,1370,1660,1880,2100,2250,2360,2510,2650,2800,3050').split(',').map(Number);
const timeline = loadTimeline();
const { port, close } = await startServer();

async function session(order) {
  const browser = await launchBrowser();
  const { page } = await openStage(browser, port);
  const out = {};
  for (const n of order) out[n] = PNG.sync.read(await renderFrame(page, n, timeline.fps)).data;
  await browser.close();
  return out;
}
const a = await session(frames);
const shuffled = [...frames].sort((x, y) => ((x * 7919) % 101) - ((y * 7919) % 101));
const b = await session(shuffled);
let bad = 0;
for (const n of frames) {
  let diff = 0;
  for (let k = 0; k < a[n].length; k++) if (a[n][k] !== b[n][k]) diff++;
  console.log(`f${n}\t${diff === 0 ? 'identical' : `${diff} bytes differ`}`);
  if (diff) bad++;
}
await close();
console.log(bad ? `FAIL: ${bad} frame(s) differ` : `OK: ${frames.length} frames identical across sessions and seek orders`);
process.exit(bad ? 1 : 0);
