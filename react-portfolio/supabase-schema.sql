-- Supabase Schema for Portfolio CMS

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Site Settings Table
create table site_settings (
  id uuid primary key default uuid_generate_v4(),
  site_title text,
  site_description text,
  seo_keywords text,
  contact_email text,
  contact_phone text,
  contact_address text,
  social_github text,
  social_linkedin text,
  social_twitter text,
  primary_color text default '#3b82f6',
  font_family text default 'Inter, sans-serif',
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Insert a default row for settings
insert into site_settings (site_title) values ('My Portfolio');

-- 2. Sections Table
create table sections (
  id uuid primary key default uuid_generate_v4(),
  section_key text unique not null,
  title text not null,
  is_visible boolean default true,
  display_order integer not null,
  content_published jsonb default '{}'::jsonb,
  content_draft jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Insert default sections
insert into sections (section_key, title, display_order, content_published, content_draft) values
('hero', 'Hero Section', 1, '{"heading": "Hi, I am Surya", "subheading": "Frontend Developer"}', '{"heading": "Hi, I am Surya", "subheading": "Frontend Developer"}'),
('about', 'About Me', 2, '{"text": "I am a passionate developer..."}', '{"text": "I am a passionate developer..."}'),
('portfolio', 'My Projects', 3, '{}', '{}'),
('services', 'Services', 4, '{}', '{}'),
('testimonials', 'Testimonials', 5, '{}', '{}'),
('contact', 'Contact', 6, '{}', '{}');

-- 3. Content Versions Table (for Version History)
create table content_versions (
  id uuid primary key default uuid_generate_v4(),
  section_key text references sections(section_key) on delete cascade,
  content jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  created_by uuid references auth.users(id) on delete set null
);

-- 4. Portfolio Items Table
create table portfolio_items (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  image_url text,
  project_link text,
  github_link text,
  tags jsonb default '[]'::jsonb,
  display_order integer default 0,
  is_published boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Services Table
create table services (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  icon text,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. Testimonials Table
create table testimonials (
  id uuid primary key default uuid_generate_v4(),
  author_name text not null,
  author_role text,
  text text not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Row Level Security (RLS) Policies

-- By default, enable RLS on all tables
alter table site_settings enable row level security;
alter table sections enable row level security;
alter table content_versions enable row level security;
alter table portfolio_items enable row level security;
alter table services enable row level security;
alter table testimonials enable row level security;

-- Create policy allowing ANYONE to read (SELECT) published data
create policy "Allow public read access to settings" on site_settings for select using (true);
create policy "Allow public read access to sections" on sections for select using (true);
create policy "Allow public read access to portfolio" on portfolio_items for select using (is_published = true);
create policy "Allow public read access to services" on services for select using (true);
create policy "Allow public read access to testimonials" on testimonials for select using (true);

-- Create policy allowing ONLY Authenticated Admin Users to modify data
-- We will assume any authenticated user in the Supabase project is an admin for this portfolio
create policy "Allow authenticated users to update settings" on site_settings for all using (auth.role() = 'authenticated');
create policy "Allow authenticated users to update sections" on sections for all using (auth.role() = 'authenticated');
create policy "Allow authenticated users to manage versions" on content_versions for all using (auth.role() = 'authenticated');
create policy "Allow authenticated users to manage portfolio" on portfolio_items for all using (auth.role() = 'authenticated');
create policy "Allow authenticated users to manage services" on services for all using (auth.role() = 'authenticated');
create policy "Allow authenticated users to manage testimonials" on testimonials for all using (auth.role() = 'authenticated');
