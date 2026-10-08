"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatBDT } from "@/lib/format";

export default function CartDrawer() {
  const { items, total, isOpen, closeCart, removeItem, updateQty } = useCart();

  return (
    <>
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0b1120] transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h2 className="font-display text-lg font-bold text-white">
            🛒 আপনার কার্ট
          </h2>
          <button
            onClick={closeCart}
            className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-slate-300 hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <div className="thin-scroll flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="text-5xl">🛍️</span>
              <p className="mt-4 font-semibold text-slate-300">কার্ট খালি আছে</p>
              <p className="mt-1 text-sm text-slate-500">
                পছন্দের প্রিমিয়াম সাবস্ক্রিপশন যোগ করুন
              </p>
              <Link href="/shop" onClick={closeCart} className="btn-vault mt-6 !py-2.5 text-sm">
                শপ দেখুন
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((i) => (
                <li key={i.plan.id} className="glass rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl"
                        style={{ background: i.product.badge_bg }}
                      >
                        {i.product.badge}
                      </span>
                      <div>
                        <p className="font-semibold text-white">{i.product.name}</p>
                        <p className="text-xs text-slate-400">{i.plan.label_bn}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(i.plan.id)}
                      className="text-slate-500 hover:text-red-400"
                      aria-label="মুছুন"
                    >
                      🗑
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(i.plan.id, i.qty - 1)}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-slate-300 hover:bg-white/10"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-bold text-white">{i.qty}</span>
                      <button
                        onClick={() => updateQty(i.plan.id, i.qty + 1)}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-slate-300 hover:bg-white/10"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-display font-bold text-[#d7ff3f]">
                      {formatBDT(i.plan.price_bdt * i.qty)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-white/10 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-slate-400">সর্বমোট</span>
              <span className="font-display text-2xl font-bold text-[#d7ff3f]">
                {formatBDT(total)}
              </span>
            </div>
            <Link href="/checkout" onClick={closeCart} className="btn-vault w-full">
              চেকআউট করুন →
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
