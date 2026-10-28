#!/usr/bin/env python3
"""drafts/NN.json + verify/NN.json → sonuc-ham.json (her görsel için son alt metin). Eksikleri raporlar."""
import json, pathlib, sys
sys.stdout.reconfigure(encoding='utf-8')
HERE = pathlib.Path(__file__).resolve().parent
final, eksik = [], []
for bf in sorted((HERE / 'batches').glob('*.json')):
    n = bf.stem
    batch = json.loads(bf.read_text(encoding='utf-8'))
    load = lambda d: {x['id']: x for x in json.loads((HERE / d / f'{n}.json').read_text(encoding='utf-8'))} if (HERE / d / f'{n}.json').exists() else {}
    dr, vf = load('drafts'), load('verify')
    for it in batch:
        d, v = dr.get(it['id']), vf.get(it['id'])
        if not d and not v:
            eksik.append((n, it['id'])); continue
        final.append({'n': n, 'id': it['id'], 'alt': (v or d)['alt'], 'decision': d['decision'] if d else 'none',
                      'verdict': v['verdict'] if v else 'none', 'conf': d.get('confidence', '') if d else '',
                      'issue': (v.get('issue') or '')[:200] if v and v['verdict'] == 'fix' else '',
                      'note': (d.get('note') or '')[:200] if d else ''})
    if not vf: print('kontrolsuz grup', n)
(HERE / 'sonuc-ham.json').write_text(json.dumps({'final': final}, ensure_ascii=False, indent=1), encoding='utf-8')
print('son', len(final), 'eksik', len(eksik), eksik[:5])
