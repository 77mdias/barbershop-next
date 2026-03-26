"use client";

import { useSession } from "next-auth/react";

type UserRole = "ADMIN" | "BARBER" | "CLIENT";

interface UserWithRole {
  id: string;
  email: string;
  name?: string;
  nickname?: string;
  phone?: string;
  image?: string;
  role: UserRole;
}

export function useAuth() {
  const { data: session, status } = useSession();

  const user = session?.user as UserWithRole | undefined;

  return {
    user,
    isLoading: status === "loading",
    isAuthenticated: !!user,
    isAdmin: user?.role === "ADMIN",
    isBarber: user?.role === "BARBER",
    isClient: user?.role === "CLIENT",
    session,
    status,
  };
}
