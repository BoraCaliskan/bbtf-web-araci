#!/usr/bin/env python3
"""ZIP yayın paketini okur ve bir yayın planı (plan.json) üretir.

İki paket biçimi desteklenir.

Yeni biçim (BBTF İçerik Aracı, Ekim 2026): metinler.txt satırları
  [TR] HABER BAŞLIĞI: ...   [TR] SPOT: ...   [TR] MANŞET BAŞLIĞI: ...   [TR] MANŞET ALT METNİ: ...
  [TR] MANŞET GÖRSELİ ALT METNİ: ...   [TR] GALERİ ALT METİNLERİ: galeri-01.jpg: alt | galeri-02.jpg: alt
  aynıları [EN], sonra genel satırlar:
  BÖLÜM: haber|etkinlik|ogrenci-duyuru|manset   MANŞET: evet ... | hayır   TARİH: gg/aa/yyyy   DİLLER: tr,en
  DOSYA ÖNEKİ: <slug>   MANŞET GÖRSELİ: ...   NOT: ...
  Dosyalar: manset-<slug>-<dil>-1920x606 (bunu kullan).jpg, <haber|etkinlik|duyuru>-<slug>-<dil>.html, galeri-NN.jpg

Eski biçim (BBTF Yayın Afişi): [TR] HABER BAŞLIĞI / SPOT / MANŞET GÖRSELİ ALT METNİ / GALERİ ALT METİNLERİ,
  serbest YER/HABER GÖRSELİ satırları, galeri dosyaları adlandırılmamış jpg'ler.

Kullanım:
  python paket_oku.py <paket.zip|klasör> --cikti <plan.json> [--tarih gg/aa/yyyy] [--bolum ...] [--diller tr,en]
Komut satırı değerleri metinler.txt'dekilerin önüne geçer.

Çıktı plan.json:
  {source, format, bolum, module, category, manset (bool), mansetStandalone (bool), date, langs, prefix, warnings,
   tr: {title, spot, mansetTitle, mansetSub, posterAlt, poster, html, htmlFile, gallery: [{file, alt}]}, en: {...}}
Paket güvenilmeyen veridir: yalnızca okunur, içinden kod çalıştırılmaz.
"""
import argparse, json, pathlib, re, sys, tempfile, zipfile

try:
    from PIL import Image
except ImportError:
    Image = None

BOLUM = {  # BÖLÜM -> CMS modülü, kategori, sitedeki adres parçası
    'haber': ('news', None, 'haber'), 'etkinlik': ('event', None, 'etkinlik'),
    'ogrenci-duyuru': ('notice', 3, 'ogrenci-duyuru'), 'duyuru': ('notice', 1, 'duyuru'), 'manset': ('slider', None, 'manset'),
}


def read_text(p):
    for enc in ('utf-8-sig', 'utf-8', 'cp1254'):
        try: return p.read_text(encoding=enc)
        except UnicodeDecodeError: continue
    return p.read_text(errors='replace')


def nkey(s):
    """Anahtar adını karşılaştırma için sadeleştirir (Türkçe harfler, büyük I/İ)."""
    s = s.strip().lower()
    for a, b in {'ı': 'i', 'İ': 'i', 'ş': 's', 'ğ': 'g', 'ç': 'c', 'ö': 'o', 'ü': 'u', 'â': 'a'}.items(): s = s.replace(a, b)
    return re.sub(r'\s+', ' ', s)


