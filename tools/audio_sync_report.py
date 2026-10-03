#!/usr/bin/env python3
"""Cross-reference visual events (scene cuts + key actions) with the detected
audio onsets (docs/analysis/audio_onsets.csv). Writes docs/analysis/audio_sync.txt.
Run after tools/analyze_audio.py."""
import csv, json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(ROOT, 'docs', 'analysis')
rows = [(float(r['time_s']), float(r['strength']), r['dominant_band']) for r in csv.DictReader(open(os.path.join(A, 'audio_onsets.csv')))]
tl = json.load(open(os.path.join(ROOT, 'src', 'timeline.json')))
events = [(s['in'] / 60, s['id'] + ' cut') for s in tl['scenes']]
events += [(f / 60, lab) for f, lab in [(52, 'ring → 60.S'), (84, 'pull-back'), (204, 'cube → pill'), (226, 'site swings up'), (366, 'Victor card lands'),
    (530, 'Envoyer click'), (586, 'row 1 selected'), (604, 'rows 2-4 selected'), (666, 'mails deleted / refill'), (706, 'row select'), (779, 'popup on plane'),
    (874, 'cut to pile'), (886, 'mail lands on pile'), (976, 'avatar + crown'), (1010, 'crown hits avatar'), (1072, 'cut: vous êtes'), (1184, 'avatar shatters'),
    (1360, 'big bzzzz'), (1596, 'bzzzz title'), (1652, 'flamethrower'), (1758, 'logo pop'), (1812, 'Vous'), (1919, 'typing ends'), (1974, 'Démarrer click'),
    (2064, 'signal lifts'), (2208, 'whip pan 1'), (2274, 'whip pan 2'), (2324, 'tree grows'), (2519, 'Plus'), (2622, 'replies sucked in'),
    (2707, 'logo pop'), (2784, 'CTA click'), (2915, 'URL card')]]
strong = [r for r in rows if r[1] >= 0.45]
best = max(((sum(s for t, s, _ in strong if min((t - ph) % 0.5, 0.5 - (t - ph) % 0.5) < 0.04), ph) for ph in [i / 1000 for i in range(0, 500, 5)]))
lines = ['120 BPM grid best phase: %.3f s (only %.0f %% of strong-onset weight within ±40 ms of the grid -> edit is NOT locked to a strict beat grid)'
         % (best[1], 100 * best[0] / sum(s for _, s, _ in strong)), '',
         'time_s  frame  event                      nearest_onset_delta  onset_strength']
within = 0
for t, lab in sorted(events):
    n = min(rows, key=lambda r: abs(r[0] - t))
    within += abs(n[0] - t) <= 0.067
    lines.append('%6.3f  %5d  %-26s %+7.3f s            %.2f' % (t, round(t * 60), lab, n[0] - t, n[1]))
lines.insert(1, '%d / %d visual events have an audio onset within ±4 frames (±67 ms).' % (within, len(events)))
open(os.path.join(A, 'audio_sync.txt'), 'w').write('\n'.join(lines) + '\n')
print('\n'.join(lines[:3]))
