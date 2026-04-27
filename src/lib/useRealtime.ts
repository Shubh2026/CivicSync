"use client";

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

export interface ChannelConfig {
  table: string;
  schema?: string;
  event?: RealtimeEvent;
  filter?: string;
}

export type RealtimeCallback<T = Record<string, unknown>> = (payload: {
  eventType: string;
  new: T;
  old: Partial<T>;
}) => void;

/**
 * Hook to subscribe to Supabase Realtime changes on one or more tables.
 * Automatically cleans up on unmount.
 *
 * @example
 * useRealtime([{ table: "opportunities" }], (payload) => refetch());
 */
export function useRealtime<T = Record<string, unknown>>(
  channels: ChannelConfig[],
  callback: RealtimeCallback<T>,
  enabled = true
) {
  const supabase = createClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref up to date without re-subscribing
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || channels.length === 0) return;

    const channelName = `civicsync:${channels.map((c) => c.table).join("+")}:${Date.now()}`;
    const channel = supabase.channel(channelName);

    for (const cfg of channels) {
      channel.on(
        // @ts-expect-error — Supabase types are overly strict here
        "postgres_changes",
        {
          event:  cfg.event  ?? "*",
          schema: cfg.schema ?? "public",
          table:  cfg.table,
          ...(cfg.filter ? { filter: cfg.filter } : {}),
        },
        (payload: { eventType: string; new: T; old: Partial<T> }) => {
          callbackRef.current(payload);
        }
      );
    }

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, JSON.stringify(channels)]);

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, [supabase]);

  return { unsubscribe };
}

/**
 * Convenience hook: subscribe to a single table.
 */
export function useTableRealtime<T = Record<string, unknown>>(
  table: string,
  callback: RealtimeCallback<T>,
  options: { event?: RealtimeEvent; filter?: string; enabled?: boolean } = {}
) {
  return useRealtime<T>(
    [{ table, event: options.event, filter: options.filter }],
    callback,
    options.enabled ?? true
  );
}
