import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  ResendVerificationBodySchema,
  VerifyEmailQuerySchema,
} from "@/schemas/authApiSchemas";
import { checkRateLimit, createRateLimitErrorResponse } from "@/lib/security/rate-limit";

const VERIFY_EMAIL_RATE_LIMIT = {
  scope: "auth:verify-email",
  max: 20,
  windowMs: 10 * 60 * 1000,
  blockDurationMs: 5 * 60 * 1000,
} as const;

const RESEND_VERIFICATION_RATE_LIMIT = {
  scope: "auth:resend-verification",
  max: 5,
  windowMs: 10 * 60 * 1000,
  blockDurationMs: 15 * 60 * 1000,
} as const;

export async function GET(request: NextRequest) {
  const rateLimit = checkRateLimit(request, VERIFY_EMAIL_RATE_LIMIT);
  if (!rateLimit.allowed) {
    return createRateLimitErrorResponse(VERIFY_EMAIL_RATE_LIMIT, rateLimit, "Muitas tentativas de verificação.");
  }

  try {
    const { searchParams } = new URL(request.url);
    const parsedQuery = VerifyEmailQuerySchema.safeParse({
      token: searchParams.get("token"),
    });

    if (!parsedQuery.success) {
      return NextResponse.json({ message: "Token inválido ou expirado" }, { status: 400 });
    }

    const { token } = parsedQuery.data;

    // Buscar usuário com o token
    const user = await db.user.findFirst({
      where: {
        emailVerificationToken: token,
        deletedAt: null,
        emailVerificationExpires: {
          gt: new Date(), // Token ainda não expirou
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Token inválido ou expirado" }, { status: 400 });
    }

    // Ativar o usuário e limpar o token
    await db.user.update({
      where: { id: user.id },
      data: {
        isActive: true,
        emailVerified: new Date(),
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return NextResponse.json({
      message: "Email verificado com sucesso! Sua conta foi ativada.",
      success: true,
    });
  } catch (error) {
    logger.api.error("Error verifying email", { error });
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
}

// Rota para reenviar email de verificação
export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, RESEND_VERIFICATION_RATE_LIMIT);
  if (!rateLimit.allowed) {
    return createRateLimitErrorResponse(
      RESEND_VERIFICATION_RATE_LIMIT,
      rateLimit,
      "Muitas tentativas de reenvio de verificação.",
    );
  }

  try {
    const body = await request.json();
    const parsedBody = ResendVerificationBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json({ message: "Email inválido" }, { status: 400 });
    }

    const { email } = parsedBody.data;

    // Buscar usuário
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || user.deletedAt || user.isActive) {
      return NextResponse.json({
        message: "Se o email estiver elegível, enviaremos uma nova verificação.",
        success: true,
      });
    }

    // Gerar novo token
    const { generateVerificationToken, sendVerificationEmail } = await import("@/lib/email").catch(() => {
      throw new Error("Erro ao importar módulo de email");
    });
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Atualizar token no banco
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    // Enviar novo email
    const emailResult = await sendVerificationEmail(email, verificationToken);

    if (!emailResult.success) {
      logger.api.error("Erro ao reenviar email de verificação", { reason: emailResult.error });
    }

    return NextResponse.json({
      message: "Se o email estiver elegível, enviaremos uma nova verificação.",
      success: true,
    });
  } catch (error) {
    logger.api.error("Error resending verification email", { error });
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
}
