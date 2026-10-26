/* ===================== Kalıplar ===================== */
const RANKS = { "1": { tr: ["birincilik ödülü", "birinci oldu"], en: "First place" }, "2": { tr: ["ikincilik ödülü", "ikinci oldu"], en: "Second place" }, "3": { tr: ["üçüncülük ödülü", "üçüncü oldu"], en: "Third place" }, "finalist": { tr: ["finalist oldu", "finale kaldı"], en: "Finalist" }, "top10": { tr: ["ilk 10'a kaldı", "ilk 10'a kaldı"], en: "Top 10" }, "other": { tr: ["", ""], en: "" } };
const OCCASIONS = [
  { id: "23nisan", tr: ["23 Nisan", "Ulusal Egemenlik ve Çocuk Bayramı Kutlu Olsun"], en: ["23 April", "National Sovereignty and Children's Day"], date: "04-23" },
  { id: "19mayis", tr: ["19 Mayıs", "Atatürk'ü Anma, Gençlik ve Spor Bayramı Kutlu Olsun"], en: ["19 May", "Commemoration of Atatürk, Youth and Sports Day"], date: "05-19" },
  { id: "15temmuz", tr: ["15 Temmuz", "Demokrasi ve Millî Birlik Günü"], en: ["15 July", "Democracy and National Unity Day"], date: "07-15" },
  { id: "30agustos", tr: ["30 Ağustos", "Zafer Bayramı Kutlu Olsun"], en: ["30 August", "Victory Day"], date: "08-30" },
  { id: "29ekim", tr: ["29 Ekim", "Cumhuriyet Bayramı Kutlu Olsun"], en: ["29 October", "Republic Day"], date: "10-29" },
  { id: "10kasim", tr: ["10 Kasım", "Atatürk'ü Saygı ve Özlemle Anıyoruz"], en: ["10 November", "We Remember Atatürk with Respect and Longing"], date: "11-10", mood: "black" },
  { id: "24kasim", tr: ["24 Kasım", "Öğretmenler Günü Kutlu Olsun"], en: ["24 November", "Teachers' Day"], date: "11-24" },
  { id: "8mart", tr: ["8 Mart", "Dünya Kadınlar Günü Kutlu Olsun"], en: ["8 March", "International Women's Day"], date: "03-08" },
  { id: "yeniyil", tr: ["Yeni Yıl", "Yeni Yılınız Kutlu Olsun"], en: ["New Year", "Happy New Year"], date: "01-01" },
  { id: "ramazan", tr: ["Ramazan Bayramı", "Bayramınız Kutlu Olsun"], en: ["Eid al-Fitr", "Happy Eid"], date: "" },
  { id: "kurban", tr: ["Kurban Bayramı", "Bayramınız Kutlu Olsun"], en: ["Eid al-Adha", "Happy Eid"], date: "" },
  { id: "ozel", tr: ["", ""], en: ["", ""], date: "" },
];
const bi = (d, k, lang) => (d[k] && d[k][lang]) ? d[k][lang].trim() : "";
const peopleOf = (d, k = "people") => (d[k] || []).map(personOf).filter(p => p.name);
const namesTR = (ps) => ps.map(dispTR), namesEN = (ps) => ps.map(dispEN);
const deptOf = (ps, lang) => { const ks = [...new Set(ps.map(p => p.deptKey).filter(Boolean))]; return ks.length === 1 ? (lang === "tr" ? DEPTS[ks[0]].tr : DEPTS[ks[0]].en) : ""; };
const closingTR = (ps, what) => { const k = kindsTR(ps); const n = namesTR(ps); return `${k.pre} ${joinTR(n)}${acc(n[n.length - 1]).slice(n[n.length - 1].length)} ${what}${k.plural ? "ları" : ""} dolayısıyla tebrik eder, başarılarının devamını dileriz.`; };
const closingEN = (ps, what) => `We congratulate ${joinEN(namesEN(ps))} on ${what} and wish every success in future studies.`;
const whoTR = (ps, bold = true) => { const k = kindsTR(ps), dept = deptOf(ps, "tr"), n = namesTR(ps).map(x => bold ? `<strong>${esc(x)}</strong>` : esc(x)); return (dept && ps[0].kind !== "student" ? `Fakültemiz ${dept} Bölümü ${k.role} ` : `Fakültemiz ${k.role} `) + joinTR(n); };
const whoEN = (ps, bold = true) => { const n = namesEN(ps).map(x => bold ? `<strong>${esc(x)}</strong>` : esc(x)); if (ps.length === 1) { const d = ps[0].deptEN; return `${n[0]}, ${roleEN(ps[0])}${d ? " of the Department of " + d : " of our Faculty"},`; } return `${joinEN(n)}, members of our Faculty,`; };
const sufGen = (s) => gen(s).slice(s.length), sufAcc = (s) => acc(s).slice(s.length);
const warn = (list, cond, msg) => { if (cond) list.push(msg); };

const TEMPLATES = {};

