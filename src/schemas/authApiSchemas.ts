import { z } from "zod";

const normalizedEmailSchema = z
  .string()
  .trim()
  .min(1, "Email é obrigatório")
  .max(254, "Email inválido")
  .email("Email inválido")
  .transform((value) => value.toLowerCase());

const strongPasswordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres")
  .max(128, "A senha deve ter no máximo 128 caracteres")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula (A-Z)")
  .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula (a-z)")
  .regex(/\d/, "A senha deve conter pelo menos um número (0-9)")
  .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, "A senha deve conter pelo menos um caractere especial");

export const RegisterBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(80, "Nome deve ter no máximo 80 caracteres"),
  email: normalizedEmailSchema,
  password: strongPasswordSchema,
});

export const ForgotPasswordBodySchema = z.object({
  email: normalizedEmailSchema,
});

export const ResetPasswordBodySchema = z.object({
  email: normalizedEmailSchema,
  token: z.string().trim().min(10, "Token inválido").max(512, "Token inválido"),
  newPassword: strongPasswordSchema,
});

export const VerifyEmailQuerySchema = z.object({
  token: z.string().trim().min(10, "Token inválido").max(512, "Token inválido"),
});

export const ResendVerificationBodySchema = z.object({
  email: normalizedEmailSchema,
});

export const UserInfoQuerySchema = z.object({
  email: normalizedEmailSchema,
});

export type RegisterBodyInput = z.infer<typeof RegisterBodySchema>;
export type ForgotPasswordBodyInput = z.infer<typeof ForgotPasswordBodySchema>;
export type ResetPasswordBodyInput = z.infer<typeof ResetPasswordBodySchema>;
export type VerifyEmailQueryInput = z.infer<typeof VerifyEmailQuerySchema>;
export type ResendVerificationBodyInput = z.infer<typeof ResendVerificationBodySchema>;
export type UserInfoQueryInput = z.infer<typeof UserInfoQuerySchema>;
