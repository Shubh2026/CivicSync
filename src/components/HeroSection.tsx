"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import OvalCard from "@/components/OvalCard";



const DeveloperCredit = () => (
  <div className="hidden xl:flex flex-col items-center gap-2 fixed left-6 top-1/2 -translate-y-1/2 z-40">
    <div className="flex items-center gap-2">
      <div className="w-0.5 h-32 bg-gradient-to-b from-transparent via-emerald-500/60 to-transparent rounded-full" />
      <div className="flex flex-col">
        <span
          className="text-white/30 font-medium text-[9px] tracking-[0.3em]"
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            transform: "rotate(180deg)",
          }}
        >
          DEVELOPER – SHUBH RAWAT &nbsp;&nbsp;•&nbsp;&nbsp; FOR THE PEOPLE
        </span>
      </div>
    </div>
  </div>
);

const BackgroundOrb = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
    style={style}
  />
);

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 20% 50%, oklch(0.22 0.08 160 / 0.4) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, oklch(0.22 0.07 195 / 0.3) 0%, transparent 50%), oklch(0.10 0.02 220)",
      }}
    >
      {/* Background orbs */}
      <BackgroundOrb
        className="w-[600px] h-[600px] -top-32 -left-64 opacity-20 animate-rotate-slowly"
        style={{ background: "radial-gradient(circle, oklch(0.55 0.18 160), transparent)" }}
      />
      <BackgroundOrb
        className="w-[400px] h-[400px] top-1/4 right-1/4 opacity-10"
        style={{ background: "radial-gradient(circle, oklch(0.48 0.16 195), transparent)" }}
      />
      <BackgroundOrb
        className="w-[300px] h-[300px] bottom-0 right-0 opacity-15"
        style={{ background: "radial-gradient(circle, oklch(0.62 0.20 155), transparent)" }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0 / 0.5) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Developer credit */}
      <DeveloperCredit />

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-32 max-w-7xl mx-auto w-full">
        {/* Connect badge */}
        <div className="animate-fade-in-up opacity-0" style={{ animationFillMode: "forwards" }}>
          <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-8 border border-emerald-500/30">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-semibold text-sm tracking-wider uppercase">
              Connect
            </span>
            <span className="text-white/40 text-sm">•</span>
            <span className="text-white/60 text-sm">Volunteer Platform</span>
          </div>
        </div>

        {/* Main headline */}
        <div
          className="text-center mb-6 animate-fade-in-up opacity-0 delay-200"
          style={{ animationFillMode: "forwards" }}
        >
          <h1
            className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] mb-4"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            <span className="text-white block">Turn Data</span>
            <span className="block">
              <span className="gradient-text">into Action.</span>
            </span>
          </h1>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.95] text-white/90"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Turn{" "}
            <span className="relative inline-block">
              <span className="gradient-text">People</span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 8 Q50 2 100 6 Q150 10 198 4"
                  stroke="url(#underline-grad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="underline-grad" x1="0" y1="0" x2="100%" y2="0">
                    <stop stopColor="#34d399" />
                    <stop offset="1" stopColor="#2dd4bf" />
                  </linearGradient>
                </defs>
              </svg>
            </span>{" "}
            into Change.
          </h2>
        </div>

        {/* Description */}
        <p
          className="text-white/60 text-base md:text-lg max-w-2xl text-center mb-12 leading-relaxed animate-fade-in-up opacity-0 delay-300"
          style={{ animationFillMode: "forwards" }}
        >
          Your community has real needs. We connect passionate volunteers with NGOs,
          social groups, and civic organizations — enabling impactful volunteering powered by
          transparent data and genuine human connection.
        </p>

        {/* Oval cards + CTA layout */}
        <div className="w-full max-w-5xl">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 mb-12">
            {/* Volunteer Oval */}
            <div
              className="animate-fade-in-left opacity-0 delay-400"
              style={{ animationFillMode: "forwards" }}
            >
              <OvalCard
                label="Volunteer"
                sublabel="Make a difference"
                icon="🙌"
                color="green"
                floatDelay={0}
                className="w-[260px] h-[140px]"
              />
            </div>

            {/* Center connector + CTA buttons */}
            <div
              className="flex flex-col items-center gap-4 animate-fade-in-up opacity-0 delay-500"
              style={{ animationFillMode: "forwards" }}
            >
              {/* Connector lines (desktop only) */}
              <div className="hidden lg:flex items-center gap-3">
                <div className="w-16 h-px bg-gradient-to-r from-emerald-500/30 to-emerald-500" />
                <div className="w-8 h-8 rounded-full border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 text-sm font-bold glass">
                  +
                </div>
                <div className="w-16 h-px bg-gradient-to-r from-teal-500 to-teal-500/30" />
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Link href="/role-select?role=volunteer" id="join-volunteer-btn">
                  <Button
                    size="lg"
                    className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold px-8 py-6 text-base shadow-2xl shadow-emerald-900/40 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105 animate-pulse-glow rounded-2xl"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      🙌 Join as Volunteer
                    </span>
                    <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </Button>
                </Link>
                <Link href="/role-select?role=ngo" id="join-ngo-btn">
                  <Button
                    size="lg"
                    variant="outline"
                    className="group relative overflow-hidden border-2 border-teal-500/60 hover:border-teal-400 bg-teal-950/30 hover:bg-teal-900/40 text-teal-300 hover:text-teal-200 font-bold px-8 py-6 text-base transition-all duration-300 hover:scale-105 rounded-2xl backdrop-blur-sm"
                  >
                    <span className="flex items-center gap-2">
                      🏛️ Join as Social Group / NGO
                    </span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Social Group Oval */}
            <div
              className="animate-fade-in-right opacity-0 delay-400"
              style={{ animationFillMode: "forwards" }}
            >
              <OvalCard
                label="Social Group"
                sublabel="NGOs & Organizations"
                icon="🏛️"
                color="teal"
                floatDelay={500}
                className="w-[260px] h-[140px]"
              />
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div
          className="flex flex-wrap items-center justify-center gap-6 animate-fade-in-up opacity-0 delay-700"
          style={{ animationFillMode: "forwards" }}
        >
          {[
            { icon: "✓", text: "Free to join" },
            { icon: "🔒", text: "Verified NGOs" },
            { icon: "📍", text: "Across the US" },
            { icon: "💚", text: "Real impact" },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-2 text-white/50 text-sm"
            >
              <span className="text-emerald-400 text-xs font-bold">{item.icon}</span>
              <span className="font-medium">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in-up opacity-0 delay-1000"
          style={{ animationFillMode: "forwards" }}
        >
          <span className="text-white/30 text-xs tracking-widest uppercase font-medium">
            Scroll to explore
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent relative overflow-hidden rounded-full">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-emerald-400 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
