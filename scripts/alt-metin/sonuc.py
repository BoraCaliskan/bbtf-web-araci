#!/usr/bin/env python3
"""İş akışı sonuçlarını denetler, küçük biçim hatalarını düzeltir ve site başına uygulama dosyalarını yazar.

Girdi: sonuc-ham.json (iş akışının döndürdüğü {stats, final} ya da final listesi), items.json
Çıktı: sonuc.json (tüm satırlar ve denetim notları), uygula-<site>.json ({görsel kimliği: alt metin}, yalnızca değişenler)
"""
import json, pathlib, re, sys

sys.stdout.reconfigure(encoding='utf-8')
HERE = pathlib.Path(__file__).resolve().parent

START = re.compile(r'^(görsel|resim|fotoğraf\s*:|bu görselde|image of|picture of|photo of)', re.I)
TR_WORDS = re.compile(r'\b(ve|ile|bir|için|afişi|etkinliği|öğrenciler|katılımcılar|fotoğrafı|konuşmacı)\b', re.I)
EN_WORDS = re.compile(r'\b(the|and|with|of|for|at|on)\b', re.I)
EMOJI = re.compile('[\U0001F300-\U0001FAFF☀-➿]')


def h(s):
    x = 2166136261
    for ch in s:
        x ^= ord(ch); x = (x * 16777619) & 0xffffffff
    return x


def tidy(alt):
    a = re.sub(r'\s+', ' ', alt).strip()
    a = re.sub(r'(?<=\d)\s*[–—]\s*(?=\d)', '-', a)          # aralıklarda düz tire
    a = re.sub(r'\s*[–—]\s*', ', ', a)
    a = a.replace('“', '').replace('”', '').replace('"', '')
    while a.endswith('.') and not re.search(r'\b(Dr|Prof|Doç|Öğr|Gör|Arş|vb|vs)\.$', a):
        a = a[:-1].rstrip()
    return a


def lint(alt, lang):
    out = []
    if len(alt) > 250: out.append('250+')
    if len(alt) < 15: out.append('kisa')
    for ch, name in ((';', 'noktali-virgul'), ('<', 'lt'), ('>', 'gt'), ('#', 'hashtag')):
        if ch in alt: out.append(name)
    if re.search(r'ho(ca|ja)', alt, re.I): out.append('hoca')
    if START.match(alt): out.append('baslangic')
    if re.search(r'\.(jpe?g|png|webp)\b|\b\d{3,4}x\d{3,4}\b', alt, re.I) or re.search(r'\b(?=[a-z0-9-]*[a-z])[a-z0-9]+(?:-[a-z0-9]+){2,}\b', alt):
        out.append('dosya-adi')
    if re.search(r'\b(manşet|slider)\b', alt, re.I): out.append('jargon')
    if EMOJI.search(alt): out.append('emoji')
    if lang == 'en' and len(TR_WORDS.findall(alt)) >= 2: out.append('dil?')
    if lang == 'tr' and len(EN_WORDS.findall(alt)) >= 3: out.append('dil?')
    return out


def main():
    raw = json.loads((HERE / 'sonuc-ham.json').read_text(encoding='utf-8'))
    final = raw['final'] if isinstance(raw, dict) else raw
    items = json.loads((HERE / 'items.json').read_text(encoding='utf-8'))
    by = {(it['id']): it for it in items}
    # elle düzeltmeler (ör. afişte yanlış basılmış soyadı, kardeş görsellerdeki doğru yazımla)
    duz = json.loads((HERE / 'duzeltme.json').read_text(encoding='utf-8')) if (HERE / 'duzeltme.json').exists() else {}
    seen, rows = set(), []
    for f in final:
        if f['id'] in duz: f = dict(f, alt=duz[f['id']], issue=(f.get('issue') or '') + ' [elle düzeltildi]')
        it = by.get(f['id'])
        if not it:
            print('BILINMEYEN', f['id']); continue
        seen.add(f['id'])
        alt = tidy(f['alt'])
        rows.append({'site': it['site'], 'id': f['id'], 'lang': it['targetLang'], 'old': it['currentAlt'], 'alt': alt,
                     'changed': alt != it['currentAlt'], 'decision': f.get('decision'), 'verdict': f.get('verdict'),
                     'conf': f.get('conf'), 'issue': f.get('issue', ''), 'note': f.get('note', ''),
                     'lint': lint(alt, it['targetLang']), 'tidied': alt != f['alt']})
    missing = [it['id'] for it in items if it['id'] not in seen]
    rows.sort(key=lambda r: (r['site'], r['id']))
    (HERE / 'sonuc.json').write_text(json.dumps(rows, ensure_ascii=False, indent=1), encoding='utf-8')
    print('satir', len(rows), 'eksik', len(missing), missing[:10])
    for site in ('tr', 'en', 'tubitak'):
        rs = [r for r in rows if r['site'] == site]
        ch = {r['id']: r['alt'] for r in rs if r['changed']}
        s = json.dumps(ch, ensure_ascii=False)
        (HERE / f'uygula-{site}.json').write_text(s, encoding='utf-8', newline='')
        print(site, 'toplam', len(rs), 'degisen', len(ch), 'hash', h(s),
              'keep', sum(r['decision'] == 'keep' for r in rs), 'fix', sum(r['verdict'] == 'fix' for r in rs),
              'dogrulanmamis', sum(r['verdict'] not in ('approve', 'fix') for r in rs))
    flagged = [r for r in rows if r['lint']]
    print('denetim uyarisi', len(flagged), 'duzeltilen bicim', sum(r['tidied'] for r in rows))
    for r in flagged: print(' ', r['site'], r['id'], r['lint'], r['alt'][:150])
    lens = sorted(len(r['alt']) for r in rows)
    print('uzunluk min/medyan/max', lens[0], lens[len(lens) // 2], lens[-1])


if __name__ == '__main__':
    main()
