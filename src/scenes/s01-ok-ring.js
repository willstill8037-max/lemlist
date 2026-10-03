// S01 · f0–52 · "OK" inside a tilted glossy ring; the camera rushes in, flies
// through the ring and into the hole of the "O", which frames the next shot.
// Measurements (docs/ANALYSIS.md §S01): ring bbox width per frame, OK bbox
// width/centre per frame, ring band = 12 % of the diameter, ellipse tilt
// ~25° CCW, minor/major ≈ 0.82, highlights at ~1 o'clock and ~8 o'clock.

import { el, css } from '../engine/dom.js';
import { sampled, track } from '../engine/anim.js';
import { Background } from '../components/Background.js';
import { Ring } from '../components/Ring.js';
import { ExtrudedText } from '../components/Extruded.js';

const F = (n) => n / 60;
// Measured ring bbox width (px) by frame. 50-51: extrapolated (ring leaves frame).
const RING_W = [[0, 25], [1, 229], [2, 350], [3, 445], [4, 525], [5, 596], [6, 657], [7, 713], [8, 763], [9, 809], [10, 852],
  [11, 890], [12, 925], [13, 959], [14, 990], [15, 1019], [16, 1045], [17, 1070], [18, 1093], [19, 1115], [20, 1135], [22, 1173],
  [24, 1204], [26, 1233], [28, 1258], [30, 1280], [32, 1299], [34, 1316], [36, 1332], [38, 1346], [40, 1360], [42, 1374],
  [44, 1394], [45, 1407], [46, 1423], [47, 1450], [48, 1496], [49, 1604], [50, 2700], [51, 4600], [52, 9000]].map(([f, w]) => [F(f), w]);
// Measured "OK" bbox width (px) by frame (4-11 interpolated, 49-52 estimated from the blurred frames).
const OK_W = [[0, 7], [1, 64], [2, 83], [3, 97], [6, 128], [9, 152], [12, 170], [15, 186], [18, 201], [21, 214], [24, 225], [27, 236],
  [30, 249], [33, 261], [36, 277], [39, 295], [42, 321], [45, 364], [48, 449], [49, 560], [50, 690], [51, 1080], [52, 2300]].map(([f, w]) => [F(f), w]);
const OK_C = [[0, [960, 540]], [12, [965, 540]], [30, [972, 537]], [42, [987, 539]], [48, [1018, 537]], [50, [1095, 535]], [51, [1262, 534]], [52, [1450, 520]]]
  .map(([f, v]) => [F(f), v]);

export default {
  mount(root, ctx) {
    this.bg = Background({ variant: 'light' });
    root.appendChild(this.bg.node);
    const view = el('div', { style: { position: 'absolute', inset: '0', perspective: '6000px', perspectiveOrigin: '960px 540px', transformStyle: 'preserve-3d' } });
    root.appendChild(view);
    this.ring = Ring({ diameter: 1000, band: 0.12, color: '#3f66e6', dark: '#4267dc', light: '#eef1fb' });
    this.okWrap = el('div', { style: { position: 'absolute', left: '0', top: '0', perspective: '900px', transformStyle: 'preserve-3d' } });
    this.ok = ExtrudedText({
      text: 'OK', size: 100, weight: 900, depth: 30, layers: 20, letterSpacing: '-0.01em',
      faceImage: 'linear-gradient(165deg, #6fa6f8 0%, #4e88f0 40%, #4378e6 70%, #3a68d8 100%)', side: '#2f4a92', sideFar: '#1d2f6c',
    });
    this.okWrap.appendChild(this.ok.node);
    this.ringWrap = el('div', { style: { position: 'absolute', left: '960px', top: '540px', transformStyle: 'preserve-3d' } }, [this.ring.node]);
    view.append(this.okWrap, this.ringWrap);
    this.okBaseW = 150; // measured after fonts load (see update)
  },
  update(t) {
    if (!this.okMeasured) {
      const r = this.ok.front.getBoundingClientRect();
      if (r.width > 0) { this.okBaseW = r.width / (this.lastOkScale || 1); this.okMeasured = true; }
    }
    // portal frame (f52): only the giant "O" over the next scene
    const portal = t >= F(52) - 1e-6;
    css(this.bg.node, { opacity: portal ? 0 : 1 });

    // Ring: tilt grows from 9° to 25° over the first 20 frames, minor/major 0.70 -> 0.82
    // ellipse fit on the outer/inner band edges (f1-f18 outer, f21+ inner): tilt 12° -> 36°, minor/major 0.87 -> 0.82
    const rz = track(t, [[0, -10], [1, -12], [3, -20], [6, -26], [9, -30], [12, -33], [15, -35], [18, -36], [48, -36]]);
    const rx = track(t, [[0, 29], [1, 29.5], [6, 32], [18, 33.5], [36, 35], [48, 37]]);
    const rad = (d) => (d * Math.PI) / 180;
    const unitW = 1000 * Math.sqrt(Math.cos(rad(rz)) ** 2 + (Math.cos(rad(rx)) * Math.sin(rad(rz))) ** 2);
    const ringW = sampled(t, RING_W);
    const ringC = track(t, [[0, [960, 541]], [12, [963, 544]], [21, [965, 546]], [30, [961, 549]], [42, [960, 556]], [48, [956, 566]], [49, [960, 580]], [51, [990, 620]]]);
    this.ring.set({ x: ringC[0] - 960, y: ringC[1] - 540, scale: ringW / unitW, rx, rz, spin: 30, opacity: t < F(52) ? 1 : 0 });

    // OK: screen-space scale from measurements, small 3D tilt that increases during the fly-through
    const okW = sampled(t, OK_W);
    const [ox, oy] = sampled(t, OK_C);
    const s = okW / this.okBaseW;
    this.lastOkScale = s;
    const ry = track(t, [[0, 2], [44, 4], [49, 10], [51, 34], [52, 10]]);
    const rxo = track(t, [[0, -22], [44, -20], [51, -12]]);
    css(this.okWrap, { transform: `translate(${ox}px, ${oy}px) scale(${s})` });
    this.ok.set({ rx: rxo, ry: -ry });
  },
};