/* ---------- 1. Yeni yayın ---------- */
TEMPLATES["yeni-yayin"] = {
  name: "Yeni yayın", section: "haber", manset: true,
  fields: [
    { k: "subtype", t: "select", l: "Yayın türü", opts: [["makale", "Dergi makalesi"], ["bildiri", "Konferans bildirisi"], ["kitap", "Kitap veya kitap bölümü"]] },
    { k: "doi", t: "doi", l: "DOI veya DOI bağlantısı" },
    { k: "title", t: "textarea", l: "Yayın başlığı" },
    { k: "venue", t: "text", l: "Dergi / Konferans / Yayınevi" },
    { k: "year", t: "text", l: "Yıl", short: true }, { k: "link", t: "text", l: "Yayın bağlantısı (düğme)" },
    { k: "people", t: "people", l: "Fakülteden yazarlar (makale sırasıyla, en fazla 3)", max: 3 },
    { k: "coauthored", t: "check", l: "Fakülte dışından yazar da var" },
    { k: "summary", t: "bitext", l: "Çalışma hakkında (tek paragraf, boşsa panel çıkmaz)" },
  ],
  titles(d) { const ps = peopleOf(d); const lab = { makale: ["Yeni Yayın", "New Publication"], bildiri: ["Yeni Bildiri", "New Conference Paper"], kitap: ["Yeni Kitap", "New Book"] }[d.subtype || "makale"]; return { tr: `${lab[0]}: ${joinTR(namesTR(ps))}`, en: `${lab[1]}: ${joinEN(namesEN(ps))}` }; },
  async draw(ctx, lang, d) {
    const P = drawBg(ctx, "green"), ps = peopleOf(d), w = [];
    const tag = { makale: ["Yeni Yayın", "New Publication"], bildiri: ["Yeni Bildiri", "New Paper"], kitap: ["Yeni Kitap", "New Book"] }[d.subtype || "makale"];
    await drawLogoBlock(ctx, lang, lang === "tr" ? tag[0] : tag[1], P);
    const venueLab = { makale: ["Dergi", "Journal"], bildiri: ["Konferans", "Conference"], kitap: ["Yayınevi", "Publisher"] }[d.subtype || "makale"], titleLab = d.subtype === "kitap" ? ["Kitap Adı", "Book Title"] : ["Yayın Başlığı", "Publication Title"];
    const items = [{ label: lang === "tr" ? (ps.length > 1 ? "Yazarlar" : "Yazar") : (ps.length > 1 ? "Authors" : "Author"), lines: lang === "tr" ? namesTR(ps) : namesEN(ps), kind: "author" }, { label: lang === "tr" ? venueLab[0] : venueLab[1], text: d.venue || "", kind: "journal" }, { label: lang === "tr" ? titleLab[0] : titleLab[1], text: d.title || "", kind: "title" }];
    const plan = layoutFields(ctx, items, 1010, { authorSize: ps.length > 1 ? 40 : 46 }); drawFields(ctx, plan, 470, P); await drawPortraits(ctx, ps, P); drawSender(ctx, lang, P);
    warn(w, plan.rows.some(r => r.it.kind === "title" && r.lines.length > 3), "Başlık çok uzun, kısaltmayı düşün."); warn(w, !ps.length, "Yazar seçilmedi."); return w;
  },
  body(d, lang) {
    const ps = peopleOf(d); if (!ps.length) return ""; const t = esc(d.title || ""), v = esc(d.venue || ""), link = d.link || (d.doi ? "https://doi.org/" + d.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "") : "");
    const kind = d.subtype || "makale", noun = { makale: ["makalesi", "makale", "dergisinde"], bildiri: ["bildirisi", "bildiri", "konferansında"], kitap: ["kitabı", "kitap", "tarafından"] }[kind];
    if (lang === "tr") {
      const who = whoTR(ps), last = namesTR(ps).slice(-1)[0];
      const lead = kind === "kitap" ? (d.coauthored ? `${who}${sufGen(last)} yazarları arasında yer aldığı <em>"${t}"</em> başlıklı ${noun[1]}, <em>${v}</em> tarafından yayımlanmıştır.` : `${who}${sufGen(last)} <em>"${t}"</em> başlıklı ${noun[0]}, <em>${v}</em> tarafından yayımlanmıştır.`)
        : (d.coauthored ? `${who}${sufGen(last)} yazarları arasında yer aldığı <em>"${t}"</em> başlıklı ${noun[1]}, ${kind === "makale" ? "uluslararası hakemli " : ""}<em>${v}</em> ${noun[2]} yayımlanmıştır.` : `${who}${sufGen(last)} <em>"${t}"</em> başlıklı ${noun[0]}, ${kind === "makale" ? "uluslararası hakemli " : ""}<em>${v}</em> ${noun[2]} yayımlanmıştır.`);
      return H.lead(lead) + H.panel("Çalışma hakkında", esc(bi(d, "summary", "tr"))) + H.p(closingTR(ps, "uluslararası literatüre " + (kindsTR(ps).plural ? "sundukları" : "sunduğu") + " bu değerli katkı"), 22) + (link ? H.btnRow([H.btn("Yayına ulaşmak için tıklayınız", link, "Yayın sayfası, yeni sekmede açılır")], 0) : "");
    }
    const unit = { makale: "article", bildiri: "paper", kitap: "book" }[kind], pub = kind === "kitap" ? `has been published by <em>${v}</em>` : kind === "makale" ? `has been published in the international peer-reviewed journal <em>${v}</em>` : `has been published in the proceedings of <em>${v}</em>`;
    const lead = `The ${unit} entitled <em>"${t}"</em>${d.coauthored ? ", co-authored by " : " by "}${whoEN(ps)} ${pub}.`;
    return H.lead(lead) + H.panel("About the study", esc(bi(d, "summary", "en"))) + H.p(closingEN(ps, "this valuable contribution to the international literature"), 22) + (link ? H.btnRow([H.btn("Click here to access the publication", link, "Publication page, opens in a new tab")], 0) : "");
  },
  texts(d) { const ps = peopleOf(d), v = d.venue || ""; return { spotTR: `${joinTR(namesTR(ps))}${sufGen(namesTR(ps).slice(-1)[0] || "x")} çalışması ${v} ${d.subtype === "kitap" ? "tarafından" : d.subtype === "bildiri" ? "konferansında" : "dergisinde"} yayımlandı.`, spotEN: `The work by ${joinEN(namesEN(ps))} has been published in ${v}.`, mansetAltTR: `${this.titles(d).tr}, ${v}`, mansetAltEN: `${this.titles(d).en}, ${v}`, mansetSubTR: `${v} ${d.subtype === "kitap" ? "yayını" : "dergisinde yeni makale"}`, mansetSubEN: `New ${d.subtype === "kitap" ? "book from" : "article in"} ${v}` }; },
};

