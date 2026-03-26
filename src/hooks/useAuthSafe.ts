"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type UserRole = "ADMIN" | "BARBER" | "CLIENT";

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
    isAdmin: user?.role === "ADMIN",
    isBarber: user?.role === "BARBER",
    isClient: user?.role === "CLIENT",
    session,
    status,
    hasMounted: true,
  };
}
