Depo: https://github.com/BoraCaliskan/bbtf-web-araci (özel, sabah herkese açık yapılabilir)

# RAPOR, gece görevi 26 Ekim 2026

Tek ajan. Ana site (bilgisayar.istanbul.edu.tr) için CMS'e yalnızca okuma yapıldı, hiçbir kayıt oluşturulmadı, değiştirilmedi, silinmedi. Yazma yalnızca test sitesinde (bbtfevents, TÜBİTAK 2237-A) ve yalnızca kendi oluşturduğum iki kayıtta yapıldı, ikisi de silindi. Depo kullanıcının isteğiyle özel açıldı.

## Adım durumları

| Adım | Durum | Çıktı |
|---|---|---|
| 0 Depo | tamam | Yerel git, GitHub'da özel depo, 8 commit |
| 1 Kadro | tamam | `kadro/kadro.json` (29 kişi), `kadro/kadro.js` (1.1 MB, fotoğraflar gömülü), `kadro/foto/` (24 jpg), `scripts/kadro_build.py` |
| 2 CMS notları | tamam | `cms/cms-notlar.md`, `cms/yayin-akisi.md` |
| 3 Envanter | tamam | `envanter/<tür>-<dil>.json` (10 dosya), `envanter/ozet.csv` (767 satır), `scripts/envanter_build.py` |
| 4 Görseller | tamam | `envanter/gorseller/` 568 jpg (haber, etkinlik, manşet kapakları, 1200 px) |
| 5 /yayinla skill | tamam, denendi | `skill/yayinla/SKILL.md`, `scripts/paket_oku.py`, `scripts/cms-yayinla.browser.js` |
| 6 Test sitesi denemesi | tamam | Haber + galeri + manşet yayımlandı, doğrulandı, geri alındı. `evidence/` |

## Sayılar

Kadro: 29 kişi (16 akademik, 8 idari, 5 yalnızca yönetimde: Dekan, Senatör, Fakülte Sekreteri ve iki dış kurul üyesi). 24 fotoğraf. Fotoğrafı olmayanlar: Ayşe Üstün, Gülizar Pat, Nurgül Civanoğlu, Selver Pekdemir, İbrahim Aksu (sitede de fotoğraf yok). Kaynak fotoğraflar 200x250 piksel, 600x600'e büyütülerek kare kırpıldı, kalite sınırlı.