/* ---------- 2. Başarı ve ödül ---------- */
TEMPLATES["basari-odul"] = {
  name: "Başarı ve ödül", section: "haber", manset: true,
  fields: [
    { k: "subject", t: "select", l: "Kim", opts: [["person", "Kişi (öğrenci veya öğretim üyesi)"], ["team", "Takım"]] },
    { k: "team", t: "text", l: "Takım adı (takım ise)" },
    { k: "people", t: "people", l: "Kişiler (en fazla 3, fotoğraf isteğe bağlı)", max: 3 },
    { k: "rank", t: "select", l: "Derece", opts: [["1", "Birincilik"], ["2", "İkincilik"], ["3", "Üçüncülük"], ["finalist", "Finalist"], ["top10", "İlk 10"], ["other", "Diğer (aşağıya yaz)"]] },
    { k: "rankText", t: "bi", l: "Diğer derece metni (TR / EN)" },
    { k: "competition", t: "bi", l: "Yarışma adı (TR / EN)" }, { k: "category", t: "bi", l: "Kategori (TR / EN)" },
    { k: "organizer", t: "bi", l: "Düzenleyen ve yer (TR / EN)" }, { k: "date", t: "date", l: "Tarih" }, { k: "date2", t: "date", l: "Bitiş tarihi (aralıksa)" },
    { k: "program", t: "bi", l: "Kişinin programı veya bağlı olduğu bölüm (afişte ad altında)" },
    { k: "photo", t: "photo", l: "Afiş fotoğrafı (sol taraf, yatay)" },
    { k: "summary", t: "bitext", l: "Çalışma veya yarışma hakkında (isteğe bağlı)" }, { k: "links", t: "links", l: "Bağlantılar (sonuç belgesi, haber)" },
  ],
  rankTR(d, i) { return d.rank === "other" ? bi(d, "rankText", "tr") : (RANKS[d.rank || "1"].tr[i]); },
  rankEN(d) { return d.rank === "other" ? bi(d, "rankText", "en") : RANKS[d.rank || "1"].en; },
  subjectTR(d) { const ps = peopleOf(d); if (d.subject === "team") return `${d.team || "Takımımız"} takımı`; const k = kindsTR(ps); return ps.length ? `${k.pre}` : "Öğrencimiz"; },
  titles(d) { const ps = peopleOf(d), comp = bi(d, "competition", "tr"), compE = bi(d, "competition", "en"); const subjTR = d.subject === "team" ? `${d.team} Takımı` : joinTR(namesTR(ps)); const subjEN = d.subject === "team" ? `Team ${d.team}` : joinEN(namesEN(ps));
    const rt = d.rank === "other" ? bi(d, "rankText", "tr") : { "1": "Birinci Oldu", "2": "İkinci Oldu", "3": "Üçüncü Oldu", "finalist": "Finale Kaldı", "top10": "İlk 10'a Kaldı" }[d.rank || "1"];
    const re = d.rank === "other" ? bi(d, "rankText", "en") : { "1": "Wins First Place", "2": "Wins Second Place", "3": "Wins Third Place", "finalist": "Reaches the Final", "top10": "Places in the Top 10" }[d.rank || "1"];
    return { tr: `${subjTR} ${comp}${comp ? loc(comp).slice(comp.length) : ""} ${rt}`, en: `${subjEN} ${re} in ${compE}` }; },
  async draw(ctx, lang, d) {
    const P = drawBg(ctx, "green"), ps = peopleOf(d), w = []; const hasPhoto = await drawPhotoLeft(ctx, d.photo, P); warn(w, !hasPhoto, "Afiş fotoğrafı yok, sol taraf boş kalır.");
    const comp = bi(d, "competition", lang), org = bi(d, "organizer", lang), cat = bi(d, "category", lang), when = fmtRange(d.date, d.date2, lang);
    let headline, detail = [];
    if (lang === "tr") { headline = d.subject === "team" ? [`${d.team || "Takımımız"} takımına`, this.rankTR(d, 0)] : [this.subjectTR(d), this.rankTR(d, 1)]; }
    else { headline = d.subject === "team" ? [`${this.rankEN(d)} for`, `team ${d.team || ""}`] : [`${this.rankEN(d)} for`, ps.length === 1 ? (ps[0].kind === "student" ? "our student" : "our faculty member") : "our team members"]; }
    if (d.subject === "team" && ps.length) detail.push({ text: (lang === "tr" ? namesTR(ps) : namesEN(ps)).join(", "), bold: true }); else if (ps.length) { detail.push({ text: (lang === "tr" ? namesTR(ps) : namesEN(ps)).join(", "), bold: true }); if (bi(d, "program", lang)) detail.push({ text: bi(d, "program", lang) }); }
    if (cat) detail.push({ text: cat }); if (org || when) detail.push({ text: [org, when].filter(Boolean).join(", ") });
    const plan = layoutCopy(ctx, { event: [comp].filter(Boolean), headline, detail, headlineSize: 96 }, ps.filter(p => p.photo).length ? 560 : 768); drawCopy(ctx, plan, P);
    if (ps.filter(p => p.photo).length) await drawPortraits(ctx, ps, P, 1700, 268); drawSender(ctx, lang, P); return w;
  },
  body(d, lang) {
    const ps = peopleOf(d), comp = bi(d, "competition", lang), cat = bi(d, "category", lang), org = bi(d, "organizer", lang), when = fmtRange(d.date, d.date2, lang), links = (d.links || []).filter(l => l.url);
    if (lang === "tr") {
      const subj = d.subject === "team" ? `Fakültemiz öğrencilerinin de yer aldığı <strong>${esc(d.team)}</strong> takımı` : whoTR(ps);
      const lead = `${subj}, ${org ? org + " tarafından düzenlenen " : ""}<strong>${esc(comp)}</strong>${cat ? " " + esc(cat) + " kategorisinde" : ""} ${this.rankTR(d, 1)}.`;
      return H.lead(lead) + H.facts([{ label: "Yarışma", value: comp }, { label: "Kategori", value: cat }, { label: "Tarih", value: when }, { label: "Düzenleyen", value: org }]) + (ps.length ? H.list(d.subject === "team" ? "Takım" : "Kişi", namesTR(ps).map(esc)) : "") + H.panel("Çalışma hakkında", esc(bi(d, "summary", "tr"))) + H.p(d.subject === "team" ? `${esc(d.team)} takımını ve danışmanlarını tebrik eder, başarılarının devamını dileriz.` : closingTR(ps, "bu değerli başarı"), 22) + H.btnRow(links.map(l => H.btn2(l.label || "Bağlantı", l.url)), 0);
    }
    const subj = d.subject === "team" ? `Team <strong>${esc(d.team)}</strong>, which includes students from our Faculty,` : whoEN(ps);
    const lead = `${subj} ${this.rankEN(d).toLowerCase() === "finalist" ? "reached the final of" : this.rankEN(d).toLowerCase() === "top 10" ? "placed in the top 10 of" : "won " + this.rankEN(d).toLowerCase() + " in"} <strong>${esc(comp)}</strong>${cat ? " in the " + esc(cat) + " category" : ""}${org ? ", organised by " + esc(org) : ""}.`;
    return H.lead(lead) + H.facts([{ label: "Competition", value: comp }, { label: "Category", value: cat }, { label: "Date", value: when }, { label: "Organiser", value: org }]) + (ps.length ? H.list(d.subject === "team" ? "Team" : "Person", namesEN(ps).map(esc)) : "") + H.panel("About the work", esc(bi(d, "summary", "en"))) + H.p(d.subject === "team" ? `We congratulate team ${esc(d.team)} and its advisors and wish them continued success.` : closingEN(ps, "this valuable achievement"), 22) + H.btnRow(links.map(l => H.btn2(l.label || "Link", l.url)), 0);
  },
  texts(d) { const t = this.titles(d); return { spotTR: t.tr + ".", spotEN: t.en + ".", mansetAltTR: t.tr, mansetAltEN: t.en, mansetSubTR: bi(d, "competition", "tr"), mansetSubEN: bi(d, "competition", "en") }; },
};

