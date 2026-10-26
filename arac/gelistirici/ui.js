/* ===================== Arayüz ===================== */
const S = { tpl: "yeni-yayin", lang: "tr", langs: { tr: true, en: true }, data: {}, gallery: [], safe: false };
const $ = (id) => document.getElementById(id);
const D = () => (S.data[S.tpl] = S.data[S.tpl] || {});
let refreshT;
const refresh = () => { clearTimeout(refreshT); refreshT = setTimeout(renderAll, 150); };
function setStatus(id, msg, cls = "") { const el = $(id); el.textContent = msg; el.className = "status " + cls; }

/* ---------- form ---------- */
function buildForm() {
  const T = TEMPLATES[S.tpl], d = D(), box = $("form"); box.innerHTML = "";
  for (const f of T.fields) {
    const row = document.createElement("div"); row.className = "field" + (f.short ? " short" : ""); const lab = document.createElement("label"); lab.textContent = f.l; row.appendChild(lab);
    if (f.t === "text" || f.t === "date") { const i = document.createElement("input"); i.type = f.t === "date" ? "date" : "text"; i.value = d[f.k] || ""; i.oninput = () => { d[f.k] = i.value; refresh(); }; row.appendChild(i); }
    else if (f.t === "textarea") { const i = document.createElement("textarea"); i.value = d[f.k] || ""; i.oninput = () => { d[f.k] = i.value; refresh(); }; row.appendChild(i); }
    else if (f.t === "select") { const s = document.createElement("select"); s.innerHTML = f.opts.map(o => `<option value="${o[0]}">${o[1]}</option>`).join(""); s.value = d[f.k] || f.opts[0][0]; d[f.k] = s.value; s.onchange = () => { d[f.k] = s.value; refresh(); }; row.appendChild(s); }
    else if (f.t === "check") { const i = document.createElement("input"); i.type = "checkbox"; i.checked = !!d[f.k]; i.onchange = () => { d[f.k] = i.checked; refresh(); }; lab.prepend(i); lab.className = "chk"; }
    else if (f.t === "doi") { const wrap = document.createElement("div"); wrap.className = "row"; const i = document.createElement("input"); i.type = "text"; i.value = d[f.k] || ""; i.placeholder = "10.1016/..."; i.oninput = () => { d[f.k] = i.value; }; const b = document.createElement("button"); b.className = "fit secondary"; b.textContent = "Crossref'ten doldur"; b.onclick = () => fillFromCrossref(i.value); i.onkeydown = (e) => { if (e.key === "Enter") fillFromCrossref(i.value); }; wrap.append(i, b); row.appendChild(wrap); const st = document.createElement("div"); st.className = "status"; st.id = "crossrefStatus"; row.appendChild(st); }
    else if (f.t === "bi" || f.t === "bitext") { d[f.k] = d[f.k] || { tr: "", en: "" }; const wrap = document.createElement("div"); wrap.className = "bi"; for (const l of ["tr", "en"]) { const i = document.createElement(f.t === "bi" ? "input" : "textarea"); if (f.t === "bi") i.type = "text"; i.placeholder = l.toUpperCase(); i.value = d[f.k][l] || ""; i.oninput = () => { d[f.k][l] = i.value; refresh(); }; wrap.appendChild(i); } row.appendChild(wrap); }
    else if (f.t === "people") { d[f.k] = d[f.k] || []; const list = document.createElement("div"); list.className = "people"; row.appendChild(list); renderPeople(list, d[f.k], f); const add = document.createElement("button"); add.className = "secondary small"; add.textContent = "+ Kişi ekle"; add.onclick = () => { if (d[f.k].length >= (f.max || 3)) return; d[f.k].push({ kadroId: "", name: "", titleTR: "", titleEN: "", kind: "student", photo: null }); renderPeople(list, d[f.k], f); refresh(); }; row.appendChild(add); }
    else if (f.t === "photo") { const dz = document.createElement("div"); dz.className = "drop"; const show = () => { dz.innerHTML = d[f.k] ? `<img src="${d[f.k]}"><span>Değiştirmek için tıkla veya bırak</span>` : "<span>Fotoğrafı buraya bırak ya da tıkla</span>"; }; show(); dz.onclick = () => pickFile(async file => { d[f.k] = await fileToDataURL(file, 2000, false); show(); refresh(); }); dz.ondragover = (e) => { e.preventDefault(); dz.classList.add("on"); }; dz.ondragleave = () => dz.classList.remove("on"); dz.ondrop = async (e) => { e.preventDefault(); dz.classList.remove("on"); const file = e.dataTransfer.files[0]; if (file && file.type.startsWith("image/")) { d[f.k] = await fileToDataURL(file, 2000, false); show(); refresh(); } }; row.appendChild(dz); }
    else if (f.t === "links") { d[f.k] = d[f.k] || []; const list = document.createElement("div"); const draw = () => { list.innerHTML = ""; d[f.k].forEach((ln, i) => { const r = document.createElement("div"); r.className = "row"; const a = document.createElement("input"); a.type = "text"; a.placeholder = "Etiket (ör. Başvuru formu)"; a.value = ln.label || ""; a.oninput = () => { ln.label = a.value; refresh(); }; const u = document.createElement("input"); u.type = "text"; u.placeholder = "https://"; u.value = ln.url || ""; u.oninput = () => { ln.url = u.value; refresh(); }; const x = document.createElement("button"); x.className = "x fit"; x.textContent = "×"; x.onclick = () => { d[f.k].splice(i, 1); draw(); refresh(); }; r.append(a, u, x); list.appendChild(r); }); }; draw(); row.appendChild(list); const add = document.createElement("button"); add.className = "secondary small"; add.textContent = "+ Bağlantı ekle"; add.onclick = () => { d[f.k].push({ label: "", url: "" }); draw(); }; row.appendChild(add); }
    box.appendChild(row);
  }
}
function pickFile(cb, multiple = false) { const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.multiple = multiple; inp.onchange = () => { for (const f of inp.files) cb(f); }; inp.click(); }
function renderPeople(list, arr, f) {
  list.innerHTML = "";
  const opts = ['<option value="__manual">Kadro dışı / öğrenci (elle)</option>', ...KADRO.map(p => `<option value="${p.id}">${p.titleTR ? p.titleTR + " " : ""}${p.name}${p.role !== "akademik" ? " (" + (p.roleLabelTR || p.role) + ")" : ""}</option>`)].join("");
  arr.forEach((a, i) => {
    const r = document.createElement("div"); r.className = "person-row";
    r.innerHTML = `<select class="who">${opts}</select><div class="manual"><input type="text" class="nm" placeholder="Ad Soyad"><input type="text" class="tt" placeholder="Unvan TR (ör. Dr.)"><input type="text" class="te" placeholder="Unvan EN"><select class="kind"><option value="student">Öğrencimiz</option><option value="faculty">Öğretim üyemiz</option><option value="external">Dış konuk</option></select></div><div class="ph" title="Fotoğraf: tıkla veya bırak"></div><button class="x" title="Sil">×</button>`;
    const who = r.querySelector(".who"), man = r.querySelector(".manual"), nm = r.querySelector(".nm"), tt = r.querySelector(".tt"), te = r.querySelector(".te"), kind = r.querySelector(".kind"), ph = r.querySelector(".ph");
    who.value = a.kadroId || "__manual"; nm.value = a.name || ""; tt.value = a.titleTR || ""; te.value = a.titleEN || ""; kind.value = a.kind || "student";
    const sync = () => { man.style.display = who.value === "__manual" ? "" : "none"; const p = personOf(a); ph.style.backgroundImage = p.photo ? `url(${p.photo})` : ""; ph.textContent = p.photo ? "" : "foto"; };
    who.onchange = () => { a.kadroId = who.value === "__manual" ? "" : who.value; if (a.kadroId) { const p = byId(a.kadroId); a.name = p.name; } sync(); refresh(); };
    nm.oninput = () => { a.name = nm.value; refresh(); }; tt.oninput = () => { a.titleTR = tt.value; refresh(); }; te.oninput = () => { a.titleEN = te.value; refresh(); }; kind.onchange = () => { a.kind = kind.value; refresh(); };
    ph.onclick = () => pickFile(async file => { a.photo = await fileToDataURL(file, 600, true); sync(); refresh(); }); ph.ondragover = (e) => e.preventDefault(); ph.ondrop = async (e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) { a.photo = await fileToDataURL(file, 600, true); sync(); refresh(); } };
    r.querySelector(".x").onclick = () => { arr.splice(i, 1); renderPeople(list, arr, f); refresh(); };
    sync(); list.appendChild(r);
  });
}
async function fillFromCrossref(doi) {
  const d = D(); if (!doi.trim()) return setStatus("crossrefStatus", "DOI girin.", "err"); setStatus("crossrefStatus", "Crossref sorgulanıyor…");
  try { const m = await crossref(doi); d.doi = m.doi; d.title = m.title; d.venue = m.journal; d.year = m.year; d.link = "https://doi.org/" + m.doi; if (m.type.includes("proceedings")) d.subtype = "bildiri"; else if (m.type.includes("book")) d.subtype = "kitap";
    d.people = []; let matched = 0; for (const n of m.authors) { const k = matchKadro(n); if (k) { d.people.push({ kadroId: k.id, name: k.name, kind: k.kind, photo: null }); matched++; } } d.people = d.people.slice(0, 3); d.coauthored = m.authors.length > matched;
    d.summary = d.summary || { tr: "", en: "" }; if (m.abstract && !d.summary.en) d.summary.en = m.abstract; buildForm(); refresh(); setStatus("crossrefStatus", `Dolduruldu. ${m.authors.length} yazar, ${matched} kadroyla eşleşti.${m.abstract ? " Özet İngilizce kutuya kondu, kısaltıp Türkçesini yazın." : ""}`, "ok"); }
  catch (e) { setStatus("crossrefStatus", "Alınamadı (" + e.message + "). İnternet yoksa alanları elle doldurun.", "err"); }
}

