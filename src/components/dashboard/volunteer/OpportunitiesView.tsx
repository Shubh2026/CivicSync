"use client";

import { useEffect, useState, useCallback } from "react";
import type { Opportunity } from "@/lib/types";
import { CATEGORY_META, URGENCY_META } from "@/lib/types";
import OpportunityCard from "./OpportunityCard";

interface Props {
  userId: string;
}

const CITIES = ["All Cities", "Amritsar", "Ludhiana", "Chandigarh", "Pathankot", "Jalandhar", "Patiala", "Remote"];
const CATEGORIES = [
  { value: "all", label: "All Categories", icon: "🌐" },
  ...Object.entries(CATEGORY_META).map(([k, v]) => ({ value: k, label: v.label, icon: v.icon })),
];
const URGENCIES = [
  { value: "all", label: "Any Urgency" },
  { value: "critical", label: "🔴 Critical" },
  { value: "high",     label: "🟠 High" },
  { value: "medium",   label: "🟡 Medium" },
  { value: "low",      label: "🟢 Low" },
];

export default function OpportunitiesView({ userId }: Props) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());

  // Filters
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [category, setCategory] = useState("all");
  const [urgency, setUrgency] = useState("all");
  const [remoteOnly, setRemoteOnly] = useState(false);

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (city !== "all" && city !== "Remote") params.set("city", city);
      if (urgency !== "all") params.set("urgency", urgency);
      if (search) params.set("search", search);

      const res = await fetch(`/api/opportunities?${params.toString()}`);
      const { data } = await res.json();

      let filtered = data as Opportunity[];
      if (remoteOnly) filtered = filtered.filter((o) => o.is_remote);
      if (city === "Remote") filtered = filtered.filter((o) => o.is_remote);

      setOpportunities(filtered);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [category, city, urgency, search, remoteOnly]);

  useEffect(() => {
    const t = setTimeout(fetchOpportunities, 300);
    return () => clearTimeout(t);
  }, [fetchOpportunities]);

  const handleAccept = async (opportunityId: string) => {
    const res = await fetch("/api/volunteer/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId }),
    });
    if (res.ok || res.status === 409) {
      setAcceptedIds((prev) => new Set(prev).add(opportunityId));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2
          className="text-2xl font-black text-white mb-1"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          🔍 Available Opportunities
        </h2>
        <p className="text-white/40 text-sm">
          Find and accept volunteer opportunities near you
        </p>
      </div>

      {/* ── Filters ─────────────────────────────────────── */}
      <div
        className="rounded-2xl p-4 border border-white/5 space-y-4"
        style={{ background: "oklch(0.115 0.02 220)" }}
      >
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            id="opportunity-search"
            type="text"
            placeholder="Search opportunities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 border border-white/8 outline-none focus:border-emerald-500/40 transition-colors duration-200"
            style={{ background: "oklch(0.14 0.02 220)" }}
          />
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-3">
          {/* Category */}
          <select
            id="filter-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 min-w-[140px] px-3 py-2.5 rounded-xl text-sm text-white border border-white/8 outline-none focus:border-emerald-500/40 transition-colors cursor-pointer"
            style={{ background: "oklch(0.14 0.02 220)" }}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>

          {/* City */}
          <select
            id="filter-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 min-w-[140px] px-3 py-2.5 rounded-xl text-sm text-white border border-white/8 outline-none focus:border-emerald-500/40 transition-colors cursor-pointer"
            style={{ background: "oklch(0.14 0.02 220)" }}
          >
            {CITIES.map((c) => (
              <option key={c} value={c === "All Cities" ? "all" : c}>
                📍 {c}
              </option>
            ))}
          </select>

          {/* Urgency */}
          <select
            id="filter-urgency"
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="flex-1 min-w-[140px] px-3 py-2.5 rounded-xl text-sm text-white border border-white/8 outline-none focus:border-emerald-500/40 transition-colors cursor-pointer"
            style={{ background: "oklch(0.14 0.02 220)" }}
          >
            {URGENCIES.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>

          {/* Remote toggle */}
          <button
            id="filter-remote"
            onClick={() => setRemoteOnly((v) => !v)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
              remoteOnly
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                : "text-white/45 border-white/8 hover:border-white/15 hover:text-white/65"
            }`}
            style={!remoteOnly ? { background: "oklch(0.14 0.02 220)" } : {}}
          >
            💻 Remote
          </button>

          {/* Reset */}
          {(search || city !== "all" || category !== "all" || urgency !== "all" || remoteOnly) && (
            <button
              onClick={() => {
                setSearch(""); setCity("all"); setCategory("all");
                setUrgency("all"); setRemoteOnly(false);
              }}
              className="px-4 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/60 border border-white/8 hover:border-white/15 transition-all duration-200"
              style={{ background: "oklch(0.14 0.02 220)" }}
            >
              ✕ Reset
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-white/35 text-sm">
          {loading ? "Searching..." : `${opportunities.length} opportunit${opportunities.length === 1 ? "y" : "ies"} found`}
        </p>
        {/* Urgency legend */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-white/35">
          {Object.entries(URGENCY_META).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: v.color }} />
              {v.label}
            </span>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 rounded-3xl animate-pulse"
              style={{ background: "oklch(0.13 0.02 220)" }}
            />
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h3
            className="text-white font-bold text-lg mb-2"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            No opportunities found
          </h3>
          <p className="text-white/35 text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {opportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              accepted={acceptedIds.has(opp.id)}
              onAccept={handleAccept}
            />
          ))}
        </div>
      )}
    </div>
  );
}