/* ---------- 3. Yükselme ve atama ---------- */
TEMPLATES["yukselme-atama"] = {
  name: "Akademik yükselme ve atama", section: "haber", manset: true,
  fields: [
    { k: "subtype", t: "select", l: "Tür", opts: [["yukselme", "Akademik yükselme (Doçent, Profesör)"], ["atama", "Atama (Bölüm Başkanı, Dekan Yardımcısı vb.)"]] },
    { k: "people", t: "people", l: "Kişi", max: 1 },
    { k: "newTitle", t: "select", l: "Yeni unvan (yükselme)", opts: [["Doç. Dr.", "Doçent"], ["Prof. Dr.", "Profesör"], ["Dr. Öğr. Üyesi", "Dr. Öğretim Üyesi"]] },
    { k: "role", t: "bi", l: "Görev (atama, TR / EN), ör. Bölüm Başkanı / Head of Department" },
    { k: "unit", t: "bi", l: "Birim (TR / EN), boşsa kişinin bölümü" }, { k: "date", t: "date", l: "Tarih" },
    { k: "summary", t: "bitext", l: "Ek bilgi (isteğe bağlı)" },
  ],
  titles(d) { const p = peopleOf(d)[0]; if (!p) return { tr: "", en: "" }; if (d.subtype === "atama") return { tr: `Atama: ${dispTR(p)}, ${bi(d, "role", "tr")}`, en: `Appointment: ${dispEN(p)}, ${bi(d, "role", "en")}` }; const nt = d.newTitle || "Doç. Dr."; return { tr: `Akademik Yükselme: ${nt} ${p.name}`, en: `Academic Promotion: ${TITLE_EN[nt] || nt} ${p.name}` }; },
  async draw(ctx, lang, d) {
    const P = drawBg(ctx, "green"), p = peopleOf(d)[0], w = []; warn(w, !p, "Kişi seçilmedi."); if (!p) return w;
    const atama = d.subtype === "atama", nt = d.newTitle || "Doç. Dr."; await drawLogoBlock(ctx, lang, lang === "tr" ? (atama ? "Atama" : "Akademik Yükselme") : (atama ? "Appointment" : "Academic Promotion"), P);
    const unit = bi(d, "unit", lang) || (lang === "tr" ? p.deptTR : p.deptEN);
    const items = atama ? [{ label: lang === "tr" ? "Öğretim üyemiz" : "Faculty member", text: lang === "tr" ? dispTR(p) : dispEN(p), kind: "author" }, { label: lang === "tr" ? "Görev" : "Position", text: bi(d, "role", lang), kind: "title" }, { label: lang === "tr" ? "Birim" : "Unit", text: unit, kind: "journal" }]
      : [{ label: lang === "tr" ? "Öğretim üyemiz" : "Faculty member", text: `${lang === "tr" ? nt : (TITLE_EN[nt] || nt)} ${p.name}`, kind: "author" }, { label: lang === "tr" ? "Yeni unvan" : "New title", text: lang === "tr" ? { "Doç. Dr.": "Doçent", "Prof. Dr.": "Profesör", "Dr. Öğr. Üyesi": "Doktor Öğretim Üyesi" }[nt] : { "Doç. Dr.": "Associate Professor", "Prof. Dr.": "Professor", "Dr. Öğr. Üyesi": "Assistant Professor" }[nt], kind: "title" }, { label: lang === "tr" ? "Bölüm" : "Department", text: unit, kind: "journal" }];
    const plan = layoutFields(ctx, items, 1010, { titleSize: 60 }); drawFields(ctx, plan, 470, P); await drawPortraits(ctx, [p], P); drawSender(ctx, lang, P); return w;
  },
  body(d, lang) {
    const p = peopleOf(d)[0]; if (!p) return ""; const atama = d.subtype === "atama", nt = d.newTitle || "Doç. Dr.", when = fmtDate(d.date, lang, false), unit = bi(d, "unit", lang) || (lang === "tr" ? p.deptTR : p.deptEN);
    if (lang === "tr") {
      const lead = atama ? `Fakültemiz ${p.deptTR ? p.deptTR + " Bölümü " : ""}öğretim üyesi <strong>${esc(dispTR(p))}</strong>${when ? ", " + when + " tarihi itibarıyla" : ""} ${esc(unit)} <strong>${esc(bi(d, "role", "tr"))}</strong> olarak atanmıştır.`
        : `Fakültemiz ${p.deptTR ? p.deptTR + " Bölümü " : ""}öğretim üyesi <strong>${esc(nt)} ${esc(p.name)}</strong>${when ? ", " + when + " tarihi itibarıyla" : ""} <strong>${{ "Doç. Dr.": "Doçent", "Prof. Dr.": "Profesör", "Dr. Öğr. Üyesi": "Doktor Öğretim Üyesi" }[nt]}</strong> unvanını almıştır.`;
      return H.lead(lead) + H.panel("Hakkında", esc(bi(d, "summary", "tr"))) + H.strong(`Öğretim üyemizi tebrik eder, ${atama ? "yeni görevinde" : "akademik yaşamında"} başarılar dileriz.`);
    }
    const lead = atama ? `<strong>${esc(dispEN(p))}</strong>, a faculty member of ${p.deptEN ? "the Department of " + p.deptEN : "our Faculty"}, has been appointed <strong>${esc(bi(d, "role", "en"))}</strong>${unit ? " of " + esc(unit) : ""}${when ? " as of " + when : ""}.`
      : `<strong>${esc(TITLE_EN[nt] || nt)} ${esc(p.name)}</strong>, a faculty member of ${p.deptEN ? "the Department of " + p.deptEN : "our Faculty"}, has been promoted to <strong>${{ "Doç. Dr.": "Associate Professor", "Prof. Dr.": "Professor", "Dr. Öğr. Üyesi": "Assistant Professor" }[nt]}</strong>${when ? " as of " + when : ""}.`;
    return H.lead(lead) + H.panel("About", esc(bi(d, "summary", "en"))) + H.strong(`We congratulate our faculty member and wish every success in ${atama ? "the new role" : "the years ahead"}.`);
  },
  texts(d) { const t = this.titles(d); return { spotTR: t.tr + ".", spotEN: t.en + ".", mansetAltTR: t.tr, mansetAltEN: t.en, mansetSubTR: d.subtype === "atama" ? bi(d, "role", "tr") : "Akademik yükselme", mansetSubEN: d.subtype === "atama" ? bi(d, "role", "en") : "Academic promotion" }; },
};

