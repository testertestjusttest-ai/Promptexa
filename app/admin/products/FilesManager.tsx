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

  async function doUpload(file: File) {
    setUploading(true);
    setProgress("আপলোড হচ্ছে... (বড় APK-তে কয়েক মিনিট লাগতে পারে)");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("product_id", productId);
      if (planId) fd.append("plan_id", planId);
      if (version.trim()) fd.append("version_label", version.trim());
      const res = await fetch("/api/admin/files", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "আপলোড হয়নি");
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
            <p className="text-xs text-slate-500">সর্বোচ্চ ২০০MB</p>
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
          {progress && <p className="mt-2 text-center text-sm text-slate-300">{progress}</p>}
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
