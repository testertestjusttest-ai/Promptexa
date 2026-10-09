-- ============================================================
-- DigiPlyra v4.3 — additional Monetag ad slots (all DISABLED by default;
-- enable them from Admin → 📢 বিজ্ঞাপন)
-- Run AFTER 006_ad_slots.sql
-- ============================================================

DO $$
DECLARE
  new_slots jsonb := '[
    {"id":"monetag_tag_292918","name":"Monetag Tag 292918","placement":"sitewide",
     "code":"<script src=\"https://quge5.com/88/tag.min.js\" data-zone=\"292918\" async data-cfasync=\"false\"></script>",
     "enabled":false},
    {"id":"monetag_tag_11989815","name":"Monetag Tag 11989815","placement":"sitewide",
     "code":"<script>(function(s){s.dataset.zone=''11989815'',s.src=''https://al5sm.com/tag.min.js''})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement(''script'')))</script>",
     "enabled":false},
    {"id":"monetag_tag_11989823","name":"Monetag Tag 11989823","placement":"sitewide",
     "code":"<script src=\"https://5gvci.com/act/files/tag.min.js?z=11989823\" data-cfasync=\"false\" async></script>",
     "enabled":false},
    {"id":"monetag_tag_11989833","name":"Monetag Tag 11989833","placement":"sitewide",
     "code":"<script>(function(s){s.dataset.zone=''11989833'',s.src=''https://nap5k.com/tag.min.js''})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement(''script'')))</script>",
     "enabled":false},
    {"id":"monetag_vignette_11989834","name":"Monetag Vignette 11989834","placement":"sitewide",
     "code":"<script>(function(s){s.dataset.zone=''11989834'',s.src=''https://n6wxm.com/vignette.min.js''})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement(''script'')))</script>",
     "enabled":false},
    {"id":"monetag_smartlink_11989836","name":"Monetag SmartLink 11989836","placement":"sitewide",
     "code":"<!-- Monetag SmartLink: https://uplcm.com/4/11989836 -->",
     "enabled":false},
    {"id":"earn_top","name":"আয় পেজ — উপরে","placement":"earn_top",
     "code":"",
     "enabled":true},
    {"id":"earn_bottom","name":"আয় পেজ — নিচে","placement":"earn_bottom",
     "code":"",
     "enabled":true}
  ]';
  s jsonb;
  cur jsonb;
BEGIN
  SELECT value INTO cur FROM public.site_settings WHERE key = 'ads';

  IF cur IS NULL THEN
    RAISE NOTICE 'site_settings ads row missing — run 006 first';
    RETURN;
  END IF;

  IF NOT (cur ? 'slots') THEN
    RAISE NOTICE 'ads row has old structure — run 006 first';
    RETURN;
  END IF;

  FOR s IN SELECT * FROM jsonb_array_elements(new_slots) LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements(cur -> 'slots') e
      WHERE e ->> 'id' = s ->> 'id'
    ) THEN
      UPDATE public.site_settings
      SET value = jsonb_set(value, '{slots}', (value -> 'slots') || s),
          updated_at = now()
      WHERE key = 'ads';
      SELECT value INTO cur FROM public.site_settings WHERE key = 'ads';
      RAISE NOTICE 'added slot %', s ->> 'id';
    ELSE
      RAISE NOTICE 'slot % already exists — skipped', s ->> 'id';
    END IF;
  END LOOP;
END $$;
