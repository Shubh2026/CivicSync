"use client";

import { useState, useRef } from "react";
import { CATEGORY_META, URGENCY_META } from "@/lib/types";

interface FormData {
  title: string;
  description: string;
  category: string;
  location: string;
  city: string;
  state: string;
  urgency: "low" | "medium" | "high" | "critical";
  beneficiaries: string;
}

const INITIAL_FORM: FormData = {
  title: "",
  description: "",
  category: "food",
  location: "",
  city: "",
  state: "Punjab",
  urgency: "medium",
  beneficiaries: "",
};

interface CsvRow {
  title: string;
  description: string;
  category: string;
  location: string;
  urgency: string;
}

interface Props { ngoId: string }

export default function UploadDataView({ ngoId }: Props) {
  const [tab, setTab] = useState<"manual" | "csv">("manual");
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvDone, setCsvDone] = useState(false);
  const [photos] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const csvRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/ngo/community-needs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ngo_id: ngoId, source: "manual", image_urls: photos }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess(true);
      setForm(INITIAL_FORM);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(Boolean);
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const rows: CsvRow[] = lines.slice(1).map((line) => {
        const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ""; });
        return {
          title: obj.title || obj.name || "",
          description: obj.description || obj.desc || "",
          category: obj.category || "food",
          location: obj.location || obj.address || "",
          urgency: obj.urgency || "medium",
        };
      }).filter((r) => r.title);
      setCsvRows(rows);
    };
    reader.readAsText(file);
  };

  const handleCsvSubmit = async () => {
    setCsvUploading(true);
    try {
      for (const row of csvRows) {
        await fetch("/api/ngo/community-needs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...row, ngo_id: ngoId, source: "csv", image_urls: [], urgency: row.urgency as FormData["urgency"] }),
        });
      }
      setCsvDone(true);
      setCsvRows([]);
      setTimeout(() => setCsvDone(false), 4000);
    } finally {
      setCsvUploading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl text-white text-sm placeholder-white/30 border border-white/10 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 transition-all";
  const inputStyle = { background: "oklch(0.13 0.02 220)" };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Upload Community Data
        </h2>
        <p className="text-white/45 text-sm">Document community needs to build your impact record and link to volunteer requests.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: "oklch(0.11 0.018 220)" }}>
        {(["manual", "csv"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              tab === t ? "text-white shadow-lg" : "text-white/40 hover:text-white/70"
            }`}
            style={tab === t ? { background: "linear-gradient(135deg, oklch(0.48 0.16 195), oklch(0.40 0.14 205))" } : {}}
          >
            {t === "manual" ? "📝 Manual Entry" : "📊 CSV Upload"}
          </button>
        ))}
      </div>

      {/* ── Manual Form ──────────────────── */}
      {tab === "manual" && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-white/70 text-xs font-semibold mb-1.5 uppercase tracking-wider">Community Need Title *</label>
            <input
              required
              className={inputCls}
              style={inputStyle}
              placeholder="e.g. Flood-affected families in Ludhiana need food"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white/70 text-xs font-semibold mb-1.5 uppercase tracking-wider">Description *</label>
            <textarea
              required
              rows={4}
              className={inputCls}
              style={inputStyle}
              placeholder="Describe the community need in detail — who is affected, how many, what kind of help is needed..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Category + Urgency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 text-xs font-semibold mb-1.5 uppercase tracking-wider">Category *</label>
              <select
                className={inputCls}
                style={inputStyle}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {Object.entries(CATEGORY_META).map(([key, val]) => (
                  <option key={key} value={key}>{val.icon} {val.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white/70 text-xs font-semibold mb-1.5 uppercase tracking-wider">Urgency *</label>
              <select
                className={inputCls}
                style={inputStyle}
                value={form.urgency}
                onChange={(e) => setForm({ ...form, urgency: e.target.value as FormData["urgency"] })}
              >
                {Object.entries(URGENCY_META).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-white/70 text-xs font-semibold mb-1.5 uppercase tracking-wider">City</label>
              <input
                className={inputCls}
                style={inputStyle}
                placeholder="Amritsar"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="col-span-1">
              <label className="block text-white/70 text-xs font-semibold mb-1.5 uppercase tracking-wider">State</label>
              <input
                className={inputCls}
                style={inputStyle}
                placeholder="Punjab"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>
            <div className="col-span-1">
              <label className="block text-white/70 text-xs font-semibold mb-1.5 uppercase tracking-wider">Beneficiaries</label>
              <input
                type="number"
                min="1"
                className={inputCls}
                style={inputStyle}
                placeholder="50"
                value={form.beneficiaries}
                onChange={(e) => setForm({ ...form, beneficiaries: e.target.value })}
              />
            </div>
          </div>

          {/* Full location */}
          <div>
            <label className="block text-white/70 text-xs font-semibold mb-1.5 uppercase tracking-wider">Full Address / Landmark</label>
            <input
              className={inputCls}
              style={inputStyle}
              placeholder="Village Khanna, near Old Bus Stand"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>

          {/* Photo upload placeholder */}
          <div>
            <label className="block text-white/70 text-xs font-semibold mb-1.5 uppercase tracking-wider">Photos (optional)</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-white/15 rounded-2xl p-8 text-center cursor-pointer hover:border-teal-500/40 hover:bg-teal-500/5 transition-all duration-200"
            >
              <div className="text-4xl mb-2">📸</div>
              <p className="text-white/50 text-sm">Click to upload photos</p>
              <p className="text-white/25 text-xs mt-1">JPG, PNG, WEBP — max 5MB each</p>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" />
            </div>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="p-3 rounded-xl text-red-300 text-sm border border-red-500/30" style={{ background: "oklch(0.25 0.08 10 / 0.3)" }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-xl text-green-300 text-sm border border-green-500/30" style={{ background: "oklch(0.25 0.08 145 / 0.3)" }}>
              ✅ Community need recorded successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white disabled:opacity-60 transition-all duration-200 hover:scale-[1.01] shadow-lg"
            style={{ background: "linear-gradient(135deg, oklch(0.48 0.16 195), oklch(0.40 0.14 205))" }}
          >
            {submitting ? "Submitting..." : "📤 Submit Community Need"}
          </button>
        </form>
      )}

      {/* ── CSV Upload ───────────────────── */}
      {tab === "csv" && (
        <div className="space-y-5">
          {/* Template download hint */}
          <div className="p-4 rounded-2xl border border-white/10" style={{ background: "oklch(0.11 0.018 220)" }}>
            <p className="text-white/70 text-sm font-semibold mb-1">📋 CSV Format</p>
            <p className="text-white/40 text-xs font-mono">title, description, category, location, urgency</p>
            <p className="text-white/25 text-xs mt-1">Categories: food | education | environment | health | elderly | animals | disaster</p>
            <p className="text-white/25 text-xs">Urgency: low | medium | high | critical</p>
          </div>

          {/* Drop zone */}
          <div
            onClick={() => csvRef.current?.click()}
            className="border-2 border-dashed border-white/15 rounded-2xl p-10 text-center cursor-pointer hover:border-teal-500/40 hover:bg-teal-500/5 transition-all duration-200"
          >
            <div className="text-5xl mb-3">📂</div>
            <p className="text-white/60 text-sm font-semibold">Click to upload CSV file</p>
            <p className="text-white/30 text-xs mt-1">or drag and drop</p>
            <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
          </div>

          {/* Preview table */}
          {csvRows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/70 text-sm font-semibold">Preview — {csvRows.length} records</p>
                <button
                  onClick={handleCsvSubmit}
                  disabled={csvUploading}
                  className="px-5 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, oklch(0.48 0.16 195), oklch(0.40 0.14 205))" }}
                >
                  {csvUploading ? "Uploading..." : `Upload ${csvRows.length} Records`}
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "oklch(0.13 0.02 220)" }}>
                      {["Title", "Category", "Location", "Urgency"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-white/50 font-semibold uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvRows.slice(0, 10).map((row, i) => (
                      <tr
                        key={i}
                        className="border-t border-white/5 hover:bg-white/3 transition-colors"
                        style={{ background: i % 2 === 0 ? "oklch(0.10 0.016 220)" : "oklch(0.11 0.018 220)" }}
                      >
                        <td className="px-4 py-3 text-white/80 max-w-[160px] truncate">{row.title}</td>
                        <td className="px-4 py-3 text-white/60">
                          {CATEGORY_META[row.category]?.icon} {CATEGORY_META[row.category]?.label || row.category}
                        </td>
                        <td className="px-4 py-3 text-white/60">{row.location || "—"}</td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{
                              background: URGENCY_META[row.urgency]?.bg || "rgba(148,163,184,0.15)",
                              color: URGENCY_META[row.urgency]?.color || "#94a3b8",
                            }}
                          >
                            {URGENCY_META[row.urgency]?.label || row.urgency}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvRows.length > 10 && (
                  <div className="px-4 py-2 text-white/30 text-xs border-t border-white/5" style={{ background: "oklch(0.10 0.016 220)" }}>
                    + {csvRows.length - 10} more rows
                  </div>
                )}
              </div>
            </div>
          )}

          {csvDone && (
            <div className="p-3 rounded-xl text-green-300 text-sm border border-green-500/30" style={{ background: "oklch(0.25 0.08 145 / 0.3)" }}>
              ✅ All records uploaded successfully!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
