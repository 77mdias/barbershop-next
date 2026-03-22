import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { canAccessDebugEndpoints } from "@/lib/security/debug-access";

/**
 * Debug endpoint para investigar problemas de autenticação em produção
 * ATENÇÃO: Remover após debug - não usar em produção final
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!canAccessDebugEndpoints(req.headers)) {
    return res.status(404).json({ error: "Not found" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      hasSecret: !!process.env.NEXTAUTH_SECRET,
      session: {
        exists: !!session,
        user: session?.user
          ? {
              id: session.user.id,
              role: session.user.role,
            }
          : null,
      },
      cookies: {
        sessionToken: !!req.cookies["next-auth.session-token"],
        callbackUrl: !!req.cookies["next-auth.callback-url"],
        csrfToken: !!req.cookies["next-auth.csrf-token"],
      },
      headers: {
        userAgent: req.headers["user-agent"],
        referer: req.headers.referer,
        host: req.headers.host,
        origin: req.headers.origin,
      },
    };

    logger.auth.info("Auth debug endpoint called", debugInfo);

    return res.status(200).json({
      success: true,
      debug: debugInfo,
      message: "Debug info logged successfully",
    });
  } catch (error) {
    logger.auth.error("Error in auth debug endpoint", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
