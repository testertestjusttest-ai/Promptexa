/** 10 demo website mockups — each renders a convincing mini website. */

function Frame({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-white/15 shadow-2xl ${dark ? "bg-[#0a0a12]" : "bg-white"}`}>
      <div className="flex items-center gap-1.5 bg-black/80 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-2 flex-1 truncate rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-slate-400">demo.digiplyra.com</span>
      </div>
      {children}
    </div>
  );
}

function Nav({ logo, links, cta, light = false }: { logo: string; links: string[]; cta: string; light?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 ${light ? "text-white" : "text-slate-800"}`}>
      <span className="text-sm font-black">{logo}</span>
      <div className="hidden gap-3 text-[10px] opacity-70 sm:flex">
        {links.map((l) => <span key={l}>{l}</span>)}
      </div>
      <span className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 text-[10px] font-bold text-white">{cta}</span>
    </div>
  );
}

export type Demo = {
  slug: string;
  name: string;
  type: string;
  desc: string;
  price: string;
  render: () => React.ReactNode;
};

export const DEMOS: Demo[] = [
  {
    slug: "restaurant",
    name: "স্বাদের ঠিকানা",
    type: "রেস্টুরেন্ট ওয়েবসাইট",
    desc: "মেনু, অনলাইন অর্ডার, টেবিল বুকিংসহ সম্পূর্ণ রেস্টুরেন্ট সাইট।",
    price: "৳৪,৯৯৯ থেকে",
    render: () => (
      <Frame dark>
        <Nav logo="🍔 স্বাদের ঠিকানা" links={["মেনু", "অফার", "রিভিউ"]} cta="অর্ডার করুন" light />
        <div className="bg-gradient-to-br from-orange-600 via-red-600 to-amber-700 px-4 py-8 text-white">
          <p className="text-[10px] tracking-widest opacity-80">🔥 স্পেশাল অফার</p>
          <p className="mt-1 text-xl font-black">ঘরেই পান রেস্টুরেন্টের স্বাদ</p>
          <p className="mt-1 text-[11px] opacity-80">৩০ মিনিটে হোম ডেলিভারি</p>
          <span className="mt-3 inline-block rounded-full bg-white px-4 py-1.5 text-[11px] font-bold text-red-600">মেনু দেখুন</span>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3">
          {["🍕 পিজ্জা", "🍗 চিকেন", "🍰 ডেজার্ট"].map((f) => (
            <div key={f} className="rounded-xl bg-white/5 p-2 text-center text-[11px] text-white">
              <div className="text-xl">{f.split(" ")[0]}</div><p className="mt-1 opacity-80">{f.split(" ")[1]}</p>
              <p className="font-bold text-amber-300">৳২৫০</p>
            </div>
          ))}
        </div>
        <p className="bg-black/40 px-4 py-2 text-center text-[10px] text-slate-500">© স্বাদের ঠিকানা</p>
      </Frame>
    ),
  },
  {
    slug: "fashion",
    name: "স্টাইল হাব",
    type: "ফ্যাশন ই-কমার্স",
    desc: "কার্ট, বিকাশ পেমেন্ট, অর্ডার ট্র্যাকিংসহ ফ্যাশন শপ।",
    price: "৳১২,৯৯৯ থেকে",
    render: () => (
      <Frame>
        <Nav logo="👗 স্টাইল হাব" links={["শাড়ি", "পাঞ্জাবি", "অফার"]} cta="কার্ট (২)" />
        <div className="bg-gradient-to-r from-pink-500 to-fuchsia-600 px-4 py-7 text-white">
          <p className="text-xl font-black">ঈদ কালেকশন ২০২৬</p>
          <p className="text-[11px] opacity-90">৫০% পর্যন্ত ছাড়!</p>
        </div>
        <div className="grid grid-cols-4 gap-2 p-3">
          {["👚", "👔", "👠", "👜"].map((e, i) => (
            <div key={i} className="rounded-xl bg-slate-100 p-2 text-center">
              <div className="text-2xl">{e}</div>
              <p className="mt-1 text-[10px] font-bold text-slate-700">৳{(i + 1) * 499}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between bg-pink-50 px-4 py-2 text-[10px] text-pink-700">
          <span>🚚 সারাদেশে ডেলিভারি</span><span>💳 বিকাশ/নগদ</span>
        </div>
      </Frame>
    ),
  },
  {
    slug: "portfolio",
    name: "লেন্স ও আলো",
    type: "ফটোগ্রাফার পোর্টফোলিও",
    desc: "গ্যালারি, বুকিং ফর্মসহ মিনিমাল পোর্টফোলিও সাইট।",
    price: "৳৪,৯৯৯ থেকে",
    render: () => (
      <Frame dark>
        <Nav logo="📸 লেন্স ও আলো" links={["গ্যালারি", "সার্ভিস", "যোগাযোগ"]} cta="বুক করুন" light />
        <div className="px-4 py-8 text-center text-white">
          <p className="text-[10px] tracking-[0.3em] text-slate-400">WEDDING • PORTRAIT • EVENT</p>
          <p className="mt-2 text-2xl font-black">মুহূর্তগুলো ধরে রাখি<br />চিরদিনের জন্য</p>
        </div>
        <div className="grid grid-cols-3 gap-1 p-2">
          {["🌅", "👰", "🎭", "🏙️", "🌊", "🎪"].map((e, i) => (
            <div key={i} className="grid h-16 place-items-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-2xl">{e}</div>
          ))}
        </div>
        <p className="px-4 py-3 text-center text-[10px] text-slate-500">৫০০+ ইভেন্ট কভারেজ ⭐ ৪.৯ রেটিং</p>
      </Frame>
    ),
  },
  {
    slug: "news",
    name: "খবর ২৪",
    type: "নিউজ পোর্টাল",
    desc: "লাইভ আপডেট, ক্যাটাগরি, বিজ্ঞাপন স্লটসহ নিউজ সাইট।",
    price: "৳৯,৯৯৯ থেকে",
    render: () => (
      <Frame>
        <div className="bg-red-600 px-4 py-2.5 text-white">
          <span className="text-lg font-black">খবর ২৪</span>
          <span className="ml-2 rounded bg-white/20 px-2 py-0.5 text-[10px]">🔴 লাইভ</span>
        </div>
        <div className="flex gap-2 overflow-hidden bg-slate-100 px-3 py-1.5 text-[10px] text-slate-600">
          {["জাতীয়", "খেলা", "বিনোদন", "প্রযুক্তি", "আন্তর্জাতিক"].map((c) => (
            <span key={c} className="whitespace-nowrap rounded-full bg-white px-2 py-0.5">{c}</span>
          ))}
        </div>
        <div className="space-y-2 p-3">
          {[
            ["🏏", "বাংলাদেশের ঐতিহাসিক জয়!", "২ ঘণ্টা আগে"],
            ["💻", "নতুন প্রযুক্তি পার্ক উদ্বোধন", "৫ ঘণ্টা আগে"],
            ["🌧️", "আবহাওয়া: ভারী বৃষ্টির পূর্বাভাস", "৮ ঘণ্টা আগে"],
          ].map(([e, t, time], i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2">
              <span className="text-2xl">{e}</span>
              <div><p className="text-[11px] font-bold text-slate-800">{t}</p><p className="text-[10px] text-slate-400">{time}</p></div>
            </div>
          ))}
        </div>
      </Frame>
    ),
  },
  {
    slug: "realestate",
    name: "স্বপ্ন নিবাস",
    type: "রিয়েল এস্টেট",
    desc: "প্রপার্টি লিস্টিং, ফিল্টার, ভিজিট বুকিংসহ হাউজিং সাইট।",
    price: "৳১২,৯৯৯ থেকে",
    render: () => (
      <Frame>
        <Nav logo="🏠 স্বপ্ন নিবাস" links={["ফ্ল্যাট", "প্লট", "বাণিজ্যিক"]} cta="যোগাযোগ" />
        <div className="bg-gradient-to-br from-blue-700 to-indigo-900 px-4 py-7 text-white">
          <p className="text-xl font-black">আপনার স্বপ্নের ঠিকানা</p>
          <p className="text-[11px] opacity-80">ঢাকা • চট্টগ্রাম • সিলেট</p>
          <div className="mt-3 flex gap-2">
            <span className="rounded-lg bg-white/20 px-3 py-1.5 text-[10px]">📍 লোকেশন</span>
            <span className="rounded-lg bg-white/20 px-3 py-1.5 text-[10px]">💰 বাজেট</span>
            <span className="rounded-lg bg-amber-400 px-3 py-1.5 text-[10px] font-bold text-black">🔍 খুঁজুন</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 p-3">
          {["🏢 গুলশান ফ্ল্যাট", "🏡 উত্তরা ডুপ্লেক্স"].map((t, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-slate-200">
              <div className="grid h-16 place-items-center bg-gradient-to-br from-blue-100 to-indigo-200 text-3xl">{i === 0 ? "🏢" : "🏡"}</div>
              <p className="p-2 text-[11px] font-bold text-slate-800">{t}</p>
              <p className="px-2 pb-2 text-[10px] font-bold text-blue-700">৳{(i + 1) * 85} লাখ</p>
            </div>
          ))}
        </div>
      </Frame>
    ),
  },
  {
    slug: "gym",
    name: "পাওয়ার জিম",
    type: "জিম ও ফিটনেস",
    desc: "মেম্বারশিপ প্ল্যান, ট্রেইনার, শিডিউলসহ ফিটনেস সাইট।",
    price: "৳৪,৯৯৯ থেকে",
    render: () => (
      <Frame dark>
        <Nav logo="💪 পাওয়ার জিম" links={["প্ল্যান", "ট্রেইনার", "গ্যালারি"]} cta="জয়েন করুন" light />
        <div className="bg-gradient-to-br from-red-700 via-black to-red-900 px-4 py-8 text-white">
          <p className="text-[10px] tracking-widest text-red-300">NO PAIN • NO GAIN</p>
          <p className="mt-1 text-2xl font-black">শরীর গড়ুন<br />আত্মবিশ্বাস বাড়ান</p>
          <span className="mt-3 inline-block rounded-full bg-red-600 px-4 py-1.5 text-[11px] font-bold">ফ্রি ট্রায়াল নিন</span>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3 text-center">
          {["মাসিক ৳১৫০০", "৬ মাস ৳৭০০০", "বাৎসরিক ৳১২০০০"].map((p, i) => (
            <div key={i} className={`rounded-xl p-2 text-[10px] ${i === 1 ? "bg-red-600 text-white" : "bg-white/5 text-slate-300"}`}>
              <p className="font-bold">{p}</p>
            </div>
          ))}
        </div>
      </Frame>
    ),
  },
  {
    slug: "travel",
    name: "ঘুরে আসি",
    type: "ট্রাভেল এজেন্সি",
    desc: "ট্যুর প্যাকেজ, বুকিং, রিভিউসহ ট্রাভেল সাইট।",
    price: "৳৯,৯৯৯ থেকে",
    render: () => (
      <Frame>
        <Nav logo="✈️ ঘুরে আসি" links={["দেশি", "বিদেশি", "হোটেল"]} cta="বুক করুন" />
        <div className="bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-700 px-4 py-8 text-white">
          <p className="text-xl font-black">পৃথিবী ঘুরে দেখুন</p>
          <p className="text-[11px] opacity-90">কক্সবাজার থেকে মালদ্বীপ!</p>
          <div className="mt-3 flex gap-2 text-[10px]">
            <span className="rounded-lg bg-white/25 px-3 py-1.5">📅 তারিখ</span>
            <span className="rounded-lg bg-white/25 px-3 py-1.5">👥 গেস্ট</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3">
          {["🏖️ কক্সবাজার", "🏔️ সাজেক", "🕌 ইস্তাম্বুল"].map((t, i) => (
            <div key={i} className="rounded-xl bg-teal-50 p-2 text-center">
              <div className="text-2xl">{t.split(" ")[0]}</div>
              <p className="text-[10px] font-bold text-teal-800">{t.split(" ")[1]}</p>
              <p className="text-[10px] text-teal-600">৳{(i + 2) * 4500}</p>
            </div>
          ))}
        </div>
      </Frame>
    ),
  },
  {
    slug: "saas",
    name: "ক্লাউড সেবা",
    type: "টেক স্টার্টআপ (SaaS)",
    desc: "ল্যান্ডিং পেজ, প্রাইসিং, সাইনআপসহ SaaS সাইট।",
    price: "৳১২,৯৯৯ থেকে",
    render: () => (
      <Frame dark>
        <Nav logo="☁️ ক্লাউড সেবা" links={["ফিচার", "প্রাইসিং", "ডকস"]} cta="ফ্রি ট্রায়াল" light />
        <div className="px-4 py-8 text-center text-white">
          <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-[10px] text-indigo-300 ring-1 ring-indigo-400/40">🚀 নতুন v2.0 লাইভ</span>
          <p className="mt-3 text-2xl font-black">ব্যবসা চালান<br /><span className="bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">অটোপাইলটে</span></p>
          <p className="mt-2 text-[11px] text-slate-400">১০,০০০+ কোম্পানির বিশ্বস্ত প্ল্যাটফর্ম</p>
        </div>
        <div className="mx-4 mb-3 grid grid-cols-3 gap-2 text-center">
          {["বেসিক ৳৯৯০", "প্রো ৳২৯৯০", "এন্টারপ্রাইজ"].map((p, i) => (
            <div key={i} className={`rounded-xl p-2 text-[10px] ${i === 1 ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-300"}`}>
              <p className="font-bold">{p}</p>
            </div>
          ))}
        </div>
      </Frame>
    ),
  },
  {
    slug: "salon",
    name: "রূপচর্চা",
    type: "বিউটি পার্লার",
    desc: "সার্ভিস মেনু, অ্যাপয়েন্টমেন্ট বুকিংসহ পার্লার সাইট।",
    price: "৳৪,৯৯৯ থেকে",
    render: () => (
      <Frame>
        <Nav logo="💅 রূপচর্চা" links={["সার্ভিস", "গ্যালারি", "অফার"]} cta="বুকিং দিন" />
        <div className="bg-gradient-to-br from-rose-400 via-pink-500 to-fuchsia-600 px-4 py-8 text-white">
          <p className="text-xl font-black">নিজেকে নতুন করে<br />আবিষ্কার করুন</p>
          <p className="mt-1 text-[11px] opacity-90">এক্সপার্ট বিউটিশিয়ান • প্রিমিয়াম প্রোডাক্ট</p>
        </div>
        <div className="space-y-2 p-3">
          {["💇 হেয়ার কাট ৳৩০০", "💆 ফেসিয়াল ৳৮০০", "💅 ম্যানিকিউর ৳৫০০"].map((s, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-900">
              <span>{s}</span><span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] text-white">বুক</span>
            </div>
          ))}
        </div>
      </Frame>
    ),
  },
  {
    slug: "gadget",
    name: "টেক জোন",
    type: "ইলেকট্রনিক্স শপ",
    desc: "প্রোডাক্ট ক্যাটালগ, EMI, ওয়ারেন্টিসহ গ্যাজেট শপ।",
    price: "৳১২,৯৯৯ থেকে",
    render: () => (
      <Frame dark>
        <Nav logo="🔌 টেক জোন" links={["মোবাইল", "ল্যাপটপ", "অ্যাক্সেসরিজ"]} cta="কার্ট" light />
        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 px-4 py-6 text-white">
          <p className="text-lg font-black">⚡ মেগা টেক ফেস্ট</p>
          <p className="text-[11px] opacity-90">EMI সুবিধা • অফিসিয়াল ওয়ারেন্টি</p>
        </div>
        <div className="grid grid-cols-4 gap-2 p-3">
          {["📱", "💻", "🎧", "⌚"].map((e, i) => (
            <div key={i} className="rounded-xl bg-white/5 p-2 text-center">
              <div className="text-2xl">{e}</div>
              <p className="mt-1 text-[10px] font-bold text-cyan-300">৳{(i + 1) * 8990}</p>
            </div>
          ))}
        </div>
        <p className="bg-cyan-500/10 px-4 py-2 text-center text-[10px] text-cyan-300">🚚 ঢাকায় ২৪ ঘণ্টায় ডেলিভারি</p>
      </Frame>
    ),
  },
];
