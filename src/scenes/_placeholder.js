// Fallback scene used while a scene module is not written yet.
import { el } from '../engine/dom.js';
import { Background } from '../components/Background.js';

export function placeholder(id, variant = 'light') {
  return {
    mount(root, ctx) {
      root.appendChild(Background({ variant }).node);
      root.appendChild(el('div', { text: `${id} – ${ctx.def.title}`, style: { position: 'absolute', left: '60px', top: '60px', font: '600 40px Inter', color: variant === 'light' ? '#1f2a44' : '#fff' } }));
    },
    update() {},
  };
}
