import { z } from "zod";

// Enum conforme schema.prisma
export const NotificationTypeEnum = z.enum([
  "FRIEND_REQUEST_RECEIVED",
  "FRIEND_REQUEST_ACCEPTED",
  "FRIEND_REQUEST_REJECTED",
  "FRIEND_INVITE_USED",
]);

/**
 * Schema para filtros de listagem de notificações
 */
export const NotificationFiltersSchema = z.object({
  read: z.boolean().optional(),
  type: NotificationTypeEnum.optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(20),
});

/**
 * Schema para marcar notificação como lida
 */
export const MarkAsReadSchema = z.object({
  notificationId: z.string().cuid("ID de notificação inválido"),
});

/**
 * Schema para deletar notificação
 */
export const DeleteNotificationSchema = z.object({
  notificationId: z.string().cuid("ID de notificação inválido"),
});

/**
 * Schema para criar notificação (uso interno do serviço)
 */
export const CreateNotificationSchema = z.object({
  userId: z.string().cuid(),
  type: NotificationTypeEnum,
  title: z.string().min(1, "Título é obrigatório"),
  message: z.string().min(1, "Mensagem é obrigatória"),
  relatedId: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Type exports
export type NotificationFiltersInput = z.infer<typeof NotificationFiltersSchema>;
export type MarkAsReadInput = z.infer<typeof MarkAsReadSchema>;
export type DeleteNotificationInput = z.infer<typeof DeleteNotificationSchema>;
export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>;
export type NotificationType = z.infer<typeof NotificationTypeEnum>;
