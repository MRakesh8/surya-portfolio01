import re

with open('d:/Project/Surya_portfolio_new/index.css', 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Update .hero section padding and alignment
css = re.sub(
    r'\.hero \{\s*min-height: 100vh;\s*padding: 160px 32px 80px;\s*display: flex;\s*flex-direction: column;\s*align-items: center;\s*text-align: center;\s*position: relative;\s*overflow: hidden;\s*\}',
    '.hero {\n  min-height: 100vh;\n  padding: 120px 0 0;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: flex-start;\n  text-align: center;\n  position: relative;\n  overflow: hidden;\n}',
    css
)

# 2. Add animation to .phone-gallery-inner
css = re.sub(
    r'\.phone-gallery-inner \{\s*display: flex;\s*align-items: flex-end;\s*justify-content: center;\s*gap: 14px;\s*padding: 24px 60px 30px;\s*\}',
    '.phone-gallery-inner {\n  display: flex;\n  align-items: center;\n  justify-content: flex-start;\n  gap: 24px;\n  padding: 24px 0 30px;\n  width: max-content;\n  animation: scrollPhones 30s linear infinite;\n}\n\n@keyframes scrollPhones {\n  from { transform: translateX(0); }\n  to { transform: translateX(-50%); }\n}\n\n.phone-gallery-wrap:hover .phone-gallery-inner {\n  animation-play-state: paused;\n}',
    css
)

# 3. Update .pg-frame sizing and transform (remove scale 0.88, make bigger)
css = re.sub(
    r'\.pg-frame \{\s*width: 200px;\s*background: #0c0c0c;\s*border-radius: 38px;\s*padding: 10px;\s*border: 1\.5px solid rgba\(255,255,255,0\.1\);\s*box-shadow:(.*?);\s*transform: scale\(0\.88\);\s*transition: transform 0\.35s cubic-bezier\(0\.34,1\.56,0\.64,1\), box-shadow 0\.3s;\s*\}',
    '.pg-frame {\n  width: 320px;\n  background: #0c0c0c;\n  border-radius: 38px;\n  padding: 10px;\n  border: 1.5px solid rgba(255,255,255,0.1);\n  box-shadow:\\1;\n  transform: none;\n  transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;\n}',
    css,
    flags=re.DOTALL
)

css = re.sub(
    r'\.pg-frame:hover \{\s*transform: scale\(0\.92\) translateY\(-6px\);\s*box-shadow: 0 32px 80px rgba\(0,0,0,0\.85\), inset 0 0 0 1px rgba\(255,255,255,0\.07\);\s*\}',
    '.pg-frame:hover {\n  transform: scale(1.02) translateY(-6px);\n  box-shadow: 0 32px 80px rgba(0,0,0,0.85), inset 0 0 0 1px rgba(255,255,255,0.07);\n}',
    css
)

css = re.sub(
    r'\.pg-frame-featured \{\s*width: 220px;\s*transform: scale\(1\);\s*border-color: rgba\(121,50,236,0\.45\);\s*box-shadow:(.*?);\s*\}',
    '.pg-frame-featured {\n  width: 320px;\n  transform: none;\n  border-color: rgba(121,50,236,0.45);\n  box-shadow:\\1;\n}',
    css,
    flags=re.DOTALL
)

css = re.sub(
    r'\.pg-frame-featured:hover \{\s*transform: scale\(1\.03\) translateY\(-8px\);\s*box-shadow: 0 40px 100px rgba\(121,50,236,0\.38\), inset 0 0 0 1px rgba\(121,50,236,0\.3\);\s*\}',
    '.pg-frame-featured:hover {\n  transform: scale(1.02) translateY(-8px);\n  box-shadow: 0 40px 100px rgba(121,50,236,0.38), inset 0 0 0 1px rgba(121,50,236,0.3);\n}',
    css
)

# 4. Background gradient
# The background is already var(--bg) which is #000, and .hero-glow gives the purple tint.
# I will make .hero-glow larger to match the video.
css = re.sub(
    r'\.hero-glow \{\s*position: absolute;\s*bottom: -20%;\s*left: 50%;\s*transform: translateX\(-50%\);\s*width: 900px; height: 700px;\s*background: radial-gradient\(58% 50% at 50% 100%, var\(--purple\) 0%, transparent 100%\);\s*pointer-events: none; z-index: 0; opacity: 0\.5;\s*transition: transform 0\.2s ease-out;\s*\}',
    '.hero-glow {\n  position: absolute;\n  bottom: -10%;\n  left: 50%;\n  transform: translateX(-50%);\n  width: 1200px; height: 900px;\n  background: radial-gradient(50% 50% at 50% 50%, rgba(121,50,236,0.2) 0%, transparent 100%);\n  pointer-events: none; z-index: 0; opacity: 0.8;\n  transition: transform 0.2s ease-out;\n}',
    css
)

with open('d:/Project/Surya_portfolio_new/index.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("CSS updated.")
