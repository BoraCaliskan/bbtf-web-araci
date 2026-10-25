// Halka açık kadro sayfalarında (tr|en / akademikkadro, idarikadro, yonetim) tarayıcı konsolunda çalıştırılır.
// Her kart için bir satır döner: bölüm başlığı | ad (sitedeki yazım) | unvan | rozet | fotoğraf id | profil bağlantısı |
// Angular scope'tan ad soyad | scope unvan | scope bölüm | yönetsel görev | alias
// Scope her kartta erişilebilir değildir (bölüm listelerinde yalnızca DOM okunur), bu yüzden DOM alanları esastır.
window.__ext = () => {
  let sec = '';
  const out = [];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
  let n;
  while ((n = w.nextNode())) {
    if (n.matches('.section-title')) sec = n.innerText.trim();
    else if (n.matches('.card-header')) {
      const s = angular.element(n).scope() || {};
      let p = null, it = null;
      for (const k in s) {
        const v = s[k];
        if (v && typeof v === 'object') {
          if (v.Personel) { it = v; p = v.Personel; }
          else if (v.Ad !== undefined && v.Soyad !== undefined) p = v;
        }
      }
      const a = n.closest('a') || n.parentElement.querySelector('a');
      const img = (n.querySelector('img') || {}).src || '';
      out.push([
        sec,
        (n.querySelector('.card-name') || {}).innerText || '',
        (n.querySelector('.card-unvan') || {}).innerText || '',
        (n.querySelector('.card-badge') || {}).innerText || '',
        (img.match(/\/([0-9A-F]{32})/) || ['', ''])[1],
        a ? a.getAttribute('href') : '',
        p ? (p.Ad + ' ' + p.Soyad) : '',
        p ? (p.AkademikUnvan || p.KadroUnvan || p.GorevUnvan || '') : '',
        p ? (p.Bolum || '') : '',
        it ? (it.YonetselGorev || '') : '',
        p ? (p.Alias || '') : '',
      ].map(x => String(x).replace(/\s+/g, ' ').trim()).join(' | '));
    }
  }
  return out.join('\n');
};
__ext();
