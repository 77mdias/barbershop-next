import { ChangePasswordSkeleton } from "@/components/profile/ProfileSkeleton";

/**
 * Loading state para a página de alteração de senha
 * Exibido durante navegação de rotas pelo Next.js App Router
 */
export default function ChangePasswordLoading() {
  return <ChangePasswordSkeleton />;
}
