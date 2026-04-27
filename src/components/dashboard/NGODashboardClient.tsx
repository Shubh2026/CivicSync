"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { VolunteerProfile } from "@/lib/types";
import NGOHomeView from "./ngo/HomeView";
import UploadDataView from "./ngo/UploadDataView";
import PostRequestView from "./ngo/PostRequestView";
import MyRequestsView from "./ngo/MyRequestsView";
import VolunteersEngagedView from "./ngo/VolunteersEngagedView";
import NGOAnalyticsView from "./ngo/AnalyticsView";

type View = "home" | "upload" | "post" | "requests" | "volunteers" | "analytics";

const NAV_ITEMS: { view: View; icon: string; label: string }[] = [
  { view: "home",       icon: "🏠", label: "Home"                },
  { view: "upload",     icon: "📤", label: "Upload Community Data" },
  { view: "post",       icon: "➕", label: "Post New Request"     },
  { view: "requests",   icon: "📋", label: "My Requests"         },
  { view: "volunteers", icon: "👥", label: "Volunteers Engaged"  },
  { view: "analytics",  icon: "📊", label: "Analytics"           },
];

interface Props {
  user: User;
  profile: VolunteerProfile;
}

export default function NGODashboardClient({ user, profile }: Props) {
  const [activeView, setActiveView] = useState<View>("home");
  const [signingOut, setSigningOut] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const supabase = createClient();

  const displayName =
    profile.full_name || user.user_metadata?.full_name ||
    user.email?.split("@")[0] || "Organization";

  const avatarUrl = profile.avatar_url || user.user_metadata?.avatar_url || null;
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex" style={{ background: "oklch(0.095 0.018 220)" }}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "oklch(0.075 0.018 220)", borderRight: "1px solid oklch(1 0 0 / 0.07)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-sm">C</span>
          </div>
          <span className="text-white font-black text-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Civic<span className="text-teal-400">Sync</span>
          </span>
        </div>

        {/* Org card */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: "oklch(0.12 0.02 220)" }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
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
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                <span className="text-teal-400 text-xs font-medium">NGO / Social Group</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => { setActiveView(item.view); setMobileNavOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left group ${
                  isActive ? "text-teal-300" : "text-white/45 hover:text-white/80 hover:bg-white/5"
                }`}
                style={isActive ? {
                  background: "linear-gradient(135deg, oklch(0.48 0.16 195 / 0.18), oklch(0.42 0.14 205 / 0.08))",
                  border: "1px solid oklch(0.48 0.16 195 / 0.28)",
                } : {}}
              >
                <span className={`text-base transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-105"}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400" />}
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
            <span>🚪</span> {signingOut ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setMobileNavOpen(false)} />
      )}

      {/* ── Main ──────────────────────────────────────────────── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-white/5"
          style={{ background: "oklch(0.085 0.018 220 / 0.95)", backdropFilter: "blur(12px)" }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-white font-black text-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {NAV_ITEMS.find((n) => n.view === activeView)?.label}
              </h1>
              <p className="text-white/35 text-xs hidden sm:block">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView("post")}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-teal-500 to-teal-700 text-white hover:from-teal-400 hover:to-teal-600 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              ➕ Post Request
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center overflow-hidden cursor-pointer shadow">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-xs">{initials}</span>
              )}
            </div>
          </div>
        </header>

        {/* Views */}
        <main className="flex-1 overflow-auto">
          {activeView === "home"       && <NGOHomeView user={user} profile={profile} onNavigate={setActiveView} />}
          {activeView === "upload"     && <UploadDataView ngoId={user.id} />}
          {activeView === "post"       && <PostRequestView ngoId={user.id} onSuccess={() => setActiveView("requests")} />}
          {activeView === "requests"   && <MyRequestsView ngoId={user.id} />}
          {activeView === "volunteers" && <VolunteersEngagedView ngoId={user.id} />}
          {activeView === "analytics"  && <NGOAnalyticsView ngoId={user.id} />}
        </main>
      </div>
    </div>
  );
}
