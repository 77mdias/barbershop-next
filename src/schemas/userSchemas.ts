import { z } from "zod";

// Enum de roles conforme schema.prisma
export const UserRoleEnum = z.enum(["ADMIN", "BARBER", "CLIENT"]);
export const UserStatusFilterEnum = z.enum(["ACTIVE", "INACTIVE", "DELETED", "ALL"]);

// Schema para filtros de busca de usuários
export const UserFiltersSchema = z.object({
  role: UserRoleEnum.optional(),
  status: UserStatusFilterEnum.default("ACTIVE"),
  includeDeleted: z.boolean().default(false),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(20),
});

// Schema de entrada para criação/edição de usuário
export const UserInput = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  nickname: z.string().optional(),
  role: UserRoleEnum.default("CLIENT"),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  isActive: z.boolean().optional(),
  phone: z.string().optional(),
});

// Schema para formulários (role opcional)
export const UserFormInput = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  nickname: z.string().optional(),
  role: UserRoleEnum.optional(),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  isActive: z.boolean().optional(),
  phone: z.string().optional(),
});

export const UserUpdateInput = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório").optional(),
  nickname: z.string().optional(),
  role: UserRoleEnum.optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  isActive: z.boolean().optional(),
  phone: z.string().optional(),
});

export const UserSoftDeleteSchema = z.object({
  id: z.string(),
  reason: z.string().max(240).optional(),
});

export const UserRestoreSchema = z.object({
  id: z.string(),
});

export type UserFiltersInput = z.infer<typeof UserFiltersSchema>;
export type UserInputType = z.infer<typeof UserInput>;
export type UserFormInputType = z.infer<typeof UserFormInput>;
export type UserUpdateInputType = z.infer<typeof UserUpdateInput>;
export type UserSoftDeleteInput = z.infer<typeof UserSoftDeleteSchema>;
export type UserRestoreInput = z.infer<typeof UserRestoreSchema>;
