// Registry: scene id (as used in src/timeline.json) -> scene module.
import { placeholder } from './_placeholder.js';
import s01 from './s01-ok-ring.js';
import s02 from './s02-sixty-seconds.js';
import s03 from './s03-pourquoi.js';
import s04 from './s04-logo-cube.js';
import s05 from './s05-pill-website.js';
import s06 from './s06-victor-email.js';

export const scenes = {
  s01,
  s02,
  s03,
  s04,
  s05,
  s06,
};

// Any scene listed in the timeline without a module yet gets a labelled placeholder.
const variants = { s07: 'dark', s08: 'dark', s09: 'dark', s10: 'dark', s11: 'dark', s12: 'dark', s13: 'dark', s14: 'dark', s18: 'blue', s19: 'blue', s20: 'blue', s21: 'blue', s22: 'blue', s23: 'blue' };
for (let i = 1; i <= 25; i++) {
  const id = `s${String(i).padStart(2, '0')}`;
  if (!scenes[id]) scenes[id] = placeholder(id, variants[id] || 'light');
}