/* ---------- 4. Proje desteği ---------- */
TEMPLATES["proje-destegi"] = {
  name: "Proje desteği", section: "haber", manset: true,
  fields: [
    { k: "people", t: "people", l: "Fakülteden ekip (ilk kişi yürütücü, en fazla 3)", max: 3 },
    { k: "leaderExternal", t: "check", l: "Yürütücü fakülte dışından (listedekilerin hepsi araştırmacı)" },
    { k: "funder", t: "text", l: "Destekleyen kurum (TÜBİTAK, TÜSEB, İÜ BAP...)" }, { k: "program", t: "bi", l: "Program (TR / EN), ör. 1001 / 1001 Programme" },
    { k: "projectTitle", t: "bi", l: "Proje adı (TR / EN)" }, { k: "date", t: "date", l: "Kabul tarihi" }, { k: "duration", t: "bi", l: "Süre ve bütçe (isteğe bağlı, TR / EN)" },
    { k: "summary", t: "bitext", l: "Proje hakkında (tek paragraf)" },
  ],
  titles(d) { const ps = peopleOf(d); return { tr: `Proje Desteği: ${joinTR(namesTR(ps))}`, en: `Project Grant: ${joinEN(namesEN(ps))}` }; },
  async draw(ctx, lang, d) {
    const P = drawBg(ctx, "green"), ps = peopleOf(d), w = []; warn(w, !ps.length, "Kişi seçilmedi."); await drawLogoBlock(ctx, lang, lang === "tr" ? "Proje Desteği" : "Project Grant", P);
    const names = lang === "tr" ? namesTR(ps) : namesEN(ps), lead = ps.length && !d.leaderExternal ? names[0] : "", others = ps.length && !d.leaderExternal ? names.slice(1) : names;
    const items = []; if (lead) items.push({ label: lang === "tr" ? "Yürütücü" : "Principal investigator", lines: [lead], kind: "author" }); if (others.length) items.push({ label: lang === "tr" ? (others.length > 1 ? "Araştırmacılar" : "Araştırmacı") : (others.length > 1 ? "Researchers" : "Researcher"), lines: others, kind: "author" });
    items.push({ label: lang === "tr" ? "Destekleyen kurum ve program" : "Funder and programme", text: [d.funder, bi(d, "program", lang)].filter(Boolean).join(", "), kind: "journal" }); items.push({ label: lang === "tr" ? "Proje adı" : "Project title", text: bi(d, "projectTitle", lang), kind: "title" });
    const plan = layoutFields(ctx, items, 1010, { authorSize: ps.length > 1 ? 38 : 44, titleSize: 46 }); drawFields(ctx, plan, 470, P); await drawPortraits(ctx, ps, P); drawSender(ctx, lang, P); return w;
  },
  body(d, lang) {
    const ps = peopleOf(d); if (!ps.length) return ""; const pt = bi(d, "projectTitle", lang), prog = bi(d, "program", lang), when = fmtDate(d.date, lang, false), names = lang === "tr" ? namesTR(ps) : namesEN(ps);
    if (lang === "tr") {
      const lead = d.leaderExternal ? `${whoTR(ps)}${sufGen(names.slice(-1)[0])} araştırmacı olarak yer aldığı <em>"${esc(pt)}"</em> başlıklı proje, ${esc(d.funder)}${prog ? " " + esc(prog) : ""} kapsamında desteklenmeye hak kazanmıştır.`
        : `${whoTR(ps)}${sufGen(names.slice(-1)[0])} ${ps.length > 1 ? "yürütücülüğünü <strong>" + esc(names[0]) + "</strong>'" + h4(lastVowel(names[0])) + "n üstlendiği " : "yürütücülüğünü üstlendiği "}<em>"${esc(pt)}"</em> başlıklı proje, ${esc(d.funder)}${prog ? " " + esc(prog) : ""} kapsamında desteklenmeye hak kazanmıştır.`;
      return H.lead(lead) + H.facts([{ label: "Destekleyen kurum", value: d.funder }, { label: "Program", value: prog }, { label: "Kabul tarihi", value: when }, { label: "Süre ve bütçe", value: bi(d, "duration", "tr") }]) + H.list("Proje ekibi", names.map((n, i) => esc(n) + (!d.leaderExternal && i === 0 ? " (Yürütücü)" : " (Araştırmacı)"))) + H.panel("Proje hakkında", esc(bi(d, "summary", "tr"))) + H.strong(closingTR(ps, "aldıkları" === "x" ? "" : "bu destek"));
    }
    const lead = d.leaderExternal ? `The project entitled <em>"${esc(pt)}"</em>, in which ${whoEN(ps)} take part as researchers, has been awarded funding by ${esc(d.funder)}${prog ? " under the " + esc(prog) : ""}.`
      : `The project entitled <em>"${esc(pt)}"</em>, led by ${whoEN(ps.slice(0, 1))} has been awarded funding by ${esc(d.funder)}${prog ? " under the " + esc(prog) : ""}.`;
    return H.lead(lead) + H.facts([{ label: "Funder", value: d.funder }, { label: "Programme", value: prog }, { label: "Date", value: when }, { label: "Duration and budget", value: bi(d, "duration", "en") }]) + H.list("Project team", names.map((n, i) => esc(n) + (!d.leaderExternal && i === 0 ? " (Principal investigator)" : " (Researcher)"))) + H.panel("About the project", esc(bi(d, "summary", "en"))) + H.strong(closingEN(ps, "this grant"));
  },
  texts(d) { const t = this.titles(d); return { spotTR: `${joinTR(namesTR(peopleOf(d)))}${sufGen(namesTR(peopleOf(d)).slice(-1)[0] || "x")} projesi ${d.funder} tarafından desteklendi.`, spotEN: `The project by ${joinEN(namesEN(peopleOf(d)))} has been funded by ${d.funder}.`, mansetAltTR: t.tr + ", " + d.funder, mansetAltEN: t.en + ", " + d.funder, mansetSubTR: `${d.funder} ${bi(d, "program", "tr")} proje desteği`, mansetSubEN: `${d.funder} ${bi(d, "program", "en")} project grant` }; },
};

/* ---------- 5. Ziyaret ve iş birliği ---------- */
TEMPLATES["ziyaret-isbirligi"] = {
  name: "Ziyaret ve iş birliği", section: "haber", manset: true,
  fields: [
    { k: "subtype", t: "select", l: "Tür", opts: [["gelen", "Fakültemize ziyaret"], ["giden", "Fakültemizden ziyaret"], ["protokol", "İş birliği protokolü"]] },
    { k: "institution", t: "text", l: "Kurum" }, { k: "institutionEN", t: "text", l: "Kurum (İngilizce yazımı farklıysa)" }, { k: "country", t: "bi", l: "Ülke veya şehir (TR / EN, isteğe bağlı)" },
    { k: "date", t: "date", l: "Tarih" }, { k: "topic", t: "bi", l: "Konu (TR / EN), ör. Erasmus+ iş birliği görüşmeleri" },
    { k: "people", t: "people", l: "Fakülteden katılanlar (isteğe bağlı, en fazla 3)", max: 3 },
    { k: "photo", t: "photo", l: "Afiş fotoğrafı (sol taraf)" }, { k: "summary", t: "bitext", l: "Haber metni (tek paragraf, zorunlu)" },
  ],
  titles(d) { const i = d.institution || "", ie = d.institutionEN || i; return d.subtype === "protokol" ? { tr: `${i} ile İş Birliği Protokolü İmzalandı`, en: `Cooperation Protocol Signed with ${ie}` } : d.subtype === "giden" ? { tr: `Fakültemizden ${dat(i)} Ziyaret`, en: `Our Faculty Visits ${ie}` } : { tr: `${i} Heyeti Fakültemizi Ziyaret Etti`, en: `Delegation from ${ie} Visits Our Faculty` }; },
  async draw(ctx, lang, d) {
    const P = drawBg(ctx, "green"), w = []; const ok = await drawPhotoLeft(ctx, d.photo, P); warn(w, !ok, "Afiş fotoğrafı yok."); const i = d.institution || "", ie = d.institutionEN || i, when = fmtDate(d.date, lang, false), topic = bi(d, "topic", lang), ctry = bi(d, "country", lang);
    const ev = lang === "tr" ? [d.subtype === "protokol" ? "İş Birliği Protokolü" : "Ziyaret", [ctry, when].filter(Boolean).join(", ")] : [d.subtype === "protokol" ? "Cooperation Protocol" : "Visit", [ctry, when].filter(Boolean).join(", ")];
    const hl = lang === "tr" ? (d.subtype === "protokol" ? [i, "ile iş birliği protokolü"] : d.subtype === "giden" ? [`Fakültemizden`, `${dat(i)} ziyaret`] : [`${i} heyeti`, "fakültemizi ziyaret etti"]) : (d.subtype === "protokol" ? ["Cooperation protocol", `with ${ie}`] : d.subtype === "giden" ? ["Our Faculty visited", ie] : [`Delegation from ${ie}`, "visited our Faculty"]);
    const plan = layoutCopy(ctx, { event: ev.filter(Boolean), headline: hl, detail: topic ? [{ text: topic }] : [], headlineSize: 84 }); drawCopy(ctx, plan, P); drawSender(ctx, lang, P); return w;
  },
  body(d, lang) {
    const s = bi(d, "summary", lang), ps = peopleOf(d), i = lang === "tr" ? (d.institution || "") : (d.institutionEN || d.institution || ""), when = fmtDate(d.date, lang, false), topic = bi(d, "topic", lang);
    if (lang === "tr") return H.lead(esc(s)) + H.facts([{ label: "Kurum", value: i }, { label: "Tarih", value: when }, { label: "Konu", value: topic }]) + (ps.length ? H.list("Fakültemizden katılanlar", namesTR(ps).map(esc)) : "");
    return H.lead(esc(s)) + H.facts([{ label: "Institution", value: i }, { label: "Date", value: when }, { label: "Topic", value: topic }]) + (ps.length ? H.list("Participants from our Faculty", namesEN(ps).map(esc)) : "");
  },
  texts(d) { const t = this.titles(d); return { spotTR: t.tr + ".", spotEN: t.en + ".", mansetAltTR: t.tr, mansetAltEN: t.en, mansetSubTR: bi(d, "topic", "tr"), mansetSubEN: bi(d, "topic", "en") }; },
};

