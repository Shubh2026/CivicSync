"use client";

import { useEffect, useRef } from "react";

interface StatProps {
  value: string;
  label: string;
  icon: string;
  delay: number;
}

function StatCard({ value, label, icon, delay }: StatProps) {
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
      className="flex flex-col items-center gap-2 group"
      style={{
        opacity: 0,
        transform: "translateY(30px)",
        transition: `all 0.7s ease-out ${delay}ms`,
      }}
    >
      <div className="text-4xl mb-1 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div
        className="text-4xl md:text-5xl font-black gradient-text"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {value}
      </div>
      <div className="text-white/50 text-sm font-medium text-center">{label}</div>
    </div>
  );
}

export default function StatsSection() {
  const stats = [
    { value: "12K+", label: "Active Volunteers", icon: "🙌", delay: 0 },
    { value: "340+", label: "Verified NGOs", icon: "🏛️", delay: 150 },
    { value: "48", label: "States Covered", icon: "🗺️", delay: 300 },
    { value: "95K+", label: "Hours Contributed", icon: "⏱️", delay: 450 },
  ];

  return (
    <section
      id="stats"
      className="py-20 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.13 0.04 165 / 0.8) 0%, oklch(0.10 0.02 220) 50%, oklch(0.12 0.04 195 / 0.6) 100%)",
      }}
    >
      {/* Decorative border lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />

      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
