import { NotificationsPageSkeleton } from "@/components/notifications/NotificationSkeleton";

/**
 * Loading state para a página de notificações
 * Exibido durante navegação de rotas pelo Next.js App Router
 */
export default function NotificationsLoading() {
  return <NotificationsPageSkeleton />;
}
