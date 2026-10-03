// S14 · f1717–1747 · Hard cut to pure black (31 frames, exact RGB 0 in the
// reference: frame differences are 0.00 inside the hold).
import { el } from '../engine/dom.js';

export default {
  mount(root) { root.appendChild(el('div', { style: { position: 'absolute', inset: '0', background: '#000' } })); },
  update() {},
};