/* ---------- 6. Dış kurumda konuşma ve eğitim ---------- */
TEMPLATES["dis-konusma"] = {
  name: "Dış kurumda konuşma ve eğitim", section: "haber", manset: true,
  fields: [
    { k: "people", t: "people", l: "Kişi (en fazla 2)", max: 2 },
    { k: "subtype", t: "select", l: "Ne yaptı", opts: [["ders", "Ders / eğitim verdi"], ["konusmaci", "Konuşmacı olarak yer aldı"], ["davetli", "Davetli konuşmacı oldu"], ["panelist", "Panelist olarak yer aldı"]] },
    { k: "institution", t: "text", l: "Kurum (TR yazımı), ör. Anadolu Ajansı" }, { k: "institutionEN", t: "text", l: "Kurum (EN), ör. Anadolu Agency" },
    { k: "event", t: "bi", l: "Etkinlik veya program adı (TR / EN)" }, { k: "talk", t: "bi", l: "Konuşma veya ders başlığı (TR / EN)" }, { k: "venue", t: "bi", l: "Yer (TR / EN)" }, { k: "date", t: "date", l: "Tarih" },
    { k: "photo", t: "photo", l: "Afiş fotoğrafı (sol taraf)" }, { k: "summary", t: "bitext", l: "Konuşmanın içeriği (tek paragraf)" }, { k: "links", t: "links", l: "Paylaşımlar (Instagram, X, haber)" },
  ],
  verbTR(d) { return { ders: "ders verdi", konusmaci: "konuşmacı olarak yer aldı", davetli: "davetli konuşmacı oldu", panelist: "panelist olarak yer aldı" }[d.subtype || "ders"]; },
  verbEN(d) { return { ders: "lectured at", konusmaci: "spoke at", davetli: "was an invited speaker at", panelist: "joined the panel at" }[d.subtype || "ders"]; },
  titles(d) { const ps = peopleOf(d), i = d.institution || "", ie = d.institutionEN || i, ev = bi(d, "event", "tr"), eve = bi(d, "event", "en"); const vt = { ders: "Ders Verdi", konusmaci: "Konuşmacı Olarak Yer Aldı", davetli: "Davetli Konuşmacı Oldu", panelist: "Panelist Olarak Yer Aldı" }[d.subtype || "ders"];
    const ve = { ders: "Delivers a Session at", konusmaci: "Speaks at", davetli: "Invited Speaker at", panelist: "Joins the Panel at" }[d.subtype || "ders"];
    return { tr: `${joinTR(namesTR(ps))}, ${ev ? gen(i).slice(0) + " " + ev : i}${ev ? loc(ev).slice(ev.length) : loc(i).slice(i.length)} ${vt}`, en: `${joinEN(namesEN(ps))} ${ve} ${eve || ie}` }; },
  async draw(ctx, lang, d) {
    const P = drawBg(ctx, "green"), ps = peopleOf(d), w = []; const ok = await drawPhotoLeft(ctx, d.photo, P); warn(w, !ok, "Afiş fotoğrafı yok."); warn(w, !ps.length, "Kişi seçilmedi."); const i = d.institution || "", ie = d.institutionEN || i;
    const hl = lang === "tr" ? [...namesTR(ps), `${loc(i)} ${this.verbTR(d)}`] : [...namesEN(ps), `${this.verbEN(d)} ${ie}`];
    const detail = [bi(d, "talk", lang) ? { text: bi(d, "talk", lang), bold: true } : null, bi(d, "venue", lang) ? { text: bi(d, "venue", lang) } : null].filter(Boolean);
    const plan = layoutCopy(ctx, { event: [bi(d, "event", lang)].filter(Boolean), headline: hl, detail, headlineSize: 72, maxHeadlineLines: 4 }); drawCopy(ctx, plan, P); drawSender(ctx, lang, P); return w;
  },
  body(d, lang) {
    const ps = peopleOf(d), i = lang === "tr" ? (d.institution || "") : (d.institutionEN || d.institution || ""), ev = bi(d, "event", lang), talk = bi(d, "talk", lang), venue = bi(d, "venue", lang), when = fmtDate(d.date, lang, false), links = (d.links || []).filter(l => l.url);
    if (lang === "tr") { const st = d.subtype || "ders", where = venue ? loc(esc(venue)) : loc(esc(i)), talkPart = talk ? `<em>"${esc(talk)}"</em> başlıklı ` : "";
      const lead = st === "ders" ? `${whoTR(ps)}, ${ev ? esc(ev) + " kapsamında " : ""}${talkPart}dersi ${where} verdi.`
        : st === "panelist" ? `${whoTR(ps)}, ${where} düzenlenen ${ev ? esc(ev) + " kapsamındaki " : ""}${talkPart}panelde panelist olarak yer aldı.`
        : `${whoTR(ps)}, ${where} düzenlenen ${ev ? loc(esc(ev)) : "etkinlikte"} ${talkPart}${talk ? "konuşmasıyla " : ""}${st === "davetli" ? "davetli konuşmacı" : "konuşmacı"} olarak yer aldı.`;
      return H.lead(lead) + H.p(esc(bi(d, "summary", "tr"))) + H.facts([{ label: "Kurum", value: i }, { label: "Etkinlik", value: ev }, { label: "Tarih", value: when }]) + (links.length ? H.p("Etkinliğe ilişkin paylaşımlar", 8) + H.btnRow(links.map(l => H.btn2(l.label || "Bağlantı", l.url))) : "") + H.strong(`${kindsTR(ps).pre === "Öğretim üyemiz" ? "Öğretim üyemizi" : "Mensubumuzu"} tebrik eder, çalışmalarında başarılar dileriz.`); }
    const lead = `${whoEN(ps)} ${d.subtype === "ders" ? "delivered" : "gave"} ${talk ? `<em>"${esc(talk)}"</em>` : "a talk"}${ev ? " as part of " + esc(ev) : ""} at ${esc(venue || i)}.`;
    return H.lead(lead) + H.p(esc(bi(d, "summary", "en"))) + H.facts([{ label: "Institution", value: i }, { label: "Event", value: ev }, { label: "Date", value: when }]) + (links.length ? H.p("Posts about the event", 8) + H.btnRow(links.map(l => H.btn2(l.label || "Link", l.url))) : "") + H.strong("We congratulate our faculty member and wish continued success.");
  },
  texts(d) { const t = this.titles(d); return { spotTR: t.tr + ".", spotEN: t.en + ".", mansetAltTR: t.tr, mansetAltEN: t.en, mansetSubTR: bi(d, "event", "tr"), mansetSubEN: bi(d, "event", "en") }; },
};

