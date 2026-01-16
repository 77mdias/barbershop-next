import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildLiveStatusEvent, eventMatchesSession, subscribeToRealtime } from "@/lib/realtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  let keepAlive: NodeJS.Timeout | null = null;
  let unsubscribe: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (raw: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(raw)}\n\n`));
      };

      // Estado inicial
      send(buildLiveStatusEvent("connected", { users: [session.user.id] }));

      const listener = (event: any) => {
        if (!eventMatchesSession(event, session)) return;
        send(event);
      };

      unsubscribe = subscribeToRealtime(listener);

      keepAlive = setInterval(() => {
        send({
          type: "live:heartbeat",
          payload: { ts: Date.now() },
          target: { users: [session.user.id] },
          eventId: `heartbeat-${Date.now()}`,
          createdAt: Date.now(),
        });
      }, 15000);

      const abortHandler = () => {
        unsubscribe?.();
        if (keepAlive) clearInterval(keepAlive);
        try {
          controller.close();
        } catch {
          // stream already closed
        }
      };

      req.signal.addEventListener("abort", abortHandler);
    },
    cancel() {
      if (keepAlive) clearInterval(keepAlive);
      unsubscribe?.();
    },
  });

  return new Response(stream, { headers });
}
