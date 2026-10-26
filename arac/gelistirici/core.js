/* ===================== BBTF İçerik Aracı, çekirdek ===================== */
const ASSETS = { logoTR: "{{LOGO_TR}}", logoEN: "{{LOGO_EN}}" };
const DEPTS = {
  cmpe:  { tr: "Bilgisayar Mühendisliği", en: "Computer Engineering" },
  aide:  { tr: "Yapay Zeka ve Veri Mühendisliği", en: "Artificial Intelligence and Data Engineering" },
  cyber: { tr: "Siber Güvenlik Mühendisliği", en: "Cybersecurity Engineering" },
  ehm:   { tr: "Elektronik ve Haberleşme Mühendisliği", en: "Electronics and Telecommunications Engineering" },
  swe:   { tr: "Yazılım Mühendisliği", en: "Software Engineering" },
};
const TITLE_EN = { "Prof. Dr.": "Prof. Dr.", "Doç. Dr.": "Assoc. Prof. Dr.", "Dr. Öğr. Üyesi": "Assist. Prof. Dr.", "Arş. Gör.": "Res. Assist.", "Arş. Gör. Dr.": "Res. Assist. Dr.", "Öğr. Gör.": "Lecturer", "Öğr. Gör. Dr.": "Lecturer Dr." };
const KIND_OF_TITLE = { "Prof. Dr.": "faculty", "Doç. Dr.": "faculty", "Dr. Öğr. Üyesi": "faculty", "Arş. Gör.": "ra", "Arş. Gör. Dr.": "ra", "Öğr. Gör.": "lecturer", "Öğr. Gör. Dr.": "lecturer" };
const FACULTY = { tr: "İstanbul Üniversitesi Bilgisayar ve Bilişim Teknolojileri Fakültesi", en: "Istanbul University Faculty of Computer and Information Technologies" };
const SHORT = { tr: "Bilgisayar ve Bilişim Teknolojileri Fakültesi", en: "Faculty of Computer and Information Technologies" };

/* ---------- kütüphane ---------- */
const DB = (() => {
  let db;
  const open = () => new Promise((res, rej) => { const r = indexedDB.open("bbtf-icerik-araci", 1); r.onupgradeneeded = () => r.result.createObjectStore("kadro", { keyPath: "id" }); r.onsuccess = () => { db = r.result; res(db); }; r.onerror = () => rej(r.error); });
  const st = (m) => db.transaction("kadro", m).objectStore("kadro");
  const q = (req) => new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); });
  return { open, all: () => q(st("readonly").getAll()), put: (p) => q(st("readwrite").put(p)), del: (id) => q(st("readwrite").delete(id)), clear: () => q(st("readwrite").clear()) };
})();
let KADRO = [];
function seedFromEmbedded() { // kadro.js (window.BBTF_KADRO) gömülü gelir, alanları araca uyarlar
  return (window.BBTF_KADRO || []).map(p => ({
    id: p.id, name: p.name, titleTR: p.titleTR || "", titleEN: p.titleEN || (TITLE_EN[p.titleTR] || ""), deptKey: p.deptKey || "",
    deptTR: DEPTS[p.deptKey] ? DEPTS[p.deptKey].tr : ((p.dept && p.dept.tr) || "").replace(/\s*Bölümü\s*$/, ""), deptEN: DEPTS[p.deptKey] ? DEPTS[p.deptKey].en : ((p.dept && p.dept.en) || "").replace(/^Department of\s*/i, ""),
    role: p.role || "akademik", roleLabelTR: p.roleLabelTR || "", roleLabelEN: p.roleLabelEN || "", photoUrl: p.photoUrl || "", photo: p.photo || null, kind: KIND_OF_TITLE[p.titleTR] || (p.role === "akademik" ? "faculty" : p.role),
  }));
}
async function loadKadro(reset = false) {
  await DB.open(); if (reset) await DB.clear();
  KADRO = await DB.all();
  if (!KADRO.length) { for (const p of seedFromEmbedded()) await DB.put(p); KADRO = await DB.all(); }
  KADRO.sort((a, b) => (a.role === "akademik" ? 0 : 1) - (b.role === "akademik" ? 0 : 1) || a.name.localeCompare(b.name, "tr"));
}
const byId = (id) => KADRO.find(p => p.id === id);