/* ---------- 7. Etkinlik daveti ---------- */
TEMPLATES["etkinlik"] = {
  name: "Etkinlik daveti", section: "etkinlik", manset: true,
  fields: [
    { k: "series", t: "text", l: "Seri adı ve sayısı (isteğe bağlı), ör. Bilişim Sohbetleri III 4" },
    { k: "title", t: "bi", l: "Etkinlik başlığı (TR / EN)" }, { k: "kind", t: "bi", l: "Tür (TR / EN), ör. Seminer / Seminar" },
    { k: "date", t: "date", l: "Tarih" }, { k: "time", t: "text", l: "Saat, ör. 13.00 - 14.30", short: true }, { k: "place", t: "bi", l: "Yer (TR / EN)" },
    { k: "people", t: "people", l: "Konuşmacılar (en fazla 3, fotoğraf sürükle bırak)", max: 3 },
    { k: "moderator", t: "text", l: "Moderatör (isteğe bağlı)" }, { k: "organizer", t: "bi", l: "Düzenleyen (TR / EN)" },
    { k: "description", t: "bitext", l: "Açıklama (tek paragraf)" }, { k: "links", t: "links", l: "Kayıt ve katılım bağlantıları" }, { k: "poster", t: "photo", l: "Dış poster (galeriye gider, afişe girmez)" },
  ],
  titles(d) { const s = d.series ? d.series + ": " : ""; return { tr: s + bi(d, "title", "tr"), en: s + bi(d, "title", "en") }; },
  async draw(ctx, lang, d) {
    const P = drawBg(ctx, "green"), ps = peopleOf(d), w = []; await drawLogoBlock(ctx, lang, d.series || (lang === "tr" ? "Etkinlik" : "Event"), P);
    const hasPh = ps.filter(p => p.photo).length > 0, wCol = hasPh ? 1010 : 1350;
    const items = [{ label: bi(d, "kind", lang) || (lang === "tr" ? "Etkinlik" : "Event"), text: bi(d, "title", lang), kind: "title" }];
    const names = (lang === "tr" ? namesTR(ps) : namesEN(ps)); if (names.length) items.push({ label: lang === "tr" ? (names.length > 1 ? "Konuşmacılar" : "Konuşmacı") : (names.length > 1 ? "Speakers" : "Speaker"), lines: names, kind: "author" });
    const plan = layoutFields(ctx, items, wCol, { titleSize: 64, authorSize: names.length > 1 ? 34 : 40, maxH: 280 }); const box = drawFields(ctx, plan, 470, P, { shiftY: -40, bottomLimit: 350 });
    const y = Math.max(box.bottom + 34, 360); drawFacts(ctx, [{ label: lang === "tr" ? "Tarih" : "Date", value: fmtDate(d.date, lang) }, { label: lang === "tr" ? "Saat" : "Time", value: d.time }, { label: lang === "tr" ? "Yer" : "Venue", value: bi(d, "place", lang) }], P, 470, y, wCol, 36);
    if (hasPh) await drawPortraits(ctx, ps, P); drawSender(ctx, lang, P); warn(w, !bi(d, "title", lang), "Başlık yok."); warn(w, !d.date, "Tarih yok."); return w;
  },
  body(d, lang) {
    const ps = peopleOf(d), title = bi(d, "title", lang), when = fmtDate(d.date, lang), place = bi(d, "place", lang), org = bi(d, "organizer", lang), links = (d.links || []).filter(l => l.url), kind = bi(d, "kind", lang);
    const spk = (lang === "tr" ? namesTR(ps) : namesEN(ps)).map(esc);
    if (lang === "tr") { const tm = d.time ? (d.time.includes("-") ? `${esc(d.time)} saatleri arasında` : `${esc(d.time)} saatinde`) : "";
      const lead = `${org ? esc(org) + " tarafından düzenlenen " : ""}<strong>${esc(d.series ? d.series + ": " : "")}${esc(title)}</strong> başlıklı ${kind ? esc(kind.toLocaleLowerCase("tr")) : "etkinlik"}${when ? ", " + when + " günü" : ""}${tm ? ", " + tm : ""}${place ? ", " + loc(esc(place)) : ""} gerçekleştirilecektir. Tüm öğrencilerimiz ve akademisyenlerimiz davetlidir.`;
      return H.lead(lead) + H.facts([{ label: "Tarih", value: when }, { label: "Saat", value: d.time }, { label: "Yer", value: place }]) + (spk.length ? H.list(spk.length > 1 ? "Konuşmacılar" : "Konuşmacı", spk.concat(d.moderator ? [`Moderatör: ${esc(d.moderator)}`] : [])) : "") + H.panel("Etkinlik hakkında", esc(bi(d, "description", "tr"))) + H.btnRow(links.map((l, i) => i === 0 ? H.btn(l.label || "Kayıt", l.url) : H.btn2(l.label || "Bağlantı", l.url)), 0); }
    const lead = `<strong>${esc(d.series ? d.series + ": " : "")}${esc(title)}</strong>${org ? ", organised by " + esc(org) + "," : ""} will take place${when ? " on " + when : ""}${d.time ? " at " + esc(d.time) : ""}${place ? " at " + esc(place) : ""}. All students and academic staff are welcome.`;
    return H.lead(lead) + H.facts([{ label: "Date", value: when }, { label: "Time", value: d.time }, { label: "Venue", value: place }]) + (spk.length ? H.list(spk.length > 1 ? "Speakers" : "Speaker", spk.concat(d.moderator ? [`Moderator: ${esc(d.moderator)}`] : [])) : "") + H.panel("About the event", esc(bi(d, "description", "en"))) + H.btnRow(links.map((l, i) => i === 0 ? H.btn(l.label || "Register", l.url) : H.btn2(l.label || "Link", l.url)), 0);
  },
  texts(d) { const t = this.titles(d); return { spotTR: `${t.tr}, ${fmtDate(d.date, "tr")}${d.time ? " " + d.time : ""}${bi(d, "place", "tr") ? ", " + bi(d, "place", "tr") : ""}.`, spotEN: `${t.en}, ${fmtDate(d.date, "en")}${d.time ? " " + d.time : ""}${bi(d, "place", "en") ? ", " + bi(d, "place", "en") : ""}.`, mansetAltTR: `${t.tr}, ${fmtDate(d.date, "tr")}`, mansetAltEN: `${t.en}, ${fmtDate(d.date, "en")}`, mansetSubTR: fmtDate(d.date, "tr"), mansetSubEN: fmtDate(d.date, "en") }; },
};

