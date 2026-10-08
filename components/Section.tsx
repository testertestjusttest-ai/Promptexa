export function SectionHeading({
  kicker,
  title,
  sub,
}: {
  kicker: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <span className="chip chip-lime">{kicker}</span>
      <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
        {title}
      </h2>
      {sub && <p className="mt-3 text-slate-400">{sub}</p>}
    </div>
  );
}

export function StatusBadge({ status, label }: { status: string; label: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-400/10 text-amber-300 border-amber-400/30",
    payment_pending: "bg-amber-400/10 text-amber-300 border-amber-400/30",
    paid: "bg-cyan-400/10 text-cyan-300 border-cyan-400/30",
    keys_pending: "bg-violet-400/10 text-violet-300 border-violet-400/30",
    delivered: "bg-[#d7ff3f]/10 text-[#d7ff3f] border-[#d7ff3f]/30",
    cancelled: "bg-red-400/10 text-red-300 border-red-400/30",
    refunded: "bg-slate-400/10 text-slate-300 border-slate-400/30",
    success: "bg-[#d7ff3f]/10 text-[#d7ff3f] border-[#d7ff3f]/30",
    failed: "bg-red-400/10 text-red-300 border-red-400/30",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${
        styles[status] ?? styles.pending
      }`}
    >
      {label}
    </span>
  );
}