/* ---------- Türkçe yardımcılar ---------- */
const VOW = "aeıioöuüAEIİOÖUÜ";
const lastVowel = (s) => { for (let i = s.length - 1; i >= 0; i--) if (VOW.includes(s[i])) return s[i].toLocaleLowerCase("tr"); return "e"; };
const h4 = (v) => "aı".includes(v) ? "ı" : "ei".includes(v) ? "i" : "ou".includes(v) ? "u" : "ü";
const h2 = (v) => "aıou".includes(v) ? "a" : "e";
const endsVowel = (s) => VOW.includes(s[s.length - 1]);
const possessive = (s) => { const w = s.trim().split(/\s+/); if (w.length < 2) return false; const last = w[w.length - 1].toLocaleLowerCase("tr"); return /[sş]?[ıiuü]$/.test(last) && !/[ıiuü][ıiuü]$/.test(last); }; // Anadolu Ajansı, İstanbul Üniversitesi, Haber Merkezi
const hard = (s) => "çfhkpsşt".includes(s[s.length - 1].toLocaleLowerCase("tr"));
const gen = (s) => s + "'" + (endsVowel(s) ? "n" : "") + h4(lastVowel(s)) + "n";                         // Ergül'ün, Ajansı'nın, Ankara'nın
const acc = (s) => s + "'" + (endsVowel(s) ? (possessive(s) ? "n" : "y") : "") + h4(lastVowel(s));         // Ergül'ü, Ajansı'nı, Ankara'yı
const dat = (s) => s + "'" + (endsVowel(s) ? (possessive(s) ? "n" : "y") : "") + h2(lastVowel(s));         // Fakültesi'ne, Ankara'ya, HAVELSAN'a
const loc = (s) => s + "'" + (endsVowel(s) ? (possessive(s) ? "n" : "") : "") + (hard(s) ? "t" : "d") + h2(lastVowel(s)); // Ajansı'nda, Ankara'da, TÜBİTAK'ta
const tcase = (s) => s.toLocaleLowerCase("tr").split(/\s+/).map(w => w.charAt(0).toLocaleUpperCase("tr") + w.slice(1)).join(" ");
const norm = (s) => (s || "").toLocaleLowerCase("tr").replace(/ı/g, "i").replace(/[şŞ]/g, "s").replace(/[ğĞ]/g, "g").replace(/[çÇ]/g, "c").replace(/[öÖ]/g, "o").replace(/[üÜ]/g, "u").replace(/i̇/g, "i").replace(/[^a-z0-9 ]/g, "").trim();
const esc = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const joinTR = (a) => a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " ve " + a[a.length - 1];
const joinEN = (a) => a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1];
const MONTHS_TR = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"], MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_TR = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"], DAYS_EN = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function fmtDate(iso, lang, withDay = true) { if (!iso) return ""; const d = new Date(iso + "T12:00:00"); if (isNaN(d)) return iso; const day = d.getDate(), m = d.getMonth(), y = d.getFullYear(), wd = d.getDay();
  return lang === "tr" ? `${day} ${MONTHS_TR[m]} ${y}` + (withDay ? `, ${DAYS_TR[wd]}` : "") : (withDay ? `${DAYS_EN[wd]}, ` : "") + `${day} ${MONTHS_EN[m]} ${y}`; }
function fmtRange(a, b, lang) { if (!a) return ""; if (!b || b === a) return fmtDate(a, lang, false); const da = new Date(a + "T12:00:00"), db = new Date(b + "T12:00:00"); if (da.getMonth() === db.getMonth() && da.getFullYear() === db.getFullYear()) return lang === "tr" ? `${da.getDate()}-${db.getDate()} ${MONTHS_TR[da.getMonth()]} ${da.getFullYear()}` : `${da.getDate()}-${db.getDate()} ${MONTHS_EN[da.getMonth()]} ${da.getFullYear()}`; return fmtDate(a, lang, false) + " - " + fmtDate(b, lang, false); }
const fmtCms = (iso) => iso ? iso.split("-").reverse().join("/") : ""; // gg/aa/yyyy
const slug = (s) => norm(s).replace(/\s+/g, "-").slice(0, 60) || "icerik";

