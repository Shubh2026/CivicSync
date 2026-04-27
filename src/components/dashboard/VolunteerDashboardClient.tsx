"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { VolunteerProfile } from "@/lib/types";
import HomeView from "./volunteer/HomeView";
import HistoryView from "./volunteer/HistoryView";
import ProfileView from "./volunteer/ProfileView";
import OpportunitiesView from "./volunteer/OpportunitiesView";
import NotificationBell from "@/components/ui/NotificationBell";
import { useTableRealtime } from "@/lib/useRealtime";

type View = "home" | "opportunities" | "history" | "profile";

const NAV_ITEMS: { view: View; icon: string; label: string }[] = [
  { view: "home",          icon: "🏠", label: "Home"                   },
  { view: "opportunities", icon: "🔍", label: "Available Opportunities" },
  { view: "history",       icon: "📋", label: "My History"             },
  { view: "profile",       icon: "👤", label: "Profile"                },
];

interface Props {
  user: User;
  profile: VolunteerProfile;
}

export default function VolunteerDashboardClient({ user, profile }: Props) {
  const [activeView, setActiveView] = useState<View>("home");
  const [signingOut, setSigningOut] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const supabase = createClient();

  // Refresh home/opportunities when new opportunity is posted
  const triggerRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);
  useTableRealtime("opportunities", triggerRefresh, { event: "INSERT" });

  const displayName =
    profile.full_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Volunteer";

  const avatarUrl = profile.avatar_url || user.user_metadata?.avatar_url || null;
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex" style={{ background: "oklch(0.095 0.018 220)" }}>
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "oklch(0.075 0.018 220)",
          borderRight: "1px solid oklch(1 0 0 / 0.07)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-sm">C</span>
          </div>
          <span
            className="text-white font-black text-lg"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Civic<span className="text-emerald-400">Sync</span>
          </span>
        </div>

        {/* User card */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: "oklch(0.12 0.02 220)" }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-sm">{initials}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{displayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs font-medium">Volunteer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => { setActiveView(item.view); setMobileNavOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left group ${
                  isActive
                    ? "text-emerald-300"
                    : "text-white/45 hover:text-white/80 hover:bg-white/5"
                }`}
                style={
                  isActive
                    ? {
                        background:
                          "linear-gradient(135deg, oklch(0.55 0.18 160 / 0.15), oklch(0.48 0.16 195 / 0.08))",
                        border: "1px solid oklch(0.55 0.18 160 / 0.25)",
                      }
                    : {}
                }
              >
                <span className={`text-base transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-105"}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/5 space-y-1">
          <button
            onClick={() => window.location.href = "/"}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-white/35 hover:text-white/60 hover:bg-white/5 transition-all duration-200"
          >
            <span>🌐</span> Back to Landing
          </button>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-white/35 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50"
          >
            <span>🚪</span>
            {signingOut ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* ── Main content ────────────────────────────────── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-white/5"
          style={{ background: "oklch(0.085 0.018 220 / 0.95)", backdropFilter: "blur(12px)" }}
        >
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Open navigation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1
                className="text-white font-black text-lg"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {NAV_ITEMS.find((n) => n.view === activeView)?.label}
              </h1>
              <p className="text-white/35 text-xs hidden sm:block">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Right: quick actions */}
          <div className="flex items-center gap-3">
            <NotificationBell
              userId={user.id}
              role="volunteer"
              onNavigate={(v) => setActiveView(v as View)}
              accentColor="emerald"
            />
            <button
              onClick={() => setActiveView("opportunities")}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-400 hover:to-teal-500 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              🔍 Find Opportunities
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center overflow-hidden cursor-pointer shadow">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-xs">{initials}</span>
              )}
            </div>
          </div>
        </header>

        {/* View content */}
        <main className="flex-1 overflow-auto">
          {activeView === "home" && (
            <HomeView key={refreshKey} user={user} profile={profile} onNavigate={setActiveView} />
          )}
          {activeView === "opportunities" && (
            <OpportunitiesView key={refreshKey} userId={user.id} />
          )}
          {activeView === "history" && (
            <HistoryView userId={user.id} displayName={displayName} />
          )}
          {activeView === "profile" && (
            <ProfileView user={user} profile={profile} />
          )}
        </main>
      </div>
    </div>
  );
}
