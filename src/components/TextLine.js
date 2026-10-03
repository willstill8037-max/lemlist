// A line of text split into independently animatable words (or characters).
//
//   const line = TextLine({ text: 'pour vous expliquer', size: 119, weight: 700 });
//   parent.appendChild(line.node);           // (0,0) of line.node = baseline start (pen position)
//   line.items[1].node.style.color = '…';    // per-word styling
//   line.inkBox -> { left, right, top, bottom } relative to the pen position
//
// Words are absolutely positioned from canvas advance widths, so each word can
// be transformed (rotate / scale / blur / colour) without re-flowing the line.

import { el } from '../engine/dom.js';
import { measure, baseline } from '../engine/text.js';

export function TextLine({ text, tokens: customTokens = null, size = 100, weight = 700, letterSpacing = 0, color = '#22364f', split = 'word', family = 'Inter', align = 'left' } = {}) {
  const node = el('div', { style: { position: 'absolute', left: '0', top: '0', width: '0', height: '0', transformStyle: 'preserve-3d' } });
  const opts = { weight, size, letterSpacing, family };
  if (customTokens) text = customTokens.join('');
  const tokens = customTokens || (split === 'char' ? [...text] : text.split(/(\s+)/).filter((s) => s.length));
  const full = measure(text, opts);
  const base = baseline() * size;
  const shift = align === 'center' ? -full.advance / 2 : align === 'right' ? -full.advance : 0;
  const items = [];
  let prefix = '';
  for (const tok of tokens) {
    const x = measure(prefix, opts).advance + shift;
    prefix += tok;
    if (/^\s+$/.test(tok)) continue;
    const m = measure(tok, opts);
    const span = el('div', {
      text: tok,
      style: {
        position: 'absolute', left: `${x.toFixed(2)}px`, top: `${(-base).toFixed(2)}px`, whiteSpace: 'pre',
        font: `${weight} ${size}px ${family}`, lineHeight: '1', letterSpacing: `${letterSpacing}em`, color,
        transformOrigin: `${(m.advance / 2).toFixed(2)}px ${base.toFixed(2)}px`,
      },
    });
    node.appendChild(span);
    items.push({ node: span, text: tok, x, advance: m.advance, ink: { left: x + m.inkLeft, right: x + m.inkRight, top: -m.ascent, bottom: m.descent }, cx: x + (m.inkLeft + m.inkRight) / 2 });
  }
  const inkBox = { left: shift + full.inkLeft, right: shift + full.inkRight, top: -full.ascent, bottom: full.descent };
  return { node, items, inkBox, advance: full.advance, size, baselineOffset: base };
}
