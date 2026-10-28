#!/usr/bin/env python3
"""Alt metin işi için çalışma listesini hazırlar.

Girdi: lib-tr-raw.txt, lib-en-raw.txt (panelden okunan Yüklediklerim listeleri), TÜBİTAK sitesi için sabit 5 kimlik,
envanter (bbtf-web-araci/envanter/*.json) ve TÜBİTAK sitesinin halka açık veri uçları.
Çıktı: img/<site>/<id>.jpg (en uzun kenar 1280 px), items.json (her görsel için bağlam), batches/<n>.json
"""
import io, json, pathlib, re, sys, urllib.request, concurrent.futures as cf
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
HERE = pathlib.Path(__file__).resolve().parent
REPO = pathlib.Path(r'C:\Users\borac\Documents\ChatGPT\bbtf-web-araci')
CDN = 'https://cdn.istanbul.edu.tr/FileHandler.ashx?f='
API = 'https://service-cms.istanbul.edu.tr/api/webclient/'
TUBITAK = 'C4E5471A0E2B4040BFCC8C388F01FBC9'
TUB_IDS = ['QGN64xNknUiMDJ-5YTQOzg', 'XhPAND5o7EuiyWMsfObLfA', 'rdcqusxg6E-qQN4H7oTImw', 'Ek86SrfVrUG0JlmpvR9epQ', '8oMb6qEEVEWZuzbmsrDYtg']


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def lib(name):
    out = []
    for line in (HERE / name).read_text(encoding='utf-8').splitlines():
        p = line.split('\t')
        if len(p) >= 2: out.append({'id': p[1], 'alt': p[2] if len(p) > 2 else ''})
    return out


def usage_from_envanter():
    use = {}
    for lang in ('tr', 'en'):
        for typ in ('haber', 'duyuru', 'ogrenci-duyuru', 'etkinlik', 'slider'):
            for r in json.loads((REPO / 'envanter' / f'{typ}-{lang}.json').read_text(encoding='utf-8')):
                ids = []
                if r['coverImageUrl']: ids.append(('kapak', r['coverImageUrl'].split('f=')[-1]))
                ids += [('galeri', u.split('f=')[-1]) for u in r['galleryImageUrls']]
                ids += [('gövde', i) for i in re.findall(r'FileHandler\.ashx\?f=([A-Za-z0-9_-]{22})', r.get('bodyHtml') or '')]
                text = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', r.get('bodyHtml') or '')).strip()[:300]
                for role, i in ids:
                    use.setdefault(i, []).append({'lang': lang, 'type': typ, 'role': role, 'status': r['status'], 'date': r['date'], 'title': r['title'], 'text': text})
    return use


def usage_tubitak():
    use = {}
    for fn, typ, extra in [('f_getNews', 'haber', ''), ('f_getEvents', 'etkinlik', ''), ('f_getSlider', 'slider', ''), ('f_getNotices', 'duyuru', '&Categoryid=1&lang=tr')]:
        o = json.loads(get(f'{API}{fn}?siteKey={TUBITAK}&Page=1&PageSize=50{extra}'))
        d = o.get('Data', o); items = d.get('Data') if isinstance(d, dict) else d
        for it in items or []:
            body = it.get('Content') or ''
            text = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', body)).strip()[:300]
            ids = ([('kapak', it['Img'])] if it.get('Img') else []) + [('gövde', i) for i in re.findall(r'FileHandler\.ashx\?f=([A-Za-z0-9_-]{22})', body)]
            try:
                g = json.loads(get(f"{API}f_getGallery?siteKey={TUBITAK}&EID={it['EID']}&Value={typ}")).get('Data') or {}
                ids += [('galeri', x) for x in (g.get('Gallery') or [])]
            except Exception:
                pass
            for role, i in ids:
                use.setdefault(i, []).append({'lang': 'tr', 'type': typ, 'role': role, 'status': 'published', 'date': (it.get('Date') or '')[:10], 'title': it.get('Header') or '', 'text': text})
    return use


def fetch(site, iid):
    d = HERE / 'img' / site; d.mkdir(parents=True, exist_ok=True)
    p = d / f'{iid}.jpg'
    if p.exists():
        im = Image.open(p); return iid, p, None, im.size
    raw = get(CDN + iid)
    im = Image.open(io.BytesIO(raw)); orig = im.size
    if im.mode in ('RGBA', 'LA', 'P'):
        bg = Image.new('RGB', im.size, (255, 255, 255)); im2 = im.convert('RGBA'); bg.paste(im2, mask=im2.split()[-1]); im = bg
    else:
        im = im.convert('RGB')
    s = 1280 / max(im.size)
    if s < 1: im = im.resize((round(im.size[0] * s), round(im.size[1] * s)), Image.LANCZOS)
    im.save(p, 'JPEG', quality=85)
    return iid, p, orig, im.size


def main():
    use = usage_from_envanter(); tuse = usage_tubitak()
    sites = {'tr': lib('lib-tr-raw.txt'), 'en': lib('lib-en-raw.txt'), 'tubitak': [{'id': i, 'alt': ''} for i in TUB_IDS]}
    items = []
    for site, lst in sites.items():
        for x in lst:
            u = (tuse if site == 'tubitak' else use).get(x['id'], [])
            langs = {a['lang'] for a in u}
            if site == 'tr': target = 'en' if langs == {'en'} else 'tr'
            elif site == 'en': target = 'tr' if langs == {'tr'} else 'en'
            else: target = 'tr'
            items.append({'site': site, 'id': x['id'], 'currentAlt': x['alt'], 'targetLang': target, 'usage': u[:4], 'usageCount': len(u)})
    jobs = [(it['site'], it['id']) for it in items]
    errs = []
    with cf.ThreadPoolExecutor(8) as ex:
        futs = {ex.submit(fetch, s, i): (s, i) for s, i in jobs}
        res = {}
        for f in cf.as_completed(futs):
            s, i = futs[f]
            try:
                iid, p, orig, size = f.result(); res[(s, i)] = (str(p), orig, size)
            except Exception as e:
                errs.append((s, i, str(e)[:80]))
    for it in items:
        r = res.get((it['site'], it['id']))
        it['img'] = r[0] if r else None; it['size'] = list(r[2]) if r else None; it['origSize'] = list(r[1]) if r and r[1] else None
    (HERE / 'items.json').write_text(json.dumps(items, ensure_ascii=False, indent=1), encoding='utf-8')
    print('items', len(items), 'downloaded', len(res), 'errors', len(errs))
    for e in errs[:10]: print('  ERR', e)


if __name__ == '__main__':
    main()
