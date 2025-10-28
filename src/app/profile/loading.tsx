import { ProfilePageSkeleton } from "@/components/profile/ProfileSkeleton";

/**
 * Loading state para a página de perfil
 * Exibido durante navegação de rotas pelo Next.js App Router
 */
export default function ProfileLoading() {
  return <ProfilePageSkeleton />;
}
