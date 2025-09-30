"use server";

import { db } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { UserInput, UserInputType } from "@/schemas/userSchemas";

// Cria o usuário
export async function createUser(raw: unknown) {
  const data = UserInput.parse(raw);
  // Hash da senha se fornecida
  let password: string | undefined = undefined;
  if (data.password) {
    password = await hash(data.password, 12);
  }
  const user = await db.user.create({
    data: {
      branchId: data.branchId,
      nickname: data.nickname,
      role: data.role,
      email: data.email,
      password,
      isActive: data.isActive ?? false,
    },
    select: {
      id: true,
      branchId: true,
      nickname: true,
      role: true,
      email: true,
      isActive: true,
      createdAt: true,
    },
  });
  revalidatePath("/dashboard/users");
  return { success: true, data: user };
}

// Atualiza usuário, incluindo lógica para hash de senha se fornecida
const UserUpdateInput = UserInput.partial().extend({ id: z.string() });
type UserUpdateInputType = z.infer<typeof UserUpdateInput>;
export async function updateUser(raw: unknown) {
  const { id, ...data } = UserUpdateInput.parse(raw);
  const updateData: any = { ...data };
  if (data.password) {
    updateData.password = await hash(data.password, 12);
  }
  const user = await db.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      branchId: true,
      nickname: true,
      role: true,
      email: true,
      isActive: true,
      updatedAt: true,
    },
  });
  revalidatePath("/dashboard/users");
  return { success: true, data: user };
}

// Deleta usuário pelo ID
export async function deleteUser(id: string) {
  await db.user.delete({
    where: { id },
  });
  revalidatePath("/dashboard/users");
  return { success: true };
}

// Lista usuários com filtros opcionais
export async function listUsers() {
  const users = await db.user.findMany({
    select: {
      id: true,
      branchId: true,
      nickname: true,
      role: true,
      email: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return { success: true, data: users };
}

// Pega usuário pelo ID
export async function getUserById(id: string) {
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      branchId: true,
      nickname: true,
      role: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) {
    return { success: false, error: "Usuário não encontrado" };
  }
  return { success: true, data: user };
}
