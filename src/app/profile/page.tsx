"use client";

import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { EditProfileModal } from "@/components/EditProfileModal";
import { ProfileUploadSimple } from "@/components/upload/ProfileUploadSimple";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { BottomNavigation } from "@/components/bottom-navigation";
import { cn } from "@/lib/utils";
import { ProfilePageSkeleton } from "@/components/profile/ProfileSkeleton";
import {
  Camera,
  Settings,
  Users,
  MessageSquare,
  LayoutDashboard,
  Gift,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

/**
 * Página de Perfil do Usuário
 *
 * Exibe informações do usuário autenticado com design moderno
 * e mobile-first, mantendo consistência com o design system do projeto.
 */
export default function Profile() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleProfileUpdate = () => {
    // Força re-render para mostrar dados atualizados
    setRefreshKey((prev) => prev + 1);
  };

  const menuItems = [
    {
      label: "Configurações do Perfil",
      href: "/profile/settings",
      icon: Settings,
    },
    {
      label: "Friend & Social",
      href: "/profile/social",
      icon: Users,
    },
    {
      label: "Feedback",
      href: "/dashboard",
      icon: MessageSquare,
    },
    {
      label: "Meu Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Gift Card",
      href: "/gift-card",
      icon: Gift,
    },
  ];

  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen min-w-full items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-4 font-display text-2xl font-bold italic text-foreground">
            Acesso Negado
          </h1>
          <p className="mb-6 text-fg-muted">
            Você precisa estar logado para acessar esta página.
          </p>
          <Button
            onClick={() => signIn(undefined, { callbackUrl: "/profile" })}
            className="gold-shimmer inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90"
          >
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      key={refreshKey}
      className="container mx-auto mb-16 mt-16 flex w-full flex-col bg-background"
    >
      {/* Hero */}
      <div className="grain-overlay relative overflow-hidden bg-surface-1 py-12 text-center">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[hsl(var(--accent)/0.07)] blur-[90px]" />
        <div className="relative inline-block">
          <UserAvatar
            src={user.image}
            name={user.name}
            email={user.email}
            size="xl"
            className="h-24 w-24 ring-2 ring-[hsl(var(--accent)/0.4)] ring-offset-2 ring-offset-surface-1"
          />
          <button
            onClick={() => setIsPhotoUploadOpen(true)}
            className="absolute bottom-0 right-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-on-accent shadow-lg transition-all hover:bg-accent/90"
            title="Alterar foto de perfil"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold italic text-foreground">
          {user.name || "Usuário"}
        </h1>
        <p className="mt-1 text-sm text-fg-muted">{user.email}</p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
          >
            Editar Perfil
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="inline-flex rounded-xl border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.08)] px-5 py-2.5 text-sm font-semibold text-destructive transition-all duration-300 hover:bg-[hsl(var(--destructive)/0.15)]"
          >
            Sair da Conta
          </button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 px-6 py-6">
        {/* Seção Profile Settings */}
        <div className="mb-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
            Profile Settings
          </h2>

          <div className="space-y-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="card-hover flex items-center gap-4 rounded-2xl border border-border bg-surface-card p-4 transition-all duration-300 hover:border-[hsl(var(--accent)/0.3)]"
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1 text-sm font-medium text-foreground">
                    {item.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-fg-subtle" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Informações da Conta */}
        <div className="rounded-2xl border border-border bg-surface-1 p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Informações da Conta
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-fg-muted">Role:</span>
              <span className="font-medium capitalize text-foreground">
                {user.role.toLowerCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">ID:</span>
              <span className="font-mono text-xs text-fg-subtle">
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

      {/* Modal de Upload de Foto */}
      {isPhotoUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-surface-card">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold italic text-foreground">
                  Alterar Foto de Perfil
                </h2>
                <button
                  onClick={() => setIsPhotoUploadOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted transition-colors hover:text-foreground"
                >
                  <span className="text-lg leading-none">&#x2715;</span>
                </button>
              </div>

              <ProfileUploadSimple
                currentImageUrl={user?.image}
                onUploadComplete={async (url) => {
                  console.log("Nova foto de perfil:", url);

                  try {
                    // Atualizar no banco de dados
                    const response = await fetch(
                      "/api/user/update-profile-image",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ imageUrl: url }),
                      }
                    );

                    if (response.ok) {
                      // Forçar reload da página para atualizar a imagem
                      window.location.reload();
                    } else {
                      console.error("Erro ao atualizar foto no banco");
                      alert(
                        "Foto carregada, mas houve erro ao salvar. Recarregue a página."
                      );
                    }
                  } catch (error) {
                    console.error("Erro ao atualizar perfil:", error);
                    alert(
                      "Foto carregada, mas houve erro ao salvar. Recarregue a página."
                    );
                  }

                  setIsPhotoUploadOpen(false);
                }}
                className="mb-4"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
