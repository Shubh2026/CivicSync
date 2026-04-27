"use client";

import { useEffect, useState } from "react";
import type { AssignmentWithVolunteer } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";

interface Props { ngoId: string }

function ContactModal({
  volunteer,
  onClose,
}: {
  volunteer: AssignmentWithVolunteer;
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    setSent(true);
    setTimeout(() => { setSent(false); onClose(); }, 2000);
  };

  const v = volunteer.volunteer;
  const initials = (v.full_name || "V").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-3xl border border-white/10 overflow-hidden"
        style={{ background: "oklch(0.10 0.018 220)" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h3 className="text-white font-black text-base" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Contact Volunteer
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Volunteer info */}
          <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: "oklch(0.13 0.02 220)" }}>
            <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ background: "oklch(0.48 0.16 195 / 0.2)" }}>
              {v.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.avatar_url} alt={initials} className="w-full h-full object-cover" />
              ) : (
                <span className="text-teal-300 font-bold">{initials}</span>
              )}
            </div>
            <div>
              <p className="text-white font-semibold">{v.full_name || "Volunteer"}</p>
              <p className="text-white/45 text-xs">{v.email || "No email"}</p>
              {v.location && <p className="text-white/35 text-xs">📍 {v.location}</p>}
            </div>
          </div>

          {/* Email shortcut */}
          {v.email && (
            <a
              href={`mailto:${v.email}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-teal-300 border border-teal-500/30 hover:bg-teal-500/10 transition-all"
            >
              <span>✉️</span> Open in Email Client
            </a>
          )}

          {/* In-app message */}
          <div>
            <label className="block text-white/60 text-xs font-semibold mb-1.5 uppercase tracking-wider">In-App Message</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Hi! We need your help this Saturday at 9am..."
              className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-white/30 border border-white/10 focus:outline-none focus:border-teal-500/60 resize-none transition-all"
              style={{ background: "oklch(0.13 0.02 220)" }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="w-full py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50 transition-all hover:scale-[1.01]"
            style={{ background: "linear-gradient(135deg, oklch(0.48 0.16 195), oklch(0.40 0.14 205))" }}
          >
            {sent ? "✓ Message Sent!" : "Send Message"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VolunteersEngagedView({ ngoId }: Props) {
  const [assignments, setAssignments] = useState<AssignmentWithVolunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [contactTarget, setContactTarget] = useState<AssignmentWithVolunteer | null>(null);

  useEffect(() => {
    fetch("/api/ngo/volunteers-engaged")
      .then((r) => r.json())
      .then((data) => setAssignments(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = assignments.filter((a) => {
    const v = a.volunteer;
    const matchSearch = !search ||
      (v.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (v.email || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusColors: Record<string, { label: string; color: string; bg: string }> = {
    accepted:  { label: "Accepted",  color: "#34d399", bg: "rgba(52,211,153,0.12)" },
    ongoing:   { label: "Ongoing",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    completed: { label: "Completed", color: "#818cf8", bg: "rgba(129,140,248,0.12)" },
    cancelled: { label: "Cancelled", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  };

  const totalHours = assignments.reduce((s, a) => s + (a.hours_contributed || 0), 0);
  const unique = new Set(assignments.map((a) => a.volunteer_id)).size;
  const ngoId_ = ngoId;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>Volunteers Engaged</h2>
        <p className="text-white/45 text-sm">All volunteers who have accepted your requests</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Engagements", value: assignments.length, icon: "🤝" },
          { label: "Unique Volunteers",  value: unique,             icon: "👥" },
          { label: "Total Hours",        value: `${totalHours}h`,   icon: "⏱️" },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-2xl border border-white/8"
            style={{ background: "oklch(0.11 0.018 220)" }}
          >
            <div className="text-2xl mb-1">{s.icon}</div>
            <p className="text-white font-black text-xl">{s.value}</p>
            <p className="text-white/40 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl text-white text-sm placeholder-white/30 border border-white/10 focus:outline-none focus:border-teal-500/50 transition-all"
          style={{ background: "oklch(0.13 0.02 220)" }}
          placeholder="🔍 Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          {["all", "accepted", "ongoing", "completed"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all border ${
                filterStatus === s ? "text-teal-300 border-teal-500/40" : "text-white/40 border-white/10 hover:border-white/20"
              }`}
              style={filterStatus === s ? { background: "oklch(0.48 0.16 195 / 0.12)" } : { background: "oklch(0.11 0.018 220)" }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-teal-500/30 border-t-teal-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-white/50 text-lg font-semibold">No volunteers found</p>
          <p className="text-white/30 text-sm mt-1">Post requests to attract volunteers</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden border border-white/8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "oklch(0.12 0.02 220)" }}>
                  {["Volunteer", "Skills", "Request", "Status", "Hours", "Joined", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-white/40 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => {
                  const v = a.volunteer;
                  const initials = (v.full_name || "V").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                  const st = statusColors[a.status] || statusColors.accepted;
                  const op = a.opportunity;
                  const cat = op ? CATEGORY_META[op.category] : null;

                  return (
                    <tr
                      key={a.id}
                      className="border-t border-white/5 hover:bg-white/3 transition-colors"
                      style={{ background: i % 2 === 0 ? "oklch(0.095 0.018 220)" : "oklch(0.105 0.018 220)" }}
                    >
                      {/* Volunteer */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ background: "oklch(0.48 0.16 195 / 0.2)" }}>
                            {v.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={v.avatar_url} alt={initials} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-teal-300 font-bold text-xs">{initials}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-semibold text-sm truncate">{v.full_name || "Volunteer"}</p>
                            <p className="text-white/35 text-xs truncate">{v.email || "—"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Skills */}
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(v.skills || []).slice(0, 2).map((s: string) => (
                            <span key={s} className="px-1.5 py-0.5 rounded text-xs text-white/40 border border-white/10 capitalize">{s}</span>
                          ))}
                          {(v.skills || []).length > 2 && (
                            <span className="px-1.5 py-0.5 rounded text-xs text-white/25 border border-white/8">
                              +{(v.skills || []).length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Request */}
                      <td className="px-4 py-4 max-w-[160px]">
                        {op ? (
                          <span className="flex items-center gap-1 text-white/60 text-xs">
                            <span>{cat?.icon}</span>
                            <span className="truncate">{op.title}</span>
                          </span>
                        ) : (
                          <span className="text-white/30 text-xs">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ color: st.color, background: st.bg }}>
                          {st.label}
                        </span>
                      </td>

                      {/* Hours */}
                      <td className="px-4 py-4 text-white/60 text-sm font-semibold">{a.hours_contributed}h</td>

                      {/* Joined */}
                      <td className="px-4 py-4 text-white/35 text-xs whitespace-nowrap">
                        {new Date(a.accepted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => setContactTarget(a)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-300 border border-teal-500/30 hover:bg-teal-500/10 transition-all whitespace-nowrap"
                        >
                          Contact
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {contactTarget && (
        <ContactModal volunteer={contactTarget} onClose={() => setContactTarget(null)} />
      )}

      <span className="hidden">{ngoId_}</span>
    </div>
  );
}
