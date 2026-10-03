// Registry: scene id (as used in src/timeline.json) -> scene module.
import { placeholder } from './_placeholder.js';
import s01 from './s01-ok-ring.js';

export const scenes = {
  s01,
};

// Any scene listed in the timeline without a module yet gets a labelled placeholder.
const variants = { s08: 'dark', s09: 'dark', s10: 'dark', s11: 'dark', s12: 'dark', s13: 'dark', s14: 'dark', s15: 'dark', s19: 'blue', s20: 'blue', s21: 'blue', s22: 'blue', s23: 'blue', s24: 'blue' };
for (let i = 1; i <= 26; i++) {
  const id = `s${String(i).padStart(2, '0')}`;
  if (!scenes[id]) scenes[id] = placeholder(id, variants[id] || 'light');
}
