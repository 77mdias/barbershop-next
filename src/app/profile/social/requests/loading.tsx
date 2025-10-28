import { FriendRequestsPageSkeleton } from "@/components/social/SocialSkeleton";

/**
 * Loading state para a página de solicitações de amizade
 * Exibido durante navegação de rotas pelo Next.js App Router
 */
export default function RequestsLoading() {
  return <FriendRequestsPageSkeleton />;
}