/* ---------- kişi gösterimi ---------- */
function personOf(a) { // kişi satırı -> {name, titleTR, titleEN, kind, deptKey, deptTR, deptEN, photo}
  if (a.kadroId && a.kadroId !== "__manual") { const p = byId(a.kadroId); if (p) return { ...p, photo: a.photo || p.photo, titleTR: p.titleTR, titleEN: p.titleEN }; }
  return { name: (a.name || "").trim(), titleTR: a.titleTR || "", titleEN: a.titleEN || "", kind: a.kind || "external", deptKey: "", deptTR: "", deptEN: "", photo: a.photo || null, role: "manual" };
}
const dispTR = (p) => ((p.titleTR ? p.titleTR + " " : "") + p.name).trim();
const dispEN = (p) => ((p.titleEN ? p.titleEN + " " : "") + p.name).trim();
function kindsTR(ps) { // Öğretim üyemiz / Araştırma görevlimiz / Öğrencimiz, karışıksa Fakültemizden
  const kinds = [...new Set(ps.map(p => p.kind))];
  const m = { faculty: ["öğretim üyesi","öğretim üyeleri","Öğretim üyemiz","Öğretim üyelerimiz"], ra: ["araştırma görevlisi","araştırma görevlileri","Araştırma görevlimiz","Araştırma görevlilerimiz"], lecturer: ["öğretim görevlisi","öğretim görevlileri","Öğretim görevlimiz","Öğretim görevlilerimiz"], student: ["öğrencisi","öğrencileri","Öğrencimiz","Öğrencilerimiz"], idari: ["personeli","personeli","Personelimiz","Personelimiz"] };
  if (kinds.length !== 1 || !m[kinds[0]]) return { role: ps.length > 1 ? "mensupları" : "mensubu", pre: ps.length > 1 ? "Fakültemiz mensupları" : "Fakültemiz mensubu", plural: ps.length > 1 };
  const k = m[kinds[0]], n = ps.length; return { role: n > 1 ? k[1] : k[0], pre: n > 1 ? k[3] : k[2], plural: n > 1 };
}
const roleEN = (p) => ({ faculty: "a faculty member", ra: "a research assistant", lecturer: "a lecturer", student: "a student", idari: "a staff member" }[p.kind] || "a member");

/* ---------- Crossref ---------- */
async function crossref(doi) {
  doi = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").trim(); const r = await fetch("https://api.crossref.org/works/" + encodeURIComponent(doi)); if (!r.ok) throw new Error("HTTP " + r.status);
  const m = (await r.json()).message;
  return { doi, title: (m.title && m.title[0]) || "", journal: (m["container-title"] && m["container-title"][0]) || "", year: (m.issued && m.issued["date-parts"] && m.issued["date-parts"][0] && m.issued["date-parts"][0][0]) || "",
    authors: (m.author || []).map(a => [a.given, a.family].filter(Boolean).join(" ")), abstract: m.abstract ? m.abstract.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "", type: m.type || "" };
}
function matchKadro(name) { const n = norm(name).split(" ").filter(Boolean); if (!n.length) return null; return KADRO.find(p => { const k = norm(p.name).split(" "); return n.every(t => k.includes(t)); }) || null; }

/* ---------- görsel yardımcıları ---------- */
const IMG = {};
const loadImg = (src) => new Promise(res => { if (!src) return res(null); if (IMG[src]) return res(IMG[src]); const i = new Image(); i.onload = () => { IMG[src] = i; res(i); }; i.onerror = () => res(null); i.src = src; });
function fileToDataURL(file, maxSide = 600, square = true) { return new Promise(res => { const img = new Image(); img.onload = () => { const c = document.createElement("canvas"); if (square) { const s = Math.min(img.width, img.height); c.width = c.height = maxSide; c.getContext("2d").drawImage(img, (img.width - s) / 2, Math.max(0, (img.height - s) / 2 * 0.4), s, s, 0, 0, maxSide, maxSide); } else { const k = Math.min(1, maxSide / Math.max(img.width, img.height)); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); } res(c.toDataURL("image/jpeg", 0.9)); URL.revokeObjectURL(img.src); }; img.src = URL.createObjectURL(file); }); }

