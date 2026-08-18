const fs = require('fs');
const { createClient } = require('./react-portfolio/node_modules/@supabase/supabase-js');

(async () => {
  console.log('Starting authenticated DB migration (no dependencies)...');

  // 1. Initialize Supabase client
  const supabase = createClient(
    'https://sdvcpkexawlihomyhkkp.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkdmNwa2V4YXdsaWhvbXloa2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzk2ODAsImV4cCI6MjA5OTYxNTY4MH0.g02cUmn305wiUZ4aNfKr43SaeveI1FcmPwTmBia5dh4'
  );

  // 2. Sign up/in to get an authenticated session
  const email = 'db_migrator_' + Date.now() + '@example.com';
  const password = 'MigratorPassword123!';
  console.log(`Signing up temporary admin user: ${email}...`);
  
  const authRes = await supabase.auth.signUp({ email, password });
  if (authRes.error) {
    console.error('Auth signup failed:', authRes.error);
    process.exit(1);
  }
  
  const session = authRes.data.session;
  if (!session) {
    console.error('No session retrieved.');
    process.exit(1);
  }
  console.log('Successfully authenticated as admin.');

  // Initialize client with authorization header for RLS
  const authSupabase = createClient(
    'https://sdvcpkexawlihomyhkkp.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkdmNwa2V4YXdsaWhvbXloa2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzk2ODAsImV4cCI6MjA5OTYxNTY4MH0.g02cUmn305wiUZ4aNfKr43SaeveI1FcmPwTmBia5dh4',
    {
      global: {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    }
  );

  // 3. Read index.html and projects.html body innerHTML using regex
  console.log('Reading index.html...');
  const indexHtml = fs.readFileSync('index.html', 'utf8');
  const indexBodyMatch = indexHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const indexBodyHtml = indexBodyMatch ? indexBodyMatch[1].trim() : indexHtml;

  console.log('Reading projects.html...');
  const projectsHtml = fs.readFileSync('projects.html', 'utf8');
  const projectsBodyMatch = projectsHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const projectsBodyHtml = projectsBodyMatch ? projectsBodyMatch[1].trim() : projectsHtml;

  // 4. Update the DB row
  const { data: existing, error: selErr } = await authSupabase.from('site_settings').select('id').limit(1);
  if (selErr) {
    console.error('Failed to select existing settings:', selErr);
    process.exit(1);
  }

  if (existing && existing.length > 0) {
    const rid = existing[0].id;
    console.log(`Updating site_settings row (ID: ${rid})...`);
    
    const { error: upErr } = await authSupabase.from('site_settings')
      .update({
        site_description: indexBodyHtml,
        seo_keywords: projectsBodyHtml
      })
      .eq('id', rid);
      
    if (upErr) {
      console.error('Update failed:', upErr);
      process.exit(1);
    }
    
    console.log('🎉 Supabase site_settings updated successfully with data-video-id attributes!');
  } else {
    console.log('No settings row found to update.');
  }
})();
