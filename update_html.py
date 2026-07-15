import re

with open('d:/Project/Surya_portfolio_new/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove .hero-content
content = re.sub(r'<div class="hero-content fade-up">.*?</div>\s*(?=<!-- Phone Gallery)', '', content, flags=re.DOTALL)

# Remove .footage-row
content = re.sub(r'<!-- Raw Footage → Surya\'s Edit Arrow -->.*?(?=</section>)', '', content, flags=re.DOTALL)

# Extract phones
phones_match = re.search(r'(<div class="phone-gallery-inner">)(.*?)(</div>\s*</div>)', content, re.DOTALL)
if phones_match:
    inner_start = phones_match.group(1)
    phones = phones_match.group(2)
    # Duplicate phones for marquee effect
    new_phones = phones + phones + phones + phones  # Make it long enough
    content = content[:phones_match.start(2)] + new_phones + content[phones_match.end(2):]
else:
    print("Could not find phone gallery inner")

with open('d:/Project/Surya_portfolio_new/index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated HTML.")
