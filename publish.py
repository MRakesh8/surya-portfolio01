import urllib.request
import json
import re
import sys

# Supabase Credentials
SUPABASE_URL = 'https://sdvcpkexawlihomyhkkp.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkdmNwa2V4YXdsaWhvbXloa2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzk2ODAsImV4cCI6MjA5OTYxNTY4MH0.g02cUmn305wiUZ4aNfKr43SaeveI1FcmPwTmBia5dh4'

def extract_body_content(file_path):
    print(f"Reading {file_path}...")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            html = f.read()
        
        # Regex to capture the contents inside <body>...</body>
        match = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL | re.IGNORECASE)
        if match:
            body_content = match.group(1).strip()
            print(f"Successfully extracted {len(body_content)} bytes of body content from {file_path}")
            return body_content
        else:
            print(f"WARNING: Could not find <body> tags in {file_path}. Using entire file content.")
            return html.strip()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        sys.exit(1)

def publish_to_supabase():
    # Extract contents
    index_body = extract_body_content('index.html')
    projects_body = extract_body_content('projects.html')
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    # 1. Check if there are any existing settings rows
    print("Checking for existing site_settings row in Supabase...")
    select_req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/site_settings?select=id",
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}"
        }
    )
    
    existing_row_id = None
    try:
        with urllib.request.urlopen(select_req) as response:
            data = json.loads(response.read().decode())
            if data and len(data) > 0:
                existing_row_id = data[0]['id']
                print(f"Found existing row with ID: {existing_row_id}")
    except Exception as e:
        print("Error checking database:", e)
        sys.exit(1)
        
    # 2. Update or Insert
    payload = {
        "site_description": index_body, # Stores homepage body HTML
        "seo_keywords": projects_body    # Stores projects page body HTML
    }
    
    data_json = json.dumps(payload).encode('utf-8')
    
    if existing_row_id:
        print(f"Performing UPDATE for ID {existing_row_id}...")
        url = f"{SUPABASE_URL}/rest/v1/site_settings?id=eq.{existing_row_id}"
        req = urllib.request.Request(
            url,
            data=data_json,
            headers=headers,
            method='PATCH'
        )
    else:
        print("Performing INSERT...")
        url = f"{SUPABASE_URL}/rest/v1/site_settings"
        req = urllib.request.Request(
            url,
            data=data_json,
            headers=headers,
            method='POST'
        )
        
    try:
        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode()
            print("Successfully published website to Supabase CMS!")
            print("Live website updated in database.")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode()}")
        sys.exit(1)
    except Exception as e:
        print("Failed to publish content:", e)
        sys.exit(1)

if __name__ == '__main__':
    publish_to_supabase()
