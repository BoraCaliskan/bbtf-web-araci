# shell.html + core.js + templates.js + ui.js + kadro.js + assets.json -> "BBTF İçerik Aracı.html"
import json, pathlib, re
P = pathlib.Path(__file__).parent
a = json.loads((P/'assets.json').read_text())
s = (P/'shell.html').read_text(encoding='utf-8')
for k, v in a.items(): s = s.replace('{{'+k+'}}', v)
core = (P/'core.js').read_text(encoding='utf-8')
for k, v in a.items(): core = core.replace('{{'+k+'}}', v)
s = s.replace('{{KADRO_JS}}', (P/'kadro.js').read_text(encoding='utf-8')).replace('{{CORE_JS}}', core).replace('{{TEMPLATES_JS}}', (P/'templates.js').read_text(encoding='utf-8')).replace('{{UI_JS}}', (P/'ui.js').read_text(encoding='utf-8'))
assert not re.search(r'\{\{(FONT_|LOGO_|KADRO_JS|CORE_JS|TEMPLATES_JS|UI_JS)', s), 'placeholder kaldı'
out = P/'BBTF İçerik Aracı.html'; out.write_text(s, encoding='utf-8'); print('built', round(out.stat().st_size/1024), 'KB')
