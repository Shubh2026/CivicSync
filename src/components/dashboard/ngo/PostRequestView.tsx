"use client";

import { useState, useEffect } from "react";
import { CATEGORY_META, URGENCY_META, SKILL_OPTIONS } from "@/lib/types";
import type { CommunityNeed } from "@/lib/types";

interface FormData {
  title: string;
  description: string;
  category: string;
  location: string;
  city: string;
  urgency: "low" | "medium" | "high" | "critical";
  required_skills: string[];
  volunteers_needed: string;
  date_start: string;
  date_end: string;
  hours_per_week: string;
  is_one_time: boolean;
  community_need_id: string;
}

const INITIAL_FORM: FormData = {
  title: "",
  description: "",
  category: "food",
  location: "",
  city: "",
  urgency: "medium",
  required_skills: [],
  volunteers_needed: "5",
  date_start: "",
  date_end: "",
  hours_per_week: "4",
  is_one_time: false,
  community_need_id: "",
};

interface Props {
  ngoId: string;
  onSuccess: () => void;
}

export default function PostRequestView({ ngoId, onSuccess }: Props) {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [needs, setNeeds] = useState<CommunityNeed[]>([]);

  useEffect(() => {
    fetch("/api/ngo/community-needs")
      .then((r) => r.json())
      .then((data) => setNeeds(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const toggleSkill = (skill: string) => {
    setForm((f) => ({
      ...f,
      required_skills: f.required_skills.includes(skill)
        ? f.required_skills.filter((s) => s !== skill)
        : [...f.required_skills, skill],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        ...form,
        ngo_id: ngoId,
        volunteers_needed: parseInt(form.volunteers_needed) || 5,
        hours_per_week: parseFloat(form.hours_per_week) || 4,
      };
      const res = await fetch("/api/ngo/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess(true);
      setForm(INITIAL_FORM);
      setTimeout(() => { setSuccess(false); onSuccess(); }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post request");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl text-white text-sm placeholder-white/30 border border-white/10 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 transition-all";
  const inputStyle = { background: "oklch(0.13 0.02 220)" };
  const labelCls = "block text-white/70 text-xs font-semibold mb-1.5 uppercase tracking-wider";

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Post New Request
        </h2>
        <p className="text-white/45 text-sm">Create a volunteer opportunity for your community. Volunteers will see and accept this request.</p>
      </div>

      {success && (
        <div className="mb-5 p-4 rounded-2xl text-green-300 text-sm border border-green-500/30 flex items-center gap-2" style={{ background: "oklch(0.25 0.08 145 / 0.3)" }}>
          <span className="text-xl">✅</span> Request posted! Redirecting to My Requests...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Link to community need */}
        {needs.length > 0 && (
          <div>
            <label className={labelCls}>Link to Community Need (optional)</label>
            <select
              className={inputCls}
              style={inputStyle}
              value={form.community_need_id}
              onChange={(e) => {
                const need = needs.find((n) => n.id === e.target.value);
                if (need) {
                  setForm((f) => ({
                    ...f,
                    community_need_id: need.id,
                    title: f.title || need.title,
                    description: f.description || need.description,
                    category: need.category,
                    location: f.location || need.location,
                    city: f.city || (need.city || ""),
                    urgency: need.urgency,
                  }));
                } else {
                  setForm((f) => ({ ...f, community_need_id: "" }));
                }
              }}
            >
              <option value="">— None —</option>
              {needs.map((n) => (
                <option key={n.id} value={n.id}>
                  {CATEGORY_META[n.category]?.icon} {n.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Title */}
        <div>
          <label className={labelCls}>Request Title *</label>
          <input
            required
            className={inputCls}
            style={inputStyle}
            placeholder="e.g. Food Distribution Drive — Amritsar"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        {/* Description */}
        <div>
          <label className={labelCls}>Detailed Description *</label>
          <textarea
            required
            rows={4}
            className={inputCls}
            style={inputStyle}
            placeholder="Describe what volunteers will be doing, what to bring, what impact they'll create..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Category + Urgency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Category *</label>
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
            <label className={labelCls}>Urgency *</label>
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>City</label>
            <input
              className={inputCls}
              style={inputStyle}
              placeholder="Amritsar"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Full Location</label>
            <input
              className={inputCls}
              style={inputStyle}
              placeholder="Sector 14, near community hall"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
        </div>

        {/* Dates + volunteers */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Start Date</label>
            <input
              type="date"
              className={inputCls}
              style={inputStyle}
              value={form.date_start}
              onChange={(e) => setForm({ ...form, date_start: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>End Date</label>
            <input
              type="date"
              className={inputCls}
              style={inputStyle}
              value={form.date_end}
              onChange={(e) => setForm({ ...form, date_end: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Volunteers Needed</label>
            <input
              type="number"
              min="1"
              max="500"
              className={inputCls}
              style={inputStyle}
              value={form.volunteers_needed}
              onChange={(e) => setForm({ ...form, volunteers_needed: e.target.value })}
            />
          </div>
        </div>

        {/* Hours + one-time toggle */}
        <div className="grid grid-cols-2 gap-4 items-end">
          <div>
            <label className={labelCls}>Hours / Week</label>
            <input
              type="number"
              min="1"
              max="40"
              className={inputCls}
              style={inputStyle}
              value={form.hours_per_week}
              onChange={(e) => setForm({ ...form, hours_per_week: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Event Type</label>
            <div className="flex gap-2">
              {[
                { val: false, label: "🔄 Recurring" },
                { val: true,  label: "📅 One-time" },
              ].map((opt) => (
                <button
                  type="button"
                  key={String(opt.val)}
                  onClick={() => setForm({ ...form, is_one_time: opt.val })}
                  className={`flex-1 py-3 rounded-xl text-xs font-semibold transition-all border ${
                    form.is_one_time === opt.val
                      ? "text-teal-300 border-teal-500/50"
                      : "text-white/40 border-white/10 hover:border-white/20"
                  }`}
                  style={form.is_one_time === opt.val ? { background: "oklch(0.48 0.16 195 / 0.15)" } : { background: "oklch(0.13 0.02 220)" }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className={labelCls}>Skills Needed</label>
          <div className="flex flex-wrap gap-2">
            {SKILL_OPTIONS.map((skill) => {
              const selected = form.required_skills.includes(skill);
              return (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all border ${
                    selected
                      ? "text-teal-300 border-teal-500/50 scale-105"
                      : "text-white/40 border-white/10 hover:border-white/25 hover:text-white/60"
                  }`}
                  style={selected ? { background: "oklch(0.48 0.16 195 / 0.18)" } : { background: "oklch(0.13 0.02 220)" }}
                >
                  {selected ? "✓ " : ""}{skill}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl text-red-300 text-sm border border-red-500/30" style={{ background: "oklch(0.25 0.08 10 / 0.3)" }}>
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-xl font-bold text-sm text-white disabled:opacity-60 transition-all duration-200 hover:scale-[1.01] shadow-lg"
          style={{ background: "linear-gradient(135deg, oklch(0.48 0.16 195), oklch(0.40 0.14 205))" }}
        >
          {submitting ? "Posting..." : "🚀 Post Volunteer Request"}
        </button>
      </form>
    </div>
  );
}
