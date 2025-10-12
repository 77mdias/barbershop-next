"use client";

import { useEffect, useState } from "react";

interface ClientOnlyAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente que só renderiza conteúdo relacionado à autenticação no cliente,
 * evitando problemas de hidratação entre servidor e cliente.
 */
export function ClientOnlyAuth({ children, fallback = null }: ClientOnlyAuthProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}