import Link from "next/link";
import { getAdsConfig, getCategories, getProducts, getSlides, getStoreInfo } from "@/lib/catalog";
import ProductCard from "@/components/ProductCard";
import { SectionHeading } from "@/components/Section";
import HeroSlider from "@/components/HeroSlider";
import AdSlot, { AdPopup } from "@/components/AdSlot";
import { activeSlots } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, categories, store, slides, ads] = await Promise.all([
    getProducts(true),
    getCategories(),
    getStoreInfo(),
    getSlides(),
    getAdsConfig(),
  ]);
  const showcase = featured.length > 0 ? featured : [];

  return (
    <div>
      {/* ================= HERO SLIDER ================= */}
      <HeroSlider slides={slides} />

      {/* trust stats strip */}
      <section className="border-b border-white/5">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-3 px-4 py-8 sm:px-6">
          {[
            ["⚡", "৫–৩০ মিনিট", "দ্রুত ডেলিভারি"],
            ["🛡️", "১০০%", "অরিজিনাল গ্যারান্টি"],
            ["💬", "২৪/৭", "সাপোর্ট"],
          ].map(([icon, big, small]) => (
            <div key={small} className="glass rounded-2xl px-3 py-4 text-center">
              <div className="text-2xl">{icon}</div>
              <div className="mt-1 font-display text-lg font-bold text-[#d7ff3f]">
                {big}
              </div>
              <div className="text-xs text-slate-400">{small}</div>
            </div>
          ))}
        </div>
      </section>

      {activeSlots(ads, "home_top").map((slot) => (
        <div key={slot.id} className="py-6">
          <AdSlot code={slot.code} />
        </div>
      ))}

      {/* ================= PAYMENT STRIP ================= */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-5 sm:px-6">
          <span className="text-sm text-slate-500">নিরাপদ পেমেন্ট:</span>
          {["বিকাশ", "নগদ", "রকেট", "ভিসা / মাস্টারকার্ড", "SSLCommerz"].map((p) => (
            <span key={p} className="text-sm font-semibold text-slate-300">✓ {p}</span>
          ))}
        </div>
      </section>

      {/* ================= FEATURED ================= */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading
          kicker="ফিচার্ড"
          title="সবচেয়ে জনপ্রিয় প্রিমিয়াম"
          sub="হাজারো কাস্টমারের বিশ্বস্ত পছন্দ — আজই আপনারটা নিন"
        />
        {showcase.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {showcase.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <EmptyCatalog />
        )}
        <div className="mt-10 text-center">
          <Link href="/shop" className="btn-ghost">
            সব প্রোডাক্ট দেখুন →
          </Link>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <SectionHeading kicker="ক্যাটাগরি" title="পছন্দের ক্যাটাগরি বেছে নিন" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/shop?cat=${c.slug}`}
                className="glass card-hover rounded-2xl p-6 text-center"
              >
                <div className="text-4xl">{c.icon}</div>
                <div className="mt-3 font-bold text-white">{c.name_bn}</div>
                <div className="text-xs text-slate-500">{c.name_en}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ================= HOW IT WORKS ================= */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading
          kicker="প্রক্রিয়া"
          title="মাত্র ৩ ধাপে প্রিমিয়াম হাতে পান"
        />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["🛒", "১. অর্ডার করুন", "পছন্দের প্রোডাক্ট ও প্যাকেজ সিলেক্ট করে কার্টে যোগ করুন।"],
            ["💳", "২. পেমেন্ট করুন", "বিকাশ, নগদ, রকেট বা কার্ড দিয়ে নিরাপদে পেমেন্ট করুন।"],
            ["⚡", "৩. ডেলিভারি নিন", "পেমেন্ট কনফার্ম হলেই ড্যাশবোর্ডে কী/অ্যাকাউন্ট পেয়ে যাবেন।"],
          ].map(([icon, title, desc], i) => (
            <div key={title} className="glass ring-conic relative rounded-2xl p-7">
              <span className="absolute right-5 top-5 font-display text-5xl font-bold text-white/5">
                {i + 1}
              </span>
              <div className="text-4xl">{icon}</div>
              <h3 className="mt-4 font-display text-xl font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-xl text-center text-sm text-slate-500">
          ℹ️ {store.notice_bn}
        </p>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <SectionHeading kicker="রিভিউ" title="কাস্টমাররা যা বলছেন" />
          <div className="grid gap-5 md:grid-cols-3">
            {[
              ["রাহাত H.", "CapCut Pro নিয়েছিলাম — ১০ মিনিটে ডেলিভারি পেয়েছি। একদম অরিজিনাল! ⭐⭐⭐⭐⭐"],
              ["নুসরাত J.", "দাম অন্য জায়গার চেয়ে অনেক কম। সাপোর্টও খুব ভালো, রাতে মেসেজ দিলেও রিপ্লাই পেয়েছি। ⭐⭐⭐⭐⭐"],
              ["তানভীর K.", "YouTube Premium ফ্যামিলি প্যাক নিয়েছি। পেমেন্ট থেকে অ্যাক্টিভেশন — সব স্মুথ। ⭐⭐⭐⭐⭐"],
            ].map(([name, text]) => (
              <div key={name} className="glass rounded-2xl p-6">
                <p className="text-sm leading-relaxed text-slate-300">“{text}”</p>
                <p className="mt-4 font-bold text-[#d7ff3f]">— {name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <SectionHeading kicker="জিজ্ঞাসা" title="সাধারণ প্রশ্নোত্তর" />
        <div className="space-y-3">
          {[
            ["ডেলিভারি পেতে কতক্ষণ লাগবে?", "পেমেন্ট কনফার্ম হওয়ার পর সাধারণত ৫–৩০ মিনিটের মধ্যে আপনার ড্যাশবোর্ডে লাইসেন্স কী বা অ্যাকাউন্ট ডিটেইলস ডেলিভারি দেওয়া হয়।"],
            ["পেমেন্ট কীভাবে করব?", "বিকাশ, নগদ, রকেট (ম্যানুয়াল) অথবা SSLCommerz-এর মাধ্যমে কার্ড/মোবাইল ব্যাংকিং দিয়ে পেমেন্ট করতে পারবেন।"],
            ["এগুলো কি অরিজিনাল?", "হ্যাঁ, ১০০% অরিজিনাল সাবস্ক্রিপশন। কোনো সমস্যা হলে রিপ্লেসমেন্ট/সাপোর্ট দেওয়া হয়।"],
            ["অ্যাকাউন্ট কি আমার নিজের মেইলে হবে?", "বেশিরভাগ প্রোডাক্ট আপনার নিজের ইমেইলে অ্যাক্টিভেট করা হয়। প্রোডাক্ট পেজের ডেলিভারি নোটে বিস্তারিত লেখা থাকে।"],
          ].map(([q, a]) => (
            <details key={q} className="glass group rounded-xl px-5 py-4">
              <summary className="cursor-pointer font-semibold text-white marker:text-[#d7ff3f]">
                {q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {activeSlots(ads, "home_bottom").map((slot) => (
        <div key={slot.id} className="py-6">
          <AdSlot code={slot.code} />
        </div>
      ))}

      {/* ================= CTA ================= */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
        <div className="glass ring-conic relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12">
          <div className="dot-grid absolute inset-0 opacity-60" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              প্রিমিয়াম এক্সপেরিয়েন্স শুরু করুন <span className="text-[#d7ff3f]">আজই</span>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-slate-400">
              সেরা দামে অরিজিনাল সাবস্ক্রিপশন — স্টক সীমিত, দেরি করবেন না।
            </p>
            <Link href="/shop" className="btn-vault mt-8 text-base">
              🛍️ শপিং শুরু করুন
            </Link>
          </div>
        </div>
      </section>

      {activeSlots(ads, "popup").map((slot) => (
        <AdPopup key={slot.id} code={slot.code} />
      ))}
    </div>
  );
}

function EmptyCatalog() {
  return (
    <div className="glass mx-auto max-w-lg rounded-2xl p-10 text-center">
      <div className="text-5xl">📦</div>
      <p className="mt-4 font-bold text-white">প্রোডাক্ট শীঘ্রই আসছে</p>
      <p className="mt-2 text-sm text-slate-400">
        ডাটাবেজে প্রোডাক্ট যোগ করা হয়নি।{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">supabase/seed.sql</code>{" "}
        চালান অথবা অ্যাডমিন প্যানেল থেকে যোগ করুন।
      </p>
    </div>
  );
}
