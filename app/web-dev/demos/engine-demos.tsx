import type { Demo } from "./demos";
import type { EngineDef } from "./engine-data";
import { ENGINE_DEFS } from "./engine-data";

/** Lightweight static mockup for gallery cards. */
function engineMockup(def: EngineDef) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#0a0a12] shadow-2xl">
      <div className="flex items-center gap-1.5 bg-black/80 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-2 flex-1 truncate rounded-md bg-white/10 px-2 py-0.5 font-mono text-[10px] text-slate-400">demo.digiplyra.com/{def.slug}</span>
      </div>
      <div className={`bg-gradient-to-br ${def.grad} px-4 py-6 text-center`}>
        <div className="text-4xl">{def.heroEmoji}</div>
        <p className="mt-2 text-sm font-black text-white">{def.name}</p>
        <p className="mt-0.5 text-[10px] text-white/80">{def.heroSub}</p>
      </div>
      <div className="grid grid-cols-3 gap-1.5 p-2">
        {def.items.slice(0, 6).map((i) => (
          <div key={i.n} className="grid h-14 place-items-center rounded-lg bg-white/5 text-2xl">{i.e}</div>
        ))}
      </div>
    </div>
  );
}

export const ENGINE_DEMOS: Demo[] = ENGINE_DEFS.map((def) => ({
  slug: def.slug,
  name: def.name,
  type: def.type,
  desc: def.desc,
  price: def.price,
  group: def.group,
  render: () => engineMockup(def),
}));
