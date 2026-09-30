-- Promptexa database blueprint
-- Apply only to the dedicated Promptexa Supabase project.
create extension if not exists pg_trgm;

create table if not exists public.categories (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  description text not null default '',
  icon text not null default '✦',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_models (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  provider text not null default '',
  description text not null default '',
  website_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.prompts (
  id bigint generated always as identity primary key,
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  prompt_text text not null,
  prompt_type text not null check (prompt_type in ('image','video','chat','writing','coding','marketing','creative')),
  category_id bigint references public.categories(id) on delete set null,
  model_id bigint references public.ai_models(id) on delete set null,
  tags text[] not null default '{}',
  preview_image_url text,
  example_description text,
  video_concept text,
  difficulty text not null default 'beginner' check (difficulty in ('beginner','intermediate','advanced')),
  featured boolean not null default false,
  published boolean not null default true,
  copy_count bigint not null default 0,
  save_count bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_document tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(excerpt,'')), 'B') ||
    setweight(to_tsvector('english', coalesce(prompt_text,'')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(tags,' '),'')), 'B')
  ) stored
);

create index if not exists prompts_search_document_idx on public.prompts using gin(search_document);
create index if not exists prompts_slug_idx on public.prompts(slug);
create index if not exists prompts_category_idx on public.prompts(category_id);
create index if not exists prompts_model_idx on public.prompts(model_id);
create index if not exists prompts_type_idx on public.prompts(prompt_type);
create index if not exists prompts_published_idx on public.prompts(published, featured, created_at desc);
create index if not exists prompts_title_trgm_idx on public.prompts using gin(title gin_trgm_ops);

create table if not exists public.prompt_collections (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  description text not null default '',
  cover_image_url text,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.collection_prompts (
  collection_id bigint not null references public.prompt_collections(id) on delete cascade,
  prompt_id bigint not null references public.prompts(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (collection_id, prompt_id)
);

create table if not exists public.prompt_saves (
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt_id bigint not null references public.prompts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, prompt_id)
);

alter table public.categories enable row level security;
alter table public.ai_models enable row level security;
alter table public.prompts enable row level security;
alter table public.prompt_collections enable row level security;
alter table public.collection_prompts enable row level security;
alter table public.prompt_saves enable row level security;

drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories" on public.categories for select to anon, authenticated using (true);
drop policy if exists "Public can read models" on public.ai_models;
create policy "Public can read models" on public.ai_models for select to anon, authenticated using (true);
drop policy if exists "Public can read published prompts" on public.prompts;
create policy "Public can read published prompts" on public.prompts for select to anon, authenticated using (published = true);
drop policy if exists "Public can read collections" on public.prompt_collections;
create policy "Public can read collections" on public.prompt_collections for select to anon, authenticated using (true);
drop policy if exists "Public can read collection prompts" on public.collection_prompts;
create policy "Public can read collection prompts" on public.collection_prompts for select to anon, authenticated using (true);
drop policy if exists "Users manage own saves" on public.prompt_saves;
create policy "Users read own saves" on public.prompt_saves for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users create own saves" on public.prompt_saves for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users delete own saves" on public.prompt_saves for delete to authenticated using ((select auth.uid()) = user_id);

insert into public.categories (slug,name,description,icon,sort_order) values
('image-prompts','Image Prompts','Visual prompts for images, portraits, products and scenes.','✦',1),
('video-prompts','Video Prompts','Cinematic shots, ads, reels and image-to-video concepts.','◉',2),
('chat-writing','Chat & Writing','Writing, research, productivity and everyday AI.','⌘',3),
('coding','Coding','Debugging, building, review and automation prompts.','</>',4),
('marketing','Marketing','Ads, SEO, branding, social content and sales.','↗',5),
('creative','Creative','Illustration, 3D, fashion, posters and experiments.','✺',6)
on conflict (slug) do nothing;

insert into public.ai_models (slug,name,provider,description) values
('chatgpt','ChatGPT','OpenAI','General-purpose conversational and reasoning prompts.'),
('midjourney','Midjourney','Midjourney','Image-generation prompt patterns.'),
('flux','Flux','Black Forest Labs','Image-generation prompt patterns.'),
('veo','Veo','Google','Video-generation prompt concepts.')
on conflict (slug) do nothing;
