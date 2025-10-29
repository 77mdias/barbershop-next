import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Skeleton para o header do perfil (avatar + nome + botões)
 */
export function ProfileHeaderSkeleton() {
  return (
    <div className="px-6 pt-8 pb-8 bg-muted/30">
      <div className="text-center">
        {/* Avatar */}
        <div className="relative inline-block mb-4">
          <Skeleton className="w-24 h-24 rounded-full" />
        </div>

        {/* Nome */}
        <Skeleton className="h-8 w-48 mx-auto mb-2" />

        {/* Email */}
        <Skeleton className="h-4 w-40 mx-auto mb-6" />

        {/* Botão Edit Profile */}
        <Skeleton className="h-10 w-36 mx-auto mb-4 rounded-full" />

        {/* Botão Logout */}
        <Skeleton className="h-10 w-32 mx-auto rounded-full" />
      </div>
    </div>
  );
}

/**
 * Skeleton para os items de menu do perfil
 */
export function ProfileMenuSkeleton() {
  return (
    <div className="flex-1 px-6 py-6">
      {/* Título da seção */}
      <Skeleton className="h-6 w-40 mb-4" />

      {/* Menu items */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-card rounded-xl p-4 shadow-sm border border-border"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Informações da conta */}
      <div className="mt-6 p-4 rounded-lg bg-card border border-border">
        <Skeleton className="h-5 w-44 mb-3" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton para a página de configurações (formulário)
 */
export function ProfileSettingsSkeleton() {
  return (
    <div className="min-h-screen mt-20 mb-8 min-w-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b w-full bg-card">
        <div className="flex items-center justify-between px-4 py-4">
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-6 w-32" />
          <div className="w-10"></div>
        </div>
      </div>

      <div className="py-6 px-4 max-w-2xl">
        {/* Avatar Section */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border mb-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Skeleton className="w-24 h-24 rounded-full" />
              <Skeleton className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full" />
            </div>
            <div className="text-center space-y-2">
              <Skeleton className="h-5 w-40 mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-card rounded-2xl shadow-sm border border-border">
          <div className="p-6 space-y-6">
            {/* Form fields */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Skeleton className="h-10 flex-1 rounded-lg" />
              <Skeleton className="h-10 flex-1 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton completo para a página de perfil principal
 */
export function ProfilePageSkeleton() {
  return (
    <div className="container mx-auto flex flex-col w-full mt-16 bg-[--background]">
      <ProfileHeaderSkeleton />
      <ProfileMenuSkeleton />
    </div>
  );
}

/**
 * Skeleton para formulário de alteração de senha
 */
export function ChangePasswordSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header com gradiente */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
        <div className="relative z-10">
          {/* Barra de Status */}
          <div className="flex justify-between items-center px-6 pt-12 pb-4">
            <Skeleton className="h-10 w-10 rounded bg-white/20" />
            <Skeleton className="h-6 w-32 bg-white/20" />
            <div className="w-10"></div>
          </div>

          {/* Info do Header */}
          <div className="flex flex-col items-center px-6 pb-8">
            <Skeleton className="w-16 h-16 rounded-full mb-4 bg-white/20" />
            <Skeleton className="h-7 w-48 mb-2 bg-white/20" />
            <Skeleton className="h-4 w-40 bg-white/20" />
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 px-6 py-6">
        <div className="max-w-lg mx-auto">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="space-y-6">
              {/* 3 campos de senha */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 flex-1 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
