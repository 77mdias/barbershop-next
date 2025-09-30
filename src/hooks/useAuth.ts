"use client";

import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";

interface UserWithRole {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}

export function useAuth() {
  const { data: session, status } = useSession();

  const user = session?.user as UserWithRole | undefined;

  return {
    user,
    isLoading: status === "loading",
    isAuthenticated: !!user,
    isAdmin: user?.role === UserRole.ADMIN,
    isSeller: user?.role === UserRole.PROFESSIONAL,
    isCustomer: user?.role === UserRole.CUSTOMER,
    session,
    status,
  };
}
