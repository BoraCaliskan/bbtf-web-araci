# RAPOR-2, üçüncü aşama (26 Ekim 2026 sabah)

Depo: https://github.com/BoraCaliskan/bbtf-web-araci (özel)

Tek ajan. Ana site CMS'inde yalnızca okuma yapıldı. Yazma yalnızca test sitesinde (bbtfevents, TÜBİTAK 2237-A): beş örnek paket yayımlandı, doğrulandı, hepsi geri alındı, yüklenen görseller ve önceki koşudan kalan 4 görsel silindi.

## Adım durumları

| Adım | Durum |
|---|---|
| 0 Depo: eski araç `arac/eski/`, yeni **BBTF İçerik Aracı** `arac/`, `docs/ornekler/`, `ornek-paketler/`, kılavuza "İçerik türleri ve kalıpları" bölümü | tamam |
| 1 Skill uyarlaması: `paket_oku.py` yeni biçim, kütüphane v2 | tamam |
| 2 Test sitesinde beş paket, EN kuru çalıştırma, geri alma, görsel temizliği, liste karşılaştırması | tamam (bir kalıntı, aşağıda) |
| 3 Araç kontrolü: başsız açılış, dokuz kalıp, ZIP üretimi ve `paket_oku.py` | tamam (iki boş form hatası bulundu) |

## Beş paketin test sonuçları (TR, test sitesi, koşu 20261026-0700)

| # | Paket | Oluşan kayıtlar | Halka açık doğrulama | Sonuç |
|---|---|---|---|---|
| 1 | Yeni yayın (haber) | haber + bağlı manşet | Sayfa: başlık, "hakkında" paneli, tebrik, düğme. API: `f_getNews` 1, `f_getSlider` ilk sırada, Img ve Link doğru | tamam. Düğme metninde "→," göründü (araç hatası, aşağıda) |
| 2 | Başarı ve ödül (haber + galeri) | haber (galeri 1) + bağlı manşet | Sayfa: başlık, takım listesi, ikincil düğme okunur renkte, galeri görseli. API: `f_getGallery` 1 görsel, manşet Link haber adresi | tamam. İlk denemede galeri dosyası gizli girişe düştü, kütüphane düzeltildi, ikinci deneme tamam |
| 3 | Etkinlik daveti | etkinlik (tarih 25/11/2025) + bağlı manşet | Sayfa: başlık, tarih kartları, konuşmacı, "Kayıt →". API: `f_getEvents` 2 kayıt, manşet Link etkinlik adresi | tamam |
| 4 | Öğrenci duyurusu | duyuru + bağlı manşet | Sayfa `/tr/duyuru/...`: metin, uyarı kutusu, Excel düğmesi, tarih. API: `f_getNotices` 4 kayıt | tamam, ama **kategori 1 ile**. Test sitesinde kategori 3 çalışmıyor (aşağıda) |
| 5 | Kutlama (bağlantısız manşet) | yalnızca manşet | CMS: Link boş, Title1-3 boş, içerik boş. API: `f_getSliderBox` ve `f_getSlider` ilk sırada, bağlantısız. Ana sayfa şeridi ilk slayt | tamam |

Ana sayfa şeridinde 6 slayt tarih sırasıyla görüldü (kutlama, BUMZ, yeni yayın, duyuru, etkinlik, sitenin kendi manşeti). Görseller her pakette Kırpma modunda ve alt metinleriyle yüklendi, `finishUpload` hepsinde ilk denemede döndü.

EN kuru çalıştırma (`evidence/en-kuru-calistirma-20261026.txt`): beş pakette EN başlık, EN afiş dosyası, EN gövde, EN manşet başlığı ve alt metni doğru eşleşti. BUMZ paketinde `[EN] GALERİ ALT METİNLERİ` satırı yok, okuyucu TR alt metnini kullanıp uyarı veriyor. Gerçek EN yayını yapılmadı (test sitesi tek dilli).

