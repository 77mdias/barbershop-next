import nodemailer from "nodemailer";

// Verificar se as variáveis de ambiente estão configuradas
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.warn("⚠️  EMAIL_USER ou EMAIL_PASSWORD não configurados no .env");
}

// Configuração do transporter de email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Use uma senha de app do Gmail
  },
  tls: {
    rejectUnauthorized: false,
  },
  // Configurações adicionais para melhor compatibilidade
  port: 587,
  secure: false, // true para 465, false para outras portas
});

// Função para verificar se o transporter está configurado
export async function verifyEmailConfig() {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error("Configurações de email não encontradas");
    }

    await transporter.verify();
    console.log("✅ Configuração de email verificada com sucesso");
    return true;
  } catch (error) {
    console.error("❌ Erro na configuração de email:", error);
    return false;
  }
}

// Função para enviar email de verificação
export async function sendVerificationEmail(email: string, token: string) {
  try {
    // Verificar configuração antes de enviar
    const isConfigValid = await verifyEmailConfig();
    if (!isConfigValid) {
      throw new Error("Configuração de email inválida");
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verifique seu email - Valorant Ascension",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #FF4655; text-align: center; margin-bottom: 20px;">🎮 Valorant Ascension</h2>
            <p style="color: #333; font-size: 16px;">Olá! Obrigado por se cadastrar em nossa plataforma.</p>
            <p style="color: #666;">Para ativar sua conta e começar sua ascensão, clique no botão abaixo:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #FF4655; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                ✅ Verificar Email
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Se o botão não funcionar, copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; color: #007bff; font-size: 12px; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
            <p style="color: #999; font-size: 12px;">Este link expira em 24 horas.</p>
            <p style="color: #999; font-size: 12px;">Se você não criou uma conta, ignore este email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              🎯 Valorant Ascension - Sua ascensão começa aqui!
            </p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email enviado com sucesso para:", email);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

// Função para gerar token de verificação
export function generateVerificationToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Date.now().toString(36)
  );
}

// Função para gerar token de reset de senha
export function generateResetToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Função para enviar email de reset de senha
export async function sendResetPasswordEmail(email: string, token: string) {
  try {
    // Verificar configuração antes de enviar
    const isConfigValid = await verifyEmailConfig();
    if (!isConfigValid) {
      throw new Error("Configuração de email inválida");
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Redefinir senha - Valorant Ascension",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #FF4655; text-align: center; margin-bottom: 20px;">🔐 Redefinir Senha</h2>
            <p style="color: #333; font-size: 16px;">Olá! Você solicitou a redefinição da sua senha.</p>
            <p style="color: #666;">Clique no botão abaixo para criar uma nova senha:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #FF4655; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                🔑 Redefinir Senha
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Se o botão não funcionar, copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; color: #007bff; font-size: 12px; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">${resetUrl}</p>
            <p style="color: #999; font-size: 12px;">Este link expira em 1 hora.</p>
            <p style="color: #999; font-size: 12px;">Se você não solicitou esta redefinição, ignore este email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              🎯 Valorant Ascension - Sua ascensão começa aqui!
            </p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email de reset enviado com sucesso para:", email);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Erro ao enviar email de reset:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
