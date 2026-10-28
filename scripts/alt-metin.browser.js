// BBTF alt metin uygulayıcı (ISKOP CMS, Claude in Chrome javascript_tool ile çalışır, __relocLib (window.__A) yüklü olmalı).
// Fotoğraf Yükle ▸ Yüklediklerim penceresinin denetleyicisini bulur, kütüphanenin tamamını sayfalar,
// {görsel kimliği: alt metin} eşlemesini CMS'in kendi updateAltText işleviyle sırayla yazar ve sunucudan yeniden okuyarak doğrular.
// Güvenlik: istek gövdeleri okunmaz, saklanmaz. Yalnızca updateImageAltText yanıtının HTTP durumu ve MessageType alanı tutulur.
(() => {
  const A = window.__A;
  const T = window.__T = window.__T || {};
  T.h = s => { let x = 2166136261; for (const ch of s) { x ^= ch.codePointAt(0); x = Math.imul(x, 16777619) >>> 0; } return x; };
  T.site = () => document.querySelector('select[ng-model="auth.SelectedSite.EID"]').selectedOptions[0].innerText.trim();

  T.hook = () => {
    if (T.hooked) return 'hooked';
    T.hooked = true; T.log = [];
    const open = XMLHttpRequest.prototype.open, send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (m, u) { this.__alt = /updateImageAltText/i.test(String(u)); return open.apply(this, arguments); };
    XMLHttpRequest.prototype.send = function () {
      if (this.__alt) this.addEventListener('loadend', () => {
        let mt = '';
        try { mt = String(JSON.parse(this.responseText).MessageType || ''); } catch (e) {}
        T.log.push({status: this.status, mt});
      });
      return send.apply(this, arguments);
    };
    return 'hooked';
  };

  // Yüklediklerim listesindeki bir görselin kapsamından updateAltText işlevinin sahibi olan denetleyiciye çık
  // (ng-repeat alt kapsamları işlevi kalıtımla görür, o yüzden hasOwnProperty)
  T.ctrl = () => {
    for (const img of document.querySelectorAll('.modal img')) {
      let s = angular.element(img).scope();
      while (s && !Object.prototype.hasOwnProperty.call(s, 'updateAltText')) s = s.$parent;
      if (s) return s;
    }
    return null;
  };

  // Kütüphaneyi baştan yükle (getData her çağrıda 20 görsel ekler). Yeni görsel gelmeyince durur:
  // küçük kütüphanede (TÜBİTAK, 5 görsel) sunucu son imleçle aynı sayfayı yeniden döndürüyor, uzunluğa bakmak sonsuz döngü olur.
  T.loadAll = async c => {
    const uniq = () => new Set(c.resimler.map(r => r.imageId)).size;
    c.$apply(() => c.reloadData());
    await A.W(() => !c.busy && c.resimler.length, 15000, 200); await A.S(300);
    for (let k = 0; k < 200; k++) {
      const before = uniq();
      c.$apply(() => c.getData());
      await A.W(() => !c.busy, 15000, 200); await A.S(300);
      if (uniq() === before) break;
    }
    return uniq();
  };

  // Veri dosyası: sayfaya geçici bir dosya girişi eklenir, dosya file_upload ile verilir, readFile okur
  T.fileInput = () => {
    let i = document.getElementById('__altIn');
    if (!i) {
      i = document.createElement('input'); i.type = 'file'; i.id = '__altIn'; i.setAttribute('aria-label', 'Alt metin veri dosyası');
      i.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99999;background:#fff';
      document.body.appendChild(i);
    }
    return 'ok';
  };
  // key: 'alts' (kütüphane eşlemesi) ya da 'govde' (gövde kayıtları listesi). Özet değer Python'daki FNV-1a ile karşılaştırılır
  // (dosya ham haliyle, Windows satır sonlarıyla birlikte okunur).
  T.readFile = async (key = 'alts') => {
    const i = document.getElementById('__altIn'), f = i && i.files[0];
    if (!f) throw new Error('NO_FILE');
    const s = await f.text();
    T[key] = JSON.parse(s); T[key + 'Hash'] = T.h(s);
    i.remove();
    return JSON.stringify({name: f.name, n: Object.keys(T[key]).length, h: T[key + 'Hash']});
  };

  // Yazma: site seçicisi beklenen siteyle bitmiyorsa durur
  T.apply = site => {
    if (!T.site().endsWith(site)) throw new Error('SITE_MISMATCH');
    const c = T.ctrl(); if (!c) throw new Error('NO_CTRL');
    if (!T.alts) throw new Error('NO_DATA');
    T.hook();
    const byId = new Map(c.resimler.map(r => [r.imageId, r]));
    const ids = Object.keys(T.alts);
    T.st = {state: 'running', total: ids.length, done: 0, ok: 0, same: 0, fail: [], missing: []};
    (async () => {
      for (const id of ids) {
        const r = byId.get(id), alt = T.alts[id];
        if (!r) { T.st.missing.push(id); T.st.done++; continue; }
        if ((r.alternatifText || '') === alt) { T.st.same++; T.st.done++; continue; }
        const n = T.log.length;
        c.$apply(() => { r.alternatifText = alt; c.updateAltText(r); });
        const ev = await A.W(() => T.log[n], 20000, 150);
        if (ev && ev.status === 200 && ev.mt === 'success') T.st.ok++;
        else T.st.fail.push(id + ' ' + (ev ? ev.status + '/' + ev.mt : 'timeout'));
        T.st.done++;
        await A.S(150);
      }
      T.st.state = 'done';
    })();
    return 'started ' + ids.length;
  };

  // Doğrulama: kütüphane sunucudan yeniden okunur, beklenen alt metinlerle karşılaştırılır
  T.verify = () => {
    const c = T.ctrl(); if (!c) throw new Error('NO_CTRL');
    T.vf = {state: 'running'};
    (async () => {
      const n = await T.loadAll(c);
      const cur = new Map(c.resimler.map(r => [r.imageId, r.alternatifText || '']));
      const bad = Object.keys(T.alts).filter(id => cur.get(id) !== T.alts[id]);
      T.vf = {state: 'done', n, bad: bad.length, badIds: bad.slice(0, 10), empty: [...cur.values()].filter(a => !a.trim()).length,
        hash: T.h(Object.keys(T.alts).sort().map(id => id + '\t' + (cur.get(id) || '')).join('\n'))};
    })();
    return 'verifying';
  };
  // Kayıt gövdesi: alt özniteliği olmayan <img> etiketlerine alt ekler. HTML dizgi düzeyinde değişir (yalnızca etiketin başına alt="..."),
  // metin içeriği aynı kalmalı. Kaydetmez, sonucu döndürür, kaydetme ayrı çağrıyla (T.bodySave) yapılır.
  T.esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  T.bodyAlt = async (m, eid42, map, site) => {
    if (!T.site().endsWith(site)) throw new Error('SITE_MISMATCH');
    await A.openForm(m, eid42);
    const ed = A.fr(), before = ed.html.get();
    let n = 0;
    const after = before.replace(/<img\b[^>]*>/gi, tag => {
      if (/\salt\s*=/i.test(tag)) return tag;
      const src = (tag.match(/\ssrc\s*=\s*"([^"]*)"/i) || [])[1] || '';
      const key = (src.match(/[?&]f=([A-Za-z0-9_-]{22})/) || [])[1];
      if (!key || !(key in map)) return tag;
      n++;
      return tag.replace(/^<img\b/i, '<img alt="' + T.esc(map[key]) + '"');
    });
    const text = h => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
    if (n) { ed.html.set(after); ed.events.trigger('contentChanged'); }
    const got = ed.html.get(), d = document.createElement('div'); d.innerHTML = got;
    const alts = Array.from(d.querySelectorAll('img')).map(i => i.getAttribute('alt'));
    T.body = {m, eid8: eid42.slice(0, 8), n, sameText: text(got) === text(before), lenDelta: got.length - before.length,
      altLen: Object.values(map).reduce((a, s) => a + T.esc(s).length + 7, 0),
      missingAlt: alts.filter(a => a === null).length, matched: Object.values(map).filter(a => alts.includes(a)).length,
      date: (A.q('input[ng-model="' + m + '.Date"]') || {}).value || ''};
    return JSON.stringify(T.body);
  };
  T.bodySave = async () => {
    if (!T.body || !T.body.n || !T.body.sameText) throw new Error('NOT_READY');
    return await A.save();
  };
  // T.govde[i] kaydını işler, yalnızca şu koşullarda kaydeder: her görsele alt eklendi, metin aynı,
  // HTML yalnızca eklenen alt öznitelikleri kadar uzadı (Froala başka bir şeyi değiştirmedi)
  T.bodyDo = async (i, site) => {
    const r = T.govde[i];
    const b = JSON.parse(await T.bodyAlt(r.m, r.eid42, r.map, site));
    const k = Object.keys(r.map).length;
    if (!(b.n === k && b.sameText && b.lenDelta === b.altLen && b.missingAlt === 0 && b.matched === k)) return 'DURDU ' + i + ' ' + JSON.stringify(b);
    const msg = await T.bodySave();
    (T.bodyLog = T.bodyLog || []).push({i, eid8: b.eid8, n: b.n, date: b.date, msg});
    return i + ' ' + b.eid8 + ' n=' + b.n + ' date=' + b.date + ' ' + msg;
  };
  return 'T hazır';
})();