/* ---------- galeri (kalıptan bağımsız) ---------- */
function renderGallery() {
  const box = $("gallery"); box.innerHTML = "";
  S.gallery.forEach((g, i) => { const r = document.createElement("div"); r.className = "gal"; r.innerHTML = `<img src="${g.data}"><input type="text" placeholder="Alt metin TR" value="${esc(g.altTR || "")}"><input type="text" placeholder="Alt text EN" value="${esc(g.altEN || "")}"><button class="x">×</button>`; const [img, a, b, x] = r.children; a.oninput = () => g.altTR = a.value; b.oninput = () => g.altEN = b.value; x.onclick = () => { S.gallery.splice(i, 1); renderGallery(); }; box.appendChild(r); });
}
$("btnGallery").onclick = () => pickFile(async file => { S.gallery.push({ name: file.name, data: await fileToDataURL(file, 1600, false), altTR: "", altEN: "" }); renderGallery(); }, true);

/* ---------- önizleme ve çıktılar ---------- */
async function renderAll() {
  const T = TEMPLATES[S.tpl], d = D(), ctx = $("preview").getContext("2d");
  let warnings = []; try { warnings = await T.draw(ctx, S.lang, d) || []; } catch (e) { warnings = ["Çizim hatası: " + e.message]; console.error(e); }
  if (S.safe) drawSafe(ctx);
  setStatus("fitStatus", warnings.length ? warnings.join(" ") : "Sığdı, güvenli alanlar temiz.", warnings.length ? "err" : "ok");
  if (!$("htmlTR").dataset.touched) $("htmlTR").value = clean(T.body(d, "tr")); if (!$("htmlEN").dataset.touched) $("htmlEN").value = clean(T.body(d, "en")); if (!$("texts").dataset.touched) $("texts").value = textsFile();
}
function textsFile() {
  const T = TEMPLATES[S.tpl], d = D(), t = T.titles(d), x = T.texts(d), sl = slug(t.tr || t.en || S.tpl), sec = T.section, date = d.date || new Date().toISOString().slice(0, 10);
  const lines = [];
  for (const l of ["tr", "en"]) { if (!S.langs[l]) continue; const L = l.toUpperCase(); lines.push(`[${L}] HABER BAŞLIĞI: ${l === "tr" ? t.tr : t.en}`, `[${L}] SPOT: ${l === "tr" ? x.spotTR : x.spotEN}`, `[${L}] MANŞET BAŞLIĞI: ${l === "tr" ? t.tr : t.en}`, `[${L}] MANŞET ALT METNİ: ${l === "tr" ? x.mansetSubTR : x.mansetSubEN}`, `[${L}] MANŞET GÖRSELİ ALT METNİ: ${l === "tr" ? x.mansetAltTR : x.mansetAltEN}`); if (S.gallery.length) lines.push(`[${L}] GALERİ ALT METİNLERİ: ` + S.gallery.map((g, i) => `galeri-${String(i + 1).padStart(2, "0")}.jpg: ${l === "tr" ? (g.altTR || t.tr) : (g.altEN || t.en)}`).join(" | ")); lines.push(""); }
  lines.push(`BÖLÜM: ${sec}`, `MANŞET: ${sec === "manset" ? "evet, bağlantısız (Link alanı boş)" : "evet, " + sec + " kaydına bağlı"}`, `TARİH: ${fmtCms(date)}`, `DİLLER: ${["tr", "en"].filter(l => S.langs[l]).join(",")}`, `DOSYA ÖNEKİ: ${sl}`, `MANŞET GÖRSELİ: 1920x606 (bunu kullan). CMS'de slider title alanları boş. Gövdeye görsel konmaz.`);
  if (sec === "etkinlik") lines.push("NOT: Etkinlik kaydının tarihi etkinliğin günüdür. Etkinlik yapıldıktan sonra fotoğraflarıyla Haberler'e 'yapıldı' haberi girilir.");
  if (sec === "ogrenci-duyuru") lines.push("NOT: Tarihi geçince manşeti yayından kaldır, duyuru kalsın.");
  return lines.join("\n");
}
async function buildZip() {
  const T = TEMPLATES[S.tpl], d = D(), t = T.titles(d), sl = slug(t.tr || t.en || S.tpl), files = [], enc = new TextEncoder();
  const prefix = { haber: "haber", etkinlik: "etkinlik", "ogrenci-duyuru": "duyuru", manset: "manset" }[T.section];
  for (const lang of ["tr", "en"]) { if (!S.langs[lang]) continue;
    const big = document.createElement("canvas"); big.width = 1920; big.height = 606; await T.draw(big.getContext("2d"), lang, d);
    files.push({ name: `manset-${sl}-${lang}-1920x606 (bunu kullan).jpg`, data: await toU8(await canvasBlob(big)) });
    const sm = document.createElement("canvas"); sm.width = 1170; sm.height = 369; const sc = sm.getContext("2d"); sc.imageSmoothingQuality = "high"; sc.drawImage(big, 0, 0, 1170, 369); files.push({ name: `manset-${sl}-${lang}-1170x369.jpg`, data: await toU8(await canvasBlob(sm)) });
    const body = lang === "tr" ? $("htmlTR").value : $("htmlEN").value; if (body.trim() && T.section !== "manset") files.push({ name: `${prefix}-${sl}-${lang}.html`, data: enc.encode(body) });
  }
  const gal = [...S.gallery]; if (d.photo && !gal.some(g => g.data === d.photo)) gal.unshift({ data: d.photo, altTR: t.tr, altEN: t.en }); if (d.poster) gal.push({ data: d.poster, altTR: t.tr + " afişi", altEN: t.en + " poster" });
  gal.forEach((g, i) => files.push({ name: `galeri-${String(i + 1).padStart(2, "0")}.jpg`, data: dataURLtoU8(g.data) }));
  if (gal.length && !S.gallery.length) { const extra = gal.map((g, i) => `galeri-${String(i + 1).padStart(2, "0")}.jpg: ${g.altTR}`).join(" | "); $("texts").value = $("texts").value.replace(/\n(BÖLÜM:)/, `\n[TR] GALERİ ALT METİNLERİ: ${extra}\n$1`); }
  files.push({ name: "metinler.txt", data: enc.encode($("texts").value) });
  download(makeZip(files), `${prefix}-${sl}.zip`);
}

