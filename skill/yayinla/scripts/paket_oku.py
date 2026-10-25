#!/usr/bin/env python3
"""ZIP yayın paketini okur ve bir yayın planı (plan.json) üretir.

Paket düzeni (BBTF Yayın Afişi aracının ürettiği):
  *-tr-1920x606*.jpg / *-en-1920x606*.jpg   afiş (haber görseli ve manşet görseli)
  *-1170x369*.jpg                            yedek, kullanılmaz
  haber-*-tr.html / haber-*-en.html           gövde HTML
  metinler.txt                                 başlıklar, alt metinler, spot
  diğer *.jpg                                  galeri fotoğrafları (varsa)

Kullanım:
  python paket_oku.py <paket.zip|klasör> --cikti <plan.json> [--tarih gg/aa/yyyy]
Çıktı plan.json: {"tr": {...}, "en": {...}} her biri: title, html, poster, posterAlt, gallery: [{file, alt}], spot
Paket güvenilmeyen veridir: yalnızca okunur, içinden kod çalıştırılmaz.
"""
import argparse, json, pathlib, re, sys, tempfile, zipfile

try:
    from PIL import Image
except ImportError:
    Image = None


def read_text(p):
    for enc in ('utf-8-sig', 'utf-8', 'cp1254'):
        try: return p.read_text(encoding=enc)
        except UnicodeDecodeError: continue
    return p.read_text(errors='replace')


