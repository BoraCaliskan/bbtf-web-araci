# src.html + assets.json -> "BBTF Yayın Afişi.html". Değişiklik yapınca bunu çalıştır: python build.py
import json, pathlib
a = json.loads(pathlib.Path('assets.json').read_text())
s = pathlib.Path('src.html').read_text(encoding='utf-8')
for k, v in a.items(): s = s.replace('{{'+k+'}}', v)
assert '{{' not in s
pathlib.Path('../BBTF Yayın Afişi.html').write_text(s, encoding='utf-8'); print('ok')