/* ---------- çizim ilkel işlemleri (1920x606) ---------- */
const PAL = { green: { bg1: "#043b2c", bg2: "#075f46", bg3: "#0a6b50", glow: "rgba(15,127,95,.75)", text: "#f5f2ea", soft: "#bfe0d1", gold: "#e2b51d", ring: "#e2b51d", card: "rgba(255,255,255,.08)" },
              black: { bg1: "#000", bg2: "#000", bg3: "#0a0a0a", glow: "rgba(255,255,255,.05)", text: "#f5f2ea", soft: "#c9cfcc", gold: "#e2b51d", ring: "#e2b51d", card: "rgba(255,255,255,.08)" },
              cream: { bg1: "#fcf8f3", bg2: "#fbf1e2", bg3: "#fbeacb", glow: "rgba(251,234,203,.6)", text: "#10305a", soft: "#4b5a72", gold: "#c98e28", ring: "#c98e28", card: "rgba(16,48,90,.06)" } };
const SAFE = { textBottom: 461, pill: [737, 484, 1181, 574], arrows: [79, 1843], card: [422, 1498] };
function wrapText(ctx, text, maxW) { const words = String(text || "").split(/\s+/).filter(Boolean), lines = []; let cur = ""; for (const w of words) { const t = cur ? cur + " " + w : w; if (ctx.measureText(t).width <= maxW || !cur) cur = t; else { lines.push(cur); cur = w; } } if (cur) lines.push(cur); return lines; }
function drawBg(ctx, variant = "green") {
  const P = PAL[variant], W = 1920, H = 606; ctx.clearRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, W, H * .18); g.addColorStop(0, P.bg1); g.addColorStop(.55, P.bg2); g.addColorStop(1, P.bg3); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rg = (cx, cy, rx, ry, c0, c1) => { ctx.save(); ctx.translate(cx, cy); ctx.scale(rx / ry, 1); const r = ctx.createRadialGradient(0, 0, 0, 0, 0, ry); r.addColorStop(0, c0); r.addColorStop(.7, c1); r.addColorStop(1, c1); ctx.fillStyle = r; ctx.fillRect(-rx * 2, -ry * 2, rx * 4, ry * 4); ctx.restore(); };
  if (variant === "green") { rg(1560, 300, 760, 520, P.glow, "rgba(15,127,95,0)"); rg(180, 560, 900, 600, "rgba(4,59,44,.9)", "rgba(4,59,44,0)"); }
  if (variant === "cream") { rg(1560, 240, 700, 560, P.glow, "rgba(251,234,203,0)"); }
  ctx.beginPath(); ctx.arc(1680, 160, 473, 0, Math.PI * 2); ctx.lineWidth = 54; ctx.strokeStyle = variant === "cream" ? "rgba(201,142,40,.12)" : "rgba(226,181,29,.16)"; ctx.stroke();
  ctx.beginPath(); ctx.arc(130, 716, 310, 0, Math.PI * 2); ctx.fillStyle = variant === "cream" ? "rgba(201,142,40,.08)" : "rgba(226,181,29,.10)"; ctx.fill();
  return P;
}
async function drawLogoBlock(ctx, lang, tag, P, cx = 240, cy = 268) { // etiket + logo, sol sütun
  const logo = await loadImg(lang === "tr" ? ASSETS.logoTR : ASSETS.logoEN);
  const top = cy - 142; ctx.font = "700 30px Barlow"; ctx.letterSpacing = "3px"; ctx.fillStyle = P.gold; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.fillText(tag.toLocaleUpperCase(lang === "tr" ? "tr" : "en"), cx + 1.5, top + 26); ctx.letterSpacing = "0px";
  const lcy = top + 30 + 26 + 114; ctx.save(); ctx.shadowColor = "rgba(0,0,0,.28)"; ctx.shadowBlur = 34; ctx.shadowOffsetY = 12; ctx.beginPath(); ctx.arc(cx, lcy, 114, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill(); ctx.restore();
  if (logo) { ctx.save(); ctx.beginPath(); ctx.arc(cx, lcy, 110, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(logo, cx - 110, lcy - 110, 220, 220); ctx.restore(); }
  ctx.textAlign = "left";
}
async function drawPhotoLeft(ctx, src, P, width = 1010) { // soldan fotoğraf, sağa doğru zemine karışır
  const img = await loadImg(src); if (!img) return false;
  const H = 606, r = img.width / img.height, tr = width / H; let sx = 0, sy = 0, sw = img.width, sh = img.height;
  if (r > tr) { sw = img.height * tr; sx = (img.width - sw) / 2; } else { sh = img.width / tr; sy = (img.height - sh) * 0.3; }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, H);
  const g = ctx.createLinearGradient(width * .80, 0, width, 0); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, P.bg2); ctx.fillStyle = g; ctx.fillRect(width * .80, 0, width * .2 + 2, H);
  const g2 = ctx.createLinearGradient(width - 2, 0, width + 2, 0); g2.addColorStop(0, P.bg2); g2.addColorStop(1, P.bg2); ctx.fillStyle = P.bg2; ctx.fillRect(width, 0, 2, H);
  return true;
}
async function drawPortraits(ctx, people, P, cx = 1675, cy = 268) { // dikey yığılmış yuvarlak fotoğraflar, en fazla 3
  const ph = people.filter(p => p && p.photo).slice(0, 3); if (!ph.length) return 0;
  const sizes = { 1: 250, 2: 200, 3: 150 }, gaps = { 1: 0, 2: 20, 3: 16 }, d = sizes[ph.length], gap = gaps[ph.length], total = ph.length * d + (ph.length - 1) * gap; let py = cy - total / 2 + d / 2;
  for (const p of ph) { const img = await loadImg(p.photo);
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 44; ctx.shadowOffsetY = 16; ctx.beginPath(); ctx.arc(cx, py, d / 2, 0, Math.PI * 2); ctx.fillStyle = P.bg3; ctx.fill(); ctx.restore();
    if (img) { ctx.save(); ctx.beginPath(); ctx.arc(cx, py, d / 2 - 6, 0, Math.PI * 2); ctx.clip(); const s = Math.min(img.width, img.height); ctx.drawImage(img, (img.width - s) / 2, 0, s, s, cx - d / 2 + 6, py - d / 2 + 6, d - 12, d - 12); ctx.restore(); }
    ctx.beginPath(); ctx.arc(cx, py, d / 2 - 3, 0, Math.PI * 2); ctx.lineWidth = 6; ctx.strokeStyle = P.ring; ctx.stroke(); py += d + gap; }
  return ph.length;
}
/* Alan bloğu: items = [{label, text, kind:'author'|'journal'|'title'|'plain'|'small'}], x/w kutusu, dikey ortalanır ve 461'in üstünde biter, sığmazsa küçülür */
function layoutFields(ctx, items, w, opts = {}) {
  let sizes = { author: opts.authorSize || 46, journal: 38, title: opts.titleSize || 48, plain: 36, small: 30 }, plan;
  for (let t = 0; t < 14; t++) {
    let h = 0; const rows = items.map((it, i) => { const sz = sizes[it.kind] || 36; ctx.font = it.kind === "title" ? `700 ${sz}px "Barlow Condensed"` : it.kind === "author" ? `600 ${sz}px Barlow` : `500 ${sz}px Barlow`;
      const lines = (it.lines ? it.lines.flatMap(l => wrapText(ctx, l, w)) : wrapText(ctx, it.text, w)); const lh = it.kind === "title" ? 1.12 : 1.15; const hh = (it.label ? 24 + 5 : 0) + lines.length * sz * lh; h += hh + (i < items.length - 1 ? 20 : 0); return { it, lines, sz, lh, hh }; });
    plan = { rows, h }; const tooMany = rows.some(r => r.it.kind === "title" && r.lines.length > (opts.maxTitleLines || 3));
    if (h <= (opts.maxH || 411) && !tooMany) break;
    if (tooMany && sizes.title > 38) { sizes.title -= 2; continue; }
    if (sizes.title > 38) sizes.title -= 2; else if (sizes.journal > 32) sizes.journal -= 2; else if (sizes.author > 34) sizes.author -= 2; else if (sizes.plain > 28) sizes.plain -= 2; else break;
  }
  return plan;
}
function drawFields(ctx, plan, x, P, opts = {}) {
  const bottomLimit = opts.bottomLimit || SAFE.textBottom; let y = Math.min((536 - plan.h) / 2 + (opts.shiftY || 0), bottomLimit - plan.h); if (y < 44) y = 44; const top = y;
  for (const r of plan.rows) { if (r.it.label) { ctx.font = "700 24px Barlow"; ctx.letterSpacing = "2.2px"; ctx.fillStyle = P.gold; ctx.fillText(r.it.label.toLocaleUpperCase("tr"), x, y + 24 * .78); ctx.letterSpacing = "0px"; y += 29; }
    ctx.font = r.it.kind === "title" ? `700 ${r.sz}px "Barlow Condensed"` : r.it.kind === "author" ? `600 ${r.sz}px Barlow` : `500 ${r.sz}px Barlow`; ctx.fillStyle = r.it.color || (r.it.kind === "journal" || r.it.kind === "small" ? P.soft : P.text);
    for (const ln of r.lines) { ctx.fillText(ln, x, y + r.sz * r.lh * .5 + r.sz * .36); y += r.sz * r.lh; } y += 20; }
  return { top, bottom: y - 20 };
}
/* Sağ kolon "başlık + ayrıntı" bloğu (fotoğraf soldayken): event (altın), headline (beyaz, kondense), detail satırları */
function layoutCopy(ctx, c, w = 768) {
  let hl = c.headlineSize || 84, dt = 32, ev = 31, plan;
  for (let t = 0; t < 12; t++) {
    ctx.font = `600 ${ev}px Barlow`; const evL = (c.event || []).flatMap(l => wrapText(ctx, l, w));
    ctx.font = `700 ${hl}px "Barlow Condensed"`; const hlL = (c.headline || []).flatMap(l => wrapText(ctx, l, w));
    ctx.font = `500 ${dt}px Barlow`; const dtL = (c.detail || []).map(d => ({ ...d, lines: wrapText(ctx, d.text, w) }));
    const h = evL.length * ev * 1.18 + (hlL.length ? 14 + hlL.length * hl * .98 : 0) + (dtL.length ? 26 + dtL.reduce((s, d) => s + d.lines.length * dt * 1.25, 0) : 0);
    plan = { evL, hlL, dtL, hl, dt, ev, h }; if (h <= 400 && hlL.length <= (c.maxHeadlineLines || 3)) break;
    if (hl > 60) hl -= 4; else if (dt > 26) dt -= 2; else if (ev > 26) ev -= 2; else break;
  }
  return plan;
}
function drawCopy(ctx, plan, P, x = 1052) {
  let y = Math.min((536 - plan.h) / 2, SAFE.textBottom - plan.h); if (y < 44) y = 44;
  ctx.font = `600 ${plan.ev}px Barlow`; ctx.fillStyle = P.gold; for (const l of plan.evL) { ctx.fillText(l, x, y + plan.ev * .85); y += plan.ev * 1.18; }
  if (plan.hlL.length) { y += 14; ctx.font = `700 ${plan.hl}px "Barlow Condensed"`; ctx.fillStyle = P.text; for (const l of plan.hlL) { ctx.fillText(l, x, y + plan.hl * .8); y += plan.hl * .98; } }
  if (plan.dtL.length) { y += 26; ctx.font = `500 ${plan.dt}px Barlow`; for (const d of plan.dtL) { ctx.fillStyle = d.bold ? P.text : P.soft; ctx.font = `${d.bold ? 600 : 500} ${plan.dt}px Barlow`; for (const l of d.lines) { ctx.fillText(l, x, y + plan.dt * .85); y += plan.dt * 1.25; } } }
  return y;
}
/* Bilgi kartları: date / time / place gibi, etiket altın küçük, değer büyük */
function drawFacts(ctx, facts, P, x, y, w = 1350, valueSize = 40) {
  const items = facts.filter(f => f && f.value); if (!items.length) return y;
  ctx.font = `600 ${valueSize}px Barlow`; let widths = items.map(f => Math.max(ctx.measureText(f.value).width, 160)); const gap = 48; let total = widths.reduce((s, v) => s + v, 0) + gap * (items.length - 1); let sz = valueSize;
  while (total > w && sz > 28) { sz -= 2; ctx.font = `600 ${sz}px Barlow`; widths = items.map(f => Math.max(ctx.measureText(f.value).width, 160)); total = widths.reduce((s, v) => s + v, 0) + gap * (items.length - 1); }
  let cx = x; const rows = total > w; // sığmazsa alt alta
  for (let i = 0; i < items.length; i++) { const f = items[i]; ctx.font = "700 22px Barlow"; ctx.letterSpacing = "2.2px"; ctx.fillStyle = P.gold; ctx.fillText(f.label.toLocaleUpperCase("tr"), rows ? x : cx, y + 22 * .78); ctx.letterSpacing = "0px";
    ctx.font = `600 ${sz}px Barlow`; ctx.fillStyle = P.text; ctx.fillText(f.value, rows ? x : cx, y + 30 + sz * .85); if (rows) y += 30 + sz * 1.15 + 14; else cx += widths[i] + gap; }
  return rows ? y : y + 30 + sz * 1.15;
}
function drawSender(ctx, lang, P) { ctx.font = "500 20px Barlow"; ctx.fillStyle = P.soft; ctx.textAlign = "right"; ctx.fillText(FACULTY[lang], 1820, 582); ctx.textAlign = "left"; }
function drawSafe(ctx) { ctx.save(); ctx.lineWidth = 4; ctx.strokeStyle = "rgba(255,80,80,.9)"; ctx.strokeRect(737, 484, 444, 90); for (const cx of SAFE.arrows) { ctx.beginPath(); ctx.arc(cx, 303, 29, 0, Math.PI * 2); ctx.stroke(); } ctx.setLineDash([9, 9]); ctx.strokeStyle = "rgba(255,210,60,.95)"; ctx.lineWidth = 3; for (const xx of SAFE.card) { ctx.beginPath(); ctx.moveTo(xx, 0); ctx.lineTo(xx, 606); ctx.stroke(); } ctx.restore(); }
function photoFitWarn(ctx, text, font, maxW) { ctx.font = font; return ctx.measureText(text).width > maxW; }

