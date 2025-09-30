import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { sendResetPasswordEmail, generateResetToken } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Iniciando processo de reset de senha");

    const { email } = await request.json();
    console.log("📧 Email recebido:", email);

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    console.log("🔗 Testando conexão com o banco...");

    // Teste de conexão simples primeiro
    try {
      await db.$connect();
      console.log("✅ Conexão com banco estabelecida");
    } catch (connectError) {
      console.error("❌ Erro na conexão:", connectError);
      throw connectError;
    }

    // Verificar se o usuário existe
    console.log("👤 Buscando usuário no banco...");
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Por segurança, não revelar se o email existe ou não
      return NextResponse.json(
        {
          message:
            "Se o email existir, você receberá um link para redefinir sua senha",
        },
        { status: 200 }
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
      console.error("Erro ao enviar email de reset:", emailResult.error);
      return NextResponse.json(
        { error: "Erro ao enviar email de redefinição" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Se o email existir, você receberá um link para redefinir sua senha",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao processar solicitação de reset de senha:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
