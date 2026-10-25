# PLAN, gece görevi (26 Ekim 2026)

Tek ajan. Ana site (bilgisayar.istanbul.edu.tr) için CMS'e yalnızca okuma. Yazma yalnızca test sitesinde (bbtfevents, TÜBİTAK), kendi test kayıtlarıyla. Depo önce özel, sabah Bora karar verir.

| Adım | İş | Çıktı | Durum |
|---|---|---|---|
| 0 | Depo ve klasör yapısı, arac/ ve kilavuz/ kopyaları | README, PLAN, RAPOR, arac/, kilavuz/ | başladı |
| 1 | Kadro kütüphanesi: TR ve EN akademik, idari, yönetim sayfaları. Fotoğraflar kare 600x600 | kadro/kadro.json, kadro/kadro.js, kadro/foto/ | bekliyor |
| 2 | CMS notları ve yayın akışı, mevcut bilgiden ve okuyarak | cms/cms-notlar.md, cms/yayin-akisi.md | bekliyor |
| 3 | İçerik envanteri, TR ve EN, 5 modül, panel okumaları | envanter/*.json, envanter/ozet.csv | bekliyor |
| 4 | Kapak ve manşet görselleri 1200 px | envanter/gorseller/ | bekliyor |
| 5 | /yayinla skill'i, hedef site zorunlu parametre | skill/yayinla/ | bekliyor |
| 6 | Test sitesinde uçtan uca deneme ve geri alma | evidence/ | bekliyor |
| Bitiş | RAPOR.md, commit, push (özel depo) | RAPOR.md | bekliyor |

Yöntem: Halka açık sayfalar için tarayıcıda Angular scope okuması, CMS listeleri için sayfa içi okuma yardımcıları (`__relocLib`), görseller için Python (urllib + Pillow). Her adım sonunda commit.

Kişisel veri kuralı: e-posta, telefon, öğrenci numarası, toplantı şifresi depoya girmez, metinlerde "[kaldırıldı]" ile değiştirilir. Kadro kaydında e-posta ve telefon alanları alınmaz.
