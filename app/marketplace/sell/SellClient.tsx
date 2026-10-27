"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n";

export default function SellClient() {
  const { t } = useLang();
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", price_bdt: "", game_uid: "", seller_phone: "" });
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 6 - images.length);
    if (!files.length) return;
    setUploading(true);
    setMsg("");
    try {
      for (const f of files) {
        const fd = new FormData();
        fd.append("file", f);
        const res = await fetch("/api/marketplace/upload", { method: "POST", body: fd });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || t("s_err_upload"));
        setImages((im) => [...im, d.url]);
      }
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : t("s_err_upload_fail")}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!form.title.trim()) return setMsg(`⚠️ ${t("s_err_title")}`);
    if (!(Number(form.price_bdt) > 0)) return setMsg(`⚠️ ${t("s_err_price")}`);
    if (!/^01[3-9]\d{8}$/.test(form.seller_phone.trim())) return setMsg(`⚠️ ${t("s_err_phone")}`);
    if (images.length === 0) return setMsg(`⚠️ ${t("s_err_shots")}`);
    setSending(true);
    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price_bdt: Number(form.price_bdt), images }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || t("s_err_submit"));
      router.push(`/marketplace/${d.id}`);
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : t("s_err_fail")}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="glass rounded-3xl p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold text-white">{t("s_title")}</h1>
        <p className="mt-1 text-sm text-slate-400">{t("s_sub")}</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">{t("s_form_title")}</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="field" placeholder={t("s_ph_title")} maxLength={120} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-slate-300">{t("s_price")}</label>
              <input value={form.price_bdt} onChange={(e) => setForm({ ...form, price_bdt: e.target.value })}
                className="field" placeholder="5000" inputMode="numeric" type="number" min={1} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-slate-300">{t("s_uid")}</label>
              <input value={form.game_uid} onChange={(e) => setForm({ ...form, game_uid: e.target.value })}
                className="field" placeholder={t("s_ph_uid")} maxLength={60} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">{t("s_phone")}</label>
            <input value={form.seller_phone} onChange={(e) => setForm({ ...form, seller_phone: e.target.value })}
              className="field" placeholder="01XXXXXXXXX" inputMode="tel" maxLength={20} />
            <p className="mt-1 text-xs text-slate-500">{t("s_phone_hint")}</p>
          </div>
          <p className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-xs text-amber-200">
            {t("s_fee_note")}
          </p>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">{t("s_desc")}</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="field min-h-[120px]" maxLength={3000}
              placeholder={t("s_ph_desc")} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">{t("s_shots")}</label>
            <div className="grid grid-cols-3 gap-2">
              {images.map((u, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-black/30">
                  <img src={u} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))}
                    className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-lg bg-black/70 text-white">✕</button>
                </div>
              ))}
              {images.length < 6 && (
                <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed border-white/15 text-3xl text-slate-500 hover:border-[#d7ff3f]/50">
                  {uploading ? "⏳" : "+"}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={onFile} disabled={uploading} />
                </label>
              )}
            </div>
          </div>
          {msg && <p className="rounded-xl bg-white/5 px-4 py-3 text-sm text-amber-200">{msg}</p>}
          <button type="submit" disabled={sending || uploading} className="btn-vault w-full !py-3.5 text-base">
            {sending ? t("s_sending") : t("s_submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
