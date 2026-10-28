# Alt metin betikleri

28 Ekim 2026'daki kütüphane ve gövde alt metni çalışmasında kullanıldı (sonuç: `evidence/alt-metin-20261028/`). Betikleri depo dışında bir çalışma klasörüne kopyalayıp orada çalıştırın, görseller ve ara dosyalar o klasöre yazılır.

1. Panelde Fotoğraf Yükle ▸ Yüklediklerim listesini okuyun ve `lib-tr-raw.txt`, `lib-en-raw.txt` olarak kaydedin (satır başına sıra, görsel kimliği, alt metin, sekmeyle ayrılmış). Aktarımı FNV-1a özetiyle doğrulayın.
2. `hazirla.py`: görselleri indirir (en uzun kenar 1280), envanterden kullanım bağlamını (tür, rol, tarih, başlık, metin) ekler, `items.json` yazar.
3. `batches.py`: aynı kaydın görsellerini bir arada tutarak yaklaşık 30 görsellik gruplar yazar (`batches/NN.json`).
4. `is-akisi.js`: Workflow betiği. `args`: `{dir, draftDir, batches: [["NN", adet, "full" | "verify"]]}`. `full` taslak ve bağımsız kontrol yapar, `verify` yalnızca kontrol yapar (taslak `drafts/NN.json` dosyasından okunur). Bir iş akışı en çok yaklaşık 10 ajanı aynı anda çalıştırır, hız için grupları birkaç iş akışına bölün.
5. `taslak_cek.py <journal.jsonl ...>`: iş akışı günlüklerinden `drafts/` ve `verify/` dosyalarını çıkarır. `bekle.py` bir günlükte verilen etiketlerin bitmesini bekler.
6. `birlestir.py`, ardından `sonuc.py`: son alt metinler, biçim denetimi, `duzeltme.json` ile elle düzeltmeler, site başına `uygula-<site>.json` (yalnızca değişenler).
7. `govde_map.py`: gövdesinde alt'sız görsel olan kayıtlar için `govde-tr.json`, `govde-en.json`.
8. Panelde `scripts/alt-metin.browser.js` (`window.__T`, `__relocLib` gerekir): `T.fileInput()` ile eklenen dosya girişine `file_upload` ile JSON verin, `await T.readFile()` özet değeri döndürür. `T.apply('<site adının sonu>')` yazar, `T.verify()` kütüphaneyi sunucudan yeniden okuyup karşılaştırır. Gövde için `await T.readFile('govde')` ve `await T.bodyDo(i, '<site adının sonu>')`. Her yazmadan önce site seçicisi denetlenir.
