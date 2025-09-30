import { z } from "zod";

// Enum de roles conforme schema.prisma
export const UserRoleEnum = z.enum(["ADMIN", "BARBER", "CLIENT"]);

// Schema de entrada para criação/edição de usuário
export const UserInput = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  nickname: z.string().optional(),
  role: UserRoleEnum.default("CLIENT"),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  isActive: z.boolean().optional(),
});

// Schema para formulários (role opcional)
export const UserFormInput = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  nickname: z.string().optional(),
  role: UserRoleEnum.optional(),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  isActive: z.boolean().optional(),
});

export type UserInputType = z.infer<typeof UserInput>;
export type UserFormInputType = z.infer<typeof UserFormInput>;
