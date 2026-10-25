#!/usr/bin/env python3
"""Kadro kütüphanesini üretir.

Kaynak: sitenin halka açık veri uçları (tarayıcıda kadro sayfalarının yaptığı istekler):
  api/datasource/f_getAkademikKadro, f_getIdariKadro, f_getFakulteYonetim  (siteKey + sp_lang)
Çıktı:
  kadro/kaynak/<uc>-<dil>.json   ham yanıt, e-posta/telefon/dahili/adres alanları silinmiş
  kadro/kadro.json               fotoğrafsız kayıtlar
  kadro/foto/<id>.jpg            600x600 kare, JPEG, 120 KB altı
  kadro/kadro.js                 window.BBTF_KADRO = [...], photo alanında data URI

Kullanım: python scripts/kadro_build.py [--no-photos]
"""
import base64, io, json, re, sys, pathlib, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'kadro'
SITE = {'tr': '86B65F1611324658A5E6CDFB94B1F955', 'en': 'B9495DCDB814449190BAAB2B7B8AC5C0'}
API = 'https://service-cms.istanbul.edu.tr/api/datasource/'
CDN = 'https://cdn.istanbul.edu.tr/image/A0FB851BD9/'
STRIP = {'Eposta', 'Telefon', 'Dahili', 'BolumAdres', 'Adres', 'Fax', 'Email', 'CreatedUser', 'ModifiedUser'}
DEPT_KEY = {'Bilgisayar Mühendisliği': 'cmpe', 'Siber Güvenlik Mühendisliği': 'cyber', 'Yapay Zeka ve Veri Mühendisliği': 'aide'}
TITLE_FIX = {'Prof.Dr.': 'Prof. Dr.', 'Doç.Dr.': 'Doç. Dr.', 'Dr.Öğr.Üyesi': 'Dr. Öğr. Üyesi', 'Arş.Gör.': 'Arş. Gör.', 'Öğr.Gör.': 'Öğr. Gör.'}


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json'})
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read()


def strip(o):
    if isinstance(o, dict):
        return {k: strip(v) for k, v in o.items() if k not in STRIP}
    if isinstance(o, list):
        return [strip(x) for x in o]
    return o


def tlower(s):
    return s.replace('I', 'ı').replace('İ', 'i').lower()


def tcase(s):
    """EZGİ ZORARPACI -> Ezgi Zorarpacı (Türkçe büyük/küçük harf)."""
    out = []
    for w in (s or '').split():
        w = tlower(w)
        out.append(w[0].replace('i', 'İ').replace('ı', 'I').upper() + w[1:] if w else w)
    return ' '.join(out)