/* ---------- HTML yapı taşları (Froala, satır içi stil) ---------- */
const H = {
  lead: (t) => `<p style="font-size:1.1em; line-height:1.7; margin:0 0 18px 0; padding:2px 0 2px 18px; border-left:4px solid #439c86;">${t}</p>\n`,
  p: (t, mb = 18) => `<p style="line-height:1.7; margin:0 0 ${mb}px 0;">${t}</p>\n`,
  strong: (t) => `<p style="line-height:1.7; margin:0; font-weight:600;">${t}</p>\n`,
  panel: (label, t) => t ? `<div style="background:#f1f7f4; border-radius:10px; padding:16px 20px; margin:0 0 18px 0;">\n<div style="font-size:0.78em; font-weight:700; letter-spacing:.3px; text-transform:uppercase; color:#2e7d67; margin:0 0 6px 0;">${label}</div>\n<p style="line-height:1.7; margin:0;">${t}</p>\n</div>\n` : "",
  facts: (items) => { const it = items.filter(i => i && i.value); return it.length ? `<div style="display:flex; flex-wrap:wrap; gap:12px; margin:0 0 20px 0;">\n` + it.map(i => `<div style="flex:1 1 180px; background:#f1f7f4; border-radius:8px; padding:12px 14px;"><div style="font-size:0.78em; font-weight:700; letter-spacing:.3px; text-transform:uppercase; color:#586b65; margin:0 0 4px 0;">${esc(i.label)}</div><div style="font-weight:600;">${esc(i.value)}</div></div>\n`).join("") + `</div>\n` : ""; },
  list: (label, items) => items.length ? `<div style="border-left:4px solid #075f46; background:#f1f7f4; padding:16px 20px; margin:6px 0 22px 0;">\n<h3 style="margin:0 0 10px 0; font-size:1.15em; color:#24685a;">${label}</h3>\n<ul style="margin:0; padding-left:20px; line-height:1.8;">\n` + items.map(i => `<li>${i}</li>`).join("\n") + `\n</ul>\n</div>\n` : "",
  note: (t) => t ? `<div style="border-left:4px solid #e2b51d; background:#fbf8ee; border-radius:0 8px 8px 0; padding:14px 18px; margin:0 0 20px 0; line-height:1.6;">${t}</div>\n` : "",
  btn: (label, href, title = "") => `<a class="btn" href="${esc(href)}" target="_blank" rel="noopener" title="${esc(title)}" style="--bs-btn-color:#ffffff; --bs-btn-bg:#3a8f78; --bs-btn-border-color:#3a8f78; --bs-btn-hover-color:#ffffff; --bs-btn-hover-bg:#2e7d67; --bs-btn-hover-border-color:#2e7d67; --bs-btn-active-color:#ffffff; --bs-btn-active-bg:#256a57; --bs-btn-active-border-color:#256a57; --bs-btn-focus-shadow-rgb:67,156,134; --bs-btn-padding-y:.75rem; --bs-btn-padding-x:1.4rem; --bs-btn-font-size:1rem; --bs-btn-font-weight:700; --bs-btn-border-radius:.5rem; color:#ffffff !important; display:inline-flex; align-items:center; gap:.5rem; max-width:100%; text-align:left; background-image:linear-gradient(135deg, rgba(255,255,255,.12) 0%, rgba(0,0,0,.14) 100%); box-shadow:0 6px 18px rgba(46,125,103,.22); transition:background-color .18s ease, box-shadow .18s ease;">${esc(label)} <span aria-hidden="true" style="font-size:1.15em; line-height:1;">&#8594;</span></a>`,
  btn2: (label, href, title = "") => `<a class="btn" href="${esc(href)}" target="_blank" rel="noopener" title="${esc(title)}" style="--bs-btn-bg:#e9f3ee; --bs-btn-border-color:#bfdacf; --bs-btn-hover-bg:#d9ede2; --bs-btn-hover-border-color:#a9cbbd; --bs-btn-active-bg:#c9e3d5; --bs-btn-active-border-color:#a9cbbd; --bs-btn-focus-shadow-rgb:67,156,134; --bs-btn-padding-y:.65rem; --bs-btn-padding-x:1.1rem; --bs-btn-font-size:.95rem; --bs-btn-font-weight:700; --bs-btn-border-radius:.5rem; color:#205d4e !important; display:inline-flex; align-items:center; gap:.5rem; max-width:100%; text-align:left; margin:0 8px 8px 0;">${esc(label)} <span aria-hidden="true">&#8599;</span></a>`,
  btnRow: (btns, mb = 22) => btns.length ? `<p style="margin:0 0 ${mb}px 0;">${btns.join("")}</p>\n` : "",
};
const clean = (html) => html.replace(/[\u2014]/g, ",").replace(/;(?![^<]*>)/g, ","); // görünen metinde noktalı virgül ve uzun tire yok (stil özniteliklerine dokunmaz)

