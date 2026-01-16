"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRealtime } from "@/hooks/useRealtime";
import type { RealtimeEventType } from "@/types/realtime";

interface RealtimeRefreshBridgeProps {
  events: (RealtimeEventType | "*")[];
  refreshOnFallback?: boolean;
}

export function RealtimeRefreshBridge({ events, refreshOnFallback = true }: RealtimeRefreshBridgeProps) {
  const router = useRouter();
  const { subscribe } = useRealtime();
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const refresh = () => {
      if (cooldownRef.current) return;
      cooldownRef.current = setTimeout(() => {
        router.refresh();
        cooldownRef.current = null;
      }, 200);
    };

    const unsubscribe = subscribe({
      events,
      handler: refresh,
      onFallback: refreshOnFallback ? refresh : undefined,
    });

    return () => {
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
      unsubscribe();
    };
  }, [events, refreshOnFallback, router, subscribe]);

  return null;
}
