import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";

/**
 * Debug endpoint para investigar problemas de autenticação em produção
 * ATENÇÃO: Remover após debug - não usar em produção final
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verificar se é ambiente de produção e aceitar apenas requests específicos
  if (
    process.env.NODE_ENV === "production" &&
    req.headers["x-debug-auth"] !== "barbershop-debug-2024"
  ) {
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
              email: session.user.email,
              role: session.user.role,
              isActive: true, // Assumindo que se tem sessão, está ativo
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
