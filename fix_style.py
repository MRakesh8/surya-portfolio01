import re
with open('projects.html', 'r', encoding='utf-8') as f:
    content = f.read()

# remove the orphaned style block completely
content = re.sub(r'<style>\s*\[id\*="framer-editor"\].*?</style>', '', content, flags=re.DOTALL)

with open('projects.html', 'w', encoding='utf-8') as f:
    f.write(content)
