#!/usr/bin/env python3
"""İçerik envanterini üretir (ana site, yalnızca okuma).

Kaynaklar
  1. Halka açık veri uçları (yayındaki kayıtlar, gövde dahil):
     api/webclient/f_getNews, f_getEvents, f_getSlider, f_getNotices (Categoryid 1), f_getStudentNotices (Categoryid 3),
     f_getGallery (kayıt başına galeri). Kimlik doğrulama yok.
  2. CMS liste ve form okumaları (yayında olmayan kayıtlar, durumlar): envanter/kaynak/cms-<dil>.txt
     Bu dosyalar panelden sayfa içi yardımcılarla okunup elle kaydedilir (bkz. cms/cms-notlar.md §10).

Çıktılar
  envanter/<tür>-<dil>.json   tür: haber, duyuru, ogrenci-duyuru, etkinlik, slider
  envanter/ozet.csv
  envanter/gorseller/<type>-<lang>-<cmsId12>.jpg  (--gorseller ile, kapak ve manşet görselleri, 1200 px, JPEG 85)

Kişisel veri temizliği: e-posta, telefon, öğrenci numarası, toplantı kimliği ve şifresi gövdede "[kaldırıldı]" ile değiştirilir.
Kullanım: python scripts/envanter_build.py [--gorseller] [--dil tr|en]
"""
import csv, io, json, pathlib, re, sys, time, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'envanter'
SITE = {'tr': '86B65F1611324658A5E6CDFB94B1F955', 'en': 'B9495DCDB814449190BAAB2B7B8AC5C0'}
API = 'https://service-cms.istanbul.edu.tr/api/webclient/'
CDN = 'https://cdn.istanbul.edu.tr/FileHandler.ashx?f='
PUBLIC = 'https://bilgisayar.istanbul.edu.tr'
SUF = '0039007900700046006200610041004F003200370077003200'
TYPES = [  # tür, uç, ek parametre, site yolu, CMS modülü
    ('haber', 'f_getNews', '', 'haber', 'news'),
    ('etkinlik', 'f_getEvents', '', 'etkinlik', 'event'),
    ('slider', 'f_getSlider', '', 'manset', 'slider'),
    ('duyuru', 'f_getNotices', '&Categoryid=1&lang={lang}', 'duyuru', 'notice1'),
    ('ogrenci-duyuru', 'f_getStudentNotices', '&Categoryid=3&lang={lang}', 'ogrenci-duyuru', 'notice3'),
]
PII = [
    (re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'), '[kaldırıldı]'),              # e-posta
    (re.compile(r'(?<!\d)(\+90[\s-]?)?\(?0?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}(?!\d)'), '[kaldırıldı]'),  # telefon
    (re.compile(r'(?i)(toplantı\s*(kimliği|id|no|numarası)|meeting\s*id|zoom\s*id)\s*[:：]?\s*[\d\s-]{9,}'), r'\1: [kaldırıldı]'),
    (re.compile(r'(?i)(şifre|parola|passcode|password)\s*[:：]\s*\S+'), r'\1: [kaldırıldı]'),
    (re.compile(r'(?<!\d)(\d{10}|\d{13})(?!\d)'), '[kaldırıldı]'),                                    # öğrenci numarası ve TC
]


def get(url, retry=3):
    for i in range(retry):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json'})
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except Exception as e:
            if i == retry - 1: raise
            time.sleep(2)


def get_json(url):
    return json.loads(get(url))


KEEP_MAIL = re.compile(r'@(?:[a-z0-9-]+\.)*istanbul\.edu\.tr$', re.I)   # kurumsal personel/birim adresleri kalır, öğrenci (ogr.iu.edu.tr) ve dış adresler silinir
RANGY = re.compile(r'<span[^>]*rangySelectionBoundary[^>]*>.*?</span>|<span[^>]*rangySelectionBoundary[^>]*/?>', re.S)


def _mail(m):
    return m.group(0) if KEEP_MAIL.search(m.group(0)) and 'ogr.' not in m.group(0).lower() else '[kaldırıldı]'


def clean(html):
    """Gövdeyi temizler: editör artığı rangy span'ları atar, metin düğümlerinde e-posta, telefon, öğrenci numarası,
    toplantı kimliği ve şifre örüntülerini "[kaldırıldı]" yapar. Etiket içlerinde yalnızca mailto: ve tel: adresleri temizlenir."""
    if not html: return html, 0
    html = RANGY.sub('', html)
    n = 0
    parts = re.split(r'(<[^>]+>)', html)
    for i, seg in enumerate(parts):
        if seg.startswith('<'):
            seg2, k = re.subn(r'(mailto:)([^"\'\s>]+)', lambda m: m.group(1) + _mail(re.match(r'.*', m.group(2))), seg)
            seg2, k2 = re.subn(r'(tel:)[^"\'\s>]+', r'\1[kaldırıldı]', seg2)
            parts[i] = seg2; n += (k if seg2 != seg else 0) + k2
            continue
        for rx, rep in PII:
            if rx is PII[0][0]:
                seg, k = rx.subn(_mail, seg)
                k = sum(1 for _ in rx.finditer(parts[i])) if seg != parts[i] else 0
            else:
                seg, k = rx.subn(rep, seg)
            n += k
        parts[i] = seg
    return ''.join(parts), n


def pages(fn, extra, lang):
    out, page = [], 1
    while page < 60:
        o = get_json(f'{API}{fn}?siteKey={SITE[lang]}&Page={page}&PageSize=20{extra}')
        d = o.get('Data', o)
        items = d.get('Data') if isinstance(d, dict) else d
        if not items: break
        out += items
        if len(items) < 20: break
        page += 1
    return out


def text_of(html):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', html or '')).strip()


def links_of(html):
    return sorted(set(re.findall(r'href="([^"]+)"', html or '')))


def slug(t):
    t = t.replace("'", '').replace('’', '')
    for a, b in {'ç': 'c', 'ğ': 'g', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'â': 'a', 'î': 'i', 'û': 'u', 'Ç': 'c', 'Ğ': 'g', 'Ö': 'o', 'Ş': 's', 'Ü': 'u', 'Â': 'a'}.items():
        t = t.replace(a, b)
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', t.lower())).strip('-')[:80]


def read_cms(lang):
    """envanter/kaynak/cms-<dil>.txt: modül|EID12 (6-6)|tarih|durum|başlık [|img|link|galeri|htmlLen:sum|kategori|titles]"""
    p = OUT / 'kaynak' / f'cms-{lang}.txt'
    rows = []
    if not p.exists(): return rows
    for line in p.read_text(encoding='utf-8').splitlines():
        if not line or line.startswith('#'): continue
        f = line.split('|')
        if len(f) < 5: continue
        rows.append({'module': f[0], 'eid12': f[1].replace('-', ''), 'date': f[2], 'status': f[3], 'title': f[4],
                     'img': f[5] if len(f) > 5 else '', 'link': f[6] if len(f) > 6 else '', 'gallery': [g for g in (f[7].split(',') if len(f) > 7 and f[7] else [])],
                     'htmlLen': f[8] if len(f) > 8 else '', 'category': f[9] if len(f) > 9 else ''})
    return rows


def build(lang, want_images):
    (OUT / 'gorseller').mkdir(parents=True, exist_ok=True)
    cms = read_cms(lang)
    summary = []
    counts = {}
    for typ, fn, extra, path, module in TYPES:
        items = pages(fn, extra.format(lang=lang), lang)
        recs = []
        for it in items:
            eid = it.get('EID') or ''
            gal = []
            try:
                g = get_json(f'{API}f_getGallery?siteKey={SITE[lang]}&EID={eid}&Value={path}').get('Data') or {}
                gal = g.get('Gallery') or []
            except Exception:
                pass
            body, npii = clean(it.get('Content') or '')
            title = it.get('Header') or ''
            # öğrenci duyuruları da sitede /duyuru/ altında açılır
            url = f"{PUBLIC}/{lang}/{'duyuru' if typ == 'ogrenci-duyuru' else path}/{slug(title)}-{eid}" if typ != 'slider' else (it.get('Link') or '')
            recs.append({
                'lang': lang, 'type': typ, 'cmsId': eid, 'title': title, 'url': url,
                'date': (it.get('Date') or '')[:10], 'status': 'published',
                'coverImageUrl': (CDN + it['Img']) if it.get('Img') else '',
                'galleryImageUrls': [CDN + g for g in gal],
                'bodyHtml': body, 'bodyText': text_of(body), 'links': links_of(body),
                'sliderLinkTarget': it.get('Link') or '' if typ == 'slider' else '',
                'order': it.get('PriorityOrder'), 'category': it.get('CategoryId'),
                'author': it.get('Author') or '', 'tags': it.get('Tag') or '', 'route': it.get('Route') or '',
                'piiRemoved': npii, 'source': 'public-api',
            })
        # yayında olmayanlar CMS okumasından
        for r in cms:
            if r['module'] != module or r['status'] != 'N': continue
            if any(x['cmsId'].startswith(r['eid12']) for x in recs): continue
            d = r['date']; iso = f'{d[6:10]}-{d[3:5]}-{d[0:2]}' if len(d) == 10 else d
            recs.append({
                'lang': lang, 'type': typ, 'cmsId': r['eid12'] + '…', 'title': r['title'], 'url': '',
                'date': iso, 'status': 'unpublished',
                'coverImageUrl': (CDN + r['img']) if r['img'] else '', 'galleryImageUrls': [CDN + g for g in r['gallery']],
                'bodyHtml': None, 'bodyText': '', 'links': [], 'sliderLinkTarget': r['link'] if typ == 'slider' else '',
                'order': None, 'category': r['category'] or None, 'bodyHtmlLenChecksum': r['htmlLen'],
                'piiRemoved': 0, 'source': 'cms-list+form (gövde panelden aktarılmadı)',
            })
        recs.sort(key=lambda x: x['date'], reverse=True)
        (OUT / f'{typ}-{lang}.json').write_text(json.dumps(recs, ensure_ascii=False, indent=1), encoding='utf-8')
        counts[typ] = (len(recs), sum(1 for x in recs if x['status'] == 'published'))
        for x in recs:
            summary.append([x['lang'], x['type'], x['cmsId'][:12], x['title'], x['date'], x['status'],
                            'evet' if x['coverImageUrl'] else 'hayır', len(x['galleryImageUrls']), len(x['bodyHtml'] or '')])
            if want_images and x['coverImageUrl'] and x['type'] in ('haber', 'etkinlik', 'slider'):
                save_image(x)
        print(lang, typ, counts[typ])
    return summary, counts


def save_image(x):
    from PIL import Image
    p = OUT / 'gorseller' / f"{x['type']}-{x['lang']}-{x['cmsId'][:12]}.jpg"
    if p.exists(): return
    try:
        im = Image.open(io.BytesIO(get(x['coverImageUrl']))).convert('RGB')
        if im.width > 1200: im = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
        im.save(p, 'JPEG', quality=85, optimize=True, progressive=True)
    except Exception as e:
        print('GÖRSEL HATA', x['type'], x['title'][:40], e)


def main():
    want_images = '--gorseller' in sys.argv
    langs = ['tr', 'en']
    if '--dil' in sys.argv: langs = [sys.argv[sys.argv.index('--dil') + 1]]
    rows = []; allc = {}
    for lang in langs:
        s, c = build(lang, want_images); rows += s; allc[lang] = c
    with open(OUT / 'ozet.csv', 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.writer(f); w.writerow(['lang', 'type', 'cmsId', 'title', 'date', 'status', 'gorsel', 'galeri', 'govde_uzunluk']); w.writerows(rows)
    print(json.dumps(allc, ensure_ascii=False))


if __name__ == '__main__':
    main()
