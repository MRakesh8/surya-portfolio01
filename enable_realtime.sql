-- =====================================================
-- Scrollz CMS — Enable Supabase Realtime on site_settings
-- Run this ONE TIME in your Supabase Dashboard:
--   SQL Editor → paste this → Run
-- =====================================================

-- Step 1: Allow Supabase Realtime to capture full row diffs
ALTER TABLE site_settings REPLICA IDENTITY FULL;

-- Step 2: Add site_settings to the Supabase realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE site_settings;

-- Optional: verify the table is now in the publication
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
