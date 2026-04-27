"use client";

import { useEffect, useRef } from "react";

interface OvalCardProps {
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  color: "green" | "teal";
  floatDelay?: number;
  className?: string;
}

export default function OvalCard({
  label,
  sublabel,
  icon,
  color,
  floatDelay = 0,
  className = "",
}: OvalCardProps) {
  const svgRef = useRef<SVGEllipseElement>(null);

  useEffect(() => {
    if (svgRef.current) {
      const perimeter = Math.PI * (3 * (120 + 65) - Math.sqrt((3 * 120 + 65) * (120 + 3 * 65)));
      svgRef.current.style.strokeDasharray = String(perimeter);
      svgRef.current.style.strokeDashoffset = String(perimeter);
      setTimeout(() => {
        if (svgRef.current) {
          svgRef.current.style.transition = "stroke-dashoffset 2s ease-out";
          svgRef.current.style.strokeDashoffset = "0";
        }
      }, 300 + floatDelay);
    }
  }, [floatDelay]);

  const strokeColor = color === "green" ? "#34d399" : "#2dd4bf";
  const glowColor = color === "green" ? "rgba(52,211,153,0.25)" : "rgba(45,212,191,0.25)";
  const gradStart = color === "green" ? "#059669" : "#0d9488";
  const gradEnd = color === "green" ? "#10b981" : "#14b8a6";
  const animClass = color === "green" ? "animate-float" : "animate-float-reverse";

  return (
    <div
      className={`relative flex flex-col items-center justify-center ${animClass} ${className}`}
      style={{ animationDelay: `${floatDelay}ms` }}
    >
      {/* SVG oval outline - hand-drawn feel */}
      <svg
        viewBox="0 0 260 140"
        className="absolute inset-0 w-full h-full"
        style={{ filter: `drop-shadow(0 0 12px ${glowColor})` }}
        aria-hidden="true"
      >
        <defs>
          <filter id={`glow-${color}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Background fill */}
        <ellipse
          cx="130"
          cy="70"
          rx="120"
          ry="62"
          fill={`url(#oval-grad-${color})`}
          opacity="0.15"
        />
        {/* Animated stroke - hand-drawn effect */}
        <ellipse
          ref={svgRef}
          cx="130"
          cy="70"
          rx="120"
          ry="62"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          filter={`url(#glow-${color})`}
          style={{
            strokeDasharray: 1200,
            strokeDashoffset: 1200,
          }}
        />
        {/* Decorative second oval - slightly offset for sketch feel */}
        <ellipse
          cx="131"
          cy="71"
          rx="116"
          ry="58"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1"
          opacity="0.3"
          strokeDasharray="4 8"
        />
        <defs>
          <linearGradient id={`oval-grad-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradStart} />
            <stop offset="100%" stopColor={gradEnd} />
          </linearGradient>
        </defs>
      </svg>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-2 px-6">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg mb-1"
          style={{
            background: `linear-gradient(135deg, ${gradStart}, ${gradEnd})`,
            boxShadow: `0 4px 20px ${glowColor}`,
          }}
        >
          {icon}
        </div>
        <span
          className="font-black text-white text-xl text-center leading-tight"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {label}
        </span>
        {sublabel && (
          <span className="text-white/60 text-xs text-center font-medium">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
