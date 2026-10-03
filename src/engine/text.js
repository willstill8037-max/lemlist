// Text metrics helpers (canvas based, deterministic once the fonts are loaded).

const ctx2d = document.createElement('canvas').getContext('2d');

export function fontString(weight, size, family = 'Inter') {
  return `${weight} ${size}px ${family}`;
}

/** Advance width + ink box of a string. Values in px. */
export function measure(text, { weight = 700, size = 100, letterSpacing = 0, family = 'Inter' } = {}) {
  ctx2d.font = fontString(weight, size, family);
  ctx2d.letterSpacing = `${letterSpacing * size}px`;
  const m = ctx2d.measureText(text);
  return {
    advance: m.width,
    inkLeft: -m.actualBoundingBoxLeft, inkRight: m.actualBoundingBoxRight,
    inkWidth: m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
    ascent: m.actualBoundingBoxAscent, descent: m.actualBoundingBoxDescent,
  };
}

let baselineRatio = null;
/**
 * Distance from the top of a `line-height: 1` box to the alphabetic baseline,
 * as a fraction of the font size (measured once in the DOM).
 */
export function baseline() {
  if (baselineRatio !== null) return baselineRatio;
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;left:-9999px;top:0;font:700 100px Inter;line-height:1;white-space:pre';
  const txt = document.createElement('span'); txt.textContent = 'x';
  const mark = document.createElement('span'); mark.style.cssText = 'display:inline-block;width:1px;height:0;vertical-align:baseline';
  probe.append(txt, mark);
  document.body.appendChild(probe);
  baselineRatio = (mark.getBoundingClientRect().top - probe.getBoundingClientRect().top) / 100;
  probe.remove();
  return baselineRatio;
}
