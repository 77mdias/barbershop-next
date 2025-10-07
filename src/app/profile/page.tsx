"use client";

import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/bottom-navigation";
import { cn } from "@/lib/utils";
import styles from "@/app/profile/page.module.scss";

/**
 * Página de Perfil do Usuário
 *
 * Exibe informações do usuário autenticado com design moderno
 * e mobile-first, mantendo consistência com o design da home.
 */
export default function Profile() {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Itens da navegação inferior (mesmo da home)
  const navigationItems = [
    {
      id: "home",
      label: "Home",
      href: "/",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      id: "search",
      label: "Search",
      href: "/search",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
    },
    {
      id: "bookings",
      label: "Bookings",
      href: "/bookings",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      id: "profile",
      label: "Profile",
      href: "/profile",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[--background] min-w-full">
        <div
          className={cn(
            "animate-spin rounded-full h-12 w-12 border-b-2",
            styles.profileLoading__spinner
          )}
        ></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen mt-12 flex items-center justify-center bg-[--background] min-w-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[--text] mb-4">
            Acesso Negado
          </h1>
          <p className="text-[--text] mb-6">
            Você precisa estar logado para acessar esta página.
          </p>
          <Button onClick={() => signIn(undefined, { callbackUrl: "/profile" })}>
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-12 bg-[--background] min-w-full">
      {/* Header com gradiente escuro */}
      <div className={cn("text-white px-6 pt-12 pb-8", styles.profileHeader)}>
        {/* Avatar e informações do usuário */}
        <div className="text-center">
          <div
            className={cn(
              "relative inline-block mb-4",
              styles.profileHeader__avatar
            )}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {user.name
                ? user.name.charAt(0).toUpperCase()
                : user.email.charAt(0).toUpperCase()}
            </div>
          </div>

          <h1
            className={cn(
              "text-2xl font-bold mb-1",
              styles.profileHeader__name
            )}
          >
            {user.name || "Usuário"}
          </h1>

          <p className={cn("text-sm mb-6", styles.profileHeader__email)}>
            {user.email}
          </p>

          {/* Botão Edit Profile */}
          <Button
            className={cn("px-6 py-2 font-medium transition-colors", styles.profileHeader__editButton)}
            variant="outline"
            onClick={() => {/* Aqui pode abrir modal de edição futuramente */}}
          >
            Edit Profile
          </Button>

          {/* Botão Logout */}
          <Button
            className={cn("mt-4 px-6 py-2 font-medium transition-colors", styles.profileHeader__editButton)}
            variant="destructive"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sair da Conta
          </Button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className={cn("flex-1 px-6 py-6", styles.profileContent)}>
        {/* Seção Profile Settings */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[--text] mb-4">
            Profile Settings
          </h2>

          {/* Menu items */}
          <div className="space-y-3">
            <div
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border",
                styles.profileContent__menuItem
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <span className="text-[--text] font-medium">
                  Friend & Social
                </span>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>

            <div
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border",
                styles.profileContent__menuItem
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <span className="text-[--text] font-medium">Feedback</span>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>

            <div
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border",
                styles.profileContent__menuItem
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                    />
                  </svg>
                </div>
                <span className="text-[--text] font-medium">Gift Card</span>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Informações do usuário */}
        <div
          className={cn(
            "mt-6 p-4 rounded-lg",
            styles.profileContent__accountInfo
          )}
        >
          <h3 className="font-semibold text-[--text] mb-3">
            Informações da Conta
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[--text]">Role:</span>
              <span className="text-[--text] font-medium capitalize">
                {user.role.toLowerCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[--text]">ID:</span>
              <span className="text-[--text] font-mono text-xs">
                {user.id.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  {
    /* Navegação inferior */
  }
}
