# ISKOP CMS notları (cmspanel.istanbul.edu.tr)

Fakülte sitelerinin yönetildiği CMS'nin içerik modülleri üzerine, 12 Ekim ile 26 Ekim 2026 arasında okuma ve test yazmalarıyla toplanmış notlar. Yazma denemeleri yalnızca test sitesinde (TÜBİTAK etkinlik sitesi, bbtfevents) yapıldı. Panel AngularJS 1.5 ile yazılmış, editör Froala.

## 1. Genel

- **Site seçici** üstte, `select[ng-model="auth.SelectedSite.EID"]`. Fakülte için üç seçenek: `...Fakültesi.tr`, `...Fakültesi.en`, `... TÜBİTAK 2237-A ... .tr` (test sitesi). Seçim sekme belleğindedir, değiştirince sayfa yenilenir ve sunucu varsayılanı da değişir. **Her yazmadan önce seçiciye bakın.** Görsel kütüphanesi (Yüklediklerim) siteye özeldir.
- **Rotalar:** `#/app/<modül>/` liste, `#/app/<modül>/edit/new` yeni kayıt, `#/app/<modül>/edit/<EID>` düzenleme. Modül adları: `news` (Haber), `notice` (Duyuru, kategorili), `event` (Etkinlik), `slider` (Manşet).
- **EID:** 42 karakterlik hex (UTF-16 kodlu kısa anahtar) + 50 karakterlik sabit site soneki `0039007900700046006200610041004F003200370077003200`. Sitedeki adreslerde tam hali (92 karakter) kullanılır.
- **Liste:** 30 satır/sayfa, arama kutusu (`input[ng-model="term"]`, 50 karakterde kesilir ve kırpılır), satır sonunda İşlemler menüsü (Düzenle, Önizleme, Yayınla/Yayından Kaldır, Sil). Satırın ilk düğmesi sarı yıldızdır, önceliğe ekler (yalnız yerel, Sıralamayı Kaydet'e kadar sunucuya gitmez).
- **Durum:** `Yayında` / `Yayında Değil`. Yayınla ve Yayından Kaldır onaysızdır, bildirim "Kaydedildi".
- **Silme:** İşlemler ▸ Sil ▸ "Onayla ve Devam Et". Bildirim yoktur. Silme kalıcıdır, geri alınamaz. Eskiyen içerik silinmez, yayından kaldırılır.
- **Bildirimler:** sağ üstte 5 saniye görünen toaster. Kaydet ve Yayınla için "Kaydedildi". Görsel için "Görsel yüklendi." Silmede bildirim yok.
- **Öncelikli liste:** her modülün liste sayfasının üstünde. Buradakiler sitede tarih sırasının önüne geçer. Sıra ancak **Sıralamayı Kaydet** ile sunucuya yazılır. Şu an dört modülde de boş tutuluyor.

## 2. Form alanları

### Haber (`news`)
| Alan | Model | Zorunlu | Tür | Not |
|---|---|---|---|---|
| Tarih | `news.Date` | Evet | Tarih seçici, gg/aa/yyyy | Liste sırası bu alana göre. Klavyeyle de girilebilir ama seçiciden seçmek daha güvenli |
| Başlık | `news.Header` | Evet | Metin | Sitede kelime kelime yeniden büyütülür (bkz. bilinen hatalar) |
| Yazar | `news.Author` | Hayır | Metin | Boş bırakılıyor |
| Link | `news.Link` | Hayır | Metin | Doluysa kart dış adrese gider |
| Resim | `news.Img` | **Evet** | Görsel seçici | Haber görselsiz kaydedilmez. 1920x606 afiş |
| Galeri | `news.Gallery` | Hayır | Çoklu görsel seçici | Model: görsel id dizisi, seçim sırası korunur |
| Etiket | `news.Tag` | Hayır | | |
| Birim | `news.SelectedBirimList` | Hayır | | |
| İçerik | `news.Content` | Evet | Froala HTML | Kod görünümü `</>` |

Spot alanı yoktur. Sitedeki kart özeti içeriğin ilk 125 karakterinden türetilir.

### Duyuru (`notice`)
Haberle aynı alanlar, artı **Kategori** (`notice.CategoryId`, varsayılan 1): 1 Duyuru, 2 Tamim Yazıları, 3 Öğrenci Duyuru. **Resim alanı yoktur** (yalnızca Galeri). Duyuruya bağlı manşet için afiş, manşet formunun Resim alanından yüklenir. Liste sayfasında kategori süzgeci (`select[ng-model="catID"]`) vardır, süzgeçsiz listede eski Öğrenci duyuruları eksik gelebilir, tam sayım için kategori seçerek bakın. Sitede Duyurular kategori 1'i, Öğrenci Duyuruları kategori 3'ü gösterir.

### Etkinlik (`event`)
Haberle aynı alanlar. Resim zorunludur. Tarih etkinliğin yapılacağı gündür. Sitedeki takvim yalnızca yüklenmiş kartları işaretler (bkz. bilinen hatalar). Etkinlik başlıkları sitede olduğu gibi gösterilir.

### Manşet (`slider`)
| Alan | Model | Not |
|---|---|---|
| Başlık | `slider.Header` | Bağlı içerikle aynı yazılır |
| Resim | `slider.Img` | 1920x606 |
| Link | `slider.Link` | Bağlı haber/duyuru/etkinliğin tam adresi. Boşsa manşet kendi içeriğiyle açılır ve "Tüm Manşetler" sayfasında listelenmez |
| Title 1, 2, 3 | `slider.Title1..3` | **Boş bırakın.** Dolu olursa afişin üstüne koyu katman ve yazı biner |
| Tarih | `slider.Date` | Bağlı içeriğin tarihi |
| İçerik | `slider.Content` | Bağlantılı manşette boş |

Diğer alanlar: `KisaLink`, `IsBlank`, `Gallery`, `Tag`, `Author`, `PriorityOrder`, `IsPublish`, `Route`, `Keywords`.

## 3. Görsel yükleme ("Fotoğraf Yükle" penceresi)

1. Resim veya Galeri alanındaki yer tutucuya tıklayın.
2. Sekmeler: **Yüklediklerim**, Favoriler, **Yükle**, Toplu Yükle.
3. Yükle sekmesinde açılır liste `uploadStatusSelection.value`: **Kırpma** seçin. Kırpma seçilmeyen yüklemelerde sunucu görseli kendi oranına kırpabilir.
4. Dosya seçin, **Alt Metin (Zorunlu)** yazın (`cropImage.alternatifText`), sağ alttaki **Yükle**.
5. Başarıda pencere Yüklediklerim'e döner, yeni görsel listenin başındadır. Görsel kimliği 22 karakterlik URL güvenli base64 (ör. `eE0b99Fz_kmZs_ycExY3PA`). Sitedeki adres: `https://cdn.istanbul.edu.tr/FileHandler.ashx?f=<id>`.
6. Görseli seçip **Seçilenlerle Devam Et**. Galeri için birden çok görsel seçilir.
7. Tuzaklar: Yükle düğmesi ilk tıklamada bazen tepki vermez, yükleme olmaz, tekrar tıklayın. Pencere açıkken panel saniyede çokça istek atar, işi bitince hemen kapatın. Alt metin alanında Ctrl+A bazen "a" harfi yazar, alanı seçip silerek temizleyin.
8. Galeri alt metinleri CMS'te saklanır ama sitenin galeri bileşeni basmaz (bilinen hata).
9. Kütüphane siteye özeldir ve o siteye yüklenen tüm görselleri listeler. Liste 20'şer görsel yüklenir (`getData`, `api/content/getUploadedImages`, imleç `lastEID`). 5 görselli kütüphanede son imleç aynı sayfayı yeniden döndürür, okurken görsel kimliğine göre tekrarları ayıklayın.
10. Alt metin sonradan Yüklediklerim'de görselin altındaki alandan değiştirilir (`updateAltText(resim)`, `api/content/updateImageAltText {EID, AltText}`, başarıda "Alt metin güncellendi."). Toplu iş için `scripts/alt-metin.browser.js`, kurallar `kilavuz/yayin-kilavuzu.md`.
11. "Görseli Sil" isteğinin gövdesinde CMS uygulama kimlik bilgileri bulunur, istek gövdelerini kaydetmeyin.

## 4. Tarih alanı

- Biçim gg/aa/yyyy. Tarih seçici açıkken yazılan metin sayfaya gider ve boşluk sayfayı kaydırır. Gün seçtikten sonra **nötr bir alana tıklayın** (Yazar).
- Tarih yalnızca gün taşır, saat yoktur. Site tarihi `2026-10-22T00:00:00` olarak alır ve "22 Ekim 2026" gösterir. Gün kayması gözlenmedi, ancak tarayıcı saat dilimi UTC'nin gerisindeyse (Amerika) bir gün geri görünebilir, Türkiye'de sorun yok.
- Sıralamalar tarihe göredir. Tarih sonradan değiştirilmez, üstte tutmak için öncelikli liste kullanılır.

## 5. Dil geçişi

TR ve EN ayrı sitelerdir, ortak kayıt yoktur. Aynı içerik iki sitede ayrı oluşturulur, görseller iki sitede ayrı yüklenir. Site seçicisi değişince açık form kaybolur, önce kaydedin.

## 6. Yayın durumu ve sitede görünürlük

- Yeni kayıt `Yayında Değil` olarak kaydedilir, listeden Yayınla ile yayına girer.
- Yayından kaldırılan bir duyurunun doğrudan adresi boş bir kabuk gösterir ("Bu duyuruya ait detaylı içerik bulunmamaktadır").
- Haber adresi: `/<dil>/haber/<slug>-<EID>`. Slug: kesme işaretleri atılır, Türkçe harfler ASCII'ye çevrilir, küçük harf, 80 karakterde kesilir. `/<dil>/haber/x-<EID>` de açılır.
- Ana sayfa manşet şeridi 5 slayt gösterir: önce öncelikli listedekiler, sonra tarihi en yeni olanlar.
- Haberler listesi 10'ar, Etkinlikler 4'er kart yükler ("Daha Fazla Getir").

## 7. Froala editörü

- `ç` gibi harfler `&ccedil;` olarak saklanır, karşılaştırırken varlıkları çözün.
- Yapıştırılan HTML normalize edilir: öznitelik sırası değişir, `&#8594;` ok karakterine dönüşür, ok öncesi boşluk `&nbsp;` olur.
- `style` içindeki `!important` korunur. Sitenin stili `a.btn` yazısını beyaz yapar, açık zeminli düğmede yazı rengi `color:#205d4e !important` olarak satır içi verilmelidir.
- CMS'nin bazı pencereleri içeriğe gizli `rangy` işaret span'ları bırakabilir, kaydetmeden önce kod görünümünde bakın.
- Bileşenler ▸ Ekle penceresi sekmeyi dondurabilir, sayfayı yenileyin.

## 8. Bilinen hatalar (site tarafı, CMS'den düzeltilemez)

1. **Haber ve duyuru başlıkları kelime kelime büyütülüyor.** Sitenin `camelCaseTr` filtresi başlığı tr-TR ile küçültüp her kelimenin ilk harfini büyütüyor. AA "Aa", KZÖ "Kzö", MEDICON "Medıcon", III "Iıı" olur. İngilizce sayfada "in" "İn" olur. Etkinlik başlıkları etkilenmez. Geçici kural: başlıkta büyük harfli kısaltma ve Roma rakamı kullanmayın, İngilizce i ile başlayan kelimeleri büyük I ile yazın.
2. **Galeri alt metinleri basılmıyor.** Haber ve etkinlik sayfalarındaki galeri görselleri `alt=""` ile geliyor, kapak görselinin alt'ı kayıt başlığı. Kütüphanedeki alt metin sitede yalnızca gövdeye eklenen `<img>` etiketlerinde görünür (28 Ekim 2026'da gövdedeki 20 alt'sız görsele alt eklendi).
3. **Etkinlik takvimi** yalnızca sayfaya yüklenmiş 4 etkinliği işaretliyor.
4. **Manşet Title alanları** doluysa afiş kararıyor.
5. Teknik ayrıntı ve web birimine iletilecek not: `kilavuz/web-birimi-teknik-not.md`.

## 9. Halka açık veri uçları (okuma, kimlik doğrulama yok)

`https://service-cms.istanbul.edu.tr/api/webclient/` altında, `siteKey` ile (TR `86B65F1611324658A5E6CDFB94B1F955`, EN `B9495DCDB814449190BAAB2B7B8AC5C0`):

| Uç | Parametreler | İçerik |
|---|---|---|
| `f_getNews` | Page, PageSize | Yayındaki haberler |
| `f_getNotices` | Categoryid, Page, PageSize, lang | Yayındaki duyurular (kategori 1, 2) |
| `f_getStudentNotices` | Categoryid=3, Page, PageSize, lang | Öğrenci duyuruları |
| `f_getEvents` | Page, PageSize | Yayındaki etkinlikler |
| `f_getSlider` | Page, PageSize | Bağlantılı manşetler |
| `f_getSliderBox` | | Ana sayfa şeridi |
| `f_getGallery` | EID, Value | Bir kaydın galerisi |
| `api/datasource/f_getAkademikKadro`, `f_getIdariKadro`, `f_getFakulteYonetim` | siteKey, sp_lang | Kadro sayfaları |

Yayında olmayan kayıtlar bu uçlarda görünmez, onlar için CMS listesi gerekir. Envanter betiği: `scripts/envanter_build.py`.

## 10. Sayfa içi yardımcılar (geliştirici notu)

CMS sekmesinde `localStorage` içinde saklanan yardımcı kütüphaneler (`__relocLib`, `__relocEvents`) `(0,eval)(localStorage.getItem('__relocLib'))` ile yüklenir ve `window.__A` altında şu işlevleri verir: `A.list(modül, terim, kategori, sayfa)`, `A.read(modül, eid)`, `A.openForm`, `A.save` (Kaydet'e basar ve "Kaydedildi" bekler), `A.toggle(modül, eid, başlık, 'Yayında'|'Yayında Değil')`, `A.relink(manşetEid, başlık, link, {srcEid})`, `A.createRec(modül, {title, date, img, html, cat})`. Kaynak: ISKOP CMS Otonom deposu `automation/relocate/`.
