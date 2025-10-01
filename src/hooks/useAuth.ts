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
    isBarber: user?.role === UserRole.BARBER,
    isClient: user?.role === UserRole.CLIENT,
    session,
    status,
  };
}
