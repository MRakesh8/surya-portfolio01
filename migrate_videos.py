import json
from bs4 import BeautifulSoup
from supabase import create_client, Client

SUPABASE_URL = 'https://sdvcpkexawlihomyhkkp.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkdmNwa2V4YXdsaWhvbXloa2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzk2ODAsImV4cCI6MjA5OTYxNTY4MH0.g02cUmn305wiUZ4aNfKr43SaeveI1FcmPwTmBia5dh4'

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

EXCLUDED_NAMES = [
    'desktop', 'tablet', 'mobile', 
    'mobile edited', 'mobile raw', 
    'edited', 'raw', 
    'default', 'primary', 'variant 2', 'variant 1'
]

def get_logical_path(node, root_node):
    path = []
    current = node
    while current and current != root_node and current.name != 'body':
        framer_name = current.get('data-framer-name')
        if framer_name:
            lower_name = framer_name.lower().strip()
            if lower_name not in EXCLUDED_NAMES:
                path.append(framer_name)
        current = current.parent
    path.reverse()
    return ' > '.join(path)

global_vid_counter = 1
vid_map = {}

def process_html(html_str):
    global global_vid_counter, vid_map
    if not html_str: return html_str
    
    soup = BeautifulSoup(html_str, 'html.parser')
    videos = soup.find_all('video')
    
    for vid in videos:
        if vid.get('data-video-id'):
            continue
            
        current = vid
        logical_container = None
        variant_name = 'default'
        
        while current and current.name != 'body':
            framer_name = current.get('data-framer-name')
            if framer_name:
                lower_name = framer_name.lower()
                if lower_name in ['desktop', 'tablet', 'mobile']:
                    variant_name = lower_name
                    logical_container = current.parent
                    break
            current = current.parent
            
        if not logical_container:
            logical_container = vid
            
        logical_path = get_logical_path(vid, logical_container)
        container_path = get_logical_path(logical_container, soup.body)
        
        base_identity = container_path + '|' + logical_path
        
        if base_identity not in vid_map:
            vid_id = f"VID-{global_vid_counter:03d}"
            global_vid_counter += 1
            vid_map[base_identity] = vid_id
        
        assigned_vid = vid_map[base_identity]
        vid['data-video-id'] = assigned_vid
        
    return str(soup)

def main():
    res = supabase.table('site_settings').select('*').execute()
    if not res.data:
        print("No DB records.")
        return
        
    row = res.data[0]
    rid = row['id']
    
    site_desc = row.get('site_description', '')
    seo_keys = row.get('seo_keywords', '')
    
    new_desc = process_html(site_desc)
    new_keys = process_html(seo_keys)
    
    print("Mapped VIDs:", json.dumps(vid_map, indent=2))
    
    supabase.table('site_settings').update({
        'site_description': new_desc,
        'seo_keywords': new_keys
    }).eq('id', rid).execute()
    
    print("Supabase DB updated.")
    
    for fname in ['index.html', 'projects.html']:
        try:
            with open(fname, 'r', encoding='utf-8') as f:
                content = f.read()
            new_content = process_html(content)
            with open(fname, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {fname}")
        except Exception as e:
            print(f"Error reading {fname}: {e}")

if __name__ == '__main__':
    main()