def slug(s):
    t = tlower(s)
    for a, b in {'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'â': 'a', 'î': 'i', 'û': 'u'}.items():
        t = t.replace(a, b)
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', t)).strip('-')


def title_tr(u):
    u = (u or '').strip()
    return TITLE_FIX.get(u, u)


def fetch(lang, fn):
    p = OUT / 'kaynak' / f'{fn}-{lang}.json'
    p.parent.mkdir(parents=True, exist_ok=True)
    raw = json.loads(get(f'{API}{fn}?siteKey={SITE[lang]}&sp_lang={lang}'))
    data = strip(raw.get('Data', raw))
    p.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')
    return data


def main():
    want_photos = '--no-photos' not in sys.argv
    people = {}  # alias -> record

    def rec(p, lang):
        alias = p.get('Alias') or slug(f"{p.get('Ad', '')} {p.get('Soyad', '')}")
        r = people.setdefault(alias, {'id': slug(f"{p.get('Ad', '')} {p.get('Soyad', '')}"), 'alias': alias,
                                      'name': tcase(f"{p.get('Ad', '')} {p.get('Soyad', '')}"), 'titleTR': '', 'titleEN': '',
                                      'dept': {'tr': '', 'en': ''}, 'deptKey': '', 'role': '', 'roleLabelTR': '', 'roleLabelEN': '',
                                      'roles': [], 'photoId': '', 'photoUrl': '', 'profileUrl': {'tr': '', 'en': ''}, 'pages': []})
        if p.get('Fotograf'):
            r['photoId'] = p['Fotograf']; r['photoUrl'] = CDN + p['Fotograf']
        if alias:
            r['profileUrl'][lang] = f'https://profil.istanbul.edu.tr/{lang}/p/{alias}'
        return r

    for lang in ('tr', 'en'):
        ak = fetch(lang, 'f_getAkademikKadro')
        idari = fetch(lang, 'f_getIdariKadro')
        yon = fetch(lang, 'f_getFakulteYonetim')

        for bolum in ak:
            bname = (bolum.get('Ad') or '').strip()
            for grp in bolum.get('Yonetim') or []:
                for g in grp.get('GorevList') or []:
                    p = g.get('Personel') or {}
                    r = rec(p, lang)
                    r['roles'].append({'lang': lang, 'group': 'bolum', 'groupName': bname, 'label': g.get('YonetselGorev') or ''})
            for abd in bolum.get('AnabilimList') or []:
                for p in abd.get('PersonelList') or []:
                    r = rec(p, lang)
                    r['role'] = r['role'] or 'akademik'
                    r['dept'][lang] = bname
                    if lang == 'tr':
                        r['titleTR'] = title_tr(p.get('AkademikUnvan'))
                        for k, v in DEPT_KEY.items():
                            if bname.startswith(k): r['deptKey'] = v
                    else:
                        r['titleEN'] = (p.get('AkademikUnvan') or '').strip()
                    r['pages'].append(f'{lang}/akademikkadro')
            for p in bolum.get('PersonelList') or []:
                r = rec(p, lang); r['role'] = r['role'] or 'akademik'; r['dept'][lang] = bname
                r['pages'].append(f'{lang}/akademikkadro')

        for birim in idari:
            bname = (birim.get('Ad') or '').strip()
            for p in birim.get('PersonelList') or []:
                r = rec(p, lang)
                r['role'] = 'idari' if r['role'] in ('', 'idari') else r['role']
                # kişi kaydındaki birim adı (Fakülte Sekreterliği) daha açıklayıcı, yoksa liste başlığı (İdari, İşçi)
                r['dept'][lang] = (p.get('Bolum') or '').strip() or bname
                lab = tcase(p.get('GorevUnvan') or p.get('KadroUnvan') or '') if lang == 'tr' else \
                    ' '.join(w.capitalize() for w in (p.get('GorevUnvan') or p.get('KadroUnvan') or '').lower().split())
                if lang == 'tr': r['roleLabelTR'] = r['roleLabelTR'] or lab
                else: r['roleLabelEN'] = r['roleLabelEN'] or lab
                r['pages'].append(f'{lang}/idarikadro')

        for grp in yon:
            header = (grp.get('Header') or '').strip()
            for g in grp.get('GorevList') or []:
                p = g.get('Personel') or {}
                r = rec(p, lang)
                r['role'] = r['role'] or 'yonetim'
                if lang == 'tr' and not r['titleTR']: r['titleTR'] = title_tr(p.get('AkademikUnvan'))
                if lang == 'en' and not r['titleEN']: r['titleEN'] = (p.get('AkademikUnvan') or '').strip()
                if not r['dept'][lang]: r['dept'][lang] = (p.get('Bolum') or '').strip()
                r['roles'].append({'lang': lang, 'group': 'fakulte', 'groupName': header, 'label': g.get('YonetselGorev') or ''})
                r['pages'].append(f'{lang}/yonetim')

    # roleLabel: önce fakülte yönetimi (Dekan, Dekan Yrd., Fakülte Sekreteri), sonra bölüm yönetimi
    PRI = ['Dekan', 'Dekan Yrd.', 'Fakülte Sekreteri', 'Bölüm Başkanı', 'Bölüm Başkanı Yrd.', 'Senatör', 'Fakülte Yönetim Kurulu Üyesi', 'Fakülte Kurulu Üyesi']
    for r in people.values():
        tr_roles = [x['label'] for x in r['roles'] if x['lang'] == 'tr']
        en_roles = [x['label'] for x in r['roles'] if x['lang'] == 'en']
        for lab in PRI:
            if lab in tr_roles and not r['roleLabelTR']:
                r['roleLabelTR'] = lab
                # aynı sıradaki İngilizce karşılık
                i = tr_roles.index(lab)
                if i < len(en_roles): r['roleLabelEN'] = r['roleLabelEN'] or en_roles[i]
                break
        if r['role'] == 'akademik' and not r['titleEN'] and r['titleTR']:
            r['titleEN'] = {'Prof. Dr.': 'Prof. Dr.', 'Doç. Dr.': 'Assoc. Prof. Dr.', 'Dr. Öğr. Üyesi': 'Assist. Prof. Dr.', 'Arş. Gör.': 'Res. Assist.'}.get(r['titleTR'], '')
        r['pages'] = sorted(set(r['pages']))
        seen = set(); dedup = []
        for x in r['roles']:
            key = (x['lang'], x['group'], x['groupName'], x['label'])
            if key not in seen: seen.add(key); dedup.append(x)
        r['roles'] = dedup

    # İngilizce veri kaynağında bölüm adı boş kalan kayıtlar için sitedeki İngilizce bölüm adları
    DEPT_EN = {'cmpe': 'Department of Computer Engineering', 'cyber': 'Department of Cyber Security Engineering',
               'aide': 'Department of Artificial Intelligence and Data Engineering'}
    for r in people.values():
        if r['deptKey'] and not r['dept']['en']:
            r['dept']['en'] = DEPT_EN[r['deptKey']]

    order = {'yonetim': 0, 'akademik': 1, 'idari': 2}
    recs = sorted(people.values(), key=lambda r: (order.get(r['role'], 9), r['dept']['tr'], r['name']))
    (OUT / 'kadro.json').write_text(json.dumps(recs, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'{len(recs)} kişi yazıldı: kadro/kadro.json')

    missing = [r['name'] for r in recs if not r['photoId']]
    if want_photos:
        from PIL import Image
        (OUT / 'foto').mkdir(exist_ok=True)
        js = []
        for r in recs:
            photo = None
            if r['photoId']:
                try:
                    im = Image.open(io.BytesIO(get(r['photoUrl']))).convert('RGB')
                    w, h = im.size; s = min(w, h)
                    if h > w:  # dikey: yüz üstte kalsın, üstten %10 pay
                        y0 = int(min(h - s, (h - s) * 0.10)); box = (0, y0, w, y0 + s)
                    else:
                        x0 = (w - s) // 2; box = (x0, 0, x0 + s, s)
                    im = im.crop(box).resize((600, 600), Image.LANCZOS)
                    q = 88
                    while True:
                        buf = io.BytesIO(); im.save(buf, 'JPEG', quality=q, optimize=True, progressive=True)
                        if buf.tell() < 120 * 1024 or q <= 50: break
                        q -= 6
                    data = buf.getvalue()
                    (OUT / 'foto' / f"{r['id']}.jpg").write_bytes(data)
                    photo = 'data:image/jpeg;base64,' + base64.b64encode(data).decode()
                    r['photoSource'] = f'{w}x{h}'
                except Exception as e:
                    print('FOTO HATA', r['name'], e); missing.append(r['name'])
            js.append({**r, 'photo': photo})
        (OUT / 'kadro.js').write_text('window.BBTF_KADRO = ' + json.dumps(js, ensure_ascii=False) + ';\n', encoding='utf-8')
        print('kadro/kadro.js yazıldı')
    print('Fotoğrafsız:', ', '.join(missing) or 'yok')


if __name__ == '__main__':
    main()
