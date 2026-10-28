#!/usr/bin/env python3
"""Gövdesinde alt'sız görsel olan kayıtlar için {görsel kimliği: alt} eşlemeleri (govde-tr.json, govde-en.json).
Kaynak: sonuc.json (kütüphane alt metinleri) ve govde-en-ceviri.json (EN kayıtlarda TR kütüphanesindeki görseller için)."""
import json, pathlib, sys
sys.stdout.reconfigure(encoding='utf-8')
HERE = pathlib.Path(__file__).resolve().parent
rows = {(r['site'], r['id']): r for r in json.loads((HERE / 'sonuc.json').read_text(encoding='utf-8'))}
ceviri = json.loads((HERE / 'govde-en-ceviri.json').read_text(encoding='utf-8'))
recs = json.loads((HERE / 'govde-kayitlar.json').read_text(encoding='utf-8'))
out = {'tr': [], 'en': []}
for r in recs:
    ids = [i for i in r['ids'] if not i.startswith('font_')]
    if not ids: continue          # personel sitesinden kopyalanmış işlevsiz düğme görselleri: dokunulmaz, rapora yazılır
    m = {}
    for i in ids:
        if r['lang'] == 'tr':
            m[i] = rows[('tr', i)]['alt']
        else:
            m[i] = rows[('en', i)]['alt'] if ('en', i) in rows else ceviri[i]
    out[r['lang']].append({'m': 'event' if r['typ'] == 'etkinlik' else 'notice', 'eid42': r['cmsId'][:42], 'title': r['title'], 'map': m})
for lang in out:
    (HERE / f'govde-{lang}.json').write_text(json.dumps(out[lang], ensure_ascii=False, indent=1), encoding='utf-8')
    print(lang, len(out[lang]), 'kayit', sum(len(x['map']) for x in out[lang]), 'gorsel')
