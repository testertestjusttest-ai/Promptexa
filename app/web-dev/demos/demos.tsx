import { toBnDigits } from "@/lib/format";

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
  group?: string;
  render: () => React.ReactNode;
};

const HAND_GROUPS: Record<string, string> = {
  restaurant: "🍔 খাবার", fashion: "🛍️ শপিং", portfolio: "🎨 পোর্টফোলিও",
  news: "📰 মিডিয়া", realestate: "🏠 প্রপার্টি", gym: "💪 ফিটনেস",
  travel: "✈️ বুকিং", saas: "☁️ সফটওয়্যার", salon: "💅 বিউটি", gadget: "🔌 টেক",
  investpro: "💰 ফিনটেক", agroinvest: "💰 ফিনটেক", swiftex: "💰 ফিনটেক",
  payex: "💰 ফিনটেক", cryptovault: "💰 ফিনটেক", trustpay: "💰 ফিনটেক",
  binancepro: "💰 ফিনটেক", casinoplay: "🎰 গেমিং",
};

const HAND_DEMOS: Demo[] = [
  {
    slug: "binancepro",
    name: "বাইন্যান্সপ্রো",
    type: "ক্রিপ্টো এক্সচেঞ্জ",
    desc: "স্পট, ফিউচার্স, P2P, লঞ্চপ্যাড, স্টেকিং — Binance-স্টাইল ৬৬+ পেজের পূর্ণাঙ্গ ক্রিপ্টো এক্সচেঞ্জ।",
    price: "২৪,৯৯৯ টাকা থেকে",
    render: () => (
      <Frame dark>
        <Nav logo="🪙 বাইন্যান্সপ্রো" links={["মার্কেট", "ট্রেড"]} cta="লগইন" light />
        <div className="bg-gradient-to-br from-[#f0b90b] via-[#181a20] to-[#0b0e11] px-4 py-6 text-white">
          <p className="text-[10px] font-black tracking-widest text-[#f0b90b]">📊 ক্রিপ্টো এক্সচেঞ্জ</p>
          <div className="mt-3 space-y-1.5">
            {[["₿ BTC", "$67,250", "+2.4%", "#0ecb81"], ["Ξ ETH", "$3,510", "+1.8%", "#0ecb81"], ["🟡 BNB", "$598", "-0.7%", "#f6465d"]].map(([c, p, ch, col]) => (
              <div key={c} className="flex items-center justify-between rounded-xl bg-black/40 px-3 py-1.5">
                <span className="text-[11px] font-black">{c}</span>
                <span className="text-[11px] font-bold">{p}</span>
                <span className="text-[10px] font-black" style={{ color: col }}>{ch}</span>
              </div>
            ))}
          </div>
          <span className="mt-3 inline-block rounded-full bg-[#f0b90b] px-4 py-1.5 text-[11px] font-black text-black">ট্রেড শুরু করুন</span>
        </div>
        <p className="bg-black/40 px-4 py-2 text-center text-[10px] text-slate-500">৬৬+ পেজ • স্পট • ফিউচার্স • P2P</p>
      </Frame>
    ),
  },
  {
    slug: "restaurant",
    name: "স্বাদের ঠিকানা",
    type: "রেস্টুরেন্ট ওয়েবসাইট",
    desc: "মেনু, অনলাইন অর্ডার, টেবিল বুকিংসহ সম্পূর্ণ রেস্টুরেন্ট সাইট।",
    price: "৪,৯৯৯ টাকা থেকে",
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
              <p className="font-bold text-amber-300">২৫০ টাকা</p>
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
    price: "১২,৯৯৯ টাকা থেকে",
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
              <p className="mt-1 text-[10px] font-bold text-slate-700">{toBnDigits(((i + 1) * 499).toLocaleString("en-IN"))} টাকা</p>
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
    slug: "investpro",
    name: "ইনভেস্টপ্রো",
    type: "বিনিয়োগ প্ল্যাটফর্ম",
    desc: "বিনিয়োগ প্ল্যান, লাইভ ড্যাশবোর্ড, মুনাফা ট্র্যাকিংসহ সম্পূর্ণ সাইট।",
    price: "১৪,৯৯৯ টাকা থেকে",
    render: () => (
      <Frame dark>
        <Nav logo="📈 ইনভেস্টপ্রো" links={["প্ল্যান", "ড্যাশবোর্ড"]} cta="বিনিয়োগ করুন" light />
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 px-4 py-7 text-white">
          <p className="text-xl font-black">টাকা বাড়ান স্মার্ট বিনিয়োগে</p>
          <p className="mt-1 text-[11px] opacity-80">মাসে ১২% পর্যন্ত মুনাফা</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[["🌱", "৮%"], ["🚀", "১২%"], ["💎", "১৮%"]].map(([e, r]) => (
              <div key={r} className="rounded-xl bg-white/10 p-2 text-center">
                <div className="text-xl">{e}</div><p className="mt-1 text-[11px] font-black text-emerald-300">{r}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="bg-black/40 px-4 py-2 text-center text-[10px] text-slate-500">💼 ৫০,০০০+ বিনিয়োগকারী</p>
      </Frame>
    ),
  },
  {
    slug: "swiftex",
    name: "সুইফটএক্স",
    type: "কারেন্সি এক্সচেঞ্জ",
    desc: "লাইভ রেট, কনভার্টার, এক্সচেঞ্জ ট্র্যাকিংসহ মুদ্রা বিনিময় সাইট।",
    price: "১২,৯৯৯ টাকা থেকে",
    render: () => (
      <Frame dark>
        <Nav logo="💱 সুইফটএক্স" links={["রেট", "ট্র্যাক"]} cta="এক্সচেঞ্জ" light />
        <div className="bg-gradient-to-br from-blue-600 to-indigo-800 px-4 py-7 text-white">
          <p className="text-xl font-black">সব কারেন্সি, এক প্ল্যাটফর্মে</p>
          <div className="mt-3 rounded-xl bg-black/30 p-3">
            <div className="flex items-center justify-between text-[11px]">
              <span>💵 USD → 🇧🇩 BDT</span><span className="font-black text-blue-300">১২১.৫</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span>₿ BTC → 🇧🇩 BDT</span><span className="font-black text-blue-300">৮১,৫০,০০০</span>
            </div>
          </div>
        </div>
        <p className="bg-black/40 px-4 py-2 text-center text-[10px] text-slate-500">⚡ ৫ মিনিটে ডেলিভারি</p>
      </Frame>
    ),
  },
  {
    slug: "cryptovault",
    name: "ক্রিপ্টোভল্ট",
    type: "ক্রিপ্টো ওয়ালেট",
    desc: "ব্যালেন্স, সেন্ড/রিসিভ, লেনদেন হিস্ট্রিসহ ক্রিপ্টো ওয়ালেট সাইট।",
    price: "১৯,৯৯৯ টাকা থেকে",
    render: () => (
      <Frame dark>
        <Nav logo="🔐 ক্রিপ্টোভল্ট" links={["ওয়ালেট", "সেন্ড"]} cta="শুরু করুন" light />
        <div className="bg-gradient-to-br from-violet-600 to-purple-800 px-4 py-7 text-white">
          <p className="text-[11px] opacity-70">মোট পোর্টফোলিও</p>
          <p className="text-2xl font-black">$২৪,৩৫০</p>
          <div className="mt-3 space-y-1.5">
            {[["₿", "BTC", "০.২৪৫"], ["Ξ", "ETH", "৩.৮"]].map(([e, c, b]) => (
              <div key={c} className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-[11px]">
                <span>{e} {c}</span><span className="font-bold">{b}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="bg-black/40 px-4 py-2 text-center text-[10px] text-slate-500">🛡️ ২-স্তর নিরাপত্তা</p>
      </Frame>
    ),
  },
  {
    slug: "trustpay",
    name: "ট্রাস্টপে",
    type: "ট্রাস্ট ওয়ালেট স্টাইল",
    desc: "সোয়াপ, স্টেকিং, DApp সাপোর্টসহ মাল্টি-কয়েন ওয়ালেট।",
    price: "১৯,৯৯৯ টাকা থেকে",
    render: () => (
      <Frame dark>
        <Nav logo="🛡️ ট্রাস্টপে" links={["সোয়াপ", "স্টেক"]} cta="ডাউনলোড" light />
        <div className="bg-gradient-to-br from-sky-600 to-blue-800 px-4 py-7 text-white">
          <p className="text-[11px] opacity-70">মোট ব্যালেন্স</p>
          <p className="text-2xl font-black">$৩৭,০০৯</p>
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {[["📤", "সেন্ড"], ["📥", "রিসিভ"], ["🔄", "সোয়াপ"], ["📊", "স্টেক"]].map(([e, t]) => (
              <div key={t} className="rounded-xl bg-white/10 p-2 text-center">
                <div className="text-lg">{e}</div><p className="mt-0.5 text-[9px]">{t}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="bg-black/40 px-4 py-2 text-center text-[10px] text-slate-500">🌐 ১০M+ ইউজার</p>
      </Frame>
    ),
  },
  {
    slug: "casinoplay",
    name: "ক্যাসিনোপ্লে",
    type: "ক্যাসিনো ও স্পোর্টস বেটিং",
    desc: "লাইভ বেটিং, ৫০০+ ক্যাসিনো গেম, তিন পাত্তি, ক্র্যাশ — ৬০+ পেজের গেমিং প্ল্যাটফর্ম।",
    price: "২৪,৯৯৯ টাকা থেকে",
    render: () => (
      <Frame dark>
        <Nav logo="🎰 ক্যাসিনোপ্লে" links={["স্পোর্টস", "লাইভ"]} cta="খেলুন" light />
        <div className="bg-gradient-to-br from-amber-600 via-[#1a1405] to-[#0b1120] px-4 py-6 text-white">
          <p className="text-center text-[11px] font-black text-[#f5c518]">🔴 ৬টি ম্যাচ লাইভ</p>
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {[["🎰", "স্লটস"], ["🪔", "তিন পাত্তি"], ["📈", "ক্র্যাশ"]].map(([e, t]) => (
              <div key={t} className="rounded-xl border border-[#f5c518]/30 bg-black/40 p-2 text-center">
                <div className="text-xl">{e}</div><p className="mt-0.5 text-[9px] font-bold">{t}</p>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-3 flex max-w-[200px] items-center justify-between rounded-xl bg-white/10 px-3 py-1.5">
            <span className="text-[10px]">ঢাকা 🆚 কুমিল্লা</span>
            <span className="text-[10px] font-black text-[#f5c518]">১.৮৫</span>
          </div>
        </div>
        <p className="bg-black/40 px-4 py-2 text-center text-[10px] text-slate-500">💰 ১ কোটি+ জ্যাকপট</p>
      </Frame>
    ),
  },
  {
    slug: "agroinvest",
    name: "এগ্রোইনভেস্ট",
    type: "কৃষি বিনিয়োগ",
    desc: "ধান, মাছ, ডেইরি প্রকল্পে বিনিয়োগের কৃষি প্ল্যাটফর্ম।",
    price: "১৪,৯৯৯ টাকা থেকে",
    render: () => (
      <Frame>
        <Nav logo="🌾 এগ্রোইনভেস্ট" links={["প্রকল্প", "ড্যাশবোর্ড"]} cta="বিনিয়োগ" />
        <div className="bg-gradient-to-br from-lime-600 to-green-700 px-4 py-7 text-white">
          <p className="font-serif text-xl font-bold">কৃষিতে বিনিয়োগ, প্রকৃতির সাথে লাভ</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[["🌾", "১৫%"], ["🐟", "২০%"], ["🐄", "২২%"]].map(([e, r]) => (
              <div key={r} className="rounded-xl bg-white/15 p-2 text-center">
                <div className="text-xl">{e}</div><p className="mt-1 text-[11px] font-black">{r}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="bg-green-50 px-4 py-2 text-center text-[10px] text-green-700">🌱 সরাসরি খামারে বিনিয়োগ</p>
      </Frame>
    ),
  },
  {
    slug: "payex",
    name: "পেএক্স",
    type: "মোবাইল ব্যাংকিং এক্সচেঞ্জ",
    desc: "বিকাশ ↔ নগদ ↔ রকেট ব্যালেন্স এক্সচেঞ্জ সাইট।",
    price: "৯,৯৯৯ টাকা থেকে",
    render: () => (
      <Frame>
        <Nav logo="📲 পেএক্স" links={["এক্সচেঞ্জ", "রেট"]} cta="শুরু করুন" />
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 px-4 py-7 text-white">
          <p className="text-xl font-black">বিকাশ ↔ নগদ ↔ রকেট</p>
          <p className="mt-1 text-[11px] opacity-90">মাত্র ২% চার্জে ব্যালেন্স বদলান</p>
          <div className="mt-3 flex justify-center gap-2">
            {["🩷", "🧡", "💜", "💚"].map((e, i) => (
              <span key={i} className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20 text-xl">{e}</span>
            ))}
          </div>
        </div>
        <p className="bg-orange-50 px-4 py-2 text-center text-[10px] text-orange-700">⚡ তাৎক্ষণিক ট্রান্সফার</p>
      </Frame>
    ),
  },
  {
    slug: "portfolio",
    name: "লেন্স ও আলো",
    type: "ফটোগ্রাফার পোর্টফোলিও",
    desc: "গ্যালারি, বুকিং ফর্মসহ মিনিমাল পোর্টফোলিও সাইট।",
    price: "৪,৯৯৯ টাকা থেকে",
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
    price: "৯,৯৯৯ টাকা থেকে",
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
    price: "১২,৯৯৯ টাকা থেকে",
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
              <p className="px-2 pb-2 text-[10px] font-bold text-blue-700">{toBnDigits((i + 1) * 85)} লাখ টাকা</p>
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
    price: "৪,৯৯৯ টাকা থেকে",
    render: () => (
      <Frame dark>
        <Nav logo="💪 পাওয়ার জিম" links={["প্ল্যান", "ট্রেইনার", "গ্যালারি"]} cta="জয়েন করুন" light />
        <div className="bg-gradient-to-br from-red-700 via-black to-red-900 px-4 py-8 text-white">
          <p className="text-[10px] tracking-widest text-red-300">NO PAIN • NO GAIN</p>
          <p className="mt-1 text-2xl font-black">শরীর গড়ুন<br />আত্মবিশ্বাস বাড়ান</p>
          <span className="mt-3 inline-block rounded-full bg-red-600 px-4 py-1.5 text-[11px] font-bold">ফ্রি ট্রায়াল নিন</span>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3 text-center">
          {["মাসিক ১,৫০০ টাকা", "৬ মাস ৭,০০০ টাকা", "বাৎসরিক ১২,০০০ টাকা"].map((p, i) => (
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
    price: "৯,৯৯৯ টাকা থেকে",
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
              <p className="text-[10px] text-teal-600">{toBnDigits(((i + 2) * 4500).toLocaleString("en-IN"))} টাকা</p>
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
    price: "১২,৯৯৯ টাকা থেকে",
    render: () => (
      <Frame dark>
        <Nav logo="☁️ ক্লাউড সেবা" links={["ফিচার", "প্রাইসিং", "ডকস"]} cta="ফ্রি ট্রায়াল" light />
        <div className="px-4 py-8 text-center text-white">
          <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-[10px] text-indigo-300 ring-1 ring-indigo-400/40">🚀 নতুন v2.0 লাইভ</span>
          <p className="mt-3 text-2xl font-black">ব্যবসা চালান<br /><span className="bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">অটোপাইলটে</span></p>
          <p className="mt-2 text-[11px] text-slate-400">১০,০০০+ কোম্পানির বিশ্বস্ত প্ল্যাটফর্ম</p>
        </div>
        <div className="mx-4 mb-3 grid grid-cols-3 gap-2 text-center">
          {["বেসিক ৯৯০ টাকা", "প্রো ২,৯৯০ টাকা", "এন্টারপ্রাইজ"].map((p, i) => (
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
    price: "৪,৯৯৯ টাকা থেকে",
    render: () => (
      <Frame>
        <Nav logo="💅 রূপচর্চা" links={["সার্ভিস", "গ্যালারি", "অফার"]} cta="বুকিং দিন" />
        <div className="bg-gradient-to-br from-rose-400 via-pink-500 to-fuchsia-600 px-4 py-8 text-white">
          <p className="text-xl font-black">নিজেকে নতুন করে<br />আবিষ্কার করুন</p>
          <p className="mt-1 text-[11px] opacity-90">এক্সপার্ট বিউটিশিয়ান • প্রিমিয়াম প্রোডাক্ট</p>
        </div>
        <div className="space-y-2 p-3">
          {["💇 হেয়ার কাট ৩০০ টাকা", "💆 ফেসিয়াল ৮০০ টাকা", "💅 ম্যানিকিউর ৫০০ টাকা"].map((s, i) => (
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
    price: "১২,৯৯৯ টাকা থেকে",
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
              <p className="mt-1 text-[10px] font-bold text-cyan-300">{toBnDigits(((i + 1) * 8990).toLocaleString("en-IN"))} টাকা</p>
            </div>
          ))}
        </div>
        <p className="bg-cyan-500/10 px-4 py-2 text-center text-[10px] text-cyan-300">🚚 ঢাকায় ২৪ ঘণ্টায় ডেলিভারি</p>
      </Frame>
    ),
  },
];

/* ---- merge engine demos (40) ---- */
import { ENGINE_DEMOS } from "./engine-demos";

const WITH_GROUPS: Demo[] = HAND_DEMOS.map((d) => ({ ...d, group: HAND_GROUPS[d.slug] ?? "🌐 অন্যান্য" }));

/** All demos: 15 hand-crafted + 40 engine-driven = 55. */
export const DEMOS: Demo[] = [...WITH_GROUPS, ...ENGINE_DEMOS];
