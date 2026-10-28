export const meta = {
  name: 'alt-metin-2',
  description: 'Alt text drafting and independent review for CMS library images, split into parallel runs',
  phases: [
    { title: 'Taslak', detail: 'writer per batch (only batches without a finished draft)' },
    { title: 'Kontrol', detail: 'independent reviewer re-checks every image of the batch' },
  ],
}

const RULES = `You write alt texts (text alternatives read by screen readers) for images in the CMS media library of İstanbul Üniversitesi Bilgisayar ve Bilişim Teknolojileri Fakültesi (faculty websites in Turkish and English) and its TÜBİTAK 2237-A training website. Each alt text is saved on the image in the library.

LANGUAGE
- Write in the item's targetLang: tr = Turkish, en = English. Turkish text uses correct Turkish letters (ç ğ ı İ ö ş ü, and â where the source writes it, as in Zekâ).
- When the image's text is in the other language, write the alt in targetLang but keep event titles and proper names as written (in an English alt you may add a short English translation of a Turkish title in parentheses).
- In English alts write the university and faculty names and the main campus venues in their English forms: Istanbul University, Faculty of Computer and Information Technologies, Rectorate Building, Blue Hall (for Mavi Salon). Other venues, organisations and event titles stay as written, with an optional English translation in parentheses.

WHAT TO DESCRIBE
- Posters, banners, cards, announcements (images whose main content is text): begin with the kind, then the key text. Turkish: "Etkinlik afişi: <başlık>, <tarih ve gün>, <saat>, <yer>, <konuşmacı ünvanı ve adı>". English: "Event poster: ..." or "... banner: ...". Kinds: Etkinlik, Seminer, Söyleşi, Konferans, Eğitim, Yarışma, Duyuru, Kutlama, Anma, Tebrik, Başsağlığı, Program, Bilgilendirme, Tanıtım (EN: Event, Seminar, Talk, Conference, Training, Competition, Announcement, Celebration, Commemoration, Congratulation, Condolence, Programme, Information, Promotion). Copy the main title faithfully, in normal capitalization (not ALL CAPS). Include date, day, time, place and named speakers when shown. Leave out logo lists, QR codes, social media handles and long web addresses (a short registration site may stay). For dense posters keep the most important facts within the length limit.
- Photos: what is happening, who in terms of role or group (konuşmacı, öğrenciler, öğretim üyeleri, katılımcılar, ödül alan öğrenci / speaker, students, faculty members, participants), and where when it is clear (sınıf, konferans salonu, laboratuvar, kampüs, sahne). Mention clearly readable text that matters (slide title, banner, sign). When the record context says which event the photo is from, name the event (for example "Bilişim Söyleşileri'nde ..." / "... at Informatics Talks").
- Screenshots, logos, charts, certificates, icons: say what it is and its key readable content.
- Images not used in any record (usage empty): describe only what you see. Do not invent an event, date, place or person.
- Prefer meaning over decoration. Mention colors or layout only when they carry meaning.

PEOPLE
- Never identify anyone from their face or appearance. Name a person only when (a) the name is printed in the image for that person, or (b) the record context makes it unambiguous, e.g. a talk with a single named guest speaker and the photo shows one person presenting at the podium or screen. In group photos never assign names to individuals. You may name the occasion instead ("Prof. Dr. X'in konuşmasından bir an").
- Only exception, for iconic historical portraits: on national day and commemoration visuals the portrait of Mustafa Kemal Atatürk may be named (Atatürk portresi / portrait of Atatürk), and on Conquest of Istanbul anniversary visuals a historical portrait of Fatih Sultan Mehmet may be named. The exception covers only these two historical figures.
- Academic titles (ünvan) must stay exactly as given in the image or the record (Prof. Dr., Doç. Dr., Dr. Öğr. Üyesi, Öğr. Gör., Arş. Gör., Assoc. Prof. Dr., Asst. Prof. Dr., Res. Asst. ...). Never change, upgrade, downgrade, drop or invent a title. A poster's title is historical, keep it even if the person holds another title today. In an English alt, if the record gives the English form use it, otherwise translate only the form: Prof. Dr. = Prof. Dr., Doç. Dr. = Assoc. Prof. Dr., Dr. Öğr. Üyesi = Asst. Prof. Dr., Öğr. Gör. = Lecturer, Arş. Gör. = Res. Asst., Arş. Gör. Dr. = Res. Asst. Dr.
- Never use informal words such as "hoca", "hocamız", "hocanın", "Hoja", or nicknames. Use title and full name, or a role.
- Do not describe or guess race, religion, health, age or other personal attributes. Mention clothing only when it carries meaning (graduation gowns, team shirts).

FORM
- Target 60-200 characters, hard maximum 250. Simple images such as a logo may be shorter.
- No semicolons, no em dashes and no en dashes. Use commas and periods. Ranges use a plain hyphen: 2-6 Kasım 2026, 09.00-14.00.
- Do not begin with "Görsel:", "Resim:", "Fotoğraf:", "Bu görselde", "Image of", "Picture of", "Photo of". Kind prefixes like "Etkinlik afişi:" are fine.
- No double quotes, no < or >, no line breaks, no emoji, no hashtags. Apostrophes are fine (Anadolu Ajansı'nın).
- No file-name-like text (medicon-2026-afis), no pixel sizes, no CMS jargon (manşet, slider, kapak).
- No period at the very end. Several sentences are fine.
- Do not pad with the faculty name. Mention İstanbul Üniversitesi Bilgisayar ve Bilişim Teknolojileri Fakültesi only when it is printed on a poster as the organizer and there is room.

EXISTING ALT (currentAlt)
- keep: currentAlt is accurate for this image, in targetLang, describes the image, and follows every rule above. Return it unchanged.
- rewrite: currentAlt is empty, a file name, generic (Teknofest, Afiş, Tanıtım posteri, Group Photo of Meeting), only a record title without describing the image, a congratulation or news sentence instead of a description, informal, in the wrong language, factually wrong, longer than 250 characters, or breaks a form rule. Reuse its correct facts.

EXAMPLES
- tr, wide training banner: Eğitim afişi: Akıllı Gelecek: Yapay Zekâ ve Sürdürülebilirlik Eğitimi, çevrimiçi, 2-6 Şubat 2026. Eğitim koordinatörü Dr. Öğr. Üyesi Hatice Nizam Özoğur, kayıt için bbtfevents.istanbul.edu.tr
- tr, event poster whose old alt "İstanbul Üniversitesi Bilgisayar ve Bilişim Teknolojileri Fakültesi Ardışık Uyum Günleri" was too generic: Etkinlik afişi: 2026-2027 Akademik Yılı Ardışık Uyum Günleri başlıyor, 24 Eylül 2026 Perşembe, 09.00-14.00, Mavi Salon
- tr, unused photo with no context: Makam masasında oturan takım elbiseli bir kişi, arkasında İstanbul Üniversitesi bayrağı ve Türk bayrağı
- en, gallery photo of the record "Prof. Dr. Latifur Khan Hosted at Informatics Talks": Prof. Dr. Latifur Khan presenting at Informatics Talks, with a slide titled Motivation on responsible machine learning and the audience seated in the foreground
- en, celebration banner: Celebration banner: 29 October 2026, Republic Day. Istanbul University Faculty of Computer and Information Technologies
- tr, notice banner: Duyuru afişi: 2026-2027 Akademik Yılı Güz Dönemi Ara Sınavları Başlıyor, tarih 2-6 Kasım 2026`

