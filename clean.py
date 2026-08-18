import re
import os

files = ['index.html', 'projects.html']

for file in files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace framer init script
        target = '<script>try{if(localStorage.getItem("__framer_force_showing_editorbar_since")){const n=document.createElement("link");n.rel = "modulepreload";n.href="https://framer.com/edit/init.mjs";document.head.appendChild(n)}}catch(e){}</script>'
        replacement = '<script>try { localStorage.removeItem("__framer_force_showing_editorbar_since"); localStorage.removeItem("__framer-badge"); } catch (e) {}</script>'
        content = content.replace(target, replacement)
        
        # Add a much more aggressive CSS hiding rule at the end of head
        css = """
        <style>
            [id*="framer-editor"], [id*="framer-badge"], [class*="framer-badge"], 
            [id*="vercel-toolbar"], [class*="vercel-toolbar"], vercel-live-feedback,
            .sanity-visual-editing, [data-sanity], #sanity-visual-editing,
            [data-vercel-edit-button], a[href*="framer.com/projects"],
            div[style*="z-index: 2147483647"], div[id^="framer-"] { 
                display: none !important; 
                opacity: 0 !important; 
                visibility: hidden !important; 
                pointer-events: none !important; 
                z-index: -9999 !important; 
                width: 0 !important;
                height: 0 !important;
            }
        </style>
        """
        content = content.replace('<!-- End of headStart -->', '<!-- End of headStart -->\n' + css)
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)

print("Done")
