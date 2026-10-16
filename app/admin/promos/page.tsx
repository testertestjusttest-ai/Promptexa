import PromosClient from "./PromosClient";

export const dynamic = "force-dynamic";

export default function PromosPage() {
  return (
    <div>
      <h2 className="mb-5 font-display text-xl font-bold text-white">🎟️ প্রোমো কোড</h2>
      <p className="mb-5 text-sm text-slate-500">
        প্রোমোটারদের জন্য ডিসকাউন্ট কোড বানান — যার যার পছন্দের নামে। কাস্টমার
        চেকআউটে কোড দিলে সেই শতাংশ ছাড় পাবে। ব্যবহার সংখ্যা এখানেই দেখা যাবে।
      </p>
      <PromosClient />
    </div>
  );
}
