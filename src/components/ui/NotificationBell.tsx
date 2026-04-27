"use client";

import { useState, useCallback, useEffect } from "react";
import { useRealtime } from "@/lib/useRealtime";

export interface AppNotification {
  id: string;
  type: "acceptance" | "new_request" | "completed" | "system";
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

interface Props {
  userId: string;
  role: "volunteer" | "ngo";
  onNavigate?: (view: string) => void;
  accentColor?: "emerald" | "teal";
}

export default function NotificationBell({ userId, role, onNavigate, accentColor = "emerald" }: Props) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = useCallback((n: Omit<AppNotification, "id" | "timestamp" | "read">) => {
    setNotifications((prev) => [
      { ...n, id: crypto.randomUUID(), timestamp: new Date(), read: false },
      ...prev.slice(0, 19), // cap at 20
    ]);
  }, []);

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const dismiss = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  // ── Realtime: new volunteer acceptance (NGO sees these) ──
  useRealtime(
    role === "ngo"
      ? [{ table: "volunteer_assignments", event: "INSERT" }]
      : [],
    useCallback((payload) => {
      addNotification({
        type: "acceptance",
        title: "New Volunteer Joined!",
        body: "A volunteer accepted one of your requests.",
        actionLabel: "View Volunteers",
        onAction: () => onNavigate?.("volunteers"),
      });
      void payload;
    }, [addNotification, onNavigate]),
    role === "ngo"
  );

  // ── Realtime: new opportunity posted (volunteers see these) ──
  useRealtime(
    role === "volunteer"
      ? [{ table: "opportunities", event: "INSERT" }]
      : [],
    useCallback((payload) => {
      const newOpp = payload.new as { title?: string; category?: string };
      addNotification({
        type: "new_request",
        title: "New Opportunity Posted",
        body: newOpp.title
          ? `"${newOpp.title}" is now available${newOpp.category ? ` (${newOpp.category})` : ""}.`
          : "A new volunteer opportunity is available.",
        actionLabel: "Browse Opportunities",
        onAction: () => onNavigate?.("opportunities"),
      });
    }, [addNotification, onNavigate]),
    role === "volunteer"
  );

  // ── Realtime: assignment status updated (volunteer sees their own) ──
  useRealtime(
    role === "volunteer"
      ? [{ table: "volunteer_assignments", event: "UPDATE", filter: `volunteer_id=eq.${userId}` }]
      : [],
    useCallback((payload) => {
      const updated = payload.new as { status?: string };
      if (updated.status === "completed") {
        addNotification({
          type: "completed",
          title: "Assignment Completed 🎉",
          body: "An NGO marked your contribution as completed. Great work!",
          actionLabel: "View History",
          onAction: () => onNavigate?.("history"),
        });
      }
    }, [addNotification, onNavigate]),
    role === "volunteer"
  );

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const el = document.getElementById("notification-panel");
      const btn = document.getElementById("notification-bell-btn");
      if (el && !el.contains(e.target as Node) && btn && !btn.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const unread = notifications.filter((n) => !n.read).length;
  const accent = accentColor === "teal" ? {
    ring: "ring-teal-500/40",
    badge: "bg-teal-500",
    dot: "bg-teal-400",
    icon: "text-teal-300",
    actionBtn: "text-teal-400 hover:text-teal-300",
  } : {
    ring: "ring-emerald-500/40",
    badge: "bg-emerald-500",
    dot: "bg-emerald-400",
    icon: "text-emerald-300",
    actionBtn: "text-emerald-400 hover:text-emerald-300",
  };

  const typeIcon: Record<AppNotification["type"], string> = {
    acceptance:   "👋",
    new_request:  "🔔",
    completed:    "✅",
    system:       "ℹ️",
  };

  return (
    <div className="relative" id="notification-bell-wrapper">
      {/* Bell button */}
      <button
        id="notification-bell-btn"
        onClick={() => { setOpen((o) => !o); if (!open && unread > 0) markAllRead(); }}
        className={`relative p-2 rounded-xl transition-all duration-200 hover:bg-white/10 ${open ? "ring-2 " + accent.ring : ""}`}
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
      >
        <svg className={`w-5 h-5 ${unread > 0 ? accent.icon : "text-white/50"} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 w-4 h-4 ${accent.badge} rounded-full flex items-center justify-center text-[10px] font-black text-white shadow`}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          id="notification-panel"
          className="absolute right-0 top-12 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden"
          style={{ background: "oklch(0.085 0.018 220)", border: "1px solid oklch(1 0 0 / 0.1)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
            <span className="text-white font-bold text-sm">Notifications</span>
            {notifications.length > 0 && (
              <button
                onClick={markAllRead}
                className={`text-xs font-medium ${accent.actionBtn} transition-colors`}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-white/30">
                <svg className="w-10 h-10 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs mt-1">No new notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-3 px-4 py-3 border-b border-white/5 transition-colors hover:bg-white/5 ${!n.read ? "bg-white/3" : ""}`}
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">{typeIcon[n.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-white text-xs font-semibold leading-tight">{n.title}</p>
                      <button onClick={() => dismiss(n.id)} className="text-white/20 hover:text-white/60 text-xs flex-shrink-0 transition-colors" aria-label="Dismiss">×</button>
                    </div>
                    <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{n.body}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-white/25 text-[10px]">
                        {n.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {n.actionLabel && n.onAction && (
                        <button
                          onClick={() => { n.onAction?.(); setOpen(false); }}
                          className={`text-[10px] font-semibold ${accent.actionBtn} transition-colors`}
                        >
                          {n.actionLabel} →
                        </button>
                      )}
                    </div>
                  </div>
                  {!n.read && <div className={`w-1.5 h-1.5 rounded-full ${accent.dot} flex-shrink-0 mt-1.5`} />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
