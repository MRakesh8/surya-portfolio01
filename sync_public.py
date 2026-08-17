import shutil
import os

files = [
    ('index.html', 'react-portfolio/public/home.html'),
    ('projects.html', 'react-portfolio/public/projects.html'),
    ('style.css', 'react-portfolio/public/style.css'),
    ('index.css', 'react-portfolio/public/index.css'),
    ('index.js', 'react-portfolio/public/index.js'),
    ('fetchData.js', 'react-portfolio/public/fetchData.js'),
    ('video-manager.js', 'react-portfolio/public/video-manager.js'),
    ('visual-editor.js', 'react-portfolio/public/visual-editor.js')
]

for src, dest in files:
    if os.path.exists(src):
        shutil.copy2(src, dest)
        print(f"Synced {src} -> {dest}")
