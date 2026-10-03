// HTML rebuild of the lemlist homepage hero shown in S05 (f226–f368).
// Coordinates are SCREEN pixels of reference frame f300, where the page is at
// rest (scale 1), so the component can be checked 1:1 against that frame.
// Text sizes solved from ink widths: headline Inter 700 43.2 px, subtitle
// Inter 400 18 px, CTA Inter 600 14.3 px. Badge icons are simplified redraws.

import { el } from '../engine/dom.js';
import { logoSvg } from './Logo.js';
import { TextLine } from './TextLine.js';
import { content } from '../content/texts.fr.js';

const NAVY = '#27334d', BLUE = '#3f66e7';
const abs = (x, y, w, h, extra = {}) => ({ position: 'absolute', left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, ...extra });
const txt = (s, x, y, size, weight, color, extra = {}) => el('div', { text: s, style: { position: 'absolute', left: `${x}px`, top: `${y}px`, font: `${weight} ${size}px Inter`, color, whiteSpace: 'pre', lineHeight: '1', ...extra } });

function chevron(x, y, color = '#7d8494') {
  return el('div', { html: `<svg width="9" height="6" viewBox="0 0 9 6"><path d="M1 1 L4.5 4.5 L8 1" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round"/></svg>`, style: { position: 'absolute', left: `${x}px`, top: `${y}px` } });
}

