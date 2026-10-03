// lemlist logo mark, redrawn as SVG from the video (sharpest instance: f1787,
// 84 px). Blue rounded square #3866F9 + white "L" and two bars (stroke 9/100).
// Provenance: vector redraw by measurement — not the official brand file.

export const LOGO_BLUE = '#3866f9';

export function logoGlyphPaths(stroke = '#fff') {
  return `<path d="M32 29.5 V62.5 Q32 68.6 38 68.6 H70" fill="none" stroke="${stroke}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<path d="M49.3 30.5 H70.1 M49.3 50.3 H67.3" fill="none" stroke="${stroke}" stroke-width="9" stroke-linecap="round"/>`;
}

export function logoSvg(size = 100, { bg = LOGO_BLUE, fg = '#fff', radius = 16 } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100" style="display:block">`
    + `<rect x="0" y="0" width="100" height="100" rx="${radius}" fill="${bg}"/>${logoGlyphPaths(fg)}</svg>`;
}
