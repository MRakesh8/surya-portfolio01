from bs4 import BeautifulSoup

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

soup = BeautifulSoup(content, 'html.parser')

# Find CSS classes used in the page
blocked = []
for el in soup.find_all(style=True):
    style = el.get('style', '')
    if 'pointer-events' in style and 'none' in style:
        tag = el.name
        cls = str(el.get('class', ''))[:40]
        blocked.append(tag + ' ' + cls)

print('Elements with pointer-events:none: ' + str(len(blocked)))
for b in blocked[:10]:
    print('  ' + b)

print()
no_select = []
for el in soup.find_all(style=True):
    style = el.get('style', '')
    if 'user-select' in style and 'none' in style:
        tag = el.name
        no_select.append(tag)

print('Elements with user-select:none: ' + str(len(no_select)))

# Check index.css for pointer-events:none rules
print()
print('=== Checking index.css for pointer-events:none ===')
with open('index.css', 'r', encoding='utf-8') as f:
    css = f.read()

import re
matches = re.findall(r'([^}]+\{[^}]*pointer-events\s*:\s*none[^}]*\})', css)
print('CSS rules with pointer-events:none: ' + str(len(matches)))
for m in matches[:5]:
    print('  ' + m[:100].strip())
