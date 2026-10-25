Konu: bilgisayar.istanbul.edu.tr sitesinde CMS üzerinden çözülemeyen üç teknik sorun

Merhaba,

Bilgisayar ve Bilişim Teknolojileri Fakültesi sitesinde içerik tarafında yapılabilecek bir ayar bulunmayan üç durumu tek notta iletmek istiyorum.

**1. Haber ve duyuru başlıkları kelime kelime büyütülüyor**

Gözlem: Haber ve duyuru başlıkları sitede her kelimenin ilk harfi büyük, geri kalanı küçük olacak şekilde gösteriliyor. CMS'e girilen yazım korunmuyor.
- Kısaltmalar bozuluyor: AA "Aa", PhD "Phd", KZÖ "Kzö", IFMBE "Ifmbe" oluyor. Kelime içindeki büyük I noktasız ı'ya dönüyor (MEDICON "Medıcon", III "Iıı").
- İngilizce sitede küçük i ile başlayan kelimeler İ ile yazılıyor ("in" "İn", "is" "İs" oluyor). "a", "for", "and" gibi küçük kalması gereken sözcükler de büyük harfle başlıyor.
- Etkinlik başlıklarında bu sorun yok, girildiği gibi görünüyor.

Örnek: https://bilgisayar.istanbul.edu.tr/en/haber/doktora-ogrencimiz-maryam-al-rubaye-medicon-2026-ifmbe-bilimsel-yarismasinda-ucu-4A007500560035004D00470056005900730061006E0039007900700046006200610041004F003200370077003200 sayfasında başlık "Our Phd Student ... Wins Third Place İn The Ifmbe ..." olarak görünüyor.

Nedeni (sayfa kodundan): /api/webclient/js içindeki camelCaseTr filtresi başlığı "tr-TR" yereliyle küçültüyor, sonra her kelimenin ilk harfini yine "tr-TR" ile büyütüyor. Yalnızca "ve, ile, de, da, ki, mi, ya" küçük bırakılıyor. Filtre dosyada iki kez tanımlanmış. Aynı dosyada İngilizce küçük sözcük listesi içeren bir CamelCaseEn filtresi de var, ancak İngilizce sayfalarda da camelCaseTr kullanılıyor. Duyuru sayfasının yan listesindeki bağlama örnek olarak şöyle: recentNotice.title || recentNotice.Header | camelCaseTr

Öneri: Başlıkların CMS'e girildiği gibi gösterilmesi en sade çözüm olur. Biçimlendirme korunacaksa en azından ilk harfinden sonra büyük harf içeren kelimelere (AA, PhD, IFMBE, MEDICON) dokunulmaması ve İngilizce sayfalarda "en" yereli ile CamelCaseEn kullanılması yeterli olur.

**2. Haber galerisindeki görsellerin alt metni sayfaya basılmıyor**

Gözlem: CMS'te her görsel yüklenirken "Alt Metin (Zorunlu)" alanı dolduruluyor. Haber sayfalarındaki "Fotoğraf Galerisi" görselleri ise sayfaya alt="" ile basılıyor. Ekran okuyucu kullananlar galerideki fotoğrafların ne olduğunu öğrenemiyor.

Örnek: https://bilgisayar.istanbul.edu.tr/tr/haber/doc-dr-fatma-onay-kocoglu-anadolu-ajansinin-veri-gazeteciligi-icin-yapay-zeka-eg-34003800570032006200370039006100720073004C0039007900700046006200610041004F003200370077003200 sayfasındaki üç galeri fotoğrafının alt metni CMS'te girilmiş, ancak sayfada boş.

Öneri: Galeri şablonunda alt özniteliğinin görselin CMS'teki alt metniyle doldurulması. Bu bilgi API yanıtında yoksa yanıta da eklenmesi gerekir.

**3. Etkinlik takviminde gün işaretleri eksik görünüyor**

Gözlem: Etkinlikler sayfasındaki takvimde (https://bilgisayar.istanbul.edu.tr/tr/etkinlikler) bir günün etkinlik içerdiğini gösteren sayı, yalnızca sayfaya o an yüklenmiş etkinlikler için görünüyor. O ayda etkinlik olsa bile, etkinlik henüz yüklenmemişse gün işaretlenmiyor.

Nedeni (sayfa kodundan): Sayfa açılırken etkinlikler api/webclient/f_getEvents ile Page=1, PageSize=4 olarak alınıyor. Takvimdeki hasEvent ve eventCountForDate fonksiyonları yalnızca bu yüklenmiş listeye bakıyor. "Daha Fazla Getir" düğmesiyle her seferinde 4 etkinlik daha yüklendikçe işaretler artıyor. 20 Ekim itibarıyla iki dilde de 61'er etkinlik yayında, açılışta bunların yalnızca 4'ü takvime yansıyor.

Öneri: Takvimin gün işaretleri için görüntülenen ayın bütün etkinlik tarihlerinin ayrıca alınması. Örneğin ayın başlangıç ve bitiş tarihine göre filtreleyen bir istek ya da yalnızca tarihleri döndüren hafif bir liste kullanılabilir. Alttaki kart listesi 4'erli yüklenmeye devam edebilir.

Teşekkür ederim.

Arş. Gör. Bora Çalışkan
Bilgisayar ve Bilişim Teknolojileri Fakültesi
