"use client";

import { usePathname } from "next/navigation";
import { BottomNavigation } from "@/components/bottom-navigation";

interface ConditionalBottomNavigationProps {
  items: Array<{
    id: string;
    label: string;
    href: string;
    icon: React.ReactNode;
  }>;
}

export function ConditionalBottomNavigation({ items }: ConditionalBottomNavigationProps) {
  const pathname = usePathname();
  
  // Rotas onde a navegação inferior deve ser ocultada
  const hideNavigationRoutes = [
    '/auth/signin',
    '/auth/signup', 
    '/auth/reset-password',
    '/auth/verify-email',
    '/auth/thank-you',
    '/auth/error'
  ];
  
  // Verifica se a rota atual deve ocultar a navegação
  const shouldHideNavigation = hideNavigationRoutes.some(route => 
    pathname?.startsWith(route)
  );
  
  if (shouldHideNavigation) {
    return null;
  }
  
  return <BottomNavigation items={items} />;
}