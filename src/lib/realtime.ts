import { EventEmitter } from "events";
import type { Session } from "next-auth";
import type { RealtimeEvent, RealtimeTarget } from "@/types/realtime";
import type { UserRole } from "@prisma/client";

const emitter = new EventEmitter();
emitter.setMaxListeners(100);

const generateId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
};

export function emitRealtimeEvent(event: Omit<RealtimeEvent, "eventId" | "createdAt">): RealtimeEvent {
  const enrichedEvent: RealtimeEvent = {
    ...event,
    eventId: generateId(),
    createdAt: Date.now(),
  };

  emitter.emit("message", enrichedEvent);
  return enrichedEvent;
}

export function subscribeToRealtime(listener: (event: RealtimeEvent) => void) {
  emitter.on("message", listener);
  return () => {
    emitter.off("message", listener);
  };
}

export function eventMatchesSession(event: RealtimeEvent, session: Session) {
  const target = event.target as RealtimeTarget;
  const sessionUserId = session.user?.id;
  const sessionRole = session.user?.role as UserRole | undefined;

  if (target.broadcast) return true;

  const matchesUser = target.users?.length
    ? target.users.includes(sessionUserId)
    : false;

  const matchesRole = target.roles?.length
    ? !!sessionRole && target.roles.includes(sessionRole)
    : false;

  return matchesUser || matchesRole;
}

export function buildLiveStatusEvent(
  status: "connected" | "reconnecting" | "fallback",
  target: RealtimeTarget
): RealtimeEvent<"live:status"> {
  return {
    type: "live:status",
    payload: { status },
    target,
    eventId: generateId(),
    createdAt: Date.now(),
  };
}