const FORMAT = `The batch file is a JSON list. Each item has: id (library image id), site (tr = Turkish faculty site, en = English faculty site, tubitak = TÜBİTAK 2237-A training site in Turkish), targetLang (language of the alt text), image (local JPEG path, longest side at most 1280 px), currentAlt (alt text saved today, may be empty), usage (up to 4 records that use the image: lang, type = haber news / duyuru notice / ogrenci-duyuru student notice / etkinlik event / slider homepage banner, role = kapak cover / galeri gallery / gövde inline body image, status, date, title, first 300 characters of the record body), usedInRecords (number of records using it; 0 = not used in news, notices, events or banners, though it may appear on a static page).`

const DRAFT = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          decision: { type: 'string', enum: ['keep', 'rewrite'] },
          alt: { type: 'string', description: 'final alt text, also for keep' },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
          basis: { type: 'string', description: 'short: poster text / record context + photo / visual only' },
          note: { type: 'string', description: 'optional: what the reviewer should double-check' },
        },
        required: ['id', 'decision', 'alt', 'confidence'],
      },
    },
  },
  required: ['items'],
}

const VERIFY = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          verdict: { type: 'string', enum: ['approve', 'fix'] },
          alt: { type: 'string', description: 'final alt text (unchanged draft when approve)' },
          issue: { type: 'string', description: 'short reason for a fix, in English' },
        },
        required: ['id', 'verdict', 'alt'],
      },
    },
  },
  required: ['items'],
}