/* ---------- 8. Öğrenci duyurusu ---------- */
TEMPLATES["ogrenci-duyurusu"] = {
  name: "Öğrenci duyurusu", section: "ogrenci-duyuru", manset: true,
  fields: [
    { k: "subtype", t: "select", l: "Tür", opts: [["sureli", "Süreli bilgi (mülakat, seçme, toplantı: tarih, saat, yer)"], ["donem", "Dönem duyurusu (sınav, ders kaydı, yatay geçiş: tarih aralığı, belge)"]] },
    { k: "mood", t: "select", l: "Afiş rengi", opts: [["green", "Yeşil (varsayılan)"], ["black", "Siyah (olağanüstü durum)"]] },
    { k: "headline", t: "bi", l: "Başlık (TR / EN)" }, { k: "lead", t: "bitext", l: "Duyuru cümlesi (TR / EN)" },
    { k: "date", t: "date", l: "Tarih (başlangıç)" }, { k: "date2", t: "date", l: "Bitiş tarihi (aralıksa)" }, { k: "time", t: "text", l: "Saat", short: true }, { k: "place", t: "bi", l: "Yer (TR / EN)" },
    { k: "deadline", t: "date", l: "Son başvuru tarihi (varsa)" }, { k: "note", t: "bitext", l: "Not (sarı kutu, isteğe bağlı)" }, { k: "links", t: "links", l: "Form ve belge bağlantıları" },
  ],
  titles(d) { return { tr: bi(d, "headline", "tr"), en: bi(d, "headline", "en") }; },
  facts(d, lang) { const tr = lang === "tr"; return d.subtype === "donem" ? [{ label: tr ? "Tarih" : "Dates", value: fmtRange(d.date, d.date2, lang) }, { label: tr ? "Son başvuru" : "Deadline", value: fmtDate(d.deadline, lang, false) }, { label: tr ? "Yer" : "Venue", value: bi(d, "place", lang) }] : [{ label: tr ? "Tarih" : "Date", value: fmtDate(d.date, lang) }, { label: tr ? "Saat" : "Time", value: d.time }, { label: tr ? "Yer" : "Venue", value: bi(d, "place", lang) }]; },
  async draw(ctx, lang, d) {
    const P = drawBg(ctx, d.mood || "green"), w = []; await drawLogoBlock(ctx, lang, lang === "tr" ? "Duyuru" : "Announcement", P);
    const plan = layoutFields(ctx, [{ text: bi(d, "headline", lang), kind: "title" }], 1350, { titleSize: 84, maxH: 260 }); const box = drawFields(ctx, plan, 470, P, { shiftY: -50, bottomLimit: 330 });
    drawFacts(ctx, this.facts(d, lang), P, 470, Math.max(box.bottom + 36, 340), 1350, 40); drawSender(ctx, lang, P); warn(w, !bi(d, "headline", lang), "Başlık yok."); return w;
  },
  body(d, lang) { const links = (d.links || []).filter(l => l.url); return H.lead(esc(bi(d, "lead", lang))) + H.facts(this.facts(d, lang)) + H.note(esc(bi(d, "note", lang))) + H.btnRow(links.map((l, i) => i === 0 ? H.btn(l.label || (lang === "tr" ? "Başvuru formu" : "Application form"), l.url) : H.btn2(l.label || (lang === "tr" ? "Belge" : "Document"), l.url)), 0); },
  texts(d) { const t = this.titles(d), f = this.facts(d, "tr").filter(x => x.value).map(x => x.value).join(", "), fe = this.facts(d, "en").filter(x => x.value).map(x => x.value).join(", "); return { spotTR: `${t.tr}. ${f}.`, spotEN: `${t.en}. ${fe}.`, mansetAltTR: `${t.tr}, ${f}`, mansetAltEN: `${t.en}, ${fe}`, mansetSubTR: f, mansetSubEN: fe }; },
};

/* ---------- 9. Kutlama ve anma ---------- */
TEMPLATES["kutlama"] = {
  name: "Kutlama ve anma (bağlantısız manşet)", section: "manset", manset: true,
  fields: [
    { k: "occasion", t: "select", l: "Gün", opts: OCCASIONS.map(o => [o.id, o.id === "ozel" ? "Özel (aşağıya yaz)" : `${o.tr[0]}, ${o.tr[1]}`]) },
    { k: "year", t: "text", l: "Yıl", short: true }, { k: "date", t: "date", l: "Tarih (bayramlar ve özel gün için)" },
    { k: "custom", t: "bi", l: "Özel gün başlığı (TR / EN)" }, { k: "message", t: "bi", l: "Özel gün mesajı (TR / EN)" },
  ],
  occ(d) { return OCCASIONS.find(o => o.id === (d.occasion || "29ekim")) || OCCASIONS[0]; },
  titles(d) { const o = this.occ(d); const y = d.year ? " " + d.year : ""; return o.id === "ozel" ? { tr: bi(d, "custom", "tr"), en: bi(d, "custom", "en") } : { tr: `${o.tr[0]}${y}, ${o.tr[1]}`, en: `${o.en[0]}${y}, ${o.en[1]}` }; },
  async draw(ctx, lang, d) {
    const o = this.occ(d), P = drawBg(ctx, o.mood || "green"), w = []; const tr = lang === "tr";
    const big = o.id === "ozel" ? bi(d, "custom", lang) : (tr ? o.tr[0] : o.en[0]), msg = o.id === "ozel" ? bi(d, "message", lang) : (tr ? o.tr[1] : o.en[1]);
    await drawLogoBlock(ctx, lang, tr ? (o.mood === "black" ? "Anma" : "Kutlama") : (o.mood === "black" ? "Remembrance" : "Celebration"), P);
    const items = [{ text: big + (d.year && o.id !== "ozel" ? " " + d.year : ""), kind: "title", color: P.gold }, { text: msg, kind: "title" }];
    const plan = layoutFields(ctx, items, 1350, { titleSize: 110, maxH: 400 }); drawFields(ctx, plan, 470, P); drawSender(ctx, lang, P); warn(w, !big, "Gün adı yok."); return w;
  },
  body() { return ""; },
  texts(d) { const t = this.titles(d); return { spotTR: "", spotEN: "", mansetAltTR: t.tr, mansetAltEN: t.en, mansetSubTR: "", mansetSubEN: "" }; },
};
