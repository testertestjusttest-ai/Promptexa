"use client";

/**
 * Video-like animated hero background — aurora blobs, scrolling perspective
 * grid, rising particles and light sweeps. Pure CSS, constantly in motion.
 */
const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 61) % 100}%`,
  size: 3 + ((i * 7) % 4),
  delay: `${(i * 1.7) % 12}s`,
  dur: `${9 + ((i * 13) % 8)}s`,
  glyph: ["</>", "{ }", "( )", "[ ]", ";", "#", "$", "*"][i % 8],
  glyphMode: i % 3 === 0,
}));

export default function WebDevHeroBg() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#05070f]" aria-hidden>
      {/* aurora blobs */}
      <div className="animate-aurora-a absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-lime-400/25 blur-[110px]" />
      <div className="animate-aurora-b absolute -right-24 top-1/4 h-[460px] w-[460px] rounded-full bg-violet-600/30 blur-[120px]" />
      <div className="animate-aurora-c absolute bottom-0 left-1/3 h-[380px] w-[520px] rounded-full bg-cyan-500/20 blur-[110px]" />
      <div className="animate-aurora-a absolute right-1/4 top-0 h-[300px] w-[300px] rounded-full bg-fuchsia-500/20 blur-[100px]" style={{ animationDelay: "-9s" }} />

      {/* perspective grid floor */}
      <div className="absolute inset-x-[-20%] bottom-[-10%] top-[38%] animate-grid-pan opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(215,255,63,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(215,255,63,0.22) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
          transform: "perspective(520px) rotateX(58deg)",
          transformOrigin: "top center",
          maskImage: "linear-gradient(to bottom, transparent, black 30%, black 75%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 30%, black 75%, transparent)",
        }}
      />

      {/* rising particles */}
      {PARTICLES.map((p, i) =>
        p.glyphMode ? (
          <span key={i} className="animate-rise absolute bottom-[-40px] font-mono text-cyan-300/40"
            style={{ left: p.left, fontSize: `${10 + p.size}px`, animationDelay: p.delay, animationDuration: p.dur }}>
            {p.glyph}
          </span>
        ) : (
          <span key={i} className="animate-rise absolute bottom-[-40px] rounded-full bg-[#d7ff3f]/50"
            style={{ left: p.left, width: p.size, height: p.size, animationDelay: p.delay, animationDuration: p.dur, boxShadow: "0 0 8px rgba(215,255,63,0.8)" }} />
        )
      )}

      {/* light sweep */}
      <div className="animate-sweep absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      {/* readability vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(3,5,10,0.55)_0%,rgba(3,5,10,0.15)_55%,transparent_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#05070f] via-transparent to-[#05070f]/60" />
    </div>
  );
}
