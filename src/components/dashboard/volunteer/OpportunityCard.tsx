"use client";

import { useState } from "react";
import type { Opportunity } from "@/lib/types";
import { CATEGORY_META, URGENCY_META } from "@/lib/types";

interface Props {
  opportunity: Opportunity;
  accepted?: boolean;
  onAccept?: (id: string) => Promise<void>;
}

export default function OpportunityCard({ opportunity: opp, accepted = false, onAccept }: Props) {
  const [loading, setLoading] = useState(false);
  const [localAccepted, setLocalAccepted] = useState(accepted);

  const catMeta = CATEGORY_META[opp.category] ?? CATEGORY_META.other;
  const urgencyMeta = URGENCY_META[opp.urgency] ?? URGENCY_META.medium;

  const spotsLeft = opp.volunteers_needed - opp.volunteers_accepted;
  const fillPct = Math.round((opp.volunteers_accepted / opp.volunteers_needed) * 100);

  const handleAccept = async () => {
    if (!onAccept || localAccepted) return;
    setLoading(true);
    try {
      await onAccept(opp.id);
      setLocalAccepted(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d?: string | null) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div
      className="group relative rounded-3xl overflow-hidden border border-white/5 hover:border-white/12 transition-all duration-300 hover:-translate-y-1 flex flex-col"
      style={{ background: "oklch(0.12 0.02 220)" }}
    >
      {/* Color accent top bar */}
      <div
        className="h-1 w-full"
        style={{ background: `linear-gradient(90deg, ${catMeta.color}, ${catMeta.color}88)` }}
      />

      <div className="p-5 flex-1 flex flex-col">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-lg"
            style={{ background: `${catMeta.color}20`, border: `1px solid ${catMeta.color}30` }}
          >
            {catMeta.icon}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {/* Urgency badge */}
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide"
              style={{
                background: urgencyMeta.bg,
                color: urgencyMeta.color,
                border: `1px solid ${urgencyMeta.color}30`,
              }}
            >
              {opp.urgency === "critical" ? "🔴" : opp.urgency === "high" ? "🟠" : opp.urgency === "medium" ? "🟡" : "🟢"} {urgencyMeta.label}
            </span>
            {/* Category */}
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ background: `${catMeta.color}15`, color: catMeta.color }}
            >
              {catMeta.label}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-white font-bold text-base mb-1.5 leading-snug group-hover:text-emerald-300 transition-colors duration-200"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {opp.title}
        </h3>

        {/* Description */}
        <p className="text-white/45 text-xs leading-relaxed mb-4 line-clamp-3">{opp.description}</p>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="flex items-center gap-1.5 text-xs text-white/50">
            <span>📍</span>
            <span>{opp.location}</span>
          </span>
          {opp.date_start && (
            <span className="flex items-center gap-1.5 text-xs text-white/50">
              <span>📅</span>
              <span>{formatDate(opp.date_start)}</span>
            </span>
          )}
          {opp.hours_per_week && (
            <span className="flex items-center gap-1.5 text-xs text-white/50">
              <span>⏱️</span>
              <span>{opp.hours_per_week}h{opp.is_one_time ? "" : "/week"}</span>
            </span>
          )}
          {opp.is_remote && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400/80">
              <span>💻</span> Remote
            </span>
          )}
        </div>

        {/* Skills */}
        {opp.required_skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {opp.required_skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded-lg text-xs text-white/45 capitalize"
                style={{ background: "oklch(0.18 0.02 220)", border: "1px solid oklch(1 0 0 / 0.07)" }}
              >
                {skill}
              </span>
            ))}
            {opp.required_skills.length > 3 && (
              <span className="px-2 py-0.5 rounded-lg text-xs text-white/30" style={{ background: "oklch(0.18 0.02 220)" }}>
                +{opp.required_skills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Volunteer fill bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-white/40">
              {opp.volunteers_accepted}/{opp.volunteers_needed} volunteers
            </span>
            <span style={{ color: catMeta.color }} className="font-semibold">
              {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "oklch(0.18 0.02 220)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${fillPct}%`,
                background: `linear-gradient(90deg, ${catMeta.color}, ${catMeta.color}aa)`,
              }}
            />
          </div>
        </div>

        {/* Accept button */}
        <div className="mt-auto">
          {onAccept ? (
            <button
              id={`accept-${opp.id}`}
              onClick={handleAccept}
              disabled={loading || localAccepted || spotsLeft <= 0}
              className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                localAccepted
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 cursor-default"
                  : spotsLeft <= 0
                  ? "bg-white/5 text-white/25 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              } disabled:opacity-70`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Accepting...
                </span>
              ) : localAccepted ? (
                "✓ Accepted!"
              ) : spotsLeft <= 0 ? (
                "Fully Booked"
              ) : (
                "Accept & Volunteer →"
              )}
            </button>
          ) : (
            <div
              className="w-full py-2 rounded-xl text-center text-xs font-semibold text-white/30 border border-white/5"
              style={{ background: "oklch(0.15 0.02 220)" }}
            >
              View details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
