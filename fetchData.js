// This script fetches data from your Supabase CMS and updates the live website.

const SUPABASE_URL = 'https://sdvcpkexawlihomyhkkp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkdmNwa2V4YXdsaWhvbXloa2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzk2ODAsImV4cCI6MjA5OTYxNTY4MH0.g02cUmn305wiUZ4aNfKr43SaeveI1FcmPwTmBia5dh4';

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const urlParams = new URLSearchParams(window.location.search);
const isAdmin = urlParams.get('admin') === 'true';

async function loadCMSContent() {
  if (isAdmin) {
    // If in Admin builder mode, don't override the body on load to prevent flickering
    return;
  }

  try {
    const isProjectsPage = window.location.pathname.includes('projects.html');
    const columnName = isProjectsPage ? 'seo_keywords' : 'site_description';

    const { data, error } = await client
      .from('site_settings')
      .select(columnName)
      .limit(1);
      
    if (error) throw error;
    
    if (data && data.length > 0 && data[0][columnName]) {
      const savedHTML = data[0][columnName];
      // Only replace if it actually contains HTML (basic check)
      if (savedHTML.includes('<section') || savedHTML.includes('<div')) {
         document.body.innerHTML = savedHTML;
         
         // Re-initialize page-specific event listeners that were wiped by innerHTML replacement
         if (isProjectsPage) {
           if (typeof window.initProjectsPage === 'function') {
             window.initProjectsPage();
           }
         } else {
           if (typeof window.initHomePage === 'function') {
             window.initHomePage();
           }
         }
         
      }
    }
  } catch (err) {
    console.error("Error loading CMS content:", err);
  }
}

// Load content when the DOM is ready
document.addEventListener('DOMContentLoaded', loadCMSContent);
