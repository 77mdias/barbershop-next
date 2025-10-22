"use client";

import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { EditProfileModal } from "@/components/EditProfileModal";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ProfileMenuItem } from "@/components/ui/profile-menu-item";
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
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const handleProfileUpdate = () => {
    // Força re-render para mostrar dados atualizados
    setRefreshKey(prev => prev + 1);
  };

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
      <div className="container mx-auto min-h-screen mt-12 flex items-center justify-center bg-[--background] min-w-full">
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
    <div key={refreshKey} className="container mx-auto flex flex-col w-full mt-16 bg-[--background]">
      {/* Header com gradiente escuro */}
      <div className={cn("text-white px-6 pt-8 pb-8", styles.profileHeader)}>
        {/* Avatar e informações do usuário */}
        <div className="text-center">
          <div
            className={cn(
              "relative inline-block mb-4",
              styles.profileHeader__avatar
            )}
          >
            <UserAvatar
              src={user.image}
              name={user.name}
              email={user.email}
              size="xl"
              className="w-24 h-24"
            />
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
            className={cn("px-6 py-2 font-medium mx-4 transition-colors", styles.profileHeader__editButton)}
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Profile
          </Button>

          {/* Botão Logout */}
          <Button
            className={cn("mt-4 px-6 py-2 rounded-full font-medium transition-colors", styles.profileHeader__editButton_logout)}
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

          {/* Menu items refatorados com ProfileMenuItem */}
          <div className="space-y-3">
            <ProfileMenuItem
              icon={
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              }
              label="Configurações do Perfil"
              href="/profile/settings"
              className={styles.profileContent__menuItem}
            />

            <ProfileMenuItem
              icon={
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
              }
              label="Friend & Social"
              className={styles.profileContent__menuItem}
            />

            <ProfileMenuItem
              icon={
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
              }
              label="Feedback"
              onClick={() => handleNavigation('/dashboard')}
              className={styles.profileContent__menuItem}
            />

            <ProfileMenuItem
              icon={
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
                    d="M9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22"
                  />
                </svg>
              }
              label="Meu Dashboard"
              href="/dashboard"
              className={styles.profileContent__menuItem}
            />

            <ProfileMenuItem
              icon={
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
              }
              label="Gift Card"
              href="/gift-card"
              className={styles.profileContent__menuItem}
            />
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

      {/* Modal de Edição */}
      {user && (
        <EditProfileModal
          user={user}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}