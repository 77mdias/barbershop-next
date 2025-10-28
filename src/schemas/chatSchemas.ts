import { z } from "zod";

/**
 * Schema para enviar mensagem
 */
export const SendMessageSchema = z.object({
  conversationId: z.string().min(1, "ID da conversa é obrigatório"),
  content: z
    .string()
    .min(1, "Mensagem não pode estar vazia")
    .max(5000, "Mensagem muito longa (máximo 5000 caracteres)"),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;

/**
 * Schema para buscar mensagens
 */
export const GetMessagesSchema = z.object({
  conversationId: z.string().min(1),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
});

export type GetMessagesInput = z.infer<typeof GetMessagesSchema>;

/**
 * Schema para criar/buscar conversa
 */
export const CreateConversationSchema = z.object({
  friendId: z.string().min(1, "ID do amigo é obrigatório"),
});

export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;

/**
 * Schema para marcar mensagens como lidas
 */
export const MarkAsReadSchema = z.object({
  conversationId: z.string().min(1, "ID da conversa é obrigatório"),
});

export type MarkAsReadInput = z.infer<typeof MarkAsReadSchema>;

/**
 * Schema para filtros de conversas
 */
export const ConversationFiltersSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(20),
  unreadOnly: z.boolean().optional(),
});

export type ConversationFiltersInput = z.infer<typeof ConversationFiltersSchema>;
