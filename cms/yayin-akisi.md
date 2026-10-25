# ZIP paketinden yayın akışı

BBTF Yayın Afişi aracının ürettiği ZIP ile (ya da aynı düzende elle hazırlanmış bir paketle) CMS'de sıfırdan haber ve manşet yayımlama adımları. Her adım iki dil için ayrı yapılır. Örnek paket: `aa-akademi-kocoglu-paketi.zip` (23 Ekim 2026'da bu akışla yayımlandı).

## Paketin içi ve nereye gittiği

| Dosya | Nereye | Not |
|---|---|---|
| `manset-...-tr-1920x606 (bunu kullan).jpg` | TR haberin **Resim** alanı ve TR manşetin **Resim** alanı | Aynı dosya iki yerde kullanılır. Bir kez yüklenir, ikinci yerde Yüklediklerim'den seçilir |
| `manset-...-en-1920x606 (bunu kullan).jpg` | EN haber ve EN manşet Resim alanı | Üzerinde İngilizce yazı olduğu için TR dosyası EN'de kullanılmaz |
| `...-1170x369.jpg` | Kullanılmaz | Yedek boyut |
| `haber-...-tr.html` | TR haberin **İçerik** editörü, kod görünümü | Gövdede görsel yok |
| `haber-...-en.html` | EN haberin İçerik editörü | |
| `metinler.txt` | Başlık alanı, görsel alt metinleri | Haber başlığı TR/EN, afiş alt metni, spot, galeri alt metinleri |
| galeri `*.jpg` (varsa) | Haberin **Galeri** alanı | Her biri ayrı yüklenir, alt metni metinler.txt'den |

Spot için CMS'de ayrı alan yoktur. Spot metni gövdenin ilk paragrafı olarak HTML'de zaten yer alır (sol kenarlıklı paragraf).

## Adımlar

### 0. Hazırlık
1. ZIP'i boş bir klasöre açın.
2. `metinler.txt` dosyasını açık tutun.
3. CMS'de üstteki **site seçicisinde** doğru siteyi seçin (`Bilgisayar ve Bilişim Teknolojileri Fakültesi.tr`). Seçici değişince sayfa yenilenir.
4. Başlıkta büyük harfli kısaltma varsa (AA, KZÖ, MEDICON) açık halini yazın. Site haber başlıklarını kelime kelime yeniden büyütür, kısaltmalar bozulur. İngilizce başlıkta "in", "is" gibi kelimeleri büyük I ile yazın (In, Is). Ayrıntı: `kilavuz/yayin-kilavuzu.md`.

### 1. Görselleri yükleme (haber formunun içinden)
1. Haberler ▸ Yeni Haber.
2. **Resim** alanındaki yer tutucuya tıklayın, "Fotoğraf Yükle" penceresi açılır.
3. **Yükle** sekmesi. Açılır listeden **Kırpma** seçin (Kırpma seçilmezse afiş sunucuda farklı orana kırpılabilir).
4. Dosyayı seçin: afiş (1920x606).
5. **Alt Metin (Zorunlu)** alanına metinler.txt'deki afiş alt metnini yazın.
6. Sağ alttaki **Yükle** düğmesi. Başarılı olunca pencere Yüklediklerim sekmesine döner, yeni görsel listenin başındadır. Düğme ilk tıklamada tepki vermezse (yükleme olmaz, sekme Yükle'de kalır) bir kez daha tıklayın. "Görsel yüklendi." bildirimi görünür.
7. Görseli listeden seçip **Seçilenlerle Devam Et**.
8. Galeri için **Galeri** alanının yer tutucusuna tıklayın, aynı pencerede her fotoğrafı tek tek yükleyin (Kırpma, alt metin, Yükle). Sonra üçünü birden seçip Seçilenlerle Devam Et. Galeri sırası seçim sırasıdır.

### 2. Haber formu
| Alan | Değer |
|---|---|
| Başlık | metinler.txt'deki haber başlığı |
| Tarih | Olayın tarihi (gg/aa/yyyy). Tarih seçiciden seçin, seçtikten sonra Yazar alanına tıklayarak seçiciyi kapatın |
| Yazar | Boş |
| Link | Boş |
| Resim | Afiş |
| Galeri | Fotoğraflar |
| İçerik | Editörde kod görünümünü açın (`</>`), HTML dosyasının içeriğini yapıştırın, kod görünümünü kapatın |
| Etiket, Birim | Boş bırakılabilir |

**Kaydet**. Bildirim "Kaydedildi". Haber listesinde kayıt **Yayında Değil** olarak görünür.

### 3. Yayınlama ve adres
1. Haber listesinde kaydın satırında **İşlemler ▸ Yayınla**. Onay yok, bildirim "Kaydedildi".
2. Sitede Haberler sayfasını açın, haberin kartına tıklayın, adres çubuğundaki adresi kopyalayın. Biçim: `https://bilgisayar.istanbul.edu.tr/tr/haber/<slug>-<EID>`. Slug başlıktan türetilir, 80 karakterde kesilir.
3. Haber sayfasında kontrol: başlık, afiş, galeri (3 fotoğraf), gövdedeki düğmeler çalışıyor mu, tarih doğru mu.

### 4. Manşet
1. Manşet ▸ Yeni Manşet.
2. Başlık: haber başlığının aynısı. Resim: aynı afiş (Yüklediklerim'den seç). **Link**: 3. adımda kopyalanan haber adresi. Tarih: haberle aynı. **Title 1, 2, 3 boş**, İçerik boş. Title alanları dolarsa afiş kararır ve üstüne yazı biner.
3. Kaydet, sonra listede İşlemler ▸ Yayınla.
4. Ana sayfada manşet şeridinde ilk sırada göründüğünü ve tıklanınca habere gittiğini kontrol edin.

### 5. İngilizce
Site seçicisinden `.en` sitesine geçin ve 1'den 4'e kadar aynı adımları İngilizce dosyalarla tekrarlayın. Tarih aynı kalır. Görseller her sitede ayrı yüklenir (görsel kütüphanesi siteye özeldir).

### 6. Sonradan başlık değişirse
Başlık değişince haberin sitedeki adresi de değişir. Manşetin Başlık ve Link alanlarını da güncelleyin. Eski adres `/<dil>/haber/x-<EID>` biçimiyle hâlâ açılır.

## Kontrol listesi
- [ ] Site seçicisi doğru siteyi gösteriyor
- [ ] Haber: başlık, tarih, afiş, galeri, gövde, Yayında
- [ ] Haber sayfası sitede açılıyor, düğmeler çalışıyor
- [ ] Manşet: başlık = haber başlığı, Link = haber adresi, Title alanları boş, Yayında
- [ ] Ana sayfa şeridinde manşet görünüyor ve habere gidiyor
- [ ] Aynısı İngilizce sitede
