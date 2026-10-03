// Registry: scene id (as used in src/timeline.json) -> scene module.
import { placeholder } from './_placeholder.js';
import s01 from './s01-ok-ring.js';
import s02 from './s02-sixty-seconds.js';
import s03 from './s03-pourquoi.js';
import s04 from './s04-logo-cube.js';
import s05 from './s05-pill-website.js';
import s06 from './s06-victor-email.js';
import s07 from './s07-spam-inbox.js';
import s08 from './s08-falling-pile.js';
import s09 from './s09-et-oui.js';
import s11 from './s11-mosquito-bzzzz.js';
import s12 from './s12-cest-exactement.js';
import s14 from './s14-black.js';
import s15 from './s15-vous-contactez.js';
import s16 from './s16-prompt-typing.js';
import s17 from './s17-leads-table.js';
import s18 from './s18-blue-flow.js';
import s19 from './s19-resultat.js';
import s20 from './s20-replies.js';

export const scenes = {
  s01,
  s02,
  s03,
  s04,
  s05,
  s06,
  s07,
  s08,
  s09,
  s11,
  s12,
  s14,
  s15,
  s16,
  s17,
  s18,
  s19,
  s20,
};

// Any scene listed in the timeline without a module yet gets a labelled placeholder.
const variants = { s07: 'dark', s08: 'dark', s09: 'dark', s10: 'dark', s11: 'dark', s12: 'dark', s13: 'dark', s14: 'dark', s18: 'blue', s19: 'blue', s20: 'blue', s21: 'blue', s22: 'blue', s23: 'blue' };
for (let i = 1; i <= 23; i++) {
  const id = `s${String(i).padStart(2, '0')}`;
  if (!scenes[id]) scenes[id] = placeholder(id, variants[id] || 'light');
}
