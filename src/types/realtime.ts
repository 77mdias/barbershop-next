import type { UserRole } from "@prisma/client";

export type RealtimeEventType =
  | "notification:new"
  | "notification:read"
  | "notification:refresh"
  | "appointment:changed"
  | "review:updated"
  | "analytics:updated"
  | "live:status"
  | "live:heartbeat";

export type RealtimeTarget = {
  users?: string[];
  roles?: UserRole[];
  broadcast?: boolean;
};

export type RealtimePayloadMap = {
  "notification:new": {
    notification: {
      id: string;
      type: string;
      title: string;
      message: string;
      read: boolean;
      relatedId?: string | null;
      metadata?: Record<string, any> | null;
      createdAt: string;
    };
    unreadCount?: number;
  };
  "notification:read": {
    notificationId?: string;
    unreadCount: number;
  };
  "notification:refresh": {
    reason?: string;
  };
  "appointment:changed": {
    appointmentId: string;
    status: string;
    date?: string;
    barberId?: string | null;
    userId?: string;
  };
  "review:updated": {
    reviewId: string;
    rating?: number | null;
    barberId?: string | null;
    userId?: string;
    serviceHistoryId?: string;
  };
  "analytics:updated": {
    scope: "revenue" | "appointments" | "reviews";
    reason?: string;
  };
  "live:status": {
    status: "connected" | "reconnecting" | "fallback";
  };
  "live:heartbeat": {
    ts: number;
  };
};

export type RealtimeEvent<T extends RealtimeEventType = RealtimeEventType> = {
  type: T;
  payload: RealtimePayloadMap[T];
  target: RealtimeTarget;
  eventId: string;
  createdAt: number;
};
