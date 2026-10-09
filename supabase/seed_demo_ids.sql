-- DigiPlyra demo seed — 250 Free Fire ID listings (approved)
-- Run AFTER 008. Uses your first admin account as the demo seller.
-- Safe to run once. To remove demo posts later, use Admin -> ID bazar -> delete buttons.

with admin_pick as (
  select id as admin_id from public.profiles where is_admin = true order by created_at limit 1
),
cfg as (
  select
    array[52,55,58,60,62,65,68,70,72,75]::int[] as lvls,
    array[120,180,250,320,400,480,550]::int[] as skins,
    array['Diamond','Heroic','Grandmaster','Platinum','Master'] as ranks,
    array['সব ক্যারেক্টার আনলক','ব্লু ফ্লেম ড্রাকো AK স্কিন','MP40 পোকার স্কিন','৫০০০+ ডায়মন্ড খরচ করা','রেয়ার বান্ডিল কালেকশন','ইভো গান ম্যাক্স','সিজন ১ প্লেয়ার','গিল্ড লিডার অ্যাকাউন্ট','টুর্নামেন্ট রেডি ID','ডিনো বান্ডিল সহ','ক্রিমিনাল বান্ডিল','সাকুরা বান্ডিল'] as extras,
    array[
      array['ff:char'], array['ff:weapons'], array['ff:trophy'],
      array['ff:char','ff:weapons'], array['ff:weapons','ff:trophy'], array['ff:char','ff:trophy','ff:hero']
    ] as imgsets
),
gen as (
  select
    g,
    lvls[1 + (g * 7) % 10] as lv,
    skins[1 + (g * 13) % 7] as sk,
    ranks[1 + (g * 5) % 5] as rk,
    extras[1 + (g * 11) % 12] as ex,
    imgsets[1 + (g % 6)] as imgs
  from generate_series(1, 250) g, cfg
)
insert into public.id_listings (seller_id, title, description, price_bdt, game_uid, images, status, views, created_at)
select
  (select admin_id from admin_pick),
  case (g % 4)
    when 0 then format('লেভেল %s ID — %s স্কিন, %s র‍্যাংক', lv, sk, rk)
    when 1 then format('%s র‍্যাংক ID — লেভেল %s, %s', rk, lv, ex)
    when 2 then format('লেভেল %s — %s+ স্কিন, %s', lv, sk, ex)
    else format('সিজন ১ ভেটেরান ID — লেভেল %s, %s', lv, ex)
  end,
  case (g % 3)
    when 0 then format('🔥 লেভেল %s Free Fire ID বিক্রি হবে।\n✅ %s+ গান ও ক্যারেক্টার স্কিন\n✅ র‍্যাংক: %s\n✅ %s\n✅ ফুল ভেরিফাইড, কোনো বাইন্ডিং সমস্যা নেই\n\n💬 দাম আলোচনা সাপেক্ষ — চ্যাটে কথা বলুন।', lv, sk, rk, ex)
    when 1 then format('🎮 প্রিমিয়াম ID — লেভেল %s\n🌟 %s\n🌟 %sটি স্কিন\n🌟 বর্তমান র‍্যাংক: %s\n🌟 ডায়মন্ড টপ-আপ হিস্ট্রি ক্লিন\n\n⚡ দ্রুত ডিল করতে চাইলে মেসেজ দিন!', lv, ex, sk, rk)
    else format('💎 %s প্লেয়ারের ID — লেভেল %s\n✔ %s+ স্কিন কালেকশন\n✔ %s\n✔ গেস্ট + ফেসবুক বাইন্ড (চেঞ্জ করে দেব)\n\n🛡️ DigiPlyra এসক্রোতে নিরাপদে কিনুন।', rk, lv, sk, ex)
  end,
  greatest(1200, round((1500 + (lv - 50) * 320 + sk * 12 + (g * 37) % 900) / 100) * 100),
  (100000000 + (g * 7919) % 2000000000)::text,
  imgs,
  'approved',
  40 + (g * 173) % 3000,
  now() - ((g % 45) || ' days')::interval - (((g * 7) % 24) || ' hours')::interval
from gen;
