"use client";

import { useEffect, useState } from "react";
import { toBnDigits } from "@/lib/format";

type Plan = { id: string; label_bn: string };
type PFile = {
  id: string;
  file_name: string;
  version_label: string;
  file_size: number;
  plan_id: string | null;
  is_active: boolean;
  created_at: string;
  plan?: { label_bn: string } | null;
};

function fmtSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${toBnDigits((bytes / 1024 / 1024).toFixed(1))} MB`;
  if (bytes >= 1024) return `${toBnDigits((bytes / 1024).toFixed(0))} KB`;
  return `${toBnDigits(bytes)} B`;
}

export default function FilesManager({
  productId,
  productName,
  plans,
  onClose,
}: {
  productId: string;
  productName: string;
  plans: Plan[];
  onClose: () => void;
}) {
  const [files, setFiles] = useState<PFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [version, setVersion] = useState("");
  const [planId, setPlanId] = useState("");
  const [progress, setProgress] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/files?product_id=${productId}`);
    const data = await res.json();
    if (data.ok) setFiles(data.files);
    setLoading(false);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Direct browser → Supabase upload with real progress (bypasses Vercel limits) */
  function putWithProgress(
    url: string,
    file: File,
    onPct: (pct: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onPct(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(new Error(`আপলোড ব্যর্থ (HTTP ${xhr.status})`));
      xhr.onerror = () => reject(new Error("নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন"));
      xhr.send(file);
    });
  }

  async function doUpload(file: File) {
    setUploading(true);
    setProgress("সাইন URL নেওয়া হচ্ছে...");
    try {
      // 1. signed upload URL
      const signRes = await fetch("/api/admin/files/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
        }),
      });
      const sign = await signRes.json();
      if (!signRes.ok || !sign.ok) throw new Error(sign.error || "সাইন URL হয়নি");

      // 2. direct PUT to Supabase with progress
      await putWithProgress(sign.signedUrl, file, (pct) =>
        setProgress(`আপলোড হচ্ছে... ${toBnDigits(pct)}%`)
      );

      // 3. confirm + register
      setProgress("যাচাই করা হচ্ছে...");
      const confRes = await fetch("/api/admin/files/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          plan_id: planId || null,
          version_label: version.trim(),
          file_name: file.name,
          storage_path: sign.path,
          file_size: file.size,
          mime_type: file.type,
        }),
      });
      const conf = await confRes.json();
      if (!confRes.ok || !conf.ok) throw new Error(conf.error || "সেভ হয়নি");

      setVersion("");
      setProgress("✓ আপলোড সম্পন্ন!");
      load();
    } catch (e) {
      setProgress(`⚠️ ${e instanceof Error ? e.message : "ব্যর্থ"}`);
    } finally {
      setUploading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("ফাইলটি মুছে ফেলবেন? (ইতিমধ্যে বিক্রি হওয়া অর্ডারের হিস্ট্রি রাখতে তা শুধু নিষ্ক্রিয় হবে)")) return;
    const res = await fetch(`/api/admin/files?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.ok) {
      if (data.deactivated) alert("ইতিমধ্যে বিক্রি হয়েছে বলে ফাইলটি শুধু নিষ্ক্রিয় করা হয়েছে।");
      load();
    } else alert(data.error || "ব্যর্থ");
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="glass-bright mx-auto my-8 max-w-2xl rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">
            📁 ফাইল / APK — {productName}
          </h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg bg-white/10">✕</button>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          পেমেন্ট সফল হলে কাস্টমার <b className="text-slate-300">একবারই</b> ডাউনলোড করতে পারবে — লিংক শেয়ার করলেও কাজ করবে না।
        </p>

        <div className="mt-4 rounded-2xl bg-white/[0.03] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="ভার্সন (যেমন: v12.4.0)"
              className="field"
            />
            <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="field">
              <option value="">সব প্ল্যানের জন্য</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.label_bn}</option>
              ))}
            </select>
          </div>
          <label className={`mt-3 block cursor-pointer rounded-xl border border-dashed border-white/20 p-6 text-center transition hover:border-[#d7ff3f]/50 ${uploading ? "pointer-events-none opacity-50" : ""}`}>
            <span className="text-3xl">📤</span>
            <p className="mt-2 text-sm font-semibold text-white">
              {uploading ? "আপলোড হচ্ছে..." : "APK / ফাইল সিলেক্ট করুন"}
            </p>
            <p className="text-xs text-slate-500">সর্বোচ্চ ২GB • সরাসরি আপলোড (দ্রুত)</p>
            <input
              type="file"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) doUpload(f);
                e.target.value = "";
              }}
            />
          </label>
          {progress && (
            <div className="mt-3">
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#d7ff3f] to-[#8b5cf6] transition-all"
                  style={{
                    width: `${(() => {
                      const m = progress.match(/(\d+)%/);
                      return m ? m[1] : progress.includes("✓") ? 100 : 5;
                    })()}%`,
                  }}
                />
              </div>
              <p className="mt-1.5 text-center text-sm text-slate-300">{progress}</p>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          {loading ? (
            <p className="text-sm text-slate-500">লোড হচ্ছে...</p>
          ) : files.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">কোনো ফাইল আপলোড করা হয়নি</p>
          ) : (
            files.map((f) => (
              <div key={f.id} className={`flex items-center justify-between gap-3 rounded-xl p-3 ${f.is_active ? "bg-white/[0.04]" : "bg-white/[0.02] opacity-50"}`}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">📦 {f.file_name}</p>
                  <p className="text-xs text-slate-500">
                    {f.version_label && <span className="mr-2 rounded bg-white/10 px-1.5 py-0.5">{f.version_label}</span>}
                    {fmtSize(f.file_size)}
                    {f.plan && <span className="ml-2">• {f.plan.label_bn}</span>}
                    {!f.is_active && <span className="ml-2 text-red-400">• নিষ্ক্রিয়</span>}
                  </p>
                </div>
                <button onClick={() => remove(f.id)} className="shrink-0 text-slate-500 hover:text-red-400">🗑</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
