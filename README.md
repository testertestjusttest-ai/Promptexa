# DigiPlyra ✦ — ডিজিটাল প্রোডাক্ট স্টোর

বাংলাদেশের কাস্টমারদের জন্য অরিজিনাল প্রিমিয়াম সাবস্ক্রিপশন (CapCut Pro, Canva Pro, YouTube Premium ইত্যাদি) বিক্রির সম্পূর্ণ ই-কমার্স ওয়েবসাইট।

## ✨ ফিচার

**স্টোরফ্রন্ট**
- ইউনিক "Midnight Vault" ডার্ক থিম, সম্পূর্ণ বাংলা UI
- হোম, শপ (সার্চ + ক্যাটাগরি ফিল্টার), প্রোডাক্ট ডিটেইল (প্ল্যান সিলেক্টর)
- কার্ট (localStorage) + স্লাইড-ইন ড্রয়ার

**চেকআউট ও পেমেন্ট**
- গেস্ট চেকআউট (লগইন ছাড়াই কেনা যায়)
- **SSLCommerz** — কার্ড/মোবাইল ব্যাংকিং, সার্ভার-সাইড `val_id` ভেরিফিকেশন + IPN সাপোর্ট
- **ম্যানুয়াল** — বিকাশ/নগদ/রকেট: TrxID জমা → অ্যাডমিন অ্যাপ্রুভ
- দাম সবসময় ডাটাবেজ থেকে যাচাই করা হয় (ক্লায়েন্টের দাম বিশ্বাস করা হয় না)

**ডেলিভারি**
- পেমেন্ট সফল/অ্যাপ্রুভ হলেই কী-ইনভেন্টরি থেকে **অটো-ডেলিভারি**
- ইউজার ড্যাশবোর্ডে কী দেখা + কপি বাটন
- স্টক শেষ হলে অর্ডার `keys_pending` হয় — অ্যাডমিনকে জানানো হয়

**অ্যাডমিন প্যানেল** (`/admin`)
- ওভারভিউ: রেভিনিউ, আজকের অর্ডার, পেমেন্ট যাচাই বাকি, কী-স্টক অ্যালার্ট
- অর্ডার লিস্ট + ডিটেইল (ফিল্টারসহ)
- ম্যানুয়াল পেমেন্ট যাচাই — এক ক্লিকে অ্যাপ্রুভ → অটো ডেলিভারি
- কী ইনভেন্টরি — বাল্ক কী যোগ (প্রতি লাইনে একটি)
- প্রোডাক্ট ও প্রাইস-প্ল্যান ম্যানেজমেন্ট
- সেটিংস — বিকাশ/নগদ/রকেট নম্বর, স্টোর তথ্য, SSLCommerz স্ট্যাটাস

## 🛠️ স্ট্যাক

Next.js 16 (App Router) • TypeScript • Tailwind CSS v4 • Supabase (PostgreSQL + Auth) • Vercel

## 🚀 সেটআপ

### ১. ডাটাবেজ
Supabase Dashboard → SQL Editor-এ চালান:
1. `supabase/migrations/001_digiplyra_store.sql` — টেবিল + RLS পলিসি
2. `supabase/seed.sql` — ডেমো ক্যাটাগরি/প্রোডাক্ট/প্ল্যান (ঐচ্ছিক)

### ২. এনভায়রনমেন্ট
```bash
cp .env.example .env.local
# .env.local-এ Supabase URL + keys বসান
```

### ৩. রান
```bash
npm install
npm run dev      # http://localhost:3000
npm run typecheck
npm run build
```

### ৪. অ্যাডমিন বানান
রেজিস্টার করে লগইন করুন, তারপর SQL Editor-এ:
```sql
update public.profiles set is_admin = true where email = 'you@email.com';
```

### ৫. লাইভ পেমেন্ট চালু করুন
- **ম্যানুয়াল**: Admin → Settings → বিকাশ/নগদ/রকেট মার্চেন্ট নম্বর বসান — সাথে সাথে চালু ✅
- **কার্ড**: [SSLCommerz](https://www.sslcommerz.com) থেকে Store ID/Password নিয়ে Vercel Environment Variables-এ বসান:
  `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD`, `SSLCOMMERZ_ENABLED=true`
  (টেস্টে `SSLCOMMERZ_SANDBOX=true`, লাইভে `false`) → Redeploy

### ৬. ডিপ্লয় (Vercel)
GitHub থেকে Import → Environment Variables বসান → Deploy।

## 🔑 কী-ইনভেন্টরি কীভাবে কাজ করে

1. Admin → Keys → প্রোডাক্ট সিলেক্ট করে কী পেস্ট করুন (লাইসেন্স কী বা `email : password` — প্রতি লাইনে একটি)
2. কাস্টমার পেমেন্ট করলে সবচেয়ে পুরনো অব্যবহৃত কী অটোমেটিক অ্যাসাইন হয়
3. কী ড্যাশবোর্ডে দেখা যায়; স্টক শেষ হলে অর্ডার `keys_pending` থাকে

## 📁 স্ট্রাকচার

```
app/                    # পেজ ও API রাউট
  admin/                # অ্যাডমিন প্যানেল
  api/                  # checkout, payments, admin APIs
  auth/                 # login / signup / callback
  checkout/             # চেকআউট ফ্লো
  dashboard/            # ইউজার ড্যাশবোর্ড
  product/[slug]/       # প্রোডাক্ট ডিটেইল
  shop/
components/             # Navbar, Footer, ProductCard, CartDrawer...
lib/                    # supabase clients, cart, sslcommerz, delivery, format
supabase/               # migrations + seed
```

## 🆕 v2 ফিচার

- **কাস্টম লোগো** (`public/logo.png`) — Navbar/Footer/PWA-তে ব্যবহৃত
- **হোম স্লাইডার** — Admin → Slides থেকে ব্যানার বানান (ছবি/কালার/বাটন/লিংক)
- **প্রোডাক্ট ছবি** — Admin → Products → ছবি আপলোড (Supabase Storage `product-images` বাকেট)
- **স্টক কন্ট্রোল** — কী শেষ হলে অটো "স্টক শেষ"; ম্যানুয়াল override + inactive টগল
- **বিজ্ঞাপন** — Admin → Settings → Adsterra/Monetag কোড পেস্ট করলেই সাইটে শো (হোম উপর/নিচ, প্রোডাক্ট পেজ, পপআপ)
- **PWA** — ইনস্টলযোগ্য অ্যাপ, অফলাইন ক্যাশ, হোম-স্ক্রিন ইনস্টল ব্যানার
- **পুশ নোটিফিকেশন** — Admin → Settings → OneSignal App ID বসান

### 📱 APK / Play Store

1. সাইট ডিপ্লয় করুন (Vercel)
2. [pwabuilder.com](https://www.pwabuilder.com) → URL দিন → **Android** প্যাকেজ বানান → `.aab` ডাউনলোড
3. [Play Console](https://play.google.com/console)-এ আপলোড করুন
4. Digital Asset Links-এর জন্য Play Console-এর SHA-256 দিয়ে `public/.well-known/assetlinks.json` বানান

### 🗄️ v2 মাইগ্রেশন

`supabase/migrations/002_v2_features.sql` চালান (001-এর পরে)।

## ⚠️ নোট
- ডেমো কী-গুলো (`DEMO-...`) আসল কী দিয়ে রিপ্লেস করুন
- অ্যাডমিন প্যানেল: `https://yourdomain.com/admin` — লগইন + `is_admin=true` লাগবে