export function Website() {
  const c = content.website;
  const node = el('div', { style: { position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px', transformOrigin: '0 0' } });
  // frosted bezel + white page
  node.appendChild(el('div', { style: abs(288, 428, 1340, 900, { borderRadius: '30px', background: 'rgba(236,240,253,0.55)', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.9), 0 10px 40px rgba(60,80,160,0.06)' }) }));
  const page = el('div', { style: abs(315, 455, 1288, 900, { borderRadius: '18px', background: '#ffffff', overflow: 'hidden' }) });
  node.appendChild(page);
  // nav (page-local coordinates = screen - (315, 455))
  const nx = (x) => x - 315, ny = (y) => y - 455;
  page.appendChild(el('div', { html: logoSvg(20), style: abs(nx(384), ny(476), 20, 20) }));
  page.appendChild(txt('lemlist', nx(410), ny(476), 19.5, 600, '#1d2740', { letterSpacing: '-0.01em' }));
  const nav = [['Produit', 514, true], ['Pour qui ?', 596, true], ['L’outbound qui marche', 696, true], ['Tarifs', 867, false], ['On recrute !', 926, false]];
  for (const [label, x, chev] of nav) {
    page.appendChild(txt(label, nx(x), ny(480), 12.6, 500, '#3b4252'));
    if (chev) page.appendChild(chevron(nx(x) + label.length * 6.55 + 1, ny(484)));
  }
  page.appendChild(txt('Connexion', nx(1283), ny(479), 12.6, 500, '#3b4252'));
  page.appendChild(el('div', { style: abs(nx(1367), ny(469), 63, 34, { borderRadius: '6px', border: '1px solid #e9ebf1', background: '#fff' }) }));
  page.appendChild(txt('Démo', nx(1382), ny(480), 12.6, 500, '#3b4252'));
  page.appendChild(el('div', { style: abs(nx(1440), ny(468), 98, 34, { borderRadius: '6px', background: '#4468da' }) }));
  page.appendChild(txt('Essai gratuit', nx(1455), ny(479), 12.6, 500, '#ffffff'));
  page.appendChild(el('div', { style: abs(0, ny(509), 1288, 1, { background: '#eef0f5' }) }));
  // hero panel
  page.appendChild(el('div', { style: abs(nx(400), ny(568), 1125, 700, { borderRadius: '24px', background: '#f5f6fa' }) }));
  // headline (2 lines, centred on x = 957), blue words: "outbound avec" / "précision"
  const h1 = TextLine({ text: c.headline[0], size: 43.2, weight: 700, color: NAVY, align: 'center' });
  const h2 = TextLine({ text: c.headline[1], size: 43.2, weight: 700, color: NAVY, align: 'center' });
  for (const it of h1.items) if (/outbound|avec/.test(it.text)) it.node.style.color = BLUE;
  for (const it of h2.items) if (/précision/.test(it.text)) it.node.style.color = BLUE;
  const hw = el('div', { style: { position: 'absolute', left: `${nx(957)}px`, top: '0' } }, [h1.node]);
  h1.node.style.top = `${ny(669)}px`;
  h2.node.style.top = `${ny(716)}px`;
  hw.appendChild(h2.node);
  page.appendChild(hw);
  // subtitle (2 lines, Inter 400 18 px, grey, centred on x ≈ 991)
  for (const [i, s] of c.subtitle.entries()) {
    const l = TextLine({ text: s, size: 18, weight: 400, color: '#5d6679', align: 'center' });
    l.node.style.left = `${nx(991)}px`; l.node.style.top = `${ny(760 + 25 * i)}px`;
    page.appendChild(l.node);
  }
  // CTA
  page.appendChild(el('div', { style: abs(nx(790), ny(814), 345, 43, { borderRadius: '6px', background: 'linear-gradient(90deg, #6e9afd 0%, #4f7ff1 45%, #3c69e8 100%)', boxShadow: '0 2px 8px rgba(60,105,232,0.25)' }) }));
  page.appendChild(txt(c.cta, nx(818), ny(828), 14.3, 600, '#ffffff'));
  page.appendChild(el('div', { html: '<svg width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="12" fill="rgba(255,255,255,0.22)"/><path d="M7.5 13 H17.5 M13.5 9 L17.5 13 L13.5 17" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>', style: abs(nx(1078), ny(822), 26, 26) }));
  // badges
  const card = (x, w) => el('div', { style: abs(nx(x), ny(880), w, 50, { borderRadius: '7px', background: '#ffffff', boxShadow: '0 2px 10px rgba(40,50,90,0.07)' }) });
  page.append(card(762, 86), card(870, 92), card(978, 186));
  page.appendChild(el('div', { html: '<svg width="18" height="18" viewBox="0 0 18 18"><path d="M1 7 L17 1 L10 17 L8.5 9.5 Z" fill="#2d9cdb"/><path d="M1 7 L8.5 9.5 L10 17" fill="#f2994a" opacity="0.8"/></svg>', style: abs(nx(774), ny(895), 18, 18) }));
  page.appendChild(txt('4.6', nx(806), ny(898), 14, 500, '#3b4252'));
  page.appendChild(txt('/ 5', nx(830), ny(899), 12.5, 400, '#9aa1ae'));
  page.appendChild(el('div', { html: '<svg width="28" height="28" viewBox="0 0 28 28"><rect width="28" height="28" rx="6" fill="#ef4b3f"/><path d="M18 10 A6 6 0 1 0 19.5 15.5 H14" fill="none" stroke="#fff" stroke-width="2.8"/></svg>', style: abs(nx(877), ny(891), 28, 28) }));
  page.appendChild(txt('4.6', nx(914), ny(898), 14, 600, '#2a3142'));
  page.appendChild(txt('/ 5', nx(938), ny(899), 12.5, 400, '#5a6170'));
  page.appendChild(el('div', { html: '<svg width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="14" fill="#1d6fa5"/><circle cx="15" cy="15" r="10.5" fill="#3aa4d8"/><text x="15" y="17" font-size="5" fill="#fff" text-anchor="middle" font-family="Inter">AICPA</text></svg>', style: abs(nx(988), ny(890), 30, 30) }));
  page.appendChild(txt('SOC 2 Type II certified', nx(1029), ny(899), 12.6, 400, '#5a6170'));
  // glossy diagonal sheen (reflection across the page)
  page.appendChild(el('div', { style: abs(nx(420), ny(520), 260, 900, { background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0.55) 60%, rgba(255,255,255,0) 100%)', transform: 'rotate(-28deg)', transformOrigin: '50% 0' }) }));
  return { node };
}
