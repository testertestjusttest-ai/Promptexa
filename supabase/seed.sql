-- ============================================================
-- DigiPlyra seed data — demo catalogue (edit freely in admin panel)
-- ============================================================

-- categories
insert into public.categories (slug, name_bn, name_en, icon, sort) values
  ('video-editing', 'ভিডিও এডিটিং', 'Video Editing', '🎬', 1),
  ('design', 'ডিজাইন', 'Design', '🎨', 2),
  ('music-video', 'মিউজিক ও ভিডিও', 'Music & Video', '🎵', 3),
  ('productivity', 'প্রোডাক্টিভিটি', 'Productivity', '⚡', 4)
on conflict (slug) do nothing;

-- products
insert into public.products (slug, name, tagline_bn, description_bn, features_bn, badge, badge_bg, category_id, is_featured, sort)
select
  x.slug, x.name, x.tagline_bn, x.description_bn, x.features_bn, x.badge, x.badge_bg, c.id, x.is_featured, x.sort
from (values
  ('capcut-pro', 'CapCut Pro',
   'প্রো ভিডিও এডিটিং — ওয়াটারমার্ক ছাড়া, সব প্রিমিয়াম ইফেক্ট',
   'CapCut Pro দিয়ে আনলক করুন সব প্রিমিয়াম ট্রানজিশন, ইফেক্ট, AI টুলস, ক্লাউড স্টোরেজ এবং 4K এক্সপোর্ট। ভিডিওতে কোনো ওয়াটারমার্ক থাকবে না। আপনার নিজের অ্যাকাউন্টে সরাসরি অ্যাক্টিভেশন।',
   array['সব প্রিমিয়াম ইফেক্ট ও ট্রানজিশন', 'AI ব্যাকগ্রাউন্ড রিমুভার ও অটো ক্যাপশন', '4K এক্সপোর্ট, ওয়াটারমার্ক ফ্রি', '১০০GB ক্লাউড স্টোরেজ', 'আপনার নিজের মেইলে অ্যাক্টিভেশন'],
   '✂', '#7c3aed', 'video-editing', true, 1),
  ('canva-pro', 'Canva Pro',
   'ডিজাইনের সব প্রিমিয়াম টেমপ্লেট ও AI টুল আনলক',
   'Canva Pro দিয়ে পান ৬০০M+ প্রিমিয়াম স্টক ফটো-ভিডিও, Magic Studio AI টুলস, ব্যাকগ্রাউন্ড রিমুভার, ব্র্যান্ড কিট এবং 1TB ক্লাউড স্টোরেজ। টিম ইনভাইটের মাধ্যমে অ্যাক্টিভেশন।',
   array['৬১০,০০০+ প্রিমিয়াম টেমপ্লেট', 'Magic Studio AI টুলস', 'ব্যাকগ্রাউন্ড রিমুভার', 'ব্র্যান্ড কিট ও 1TB স্টোরেজ', 'টিম লিংকে দ্রুত অ্যাক্টিভেশন'],
   '🅲', '#0ea5e9', 'design', true, 2),
  ('youtube-premium', 'YouTube Premium',
   'বিজ্ঞাপন ছাড়া ইউটিউব + ব্যাকগ্রাউন্ড প্লে',
   'বিজ্ঞাপনমুক্ত ইউটিউব, ব্যাকগ্রাউন্ড প্লে, অফলাইন ডাউনলোড এবং YouTube Music Premium — সব একসাথে। আপনার নিজের জিমেইলে ইনভাইট পাঠানো হবে।',
   array['১০০% বিজ্ঞাপনমুক্ত অভিজ্ঞতা', 'ব্যাকগ্রাউন্ড ও PiP প্লে', 'অফলাইন ডাউনলোড', 'YouTube Music Premium ফ্রি', 'নিজের জিমেইলে অ্যাক্টিভেশন'],
   '▶', '#ef4444', 'music-video', true, 3),
  ('spotify-premium', 'Spotify Premium',
   'বিজ্ঞাপন ছাড়া আনলিমিটেড মিউজিক',
   'Spotify Premium-এ শুনুন ১০ কোটি+ গান বিজ্ঞাপন ছাড়া, অফলাইন ডাউনলোড ও আনলিমিটেড স্কিপসহ। অ্যাকাউন্ট আপগ্রেড করে ডেলিভারি।',
   array['বিজ্ঞাপনমুক্ত মিউজিক', 'অফলাইন ডাউনলোড', 'আনলিমিটেড স্কিপ', 'হাই কোয়ালিটি অডিও', 'দ্রুত অ্যাকাউন্ট আপগ্রেড'],
   '♪', '#22c55e', 'music-video', false, 4),
  ('microsoft-365', 'Microsoft 365 Personal',
   'Word, Excel, PowerPoint + 1TB OneDrive',
   'অরিজিনাল Microsoft 365 Personal — Word, Excel, PowerPoint, Outlook-এর লেটেস্ট ভার্সনসহ 1TB OneDrive ক্লাউড স্টোরেজ। আপনার মাইক্রোসফট অ্যাকাউন্টে সরাসরি অ্যাক্টিভেশন।',
   array['Word, Excel, PowerPoint লেটেস্ট', '1TB OneDrive স্টোরেজ', 'PC + Mac + মোবাইল', '৬০ মিনিট Skype কল/মাস', 'অরিজিনাল লাইসেন্স কী'],
   '◧', '#f97316', 'productivity', false, 5),
  ('picsart-gold', 'Picsart Gold',
   'ফটো এডিটিংয়ের সব প্রিমিয়াম ফিচার',
   'Picsart Gold দিয়ে আনলক করুন সব প্রিমিয়াম ফিল্টার, স্টিকার, AI টুলস এবং বিজ্ঞাপনমুক্ত এডিটিং। আপনার অ্যাকাউন্টে সরাসরি অ্যাক্টিভেশন।',
   array['সব প্রিমিয়াম ফিল্টার ও ইফেক্ট', 'AI ব্যাকগ্রাউন্ড টুলস', 'বিজ্ঞাপনমুক্ত অভিজ্ঞতা', 'এক্সক্লুসিভ কনটেন্ট', 'দ্রুত ডেলিভারি'],
   '◈', '#ec4899', 'design', false, 6)
) as x(slug, name, tagline_bn, description_bn, features_bn, badge, badge_bg, cat_slug, is_featured, sort)
join public.categories c on c.slug = x.cat_slug
on conflict (slug) do nothing;

-- plans: 1 / 6 / 12 months per product
insert into public.plans (product_id, label_bn, duration_days, price_bdt, old_price_bdt, is_popular, sort)
select p.id, v.label_bn, v.duration_days, v.price_bdt, v.old_price_bdt, v.is_popular, v.sort
from public.products p
join (values
  ('১ মাস', 30, 249, 349, false, 1),
  ('৬ মাস', 180, 1199, 1499, true, 2),
  ('১২ মাস', 365, 1999, 2499, false, 3)
) as v(label_bn, duration_days, price_bdt, old_price_bdt, is_popular, sort) on true
on conflict do nothing;

-- demo keys (REPLACE with real inventory in admin panel)
insert into public.product_keys (product_id, key_text, key_note)
select p.id,
  'DEMO-' || upper(substring(p.slug from 1 for 4)) || '-XXXX-XXXX (ডেমো কী — অ্যাডমিন প্যানেল থেকে আসল কী যোগ করুন)',
  'এটি একটি ডেমো কী।'
from public.products p
on conflict do nothing;

-- make the first signed-up user an admin (RUN manually with your email):
-- update public.profiles set is_admin = true where email = 'you@example.com';
