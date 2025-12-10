import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { sendResetPasswordEmail, generateResetToken } from "@/lib/email";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    logger.api.info("Starting password reset process");

    const { email } = await request.json();
    logger.api.info("Password reset requested", { email });

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
    }

    logger.api.debug("Testing database connection");

    // Teste de conexão simples primeiro
    try {
      await db.$connect();
      logger.api.debug("Database connection established");
    } catch (connectError) {
      logger.api.error("Database connection error", { error: connectError });
      throw connectError;
    }

    // Verificar se o usuário existe
    logger.api.debug("Searching for user in database", { email });
    const user = await db.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
    });

    if (!user) {
      // Por segurança, não revelar se o email existe ou não
      return NextResponse.json(
        {
          message: "Se o email existir, você receberá um link para redefinir sua senha",
        },
        { status: 200 },
      );
    }

    // Gerar token único
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Salvar token no banco
    await db.user.update({
      where: { email: email.toLowerCase() },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry,
      },
    });

    // Enviar email de reset
    const emailResult = await sendResetPasswordEmail(email, resetToken);

    if (!emailResult.success) {
      logger.api.error("Error sending reset email", { email, error: emailResult.error });
      return NextResponse.json({ error: "Erro ao enviar email de redefinição" }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: "Se o email existir, você receberá um link para redefinir sua senha",
      },
      { status: 200 },
    );
  } catch (error) {
    logger.api.error("Error processing password reset request", { error });
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
