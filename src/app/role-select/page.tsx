"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

function RoleSelectContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") as "volunteer" | "ngo" | null;

  const [selected, setSelected] = useState<"volunteer" | "ngo" | null>(initialRole);
  const [saving, setSaving] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        window.location.href = "/login";
        return;
      }
      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "there";
      setUserDisplayName(name);
    });
  }, [supabase]);

  const handleConfirm = async () => {
    if (!selected) return;
    setSaving(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { error: upsertError } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      full_name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        null,
      avatar_url: user.user_metadata?.avatar_url || null,
      role: selected,
      updated_at: new Date().toISOString(),
    });

    if (upsertError) {
      setError("Failed to save your role. Please try again.");
      setSaving(false);
      return;
    }

    window.location.href =
      selected === "volunteer" ? "/dashboard/volunteer" : "/dashboard/ngo";
  };

  const roles = [
    {
      id: "volunteer" as const,
      icon: "🙌",
      title: "I'm a Volunteer",
      subtitle: "Individual seeking to help",
      description:
        "Find meaningful opportunities, track your impact, and connect with NGOs that align with your values and skills.",
      features: [
        "Browse 1,000+ volunteer opportunities",
        "Smart skill-based matching",
        "Track your community impact",
        "Connect with fellow volunteers",
        "Flexible hours — local & remote",
      ],
      color: "#34d399",
      borderHover: "hover:border-emerald-500/60",
      glowColor: "rgba(52,211,153,0.2)",
    },
    {
      id: "ngo" as const,
      icon: "🏛️",
      title: "I'm an NGO / Social Group",
      subtitle: "Organization seeking volunteers",
      description:
        "Post volunteer opportunities, manage your team, generate impact reports, and connect with passionate volunteers.",
      features: [
        "Post unlimited opportunities",
        "Access verified volunteer pool",
        "Volunteer management tools",
        "Automated impact reporting",
        "Priority listing & verification badge",
      ],
      color: "#2dd4bf",
      borderHover: "hover:border-teal-500/60",
      glowColor: "rgba(45,212,191,0.2)",
    },
  ];

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-16"
      style={{
        background:
          "radial-gradient(ellipse at 20% 50%, oklch(0.18 0.06 160 / 0.3) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, oklch(0.16 0.05 195 / 0.2) 0%, transparent 50%), oklch(0.10 0.02 220)",
      }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 opacity-4 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, oklch(1 0 0 / 0.1) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        className="absolute top-20 left-20 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none animate-float"
        style={{ background: "radial-gradient(circle, oklch(0.55 0.18 160), transparent)" }}
      />
      <div
        className="absolute bottom-20 right-20 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none animate-float-reverse"
        style={{ background: "radial-gradient(circle, oklch(0.48 0.16 195), transparent)" }}
      />

      <div className="relative z-10 w-full max-w-4xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg leading-none">C</span>
            </div>
            <span
              className="text-white font-black text-2xl tracking-tight"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Civic<span className="text-emerald-400">Sync</span>
            </span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-4 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-semibold tracking-widest uppercase">
              One-time setup
            </span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-black text-white mb-3"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {userDisplayName ? `Hey ${userDisplayName.split(" ")[0]}! ` : ""}
            How will you{" "}
            <span className="gradient-text">make an impact?</span>
          </h1>
          <p className="text-white/45 text-base max-w-md mx-auto">
            Choose your role to personalize your experience. This helps us show you the most
            relevant opportunities.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 text-center rounded-xl px-4 py-3 text-sm bg-red-500/10 border border-red-500/30 text-red-300 max-w-md mx-auto">
            {error}
          </div>
        )}

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {roles.map((role) => {
            const isSelected = selected === role.id;
            return (
              <button
                key={role.id}
                id={`role-${role.id}-card`}
                onClick={() => setSelected(role.id)}
                className={`group relative glass rounded-3xl p-8 border-2 text-left transition-all duration-300 hover:-translate-y-1 ${
                  isSelected
                    ? "border-[color:var(--role-color)]"
                    : `border-white/10 ${role.borderHover}`
                }`}
                style={
                  {
                    "--role-color": role.color,
                    boxShadow: isSelected
                      ? `0 0 40px ${role.glowColor}, 0 20px 40px oklch(0 0 0 / 0.4)`
                      : undefined,
                  } as React.CSSProperties
                }
              >
                {/* Selected checkmark */}
                {isSelected && (
                  <div
                    className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white animate-scale-in"
                    style={{
                      background: `linear-gradient(135deg, ${role.color}, ${role.color}aa)`,
                    }}
                  >
                    ✓
                  </div>
                )}

                {/* Hover gradient */}
                <div
                  className={`absolute inset-0 rounded-3xl transition-opacity duration-500 pointer-events-none ${
                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                  }`}
                  style={{
                    background: `radial-gradient(ellipse at top left, ${role.color}12, transparent 70%)`,
                  }}
                />

                <div className="relative z-10">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-lg transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${role.color}40, ${role.color}20)`,
                      border: `1px solid ${role.color}40`,
                    }}
                  >
                    {role.icon}
                  </div>
                  <span
                    className="text-xs font-semibold tracking-widest uppercase"
                    style={{ color: role.color }}
                  >
                    {role.subtitle}
                  </span>
                  <h2
                    className="text-xl font-black text-white mb-3 mt-1"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {role.title}
                  </h2>
                  <p className="text-white/45 text-sm leading-relaxed mb-6">
                    {role.description}
                  </p>
                  <ul className="space-y-2.5">
                    {role.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-white/65">
                        <span
                          className="mt-0.5 text-xs font-bold flex-shrink-0"
                          style={{ color: role.color }}
                        >
                          ✓
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </button>
            );
          })}
        </div>

        {/* Confirm button */}
        <div className="flex justify-center">
          {selected ? (
            <Button
              id="confirm-role-btn"
              onClick={handleConfirm}
              disabled={saving}
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold px-12 py-6 text-base shadow-2xl shadow-emerald-900/40 hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-105 rounded-2xl disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving your role...
                </span>
              ) : (
                `Continue as ${selected === "volunteer" ? "Volunteer" : "NGO"} →`
              )}
            </Button>
          ) : (
            <p className="text-white/30 text-sm font-medium animate-pulse">
              ↑ Select a role to continue
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

export default function RoleSelectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[oklch(0.10_0.02_220)] flex items-center justify-center">
          <div className="text-white/50">Loading...</div>
        </div>
      }
    >
      <RoleSelectContent />
    </Suspense>
  );
}
