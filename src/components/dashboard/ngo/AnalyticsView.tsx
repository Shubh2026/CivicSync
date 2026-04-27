"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
} from "recharts";
import type { AnalyticsData } from "@/lib/types";
import { useTableRealtime } from "@/lib/useRealtime";

interface Props { ngoId: string }

const CARD_BG    = "oklch(0.11 0.018 220)";
const CARD_BDR   = "oklch(1 0 0 / 0.07)";
const CHART_GRID = "oklch(1 0 0 / 0.05)";
const AXIS_COLOR = "oklch(1 0 0 / 0.25)";

// Recharts custom tooltip wrapper
interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}
function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-xl border text-xs shadow-xl"
      style={{ background: "oklch(0.13 0.02 220)", border: "1px solid oklch(1 0 0 / 0.10)" }}
    >
      {label && <p className="text-white/50 mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

function StatCard({ label, value, icon, sub, color }: { label: string; value: string | number; icon: string; sub?: string; color: string }) {
  return (
    <div
      className="p-5 rounded-2xl border"
      style={{ background: CARD_BG, borderColor: CARD_BDR }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: `${color}22` }}
        >
          {icon}
        </div>
        <span className="text-xs text-white/30 font-medium">All time</span>
      </div>
      <p className="text-white font-black text-3xl mb-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
        {value}
      </p>
      <p className="text-white/50 text-sm">{label}</p>
      {sub && <p className="text-white/30 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

export default function NGOAnalyticsView({ ngoId }: Props) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    fetch("/api/ngo/analytics")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh when a new volunteer accepts a request
  useTableRealtime("volunteer_assignments", fetchData, { event: "INSERT" });

  const ngoId_ = ngoId;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 rounded-full border-2 border-teal-500/30 border-t-teal-400 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center py-20">
        <div className="text-5xl mb-4">📊</div>
        <p className="text-white/40">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-2">
        <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>Analytics</h2>
        <p className="text-white/45 text-sm">Track your community impact and volunteer engagement over time.</p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Community Needs Posted"
          value={data.totalNeeds}
          icon="📤"
          color="#34d399"
        />
        <StatCard
          label="Volunteer Requests"
          value={data.totalRequests}
          icon="📋"
          color="#818cf8"
        />
        <StatCard
          label="Volunteers Engaged"
          value={data.totalVolunteers}
          icon="👥"
          color="#f59e0b"
        />
        <StatCard
          label="Fulfillment Rate"
          value={`${data.fulfillmentRate}%`}
          icon="🎯"
          sub={`${data.totalHoursContributed}h contributed`}
          color="#34d399"
        />
      </div>

      {/* ── Fulfillment Gauge (Radial) + Progress bar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* RadialBar gauge */}
        <div className="p-5 rounded-2xl border" style={{ background: CARD_BG, borderColor: CARD_BDR }}>
          <p className="text-white font-bold mb-1">Fulfillment Rate</p>
          <p className="text-white/40 text-xs mb-3">Requests that reached volunteer capacity</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius={45} outerRadius={70}
                startAngle={90} endAngle={90 - (data.fulfillmentRate / 100) * 360}
                data={[{ value: data.fulfillmentRate, fill: "oklch(0.55 0.18 160)" }]}
              >
                <RadialBar dataKey="value" background={{ fill: "oklch(0.18 0.02 220)" }} cornerRadius={8} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div>
              <p className="text-5xl font-black text-emerald-400" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {data.fulfillmentRate}%
              </p>
              <p className="text-white/40 text-xs mt-1">
                {data.totalRequests > 0
                  ? `${Math.round((data.fulfillmentRate / 100) * data.totalRequests)} of ${data.totalRequests} requests filled`
                  : "No requests yet"}
              </p>
              <p className="text-white/30 text-xs mt-0.5">{data.totalHoursContributed}h total contributed</p>
            </div>
          </div>
        </div>

        {/* Needs vs Fulfilled grouped bar */}
        <div className="p-5 rounded-2xl border" style={{ background: CARD_BG, borderColor: CARD_BDR }}>
          <p className="text-white font-bold mb-1">Needs vs Requests vs Fulfilled</p>
          <p className="text-white/40 text-xs mb-4">Pipeline overview</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={[
                { name: "Documented", value: data.totalNeeds,    fill: "#34d399" },
                { name: "Requests",   value: data.totalRequests, fill: "#818cf8" },
                { name: "Fulfilled",  value: Math.round((data.fulfillmentRate / 100) * data.totalRequests), fill: "#2dd4bf" },
              ]}
              barSize={40}
              margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: AXIS_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: AXIS_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                {["#34d399", "#818cf8", "#2dd4bf"].map((color, i) => (
                  <Cell key={i} fill={color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Engagement Timeline ── */}
      <div
        className="p-5 rounded-2xl border"
        style={{ background: CARD_BG, borderColor: CARD_BDR }}
      >
        <p className="text-white font-bold mb-1">Volunteer Engagement Over Time</p>
        <p className="text-white/40 text-xs mb-5">Monthly volunteers and requests posted</p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data.engagementTimeline} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradVol" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="oklch(0.48 0.16 195)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="oklch(0.48 0.16 195)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradReq" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis dataKey="month" tick={{ fill: AXIS_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: AXIS_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, color: "oklch(1 0 0 / 0.5)" }}
              formatter={(v: string) => <span style={{ color: "oklch(1 0 0 / 0.55)" }}>{v}</span>}
            />
            <Area
              type="monotone"
              dataKey="volunteers"
              name="Volunteers"
              stroke="oklch(0.55 0.18 195)"
              strokeWidth={2}
              fill="url(#gradVol)"
            />
            <Area
              type="monotone"
              dataKey="requests"
              name="Requests"
              stroke="#818cf8"
              strokeWidth={2}
              fill="url(#gradReq)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Bottom row: Pie + Bar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Category breakdown */}
        <div
          className="p-5 rounded-2xl border"
          style={{ background: CARD_BG, borderColor: CARD_BDR }}
        >
          <p className="text-white font-bold mb-1">Needs by Category</p>
          <p className="text-white/40 text-xs mb-4">Distribution of community needs posted</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.categoryBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="count"
                nameKey="name"
              >
                {data.categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div
                      className="px-3 py-2 rounded-xl text-xs shadow-xl border"
                      style={{ background: "oklch(0.13 0.02 220)", border: "1px solid oklch(1 0 0 / 0.10)" }}
                    >
                      <p className="font-bold text-white">{d.name}</p>
                      <p style={{ color: d.color }}>{d.count} needs</p>
                    </div>
                  );
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(v: string) => <span style={{ color: "oklch(1 0 0 / 0.50)" }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Request status breakdown */}
        <div
          className="p-5 rounded-2xl border"
          style={{ background: CARD_BG, borderColor: CARD_BDR }}
        >
          <p className="text-white font-bold mb-1">Request Status Breakdown</p>
          <p className="text-white/40 text-xs mb-4">Current state of all posted requests</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={data.requestStatusBreakdown}
              margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
              barSize={32}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: AXIS_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: AXIS_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                {data.requestStatusBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Impact summary ── */}
      <div
        className="p-5 rounded-2xl border"
        style={{ background: "linear-gradient(135deg, oklch(0.48 0.16 195 / 0.10), oklch(0.40 0.14 205 / 0.05))", borderColor: "oklch(0.48 0.16 195 / 0.20)" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🌟</span>
          <div>
            <p className="text-white font-bold">Your Impact Summary</p>
            <p className="text-white/40 text-xs">Collective community impact driven by your organization</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: "📤", val: data.totalNeeds,             label: "Needs Documented" },
            { icon: "📋", val: data.totalRequests,          label: "Opportunities Created" },
            { icon: "🙋", val: data.totalVolunteers,        label: "Volunteers Mobilized" },
            { icon: "⏱️", val: `${data.totalHoursContributed}h`, label: "Hours of Service" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-2xl mb-1">{item.icon}</div>
              <p className="text-teal-300 font-black text-xl" style={{ fontFamily: "'Outfit', sans-serif" }}>{item.val}</p>
              <p className="text-white/40 text-xs">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <span className="hidden">{ngoId_}</span>
    </div>
  );
}
