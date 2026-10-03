#!/usr/bin/env node
// Typography calibration helper: prints the INK bounding box (canvas
// actualBoundingBox*) of a string set in Inter, so font sizes can be solved
// from ink boxes measured on the reference frames.
//
//   node scripts/measure-text.mjs "pour vous expliquer" 700 100 [-0.02]
//   (text, weight, size px, letterSpacing em)  -> width / ascent / descent
//   add --target-width 1148 to get the size that yields that ink width.

import { startServer } from './lib/server.mjs';
import { launchBrowser } from './lib/browser.mjs';

const [text, weight = '700', size = '100', ls = '0'] = process.argv.slice(2).filter((a, i, arr) => !a.startsWith('--') && !(arr[i - 1] || '').startsWith('--'));
const ti = process.argv.indexOf('--target-width');
const target = ti > 0 ? +process.argv[ti + 1] : null;
const { port, close } = await startServer();
const browser = await launchBrowser();
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${port}/src/index.html?render=1&scenes=none`);
await page.evaluate(() => window.__ready);
const r = await page.evaluate(async ({ text, weight, size, ls }) => {
  await document.fonts.load(`${weight} ${size}px Inter`);
  const c = document.createElement('canvas').getContext('2d');
  c.font = `${weight} ${size}px Inter`;
  c.letterSpacing = `${ls * size}px`;
  const m = c.measureText(text);
  return { advance: m.width, inkLeft: -m.actualBoundingBoxLeft, inkRight: m.actualBoundingBoxRight, inkWidth: m.actualBoundingBoxLeft + m.actualBoundingBoxRight, ascent: m.actualBoundingBoxAscent, descent: m.actualBoundingBoxDescent };
}, { text, weight: +weight, size: +size, ls: +ls });
console.log(JSON.stringify(r, null, 1));
if (target) console.log(`size for ink width ${target}: ${(+size * target / r.inkWidth).toFixed(2)} px`);
await browser.close(); await close();
