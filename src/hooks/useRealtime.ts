"use client";

import { useContext, useEffect } from "react";
import { RealtimeContext } from "@/providers/RealtimeProvider";
import type { RealtimeEventType } from "@/types/realtime";
import type { RealtimeEvent } from "@/types/realtime";

export function useRealtime() {
  return useContext(RealtimeContext);
}

type SubscriptionOptions = {
  events: RealtimeEventType | RealtimeEventType[] | "*";
  handler: (event: RealtimeEvent) => void;
  onFallback?: () => void | Promise<void>;
};

export function useRealtimeSubscription({ events, handler, onFallback }: SubscriptionOptions) {
  const { subscribe } = useRealtime();

  useEffect(() => subscribe({ events, handler, onFallback }), [events, handler, onFallback, subscribe]);
}
