// S16 · f1892–1995 · Close-up of the prompt field: "Trouve moi des CFOs B2B
// tech en France pour vendre ma solution" is typed at ~2 characters/frame
// (f1888–f1919) with a blinking caret; at f1946 the camera pulls back fast
// (motion blur) to the field with its "Démarrer" button; the pointer clicks
// (f1974), the message slides right into a grey bubble (f1964–f1970) and the
// button collapses into a small loader (f1980–f1992). The leads table of S17
// slides in from the right at f1990.
// World = screen pixels of f1958 (field 480–1452 x 372–652).

import { el, css } from '../engine/dom.js';
import { sampled, progress, clamp } from '../engine/anim.js';
import { Background } from '../components/Background.js';
import { TextLine } from '../components/TextLine.js';
import { Cursor } from '../components/Cursor.js';
import { content } from '../content/texts.fr.js';

const G = (rows) => rows.map(([f, v]) => [f / 60, v]);
const abs = (x, y, w, h, s = {}) => ({ position: 'absolute', left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, ...s });
// camera [tx, ty, k]
const CAM = G([[1892, [-129, -413, 1.81]], [1904, [-189, -413, 1.81]], [1916, [-189, -421, 1.81]], [1940, [-189, -389, 1.81]], [1946, [-200, -380, 1.8]],
  [1949, [-150, -260, 1.55]], [1952, [-29, -70, 1.144]], [1955, [-5, -12, 1.02]], [1958, [0, 0, 1]], [1994, [0, 0, 1]], [1996, [-72, 0, 1]]]);
const TYPED = G([[1887.5, 0], [1892, 9], [1898, 21], [1904, 32], [1910, 44], [1916, 57], [1919, 62]]);

export default {
  mount(root) {
    root.appendChild(Background({ variant: 'light' }).node);
    const c = content.s16;
    this.world = el('div', { style: { position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px', transformOrigin: '0 0' } });
    root.appendChild(this.world);
    this.world.appendChild(el('div', { style: abs(468, 360, 996, 304, { borderRadius: '34px', background: 'rgba(214,220,238,0.75)' }) }));
    this.world.appendChild(el('div', { style: abs(480, 372, 972, 280, { borderRadius: '26px', background: '#ffffff' }) }));
    this.bubble = el('div', { style: abs(730, 400, 690, 46, { borderRadius: '10px', background: '#f1f2f6' }) });
    this.world.appendChild(this.bubble);
    this.text = TextLine({ text: c.prompt, size: 19.8, weight: 500, color: '#1e2433', split: 'char' });
    this.world.appendChild(this.text.node);
    this.caret = el('div', { style: abs(0, 0, 2, 26, { background: '#1e2433' }) });
    this.world.appendChild(this.caret);
    this.btn = el('div', { style: abs(1260, 564, 160, 56, { borderRadius: '10px', background: '#3a64f3', transformOrigin: '50% 50%' }) });
    const bl = TextLine({ text: c.button, size: 20, weight: 600, color: '#ffffff', align: 'center' });
    css(bl.node, { transform: 'translate(80px, 35px)' });
    this.btnLabel = bl.node;
    this.btn.appendChild(bl.node);
    this.world.appendChild(this.btn);
    this.ripple = el('div', { style: abs(-22, -22, 44, 44, { borderRadius: '50%', border: '3px solid #1f2a44' }) });
    this.world.appendChild(this.ripple);
    this.cursor = Cursor({ shape: 'planeL', fill: '#1f2a44', stroke: 'rgba(255,255,255,0.9)', size: 0.55 });
    this.world.appendChild(this.cursor.node);
  },
  update(t) {
    const fr = t * 60 + 1892, T = fr / 60;
    const [tx, ty, k] = sampled(T, CAM);
    css(this.world, { transform: `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${k.toFixed(4)})` });
    const n = sampled(T, TYPED);
    // text slides right into the bubble (f1964 -> f1970)
    const slide = progress(fr, 1964, 1970, 'easeInOutCubic');
    css(this.text.node, { transform: `translate(${(512 + 240 * slide).toFixed(1)}px, ${(428 - 0 * slide).toFixed(1)}px)` });
    this.text.items.forEach((it) => css(it.node, { opacity: n > it.start ? 1 : 0 }));
    css(this.bubble, { opacity: slide, transform: `translateX(${(-240 * (1 - slide)).toFixed(1)}px)` });
    const last = this.text.items.filter((it) => n > it.start).pop();
    const caretX = last ? 512 + last.x + last.advance + 4 : 512;
    const blinkOn = fr < 1919 || Math.floor((fr - 1919) / 16) % 2 === 1;
    css(this.caret, { transform: `translate(${caretX.toFixed(1)}px, 406px)`, opacity: fr < 1950 && blinkOn ? 1 : 0 });
    // button press + collapse into a loader
    const press = progress(fr, 1973, 1976) - progress(fr, 1977, 1980);
    const collapse = progress(fr, 1980, 1988, 'easeInCubic');
    css(this.btn, { transform: `scale(${((1 - 0.06 * press) * (1 - 0.82 * collapse)).toFixed(4)}, ${((1 - 0.06 * press) * (1 - 0.7 * collapse)).toFixed(4)})`, opacity: fr < 1992 ? 1 : 0 });
    css(this.btnLabel, { opacity: 1 - collapse });
    const rp = progress(fr, 1974, 1984);
    css(this.ripple, { transform: `translate(1380px, 596px) scale(${(0.4 + 1.2 * rp).toFixed(3)})`, opacity: fr >= 1974 ? (1 - rp) * 0.8 : 0 });
    const [cx, cy] = sampled(T, G([[1950, [1460, 700]], [1956, [1408, 632]], [1964, [1400, 624]], [1976, [1382, 600]], [1984, [1396, 622]], [1996, [1400, 628]]]));
    this.cursor.set({ x: cx, y: cy, opacity: fr >= 1950 ? 1 : 0, press });
  },
};
