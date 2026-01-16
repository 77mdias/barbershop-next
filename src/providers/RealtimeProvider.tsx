"use client";

import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import type { RealtimeEvent, RealtimeEventType } from "@/types/realtime";

type Subscription = {
  id: string;
  events: Set<RealtimeEventType | "*">;
  handler: (event: RealtimeEvent) => void;
  onFallback?: () => void | Promise<void>;
};

export type RealtimeConnectionStatus = "connecting" | "connected" | "reconnecting" | "fallback";

export type RealtimeContextValue = {
  status: RealtimeConnectionStatus;
  isFallback: boolean;
  subscribe: (options: {
    events: RealtimeEventType | RealtimeEventType[] | "*";
    handler: (event: RealtimeEvent) => void;
    onFallback?: () => void | Promise<void>;
  }) => () => void;
};

const defaultContext: RealtimeContextValue = {
  status: "fallback",
  isFallback: true,
  subscribe: () => () => {},
};

export const RealtimeContext = createContext<RealtimeContextValue>(defaultContext);

const getId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const FALLBACK_INTERVAL = 30000;

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  const [status, setStatus] = useState<RealtimeConnectionStatus>("connecting");
  const [isFallback, setIsFallback] = useState(false);
  const subscriptionsRef = useRef<Map<string, Subscription>>(new Map());
  const seenEventsRef = useRef<Set<string>>(new Set());
  const eventSourceRef = useRef<EventSource | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tabIdRef = useRef(getId());

  const dispatchEvent = useCallback((event: RealtimeEvent) => {
    if (!event || !event.eventId) return;
    if (seenEventsRef.current.has(event.eventId)) return;
    seenEventsRef.current.add(event.eventId);

    subscriptionsRef.current.forEach((subscription) => {
      if (subscription.events.has(event.type) || subscription.events.has("*")) {
        subscription.handler(event);
      }
    });

    if (channelRef.current) {
      channelRef.current.postMessage({
        origin: tabIdRef.current,
        event,
      });
    }
  }, []);

  const runFallback = useCallback(() => {
    subscriptionsRef.current.forEach((subscription) => {
      if (subscription.onFallback) {
        subscription.onFallback();
      }
    });
  }, []);

  const cleanupFallbackTimer = useCallback(() => {
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (status === "fallback") {
      runFallback();
      cleanupFallbackTimer();
      fallbackIntervalRef.current = setInterval(runFallback, FALLBACK_INTERVAL);
      return () => cleanupFallbackTimer();
    }

    return () => undefined;
  }, [status, cleanupFallbackTimer, runFallback]);

  const activateFallback = useCallback(() => {
    setStatus("fallback");
    setIsFallback(true);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const setupBroadcastChannel = useCallback(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel("barbershop-realtime");
    channelRef.current = channel;
    channel.onmessage = (message) => {
      const { origin, event } = message.data || {};
      if (!event || origin === tabIdRef.current) return;
      dispatchEvent(event);
    };
  }, [dispatchEvent]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStatus === "loading") return;
    if (!session?.user?.id || sessionStatus !== "authenticated") {
      activateFallback();
      return;
    }

    if (!window.EventSource) {
      activateFallback();
      return;
    }

    setupBroadcastChannel();

    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      setStatus("connecting");

      const source = new EventSource("/api/realtime");
      eventSourceRef.current = source;

      source.onopen = () => {
        reconnectAttemptsRef.current = 0;
        setIsFallback(false);
        setStatus("connected");
      };

      source.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as RealtimeEvent;
          dispatchEvent(parsed);
        } catch (error) {
          console.error("Erro ao parsear evento SSE:", error);
        }
      };

      source.onerror = () => {
        setStatus("reconnecting");
        reconnectAttemptsRef.current += 1;
        source.close();

        if (reconnectAttemptsRef.current >= 5) {
          activateFallback();
          return;
        }

        const delay = Math.min(30000, 1000 * 2 ** reconnectAttemptsRef.current);
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (channelRef.current) {
        channelRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      cleanupFallbackTimer();
    };
  }, [activateFallback, cleanupFallbackTimer, dispatchEvent, session?.user?.id, sessionStatus, setupBroadcastChannel]);

  const subscribe = useCallback<RealtimeContextValue["subscribe"]>(
    ({ events, handler, onFallback }) => {
      const id = getId();
      const eventsSet = Array.isArray(events) ? new Set(events) : new Set([events]);

      subscriptionsRef.current.set(id, { id, events: eventsSet, handler, onFallback });

      if (status === "fallback" && onFallback) {
        onFallback();
      }

      return () => {
        subscriptionsRef.current.delete(id);
      };
    },
    [status],
  );

  const value = useMemo<RealtimeContextValue>(
    () => ({
      status,
      isFallback,
      subscribe,
    }),
    [isFallback, status, subscribe],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}
