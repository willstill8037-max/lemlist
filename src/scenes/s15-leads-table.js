// S15 · f1996–2159 · The prompt card is swept out to the left while the lemlist
// leads table slides in from the right (f1996–f2026), lying in perspective.
// The pointer hovers the "TROUVER TÉLÉPHONE" area; the first buying signal
// "A annoncé sa récente levée de fonds" lifts off the table with a blue glow
// (f2064–f2072); fast push-in (f2098–f2110, motion blur) that flattens the
// view onto the signal column, then a slow push until the cut at f2160.
// Placement: homography from 4 table anchors (name/logo of rows 1 and 7)
// measured on f2026, f2060, f2098 and derived from 4 other anchors on the
// front-facing frames f2110 and f2158 (docs/ANALYSIS.md §S15).

import { el, css } from '../engine/dom.js';
import { sampled, progress, clamp, lerp } from '../engine/anim.js';
import { homography, cssMatrix3d } from '../engine/homography.js';
import { Background } from '../components/Background.js';
import { LeadsTable, TABLE } from '../components/LeadsTable.js';
import { TextLine } from '../components/TextLine.js';
import { Cursor } from '../components/Cursor.js';
import { content } from '../content/texts.fr.js';

const G = (rows) => rows.map(([f, v]) => [f / 60, v]);
const ANCH = [[TABLE.x.name, TABLE.rowY[0]], [TABLE.x.logo, TABLE.rowY[0]], [TABLE.x.name, TABLE.rowY[6]], [TABLE.x.logo, TABLE.rowY[6]]];
const mapPts = (H, pts) => pts.map(([x, y]) => { const w = H[2][0] * x + H[2][1] * y + H[2][2]; return [(H[0][0] * x + H[0][1] * y + H[0][2]) / w, (H[1][0] * x + H[1][1] * y + H[1][2]) / w]; });
const FRONT_SRC = [[312, 538], [1440, 538], [778, 994], [1440, 994]];
const P2110 = mapPts(homography(FRONT_SRC, [[312, 538], [1440, 548], [774, 1012], [1458, 1014]]), ANCH);
const P2158 = mapPts(homography(FRONT_SRC, [[240, 566], [1420, 566], [734, 1046], [1424, 1046]]), ANCH);
const P2026 = [[422, 478], [1702, 438], [348, 886], [1752, 890]];
const shift = (P, dx) => P.map(([x, y]) => [x + dx, y]);
const KEYS = [[1996, shift(P2026, 1500)], [2002, shift(P2026, 1300)], [2008, shift(P2026, 700)], [2014, shift(P2026, 250)], [2020, shift(P2026, 60)],
  [2026, P2026], [2060, [[215, 600], [1520, 511], [70, 1008], [1528, 975]]], [2098, [[116, 580], [1482, 532], [-28, 1034], [1496, 1046]]],
  [2104, null], [2110, P2110], [2158, P2158], [2160, P2158]];
// f2104 = 60 % of the way 2098 -> 2110 (blurred transition frame)
KEYS[8][1] = KEYS[7][1].map((p, i) => [lerp(p[0], P2110[i][0], 0.6), lerp(p[1], P2110[i][1], 0.6)]);
const KEYROWS = G(KEYS.map(([f, P]) => [f, P.flat()]));

export default {
  mount(root) {
    root.appendChild(Background({ variant: 'light' }).node);
    const c = content.s15;
    // outgoing prompt card (continuation of S14)
    this.card = el('div', { style: { position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px' } });
    this.card.appendChild(el('div', { style: { position: 'absolute', left: '468px', top: '360px', width: '996px', height: '304px', borderRadius: '34px', background: 'rgba(214,220,238,0.75)' } }));
    this.card.appendChild(el('div', { style: { position: 'absolute', left: '480px', top: '372px', width: '972px', height: '280px', borderRadius: '26px', background: '#ffffff' } }));
    this.card.appendChild(el('div', { style: { position: 'absolute', left: '730px', top: '400px', width: '690px', height: '46px', borderRadius: '10px', background: '#f1f2f6' } }));
    const pt = TextLine({ text: content.s14.prompt, size: 19.8, weight: 500, color: '#1e2433' });
    css(pt.node, { transform: 'translate(752px, 428px)' });
    this.card.appendChild(pt.node);
    root.appendChild(this.card);
    this.layer = el('div', { style: { position: 'absolute', left: '0', top: '0', width: '0', height: '0', transformOrigin: '0 0' } });
    this.table = LeadsTable({ rows: c.rows, tabs: c.tabs, headers: c.headers });
    this.layer.appendChild(this.table.node);
    root.appendChild(this.layer);
    this.cursor = Cursor({ shape: 'plane', fill: '#1f2a44', stroke: 'rgba(255,255,255,0.9)', size: 1.0 });
    root.appendChild(this.cursor.node);
  },
  update(t) {
    const fr = t * 60 + 1996, T = fr / 60;
    const pts = sampled(T, KEYROWS);
    const P = [[pts[0], pts[1]], [pts[2], pts[3]], [pts[4], pts[5]], [pts[6], pts[7]]];
    css(this.layer, { transform: cssMatrix3d(homography(ANCH, P)), filter: fr < 2020 ? `blur(${(4 * (1 - progress(fr, 2008, 2020))).toFixed(2)}px)` : 'none' });
    const cx = sampled(T, G([[1996, 464], [2002, 352], [2008, 8], [2014, -500], [2020, -800]]));
    css(this.card, { transform: `translateX(${(cx - 480).toFixed(1)}px)`, display: fr < 2022 ? '' : 'none', filter: fr > 2003 ? 'blur(3px)' : 'none' });
    // highlighted signal lifts off with a glow
    const lift = progress(fr, 2064, 2072, 'easeOutCubic');
    const pulse = 0.85 + 0.15 * Math.sin((fr - 2072) / 9);
    css(this.table.highlight, { transform: `translate(${(-6 * lift).toFixed(2)}px, ${(-10 * lift).toFixed(2)}px)`, boxShadow: `0 ${(8 * lift).toFixed(1)}px ${(50 * lift).toFixed(1)}px rgba(70,110,255,${(0.75 * lift * pulse).toFixed(3)})` });
    const [mx, my] = sampled(T, G([[1996, [1400, 628]], [2002, [1384, 632]], [2008, [1292, 640]], [2014, [1144, 644]], [2020, [1036, 644]], [2026, [952, 644]],
      [2060, [888, 630]], [2098, [844, 636]], [2104, [700, 760]], [2110, [490, 910]], [2116, [300, 1150]]]));
    this.cursor.set({ x: mx, y: my, opacity: fr < 2116 ? 1 : 0 });
  },
};
