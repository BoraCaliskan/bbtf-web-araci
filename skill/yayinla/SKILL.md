---
name: yayinla
description: BBTF Yayın Afişi aracının ürettiği ZIP paketini (afiş, gövde HTML, metinler.txt, galeri) ISKOP CMS'de seçilen sitede haber (veya duyuru, öğrenci duyurusu, etkinlik) olarak yayımlar, istenirse habere bağlı manşet açar, halka açık sayfayı doğrular ve "geri al" ile oluşturduğu kayıtları siler. Hedef site parametresi zorunludur, verilmezse çalışmaz.
---

# /yayinla

Bir ZIP yayın paketini CMS'de (cmspanel.istanbul.edu.tr) yayımlar. Tarayıcı olarak **Claude in Chrome** kullanılır (CMS oturumu kullanıcının Chrome'undadır). Akış `cms/yayin-akisi.md` belgesindeki el akışının otomatik hâlidir.

## Girdi

| Parametre | Zorunlu | Değer |
|---|---|---|
| `paket` | evet | ZIP yolu ya da açılmış klasör |
| `site` | **evet** | `Fakültesi.tr`, `Fakültesi.en` veya `TÜBİTAK 2237-A Bilimsel Eğitim Etkinliği.tr` (site seçicisindeki adın sonu). Verilmezse DURUR. |
| `dil` | hayır | `tr`, `en` veya `tr,en` (varsayılan: sitenin dili; `.tr` site için tr, `.en` için en) |
| `tur` | hayır | `haber` (varsayılan), `duyuru`, `ogrenci-duyuru`, `etkinlik` |
| `manset` | hayır | `evet` / `hayır` (varsayılan haber için evet) |
| `tarih` | evet | gg/aa/yyyy, haberin ve manşetin tarihi |
| `geri-al <koşu-id>` | | Daha önce bu skill'in oluşturduğu kayıtları siler |

Kullanım örnekleri:
```
/yayinla paket="C:\...\aa-akademi-kocoglu-paketi.zip" site="TÜBİTAK 2237-A Bilimsel Eğitim Etkinliği.tr" tarih=22/10/2026
/yayinla paket=... site=Fakültesi.tr dil=tr tarih=22/10/2026 manset=evet
/yayinla geri-al 20261026-0130
```

## Kurallar

1. `site` yoksa hiçbir şey yapma, parametreyi iste. Yanlışlıkla ana siteye yazmayı önleyen tek güvence budur.
2. Her yazmadan önce CMS'deki site seçicisi hedefle karşılaştırılır (`Y.start` ve her çağrıdaki `guard`). Uyuşmazsa durur.
3. Her haber için önce görseller yüklenir, sonra form tek Kaydet ile kaydedilir, sonra listeden yayımlanır. Manşet, haber yayımlandıktan ve adresi doğrulandıktan sonra açılır.
4. Oluşturulan her kayıt koşu kaydına yazılır (`localStorage.__yayinla_<koşu-id>` ve `evidence/yayinla-<koşu-id>.json`). Geri alma yalnızca bu kayıtları siler.
5. Başlık kuralları (`kilavuz/yayin-kilavuzu.md`): büyük harfli kısaltma yok, İngilizce başlıkta i ile başlayan kelimeler büyük I ile. `paket_oku.py` uyarır, kullanıcıya sor.
6. Panel çıktıları: javascript_tool çıktısı ~1000 karakterde kesilir ve 40+ karakterlik hex içeren çıktılar engellenir. Uzun değerleri `Y.M()` ile dönüştür, EID'leri kısa göster.

## Adımlar

### 0. Paketi oku
```bash
python skill/yayinla/scripts/paket_oku.py "<paket>" --cikti "<scratch>/plan.json" --tarih gg/aa/yyyy
```
Çıktıdaki `warnings` boş değilse kullanıcıya göster. Eksik afiş veya gövde varsa dur. Başlık uyarısı varsa düzeltilmiş başlığı öner ve onay al (unvanlar değiştirilmez).

### 1. CMS sekmesi ve kütüphane
1. `tabs_context_mcp` ile CMS sekmesini bul (yoksa yeni sekmede `https://cmspanel.istanbul.edu.tr/#/app/default`). Oturum yoksa kullanıcıya söyle, şifre girme.
2. Site seçicisini kontrol et: `document.querySelector('select[ng-model="auth.SelectedSite.EID"]').selectedOptions[0].innerText`. Hedef değilse `selectedIndex` ile değiştir, `change` olayı gönder, 5 s bekle (sayfa yenilenir).
3. Kütüphaneyi yükle: `scripts/cms-yayinla.browser.js` dosyasının içeriğini javascript_tool ile çalıştır (`__relocLib` localStorage'da yoksa önce `automation/relocate/relocate-lib.js` içeriğini çalıştır ve `localStorage.setItem('__relocLib', <kaynak>)` ile sakla).
4. Koşuyu başlat: `__Y.start('<koşu-id>', '<site>')`. Koşu id: `yyyymmdd-hhmm`.

### 2. Her dil için görselleri yükle
Önce `#/app/news/edit/new` formunu aç (`__A.go` ile ya da adres çubuğundan). Sonra her görsel için:
1. `await __Y.openUpload('news.Img')` (galeri için `'news.Gallery'`). Dönen `fileInput: true` olmalı.
2. `find` aracıyla "file input in the upload dialog" ref'ini al, `file_upload` ile dosyayı ver (yol plan.json'daki `poster` ya da `gallery[i].file`).
3. `await __Y.finishUpload('<alt metin>', '<dosya adı>')` → görsel kimliği (22 karakter) döner. Afiş için alt metin plan.json `posterAlt`, galeri için `gallery[i].alt`.
4. Hepsi bitince `await __Y.closeModal()`.
Kimlikleri sakla: `img`, `gallery: [id1, id2, id3]` (paket sırası).

