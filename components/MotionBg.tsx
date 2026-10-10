"use client";

/**
 * Reusable video-like animated background — aurora blobs + optional grid.
 * Place inside a relative overflow-hidden container.
 */
export default function MotionBg({
  grid = false,
  intensity = "normal",
}: {
  grid?: boolean;
  intensity?: "soft" | "normal";
}) {
  const o = intensity === "soft" ? "opacity-60" : "";
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${o}`} aria-hidden>
      <div className="animate-aurora-a absolute -left-16 -top-16 h-72 w-72 rounded-full bg-[#d7ff3f]/15 blur-[90px]" />
      <div className="animate-aurora-b absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-violet-600/20 blur-[100px]" />
      <div className="animate-aurora-c absolute left-1/2 top-1/3 h-56 w-56 rounded-full bg-cyan-500/15 blur-[90px]" />
      {grid && (
        <div
          className="animate-grid-pan absolute inset-x-[-20%] bottom-[-30%] top-[30%] opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(rgba(215,255,63,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(215,255,63,0.18) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            transform: "perspective(480px) rotateX(60deg)",
            transformOrigin: "top center",
            maskImage: "linear-gradient(to bottom, transparent, black 35%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, black 35%, transparent)",
          }}
        />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(3,5,10,0.5)_100%)]" />
    </div>
  );
}
