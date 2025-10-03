import nodemailer from "nodemailer";
import { logger } from "./logger";

// Types para garantir que o TypeScript entenda process
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EMAIL_USER?: string;
      EMAIL_PASSWORD?: string;
      NEXTAUTH_URL?: string;
    }
  }
}

// Verificar se está em ambiente de desenvolvimento
const isDevelopment = process.env.NODE_ENV === "development";

// Verificar se as variáveis de ambiente estão configuradas
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  if (isDevelopment) {
    logger.api.warn("EMAIL_USER or EMAIL_PASSWORD not configured in .env - usando modo desenvolvimento");
  } else {
    logger.api.error("EMAIL_USER or EMAIL_PASSWORD not configured in .env");
  }
}

// Configuração do transporter de email
const createTransporter = () => {
  // Se não tiver configuração em desenvolvimento, simular envio
  if (isDevelopment && (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD)) {
    // Retorna um mock transporter para desenvolvimento
    return {
      verify: async () => {
        logger.api.info("Mock email transporter - verificação simulada");
        return true;
      },
      sendMail: async (mailOptions: any) => {
        logger.api.info("Mock email enviado em desenvolvimento", {
          to: mailOptions.to,
          subject: mailOptions.subject
        });
        return {
          messageId: `mock-${Date.now()}@development.local`,
          response: "250 Mock email sent successfully"
        };
      }
    };
  }

  // Configuração real do Gmail
  return nodemailer.createTransport({
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
};

const transporter = createTransporter();

// Função para verificar se o transporter está configurado
export async function verifyEmailConfig() {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      if (isDevelopment) {
        logger.api.warn("Configurações de email não encontradas - usando modo mock para desenvolvimento");
        return true; // Em desenvolvimento, permite continuar
      } else {
        throw new Error("Configurações de email não encontradas");
      }
    }

    // Se for o mock transporter, simular verificação
    if (typeof transporter.verify !== 'function') {
      logger.api.info("Mock email transporter verificado com sucesso");
      return true;
    }

    await transporter.verify();
    logger.api.info("Email configuration verified successfully");
    return true;
  } catch (error) {
    if (isDevelopment) {
      logger.api.warn("Email configuration error - usando modo mock", { error });
      return true; // Em desenvolvimento, não quebra a aplicação
    } else {
      logger.api.error("Email configuration error", { error });
      return false;
    }
  }
}

// Função para enviar email de verificação
export async function sendVerificationEmail(email: string, token: string) {
  try {
    // Verificar configuração antes de enviar
    const isConfigValid = await verifyEmailConfig();
    if (!isConfigValid && !isDevelopment) {
      throw new Error("Configuração de email inválida");
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@barbershop.local",
      to: email,
      subject: "Verifique seu email - Barbershop",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #8B5CF6; text-align: center; margin-bottom: 20px;">✂️ Barbershop</h2>
            <p style="color: #333; font-size: 16px;">Olá! Obrigado por se cadastrar em nossa barbearia.</p>
            <p style="color: #666;">Para ativar sua conta e começar a agendar seus cortes, clique no botão abaixo:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #8B5CF6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                ✅ Verificar Email
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Se o botão não funcionar, copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; color: #007bff; font-size: 12px; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
            <p style="color: #999; font-size: 12px;">Este link expira em 24 horas.</p>
            <p style="color: #999; font-size: 12px;">Se você não criou uma conta, ignore este email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              ✂️ Barbershop - Seu estilo, nossa paixão!
            </p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    
    if (isDevelopment && typeof transporter.verify !== 'function') {
      logger.api.info("Email de verificação simulado enviado com sucesso", { 
        email, 
        messageId: result.messageId,
        mode: "development-mock" 
      });
    } else {
      logger.api.info("Verification email sent successfully", { 
        email, 
        messageId: result.messageId 
      });
    }
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    logger.api.error("Error sending verification email", { email, error });
    
    // Em desenvolvimento, não quebra a aplicação
    if (isDevelopment) {
      logger.api.warn("Continuando em modo desenvolvimento apesar do erro de email");
      return {
        success: true,
        messageId: `dev-fallback-${Date.now()}`,
        note: "Email simulado em desenvolvimento"
      };
    }
    
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
    logger.api.info("Reset password email sent successfully", { email, messageId: result.messageId });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    logger.api.error("Error sending reset password email", { email, error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
