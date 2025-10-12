"use client";

import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { useEffect, useState } from "react";

interface UserWithRole {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}

/**
 * Hook seguro para autenticação que evita problemas de hidratação
 * retornando valores padrão até que a hidratação seja completa
 */
export function useAuthSafe() {
  const { data: session, status } = useSession();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Durante a hidratação, retorna valores padrão
  if (!hasMounted) {
    return {
      user: undefined,
      isLoading: true,
      isAuthenticated: false,
      isAdmin: false,
      isBarber: false,
      isClient: false,
      session: null,
      status: "loading" as const,
      hasMounted: false,
    };
  }

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
    hasMounted: true,
  };
}
