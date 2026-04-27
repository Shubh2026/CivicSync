"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

function LoginContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/role-select";
  const errorParam = searchParams.get("error");

  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(
    errorParam ? { type: "error", text: "Authentication failed. Please try again." } : null
  );

  const supabase = createClient();

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Check role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (!profile?.role) {
          window.location.href = "/role-select";
        } else {
          window.location.href =
            profile.role === "volunteer" ? "/dashboard/volunteer" : "/dashboard/ngo";
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) {
      setMessage({ type: "error", text: error.message });
      setGoogleLoading(false);
    }
    // On success, browser redirects to Google — no more code runs here
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (tab === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({
          type: "success",
          text: "Check your email to confirm your account, then come back to sign in!",
        });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ type: "error", text: error.message });
      }
      // Success handled by onAuthStateChange listener
    }
    setLoading(false);
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
      style={{
        background:
          "radial-gradient(ellipse at 30% 50%, oklch(0.20 0.07 160 / 0.4) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, oklch(0.18 0.06 195 / 0.3) 0%, transparent 50%), oklch(0.10 0.02 220)",
      }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-4 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0 / 0.4) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.4) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />
      {/* Orbs */}
      <div
        className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none animate-float"
        style={{ background: "radial-gradient(circle, oklch(0.55 0.18 160), transparent)" }}
      />
      <div
        className="absolute bottom-20 right-10 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none animate-float-reverse"
        style={{ background: "radial-gradient(circle, oklch(0.48 0.16 195), transparent)" }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/40 transition-all duration-300 group-hover:scale-110">
              <span className="text-white font-black text-xl leading-none">C</span>
            </div>
            <span
              className="text-white font-black text-2xl tracking-tight"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Civic<span className="text-emerald-400">Sync</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          {/* Tab bar */}
          <div className="flex border-b border-white/10">
            {(["signin", "signup"] as const).map((t) => (
              <button
                key={t}
                id={`tab-${t}`}
                onClick={() => { setTab(t); setMessage(null); }}
                className={`flex-1 py-4 text-sm font-semibold tracking-wide transition-all duration-300 ${
                  tab === t
                    ? "text-emerald-400 border-b-2 border-emerald-400 bg-white/5"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <div className="p-8">
            <h1
              className="text-2xl font-black text-white mb-1"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {tab === "signin" ? "Welcome back" : "Join CivicSync"}
            </h1>
            <p className="text-white/40 text-sm mb-6">
              {tab === "signin"
                ? "Sign in to continue your impact journey"
                : "Create an account and start making a difference"}
            </p>

            {/* Alert message */}
            {message && (
              <div
                className={`rounded-xl px-4 py-3 text-sm mb-5 border ${
                  message.type === "error"
                    ? "bg-red-500/10 border-red-500/30 text-red-300"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Google Sign-In Button */}
            <button
              id="google-signin-btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl mb-5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <svg className="w-4 h-4 animate-spin text-gray-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {googleLoading ? "Redirecting to Google..." : `Continue with Google`}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/25 text-xs font-medium">or with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Email/Password form */}
            <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
              {tab === "signup" && (
                <div>
                  <label className="block text-white/60 text-xs font-semibold mb-1.5 tracking-wide uppercase">
                    Full Name
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-white/60 text-xs font-semibold mb-1.5 tracking-wide uppercase">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-white/60 text-xs font-semibold tracking-wide uppercase">
                    Password
                  </label>
                  {tab === "signin" && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!email) { setMessage({ type: "error", text: "Enter your email first." }); return; }
                        await supabase.auth.resetPasswordForEmail(email, {
                          redirectTo: `${window.location.origin}/auth/callback`,
                        });
                        setMessage({ type: "success", text: "Password reset email sent!" });
                      }}
                      className="text-emerald-400/80 hover:text-emerald-400 text-xs font-medium transition-colors duration-200"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm"
                />
              </div>

              <Button
                id="auth-submit-btn"
                type="submit"
                disabled={loading || googleLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.02] mt-1 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {tab === "signin" ? "Signing in..." : "Creating account..."}
                  </span>
                ) : (
                  tab === "signin" ? "Sign In →" : "Create Account →"
                )}
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center text-white/30 text-sm mt-6">
          {tab === "signin" ? (
            <>Don&apos;t have an account?{" "}
              <button onClick={() => { setTab("signup"); setMessage(null); }} className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors duration-200">Sign up free</button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button onClick={() => { setTab("signin"); setMessage(null); }} className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors duration-200">Sign in</button>
            </>
          )}
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[oklch(0.10_0.02_220)] flex items-center justify-center"><div className="text-white/50">Loading...</div></div>}>
      <LoginContent />
    </Suspense>
  );
}
