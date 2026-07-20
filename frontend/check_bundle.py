import httpx
import re

r = httpx.get('https://terralogy-frontend.onrender.com')
html = r.text
match = re.search(r'src="([^"]+\.js)"', html)
if match:
    url = match.group(1)
    js = httpx.get('https://terralogy-frontend.onrender.com' + url).text
    print('Bundle:', len(js), 'bytes')
    checks = {
        'terralogy-api in bundle': 'terralogy-api' in js,
        'localhost:8000 in bundle': 'localhost:8000' in js,
        'VITE_API_URL in bundle': 'VITE_API_URL' in js,
        'fetchJSON in bundle': 'fetchJSON' in js,
    }
    for k, v in checks.items():
        print(f'  {k}: {v}')
    
    if 'terralogy-api' in js:
        idx = js.index('terralogy-api')
        snippet = js[max(0,idx-20):idx+60]
        print('  API URL:', snippet)
else:
    print('No script tag found')
