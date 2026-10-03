// S18 · f2160–2384 · Blue workflow canvas (one continuous camera move).
//  f2160–2178 the buying-signal pill (taken from the table) settles (x0.81 -> x1).
//  f2208–2226 whip-pan right along the connector line (motion blur) to the
//            AI email card, which is typed at a decelerating rate (f2222–f2274).
//  f2274–2302 second whip-pan to the Gmail node; subject typed f2282–f2296.
//  f2310–2384 the camera drifts down and out while the sequence tree grows
//            branch by branch (6-frame pop per node).
// World = screen pixels of f2256 (line y 543). Camera = screen = s·world + T,
// measured from the tracked cards (docs/ANALYSIS.md §S18). Tree node boxes
// were measured on f2380 (s = 0.84, T = (-602, -482)) and converted to world.

import { el, css } from '../engine/dom.js';
import { sampled } from '../engine/anim.js';
import { Background } from '../components/Background.js';
import { SignalPill, AiEmailCard, GmailNode, SequenceTree, FLOW_Y } from '../components/Flow.js';
import { content } from '../content/texts.fr.js';

const G = (rows) => rows.map(([f, ...v]) => [f / 60, v]);
// [frame, s, Tx, Ty]
const CAM = G([[2160, 0.81, 1023, 97], [2166, 0.93, 1024, 32], [2172, 0.985, 1020, 2], [2178, 1, 1026, -6], [2184, 1, 1036, -6], [2190, 1, 1041, -6],
  [2196, 1, 1040, -6], [2202, 1, 1037, -6], [2208, 1, 1008, -6], [2214, 1, 909, -6], [2216, 1, 839, -6], [2220, 1, 615, -6], [2226, 1.024, 79, -6],
  [2232, 1.04, -7, -24], [2244, 1.012, -10.5, -7.5], [2256, 1, 0, 0], [2268, 1.006, -32, -3], [2274, 0.997, -105, 1], [2278, 0.973, -241, -4],
  [2280, 0.954, -407, 12], [2284, 1, -738, 0], [2288, 1, -832, 0], [2292, 1, -875, 0], [2296, 1, -894, 0], [2302, 1, -899, 0], [2310, 0.99, -880, -6],
  [2320, 0.97, -842, -43], [2332, 0.935, -775, -245], [2338, 0.892, -703, -317], [2344, 0.863, -649, -352], [2350, 0.849, -626, -366],
  [2356, 0.85, -628, -390], [2380, 0.84, -602, -482], [2385, 0.835, -596, -500]]);
const TYPED = G([[2221, 0], [2226, 43], [2232, 81], [2238, 117], [2244, 145], [2250, 171], [2256, 192], [2262, 209], [2268, 221], [2274, 225]]);
const SUBJ = G([[2282, 0], [2286, 14], [2290, 26], [2296, 32]]);
// tree: screen boxes measured on f2380 -> world
const k = 0.84, ox = 602, oy = 482;
const W = (x, y) => [(x + ox) / k, (y + oy) / k];
const box = (x0, y0, x1, y1) => { const [a, b] = W(x0, y0), [c, d] = W(x1, y1); return { x: a, y: b, w: c - a, h: d - b }; };
const pt = (x, y) => { const [a, b] = W(x, y); return { x: a, y: b }; };
const vline = (x, y0, y1, appear) => { const a = pt(x, y0), b = pt(x, y1); return { x: a.x - 1.5, y: a.y, w: 3, h: b.y - a.y, appear }; };
const hline = (x0, x1, y, appear) => { const a = pt(x0, y), b = pt(x1, y); return { x: a.x, y: a.y - 1.5, w: b.x - a.x, h: 3, appear, origin: '50% 50%' }; };
const BLUE = '#3f68e8';

export default {
  mount(root) {
    root.appendChild(Background({ variant: 'blue' }).node);
    const c = content.s18;
    this.world = el('div', { style: { position: 'absolute', left: '0', top: '0', width: '0', height: '0', transformOrigin: '0 0' } });
    root.appendChild(this.world);
    this.world.appendChild(el('div', { style: { position: 'absolute', left: '-1600px', top: `${FLOW_Y - 1.5}px`, width: '4600px', height: '3px', background: 'rgba(225,232,255,0.55)' } }));
    this.pill = SignalPill({ text: c.signal, avatar: '../assets/images/avatar-woman.png' });
    this.card = AiEmailCard({ lines: c.email });
    this.gmail = GmailNode({ name: c.from, to: c.to, subject: c.subject });
    const nodes = [
      { kind: 'cond', ...box(806, 110, 1100, 178), lines: [[['A un numéro de téléphone', null]]], appear: 2324 },
      { kind: 'yes', label: 'Oui', ...pt(757, 214), appear: 2328 }, { kind: 'no', label: 'Non', ...pt(1135, 209), appear: 2328 },
      { kind: 'step', ...box(368, 255, 733, 382), wait: 2, action: 'Appeler', color: '#e8476a', appear: 2332 },
      { kind: 'step', ...box(1137, 248, 1503, 381), wait: 2, action: 'Ajouter sur Linkedin', color: BLUE, appear: 2332 },
      { kind: 'plus', ...pt(546, 426), appear: 2336 }, { kind: 'plus', ...pt(1323, 424), appear: 2336 },
      { kind: 'step', ...box(353, 462, 727, 597), wait: 1, action: 'Envoyer un SMS', color: '#f0a020', appear: 2340 },
      { kind: 'step', ...box(1142, 460, 1518, 600), wait: 1, action: 'Visiter le profil Linkedin', color: BLUE, appear: 2340 },
      { kind: 'plus', ...pt(1333, 644), appear: 2344 },
      { kind: 'cond', ...box(1159, 684, 1515, 766), lines: [[['Invitation acceptée', BLUE], [' dans les', null]], [['2 jours', BLUE]]], appear: 2346 },
      { kind: 'yes', label: 'Oui', ...pt(1149, 811), appear: 2350 }, { kind: 'no', label: 'Non', ...pt(1526, 807), appear: 2350 },
      { kind: 'step', ...box(772, 858, 1158, 1008), wait: 2, action: 'Message de chat', color: BLUE, appear: 2352 },
      { kind: 'step', ...box(1532, 855, 1918, 1005), wait: 1, action: 'Email', color: '#2fb457', appear: 2352 },
    ];
    const links = [vline(964, 40, 110, 2322), vline(953, 178, 213, 2326), hline(556, 1316, 213, 2328), vline(556, 213, 255, 2330), vline(1316, 213, 248, 2330),
      vline(546, 382, 462, 2336), vline(1323, 381, 460, 2336), vline(1333, 600, 684, 2344), vline(1338, 766, 810, 2348), hline(965, 1720, 810, 2350),
      vline(965, 810, 858, 2351), vline(1720, 810, 855, 2351)];
    this.tree = SequenceTree({ nodes, links });
    this.world.append(this.pill.node, this.card.node, this.gmail.node, this.tree.node);
  },
  update(t) {
    const fr = t * 60 + 2160, T = fr / 60;
    const [s, tx, ty] = sampled(T, CAM);
    css(this.world, { transform: `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${s.toFixed(5)})` });
    css(this.card.node, { display: fr >= 2218 ? '' : 'none' });
    this.card.setTyped(sampled(T, TYPED));
    this.gmail.setTyped(sampled(T, SUBJ));
    css(this.gmail.node, { display: fr >= 2278 ? '' : 'none' });
    this.tree.set(fr);
  },
};