/* ---------- ZIP (store) ---------- */
const CRC_T = (() => { const t = new Uint32Array(256); for (let i = 0; i < 256; i++) { let c = i; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[i] = c >>> 0; } return t; })();
function crc32(u8) { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRC_T[(c ^ u8[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function makeZip(files) { const enc = new TextEncoder(), parts = [], central = []; let off = 0; const le = (n, b) => { const a = new Uint8Array(b); for (let i = 0; i < b; i++) a[i] = (n >>> (8 * i)) & 0xFF; return a; };
  const now = new Date(), dt = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xFFFF, dd = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;
  for (const f of files) { const name = enc.encode(f.name), crc = crc32(f.data); const head = [le(0x04034b50, 4), le(20, 2), le(0x0800, 2), le(0, 2), le(dt, 2), le(dd, 2), le(crc, 4), le(f.data.length, 4), le(f.data.length, 4), le(name.length, 2), le(0, 2), name];
    const cen = [le(0x02014b50, 4), le(20, 2), le(20, 2), le(0x0800, 2), le(0, 2), le(dt, 2), le(dd, 2), le(crc, 4), le(f.data.length, 4), le(f.data.length, 4), le(name.length, 2), le(0, 2), le(0, 2), le(0, 2), le(0, 2), le(0, 4), le(off, 4), name];
    parts.push(...head, f.data); off += head.reduce((s, a) => s + a.length, 0) + f.data.length; central.push(...cen); }
  const cenLen = central.reduce((s, a) => s + a.length, 0); return new Blob([...parts, ...central, le(0x06054b50, 4), le(0, 2), le(0, 2), le(files.length, 2), le(files.length, 2), le(cenLen, 4), le(off, 4), le(0, 2)], { type: "application/zip" }); }
function download(blob, name) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }
const toU8 = async (blob) => new Uint8Array(await blob.arrayBuffer());
const canvasBlob = (c, q = .92) => new Promise(res => c.toBlob(res, "image/jpeg", q));
const dataURLtoU8 = (d) => Uint8Array.from(atob(d.split(",")[1]), c => c.charCodeAt(0));
