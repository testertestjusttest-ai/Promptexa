
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
  restaurant: "🍔 Food", fashion: "🛍️ Shopping", portfolio: "🎨 Portfolio",
  news: "📰 মিডিয়া", realestate: "🏠 Property", gym: "💪 Fitness",
  travel: "✈️ Booking", saas: "☁️ Software", salon: "💅 বিউটি", gadget: "🔌 Tech",
  investpro: "💰 ফিনটেক", agroinvest: "💰 ফিনটেক", swiftex: "💰 ফিনটেক",
  payex: "💰 ফিনটেক", cryptovault: "💰 ফিনটেক", trustpay: "💰 ফিনটেক",
  binancepro: "💰 ফিনটেক", casinoplay: "🎰 গেমিং", buyinghouse: "🏭 Garments",
  jewelry: "🛍️ Shopping",
  nursery: "🌿 Garden",
  cleaning: "🛠️ Services",
  painting: "🛠️ Services",
  fitnesscourse: "💪 Fitness",
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
    slug: "buyinghouse",
    name: "TexBridge Sourcing",
    type: "Garments Buying House",
    desc: "Complete buying-house website for international buyers — sourcing, QC, RFQ system and a professional admin panel.",
    price: "From 12,999 Tk",
    render: () => (
      <Frame>
        <Nav logo="🧵 TexBridge" links={["Services", "Products"]} cta="Send RFQ" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/bh-img/hero.webp" alt="TexBridge showroom" className="h-24 w-full object-cover" />
        <div className="bg-white px-4 py-3">
          <p className="text-sm font-black leading-snug text-slate-900">World-class garment sourcing from Bangladesh</p>
          <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center">
            {[["Global", "Sourcing"], ["AQL", "QC Reports"], ["RFQ", "System"]].map(([v, t]) => (
              <div key={t} className="rounded-xl bg-sky-50 px-2 py-1.5 ring-1 ring-sky-100">
                <p className="text-[11px] font-black text-sky-700">{v}</p>
                <p className="text-[9px] font-bold text-slate-500">{t}</p>
              </div>
            ))}
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-1.5">
            <span className="rounded-xl bg-sky-600 px-3 py-1.5 text-center text-[11px] font-black text-white">📩 Free Quote</span>
            <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-center text-[11px] font-black text-slate-600 ring-1 ring-slate-200">👕 Products</span>
          </div>
        </div>
        <p className="bg-slate-50 px-4 py-2 text-center text-[10px] font-bold text-slate-400">RFQ system • AQL QC reports • Operations admin</p>
      </Frame>
    ),
  },
  {
    slug: "jewelry",
    name: "AURELIA",
    type: "Luxury Jewelry Shop",
    desc: "London fine jewelry atelier — handcrafted rings, necklaces, bespoke commissions, cart and checkout in a luxury e-commerce website.",
    price: "From 12,999 Tk",
    render: () => (
      <Frame dark>
        <Nav logo="💎 AURELIA" links={["Collection", "Atelier"]} cta="Shop Now" light />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/jw-img/hero.webp" alt="AURELIA solitaire ring" className="h-24 w-full object-cover" />
        <div className="bg-[#0b0b0f] px-4 py-3">
          <p className="text-sm font-black leading-snug text-[#f5efe4]">Jewelry that outlives the moment it marks</p>
          <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center">
            {[["Handcrafted", "Design"], ["Certified", "Stones"], ["Bespoke", "Commissions"]].map(([v, t]) => (
              <div key={t} className="rounded-xl bg-white/5 px-2 py-1.5 ring-1 ring-[#c9a24b]/30">
                <p className="text-[11px] font-black text-[#e8cf8f]">{v}</p>
                <p className="text-[9px] font-bold text-slate-400">{t}</p>
              </div>
            ))}
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-1.5">
            <span className="rounded-xl bg-[#c9a24b] px-3 py-1.5 text-center text-[11px] font-black text-[#0b0b0f]">💎 View Collection</span>
            <span className="rounded-xl bg-white/10 px-3 py-1.5 text-center text-[11px] font-black text-[#f5efe4] ring-1 ring-white/15">✦ Bespoke Commission</span>
          </div>
        </div>
        <p className="bg-black/40 px-4 py-2 text-center text-[10px] text-slate-500">Cart • Checkout • Concierge contact • Atelier admin</p>
      </Frame>
    ),
  },
  {
    slug: "restaurant",
    name: "Taste Address",
    type: "Restaurant Website",
    desc: "Complete restaurant site with menu, online ordering and table booking.",
    price: "From 4,999 Tk",
    render: () => (
      <Frame dark>
        <Nav logo="🍔 Taste Address" links={["Menu", "Offers", "Reviews"]} cta="Order Now" light />
        <div className="bg-gradient-to-br from-orange-600 via-red-600 to-amber-700 px-4 py-8 text-white">
          <p className="text-[10px] tracking-widest opacity-80">🔥 Special Offer</p>
          <p className="mt-1 text-xl font-black">Restaurant taste, at your home</p>
          <p className="mt-1 text-[11px] opacity-80">Home delivery</p>
          <span className="mt-3 inline-block rounded-full bg-white px-4 py-1.5 text-[11px] font-bold text-red-600">View Menu</span>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3">
          {["🍕 Pizza", "🍗 Chicken", "🍰 Dessert"].map((f) => (
            <div key={f} className="rounded-xl bg-white/5 p-2 text-center text-[11px] text-white">
              <div className="text-xl">{f.split(" ")[0]}</div><p className="mt-1 opacity-80">{f.split(" ")[1]}</p>
              <p className="font-bold text-amber-300">250 Tk</p>
            </div>
          ))}
        </div>
        <p className="bg-black/40 px-4 py-2 text-center text-[10px] text-slate-500">© Taste Address</p>
      </Frame>
    ),
  },
  {
    slug: "fashion",
    name: "Style Hub",
    type: "Fashion E-commerce",
    desc: "Fashion shop with cart, mobile payments and order tracking.",
    price: "From 12,999 Tk",
    render: () => (
      <Frame>
        <Nav logo="👗 Style Hub" links={["Sarees", "Panjabis", "Offers"]} cta="Cart (2)" />
        <div className="bg-gradient-to-r from-pink-500 to-fuchsia-600 px-4 py-7 text-white">
          <p className="text-xl font-black">Festive Collection 2026</p>
          <p className="text-[11px] opacity-90">Up to 50% off!</p>
        </div>
        <div className="grid grid-cols-4 gap-2 p-3">
          {["👚", "👔", "👠", "👜"].map((e, i) => (
            <div key={i} className="rounded-xl bg-slate-100 p-2 text-center">
              <div className="text-2xl">{e}</div>
              <p className="mt-1 text-[10px] font-bold text-slate-700">{((i + 1) * 499).toLocaleString("en-US")} Tk</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between bg-pink-50 px-4 py-2 text-[10px] text-pink-700">
          <span>🚚 Nationwide delivery</span><span>💳 bKash/Nagad</span>
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
    name: "Lens & Light",
    type: "Photographer Portfolio",
    desc: "Minimal portfolio site with gallery and booking form.",
    price: "From 4,999 Tk",
    render: () => (
      <Frame dark>
        <Nav logo="📸 Lens & Light" links={["Gallery", "Services", "Contact"]} cta="Book Now" light />
        <div className="px-4 py-8 text-center text-white">
          <p className="text-[10px] tracking-[0.3em] text-slate-400">WEDDING • PORTRAIT • EVENT</p>
          <p className="mt-2 text-2xl font-black">Capturing moments<br />for a lifetime</p>
        </div>
        <div className="grid grid-cols-3 gap-1 p-2">
          {["🌅", "👰", "🎭", "🏙️", "🌊", "🎪"].map((e, i) => (
            <div key={i} className="grid h-16 place-items-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-2xl">{e}</div>
          ))}
        </div>
        <p className="px-4 py-3 text-center text-[10px] text-slate-500">Wedding • Portrait • Event coverage</p>
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
    name: "Dream Home",
    type: "Real Estate",
    desc: "Housing site with property listings, filters and visit booking.",
    price: "From 12,999 Tk",
    render: () => (
      <Frame>
        <Nav logo="🏠 Dream Home" links={["Flats", "Plots", "Commercial"]} cta="Contact" />
        <div className="bg-gradient-to-br from-blue-700 to-indigo-900 px-4 py-7 text-white">
          <p className="text-xl font-black">Your dream address</p>
          <p className="text-[11px] opacity-80">Dhaka • Chattogram • Sylhet</p>
          <div className="mt-3 flex gap-2">
            <span className="rounded-lg bg-white/20 px-3 py-1.5 text-[10px]">📍 Location</span>
            <span className="rounded-lg bg-white/20 px-3 py-1.5 text-[10px]">💰 Budget</span>
            <span className="rounded-lg bg-amber-400 px-3 py-1.5 text-[10px] font-bold text-black">🔍 Search</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 p-3">
          {["🏢 Gulshan Flat", "🏡 Uttara Duplex"].map((t, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-slate-200">
              <div className="grid h-16 place-items-center bg-gradient-to-br from-blue-100 to-indigo-200 text-3xl">{i === 0 ? "🏢" : "🏡"}</div>
              <p className="p-2 text-[11px] font-bold text-slate-800">{t}</p>
              <p className="px-2 pb-2 text-[10px] font-bold text-blue-700">{(i + 1) * 85} lakh Tk</p>
            </div>
          ))}
        </div>
      </Frame>
    ),
  },
  {
    slug: "gym",
    name: "Power Gym",
    type: "Gym & Fitness",
    desc: "Fitness site with membership plans, trainers and schedules.",
    price: "From 4,999 Tk",
    render: () => (
      <Frame dark>
        <Nav logo="💪 Power Gym" links={["Plans", "Trainers", "Gallery"]} cta="Join Now" light />
        <div className="bg-gradient-to-br from-red-700 via-black to-red-900 px-4 py-8 text-white">
          <p className="text-[10px] tracking-widest text-red-300">NO PAIN • NO GAIN</p>
          <p className="mt-1 text-2xl font-black">Build your body<br />Grow your confidence</p>
          <span className="mt-3 inline-block rounded-full bg-red-600 px-4 py-1.5 text-[11px] font-bold">Try Free</span>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3 text-center">
          {["Monthly 1,500 Tk", "6 months 7,000 Tk", "Yearly 12,000 Tk"].map((p, i) => (
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
    name: "Let's Travel",
    type: "Travel Agency",
    desc: "Travel site with tour packages, booking and reviews.",
    price: "From 9,999 Tk",
    render: () => (
      <Frame>
        <Nav logo="✈️ Let's Travel" links={["Local", "International", "Hotels"]} cta="Book Now" />
        <div className="bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-700 px-4 py-8 text-white">
          <p className="text-xl font-black">Explore the world</p>
          <p className="text-[11px] opacity-90">From Cox's Bazar to Maldives!</p>
          <div className="mt-3 flex gap-2 text-[10px]">
            <span className="rounded-lg bg-white/25 px-3 py-1.5">📅 Date</span>
            <span className="rounded-lg bg-white/25 px-3 py-1.5">👥 Guests</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3">
          {[["🏖️", "Cox's Bazar"], ["🏔️", "Sajek"], ["🕌", "Istanbul"]].map(([e, t], i) => (
            <div key={i} className="rounded-xl bg-teal-50 p-2 text-center">
              <div className="text-2xl">{e}</div>
              <p className="text-[10px] font-bold text-teal-800">{t}</p>
              <p className="text-[10px] text-teal-600">{((i + 2) * 4500).toLocaleString("en-US")} Tk</p>
            </div>
          ))}
        </div>
      </Frame>
    ),
  },
  {
    slug: "saas",
    name: "CloudServe",
    type: "Tech Startup (SaaS)",
    desc: "SaaS site with landing page, pricing and signup.",
    price: "From 12,999 Tk",
    render: () => (
      <Frame dark>
        <Nav logo="☁️ CloudServe" links={["Features", "Pricing", "Docs"]} cta="Free Trial" light />
        <div className="px-4 py-8 text-center text-white">
          <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-[10px] text-indigo-300 ring-1 ring-indigo-400/40">🚀 New v2.0 live</span>
          <p className="mt-3 text-2xl font-black">Run your business<br /><span className="bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">on autopilot</span></p>
          <p className="mt-2 text-[11px] text-slate-400">A platform teams rely on</p>
        </div>
        <div className="mx-4 mb-3 grid grid-cols-3 gap-2 text-center">
          {["Basic 990 Tk", "Pro 2,990 Tk", "Enterprise"].map((p, i) => (
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
    name: "Tech Zone",
    type: "Electronics Shop",
    desc: "Gadget shop with product catalogue, EMI and warranty.",
    price: "From 12,999 Tk",
    render: () => (
      <Frame dark>
        <Nav logo="🔌 Tech Zone" links={["Mobiles", "Laptops", "Accessories"]} cta="Cart" light />
        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 px-4 py-6 text-white">
          <p className="text-lg font-black">⚡ Mega Tech Fest</p>
          <p className="text-[11px] opacity-90">EMI available • Official warranty</p>
        </div>
        <div className="grid grid-cols-4 gap-2 p-3">
          {["📱", "💻", "🎧", "⌚"].map((e, i) => (
            <div key={i} className="rounded-xl bg-white/5 p-2 text-center">
              <div className="text-2xl">{e}</div>
              <p className="mt-1 text-[10px] font-bold text-cyan-300">{((i + 1) * 8990).toLocaleString("en-US")} Tk</p>
            </div>
          ))}
        </div>
        <p className="bg-cyan-500/10 px-4 py-2 text-center text-[10px] text-cyan-300">🚚 24-hour delivery in Dhaka</p>
      </Frame>
    ),
  },
  {
    slug: "nursery",
    name: "GreenLeaf Nursery",
    type: "Plant Nursery & Garden Shop",
    desc: "Indoor & outdoor plants, pots and care supplies — with light and watering needs on every plant and a beginner starter kit.",
    price: "From 4,999 Tk",
    render: () => (
      <Frame dark>
        <Nav logo="🌿 GreenLeaf Nursery" links={["Indoor", "Outdoor", "Pots & Care"]} cta="Cart" light />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/nursery-img/hero.webp" alt="GreenLeaf Nursery greenhouse" className="h-24 w-full object-cover" />
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-4 py-4 text-white">
          <p className="text-lg font-black">Bring the green home</p>
          <p className="text-[11px] opacity-90">Plants • Pots • Soil, tools and care guides</p>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3">
          {[["🪴", "Monstera", "850 Tk"], ["🌹", "Rose Plant", "320 Tk"], ["🏺", "Terracotta Pot", "380 Tk"]].map(([e, n, p]) => (
            <div key={n} className="rounded-xl bg-white/5 p-2 text-center">
              <div className="text-2xl">{e}</div>
              <p className="mt-1 text-[10px] font-bold text-white">{n}</p>
              <p className="text-[10px] font-bold text-green-300">{p}</p>
            </div>
          ))}
        </div>
        <p className="bg-black/40 px-4 py-2 text-center text-[10px] text-slate-500">🌿 Care card with every plant • Delivery across Bangladesh</p>
      </Frame>
    ),
  },
  {
    slug: "cleaning",
    name: "SparkleClean",
    type: "Home Cleaning Service",
    desc: "Home deep cleaning, kitchen & bathroom cleaning, sofa shampoo and office cleaning — fixed upfront prices, online booking and a full admin panel.",
    price: "From 4,999 Tk",
    render: () => (
      <Frame>
        <Nav logo="✨ SparkleClean" links={["Services", "Book", "Reviews"]} cta="Book Now" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/cl-img/hero.webp" alt="SparkleClean freshly cleaned living room" className="h-24 w-full object-cover" />
        <div className="bg-white px-4 py-3">
          <p className="text-sm font-black leading-snug text-slate-900">A spotless home, without lifting a finger</p>
          <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center">
            {[["Deep Clean", "3,500 Tk"], ["Kitchen", "1,800 Tk"], ["Bathroom", "900 Tk"]].map(([v, t]) => (
              <div key={t} className="rounded-xl bg-sky-50 px-2 py-1.5 ring-1 ring-sky-100">
                <p className="text-[11px] font-black text-sky-700">{v}</p>
                <p className="text-[9px] font-bold text-slate-500">{t}</p>
              </div>
            ))}
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-1.5">
            <span className="rounded-xl bg-sky-600 px-3 py-1.5 text-center text-[11px] font-black text-white">📅 Book a Cleaning</span>
            <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-center text-[11px] font-black text-slate-600 ring-1 ring-slate-200">🧹 All Services</span>
          </div>
        </div>
        <p className="bg-slate-50 px-4 py-2 text-center text-[10px] font-bold text-slate-400">Fixed prices • Equipment included • Online booking</p>
      </Frame>
    ),
  },
  {
    slug: "painting",
    name: "PaintPro",
    type: "Home Painting Service",
    desc: "Full-home, single-room, texture-wall, wood polish, exterior and waterproofing jobs — fixed upfront prices, free colour consultation, online booking and a full admin panel.",
    price: "From 3,500 Tk",
    render: () => (
      <Frame>
        <Nav logo="🎨 PaintPro" links={["Services", "Book", "Reviews"]} cta="Book Now" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/pt-img/hero.webp" alt="PaintPro freshly painted living room" className="h-24 w-full object-cover" />
        <div className="bg-white px-4 py-3">
          <p className="text-sm font-black leading-snug text-slate-900">Fresh walls, zero hassle — painted in days, not weeks</p>
          <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center">
            {[["Full Home", "18,000 Tk"], ["Single Room", "6,500 Tk"], ["Texture Wall", "4,500 Tk"]].map(([v, t]) => (
              <div key={t} className="rounded-xl bg-violet-50 px-2 py-1.5 ring-1 ring-violet-100">
                <p className="text-[11px] font-black text-violet-700">{v}</p>
                <p className="text-[9px] font-bold text-slate-500">{t}</p>
              </div>
            ))}
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-1.5">
            <span className="rounded-xl bg-violet-600 px-3 py-1.5 text-center text-[11px] font-black text-white">📅 Book a Painter</span>
            <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-center text-[11px] font-black text-slate-600 ring-1 ring-slate-200">🎨 All Services</span>
          </div>
        </div>
        <p className="bg-slate-50 px-4 py-2 text-center text-[10px] font-bold text-slate-400">Fixed prices • Paint + labour included • Free colour consult</p>
      </Frame>
    ),
  },
  {
    slug: "fitnesscourse",
    name: "FitForm",
    type: "Fitness Course Website",
    desc: "8-week fitness course with a free starter guide, demo checkout, instant-access course area and coaching-call booking — USD pricing, mobile-first.",
    price: "From $49",
    render: () => (
      <Frame>
        <Nav logo="💪 FitForm" links={["Course", "Coaching", "Guide"]} cta="Join — $79" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/fc-img/hero.webp" alt="FitForm home fitness space" className="h-24 w-full object-cover" />
        <div className="bg-white px-4 py-3">
          <p className="text-sm font-black leading-snug text-slate-900">Build strength at home, one week at a time</p>
          <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center">
            {[["Full Course", "$79"], ["+ Nutrition", "$119"], ["+ Coaching", "$199"]].map(([v, t]) => (
              <div key={t} className="rounded-xl bg-emerald-50 px-2 py-1.5 ring-1 ring-emerald-100">
                <p className="text-[11px] font-black text-emerald-700">{v}</p>
                <p className="text-[9px] font-bold text-slate-500">{t}</p>
              </div>
            ))}
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-1.5">
            <span className="rounded-xl bg-emerald-600 px-3 py-1.5 text-center text-[11px] font-black text-white">📖 Free Guide</span>
            <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-center text-[11px] font-black text-slate-600 ring-1 ring-slate-200">📅 Book a Call</span>
          </div>
        </div>
        <p className="bg-slate-50 px-4 py-2 text-center text-[10px] font-bold text-slate-400">Free guide • Demo checkout • Instant course access</p>
      </Frame>
    ),
  },
];

/* ---- merge engine demos (40) ---- */
import { ENGINE_DEMOS } from "./engine-demos";

const WITH_GROUPS: Demo[] = HAND_DEMOS.map((d) => ({ ...d, group: HAND_GROUPS[d.slug] ?? "🌐 অন্যান্য" }));

/** All demos: 15 hand-crafted + 40 engine-driven = 55. */
export const DEMOS: Demo[] = [...WITH_GROUPS, ...ENGINE_DEMOS];
