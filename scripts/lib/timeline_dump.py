"""Rewrite src/timeline.json in the compact one-scene-per-line layout.
Usage: python3 scripts/lib/timeline_dump.py  (after editing the json by hand or by script)"""
import json, sys, os
p = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'timeline.json')
def dump(d):
    out = ['{']
    for k in [k for k in d if k != 'scenes']:
        out.append('  %s: %s,' % (json.dumps(k), json.dumps(d[k], ensure_ascii=False)))
    out.append('  "scenes": [')
    out.append(',\n'.join('    ' + json.dumps(s, ensure_ascii=False) for s in d['scenes']))
    out.append('  ]\n}')
    return '\n'.join(out) + '\n'
if __name__ == '__main__':
    d = json.load(open(p))
    open(p, 'w').write(dump(d))
