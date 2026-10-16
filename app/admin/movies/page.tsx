import MoviesClient from "./MoviesClient";

export const dynamic = "force-dynamic";

export default function MoviesPage() {
  return (
    <div>
      <h2 className="mb-5 font-display text-xl font-bold text-white">🎬 মুভি পেজ</h2>
      <p className="mb-5 text-sm text-slate-500">
        মুভির তথ্য, পোস্টার, ভিডিও ও ডাউনলোড লিংক এখানে বসান। ভিডিও ফাইল অন্য
        হোস্টে রাখুন — এখানে শুধু সেই লিংক দিলেই হবে। বিজ্ঞাপন কোড বসান{" "}
        <b className="text-slate-300">অ্যাডমিন → বিজ্ঞাপন → 🎬 মুভি</b> থেকে।
      </p>
      <MoviesClient />
    </div>
  );
}