## Skill'de yapılan değişiklikler

1. `paket_oku.py`: yeni metinler.txt biçimi (`[TR]/[EN]` satırları, MANŞET BAŞLIĞI, MANŞET ALT METNİ, `galeri-NN.jpg: alt | ...`, BÖLÜM, MANŞET, TARİH, DİLLER, DOSYA ÖNEKİ, NOT), eski biçim korunur. Plan çıktısına `bolum, module, category, manset, mansetStandalone, langs, prefix, mansetTitle, mansetSub` eklendi. Türkçe anahtarlar için `İ/I` normalizasyonu (Python `lower()` "TARİH"i bozuyordu).
2. `paket_oku.py`: araç çıktısındaki virgülle biten HTML varlıkları (`&#8594,`) noktalı virgüle çevrilir ve uyarı verilir.
3. `cms-yayinla.browser.js` v2: `module` etkinlik ve duyuru, `category` (Öğrenci Duyuru 3), duyuruda görsel zorunlu değil, bağlantısız manşet (`standalone: true`, Link/Title/içerik boş doğrulanır), yüklenen görseller koşu kaydında, `deleteImage` (Fotoğraf Yükle ▸ Görseli Sil ▸ onay ▸ `removeImageFromcdn` yanıtı ve listeden düşme), `undoRecords` + `undoImages`, boş listede `NOT_READY` yerine `[]`, `fixFileInput` (dosya gizli Toplu Yükle girişine düşerse görünür girişe taşır), XHR günlüğünde istek gövdesi saklanmaz.
4. `SKILL.md`: bölüm eşlemesi, 45 s sınırı için adım adım çağrı, gövde HTML'inin satır içi verilmesi (https sayfadan yerel `fetch` engelleniyor), eski şablon doğrulama notları, kategori 3 uyarısı.
5. `cms/cms-notlar.md`: Duyuru formunda Resim alanı olmadığı düzeltildi.

## Test sitesinin temizliği

Kayıtlar: başlangıçta 5 kayıt (1 etkinlik, 1 manşet, 3 duyuru). Koşuda 9 kayıt oluşturuldu, 9'u da `undoRecords` ile yayından kaldırılıp silindi (her silmede sunucu yanıtı `success` ve satırın listeden düşmesi doğrulandı). Bitiş listesi başlangıçla aynı: 1 etkinlik, 1 manşet, 3 duyuru (`evidence/test-site-baseline-20261026-asama3.txt`). Gösterge paneli: 1 Haberler, 1 Etkinlikler, 5 Duyurular (kalıntı 2 kayıt aşağıda).

Görseller: başlangıçta 9 görsel (5 sitenin kendi, 4 önceki koşudan). Koşuda 6 görsel yüklendi. `undoImages` 6'sını, ardından önceki koşunun 4'ü silindi. Bitişte kütüphanede yalnızca sitenin 5 görseli kaldı: QGN64xNknUiMDJ-5YTQOzg, XhPAND5o7EuiyWMsfObLfA, rdcqusxg6E-qQN4H7oTImw, Ek86SrfVrUG0JlmpvR9epQ, 8oMb6qEEVEWZuzbmsrDYtg (başlangıçtaki 5 ile aynı).

**Kalıntı:** Öğrenci Duyuru (kategori 3) ile kaydedilen 2 deneme kaydı. Test sitesinde `api/notice/getNotices` `CategoryId: 3` ile sunucu hatası veriyor, bu kayıtlar panelde hiçbir listede görünmüyor ve silinemiyor (gösterge paneli Duyurular sayacı 3 yerine 5). Başlıkları "2025-2026 Bahar Dönemi Final Sınavları Başlıyor", tarih 08/06/2026, yayında değil, halka açık hiçbir yerde görünmüyor. Silinmeleri için web birimine iletilmesi gerekiyor. Fakülte sitesinde kategori 3 tanımlı ve çalışıyor (envanterde 77 yayında öğrenci duyurusu), orada bu sorun yok.

