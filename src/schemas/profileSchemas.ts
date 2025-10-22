import { z } from "zod";

// Schema para atualização do perfil do usuário
export const ProfileSettingsSchema = z.object({
  name: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome muito longo"),
  nickname: z.string()
    .max(30, "Apelido muito longo")
    .optional(),
  phone: z.string()
    .regex(/^(\+55\s?)?(\(\d{2}\)\s?|\d{2}\s?)?\d{4,5}-?\d{4}$/, "Formato de telefone inválido")
    .optional()
    .or(z.literal("")),
  email: z.string()
    .email("Email inválido")
    .max(255, "Email muito longo"),
});

export type ProfileSettingsInput = z.infer<typeof ProfileSettingsSchema>;

// Schema para atualização da imagem de perfil
export const ProfileImageSchema = z.object({
  image: z.string().url("URL da imagem inválida"),
});

export type ProfileImageInput = z.infer<typeof ProfileImageSchema>;

// Schema para alteração de senha
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string()
    .min(6, "Nova senha deve ter pelo menos 6 caracteres")
    .max(128, "Nova senha muito longa"),
  confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

// Schema para configurações de notificação
export const NotificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  appointmentReminders: z.boolean().default(true),
  promotionAlerts: z.boolean().default(true),
});

export type NotificationSettingsInput = z.infer<typeof NotificationSettingsSchema>;