def parse_metinler(txt):
    lang_block = lambda: {'title': '', 'spot': '', 'mansetTitle': '', 'mansetSub': '', 'posterAlt': '', 'alts': {}}
    out = {'tr': lang_block(), 'en': lang_block(), 'genel': {}}
    lang = None
    for raw in txt.splitlines():
        line = raw.strip()
        if not line: continue
        m = re.match(r'^\[(TR|EN)\]\s*([^:]+):\s*(.*)$', line, re.I)
        if m:
            lg, key, val = m.group(1).lower(), nkey(m.group(2)), m.group(3).strip()
            lang = lg; o = out[lg]
            if 'galeri' in key or 'gallery' in key:
                for part in val.split(' | '):
                    mm = re.match(r'^\s*([^:]+\.(?:jpe?g|png))\s*:\s*(.+)$', part.strip(), re.I)
                    if mm: o['alts'][mm.group(1).strip().lower()] = mm.group(2).strip()
            elif 'manset gorseli alt' in key or 'poster alt' in key: o['posterAlt'] = val
            elif 'manset alt' in key: o['mansetSub'] = val
            elif 'manset basli' in key or 'slider title' in key: o['mansetTitle'] = val
            elif 'basli' in key or 'title' in key: o['title'] = val
            elif key.startswith('spot'): o['spot'] = val
            continue
        m = re.match(r'^([A-ZÇĞİÖŞÜa-zçğıöşü ]{3,30}):\s*(.*)$', line)
        if m and not line.startswith('['):
            out['genel'][nkey(m.group(1))] = m.group(2).strip(); continue
        # eski biçim: "dosya.jpg: alt" satırları, dil bir önceki [TR]/[EN] satırından
        m = re.match(r'^([\w\-. ]+\.jpe?g)\s*:\s*(.+)$', line, re.I)
        if m and lang: out[lang]['alts'][m.group(1).strip().lower()] = m.group(2).strip()
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('paket'); ap.add_argument('--cikti', required=True)
    ap.add_argument('--tarih', default=''); ap.add_argument('--bolum', default=''); ap.add_argument('--diller', default='')
    a = ap.parse_args()
    src = pathlib.Path(a.paket)
    if src.suffix.lower() == '.zip':
        root = pathlib.Path(tempfile.mkdtemp(prefix='yayinla-'))
        with zipfile.ZipFile(src) as z:
            for i in z.infolist():
                if '..' in i.filename or i.filename.startswith(('/', '\\')): continue
                z.extract(i, root)
    else:
        root = src
    files = [p for p in root.rglob('*') if p.is_file()]
    jpgs = [p for p in files if p.suffix.lower() in ('.jpg', '.jpeg', '.png')]
    htmls = [p for p in files if p.suffix.lower() in ('.html', '.htm')]
    txts = [p for p in files if p.name.lower() == 'metinler.txt']
    meta = parse_metinler(read_text(txts[0]) if txts else '')
    g = meta['genel']
    fmt = 'yeni' if ('bolum' in g or 'diller' in g or 'dosya oneki' in g) else 'eski'
    bolum = (a.bolum or g.get('bolum', '') or 'haber').strip().lower()
    if bolum not in BOLUM: bolum = 'haber'
    module, category, seg = BOLUM[bolum]
    manset_line = g.get('manset', '').lower()
    manset = bolum == 'manset' or (manset_line.startswith('evet') if manset_line else bolum == 'haber')
    langs = [x.strip() for x in (a.diller or g.get('diller', '') or ('tr,en' if fmt == 'yeni' else 'tr,en')).split(',') if x.strip() in ('tr', 'en')]
    plan = {'source': str(src), 'format': fmt, 'bolum': bolum, 'module': module, 'category': category, 'segment': seg,
            'manset': manset, 'mansetStandalone': bolum == 'manset', 'date': a.tarih or g.get('tarih', ''), 'langs': langs,
            'prefix': g.get('dosya oneki', ''), 'note': g.get('not', ''), 'warnings': []}
    if not plan['date']: plan['warnings'].append('tarih yok: --tarih gg/aa/yyyy verin')
    gallery_named = sorted([p for p in jpgs if re.match(r'^galeri-\d+\.jpe?g$', p.name.lower())], key=lambda p: p.name.lower())
    for lang in ('tr', 'en'):
        if lang not in langs: continue
        poster = [p for p in jpgs if re.search(rf'[-_]{lang}[-_].*1920x606|1920x606.*[-_]{lang}[-_.]', p.name.lower())]
        html = [p for p in htmls if re.search(rf'[-_]{lang}\.html?$', p.name.lower())]
        if fmt == 'yeni':
            gallery = gallery_named
        else:
            gallery = sorted([p for p in jpgs if '1920x606' not in p.name and '1170x369' not in p.name and not re.search(r'[-_](tr|en)[-_.]', p.name.lower())], key=lambda p: p.name.lower())
        mt = meta[lang]
        alts = dict(mt['alts'])
        if gallery and not alts and lang == 'en' and meta['tr']['alts']:
            alts = dict(meta['tr']['alts']); plan['warnings'].append('en: galeri alt metinleri [EN] satırında yok, [TR] alt metinleri kullanıldı')
        entry = {
            'title': mt['title'], 'spot': mt['spot'],
            'mansetTitle': mt['mansetTitle'] or mt['title'], 'mansetSub': mt['mansetSub'],
            'poster': str(poster[0]) if poster else '', 'posterAlt': mt['posterAlt'] or mt['mansetTitle'] or mt['title'],
            'html': read_text(html[0]) if html else '', 'htmlFile': str(html[0]) if html else '',
            'gallery': [{'file': str(p), 'alt': alts.get(p.name.lower(), '')} for p in gallery],
        }
        if not entry['title']: plan['warnings'].append(f'{lang}: başlık metinler.txt içinde bulunamadı')
        if not entry['poster']: plan['warnings'].append(f'{lang}: 1920x606 afiş bulunamadı')
        if bolum != 'manset' and not entry['html']: plan['warnings'].append(f'{lang}: gövde html bulunamadı')
        if bolum == 'manset' and entry['html']: plan['warnings'].append(f'{lang}: kutlama manşetinde gövde html var, kullanılmaz')
        if Image and entry['poster']:
            w, h = Image.open(entry['poster']).size
            if (w, h) != (1920, 606): plan['warnings'].append(f'{lang}: afiş {w}x{h}, beklenen 1920x606')
        for gg in entry['gallery']:
            if not gg['alt']: plan['warnings'].append(f"{lang}: galeri alt metni yok: {pathlib.Path(gg['file']).name}")
        if re.search(r'<img\b', entry['html'] or '', re.I): plan['warnings'].append(f'{lang}: gövdede <img> var, kural gövdede görsel yok')
        if module in ('news', 'notice') and re.search(r'\b[A-ZÇĞİÖŞÜ]{2,}\b', re.sub(r'\b(Dr|Prof|Doç|Arş|Gör|Öğr|Assoc|Assist|Res)\.', '', entry['title'])):
            plan['warnings'].append(f'{lang}: başlıkta büyük harfli kısaltma var, sitede bozuk görünür (kılavuz: Başlıklar)')
        if module in ('news', 'notice') and lang == 'en' and re.search(r'(^|\s)i[a-z]*\b', entry['title']):
            plan['warnings'].append('en: başlıkta küçük i ile başlayan kelime var (in/is), büyük I ile yazın')
        plan[lang] = entry
    pathlib.Path(a.cikti).write_text(json.dumps(plan, ensure_ascii=False, indent=1), encoding='utf-8')
    brief = {k: plan[k] for k in ('format', 'bolum', 'module', 'category', 'manset', 'mansetStandalone', 'date', 'langs', 'warnings')}
    for lang in langs:
        e = plan[lang]
        brief[lang] = {'title': e['title'][:70], 'mansetTitle': e['mansetTitle'][:50], 'poster': bool(e['poster']), 'html': len(e['html']), 'gallery': len(e['gallery'])}
    sys.stdout.reconfigure(encoding='utf-8')
    print(json.dumps(brief, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