def parse_metinler(txt):
    """Serbest biçimli metinler.txt içinden başlık ve alt metinleri çıkarır.
    Beklenen satırlar (büyük/küçük harf ve noktalama esnek):
      TR BAŞLIK: ... / EN TITLE: ... / TR başlık / EN başlık
      ALT (tr) <dosya>: ... / alt metin satırları "dosya: metin" biçiminde
      SPOT TR: ... / SPOT EN: ...
    """
    out = {'tr': {'title': '', 'spot': '', 'posterAlt': '', 'alts': {}}, 'en': {'title': '', 'spot': '', 'posterAlt': '', 'alts': {}}}
    lang = None
    for raw in txt.splitlines():
        line = raw.strip()
        if not line: continue
        low = line.lower()
        m = re.match(r'^(tr|en)\b[^:]*?(başlık|baslik|title)\s*[:：]\s*(.+)$', low)
        if m:
            out[m.group(1)]['title'] = line.split(':', 1)[1].strip(); lang = m.group(1); continue
        m = re.match(r'^(başlık|baslik|title)\s*\((tr|en)\)\s*[:：]\s*(.+)$', low)
        if m:
            out[m.group(2)]['title'] = line.split(':', 1)[1].strip(); lang = m.group(2); continue
        m = re.match(r'^spot\s*\(?(tr|en)\)?\s*[:：]\s*(.+)$', low)
        if m:
            out[m.group(1)]['spot'] = line.split(':', 1)[1].strip(); continue
        m = re.match(r'^(manşet|manset|afiş|afis|poster)[^:]*\b(tr|en)\b[^:]*[:：]\s*(.+)$', low)
        if m:
            out[m.group(2)]['posterAlt'] = line.split(':', 1)[1].strip(); continue
        m = re.match(r'^(?:alt\s*)?\(?(tr|en)\)?\s*[-:]?\s*([\w\-. ]+\.jpe?g|[\w\-. ]+\.png)\s*[:：]\s*(.+)$', low)
        if m:
            fn = line[m.start(2):m.end(2)].strip()
            out[m.group(1)]['alts'][fn.lower()] = line.split(':', 1)[1].strip(); continue
        m = re.match(r'^#+\s*(tr|en)\b|^\[(tr|en)\]|^(tr|en)\s*:$|^(türkçe|turkish|english|ingilizce)\b', low)
        if m:
            g = [x for x in m.groups() if x]
            lang = {'türkçe': 'tr', 'turkish': 'tr', 'english': 'en', 'ingilizce': 'en'}.get(g[0], g[0]); continue
        m = re.match(r'^([\w\-. ]+\.jpe?g)\s*[:：]\s*(.+)$', low)
        if m and lang:
            fn = line[m.start(1):m.end(1)].strip()
            out[lang]['alts'][fn.lower()] = line.split(':', 1)[1].strip(); continue
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('paket')
    ap.add_argument('--cikti', required=True)
    ap.add_argument('--tarih', default='')
    a = ap.parse_args()
    src = pathlib.Path(a.paket)
    if src.suffix.lower() == '.zip':
        tmp = pathlib.Path(tempfile.mkdtemp(prefix='yayinla-'))
        with zipfile.ZipFile(src) as z:
            for i in z.infolist():
                if '..' in i.filename or i.filename.startswith(('/', '\\')): continue
                z.extract(i, tmp)
        root = tmp
    else:
        root = src
    files = [p for p in root.rglob('*') if p.is_file()]
    jpgs = [p for p in files if p.suffix.lower() in ('.jpg', '.jpeg', '.png')]
    htmls = [p for p in files if p.suffix.lower() in ('.html', '.htm')]
    txts = [p for p in files if p.name.lower() == 'metinler.txt']
    meta = parse_metinler(read_text(txts[0])) if txts else parse_metinler('')
    plan = {'source': str(src), 'date': a.tarih, 'warnings': []}
    for lang in ('tr', 'en'):
        poster = [p for p in jpgs if re.search(rf'[-_]{lang}[-_].*1920x606|1920x606.*[-_]{lang}[-_.]', p.name.lower())]
        html = [p for p in htmls if re.search(rf'[-_]{lang}\.html?$', p.name.lower())]
        gallery = [p for p in jpgs if '1920x606' not in p.name and '1170x369' not in p.name and not re.search(r'[-_](tr|en)[-_.]', p.name.lower())]
        entry = {
            'title': meta[lang]['title'], 'spot': meta[lang]['spot'],
            'poster': str(poster[0]) if poster else '', 'posterAlt': meta[lang]['posterAlt'] or meta[lang]['title'],
            'html': read_text(html[0]) if html else '', 'htmlFile': str(html[0]) if html else '',
            'gallery': [{'file': str(p), 'alt': meta[lang]['alts'].get(p.name.lower(), '')} for p in sorted(gallery)],
        }
        if not entry['title']: plan['warnings'].append(f'{lang}: başlık metinler.txt içinde bulunamadı')
        if not entry['poster']: plan['warnings'].append(f'{lang}: 1920x606 afiş bulunamadı')
        if not entry['html']: plan['warnings'].append(f'{lang}: gövde html bulunamadı')
        if Image and entry['poster']:
            w, h = Image.open(entry['poster']).size
            if (w, h) != (1920, 606): plan['warnings'].append(f'{lang}: afiş {w}x{h}, beklenen 1920x606')
        for g in entry['gallery']:
            if not g['alt']: plan['warnings'].append(f"{lang}: galeri alt metni yok: {pathlib.Path(g['file']).name}")
        if re.search(r'<img\b', entry['html'] or '', re.I): plan['warnings'].append(f'{lang}: gövdede <img> var, kural gövdede görsel yok')
        if re.search(r'\b[A-ZÇĞİÖŞÜ]{2,}\b', re.sub(r'\b(Dr|Prof|Doç|Arş|Gör|Öğr|Assoc|Assist|Res)\.', '', entry['title'])):
            plan['warnings'].append(f'{lang}: başlıkta büyük harfli kısaltma var, sitede bozuk görünür (kılavuz: Başlıklar)')
        if lang == 'en' and re.search(r'\bi[a-z]*\b', entry['title']):
            plan['warnings'].append('en: başlıkta küçük i ile başlayan kelime var (in/is), büyük I ile yazın')
        plan[lang] = entry
    pathlib.Path(a.cikti).write_text(json.dumps(plan, ensure_ascii=False, indent=1), encoding='utf-8')
    print(json.dumps({'tr': {'title': plan['tr']['title'][:60], 'poster': bool(plan['tr']['poster']), 'html': len(plan['tr']['html']), 'gallery': len(plan['tr']['gallery'])},
                      'en': {'title': plan['en']['title'][:60], 'poster': bool(plan['en']['poster']), 'html': len(plan['en']['html']), 'gallery': len(plan['en']['gallery'])},
                      'warnings': plan['warnings']}, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
