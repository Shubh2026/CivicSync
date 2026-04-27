"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { Opportunity, VolunteerProfile } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";
import type { View } from "./types";
import OpportunityCard from "./OpportunityCard";

interface Props {
  user: User;
  profile: VolunteerProfile;
  onNavigate: (view: View) => void;
}

const MOTIVATIONAL = [
  "Every hour you give changes someone's world. 🌍",
  "Small acts of kindness ripple into big waves of change. 🌊",
  "Be the change you wish to see in Punjab. 💚",
  "Your skills are someone else's miracle. ✨",
];

export default function HomeView({ user, profile, onNavigate }: Props) {
  const [featuredOpps, setFeaturedOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [quote] = useState(() => MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]);

  const displayName =
    profile.full_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Volunteer";

  useEffect(() => {
    fetch("/api/opportunities?urgency=high&urgency=critical")
      .then((r) => r.json())
      .then(({ data }) => {
        setFeaturedOpps((data as Opportunity[]).slice(0, 6));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = async (opportunityId: string) => {
    const res = await fetch("/api/volunteer/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId }),
    });
    if (res.ok) {
      setAcceptedIds((prev) => new Set(prev).add(opportunityId));
    }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const statCards = [
    { label: "Active Opportunities",  value: "1,200+", icon: "🌟", color: "#34d399", sub: "across Punjab" },
    { label: "Volunteers Needed",     value: "340",    icon: "🙌", color: "#818cf8", sub: "this week"      },
    { label: "NGOs on CivicSync",     value: "85+",    icon: "🏛️", color: "#fb923c", sub: "verified orgs"  },
    { label: "Impact Hours Logged",   value: "12K+",   icon: "⏱️", color: "#f472b6", sub: "by volunteers"  },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* ── Hero greeting ─────────────────────────────── */}
      <div
        className="rounded-3xl p-7 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.09 160 / 0.5), oklch(0.18 0.065 195 / 0.4))",
          border: "1px solid oklch(0.55 0.18 160 / 0.2)",
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-12 -right-12 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, oklch(0.62 0.22 155), transparent)" }}
        />
        <div
          className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full blur-2xl opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, oklch(0.55 0.18 195), transparent)" }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-emerald-400/80 text-sm font-semibold mb-1">{greeting},</p>
            <h2
              className="text-3xl font-black text-white mb-2"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {displayName.split(" ")[0]} 👋
            </h2>
            <p className="text-white/55 text-sm max-w-sm italic">"{quote}"</p>
          </div>
          <div className="flex flex-col sm:items-end gap-3">
            <button
              onClick={() => onNavigate("opportunities")}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold px-6 py-3 rounded-2xl text-sm transition-all duration-300 hover:scale-105 shadow-xl shadow-emerald-900/40 whitespace-nowrap"
            >
              🔍 Find Opportunities
            </button>
            <p className="text-white/30 text-xs text-right">
              {profile.location || "Amritsar, Punjab"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-0.5"
            style={{ background: "oklch(0.12 0.02 220)" }}
          >
            <div className="text-2xl mb-3">{stat.icon}</div>
            <div
              className="text-2xl font-black text-white mb-0.5"
              style={{ fontFamily: "'Outfit', sans-serif", color: stat.color }}
            >
              {stat.value}
            </div>
            <div className="text-white/60 text-xs font-semibold">{stat.label}</div>
            <div className="text-white/25 text-xs mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Categories ────────────────────────────────── */}
      <div>
        <h3
          className="text-white font-bold text-base mb-4"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Browse by Cause
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
          {Object.entries(CATEGORY_META).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => onNavigate("opportunities")}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-white/5 hover:border-white/15 transition-all duration-200 hover:-translate-y-0.5 group"
              style={{ background: "oklch(0.12 0.02 220)" }}
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                {meta.icon}
              </span>
              <span className="text-white/50 text-xs font-medium text-center leading-tight group-hover:text-white/80 transition-colors duration-200">
                {meta.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Featured opportunities ────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3
              className="text-white font-bold text-base"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              🔥 Urgent Opportunities Near You
            </h3>
            <p className="text-white/35 text-xs mt-0.5">Most needed right now</p>
          </div>
          <button
            onClick={() => onNavigate("opportunities")}
            className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold transition-colors duration-200"
          >
            View all →
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-72 rounded-3xl animate-pulse"
                style={{ background: "oklch(0.14 0.02 220)" }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredOpps.map((opp) => (
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
    </div>
  );
}
