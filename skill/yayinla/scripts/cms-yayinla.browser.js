// /yayinla skill'inin CMS sekmesinde çalışan kütüphanesi (sürüm 2, 26 Ekim 2026).
// Claude in Chrome javascript_tool ile CMS sekmesine bir kez yüklenir: (0,eval)(<bu dosyanın içeriği>). Sonra window.__Y.
// Bağımlılık: __relocLib (window.__A: list/read/openForm/save/toggle/go/S/W/q/norm/term/imgOf). Yoksa localStorage'dan yüklenir.
// Güvenlik: hedef site adı verilmeden hiçbir yazma yapılmaz; her yazmadan önce site seçicisi hedefle karşılaştırılır.
// Geri alma yalnızca bu koşuda oluşturulan kayıtları ve yüklenen görselleri siler.
(() => {
  if (!window.__A || !window.__A.list) {
    const src = localStorage.getItem('__relocLib'); if (!src) throw new Error('__relocLib yok: relocate-lib.js önce yüklenmeli');
    (0, eval)(src); const ev = localStorage.getItem('__relocEvents'); if (ev) (0, eval)(ev);
  }
  const A = window.__A;
  const Y = window.__Y = window.__Y || {};
  Y.version = 2;
  // Boş liste (ör. test sitesinde hiç haber yok): A.list satır bekleyip NOT_READY atar; tablo yüklenmiş ve boşsa [] dön.
  if (!A.__listOrig) {
    A.__listOrig = A.list;
    A.list = async (...a) => { try { return await A.__listOrig(...a); } catch (e) { const t = document.querySelectorAll('.content-wrapper table')[1]; if (/NOT_READY/.test(e.message) && t && !t.querySelector('tbody tr') && new RegExp('#/app/' + a[0] + '/').test(location.hash)) return []; throw e; } };
  }
  const SITES = { // site seçicisindeki metnin sonu -> halka açık taban adres
    'Bilgisayar ve Bilişim Teknolojileri Fakültesi.tr': 'https://bilgisayar.istanbul.edu.tr/tr',
    'Bilgisayar ve Bilişim Teknolojileri Fakültesi.en': 'https://bilgisayar.istanbul.edu.tr/en',
    'TÜBİTAK 2237-A Bilimsel Eğitim Etkinliği.tr': 'https://bbtfevents.istanbul.edu.tr/tr',
  };
  const TRM = {'ç': 'c', 'ğ': 'g', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'â': 'a', 'î': 'i', 'û': 'u', 'Ç': 'c', 'Ğ': 'g', 'Ö': 'o', 'Ş': 's', 'Ü': 'u', 'Â': 'a'};
  Y.slug = t => t.replace(/['’]/g, '').replace(/[çğıİöşüâîûÇĞÖŞÜÂ]/g, c => TRM[c]).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  Y.M = s => String(s).replace(/[0-9A-F]{40,}/g, m => '<HEX:' + m.match(/.{1,6}/g).join('-') + '>').replace(/https?:\/\//g, '{URL}');
  const siteKey = () => Object.keys(SITES).find(k => A.site().endsWith(k)) || null;

  // ---- koşu kaydı ----
  const save = () => localStorage.setItem('__yayinla_' + Y.run.id, JSON.stringify(Y.run));
  Y.start = (runId, target) => {
    if (!target) throw new Error('HEDEF_SITE_YOK: hedef site verilmeden çalışmaz');
    const k = siteKey();
    if (!k || !k.endsWith(target)) throw new Error('SITE_UYUSMUYOR: seçici "' + A.site() + '", hedef "' + target + '"');
    Y.run = {id: runId, site: k, base: SITES[k], startedAt: new Date().toISOString(), created: [], images: [], log: []};
    save(); return {site: k, base: SITES[k]};
  };
  Y.load = runId => { Y.run = JSON.parse(localStorage.getItem('__yayinla_' + runId) || 'null'); if (!Y.run) throw new Error('KOSU_YOK ' + runId); Y.run.images = Y.run.images || []; Y.run.log = Y.run.log || []; return Y.run; };
  const guard = () => { if (!Y.run) throw new Error('ONCE_Y_START'); if (siteKey() !== Y.run.site) throw new Error('SITE_DEGISTI: ' + A.site()); };
  const log = x => { Y.run.log.push({at: new Date().toISOString(), ...x}); save(); };

  // ---- görsel yükleme penceresi ----
  const modals = () => Array.from(document.querySelectorAll('.modal.in, .modal.show'));
  const modal = () => modals()[0] || null;
  const topModal = () => modals()[modals().length - 1] || null;
  const uploadTab = async m => {
    Array.from(m.querySelectorAll('a')).find(e => e.innerText.trim() === 'Yükle').click(); await A.S(700);
    const sel = Array.from(m.querySelectorAll('select')).find(s => s.getAttribute('ng-model') === 'uploadStatusSelection.value');
    sel.value = Array.from(sel.options).find(o => o.text === 'Kırpma').value; sel.dispatchEvent(new Event('change', {bubbles: true}));
    return sel.selectedOptions[0].text;
  };
  Y.openUpload = async (model) => { // model: 'news.Img' | 'news.Gallery' | 'slider.Img' | 'event.Img' | 'notice.Img'
    guard();
    let m = modal();
    if (!m) {
      const ph = A.q('div[ng-model="' + model + '"] img.gallery-image-placeholder') || A.q('div[ng-model="' + model + '"] img');
      if (!ph) throw new Error('YER_TUTUCU_YOK ' + model);
      ph.click(); m = await A.W(() => modal(), 8000); if (!m) throw new Error('PENCERE_ACILMADI'); await A.S(600);
    }
    const mode = await uploadTab(m);
    const inp = m.querySelector('input[type=file]'); if (inp) inp.setAttribute('data-yayinla', 'file');
    return {mode, fileInput: !!inp};
  };
  // Pencerede iki dosya girişi var (Yükle sekmesi ve gizli Toplu Yükle). file_upload aracının ref'i bazen gizli olana düşer:
  // dosya yanlış girişteyse görünür girişe taşı (DataTransfer) ve change olayı gönder.
  Y.fixFileInput = (m, expectFile) => {
    const inputs = Array.from(m.querySelectorAll('input[type=file]')); const vis = inputs.find(i => i.offsetParent) || inputs[0];
    const src = inputs.find(i => i !== vis && i.files && i.files.length && (!expectFile || i.files[0].name === expectFile));
    if (src && !(vis.files.length && (!expectFile || vis.files[0].name === expectFile))) {
      const dt = new DataTransfer(); dt.items.add(src.files[0]); vis.files = dt.files; src.value = ''; vis.dispatchEvent(new Event('change', {bubbles: true})); return 'moved';
    }
    return 'ok';
  };
  // file_upload aracı dosyayı seçtikten sonra: alt metni yaz, Yükle'ye bas, yeni görselin kimliğini döndür ve koşuya kaydet.
  Y.finishUpload = async (alt, expectFile) => {
    guard(); const m = modal(); if (!m) throw new Error('PENCERE_YOK');
    if (Y.fixFileInput(m, expectFile) === 'moved') await A.S(1500);
    const fn = Array.from(m.querySelectorAll('input')).map(x => x.value).find(v => /\.(jpe?g|png)$/i.test(v));
    if (expectFile && fn !== expectFile) throw new Error('DOSYA_FARKLI ' + fn);
    const i = m.querySelector('input[ng-model="cropImage.alternatifText"]'); const sc = angular.element(i).scope();
    sc.$apply(() => { sc.cropImage.alternatifText = alt; }); i.value = alt; i.dispatchEvent(new Event('input', {bubbles: true}));
    await A.S(300); if (sc.cropImage.alternatifText !== alt) throw new Error('ALT_YAZILMADI');
    i.blur(); await A.S(400);
    const before = (m.querySelector('img') || {}).src || '';
    m.querySelector('a[ng-click="upload()"]').click();
    const ok = await A.W(() => (m.querySelector('.nav-tabs .active a') || {}).innerText.trim() === 'Yüklediklerim' && (m.querySelector('img') || {}).src !== before, 20000);
    if (!ok) throw new Error('YUKLEME_OLMADI');
    await A.S(500);
    const r = angular.element(m.querySelector('img')).scope().resim;
    if (!r || r.alternatifText !== alt) throw new Error('ALT_DOGRULANMADI');
    Y.run.images.push({id: r.imageId, alt, file: fn, deleted: false}); log({a: 'upload', id: r.imageId}); return r.imageId;
  };
  Y.closeModal = async () => { const m = modal(); if (m) { Array.from(m.querySelectorAll('a, button')).find(e => e.innerText.trim() === 'Kapat').click(); await A.W(() => !modal(), 8000); } return !modal(); };
  // Yüklediklerim listesi: [{id, alt}]
  Y.listImages = async (model = 'news.Img') => {
    let m = modal();
    if (!m) { const ph = A.q('div[ng-model="' + model + '"] img'); if (!ph) throw new Error('YER_TUTUCU_YOK'); ph.click(); m = await A.W(() => modal(), 8000); await A.S(1200); }
    Array.from(m.querySelectorAll('a')).find(e => e.innerText.trim() === 'Yüklediklerim').click(); await A.S(800);
    return Array.from(m.querySelectorAll('img')).map(i => { const s = angular.element(i).scope(); return s && s.resim ? {id: s.resim.imageId, alt: s.resim.alternatifText || ''} : null; }).filter(Boolean);
  };

  // ---- XHR izleyici: kayıt silme ve görsel silme yanıtları, yalnızca beklenen hedef gönderilir ----
  if (!window.__yDel) {
    window.__yDel = []; const DEL = /\/api\/(notice\/delNotice|event\/delEvent|news\/delNews|content\/removeImageFromcdn)\b/;
    const open = XMLHttpRequest.prototype.open, send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (m, u) { this.__yUrl = String(u || ''); return open.apply(this, arguments); };
    XMLHttpRequest.prototype.send = function (body) {
      if (DEL.test(this.__yUrl || '')) {
        const exp = Y.expect; const b = String(body || '');
        if (!exp || !b.includes(exp)) { window.__yDel.push({blocked: true, u: this.__yUrl.slice(-30)}); const me = this; setTimeout(() => me.dispatchEvent(new ProgressEvent('error')), 0); return; }
        this.addEventListener('loadend', () => { let t = ''; try { t = JSON.parse(this.responseText).MessageType; } catch (e) {} window.__yDel.push({st: this.status, t, u: this.__yUrl.slice(-30), body: b.slice(0, 200)}); });
      }
      return send.apply(this, arguments);
    };
  }
  // Fotoğraf Yükle ▸ Yüklediklerim ▸ "Görseli Sil" ▸ onay. Yalnızca bu koşuda yüklenen ya da açıkça verilen kimlikler.
  Y.deleteImage = async (id, model = 'news.Img') => {
    guard();
    let m = modal();
    if (!m) { const ph = A.q('div[ng-model="' + model + '"] img'); if (!ph) throw new Error('YER_TUTUCU_YOK'); ph.click(); m = await A.W(() => modal(), 8000); await A.S(1200); }
    Array.from(m.querySelectorAll('a')).find(e => e.innerText.trim() === 'Yüklediklerim').click(); await A.S(800);
    const img = Array.from(m.querySelectorAll('img')).find(i => { const s = angular.element(i).scope(); return s && s.resim && s.resim.imageId === id; });
    if (!img) return 'yok';
    const card = img.closest('.card') || img.parentElement.parentElement;
    const a = card.querySelector('a[ng-click="remove(resim)"]'); if (!a) throw new Error('SIL_DUGMESI_YOK');
    const n = window.__yDel.length; a.click();
    const c = await A.W(() => modals().length >= 2 ? topModal() : null, 6000); if (!c || !/Silinecektir/i.test(c.innerText)) throw new Error('ONAY_PENCERESI_YOK');
    const btn = Array.from(c.querySelectorAll('button, a.btn')).find(b => /Onayla|Evet|Tamam/i.test(b.innerText)); if (!btn) throw new Error('ONAY_DUGMESI_YOK');
    Y.expect = id; btn.click();
    const x = await A.W(() => window.__yDel.slice(n).find(z => z.blocked || z.st !== undefined), 30000); Y.expect = null;
    if (!x || x.blocked || x.st !== 200 || x.t !== 'success') throw new Error('GORSEL_SILINMEDI ' + JSON.stringify(x));
    await A.S(1200);
    const still = Array.from(m.querySelectorAll('img')).some(i => { const s = angular.element(i).scope(); return s && s.resim && s.resim.imageId === id; });
    if (still) throw new Error('GORSEL_HALA_LISTEDE');
    const rec = Y.run.images.find(z => z.id === id); if (rec) rec.deleted = true; log({a: 'deleteImage', id}); return 'silindi';
  };

  // ---- kayıt oluşturma ----
  const formReady = m => () => A.q('input[ng-model="' + m + '.Header"]') && A.q('[froala]') && A.q('[froala]')['data-froala.editor'];
  const setDate = (m, date) => { const d = A.q('input[ng-model="' + m + '.Date"]'); d.value = date; d.dispatchEvent(new Event('input', {bubbles: true})); d.dispatchEvent(new Event('change', {bubbles: true})); return d; };
  const findRow = async (m, title, date, cat) => (await A.list(m, A.term(title), cat ? cat - 1 : 0)).filter(r => A.norm(r.cells[cat ? 3 : 2] || r.cells[2]) === A.norm(title) && r.date === date);
  const note = rec => { Y.run.created.push(rec); save(); };

  // module: news | event | notice (category 1|3). Haber ve etkinlikte img zorunlu, duyuruda isteğe bağlı.
  Y.createNews = async ({title, date, img, gallery = [], html, module = 'news', category}) => {
    guard();
    if (!title || !date || !html) throw new Error('EKSIK_ALAN');
    if (module !== 'notice' && !img) throw new Error('GORSEL_ZORUNLU');
    if ((await findRow(module, title, date, category)).length) throw new Error('AYNI_KAYIT_VAR');
    await A.go('#/app/' + module + '/edit/new', formReady(module));
    const sc = angular.element(A.q('input[ng-model="' + module + '.Header"]')).scope(); const o = sc[module];
    sc.$apply(() => { o.Header = title; if (img) o.Img = img; o.Author = ''; o.Gallery = gallery.slice(); if (category) o.CategoryId = category; });
    const d = setDate(module, date);
    const fr = A.fr(); fr.html.set(html); fr.events.trigger('contentChanged'); await A.S(1200);
    const galNow = Array.from(document.querySelectorAll('div[ng-model="' + module + '.Gallery"] img.img-thumbnail')).map(i => ((i.getAttribute('src') || '').match(/f=([^&]+)/) || [])[1]);
    const chk = {h: A.q('input[ng-model="' + module + '.Header"]').value === title, d: d.value === date, isDate: o.Date instanceof Date, img: !img || A.imgOf('div[ng-model="' + module + '.Img"]') === img, gal: JSON.stringify(galNow) === JSON.stringify(gallery), c: (o.Content || '').length > 20, cat: !category || o.CategoryId === category, route: new RegExp('#/app/' + module + '/edit/new$').test(location.hash)};
    if (Object.values(chk).some(v => !v)) throw new Error('FORM ' + JSON.stringify(chk));
    const msg = await A.save(); await A.S(1200);
    const rows = await findRow(module, title, date, category); if (rows.length !== 1) throw new Error('KAYIT_BULUNAMADI ' + rows.length);
    note({m: module, cat: category || null, eid: rows[0].eid, full: rows[0].full, title, date, published: false});
    return {msg, eid: rows[0].eid, full: rows[0].full};
  };
  Y.publicUrl = (module, title, full, category) => {
    const seg = module === 'notice' ? (category === 3 ? 'ogrenci-duyuru' : 'duyuru') : ({news: 'haber', event: 'etkinlik'}[module] || module);
    return Y.run.base + '/' + seg + '/' + Y.slug(title) + '-' + full;
  };
  Y.publish = async (module, eid, title, want = 'Yayında') => {
    guard(); const rec = Y.run.created.find(x => x.eid === eid);
    const r = await A.toggle(module, eid, title, want);
    if (rec) { rec.published = want === 'Yayında'; log({a: want, eid}); }
    return r;
  };
  // link boş ve standalone true ise bağlantısız kutlama manşeti (Link, Title1-3, Content boş).
  Y.createSlider = async ({title, date, img, link = '', standalone = false}) => {
    guard();
    if (!title || !date || !img) throw new Error('EKSIK_ALAN');
    if (!link && !standalone) throw new Error('LINK_YOK: bağlantısız manşet için standalone: true verin');
    if ((await findRow('slider', title, date)).length) throw new Error('AYNI_MANSET_VAR');
    await A.go('#/app/slider/edit/new', formReady('slider'));
    const sc = angular.element(A.q('input[ng-model="slider.Header"]')).scope(); const s = sc.slider;
    sc.$apply(() => { s.Header = title; s.Img = img; s.Link = link; s.Title1 = ''; s.Title2 = ''; s.Title3 = ''; });
    const d = setDate('slider', date); await A.S(900);
    const chk = {h: A.q('input[ng-model="slider.Header"]').value === title, link: A.q('input[ng-model="slider.Link"]').value === link, d: d.value === date, isDate: s.Date instanceof Date, img: A.imgOf('div[ng-model="slider.Img"]') === img, content: (A.fr().html.get() || '').replace(/<p><br><\/p>/g, '').length === 0, route: /#\/app\/slider\/edit\/new$/.test(location.hash)};
    if (Object.values(chk).some(v => !v)) throw new Error('FORM ' + JSON.stringify(chk));
    const msg = await A.save(); await A.S(1200);
    const rows = await findRow('slider', title, date); if (rows.length !== 1) throw new Error('MANSET_BULUNAMADI ' + rows.length);
    note({m: 'slider', eid: rows[0].eid, full: rows[0].full, title, date, published: false, standalone});
    return {msg, eid: rows[0].eid, full: rows[0].full};
  };

  // ---- geri alma ----
  Y.deleteOne = async rec => {
    guard();
    if (rec.published) await Y.publish(rec.m, rec.eid, rec.title, 'Yayında Değil');
    const r = await A.findByEid(rec.m, rec.eid, rec.title); if (!r) return 'yok';
    if (r.status !== 'Yayında Değil') throw new Error('HALA_YAYINDA');
    const a = Array.from(r.tr.querySelectorAll('.dropdown-menu a, .dropdown-menu button')).find(z => A.norm(z.innerText) === 'Sil'); if (!a) throw new Error('SIL_YOK');
    a.click(); const m = await A.W(() => modal(), 6000); if (!m || !/silinmek üzere/i.test(m.innerText)) throw new Error('SILME_PENCERESI_YOK');
    const ent = angular.element(m.querySelector('.modal-body')).scope().data; if (!ent || A.norm(ent.entity || '') !== A.norm(rec.title)) { Array.from(m.querySelectorAll('button')).find(b => /İptal/.test(b.innerText)).click(); throw new Error('PENCERE_BASKA_KAYIT'); }
    const n = window.__yDel.length; Y.expect = rec.eid;
    Array.from(m.querySelectorAll('button, a.btn')).find(b => A.norm(b.innerText) === 'Onayla ve Devam Et').click();
    const x = await A.W(() => window.__yDel.slice(n).find(z => z.blocked || z.st !== undefined), 30000); Y.expect = null;
    if (!x || x.blocked || x.st !== 200 || x.t !== 'success' || !x.body.includes(rec.eid)) throw new Error('SILME_ONAYLANMADI ' + JSON.stringify(x));
    await A.S(800); if (await A.findByEid(rec.m, rec.eid, rec.title)) throw new Error('SATIR_HALA_VAR');
    rec.deleted = true; log({a: 'delete', eid: rec.eid}); save(); return 'silindi';
  };
  // Kayıtları (önce manşet) ve bu koşuda yüklenen görselleri siler. 45 s araç sınırı için adım adım: önce kayıtlar, sonra görseller.
  Y.undoRecords = async runId => {
    if (runId) Y.load(runId); guard(); const out = [];
    for (const rec of Y.run.created.filter(x => !x.deleted).reverse()) { try { out.push(rec.m + ' ' + rec.eid.slice(0, 8) + ': ' + await Y.deleteOne(rec)); } catch (e) { out.push(rec.m + ' ' + rec.eid.slice(0, 8) + ': HATA ' + e.message); break; } }
    return out;
  };
  Y.undoImages = async runId => {
    if (runId) Y.load(runId); guard(); const out = [];
    await A.go('#/app/news/edit/new', formReady('news'));
    for (const im of Y.run.images.filter(x => !x.deleted)) { try { out.push(im.id + ': ' + await Y.deleteImage(im.id)); } catch (e) { out.push(im.id + ': HATA ' + e.message); break; } }
    await Y.closeModal(); return out;
  };
  Y.undo = async runId => { const a = await Y.undoRecords(runId); const b = await Y.undoImages(); return {records: a, images: b}; };
  Y.status = () => Y.run ? {records: Y.run.created.map(x => x.m + '|' + x.eid.slice(0, 8) + '|' + (x.deleted ? 'silindi' : x.published ? 'yayında' : 'taslak') + '|' + x.title.slice(0, 40)), images: Y.run.images.map(x => x.id + '|' + (x.deleted ? 'silindi' : 'duruyor'))} : null;
  return 'Y hazır v2';
})();
