import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { UserInfoQuerySchema } from "@/schemas/authApiSchemas";
import { checkRateLimit, createRateLimitErrorResponse } from "@/lib/security/rate-limit";

const USER_INFO_RATE_LIMIT = {
  scope: "auth:user-info",
  max: 10,
  windowMs: 10 * 60 * 1000,
  blockDurationMs: 15 * 60 * 1000,
} as const;

export async function GET(request: NextRequest) {
  const rateLimit = checkRateLimit(request, USER_INFO_RATE_LIMIT);
  if (!rateLimit.allowed) {
    return createRateLimitErrorResponse(USER_INFO_RATE_LIMIT, rateLimit, "Muitas tentativas.");
  }

  try {
    const { searchParams } = new URL(request.url);
    const parsedQuery = UserInfoQuerySchema.safeParse({
      email: searchParams.get("email"),
    });

    if (!parsedQuery.success) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
    }

    const { email } = parsedQuery.data;

    // Buscar usuário com suas contas OAuth
    const user = await db.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
      include: {
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    });

    // Determinar se o usuário tem senha
    const hasPassword = !!user?.password;

    // Obter provedores OAuth
    const oauthProviders = Array.from(new Set((user?.accounts || []).map((account) => account.provider)));

    return NextResponse.json({
      hasPassword,
      oauthProviders,
      email,
    });
  } catch (error) {
    logger.api.error("Error fetching user information", {
      reason: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
