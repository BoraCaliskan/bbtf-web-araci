# PLAN

## Üçüncü aşama (26 Ekim 2026 sabah): yeni araç, skill uyarlaması, uçtan uca deneme

Tek ajan. Ana site CMS'inde yalnızca okuma. Yazma yalnızca test sitesinde (bbtfevents), bu kez görsel silme dahil. Her adımda commit, commit mesajlarında imza satırı yok.

| Adım | İş | Çıktı | Durum |
|---|---|---|---|
| 0 | Eski araç `arac/eski/`, yeni BBTF İçerik Aracı `arac/`, `docs/ornekler/`, `ornek-paketler/`, kılavuza "İçerik türleri ve kalıpları" | depo | tamam |
| 1 | `paket_oku.py` yeni metinler.txt biçimi (BÖLÜM, MANŞET, TARİH, DİLLER, DOSYA ÖNEKİ, manşet başlığı ve alt metni, galeri-NN), eski biçim korunur. Kütüphane v2: etkinlik, öğrenci duyurusu (kategori 3), bağlantısız manşet, görsel silme, geri almada görseller | `skill/yayinla/` | tamam |
| 2 | Beş örnek paket test sitesinde TR olarak yayımlanır, sayfa ve veri ucu doğrulanır, EN kuru çalıştırma, sonra hepsi geri alınır, görseller (önceki 4 dahil) silinir, listeler karşılaştırılır | `evidence/` | sürüyor |
| 3 | Araç başsız kontrol: "Hazır, kadro 29 kişi", dokuz kalıp, konsol | RAPOR-2 | tamam (iki boş form hatası bulundu) |
| Bitiş | RAPOR-2.md, commit, push | | bekliyor |

Yöntem notları: halka açık okumalar yerleşik tarayıcıda (çıktı kesilmez), CMS işleri Claude in Chrome'da (45 s çağrı sınırı, uzun işler sayfa içinde arka planda sürer ve sonradan okunur). Paket gövdeleri CMS sekmesine satır içi verilir, yerel sunucudan `fetch` https sayfadan engelleniyor.

## İkinci aşama (26 Ekim 2026 gece): bkz. RAPOR.md
