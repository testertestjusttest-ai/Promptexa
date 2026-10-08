import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/5">
      <div className="divider-glow" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.jpg"
              alt="DigiPlyra"
              className="h-10 w-10 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.5)]"
            />
            <span className="font-display text-xl">
              <span className="font-bold text-white">Digi</span>
              <span className="font-bold text-[#d7ff3f]">Plyra</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            বাংলাদেশের বিশ্বস্ত ডিজিটাল প্রোডাক্ট স্টোর। অরিজিনাল প্রিমিয়াম
            সাবস্ক্রিপশন — দ্রুত ডেলিভারি, নিরাপদ পেমেন্ট, ২৪/৭ সাপোর্ট।
          </p>
          <div className="mt-5 flex gap-2">
            <span className="chip">বিকাশ</span>
            <span className="chip">নগদ</span>
            <span className="chip">রকেট</span>
            <span className="chip">কার্ড</span>
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-300">
            কুইক লিংক
          </h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li><Link href="/shop" className="hover:text-[#d7ff3f]">সব প্রোডাক্ট</Link></li>
            <li><Link href="/dashboard" className="hover:text-[#d7ff3f]">আমার অর্ডার</Link></li>
            <li><Link href="/auth/login" className="hover:text-[#d7ff3f]">লগইন / রেজিস্টার</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-300">
            সহায়তা
          </h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li>ডেলিভারি: পেমেন্টের ৫–৩০ মিনিটে</li>
            <li>সাপোর্ট: প্রতিদিন সকাল ৯টা – রাত ১১টা</li>
            <li>পেমেন্ট: ১০০% নিরাপদ</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} DigiPlyra — সর্বস্বত্ব সংরক্ষিত।
      </div>
    </footer>
  );
}
