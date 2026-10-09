-- ============================================================
-- DigiPlyra v4.2 — flexible ad slots with per-ad + master switches
-- Run AFTER 005_public_settings.sql
--
-- New 'ads' structure:
-- {
--   "master_enabled": true,
--   "slots": [
--     {"id":"home_top","name":"...","placement":"home_top|home_bottom|product_page|popup|sitewide",
--      "code":"<script...>", "enabled": true}
--   ]
-- }
-- ============================================================

-- 1) Transform the old flat structure into slots (only once)
update public.site_settings
set value = jsonb_build_object(
    'master_enabled', coalesce((value ->> 'enabled')::boolean, true),
    'slots', jsonb_build_array(
      jsonb_build_object(
        'id', 'home_top', 'name', 'হোম পেজ — উপরে', 'placement', 'home_top',
        'code', coalesce(value ->> 'home_top', ''), 'enabled', true),
      jsonb_build_object(
        'id', 'home_bottom', 'name', 'হোম পেজ — নিচে', 'placement', 'home_bottom',
        'code', coalesce(value ->> 'home_bottom', ''), 'enabled', true),
      jsonb_build_object(
        'id', 'product_page', 'name', 'প্রোডাক্ট পেজ', 'placement', 'product_page',
        'code', coalesce(value ->> 'product_page', ''), 'enabled', true),
      jsonb_build_object(
        'id', 'popup', 'name', 'পপআপ', 'placement', 'popup',
        'code', coalesce(value ->> 'popup', ''), 'enabled', false),
      jsonb_build_object(
        'id', 'monetag_3524319', 'name', 'Monetag Zone 3524319', 'placement', 'sitewide',
        'code', '<script data-cfasync="false" async type="text/javascript" src="//3nbf4.com/act/files/tag.min.js?z=3524319"></script>',
        'enabled', true)
    )
  ),
  updated_at = now()
where key = 'ads'
  and not (value ? 'slots');

-- 2) If the 'ads' row is missing entirely, create it with the slot structure
insert into public.site_settings (key, value)
select 'ads',
  jsonb_build_object(
    'master_enabled', true,
    'slots', jsonb_build_array(
      jsonb_build_object(
        'id', 'home_top', 'name', 'হোম পেজ — উপরে', 'placement', 'home_top',
        'code', '', 'enabled', true),
      jsonb_build_object(
        'id', 'home_bottom', 'name', 'হোম পেজ — নিচে', 'placement', 'home_bottom',
        'code', '', 'enabled', true),
      jsonb_build_object(
        'id', 'product_page', 'name', 'প্রোডাক্ট পেজ', 'placement', 'product_page',
        'code', '', 'enabled', true),
      jsonb_build_object(
        'id', 'popup', 'name', 'পপআপ', 'placement', 'popup',
        'code', '', 'enabled', false),
      jsonb_build_object(
        'id', 'monetag_3524319', 'name', 'Monetag Zone 3524319', 'placement', 'sitewide',
        'code', '<script data-cfasync="false" async type="text/javascript" src="//3nbf4.com/act/files/tag.min.js?z=3524319"></script>',
        'enabled', true)
    )
  )
where not exists (select 1 from public.site_settings where key = 'ads');
