import { z } from "zod";

// Enum de roles conforme schema.prisma
export const UserRoleEnum = z.enum(["ADMIN", "CUSTOMER", "PROFESSIONAL"]);

// Schema de entrada para criação/edição de usuário
export const UserInput = z.object({
  branchId: z.string(),
  nickname: z.string(),
  role: UserRoleEnum.default("CUSTOMER"),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  isActive: z.boolean().optional(),
});

// Schema para formulários (role opcional)
export const UserFormInput = z.object({
  branchId: z.string(),
  nickname: z.string(),
  role: UserRoleEnum.optional(),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  isActive: z.boolean().optional(),
});

export type UserInputType = z.infer<typeof UserInput>;
export type UserFormInputType = z.infer<typeof UserFormInput>;
