# Görsel alt metinleri, 28 Ekim 2026

## Kapsam

- CMS görsel kütüphanesi (Fotoğraf Yükle ▸ Yüklediklerim), üç site: Fakülte TR, Fakülte EN, TÜBİTAK 2237-A.
- Yayımlanmış kayıtların gövdesindeki `<img>` etiketleri.

## Sonuç

| Site | Görsel | Önceden boş | Güncellenen | Dokunulmayan | Şimdi boş |
|---|---|---|---|---|---|
| TR | 346 | 271 | 341 | 5 (3 uygun alt metin, bugün yüklenen 2 afiş) | 0 |
| EN | 281 | 234 | 279 | 2 (bugün yüklenen 2 afiş) | 0 |
| TÜBİTAK | 5 | 5 | 5 | 0 | 0 |

- Geri kalan 120 dolu alt metnin çoğu da yenilendi: dosya adları ("medicon-2026-afis"), genel ifadeler ("Teknofest", "pafiş", "Group Photo of Meeting"), gündelik dil ("hoca", "Hoja") ve 364 karaktere varan haber cümleleri.
- Gövde görselleri: 18 kayıtta 20 etikete alt eklendi (TR 10 kayıt 11 görsel, EN 8 kayıt 9 görsel). Her kayıtta HTML yalnızca eklenen alt öznitelikleri kadar uzadı, metin ve tarih aynı kaldı. 18 sayfa sitede açılıp kontrol edildi. Liste: `govde.md`.
- Tüm satırlar (eski ve yeni alt metin, kontrol notu): `sonuc.csv`. E-posta ve telefon numaraları bu dosyada `[kaldırıldı]` ile değiştirildi.

## Yöntem

1. Kütüphane listeleri panelden okundu (özet değerle doğrulandı), 630 görsel indirildi, her görsele kullanıldığı kayıtların türü, tarihi, başlığı ve metni eşlendi (`envanter/`).
2. 22 grup, grup başına yaklaşık 30 görsel. Her grupta bir ajan görsellere bakarak taslak yazdı, ayrı bir ajan her görseli yeniden açıp taslağı denetledi. Denetim 60 alt metni düzeltti (EN 39, TR 21). İş paralel dört iş akışına bölündü. Kurallar: `kilavuz/yayin-kilavuzu.md`, "Görsel alt metni". Ajan metni: `scripts/alt-metin/is-akisi.js`.
3. Biçim denetimi (`scripts/alt-metin/sonuc.py`): 60-247 karakter (ortanca 199). Noktalı virgül, uzun tire, çift tırnak, emoji, dosya adı, "hoca" yok.
4. Elle düzeltme (9 görsel): afişte yanlış basılmış konuşmacı adları kayıttaki yazımla verildi (Rahime Yılmaz, Marjan Alavi, Murat Kürtüncü).
5. Uygulama: CMS'in kendi `updateAltText` işleviyle (`api/content/updateImageAltText`). Her isteğin yanıtı denetlendi (HTTP 200, MessageType success, hata 0). Ardından kütüphane sunucudan yeniden okundu, beklenen değerlerle karşılaştırıldı: uyuşmazlık 0, boş alt 0, FNV-1a özetleri eşleşti (TR 1005280705, EN 2646990718, TÜBİTAK 795795714).

## Bulgular (karar sizde)

1. Sitenin şablonu galeri görsellerini boş alt metinle basıyor, kapak görselinde alt olarak kayıt başlığını kullanıyor. Kütüphanedeki alt metinler bu yüzden sitede görünmüyor, yalnızca gövdedeki görsellerde görünüyor. Düzeltme web biriminde (`kilavuz/web-birimi-teknik-not.md`).
2. 28.03.2023 tarihli "... Araştırma Görevlisi kadrosu alım ilanı Nihai Değerlendirme Sonucu" duyurusunun gövdesinde personel sitesinden kopyalanmış iki işlevsiz yazı boyutu düğmesi var. Alt eklemek yerine silinmeleri doğru olur, dokunulmadı.
3. Ünvan tutarsızlığı: 21.04.2026 tarihli "Yeni Yayın: Dr. Öğr. Üyesi Pınar Sarısaray Bölük" haberi ve manşeti (EN: "Asst. Prof."). Afiş, 2024 kayıtları ve kadro listesi "Doç. Dr." diyor. Ünvanlara dokunulmadı.
4. 14.03.2024 tarihli "Dekan Yardımcısı Ataması" haberinin gövdesinde "Doç. Dr. Öğr. Üyesi İsmail ÖNDEN" yazıyor. Dokunulmadı.
5. Afişlerdeki yazım hataları: Bilisayar, Mandager, Ambitons, Rektörkük ve yanlış basılmış adlar alt metinde düzeltildi. "Artificial Intelligence and Ethic", "Expert System", "IEEE Explore", "Exams Begins!" afişteki gibi bırakıldı.
6. "Teknoloji Çağında Sürdürülebilirlik: Kadının Rolü" program afişinde tarih "6 Mart 2025 Cuma" basılmış, etkinlik 6 Mart 2026. Alt metinde yıl yazılmadı.
7. Milli gün görsellerinde Atatürk portresi, İstanbul'un fethi görsellerinde Fatih Sultan Mehmet portresi adıyla anıldı. Başka hiç kimse yüzünden tanınarak adlandırılmadı, adlar yalnızca görselde yazıyorsa ya da kayıttan kesin anlaşılıyorsa verildi.
