"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section
      id="contact"
      className="py-28 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, oklch(0.18 0.06 160 / 0.5) 0%, oklch(0.10 0.02 220) 70%)",
      }}
    >
      {/* Decorative background shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, oklch(0.62 0.20 155), transparent)",
          }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, oklch(0.48 0.16 195), transparent)",
          }}
        />
        {/* Connecting oval shape */}
        <svg
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-5"
          viewBox="0 0 800 400"
          fill="none"
          aria-hidden="true"
        >
          <ellipse
            cx="400"
            cy="200"
            rx="380"
            ry="180"
            stroke="url(#cta-oval-grad)"
            strokeWidth="2"
            strokeDasharray="8 12"
          />
          <defs>
            <linearGradient id="cta-oval-grad" x1="0" y1="0" x2="100%" y2="100%">
              <stop stopColor="#34d399" />
              <stop offset="1" stopColor="#2dd4bf" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Tag */}
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8 border border-emerald-500/30">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-semibold tracking-widest uppercase">
            Get Started Today
          </span>
        </div>

        <h2
          className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.1]"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Ready to be part of{" "}
          <span className="gradient-text">the change?</span>
        </h2>

        <p className="text-white/55 text-lg max-w-xl mx-auto mb-12 leading-relaxed">
          Join thousands of volunteers and hundreds of NGOs already using CivicSync to
          coordinate meaningful, measurable community impact across the United States.
        </p>

        {/* Dual CTA */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-16">
          <Link href="/role-select?role=volunteer" id="cta-volunteer-btn">
            <Button
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold px-10 py-6 text-base shadow-2xl shadow-emerald-900/50 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105 rounded-2xl animate-pulse-glow"
            >
              <span className="relative z-10 flex items-center gap-2">
                🙌 Join as Volunteer
              </span>
              <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Button>
          </Link>
          <Link href="/role-select?role=ngo" id="cta-ngo-btn">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-teal-500/50 hover:border-teal-400 bg-transparent hover:bg-teal-900/30 text-teal-300 hover:text-teal-200 font-bold px-10 py-6 text-base transition-all duration-300 hover:scale-105 rounded-2xl"
            >
              🏛️ Join as Social Group / NGO
            </Button>
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex flex-wrap items-center justify-center gap-8">
          <div className="flex items-center gap-3">
            {/* Avatar group */}
            <div className="flex -space-x-2">
              {["🧑", "👩", "👨", "🧑‍🦱"].map((avatar, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full glass border-2 border-emerald-500/30 flex items-center justify-center text-base"
                  style={{ zIndex: 4 - i }}
                >
                  {avatar}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="text-white text-sm font-semibold">12,000+ volunteers</div>
              <div className="text-white/40 text-xs">already joined</div>
            </div>
          </div>
          <div className="w-px h-10 bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-3">
            <div className="text-2xl">⭐</div>
            <div className="text-left">
              <div className="text-white text-sm font-semibold">4.9 / 5 rating</div>
              <div className="text-white/40 text-xs">from 2,400+ reviews</div>
            </div>
          </div>
          <div className="w-px h-10 bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-3">
            <div className="text-2xl">🆓</div>
            <div className="text-left">
              <div className="text-white text-sm font-semibold">Always free</div>
              <div className="text-white/40 text-xs">no hidden costs</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
