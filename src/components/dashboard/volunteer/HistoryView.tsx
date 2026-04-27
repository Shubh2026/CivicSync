"use client";

import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, Legend,
} from "recharts";
import type { Assignment } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";

type Tab = "accepted" | "ongoing" | "completed";

interface Props {
  userId: string;
  displayName: string;
}

const STATUS_META: Record<Tab, { label: string; icon: string; color: string }> = {
  accepted:  { label: "Upcoming",  icon: "📅", color: "#818cf8" },
  ongoing:   { label: "Ongoing",   icon: "⚡", color: "#f59e0b" },
  completed: { label: "Completed", icon: "✅", color: "#34d399" },
};

const CHART_COLORS = ["#34d399", "#818cf8", "#f97316", "#f472b6", "#2dd4bf", "#fbbf24", "#ef4444"];

export default function HistoryView({ userId, displayName }: Props) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("completed");

  useEffect(() => {
    fetch("/api/volunteer/history")
      .then((r) => r.json())
      .then(({ data }) => setAssignments(data as Assignment[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const byStatus = (tab: Tab) => assignments.filter((a) => a.status === tab);

  const totalHours = assignments
    .filter((a) => a.status === "completed")
    .reduce((s, a) => s + (a.hours_contributed || 0), 0);

  const completedCount = byStatus("completed").length;

  // ── Chart data ───────────────────────────────────────────
  const pieData = Object.entries(
    assignments
      .filter((a) => a.status === "completed" && a.hours_contributed > 0)
      .reduce<Record<string, number>>((acc, a) => {
        const cat = a.opportunity?.category || "other";
        acc[cat] = (acc[cat] || 0) + (a.hours_contributed || 0);
        return acc;
      }, {})
  ).map(([cat, hours]) => ({
    name: CATEGORY_META[cat]?.label || cat,
    value: hours,
    color: CATEGORY_META[cat]?.color || "#94a3b8",
  }));

  // Timeline: hours per month
  const timelineData = (() => {
    const monthly: Record<string, number> = {};
    assignments
      .filter((a) => a.status === "completed" && a.accepted_at)
      .forEach((a) => {
        const key = new Date(a.accepted_at).toLocaleDateString("en-IN", {
          month: "short",
          year: "2-digit",
        });
        monthly[key] = (monthly[key] || 0) + (a.hours_contributed || 0);
      });
    return Object.entries(monthly).map(([month, hours]) => ({ month, hours }));
  })();

  // Category bar chart
  const categoryBarData = Object.entries(
    assignments.reduce<Record<string, number>>((acc, a) => {
      const cat = a.opportunity?.category || "other";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {})
  ).map(([cat, count]) => ({
    name: `${CATEGORY_META[cat]?.icon || "🤝"} ${CATEGORY_META[cat]?.label || cat}`,
    count,
  }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
    if (active && payload?.length) {
      return (
        <div
          className="px-3 py-2 rounded-xl border border-white/10 text-xs"
          style={{ background: "oklch(0.14 0.025 220)" }}
        >
          <p className="text-white font-semibold">{payload[0].name}</p>
          <p style={{ color: payload[0].payload?.color || "#34d399" }}>
            {payload[0].value} hrs
          </p>
        </div>
      );
    }
    return null;
  };

  const formatDate = (d?: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const displayedItems = byStatus(activeTab);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* ── Impact summary ──────────────────────────────── */}
      <div>
        <h2
          className="text-2xl font-black text-white mb-1"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          📊 My Impact Story
        </h2>
        <p className="text-white/40 text-sm">
          Your volunteering journey at a glance, {displayName.split(" ")[0]}
        </p>
      </div>

      {/* Impact stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Hours",   value: `${totalHours}h`,   icon: "⏱️", color: "#34d399" },
          { label: "Completed",     value: completedCount,       icon: "✅", color: "#818cf8" },
          { label: "Ongoing",       value: byStatus("ongoing").length,   icon: "⚡", color: "#f59e0b" },
          { label: "Upcoming",      value: byStatus("accepted").length,  icon: "📅", color: "#2dd4bf" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5 border border-white/5"
            style={{ background: "oklch(0.12 0.02 220)" }}
          >
            <div className="text-2xl mb-2">{s.icon}</div>
            <div
              className="text-3xl font-black mb-0.5"
              style={{ fontFamily: "'Outfit', sans-serif", color: s.color }}
            >
              {s.value}
            </div>
            <div className="text-white/40 text-xs font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Charts ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart – hours by category */}
        <div
          className="rounded-3xl p-6 border border-white/5"
          style={{ background: "oklch(0.115 0.02 220)" }}
        >
          <h3
            className="text-white font-bold text-sm mb-5"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            🥧 Hours by Cause
          </h3>
          {pieData.length === 0 ? (
            <div className="h-56 flex items-center justify-center">
              <p className="text-white/25 text-sm">Complete volunteering to see data</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
          {/* Legend */}
          <div className="flex flex-wrap gap-2 mt-3">
            {pieData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-white/50">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                {d.name} ({d.value}h)
              </span>
            ))}
          </div>
        </div>

        {/* Area chart – monthly hours */}
        <div
          className="rounded-3xl p-6 border border-white/5"
          style={{ background: "oklch(0.115 0.02 220)" }}
        >
          <h3
            className="text-white font-bold text-sm mb-5"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            📈 Hours Timeline
          </h3>
          {timelineData.length === 0 ? (
            <div className="h-56 flex items-center justify-center">
              <p className="text-white/25 text-sm">No timeline data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
                <XAxis dataKey="month" tick={{ fill: "oklch(1 0 0 / 0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "oklch(1 0 0 / 0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.14 0.025 220)",
                    border: "1px solid oklch(1 0 0 / 0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "white",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#34d399"
                  strokeWidth={2.5}
                  fill="url(#hoursGrad)"
                  dot={{ fill: "#34d399", strokeWidth: 0, r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bar chart – activities by category */}
      {categoryBarData.length > 0 && (
        <div
          className="rounded-3xl p-6 border border-white/5"
          style={{ background: "oklch(0.115 0.02 220)" }}
        >
          <h3
            className="text-white font-bold text-sm mb-5"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            📊 Activities by Cause
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={categoryBarData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
              <XAxis dataKey="name" tick={{ fill: "oklch(1 0 0 / 0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "oklch(1 0 0 / 0.35)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.14 0.025 220)",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "white",
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {categoryBarData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Tabs + history list ──────────────────────────── */}
      <div>
        <div className="flex gap-2 mb-5">
          {(["completed", "ongoing", "accepted"] as Tab[]).map((tab) => {
            const meta = STATUS_META[tab];
            const count = byStatus(tab).length;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                id={`history-tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                  isActive
                    ? "text-white"
                    : "text-white/40 hover:text-white/65"
                }`}
                style={
                  isActive
                    ? {
                        background: `${meta.color}20`,
                        border: `1px solid ${meta.color}40`,
                        color: meta.color,
                      }
                    : { background: "oklch(0.12 0.02 220)", border: "1px solid oklch(1 0 0 / 0.07)" }
                }
              >
                <span>{meta.icon}</span>
                {meta.label}
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={{
                    background: isActive ? `${meta.color}30` : "oklch(0.16 0.02 220)",
                    color: isActive ? meta.color : "oklch(1 0 0 / 0.35)",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "oklch(0.13 0.02 220)" }} />
            ))}
          </div>
        ) : displayedItems.length === 0 ? (
          <div
            className="rounded-3xl p-12 text-center border border-white/5"
            style={{ background: "oklch(0.115 0.02 220)" }}
          >
            <div className="text-4xl mb-3">{STATUS_META[activeTab].icon}</div>
            <h4 className="text-white font-bold mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              No {STATUS_META[activeTab].label} activities
            </h4>
            <p className="text-white/35 text-sm">Your {activeTab} volunteering will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedItems.map((assignment) => {
              const opp = assignment.opportunity;
              const cat = CATEGORY_META[opp?.category] ?? CATEGORY_META.other;
              const meta = STATUS_META[assignment.status as Tab] ?? STATUS_META.completed;
              return (
                <div
                  key={assignment.id}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-200"
                  style={{ background: "oklch(0.12 0.02 220)" }}
                >
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `${cat.color}20`, border: `1px solid ${cat.color}30` }}
                  >
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-sm truncate mb-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {opp?.title || "Unknown Opportunity"}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-white/40">
                      <span>📍 {opp?.location || "—"}</span>
                      <span>📅 {formatDate(opp?.date_start)}</span>
                      {assignment.hours_contributed > 0 && (
                        <span>⏱️ {assignment.hours_contributed}h contributed</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: `${meta.color}20`,
                        color: meta.color,
                        border: `1px solid ${meta.color}30`,
                      }}
                    >
                      {meta.icon} {meta.label}
                    </span>
                    {assignment.rating && (
                      <span className="text-xs text-yellow-400">
                        {"★".repeat(assignment.rating)}{"☆".repeat(5 - assignment.rating)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