/* ---------- kadro paneli ---------- */
function renderKadro() {
  const box = $("kadro"); box.innerHTML = "";
  for (const p of KADRO) { const d = document.createElement("div"); d.className = "person"; d.innerHTML = `<button class="del" title="Sil">×</button><div class="ph" ${p.photo ? `style="background-image:url(${p.photo})"` : ""}>${p.photo ? "" : "foto"}</div><div class="nm">${esc(p.name)}</div><div class="tt">${esc(p.titleTR || p.roleLabelTR || "")}</div>`;
    d.querySelector(".del").onclick = async (e) => { e.stopPropagation(); if (confirm(p.name + " listeden silinsin mi?")) { await DB.del(p.id); await loadKadro(); renderKadro(); buildForm(); } };
    d.onclick = () => pickFile(async f => { p.photo = await fileToDataURL(f, 600, true); await DB.put(p); renderKadro(); refresh(); });
    d.ondragover = (e) => { e.preventDefault(); d.classList.add("drag"); }; d.ondragleave = () => d.classList.remove("drag"); d.ondrop = async (e) => { e.preventDefault(); d.classList.remove("drag"); const f = e.dataTransfer.files[0]; if (f) { p.photo = await fileToDataURL(f, 600, true); await DB.put(p); renderKadro(); refresh(); } };
    box.appendChild(d); }
  $("npDept").innerHTML = Object.entries(DEPTS).map(([k, v]) => `<option value="${k}">${v.tr}</option>`).join("") + '<option value="">Bölüm dışı</option>';
}
$("btnAddPerson").onclick = async () => { const name = tcase($("npName").value.trim()); if (!name) return; const titleTR = $("npTitle").value, deptKey = $("npDept").value; await DB.put({ id: norm(name).replace(/\s+/g, "-") + "-" + Date.now().toString(36), name, titleTR, titleEN: TITLE_EN[titleTR] || titleTR, deptKey, deptTR: deptKey ? DEPTS[deptKey].tr : "", deptEN: deptKey ? DEPTS[deptKey].en : "", role: "manual", kind: KIND_OF_TITLE[titleTR] || "external", photo: null }); $("npName").value = ""; await loadKadro(); renderKadro(); buildForm(); };
$("btnExport").onclick = () => download(new Blob([JSON.stringify(KADRO, null, 1)], { type: "application/json" }), "bbtf-kadro-yedek.json");
$("btnImport").onclick = () => { const i = document.createElement("input"); i.type = "file"; i.accept = "application/json"; i.onchange = async () => { const arr = JSON.parse(await i.files[0].text()); for (const p of arr) await DB.put(p); await loadKadro(); renderKadro(); buildForm(); setStatus("kadroStatus", arr.length + " kişi içe aktarıldı.", "ok"); }; i.click(); };
$("btnReset").onclick = async () => { if (confirm("Liste silinip gömülü kadroyla yeniden kurulacak. Elle eklenenler ve fotoğraf değişiklikleri gider. Devam?")) { await loadKadro(true); renderKadro(); buildForm(); } };