const dir = args.dir, draftDir = args.draftDir
const batches = args.batches.map(([n, count, mode]) => ({ n, count, mode, path: dir + '\\' + n + '.json', draftPath: draftDir + '\\' + n + '.json' }))

const draftPrompt = b => `${RULES}

TASK
Batch file: ${b.path} (${b.count} images). Read it with the Read tool. ${FORMAT}

For every item, open the image file with the Read tool and look at it carefully. Small poster text matters: names, academic titles, dates, days, times, rooms. Then decide keep or rewrite and give the final alt text. Work through the items in order, do not skip any and do not stop early. Your output must contain every id from the batch file exactly once. Do not write or edit any files.

Return items with: id, decision, alt (the full alt text, also for keep), confidence (low when the image is hard to read or the context is unclear), basis, note (optional, what a reviewer should double-check).`

const verifyPrompt = (b, draft) => {
  const src = b.mode === 'verify'
    ? `A first writer produced drafts, stored as a JSON list (id, decision, alt, confidence, basis, note) in ${b.draftPath}. Read that file with the Read tool.`
    : draft ? 'A first writer produced the drafts listed at the end of this message.' : 'There are no drafts for this batch, write every alt yourself (verdict fix, issue "missing draft").'
  return `${RULES}

TASK
You are the independent reviewer. Batch file: ${b.path} (${b.count} images). Read it with the Read tool. ${FORMAT}

${src} For EVERY item in the batch file open the image with the Read tool, then check the draft against the image, the record context and every rule above. Be strict and skeptical:
- every transcribed title, date, day, time, place, name and academic title must match the image or the record exactly, Turkish letters included,
- nobody may be named without a basis in visible text or unambiguous record context (apart from the Atatürk and Fatih Sultan Mehmet portrait exception), and no academic title may be changed,
- the alt must describe this image (not only repeat the record title), be in targetLang, at most 250 characters, with no semicolon, no em or en dash, no double quote, no informal word, no forbidden opening and no final period,
- in English alts the university, faculty and main venue names use their English forms,
- a keep must really meet every rule, otherwise fix it.
If the draft is good, verdict approve and return the alt unchanged. Otherwise verdict fix, return your corrected alt and a short issue in English. If an id has no draft, write the alt yourself (verdict fix, issue "missing draft").
Your output must contain every id from the batch file exactly once. Do not write or edit any files.${b.mode !== 'verify' && draft ? '\n\nDrafts (JSON):\n' + JSON.stringify(draft.items) : ''}`
}

const results = await pipeline(
  batches,
  b => b.mode === 'verify' ? { fromFile: true } : agent(draftPrompt(b), { label: 'taslak ' + b.n, phase: 'Taslak', schema: DRAFT }),
  (draft, b) => agent(verifyPrompt(b, draft), { label: 'kontrol ' + b.n, phase: 'Kontrol', schema: VERIFY })
    .then(v => ({ n: b.n, drafted: draft && draft.items ? draft.items.length : null, verified: v && v.items ? v.items.length : 0,
      fixes: v && v.items ? v.items.filter(x => x.verdict === 'fix').length : 0 })),
)
log('done: ' + JSON.stringify(results))
return results
