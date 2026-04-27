"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { VolunteerProfile, AnalyticsData } from "@/lib/types";

type View = "home" | "upload" | "post" | "requests" | "volunteers" | "analytics";

interface Props {
  user: User;
  profile: VolunteerProfile;
  onNavigate: (v: View) => void;
}

export default function NGOHomeView({ user, profile, onNavigate }: Props) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const displayName =
    profile.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Organization";

  useEffect(() => {
    fetch("/api/ngo/analytics")
      .then((r) => r.json())
      .then(({ data }) => setAnalytics(data))
      .catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const QUICK_ACTIONS = [
    { icon: "📤", label: "Upload Community Data", desc: "Document needs from the field",          view: "upload"     as View, color: "#2dd4bf" },
    { icon: "➕", label: "Post New Request",       desc: "Recruit volunteers for your cause",      view: "post"       as View, color: "#818cf8" },
    { icon: "📋", label: "My Requests",            desc: "Track status & volunteers",              view: "requests"   as View, color: "#f59e0b" },
    { icon: "📊", label: "Analytics",              desc: "Impact reports & trends",                view: "analytics"  as View, color: "#f472b6" },
  ];

  const IMPACT_TIPS = [
    "📸 Adding photos to community needs increases volunteer interest by 3×",
    "⏰ Posting requests 2+ weeks ahead fills spots 67% faster",
    "💬 Sending a thank-you to completed volunteers improves retention",
    "📍 Adding precise location data helps local volunteers find you faster",
  ];
  const tip = IMPACT_TIPS[new Date().getDate() % IMPACT_TIPS.length];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-black text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {greeting}, {displayName.split(" ")[0]} 👋
          </h2>
          <p className="text-white/40 text-sm">Manage your community requests and track volunteer impact</p>
        </div>
        <button
          onClick={() => onNavigate("post")}
          className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-teal-500 to-teal-700 text-white hover:from-teal-400 hover:to-teal-600 transition-all hover:scale-105 shadow-lg"
        >
          ➕ New Request
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Needs Uploaded",       value: analytics?.totalNeeds           ?? "—", icon: "📤", color: "#2dd4bf" },
          { label: "Requests Posted",      value: analytics?.totalRequests        ?? "—", icon: "📋", color: "#818cf8" },
          { label: "Volunteers Engaged",   value: analytics?.totalVolunteers      ?? "—", icon: "👥", color: "#34d399" },
          { label: "Fulfillment Rate",     value: analytics ? `${analytics.fulfillmentRate}%` : "—", icon: "✅", color: "#f59e0b" },
          { label: "Hours Contributed",    value: analytics?.totalHoursContributed ?? "—", icon: "⏱️", color: "#f472b6" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5 border border-white/5"
            style={{ background: "oklch(0.12 0.02 220)" }}
          >
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-3xl font-black mb-0.5" style={{ color: s.color, fontFamily: "'Outfit', sans-serif" }}>
              {analytics ? s.value : (
                <span className="inline-block w-10 h-7 rounded-lg animate-pulse" style={{ background: "oklch(0.18 0.02 220)" }} />
              )}
            </div>
            <div className="text-white/40 text-xs font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions grid */}
      <div>
        <h3 className="text-white font-bold text-sm mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
          ⚡ Quick Actions
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.view}
              onClick={() => onNavigate(a.view)}
              className="p-5 rounded-2xl border border-white/5 hover:border-white/10 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group"
              style={{ background: "oklch(0.12 0.02 220)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 transition-transform duration-200 group-hover:scale-110"
                style={{ background: `${a.color}20`, border: `1px solid ${a.color}30` }}
              >
                {a.icon}
              </div>
              <p className="text-white font-semibold text-sm mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {a.label}
              </p>
              <p className="text-white/40 text-xs leading-snug">{a.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Fulfillment bar */}
      {analytics && (
        <div
          className="rounded-3xl p-6 border border-white/5"
          style={{ background: "oklch(0.12 0.02 220)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>
              🎯 Request Fulfillment Overview
            </h3>
            <span
              className="text-2xl font-black"
              style={{
                fontFamily: "'Outfit', sans-serif",
                color: analytics.fulfillmentRate >= 70 ? "#34d399" : analytics.fulfillmentRate >= 40 ? "#f59e0b" : "#ef4444",
              }}
            >
              {analytics.fulfillmentRate}%
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "oklch(0.18 0.02 220)" }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${analytics.fulfillmentRate}%`,
                background: analytics.fulfillmentRate >= 70
                  ? "linear-gradient(90deg, #34d399, #0d9488)"
                  : analytics.fulfillmentRate >= 40
                  ? "linear-gradient(90deg, #f59e0b, #f97316)"
                  : "linear-gradient(90deg, #ef4444, #f97316)",
              }}
            />
          </div>
          <p className="text-white/35 text-xs mt-2">
            {analytics.totalRequests - Math.floor(analytics.totalRequests * analytics.fulfillmentRate / 100)} requests still need volunteers
          </p>
        </div>
      )}

      {/* Tip of the day */}
      <div
        className="rounded-2xl p-4 border flex items-start gap-3"
        style={{ background: "oklch(0.18 0.07 195 / 0.15)", borderColor: "oklch(0.48 0.16 195 / 0.25)" }}
      >
        <span className="text-2xl flex-shrink-0">💡</span>
        <div>
          <p className="text-teal-300 text-xs font-bold uppercase tracking-wider mb-0.5">Tip of the Day</p>
          <p className="text-white/70 text-sm">{tip}</p>
        </div>
      </div>
    </div>
  );
}
