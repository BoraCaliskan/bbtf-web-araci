#!/usr/bin/env python3
"""İş akışı günlüklerinden (journal.jsonl) taslak ve kontrol sonuçlarını çıkarır.
Kullanım: python taslak_cek.py <journal> [<journal> ...]  → drafts/NN.json ve verify/NN.json yazar, durum özeti basar.
"""
import json, pathlib, re, sys
sys.stdout.reconfigure(encoding='utf-8')
HERE = pathlib.Path(__file__).resolve().parent
(HERE / 'drafts').mkdir(exist_ok=True); (HERE / 'verify').mkdir(exist_ok=True)
got = {}
for jp in sys.argv[1:]:
    lab = {}
    for line in open(jp, encoding='utf-8'):
        o = json.loads(line)
        if o.get('type') == 'started': lab[o['agentId']] = o.get('label', '')
        elif o.get('type') == 'result':
            l = lab.get(o['agentId'], '')
            m = re.match(r'(taslak|kontrol) (\d+)', l)
            r = o.get('result')
            if m and isinstance(r, dict) and r.get('items'):
                kind, n = m.groups()
                d = HERE / ('drafts' if kind == 'taslak' else 'verify')
                (d / f'{n}.json').write_text(json.dumps(r['items'], ensure_ascii=False, indent=1), encoding='utf-8')
                got.setdefault(kind, set()).add(n)
for k in ('taslak', 'kontrol'):
    print(k, sorted(got.get(k, [])))
