// "lemlist" pill: frosted outer ring + white card + logo mark + word typed in.
// Geometry is expressed in units of the logo size L (measured at f300, L = 63 px):
//   outer box 4.76 L x 1.65 L, inner white box 4.44 L x 1.33 L, logo inset 0.17 L,
//   word = Inter 500 at 0.93 L, starting 0.25 L right of the logo.
// Used in S05, S13 and S20 (the same object appears three times in the video).
//
//   const p = LogoPill({ L: 63 });
//   p.set({ cx, cy, scale, chars, opacity })  // (cx, cy) = centre of the logo square

import { el, css } from '../engine/dom.js';
import { mixColor, clamp } from '../engine/anim.js';
import { logoSvg } from './Logo.js';
import { TextLine } from './TextLine.js';

export function LogoPill({ L = 63, text = 'lemlist', textColor = '#202b45', typingColor = '#93abf5', width = 4.76 } = {}) {
  const node = el('div', { style: { position: 'absolute', left: '0', top: '0', transformOrigin: '0 0' } });
  const outer = el('div', {
    style: {
      position: 'absolute', left: `${-0.17 * L - 0.16 * L - L / 2}px`, top: `${-0.16 * L - 0.16 * L - L / 2}px`,
      width: `${width * L}px`, height: `${1.65 * L}px`, borderRadius: `${0.36 * L}px`,
      background: 'rgba(222, 227, 242, 0.72)', boxShadow: `0 ${0.06 * L}px ${0.25 * L}px rgba(40, 60, 140, 0.06)`,
    },
  });
  const inner = el('div', {
    style: {
      position: 'absolute', left: `${0.16 * L}px`, top: `${0.16 * L}px`, width: `${(width - 0.32) * L}px`, height: `${1.33 * L}px`,
      borderRadius: `${0.22 * L}px`, background: '#ffffff', boxShadow: `0 ${0.03 * L}px ${0.1 * L}px rgba(40, 60, 140, 0.10)`,
    },
  });
  outer.appendChild(inner);
  const logo = el('div', { html: logoSvg(L), style: { position: 'absolute', left: `${-L / 2}px`, top: `${-L / 2}px`, width: `${L}px`, height: `${L}px` } });
  const line = TextLine({ text, size: 0.93 * L, weight: 500, color: textColor, split: 'char', letterSpacing: -0.005 });
  const textWrap = el('div', { style: { position: 'absolute', left: `${L / 2 + 0.25 * L}px`, top: `${-L / 2 + 0.86 * L}px` } }, [line.node]);
  node.append(outer, logo, textWrap);

  /**
   * chars: number of visible characters (fractional = the newest one fading in).
   * settle(i): 0..1, how far character i has gone from the light "typing"
   *            colour to the final navy (default: already settled).
   */
  function set({ cx = 960, cy = 540, scale = 1, chars = text.length, settle = () => 1, opacity = 1, boxOpacity = 1, boxScaleX = 1, blur = 0, logoOpacity = 1, logoScale = 1 } = {}) {
    css(node, { transform: `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px) scale(${scale.toFixed(4)})`, opacity, filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none' });
    css(outer, { opacity: boxOpacity, transform: `scaleX(${boxScaleX})`, transformOrigin: `${0.33 * L}px 50%` });
    css(logo, { opacity: logoOpacity, transform: logoScale !== 1 ? `scale(${logoScale.toFixed(4)})` : 'none' });
    line.items.forEach((it, i) => {
      css(it.node, { opacity: clamp(chars - i), color: mixColor(typingColor, textColor, clamp(settle(i))) });
    });
  }
  return { node, set, L };
}
