import SlidesClient from "./SlidesClient";

export const dynamic = "force-dynamic";

export default function SlidesPage() {
  return (
    <div>
      <h2 className="mb-5 font-display text-xl font-bold text-white">🎠 হোম স্লাইডার</h2>
      <p className="mb-5 text-sm text-slate-500">
        হোমপেজের উপরের স্লাইডগুলো এখান থেকে বানান, সাজান ও চালু/বন্ধ করুন।
      </p>
      <SlidesClient />
    </div>
  );
}
