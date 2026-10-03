// S04 · f155–203 · Hard cut into an extreme close-up of the blue lemlist cube;
// it pulls back very fast (f155–f161), then keeps tumbling (rotateY/rotateX)
// while shrinking slowly (f161–f200) and finally collapses into the logo
// square of the pill (f200–f203, handed over to S05 at f204).
// Measured bounding box width / centre per frame: docs/ANALYSIS.md §S04.

import { el, css } from '../engine/dom.js';
import { track, sampled } from '../engine/anim.js';
import { Background } from '../components/Background.js';
import { Cube } from '../components/Cube.js';

const F = (n) => n / 60;
// projected bbox width (px) and centre, measured
const BOX = [[155, 9000, [960, 700]], [157, 3200, [960, 260]], [159, 700, [950, 490]], [161, 480, [980, 530]], [163, 428, [974, 532]],
  [165, 420, [970, 532]], [167, 400, [960, 538]], [169, 392, [964, 542]], [171, 380, [970, 540]], [175, 372, [974, 544]],
  [179, 356, [970, 540]], [183, 340, [970, 536]], [186, 316, [970, 540]], [190, 300, [970, 538]], [194, 276, [970, 536]],
  [196, 260, [970, 542]], [198, 240, [968, 542]], [200, 220, [970, 536]], [202, 112, [944, 530]], [203, 84, [947, 534]], [204, 84, [947, 534]]]
  .map(([f, w, c]) => [F(f - 155), [w, c[0], c[1]]]);

export default {
  mount(root) {
    root.appendChild(Background({ variant: 'light' }).node);
    // 2D wrapper (position / scale of the projected cube) > perspective view > 3D cube
    this.wrap = el('div', { style: { position: 'absolute', left: '0', top: '0', transformOrigin: '0 0' } });
    this.view = el('div', { style: { position: 'absolute', left: '0', top: '0', width: '0', height: '0', perspective: '1100px', perspectiveOrigin: '0 0', transformStyle: 'preserve-3d' } });
    this.wrap.appendChild(this.view);
    root.appendChild(this.wrap);
    this.cube = Cube({ size: 300 });
    this.view.appendChild(this.cube.node);
    // f155: the camera is inside the blue face -> solid blue frame
    this.flood = el('div', { style: { position: 'absolute', inset: '0', background: 'linear-gradient(180deg, #3d6ff0 0%, #3466ee 60%, #2f5fe6 100%)' } });
    root.appendChild(this.flood);
  },
  update(t) {
    const fr = t * 60 + 155;
    const [w, cx, cy] = sampled(t, BOX);
    // tumbling: the left and top faces turn into view (f161 -> f200)
    const ry = track(t, [[0, -4], [6, 8], [16, 24], [31, 38], [45, 48], [48, 52]]);
    const rx = track(t, [[0, 6], [6, -6], [16, -14], [31, -24], [45, -34], [48, -38]]);
    const rz = track(t, [[0, -2], [6, -8], [16, -12], [31, -14], [48, -16]]);
    const rad = (d) => (d * Math.PI) / 180;
    const k = Math.abs(Math.cos(rad(ry))) + Math.abs(Math.sin(rad(ry))) * 0.9 + Math.abs(Math.sin(rad(rx))) * 0.3;
    this.cube.set({ rx, ry, rz });
    css(this.wrap, { transform: `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px) scale(${(w / (300 * k)).toFixed(4)})` });
    css(this.flood, { opacity: fr < 156 ? 1 : 0 });
  },
};