## Araç kontrolü (Adım 3)

- Yerel sunucudan (`python -m http.server`) yerleşik tarayıcıda açıldı: "Hazır, kadro 29 kişi", `#tpl` seçicisinde 9 kalıp, 29 kişi kartı, açılışta konsol hatası yok. (`file://` adresi yerleşik tarayıcıda açılamadı.)
- Dokuz kalıp sırayla seçildi, hepsi 1920x606 tuvale çizildi. Boş formla iki kalıp hata veriyor: **Dış kurumda konuşma ve eğitim** `TypeError: Cannot read properties of undefined (reading 'toLocaleLowerCase')` (`hard` ← `loc` ← `draw`/`body`), **Yeni yayın** `TypeError ... (reading 'length')` (`endsVowel` ← `acc` ← `closingTR` ← `body`). Kişi seçilince büyük olasılıkla kaybolur, boş durum koruması eksik.
- Kutlama kalıbıyla `window.__setData('kutlama', {occasion: '29ekim', year: '2026', date: '2026-10-29'}, [])` + `buildZip()` çalıştırıldı, 326 KB ZIP üretildi (`evidence/arac-uretimi/`), `paket_oku.py` uyarısız okudu: bölüm manset, bağlantısız, tarih 29/10/2026, TR ve EN afişler 1920x606.

## Araçta düzeltilmesi gerekenler (Fable'a)

1. Gövde HTML'inde ok karakterleri `&#8594,` ve `&#8599,` olarak çıkıyor (noktalı virgül yerine virgül). Sayfada "→," görünüyor. Beş örnek paketin hepsinde var. Skill tarafında düzeltiliyor ama kaynak araçta düzeltilmeli.
2. Yukarıdaki iki boş form hatası.
3. BUMZ paketinde `[EN] GALERİ ALT METİNLERİ` satırı üretilmemiş (TR satırı var).
4. Eski şablonlu sitede (test sitesi) birincil düğmenin zemini (`--bs-btn-bg`) uygulanmıyor, yazı beyaz kalıyor. Fakülte sitesinde (Bootstrap 5) sorun yok, not olarak.

## Skill'in kalan eksikleri

- Görsel seçimi tarayıcı aracının `file_upload` adımına bağlı. Pencerede iki dosya girişi var, ref bazen gizli olana düşüyor, kütüphane düzeltiyor.
- EN gerçek yayını denenmedi.
- Öğrenci Duyuru kategorisi tanımsız sitede kayıt kaydediliyor ama listelenemiyor; `createNews` öncesi kategori sondası eklenmeli (`SKILL.md`'de uyarı var, kodda otomatik sonda yok).
- Her CMS çağrısı 45 s içinde bitmeli, çok kayıtlı geri alma arka planda çalıştırılıp sonradan okunuyor.

## Bora'nın yapacakları

1. Test sitesindeki 2 görünmez öğrenci duyurusu kaydı için web birimine not (silinmeleri).
2. Araç hatalarını Fable'a iletmek (yukarıdaki dört madde).
3. Depoyu herkese açık yapma kararı.
4. İlk gerçek koşu: fakülte TR sitesinde bir paketle `/yayinla`, `site=Fakültesi.tr` ile.

## Dosyalar

`arac/` (BBTF İçerik Aracı.html, KULLANIM.md, gelistirici/, eski/), `docs/ornekler/`, `ornek-paketler/` (5 zip), `kilavuz/yayin-kilavuzu.md` (güncel), `skill/yayinla/` (SKILL.md, scripts/paket_oku.py, scripts/cms-yayinla.browser.js), `evidence/` (test-site-baseline-20261026-asama3.txt, yayinla-20261026-0700.json, en-kuru-calistirma-20261026.txt, arac-uretimi/), `PLAN.md`, `RAPOR.md` (ikinci aşama), `RAPOR-2.md`.
