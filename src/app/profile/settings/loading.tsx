import { ProfileSettingsSkeleton } from "@/components/profile/ProfileSkeleton";

/**
 * Loading state para a página de configurações do perfil
 * Exibido durante navegação de rotas pelo Next.js App Router
 */
export default function SettingsLoading() {
  return <ProfileSettingsSkeleton />;
}