Envanter (CMS'teki toplam / yayında):

| Tür | TR | EN |
|---|---|---|
| Haber | 76 / 76 | 74 / 74 |
| Duyuru (kat. 1) | 32 / 31 | 19 / 17 |
| Öğrenci duyurusu (kat. 3) | 82 / 77 | 61 / 59 |
| Etkinlik | 62 / 61 | 61 / 61 |
| Manşet | 169 / 148 | 148 / 127 |

Yayında olmayanlar: TR 26 (21 manşet, 1 etkinlik, 1 duyuru, 5 öğrenci duyurusu), EN 25 (21 manşet, 2 duyuru, 2 öğrenci duyurusu). Yayında olmayan manşetlerin 19'u bayram ve anma manşeti, 2'si bu hafta yayından kaldırılan süresi geçmiş duyuru ve etkinlik manşeti.

## Yöntem ve sapmalar

- **Kadro:** Sitenin kadro sayfalarının çağırdığı veri uçları (`api/datasource/f_getAkademikKadro`, `f_getIdariKadro`, `f_getFakulteYonetim`) betikle okundu, iki dil birleştirildi. E-posta, telefon ve dahili alanları alınmadı. İngilizce yönetim sayfası ilk denemede boş geldi (yavaş yükleme), ikinci okumada 19 kart geldi.
- **Envanter:** Brief panelin liste ve detay görünümlerini istiyordu. Panelden toplu okuma yapılamadı çünkü tarayıcı aracının çıktısı 1000 karakterde kesiliyor ve 40+ karakterlik hex (EID) içeren çıktıları engelliyor. Bunun yerine yayındaki kayıtlar gövdeleriyle birlikte halka açık veri uçlarından (`f_getNews`, `f_getNotices`, `f_getStudentNotices`, `f_getEvents`, `f_getSlider`, `f_getGallery`) alındı. Panelden yalnızca liste sayımları, yayın durumları ve yayında olmayan kayıtların başlık, tarih, görsel, bağlantı, galeri ve gövde uzunluğu okundu (`envanter/kaynak/cms-*.txt`). Yayında olmayan 51 kaydın gövdesi aktarılmadı, `bodyHtml: null` ve `bodyHtmlLenChecksum` ile işaretlendi.
- **Öğrenci duyuruları:** Panelin kategori listesi terimsiz aramada eksik gösteriyor (TR 60 satır, halka açıkta 77 yayında). Harf harf arama taramasıyla 114 ayrı kayıt bulundu, yayında olmayan 5'i envantere eklendi.
- **Kişisel veri:** Gövdelerde e-posta (kurumsal `istanbul.edu.tr` adresleri hariç), telefon, 10 ve 13 haneli numaralar, toplantı kimliği ve şifre örüntüleri `[kaldırıldı]` yapıldı. Editör artığı `rangySelectionBoundary` span'ları gövdeden çıkarıldı. 11 değişiklik yapıldı, hepsi etkinlik duyurularındaki başvuru e-postaları.
- **Görseller:** Kapak ve manşet görselleri `cdn.istanbul.edu.tr/FileHandler.ashx?f=<id>` adresinden indirildi, 1200 px genişliğe küçültüldü. Galeri görselleri indirilmedi, adresleri JSON'da.
- **Test sitesi:** Başlangıçta 5 kayıt (1 etkinlik, 1 manşet, 3 duyuru). AA Akademi paketinin TR bölümüyle haber (afiş + 3 galeri fotoğrafı + gövde) ve habere bağlı manşet oluşturulup yayımlandı. Doğrulama: haber sayfasında başlık, 3 galeri görseli, 3 bağlantı düğmesi, kapanış cümlesi; ana sayfada manşet ilk slaytta; `f_getSlider` ve `f_getNews` yanıtlarında kayıtlar doğru görsel ve bağlantıyla. Sonra `__Y.undo` ile manşet ve haber yayından kaldırılıp silindi (sunucu yanıtı ve listeden düşme doğrulandı). Bitiş listesi başlangıçla satır satır özdeş (`evidence/test-site-baseline-20261026.txt`, `SAME=true`).

## Skill denemesinde çıkan düzeltmeler

1. Boş listede (test sitesinde hiç haber yoktu) liste okuyucu `NOT_READY` atıyordu. Kütüphaneye boş tablo için `[]` dönen sarmalayıcı eklendi.
2. `paket_oku.py` metinler.txt biçimini ilk sürümde çözemedi (`[TR] HABER BAŞLIĞI:` satırları ve `|` ile ayrılmış galeri alt metinleri). Düzeltildi, paket uyarıları çalışıyor (kısaltma ve İngilizce "in" uyarıları dahil).
3. Geri alma iki kayıtta 45 saniyelik araç sınırını aştı. İşlem sayfada tamamlandı, SKILL.md'ye kayıt başına çağırma notu eklendi.

## Skill'in bilinen eksikleri

- Görsel seçimi tarayıcı aracının `file_upload` adımına bağlı, tamamen betikle çalışmaz. Her görsel için bir `find` + `file_upload` + `finishUpload` üçlüsü gerekir.
- EN tarafı ve `duyuru`/`etkinlik` türleri kodda var ama denenmedi (test sitesi tek dilli, etkinlik formunun hazır olma koşulu haberle aynı varsayıldı).
- Eski şablonlu sitelerde halka açık doğrulama kısmen çalışır (kapak görseli ve tarih sayfada yok), API doğrulaması esas alınmalı.
- Yüklenen görseller geri almada silinmiyor, sitenin görsel kütüphanesinde kalıyor. Test sitesinde 4 görsel kaldı.
- Aynı başlık ve tarihte kayıt varsa durur, bilinçli (yineleme koruması).

## Sabah Bora'nın yapacakları

1. Depoyu gözden geçirip isterse herkese açık yapmak (`gh repo edit BoraCaliskan/bbtf-web-araci --visibility public`). İçinde kadro fotoğrafları ve tüm içerik metinleri var.
2. `kadro/kadro.js` dosyasını BBTF Yayın Afişi aracına bağlamak isterse: `arac/gelistirici/src.html` içindeki `KADRO_SEED` yerine `window.BBTF_KADRO` kullanılabilir (alanlar uyumlu: id, name, titleTR, deptKey, photoUrl, photo).
3. Test sitesinin görsel kütüphanesinde kalan 4 test görselini isterse Fotoğraf Yükle penceresinden silmek (ben görsel silmedim).
4. `kilavuz/web-birimi-teknik-not.md` notunu web birimine iletmek.
5. İsterse skill'i fakülte TR sitesinde gerçek bir paketle çalıştırmak. İlk gerçek koşuda `site` parametresini açıkça verin.

## Dosyalar

```
README.md  PLAN.md  RAPOR.md
arac/            BBTF Yayın Afişi.html, KULLANIM.txt, gelistirici/ (src.html, assets.json, build.py)
kilavuz/         yayin-kilavuzu.md, web-birimi-teknik-not.md
kadro/           kadro.json, kadro.js, foto/*.jpg, kaynak/*.json (ham yanıtlar, iletişim alanları silinmiş)
cms/             cms-notlar.md, yayin-akisi.md
envanter/        haber|duyuru|ogrenci-duyuru|etkinlik|slider-{tr,en}.json, ozet.csv, gorseller/, kaynak/cms-{tr,en}.txt
skill/yayinla/   SKILL.md, scripts/paket_oku.py, scripts/cms-yayinla.browser.js
scripts/         kadro_build.py, envanter_build.py, kadro-extract.browser.js
evidence/        test-site-baseline-20261026.txt, yayinla-20261026-0200.json, test-site-homepage-after-undo.jpg
```

Not: Canlı test haber sayfasının ekran görüntüsü alınamadı (tarayıcı aracı iki kez zaman aşımına düştü), doğrulama değerleri `evidence/yayinla-20261026-0200.json` içinde. Geri alma sonrası ana sayfa görüntüsü eklendi.
