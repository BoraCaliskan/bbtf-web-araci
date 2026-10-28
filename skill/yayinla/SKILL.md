---
name: yayinla
description: BBTF İçerik Aracı'nın (ve eski Yayın Afişi aracının) ürettiği ZIP paketini ISKOP CMS'de seçilen sitede yayımlar: haber, etkinlik, öğrenci duyurusu ya da bağlantısız kutlama manşeti, istenirse kayda bağlı manşet. Halka açık sayfayı ve veri ucunu doğrular, "geri al" ile oluşturduğu kayıtları ve yüklediği görselleri siler. Hedef site parametresi zorunludur, verilmezse çalışmaz.
---

# /yayinla

Bir ZIP yayın paketini CMS'de (cmspanel.istanbul.edu.tr) yayımlar. Tarayıcı olarak **Claude in Chrome** kullanılır (CMS oturumu kullanıcının Chrome'undadır). Halka açık doğrulama için yerleşik tarayıcı ya da Python ile veri uçları kullanılır.

## Girdi

| Parametre | Zorunlu | Değer |
|---|---|---|
| `paket` | evet | ZIP yolu ya da açılmış klasör |
| `site` | **evet** | `Fakültesi.tr`, `Fakültesi.en` veya `TÜBİTAK 2237-A Bilimsel Eğitim Etkinliği.tr` (site seçicisindeki adın sonu). Verilmezse DURUR. |
| `dil` | hayır | `tr`, `en`. Varsayılan: sitenin dili (`.tr` site için tr, `.en` için en). Paketin DİLLER satırında olmayan dil kullanılamaz |
| `bolum` | hayır | Paketin BÖLÜM satırından gelir: `haber`, `etkinlik`, `ogrenci-duyuru`, `manset`. Eski biçim paketlerde `haber` |
| `manset` | hayır | Paketin MANŞET satırından gelir (evet/hayır). `manset` bölümünde yalnızca manşet açılır |
| `tarih` | hayır | Paketin TARİH satırı yoksa zorunlu, gg/aa/yyyy. Etkinlikte etkinlik günü |
| `geri-al <koşu-id>` | | Daha önce bu skill'in oluşturduğu kayıtları ve yüklediği görselleri siler |

Örnekler:
```
/yayinla paket="ornek-paketler/haber-yeni-yayin-prof-dr-ismail-onden.zip" site=Fakültesi.tr
/yayinla paket="...etkinlik....zip" site=Fakültesi.en dil=en
/yayinla geri-al 20261026-0700
```

## Bölüm eşlemesi

| BÖLÜM | CMS modülü | Not |
|---|---|---|
| haber | `news` | Resim zorunlu (afiş), galeri varsa yüklenir, manşet habere bağlı |
| etkinlik | `event` | Resim zorunlu, tarih etkinlik günü, manşet etkinliğe bağlı |
| ogrenci-duyuru | `notice`, CategoryId 3 | Duyuru formunda Resim alanı yok, afiş yalnızca manşet için manşet formundan yüklenir. **Test sitesinde kategori 3 çalışmaz** (sunucu hatası), orada denemek için kategori 1 kullanın |
| manset | `slider` | Bağlantısız: Link, Title1-3 ve içerik boş, kayıt oluşturulmaz |

## Kurallar

1. `site` yoksa hiçbir şey yapma, parametreyi iste.
2. Her yazmadan önce CMS'deki site seçicisi hedefle karşılaştırılır (`__Y.start` ve her çağrıda `guard`). Uyuşmazsa durur.
3. Sıra: görseller yüklenir, kayıt tek Kaydet ile kaydedilir, listeden yayımlanır, adresi doğrulanır, sonra manşet açılır ve yayımlanır.
4. Oluşturulan her kayıt ve yüklenen her görsel koşu kaydına yazılır (`localStorage.__yayinla_<koşu-id>`, sonra `evidence/yayinla-<koşu-id>.json`). Geri alma yalnızca bunları siler.
5. Başlık kuralları (`kilavuz/yayin-kilavuzu.md`): büyük harfli kısaltma yok, İngilizce başlıkta i ile başlayan kelimeler büyük I ile. `paket_oku.py` uyarır, kullanıcıya sor, unvanlar değiştirilmez.
6. Panel çıktıları: javascript_tool çıktısı ~1000 karakterde kesilir, 40+ karakterlik hex içeren çıktılar engellenir, her çağrı 45 saniyede zaman aşımına düşer. EID'leri kısa göster (`eid.slice(0, 8)`), uzun işleri parçalara böl.