/* ---------- bağlantılar ---------- */
$("tpl").innerHTML = Object.entries(TEMPLATES).map(([k, t]) => `<option value="${k}">${t.name}</option>`).join("");
$("tpl").onchange = () => { S.tpl = $("tpl").value; ["htmlTR", "htmlEN", "texts"].forEach(id => delete $(id).dataset.touched); buildForm(); $("sectionNote").textContent = { haber: "Haberler'e girer, habere bağlı manşet açılır.", etkinlik: "Etkinlikler'e girer, tarihi etkinliğin günüdür.", "ogrenci-duyuru": "Öğrenci Duyuruları'na girer, tarihi geçince manşet kaldırılır.", manset: "Yalnızca manşet, Link alanı boş kalır, habere bağlanmaz." }[TEMPLATES[S.tpl].section]; refresh(); };
document.querySelectorAll(".tabs button").forEach(b => b.onclick = () => { document.querySelectorAll(".tabs button").forEach(x => x.classList.remove("on")); b.classList.add("on"); S.lang = b.dataset.lang; refresh(); });
$("safe").onchange = () => { S.safe = $("safe").checked; refresh(); };
$("langTR").onchange = () => { S.langs.tr = $("langTR").checked; refresh(); }; $("langEN").onchange = () => { S.langs.en = $("langEN").checked; refresh(); };
["htmlTR", "htmlEN", "texts"].forEach(id => $(id).addEventListener("input", () => $(id).dataset.touched = "1"));
$("btnRegen").onclick = () => { ["htmlTR", "htmlEN", "texts"].forEach(id => delete $(id).dataset.touched); refresh(); };
$("btnZip").onclick = buildZip;
window.__setData = (tpl, data, gallery) => { S.tpl = tpl; $("tpl").value = tpl; S.data[tpl] = data; S.gallery = gallery || []; ["htmlTR", "htmlEN", "texts"].forEach(id => delete $(id).dataset.touched); buildForm(); renderGallery(); $("tpl").onchange(); return renderAll(); };
window.__render = async (lang) => { S.lang = lang; await renderAll(); return $("preview").toDataURL("image/png"); };
(async () => {
  await Promise.all(["400 20px Barlow", "500 20px Barlow", "600 20px Barlow", "700 20px Barlow", '700 20px "Barlow Condensed"'].map(f => document.fonts.load(f)));
  await loadKadro(); renderKadro(); $("tpl").value = S.tpl; buildForm(); $("tpl").onchange(); $("fontStatus").textContent = "Hazır, kadro " + KADRO.length + " kişi";
})();
