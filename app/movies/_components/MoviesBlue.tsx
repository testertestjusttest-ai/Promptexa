/** Full-bleed vivid-blue theme wrapper, scoped to the /movies section only. */
export default function MoviesBlue({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1616e8] via-[#0b0bc9] to-[#00008a]">
      {children}
    </div>
  );
}

/** Compact views counter like video sites: 950 -> "950", 1500 -> "1.5k", 2.3M */
export function formatViews(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v >= 100 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (n >= 1000) {
    const v = n / 1000;
    return `${v >= 100 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return `${n}`;
}