## Adımlar

### 0. Paketi oku
```bash
python skill/yayinla/scripts/paket_oku.py "<paket>" --cikti "<scratch>/plan.json" [--tarih gg/aa/yyyy]
```
`plan.json`: `bolum, module, category, manset, mansetStandalone, date, langs, warnings` ve dil başına `title, spot, mansetTitle, mansetSub, posterAlt, poster, html, gallery[{file, alt}]`. Araç çıktısındaki `&#8594,` gibi virgülle biten varlıklar düzeltilir ve uyarı verilir. `warnings` boş değilse kullanıcıya göster, eksik afiş veya gövde varsa dur.

### 1. CMS sekmesi ve kütüphane
1. `tabs_context_mcp` ile CMS sekmesini bul (yoksa yeni sekmede `https://cmspanel.istanbul.edu.tr/#/app/default`). Oturum yoksa kullanıcıya söyle, şifre girme.
2. Site seçicisini kontrol et: `document.querySelector('select[ng-model="auth.SelectedSite.EID"]').selectedOptions[0].innerText`. Hedef değilse `selectedIndex` ile değiştir, `change` olayı gönder, 6 s bekle (sayfa yenilenir, yardımcılar silinir).
3. Kütüphaneyi yükle: `scripts/cms-yayinla.browser.js` içeriğini javascript_tool ile çalıştır (`__relocLib` localStorage'da yoksa önce `automation/relocate/relocate-lib.js` çalıştırılıp `localStorage.setItem('__relocLib', <kaynak>)` ile saklanır). Dönüş "Y hazır v2".
4. Koşuyu başlat: `__Y.start('<koşu-id>', '<site>')`. Koşu id: `yyyymmdd-hhmm`.

### 2. Görselleri yükle
Önce ilgili formu aç: haber `#/app/news/edit/new`, etkinlik `#/app/event/edit/new`, manşet `#/app/slider/edit/new` (öğrenci duyurusunda afiş manşet formundan yüklenir). Her görsel için:
1. `await __Y.openUpload('news.Img')` (etkinlik `'event.Img'`, manşet `'slider.Img'`). `fileInput: true` dönmeli.
2. `find` ile "file input in the upload dialog" ref'lerini al, **ilkini** kullan ve `file_upload` ile dosyayı ver. Pencerede iki dosya girişi vardır (Yükle sekmesi ve gizli Toplu Yükle); dosya gizli olana düşerse `finishUpload` görünür girişe taşır.
3. `await __Y.finishUpload('<alt metin>', '<dosya adı>')` → görsel kimliği döner ve koşuya yazılır. Afiş için `posterAlt`, galeri için `gallery[i].alt`.
4. Hepsi bitince `await __Y.closeModal()`.

### 3. Kaydı oluştur ve yayımla
Gövde HTML'i çağrıya satır içi verilir (template literal, HTML'de ters tırnak yoktur). Yerel bir sunucudan `fetch` https sayfadan engellenir.
```js
await __Y.createNews({title, date, img, gallery: [...], html, module: 'news'})        // haber
await __Y.createNews({title, date, img, html, module: 'event'})                      // etkinlik
await __Y.createNews({title, date, html, module: 'notice', category: 3})             // öğrenci duyurusu (img yok)
await __Y.publish('<module>', eid, title)                                             // 'Kaydedildi -> Yayında'
__Y.publicUrl('<module>', title, full)                                                // adres (öğrenci duyurusu da /duyuru/ altında)
```
Her çağrı ayrı javascript_tool çağrısı olsun (45 s sınırı). Aynı başlık ve tarihte kayıt varsa `AYNI_KAYIT_VAR` ile durur.

