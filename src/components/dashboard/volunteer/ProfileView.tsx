"use client";

import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import type { VolunteerProfile } from "@/lib/types";
import { SKILL_OPTIONS, AVAILABILITY_OPTIONS, CAUSE_OPTIONS } from "@/lib/types";

interface Props {
  user: User;
  profile: VolunteerProfile;
}

export default function ProfileView({ user, profile }: Props) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name:    profile.full_name    || user.user_metadata?.full_name || "",
    bio:          profile.bio          || "",
    location:     profile.location     || "Amritsar, Punjab",
    phone:        profile.phone        || "",
    skills:       profile.skills       || [],
    availability: profile.availability || [],
    causes:       profile.causes       || [],
  });

  // Sync if profile changes
  useEffect(() => {
    setForm({
      full_name:    profile.full_name    || user.user_metadata?.full_name || "",
      bio:          profile.bio          || "",
      location:     profile.location     || "Amritsar, Punjab",
      phone:        profile.phone        || "",
      skills:       profile.skills       || [],
      availability: profile.availability || [],
      causes:       profile.causes       || [],
    });
  }, [profile, user]);

  const toggleArray = (field: "skills" | "availability" | "causes", value: string) => {
    setForm((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/volunteer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const avatarUrl = profile.avatar_url || user.user_metadata?.avatar_url || null;
  const displayName = form.full_name || user.email?.split("@")[0] || "Volunteer";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const completionFields = [
    form.full_name, form.bio, form.location, form.phone,
    form.skills.length > 0 ? "ok" : "",
    form.availability.length > 0 ? "ok" : "",
    form.causes.length > 0 ? "ok" : "",
  ];
  const completion = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center overflow-hidden shadow-2xl shadow-emerald-900/40">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-black text-2xl">{initials}</span>
            )}
          </div>
          <div
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #34d399, #0d9488)" }}
          >
            ✓
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h2
            className="text-2xl font-black text-white mb-0.5"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {displayName}
          </h2>
          <p className="text-emerald-400 text-sm font-medium mb-3">Volunteer · {user.email}</p>

          {/* Profile completion */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-white/40">Profile Completion</span>
              <span className="font-bold" style={{ color: completion >= 80 ? "#34d399" : completion >= 50 ? "#f59e0b" : "#ef4444" }}>
                {completion}%
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "oklch(0.18 0.02 220)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${completion}%`,
                  background: completion >= 80
                    ? "linear-gradient(90deg, #34d399, #0d9488)"
                    : completion >= 50
                    ? "linear-gradient(90deg, #f59e0b, #f97316)"
                    : "linear-gradient(90deg, #ef4444, #f97316)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Basic info ──────────────────────────────────── */}
      <section
        className="rounded-3xl p-6 border border-white/5 space-y-5"
        style={{ background: "oklch(0.115 0.02 220)" }}
      >
        <h3 className="text-white font-bold text-sm mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
          👤 Basic Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/40 text-xs font-medium mb-1.5">Full Name</label>
            <input
              id="profile-name"
              type="text"
              value={form.full_name}
              onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
              placeholder="Your full name"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-white/25 border border-white/8 outline-none focus:border-emerald-500/40 transition-colors"
              style={{ background: "oklch(0.14 0.02 220)" }}
            />
          </div>
          <div>
            <label className="block text-white/40 text-xs font-medium mb-1.5">Phone</label>
            <input
              id="profile-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-white/25 border border-white/8 outline-none focus:border-emerald-500/40 transition-colors"
              style={{ background: "oklch(0.14 0.02 220)" }}
            />
          </div>
          <div>
            <label className="block text-white/40 text-xs font-medium mb-1.5">Location</label>
            <input
              id="profile-location"
              type="text"
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              placeholder="City, State"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-white/25 border border-white/8 outline-none focus:border-emerald-500/40 transition-colors"
              style={{ background: "oklch(0.14 0.02 220)" }}
            />
          </div>
          <div>
            <label className="block text-white/40 text-xs font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={user.email || ""}
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white/30 border border-white/5 cursor-not-allowed"
              style={{ background: "oklch(0.12 0.02 220)" }}
            />
          </div>
        </div>

        <div>
          <label className="block text-white/40 text-xs font-medium mb-1.5">Bio</label>
          <textarea
            id="profile-bio"
            value={form.bio}
            onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
            placeholder="Tell NGOs and fellow volunteers a little about yourself..."
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-white/25 border border-white/8 outline-none focus:border-emerald-500/40 transition-colors resize-none"
            style={{ background: "oklch(0.14 0.02 220)" }}
          />
        </div>
      </section>

      {/* ── Skills ──────────────────────────────────────── */}
      <section
        className="rounded-3xl p-6 border border-white/5"
        style={{ background: "oklch(0.115 0.02 220)" }}
      >
        <h3 className="text-white font-bold text-sm mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
          🛠️ My Skills
          <span className="ml-2 text-white/30 font-normal">Select all that apply</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {SKILL_OPTIONS.map((skill) => {
            const isSelected = form.skills.includes(skill);
            return (
              <button
                key={skill}
                id={`skill-${skill.replace(/\s+/g, "-")}`}
                onClick={() => toggleArray("skills", skill)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 capitalize ${
                  isSelected
                    ? "text-emerald-300 border-emerald-500/40"
                    : "text-white/40 border-white/8 hover:text-white/65 hover:border-white/15"
                }`}
                style={
                  isSelected
                    ? { background: "oklch(0.22 0.08 160 / 0.3)" }
                    : { background: "oklch(0.14 0.02 220)" }
                }
              >
                {isSelected && "✓ "}{skill}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Availability ────────────────────────────────── */}
      <section
        className="rounded-3xl p-6 border border-white/5"
        style={{ background: "oklch(0.115 0.02 220)" }}
      >
        <h3 className="text-white font-bold text-sm mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
          🗓️ Availability
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {AVAILABILITY_OPTIONS.map((opt) => {
            const isSelected = form.availability.includes(opt.value);
            return (
              <button
                key={opt.value}
                id={`avail-${opt.value}`}
                onClick={() => toggleArray("availability", opt.value)}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold border text-left transition-all duration-200 ${
                  isSelected
                    ? "text-teal-300 border-teal-500/40"
                    : "text-white/40 border-white/8 hover:text-white/65 hover:border-white/15"
                }`}
                style={
                  isSelected
                    ? { background: "oklch(0.18 0.07 195 / 0.3)" }
                    : { background: "oklch(0.14 0.02 220)" }
                }
              >
                {isSelected ? "✓ " : "○ "}{opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Causes ──────────────────────────────────────── */}
      <section
        className="rounded-3xl p-6 border border-white/5"
        style={{ background: "oklch(0.115 0.02 220)" }}
      >
        <h3 className="text-white font-bold text-sm mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
          💚 Causes I Care About
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {CAUSE_OPTIONS.map((cause) => {
            const isSelected = form.causes.includes(cause.value);
            return (
              <button
                key={cause.value}
                id={`cause-${cause.value}`}
                onClick={() => toggleArray("causes", cause.value)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all duration-200 ${
                  isSelected
                    ? "border-emerald-500/40 text-emerald-300"
                    : "border-white/8 text-white/40 hover:text-white/65 hover:border-white/15"
                }`}
                style={
                  isSelected
                    ? { background: "oklch(0.22 0.08 160 / 0.25)" }
                    : { background: "oklch(0.14 0.02 220)" }
                }
              >
                <span className="text-xl">{cause.icon}</span>
                <span className="text-xs font-medium leading-tight">{cause.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Save button ──────────────────────────────────── */}
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm bg-red-500/10 border border-red-500/25 text-red-300">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-white/30 text-xs">
          Changes are saved to your Supabase profile
        </p>
        <button
          id="save-profile-btn"
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm transition-all duration-300 shadow-lg ${
            saved
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white hover:scale-105 shadow-emerald-900/40"
          } disabled:opacity-70 disabled:cursor-not-allowed`}
        >
          {saving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : saved ? (
            "✓ Saved!"
          ) : (
            "Save Profile →"
          )}
        </button>
      </div>
    </div>
  );
}
