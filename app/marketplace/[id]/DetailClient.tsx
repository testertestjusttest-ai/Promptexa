"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatBDT, formatTk, toBnDigits, timeAgo } from "@/lib/format";
import { dealStatusLabel, dealSteps } from "@/lib/escrow";
import { resolveListingImage } from "@/lib/ffAssets";
import { useLang } from "@/lib/i18n";

type Deal = {
  id: string;
  buyer_id: string;
  seller_id: string;
  amount_bdt: number;
  status: string;
  buyer_trxid: string;
  admin_note: string;
  created_at: string;
};

type Msg = { id: string; sender_id: string; body: string; created_at: string };

export default function DetailClient({ id }: { id: string }) {
  const { t, lang } = useLang();
  const digits = (n: number) => (lang === "bn" ? toBnDigits(n) : String(n));
  const price = (n: number) => (lang === "bn" ? formatBDT(n) : formatTk(n));
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [chatText, setChatText] = useState("");
  const [sending, setSending] = useState(false);
  const [buying, setBuying] = useState(false);
  const [trxid, setTrxid] = useState("");
  const [senderNo, setSenderNo] = useState("");
  const [acting, setActing] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [boosting, setBoosting] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  async function boost() {
    if (boosting || !confirm(t("d_dt_boost_confirm"))) return;
    setBoosting(true);
    try {
      const res = await fetch("/api/marketplace/boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: id }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || t("s_err_fail"));
      setMsg(t("d_dt_boost_ok"));
      load(true);
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : t("s_err_fail")}`);
    } finally {
      setBoosting(false);
    }
  }

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/marketplace/${id}`);
      const d = await res.json();
      if (res.ok) setData(d);
    } catch {}
    if (!silent) setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 8000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight });
  }, [data?.messages]);

  async function sendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatText.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/marketplace/${id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: chatText }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setChatText("");
      load(true);
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : t("s_err_submit")}`);
    } finally {
      setSending(false);
    }
  }

  async function buy() {
    setBuying(true);
    setMsg("");
    try {
      const res = await fetch("/api/marketplace/escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: id }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      load(true);
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : t("s_err_submit")}`);
    } finally {
      setBuying(false);
    }
  }

  async function dealAction(deal: Deal, action: string, extra: Record<string, string> = {}) {
    if (!deal) return;
    if (action === "dispute" && !confirm(t("d_dt_dispute_confirm"))) return;
    setActing(true);
    setMsg("");
    try {
      const res = await fetch(`/api/marketplace/escrow/${deal.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setMsg(`✅ ${d.label ?? t("d_dt_done")}`);
      load(true);
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : t("s_err_submit")}`);
    } finally {
      setActing(false);
    }
  }

  if (loading) return <p className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-500">{t("c_loading")}</p>;
  if (!data) return <p className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-500">{t("d_dt_notfound")}</p>;

  const l = data.listing;
  const me = data.me;
  const isSeller = me && l.seller_id === me;
  const deals: Deal[] = data.deals ?? [];
  const myDeal = deals.find((d) => d.status !== "completed" && d.status !== "refunded" && d.status !== "cancelled") ?? deals[0];
  const images: string[] = l.images ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/marketplace" className="text-sm text-slate-400 hover:text-white">{t("d_dt_back")}</Link>

      {l.status !== "approved" && (
        <div className="mt-4 rounded-2xl bg-amber-400/10 p-4 text-sm text-amber-200">
          {l.status === "pending" && t("d_dt_pending")}
          {l.status === "sold" && t("d_dt_sold")}
          {l.status === "rejected" && t("d_dt_rejected")}
        </div>
      )}

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        {/* gallery + info */}
        <div>
          <div className="glass overflow-hidden rounded-3xl">
            <div className="relative aspect-video bg-black/40">
              {images[imgIdx] ? (
                <img src={resolveListingImage(images[imgIdx])} alt={l.title} className="h-full w-full object-contain" />
              ) : (
                <div className="grid h-full place-items-center bg-gradient-to-br from-orange-900/40 via-[#0b1120] to-cyan-900/30">
                  <div className="text-center">
                    <div className="text-6xl">🎮</div>
                    <p className="mt-2 text-xs font-bold tracking-widest text-amber-300/80">FREE FIRE ID</p>
                  </div>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {images.map((u, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl ${i === imgIdx ? "ring-2 ring-[#d7ff3f]" : "opacity-60"}`}>
                    <img src={resolveListingImage(u)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="glass mt-4 rounded-3xl p-6">
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-display text-2xl font-bold text-white">{l.title}</h1>
              <p className="font-display shrink-0 text-2xl font-bold text-[#d7ff3f]">{price(Number(l.price_bdt))}</p>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {t("d_dt_seller")} <b className="text-slate-300">{data.seller_name}</b>
              {l.game_uid && <> • 🆔 UID: <b className="text-slate-300">{l.game_uid}</b></>}
              {" "}• 👁️ {digits(l.views ?? 0)}
            </p>
            {l.seller_phone && (
              <a href={`tel:${l.seller_phone}`} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm font-bold text-emerald-300 transition hover:bg-emerald-400/20">
                📞 {l.seller_phone} — {t("c_call")}
              </a>
            )}
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{l.description}</p>
            <p className="mt-4 rounded-xl border border-sky-400/20 bg-sky-400/5 px-4 py-3 text-xs leading-relaxed text-sky-200">
              {t("d_safety")}
            </p>
          </div>
        </div>

        {/* buy / escrow / chat */}
        <div className="space-y-4">
          {msg && <p className="rounded-xl bg-white/5 px-4 py-3 text-sm text-amber-200">{msg}</p>}

          {/* escrow steps */}
          <div className="glass rounded-3xl p-6">
            <h3 className="font-bold text-white">{t("d_escrow_title")}</h3>
            <ol className="mt-3 space-y-2">
              {dealSteps(lang).map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#d7ff3f]/15 text-xs font-bold text-[#d7ff3f]">{digits(i + 1)}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>

          {/* buy / deal box */}
          {!isSeller && l.status === "approved" && (
            <div className="glass rounded-3xl p-6">
              {!myDeal ? (
                <>
                  <p className="text-sm text-slate-400">{t("d_dt_escrow_note")}</p>
                  <button onClick={buy} disabled={buying} className="btn-vault mt-4 w-full !py-3.5 text-base">
                    {buying ? t("d_dt_buying") : `${t("d_dt_buy")} — ${price(Number(l.price_bdt))}`}
                  </button>
                </>
              ) : (
                <DealBox deal={myDeal} role={me === myDeal.seller_id ? "seller" : "buyer"}
                  trxid={trxid} setTrxid={setTrxid} senderNo={senderNo} setSenderNo={setSenderNo}
                  acting={acting} onAction={(a, e) => dealAction(myDeal, a, e)} />
              )}
            </div>
          )}

          {isSeller && deals.length > 0 && (
            <div className="glass rounded-3xl p-6">
              <h3 className="font-bold text-white">{t("d_dt_mydeals")} ({digits(deals.length)})</h3>
              <div className="mt-3 space-y-3">
                {deals.map((d) => (
                  <DealBox key={d.id} deal={d} role="seller" acting={acting} onAction={(a, e) => dealAction(d, a, e)} />
                ))}
              </div>
            </div>
          )}

          {isSeller && l.status === "approved" && !(l.featured_until && new Date(l.featured_until).getTime() > Date.now()) && (
            <div className="glass rounded-3xl border-amber-400/20 p-6">
              <h3 className="font-bold text-white">{t("d_boost_t")}</h3>
              <p className="mt-1 text-xs text-slate-400">{t("d_boost_d")}</p>
              <button onClick={boost} disabled={boosting} className="btn-vault mt-3 w-full !py-2.5 text-sm">
                {boosting ? t("d_boosting") : t("d_boost_b")}
              </button>
            </div>
          )}

          {/* chat */}
          {data.canChat ? (
            <div className="glass rounded-3xl p-6">
              <h3 className="font-bold text-white">{t("d_dt_chat_t")}</h3>
              <p className="mt-1 text-[11px] text-slate-500">{t("d_dt_chat_sub")}</p>
              <div ref={chatRef} className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-2xl bg-black/25 p-3">
                {(data.messages as Msg[]).length === 0 && (
                  <p className="py-6 text-center text-xs text-slate-500">{t("d_dt_chat_empty")}</p>
                )}
                {(data.messages as Msg[]).map((m) => {
                  const mine = m.sender_id === me;
                  const isStaffMsg = (data.staff_ids ?? []).includes(m.sender_id);
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${mine ? "bg-[#d7ff3f]/15 text-white" : "bg-white/[0.06] text-slate-200"}`}>
                        {isStaffMsg && <p className="text-[10px] font-bold text-cyan-300">{t("d_dt_support")}</p>}
                        <p className="text-sm">{m.body}</p>
                        <p className="mt-0.5 text-[10px] text-slate-500">{timeAgo(m.created_at, lang)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={sendChat} className="mt-3 flex gap-2">
                <input value={chatText} onChange={(e) => setChatText(e.target.value)}
                  className="field !py-2.5" placeholder={t("d_dt_chat_ph")} maxLength={1000} />
                <button type="submit" disabled={sending} className="btn-vault shrink-0 !px-5 !py-2.5 text-sm">
                  {sending ? "..." : t("d_dt_chat_send")}
                </button>
              </form>
            </div>
          ) : (
            me && !isSeller && l.status === "approved" && (
              <div className="glass rounded-3xl p-6 text-center text-sm text-slate-400">
                {t("d_dt_chat_first_a")} <b className="text-white">{t("d_dt_buy")}</b> {t("d_dt_chat_first_b")}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

/** Role-aware escrow deal card */
function DealBox({
  deal, role, trxid, setTrxid, senderNo, setSenderNo, acting, onAction,
}: {
  deal: Deal; role: "buyer" | "seller";
  trxid?: string; setTrxid?: (v: string) => void;
  senderNo?: string; setSenderNo?: (v: string) => void;
  acting: boolean; onAction: (action: string, extra?: Record<string, string>) => void;
}) {
  const { t, lang } = useLang();
  const price = (n: number) => (lang === "bn" ? formatBDT(n) : formatTk(n));
  return (
    <div className="rounded-2xl bg-black/25 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-white">{t("d_dt_deal")}{deal.id.slice(0, 8)}</p>
        <span className="rounded-full bg-[#d7ff3f]/15 px-3 py-1 text-xs font-bold text-[#d7ff3f]">
          {dealStatusLabel(deal.status, lang)}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">{t("d_dt_amount")} {price(Number(deal.amount_bdt))}</p>

      {role === "buyer" && deal.status === "awaiting_payment" && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-slate-400">{t("d_dt_pay_a")} <b className="text-white">{price(Number(deal.amount_bdt))}</b> {t("d_dt_pay_b")}</p>
          <input value={trxid ?? ""} onChange={(e) => setTrxid?.(e.target.value)} className="field !py-2.5 uppercase" placeholder="TrxID" />
          <input value={senderNo ?? ""} onChange={(e) => setSenderNo?.(e.target.value)} className="field !py-2.5" placeholder={t("d_dt_sender_ph")} inputMode="numeric" />
          <button onClick={() => onAction("pay", { trxid: trxid ?? "", sender_number: senderNo ?? "" })}
            disabled={acting} className="btn-vault w-full !py-2.5 text-sm">
            {acting ? "..." : t("d_dt_pay_confirm")}
          </button>
        </div>
      )}

      {role === "buyer" && deal.status === "paid_to_admin" && (
        <p className="mt-3 rounded-xl bg-cyan-400/10 p-3 text-xs text-cyan-200">
          {t("d_dt_paid_note")}
        </p>
      )}

      {role === "buyer" && deal.status === "id_delivered" && (
        <div className="mt-3 grid gap-2">
          <button onClick={() => onAction("confirm")} disabled={acting} className="btn-vault w-full !py-2.5 text-sm">
            {t("d_dt_confirm")}
          </button>
          <button onClick={() => onAction("dispute")} disabled={acting} className="w-full rounded-xl border border-red-400/30 py-2.5 text-sm font-bold text-red-300">
            {t("d_dt_dispute")}
          </button>
        </div>
      )}

      {role === "seller" && deal.status === "awaiting_payment" && (
        <p className="mt-3 rounded-xl bg-white/5 p-3 text-xs text-slate-400">{t("d_dt_wait_pay")}</p>
      )}

      {role === "seller" && deal.status === "paid_to_admin" && (
        <div className="mt-3">
          <p className="rounded-xl bg-green-400/10 p-3 text-xs text-green-200">
            {t("d_dt_seller_paid_a")} <b>{t("d_dt_seller_paid_b")}</b> {t("d_dt_seller_paid_c")}
          </p>
          <button onClick={() => onAction("deliver")} disabled={acting} className="btn-vault mt-2 w-full !py-2.5 text-sm">
            {acting ? "..." : t("d_dt_deliver")}
          </button>
        </div>
      )}

      {role === "seller" && deal.status === "id_delivered" && (
        <p className="mt-3 rounded-xl bg-white/5 p-3 text-xs text-slate-400">{t("d_dt_wait_confirm")}</p>
      )}

      {deal.status === "completed" && (
        <p className="mt-3 rounded-xl bg-[#d7ff3f]/10 p-3 text-center text-sm font-bold text-[#d7ff3f]">{t("d_dt_completed")}</p>
      )}
      {deal.status === "disputed" && (
        <p className="mt-3 rounded-xl bg-red-400/10 p-3 text-xs text-red-200">{t("d_dt_disputed")}</p>
      )}
      {deal.status === "refunded" && (
        <p className="mt-3 rounded-xl bg-white/5 p-3 text-xs text-slate-400">{t("d_dt_refunded")}</p>
      )}
      {deal.admin_note && (
        <p className="mt-2 text-[11px] text-slate-500">{t("d_dt_admin_note")} {deal.admin_note}</p>
      )}
    </div>
  );
}
