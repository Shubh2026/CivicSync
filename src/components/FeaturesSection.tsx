"use client";

import { useEffect, useRef } from "react";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  delay: number;
  accent: string;
}

function FeatureCard({ icon, title, description, delay, accent }: FeatureCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && ref.current) {
          ref.current.style.opacity = "1";
          ref.current.style.transform = "translateY(0)";
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="group relative glass rounded-3xl p-8 border border-white/5 hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-1 cursor-default"
      style={{
        opacity: 0,
        transform: "translateY(40px)",
        transition: `all 0.7s ease-out ${delay}ms`,
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top left, ${accent}15, transparent 70%)`,
        }}
      />

      <div className="relative z-10">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${accent}40, ${accent}20)`, border: `1px solid ${accent}30` }}
        >
          {icon}
        </div>
        <h3
          className="text-white font-bold text-xl mb-3"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {title}
        </h3>
        <p className="text-white/50 text-sm leading-relaxed">{description}</p>
      </div>

      {/* Corner accent */}
      <div
        className="absolute top-0 right-0 w-16 h-16 rounded-tr-3xl rounded-bl-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500"
        style={{ background: `linear-gradient(135deg, ${accent}, transparent)` }}
      />
    </div>
  );
}

export default function FeaturesSection() {
  const features = [
    {
      icon: "🔍",
      title: "Smart Matching",
      description:
        "Our algorithm connects you with volunteer opportunities that align with your skills, schedule, and passion — no more endless scrolling.",
      accent: "#34d399",
      delay: 0,
    },
    {
      icon: "📊",
      title: "Impact Dashboard",
      description:
        "Track your community impact in real-time. See the hours contributed, lives touched, and measurable change your efforts create.",
      accent: "#2dd4bf",
      delay: 150,
    },
    {
      icon: "🏛️",
      title: "Verified NGOs",
      description:
        "Every organization on CivicSync is vetted and verified, ensuring your time goes to legitimate, high-impact causes.",
      accent: "#818cf8",
      delay: 300,
    },
    {
      icon: "📍",
      title: "Local & Remote",
      description:
        "Find opportunities in your neighborhood or contribute remotely. Civic engagement has no geographic boundaries.",
      accent: "#fb923c",
      delay: 100,
    },
    {
      icon: "🤝",
      title: "Community Network",
      description:
        "Connect with fellow volunteers, share experiences, and build a network of change-makers across the United States.",
      accent: "#f472b6",
      delay: 250,
    },
    {
      icon: "📋",
      title: "Easy Management",
      description:
        "NGOs get powerful tools to post opportunities, manage volunteers, and generate impact reports with zero technical expertise needed.",
      accent: "#facc15",
      delay: 400,
    },
  ];

  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && titleRef.current) {
          titleRef.current.style.opacity = "1";
          titleRef.current.style.transform = "translateY(0)";
        }
      },
      { threshold: 0.1 }
    );
    if (titleRef.current) observer.observe(titleRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      className="py-24 relative overflow-hidden"
      style={{ background: "oklch(0.10 0.02 220)" }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-3 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, oklch(1 0 0 / 0.08) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div
          ref={titleRef}
          className="text-center mb-16"
          style={{
            opacity: 0,
            transform: "translateY(30px)",
            transition: "all 0.8s ease-out",
          }}
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-400 text-xs font-semibold tracking-widest uppercase">
              Why CivicSync
            </span>
          </div>
          <h2
            className="text-4xl md:text-5xl font-black text-white mb-4"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Built for{" "}
            <span className="gradient-text">real impact</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
            Everything you need to coordinate volunteering, track community impact, and connect
            people to purpose.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
