"use client";

import { useEffect, useState } from "react";
import { CATEGORY_META, URGENCY_META } from "@/lib/types";
import type { Opportunity, AssignmentWithVolunteer } from "@/lib/types";

interface RequestWithVolunteers extends Opportunity {
  volunteer_count?: number;
}

interface Props { ngoId: string }

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    open:      { label: "Open",      color: "#34d399", bg: "rgba(52,211,153,0.12)" },
    closed:    { label: "Closed",    color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
    completed: { label: "Completed", color: "#818cf8", bg: "rgba(129,140,248,0.12)" },
    cancelled: { label: "Cancelled", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  };
  const s = map[status] || map.open;
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ color: s.color, background: s.bg }}>
      {s.label}
    </span>
  );
}

function VolunteerModal({
  request,
  volunteers,
  onClose,
}: {
  request: RequestWithVolunteers;
  volunteers: AssignmentWithVolunteer[];
  onClose: () => void;
}) {
  const [contactVolunteer, setContactVolunteer] = useState<AssignmentWithVolunteer | null>(null);
  const [message, setMessage] = useState("");
  const [msgSent, setMsgSent] = useState(false);

  const handleSend = () => {
    // Basic contact simulation
    setMsgSent(true);
    setTimeout(() => { setMsgSent(false); setContactVolunteer(null); setMessage(""); }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-xl max-h-[80vh] flex flex-col rounded-3xl border border-white/10 overflow-hidden"
        style={{ background: "oklch(0.10 0.018 220)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div>
            <h3 className="text-white font-black text-base" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Volunteers — {request.title}
            </h3>
            <p className="text-white/40 text-xs">{volunteers.length} accepted</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>

        {/* Contact form */}
        {contactVolunteer && (
          <div className="px-6 py-4 border-b border-white/8" style={{ background: "oklch(0.13 0.02 220)" }}>
            <p className="text-white/70 text-sm font-semibold mb-2">
              📬 Message to {contactVolunteer.volunteer.full_name || "volunteer"}
            </p>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-3 py-2 rounded-xl text-white text-sm placeholder-white/30 border border-white/10 focus:outline-none focus:border-teal-500/60 resize-none"
              style={{ background: "oklch(0.10 0.018 220)" }}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => { setContactVolunteer(null); setMessage(""); }}
                className="px-4 py-1.5 rounded-lg text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-40 transition-all"
                style={{ background: "linear-gradient(135deg, oklch(0.48 0.16 195), oklch(0.40 0.14 205))" }}
              >
                {msgSent ? "✓ Sent!" : "Send Message"}
              </button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {volunteers.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm">No volunteers yet</div>
          ) : (
            volunteers.map((a) => {
              const v = a.volunteer;
              const initials = (v.full_name || "V").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
              const statusColors: Record<string, string> = {
                accepted: "#34d399", ongoing: "#f59e0b", completed: "#818cf8", cancelled: "#f87171",
              };
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-white/8 hover:border-white/15 transition-all"
                  style={{ background: "oklch(0.13 0.02 220)" }}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ background: "oklch(0.48 0.16 195 / 0.2)" }}>
                    {v.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.avatar_url} alt={initials} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-teal-300 font-bold text-sm">{initials}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-semibold truncate">{v.full_name || "Volunteer"}</p>
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusColors[a.status] || "#94a3b8" }} />
                      <span className="text-white/40 text-xs capitalize">{a.status}</span>
                    </div>
                    <p className="text-white/40 text-xs truncate">{v.email || "—"}</p>
                    {v.skills && v.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {v.skills.slice(0, 3).map((s: string) => (
                          <span key={s} className="px-1.5 py-0.5 rounded text-xs text-white/40 border border-white/10 capitalize">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-white/60 text-xs">{a.hours_contributed}h</p>
                    <button
                      onClick={() => setContactVolunteer(a)}
                      className="mt-1 px-2.5 py-1 rounded-lg text-xs font-medium text-teal-300 border border-teal-500/30 hover:bg-teal-500/10 transition-all"
                    >
                      Contact
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyRequestsView({ ngoId }: Props) {
  const [requests, setRequests] = useState<RequestWithVolunteers[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RequestWithVolunteers | null>(null);
  const [volunteers, setVolunteers] = useState<AssignmentWithVolunteer[]>([]);
  const [volLoading, setVolLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetch("/api/ngo/requests")
      .then((r) => r.json())
      .then((data) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openDetail = async (req: RequestWithVolunteers) => {
    setSelectedRequest(req);
    setVolLoading(true);
    try {
      const res = await fetch(`/api/ngo/requests/${req.id}/volunteers`);
      const data = await res.json();
      setVolunteers(Array.isArray(data) ? data : []);
    } catch {
      setVolunteers([]);
    } finally {
      setVolLoading(false);
    }
  };

  const filtered = filterStatus === "all" ? requests : requests.filter((r) => r.status === filterStatus);
  const ngoId_ = ngoId; // suppress unused warning

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>My Requests</h2>
          <p className="text-white/45 text-sm">{requests.length} total requests posted</p>
        </div>
        {/* Status filter */}
        <div className="flex gap-2">
          {["all", "open", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all border ${
                filterStatus === s ? "text-teal-300 border-teal-500/40" : "text-white/40 border-white/10 hover:border-white/20 hover:text-white/60"
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
          <div className="text-6xl mb-4">📋</div>
          <p className="text-white/50 text-lg font-semibold">No requests found</p>
          <p className="text-white/30 text-sm mt-1">Post your first volunteer request to get started</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden border border-white/8">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "oklch(0.12 0.02 220)" }}>
                  {["Request", "Category", "Location", "Urgency", "Volunteers", "Status", "Date", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-white/40 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((req, i) => {
                  const cat = CATEGORY_META[req.category] || CATEGORY_META.other;
                  const urg = URGENCY_META[req.urgency] || URGENCY_META.medium;
                  const fillPct = req.volunteers_needed > 0
                    ? Math.min(100, Math.round((req.volunteers_accepted / req.volunteers_needed) * 100))
                    : 0;

                  return (
                    <tr
                      key={req.id}
                      className="border-t border-white/5 hover:bg-white/3 transition-colors"
                      style={{ background: i % 2 === 0 ? "oklch(0.095 0.018 220)" : "oklch(0.105 0.018 220)" }}
                    >
                      {/* Title */}
                      <td className="px-4 py-4 max-w-[180px]">
                        <p className="text-white font-semibold text-sm truncate">{req.title}</p>
                        <p className="text-white/35 text-xs mt-0.5 truncate">{req.description.slice(0, 50)}...</p>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-white/60 text-xs">
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </span>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-4 text-white/50 text-xs max-w-[120px] truncate">{req.city || req.location || "—"}</td>

                      {/* Urgency */}
                      <td className="px-4 py-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ color: urg.color, background: urg.bg }}>
                          {urg.label}
                        </span>
                      </td>

                      {/* Volunteers */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold text-sm">{req.volunteers_accepted}</span>
                          <span className="text-white/30 text-xs">/ {req.volunteers_needed}</span>
                        </div>
                        <div className="w-16 h-1.5 rounded-full mt-1" style={{ background: "oklch(0.20 0.02 220)" }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${fillPct}%`,
                              background: fillPct >= 100 ? "#34d399" : fillPct >= 50 ? "#f59e0b" : "oklch(0.48 0.16 195)",
                            }}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4"><StatusBadge status={req.status} /></td>

                      {/* Date */}
                      <td className="px-4 py-4 text-white/40 text-xs whitespace-nowrap">
                        {req.date_start ? new Date(req.date_start).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => openDetail(req)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-300 border border-teal-500/30 hover:bg-teal-500/10 transition-all whitespace-nowrap"
                        >
                          {volLoading && selectedRequest?.id === req.id ? "..." : `View Volunteers`}
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

      {/* Volunteer detail modal */}
      {selectedRequest && (
        <VolunteerModal
          request={selectedRequest}
          volunteers={volunteers}
          onClose={() => { setSelectedRequest(null); setVolunteers([]); }}
        />
      )}

      {/* suppress ngoId_ warning */}
      <span className="hidden">{ngoId_}</span>
    </div>
  );
}