### 3. Haberi oluştur ve yayımla
```js
await __Y.createNews({title, date: 'gg/aa/yyyy', img, gallery, html: <plan.json html>, module: 'news'})
// -> {msg: 'Kaydedildi', eid, full}
await __Y.publish('news', eid, title)   // -> 'Kaydedildi -> Yayında'
```
`tur` duyuru ise `module: 'notice', category: 1` (öğrenci duyurusu 3, Img zorunlu değil), etkinlik ise `module: 'event'`.
Kayıt adresi: `__Y.publicUrl('news', title, full)`. Haber yayımlandıktan sonra bu adresi ikinci bir sekmede açıp doğrula (adım 5). Sitenin ürettiği slug ile uyuşmazsa haber listesindeki gerçek adresi kullan.

### 4. Manşet (manset=evet)
```js
await __Y.createSlider({title, date, img, link: <doğrulanmış haber adresi>})
await __Y.publish('slider', eid, title)
```
Title1-3 ve içerik boş bırakılır (kütüphane böyle yapar).

### 5. Halka açık doğrulama
Ayrı bir sekmede (javascript_tool) haber adresini aç ve kontrol et:
- `.news-title` metni başlıkla aynı mı (site başlığı yeniden büyütür, kelime kelime karşılaştır)
- afiş `img[src*="<img id>"]` var mı, galeri görselleri (`src` içinde her galeri kimliği) var mı
- gövdedeki `a.btn` düğmeleri (varsa) ve yazı rengi (`getComputedStyle(a).color` beyaz olmamalı)
- ana sayfada manşet var mı ve haber adresine gidiyor mu. Fakülte sitesinde (yeni şablon) `a.hero-slide` listesi, test sitesinde (eski şablon, bbtfevents) `div.slider1 img.sliderImage` ve `div.slider-link-container a`.
- Şablondan bağımsız kontrol: `api/webclient/f_getSlider?siteKey=<site>&Page=1&PageSize=10` yanıtında manşetin `Img` ve `Link` değerleri (siteKey: fakülte TR `86B65F1611324658A5E6CDFB94B1F955`, EN `B9495DCDB814449190BAAB2B7B8AC5C0`, test `C4E5471A0E2B4040BFCC8C388F01FBC9`).
Sonuçları kısa tabloyla raporla. Ekran görüntülerini `evidence/` altına kaydet.

### 6. Koşu kaydı
`__Y.status()` çıktısını ve `localStorage.getItem('__yayinla_<koşu-id>')` değerini (EID'ler `__Y.M` ile dönüştürülmüş) `evidence/yayinla-<koşu-id>.json` dosyasına yaz. Kullanıcıya: oluşturulan kayıtlar, adresler, koşu id ve "geri al" komutu.

## Geri alma

`/yayinla geri-al <koşu-id>`:
1. CMS sekmesinde site seçicisi koşunun sitesiyle aynı olmalı (`__Y.load(id)` sonrası `guard` kontrol eder).
2. `await __Y.undo('<koşu-id>')`: önce manşetler, sonra haberler. Yayındaysa yayından kaldırır, sonra İşlemler ▸ Sil ▸ Onayla ve Devam Et. Silme isteği yalnızca beklenen EID'yi içeriyorsa gönderilir, sunucu yanıtı (`MessageType: success`) ve satırın listeden düşmesi doğrulanır.
3. Çıktıyı raporla, `evidence/yayinla-<koşu-id>.json` dosyasına `undo` alanı ekle.
Geri alma yalnızca bu koşunun oluşturduğu kayıtları siler, başka hiçbir kaydı silmez.

## Bilinen sınırlar
- javascript_tool tek çağrıda 45 saniye bekler. `createNews` (kaydet + liste doğrulaması) sınırın içinde kalır, ama `undo` iki kayıtta sınırı aştı. Geri almayı kayıt başına `__Y.deleteOne(rec)` ile ayrı çağırın ya da `undo` zaman aşımı verirse 20 s sonra `__Y.status()` ile sonucu okuyun (işlem sayfa içinde sürer).
- Eski şablonlu sitelerde (bbtfevents) haber sayfası kapak görselini basmaz ve metinde tarih yerine oluşturma günü görünür, manşet bağlantısı "Tüm Manşetler" sayfasına gider. Doğrulamayı API ile yapın.
- Yüklenen görseller geri almada silinmez, sitenin görsel kütüphanesinde kalır.
- Görsel dosyası seçimi tarayıcı aracının `file_upload` adımıyla yapılır, saf JS ile yapılamaz.
- Yükle düğmesi bazen ilk tıklamada tepki vermez, `finishUpload` 20 s içinde sonuç gelmezse hata verir, tekrar çağrılabilir.
- Aynı başlık ve tarihte kayıt varsa `AYNI_KAYIT_VAR` ile durur (yineleme koruması).
- Etkinlik formunun hazır olma koşulu haberle aynı kabul edilir, farklıysa `createNews` zaman aşımına düşer.
