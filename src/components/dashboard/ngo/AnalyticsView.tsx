"use client";

import { useEffect, useState } from "react";
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
} from "recharts";
import type { AnalyticsData } from "@/lib/types";

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

  useEffect(() => {
    fetch("/api/ngo/analytics")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

      {/* ── Fulfillment progress ── */}
      <div
        className="p-5 rounded-2xl border"
        style={{ background: CARD_BG, borderColor: CARD_BDR }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-bold">Overall Fulfillment Rate</p>
            <p className="text-white/40 text-xs">Percentage of requests that reached volunteer capacity</p>
          </div>
          <span className="text-3xl font-black text-teal-400" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {data.fulfillmentRate}%
          </span>
        </div>
        <div className="w-full h-3 rounded-full" style={{ background: "oklch(0.18 0.02 220)" }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${data.fulfillmentRate}%`,
              background: "linear-gradient(90deg, oklch(0.48 0.16 195), oklch(0.62 0.18 160))",
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-white/30">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
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
