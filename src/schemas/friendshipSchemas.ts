import { z } from "zod";

// Enums conforme schema.prisma
export const FriendshipStatusEnum = z.enum(["ACCEPTED", "BLOCKED"]);
export const FriendRequestStatusEnum = z.enum(["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"]);

/**
 * Schema para enviar solicitação de amizade
 */
export const SendFriendRequestSchema = z.object({
  receiverId: z.string().cuid("ID de usuário inválido"),
});

/**
 * Schema para responder solicitação de amizade
 */
export const RespondFriendRequestSchema = z.object({
  requestId: z.string().cuid("ID de solicitação inválido"),
  action: z.enum(["ACCEPT", "REJECT"]),
});

/**
 * Schema para filtros de listagem de amigos
 */
export const FriendshipFiltersSchema = z.object({
  search: z.string().optional(),
  status: FriendshipStatusEnum.optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(20),
});

/**
 * Schema para busca de usuários
 */
export const UserSearchSchema = z.object({
  query: z.string().min(2, "Busca deve ter no mínimo 2 caracteres"),
  excludeFriends: z.boolean().default(true),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(20),
});

/**
 * Schema para bloquear/desbloquear usuário
 */
export const BlockUserSchema = z.object({
  userId: z.string().cuid("ID de usuário inválido"),
  block: z.boolean(),
});

/**
 * Schema para gerar código de convite
 */
export const GenerateInviteCodeSchema = z.object({
  regenerate: z.boolean().default(false),
});

/**
 * Schema para aceitar convite
 */
export const AcceptInviteSchema = z.object({
  inviteCode: z.string().min(6, "Código de convite inválido"),
});

// Type exports
export type SendFriendRequestInput = z.infer<typeof SendFriendRequestSchema>;
export type RespondFriendRequestInput = z.infer<typeof RespondFriendRequestSchema>;
export type FriendshipFiltersInput = z.infer<typeof FriendshipFiltersSchema>;
export type UserSearchInput = z.infer<typeof UserSearchSchema>;
export type BlockUserInput = z.infer<typeof BlockUserSchema>;
export type GenerateInviteCodeInput = z.infer<typeof GenerateInviteCodeSchema>;
export type AcceptInviteInput = z.infer<typeof AcceptInviteSchema>;
