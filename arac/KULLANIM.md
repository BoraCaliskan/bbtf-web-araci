# BBTF İçerik Aracı, kullanım

Tek dosya, Chrome'da çift tıklayarak açılır. Kurulum yok. İnternet yalnızca "Crossref'ten doldur" için gerekir.

## Akış
1. **Kalıp seç.** Dokuz kalıp: Yeni yayın, Başarı ve ödül, Akademik yükselme ve atama, Proje desteği, Ziyaret ve iş birliği, Dış kurumda konuşma ve eğitim, Etkinlik daveti, Öğrenci duyurusu, Kutlama ve anma. Seçince hangi bölüme gireceği altında yazar.
2. **Dilleri seç.** Türkçe, English ya da ikisi. Pakete yalnızca seçilen dillerin dosyaları girer.
3. **Bilgileri doldur.** Alanlar kalıba göre değişir. "TR / EN" yazan alanlar iki kutudur. Kişiler kadro listesinden seçilir, kadro dışı kişi için "Kadro dışı / öğrenci (elle)" satırı: ad, unvan, tür (öğrencimiz, öğretim üyemiz, dış konuk) ve fotoğraf (daireye tıkla ya da bırak).
4. **Fotoğraf.** Fotoğraflı kalıplarda sol taraf için yatay bir fotoğraf bırakılır. Afişte kullanılan fotoğraf galeriye de kendiliğinden eklenir.
5. **Önizleme.** Sağda afiş canlı güncellenir, Türkçe ve English sekmeleri. "Güvenli alanları göster" ana sayfa kapsülünü, hover oklarını ve haber kartı bandını çizer, metin bunların dışında olmalı. Durum satırı "Sığdı" demeli, "Başlık çok uzun" derse başlığı kısalt.
6. **Çıktılar.** Gövde TR, gövde EN ve metinler.txt kutuları düzenlenebilir, ZIP son hâli alır. Bir eki ya da cümleyi beğenmezsen kutuda düzelt. "Metinleri yeniden üret" formdan baştan yazar.
7. **ZIP indir.** İçinde iki dilde 1920×606 afiş "(bunu kullan)", 1170×369 yedek, gövde HTML'leri, galeri fotoğrafları (galeri-01.jpg...) ve metinler.txt. Bu paket doğrudan /yayinla skill'ine verilir ya da CMS'e elle girilir.

## Kadro
Kütüphane gömülü gelir (29 kişi, 24 fotoğraf) ve tarayıcıda saklanır. Karta tıklayıp ya da fotoğraf bırakıp fotoğrafı değiştirebilirsin. Yeni kişi için alttaki satır. "JSON dışa aktar" yedek alır, başka bilgisayara "JSON içe aktar" ile taşınır. "Gömülü listeye dön" her şeyi sıfırlar.

## Kalıp kuralları (kodda sabit)
Renkler sitenin yeşili ve altın, 10 Kasım ve olağanüstü duyurular siyah. Yazı tipleri Barlow ve Barlow Condensed, gömülü. Metin bloğu 461 pikselin üstünde biter (ana sayfa kapsülü), sol ve sağ kenarlara önemli şey konmaz (hover okları), ana metin yüzde 24-77 bandında kalır (haber kartı). Başlık en fazla üç satır, uzunsa yazı küçülür. Türkçe ekler ünlü uyumuyla üretilir. Görünen metinde noktalı virgül ve uzun tire yok.

## Geliştirici
`gelistirici/` içinde shell.html, core.js (çekirdek ve çizim), templates.js (dokuz kalıp), ui.js (arayüz), kadro.js, assets.json ve build.py. Değişiklikten sonra `python build.py`.
