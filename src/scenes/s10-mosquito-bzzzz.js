// S10 · f1215–1509 · The mosquito hovers alone in the dark (f1216–f1308),
// a small "bzzzz" pops above it as the camera pushes in (f1312–f1358), then a
// closer framing (f1360–f1404) with a big receding "bzzzz" top right and a
// trail of small "bzzzz" letters behind its tail; pull back (f1404–f1426) and
// slow hover until the cut at f1510.
// All positions are screen space, measured on 1/4-scale index sheets (±8 px).

import { css } from '../engine/dom.js';
import { sampled, clamp } from '../engine/anim.js';
import { Background } from '../components/Background.js';
import { Mosquito } from '../components/Mosquito.js';
import { BuzzText } from '../components/BuzzText.js';
import { content } from '../content/texts.fr.js';

const G = (rows) => rows.map(([f, v]) => [f / 60, v]);
// thorax x, y, scale, rotation
const MOSQ = G([[1215, [945, 530, 0.78, 0]], [1216, [978, 555, 0.8, 0]], [1258, [1000, 552, 0.8, 0]], [1300, [998, 552, 0.8, 0]], [1308, [996, 549, 0.8, 0]],
  [1312, [975, 532, 0.95, 0]], [1316, [948, 505, 1.15, 0]], [1340, [945, 511, 1.2, 0]], [1356, [943, 508, 1.25, 0]], [1358, [930, 540, 1.35, 3]],
  [1360, [870, 700, 2.0, 15]], [1366, [850, 735, 2.1, 18]], [1384, [860, 736, 2.1, 18]], [1398, [840, 696, 2.0, 16]], [1404, [850, 690, 1.9, 15]],
  [1412, [880, 616, 1.4, 12]], [1420, [900, 580, 1.1, 10]], [1426, [905, 560, 0.95, 8]], [1440, [920, 548, 0.85, 6]], [1454, [920, 560, 0.85, 5]],
  [1496, [940, 560, 0.85, 4]], [1510, [930, 550, 0.85, 4]]]);
const SMALL = G([[1312, [830, 410, 0]], [1314, [820, 404, 88]], [1328, [780, 384, 160]], [1356, [780, 352, 180]], [1358, [780, 352, 180]]]);
const BIG = G([[1362, [1040, 410, 120]], [1366, [1030, 400, 306]], [1370, [1020, 416, 400]], [1384, [1020, 396, 468]], [1398, [1020, 376, 520]],
  [1412, [1020, 368, 404]], [1426, [1040, 388, 280]], [1440, [1020, 376, 272]], [1496, [1000, 380, 280]], [1510, [1000, 380, 282]]]);

export default {
  mount(root) {
    root.appendChild(Background({ variant: 'dark' }).node);
    const word = content.s10.buzz;
    this.big = BuzzText({ text: word });
    this.small = BuzzText({ text: word });
    this.trail = BuzzText({ text: word, ry: -10 });
    root.append(this.big.node, this.small.node, this.trail.node);
    this.mosq = Mosquito();
    root.appendChild(this.mosq.node);
  },
  update(t) {
    const fr = t * 60 + 1215, T = fr / 60;
    const [mx, my, ms, mr] = sampled(T, MOSQ);
    this.mosq.set({ x: mx, y: my, scale: ms * 1.18, rot: mr, t: T, blur: ms > 1.6 ? 1.2 : 0.4 });
    const [sx, sy, sw] = sampled(T, SMALL);
    this.small.set({ x: sx, y: sy, width: sw, rot: -12, opacity: fr >= 1313 && fr < 1360 ? 1 : 0 });
    const [bx, by, bw] = sampled(T, BIG);
    this.big.set({ x: bx, y: by, width: bw, rot: 8, opacity: fr >= 1362 ? clamp((fr - 1361) / 3) : 0, blur: 0.6 });
    // trail: hangs behind the abdomen, rotated, scales with the mosquito
    this.trail.set({ x: mx - 124 * ms, y: my - 29 * ms, width: 95 * ms, rot: -55, opacity: fr >= 1360 ? 0.8 : 0, blur: ms > 1.6 ? 1.5 : 0.6 });
  },
};
