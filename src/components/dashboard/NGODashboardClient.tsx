"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
  email?: string;
}

interface Props {
  user: User;
  profile: Profile;
}

const statCards = [
  { label: "Open Positions", value: "0", icon: "📋", color: "#2dd4bf" },
  { label: "Volunteers Applied", value: "0", icon: "🙌", color: "#34d399" },
  { label: "Active Volunteers", value: "0", icon: "✅", color: "#818cf8" },
  { label: "Events This Month", value: "0", icon: "📅", color: "#fb923c" },
];

export default function NGODashboardClient({ user, profile }: Props) {
  const [signingOut, setSigningOut] = useState(false);
  const supabase = createClient();

  const displayName =
    profile.full_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Organization";

  const avatarUrl = profile.avatar_url || user.user_metadata?.avatar_url || null;

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.10 0.02 220)" }}>
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 bottom-0 w-64 flex flex-col"
        style={{ background: "oklch(0.08 0.02 220)", borderRight: "1px solid oklch(1 0 0 / 0.06)" }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">C</span>
            </div>
            <span className="text-white font-black text-lg tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Civic<span className="text-teal-400">Sync</span>
            </span>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl glass">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center overflow-hidden flex-shrink-0">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-sm">{displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-semibold truncate">{displayName}</p>
              <p className="text-teal-400 text-xs font-medium">NGO / Social Group</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {[
            { icon: "🏠", label: "Overview", active: true },
            { icon: "➕", label: "Post Opportunity" },
            { icon: "👥", label: "Manage Volunteers" },
            { icon: "📊", label: "Impact Reports" },
            { icon: "🏅", label: "Verification Badge" },
            { icon: "⚙️", label: "Settings" },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                item.active
                  ? "bg-teal-500/15 text-teal-300 border border-teal-500/20"
                  : "text-white/45 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50"
          >
            <span>🚪</span>
            {signingOut ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              NGO Dashboard 🏛️
            </h1>
            <p className="text-white/45 text-sm">Manage your volunteer opportunities and track your impact.</p>
          </div>
          <button className="bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-400 hover:to-teal-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all duration-300 hover:scale-105 shadow-lg">
            + Post Opportunity
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all duration-300">
              <div className="text-2xl mb-3">{stat.icon}</div>
              <div className="text-2xl font-black text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {stat.value}
              </div>
              <div className="text-white/45 text-xs font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Getting started */}
        <div
          className="rounded-3xl p-8 relative overflow-hidden mb-6"
          style={{
            background: "linear-gradient(135deg, oklch(0.20 0.07 195 / 0.4), oklch(0.16 0.05 160 / 0.3))",
            border: "1px solid oklch(0.48 0.16 195 / 0.2)",
          }}
        >
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle, oklch(0.48 0.16 195), transparent)" }}
          />
          <h3 className="text-xl font-black text-white mb-2 relative z-10" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Set up your organization profile 🎯
          </h3>
          <p className="text-white/50 text-sm mb-5 relative z-10 max-w-lg">
            Add your mission statement, logo, and contact info to attract the right volunteers and build trust with the community.
          </p>
          <button className="relative z-10 bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-400 hover:to-teal-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all duration-300 hover:scale-105 shadow-lg">
            Complete Profile →
          </button>
        </div>

        {/* Verification CTA */}
        <div
          className="rounded-3xl p-6 flex items-center justify-between gap-6"
          style={{ background: "oklch(0.14 0.025 215)", border: "1px solid oklch(1 0 0 / 0.06)" }}
        >
          <div>
            <h4 className="text-white font-bold mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              🏅 Get Verified
            </h4>
            <p className="text-white/40 text-sm">
              Verified NGOs get a trust badge and appear first in search results.
            </p>
          </div>
          <button className="flex-shrink-0 px-5 py-2.5 rounded-xl border border-teal-500/40 text-teal-300 hover:bg-teal-500/15 text-sm font-semibold transition-all duration-200">
            Apply Now
          </button>
        </div>
      </main>
    </div>
  );
}
