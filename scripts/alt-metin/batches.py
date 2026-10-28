#!/usr/bin/env python3
"""items.json -> batches/NN.json (aynı kaydın görselleri aynı grupta, ~30 görsel)."""
import html, json, pathlib, sys
sys.stdout.reconfigure(encoding='utf-8')
HERE = pathlib.Path(__file__).resolve().parent
SIZE = 30
items = json.loads((HERE / 'items.json').read_text(encoding='utf-8'))

def clean(s):
    return html.unescape(s or '').replace('\xa0', ' ').strip()

def key(it):
    u = it['usage'][0] if it['usage'] else None
    return (it['site'], 0 if u else 1, (u['lang'] + u['type'] + u['title']) if u else '', it['id'])

items.sort(key=key)
groups, cur, last = [], [], None
for it in items:
    u = it['usage'][0] if it['usage'] else None
    g = (it['site'], u['title'] if u else None)
    if g != last and cur:
        groups.append(cur); cur = []
    cur.append(it); last = g
if cur: groups.append(cur)

batches, b = [], []
for g in groups:
    # grubu bölmemeye çalış, grup sığmıyorsa ve mevcut grup yeterince doluysa yeni gruba geç
    if b and len(b) + len(g) > SIZE and len(b) >= SIZE - 6:
        batches.append(b); b = []
    for it in g:
        if len(b) == SIZE:
            batches.append(b); b = []
        b.append(it)
if b: batches.append(b)

out = HERE / 'batches'; out.mkdir(exist_ok=True)
for f in out.glob('*.json'): f.unlink()
for n, b in enumerate(batches, 1):
    rows = [{'id': it['id'], 'site': it['site'], 'targetLang': it['targetLang'], 'image': it['img'],
             'currentAlt': clean(it['currentAlt']),
             'usage': [{'lang': u['lang'], 'type': u['type'], 'role': u['role'], 'status': u['status'], 'date': u['date'],
                        'title': clean(u['title']), 'text': clean(u['text'])} for u in it['usage']],
             'usedInRecords': it['usageCount']} for it in b]
    (out / f'{n:02d}.json').write_text(json.dumps(rows, ensure_ascii=False, indent=1), encoding='utf-8')
print(len(batches), 'batches', [len(b) for b in batches])
print(sum(len(b) for b in batches), 'items')