### 4. Manşet
```js
await __Y.createSlider({title: mansetTitle, date, img, link: <doğrulanmış adres>})     // bağlı manşet
await __Y.createSlider({title: mansetTitle, date, img, standalone: true})            // kutlama, bağlantısız
await __Y.publish('slider', eid, mansetTitle)
```
Title1-3 ve içerik boş bırakılır. Manşet başlığı paketin MANŞET BAŞLIĞI satırından gelir.

### 5. Halka açık doğrulama
- Fakülte sitesi (yeni şablon): kayıt sayfasında `.news-title`, kapak `img[src*="<img id>"]`, galeri görselleri, `a.btn` düğmeleri ve yazı rengi, ana sayfada `a.hero-slide`.
- Test sitesi (eski şablon): kayıt sayfası kapak görselini basmaz, ana sayfa şeridi `div.slider1 img.sliderImage`, bağlantı `/tr/mansetler/` sayfasına gider.
- Şablondan bağımsız: `api/webclient/f_getNews|f_getEvents|f_getNotices?Categoryid=…|f_getSlider|f_getSliderBox?siteKey=<site>&Page=1&PageSize=10` ve `f_getGallery?EID=…&Value=haber`. siteKey: fakülte TR `86B65F1611324658A5E6CDFB94B1F955`, EN `B9495DCDB814449190BAAB2B7B8AC5C0`, test `C4E5471A0E2B4040BFCC8C388F01FBC9`.
Sonuçları kısa tabloyla raporla.

### 6. Koşu kaydı
`__Y.status()` çıktısını `evidence/yayinla-<koşu-id>.json` dosyasına yaz. Kullanıcıya: oluşturulan kayıtlar, adresler, koşu id ve "geri al" komutu.

## Geri alma

`/yayinla geri-al <koşu-id>`:
1. CMS sekmesinde site seçicisi koşunun sitesiyle aynı olmalı (`__Y.load(id)`, `guard`).
2. Kayıtlar: `__Y.undoRecords('<koşu-id>')` önce manşetleri, sonra kayıtları yayından kaldırıp siler (İşlemler ▸ Sil ▸ Onayla ve Devam Et, silme isteği yalnızca beklenen EID'yi içeriyorsa gönderilir, sunucu yanıtı ve satırın düşmesi doğrulanır). Çok kayıtta 45 s'yi aşar: sayfa içinde arka planda başlatın (`(async () => { window.__undo = await __Y.undoRecords('<id>'); })()`), 20-30 s arayla `__Y.status()` okuyun.
3. Görseller: `__Y.undoImages()` koşuda yüklenen her görseli Fotoğraf Yükle ▸ Yüklediklerim ▸ "Görseli Sil" ▸ onay ile siler (`api/content/removeImageFromcdn`, yanıt ve listeden düşme doğrulanır). Tek bir görsel için `__Y.deleteImage(id)`.
4. Çıktıyı raporla, evidence dosyasına `undo` alanı ekle.
Geri alma yalnızca bu koşunun oluşturduğu kayıtları ve yüklediği görselleri siler.

## Bilinen sınırlar
- Görsel dosyası seçimi tarayıcı aracının `file_upload` adımıyla yapılır, saf JS ile yapılamaz.
- Yükle düğmesi bazen ilk tıklamada tepki vermez, `finishUpload` 20 s içinde sonuç gelmezse hata verir, tekrar çağrılabilir.
- Öğrenci Duyuru kategorisi (3) yalnızca kategorinin tanımlı olduğu sitelerde çalışır. Tanımsız sitede kayıt kaydedilir ama listelenemez ve silinemez; `createNews` öncesi `api/notice/getNotices` ile `CategoryId: 3` denenip hata alınırsa durun.
- EN tarafı gerçek yayınla denenmedi (test sitesi tek dilli), plan çıktısıyla kuru çalıştırıldı.
- Araç çıktısındaki `&#8594,` varlık hatası paket okuyucuda düzeltilir, aracın kendisinde düzeltilmesi gerekir.
