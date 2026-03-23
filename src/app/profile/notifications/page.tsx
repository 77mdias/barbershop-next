"use client";

import { useState, useEffect } from "react";
import { UserPlus, UserCheck, UserX, Gift, MoreVertical, Check, Trash2, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/server/notificationActions";
import { NotificationsListSkeleton } from "@/components/notifications/NotificationSkeleton";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHero } from "@/components/shared/PageHero";

interface Notification {
  id: string;
  type: "FRIEND_REQUEST_RECEIVED" | "FRIEND_REQUEST_ACCEPTED" | "FRIEND_REQUEST_REJECTED" | "FRIEND_INVITE_USED";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date | string;
  relatedId?: string | null;
  metadata?: any;
}

interface NotificationCounts {
  all: number;
  unread: number;
  read: number;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [counts, setCounts] = useState<NotificationCounts>({ all: 0, unread: 0, read: 0 });
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const router = useRouter();

  const loadNotifications = async (tabFilter: string, pageNum: number = 1, append = false) => {
    if (pageNum === 1) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      const filters: Record<string, unknown> = { page: pageNum, limit: 10 };
      if (tabFilter === "unread") filters.read = false;
      else if (tabFilter === "read") filters.read = true;

      const result = await getNotifications(filters);

      if (result.success) {
        const newNotifications = Array.isArray(result.data) ? result.data : [];
        setNotifications(prev => append ? [...prev, ...newNotifications] : newNotifications);
        if (result.pagination) {
          setHasMore(result.pagination.page < result.pagination.totalPages);
        } else {
          setHasMore(newNotifications.length === 10);
        }
      }

      await loadCounts();
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
      toast.error("Erro ao carregar notificações");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadCounts = async () => {
    try {
      const [allResult, unreadCountResult] = await Promise.all([
        getNotifications({ page: 1, limit: 1 }),
        getUnreadCount(),
      ]);

      const totalAll = allResult.success ? allResult.pagination?.total ?? 0 : 0;
      const unreadTotal = unreadCountResult.success ? unreadCountResult.data?.count ?? 0 : 0;
      const readTotal = Math.max(0, totalAll - unreadTotal);

      setCounts({ all: totalAll, unread: unreadTotal, read: readTotal });
    } catch (error) {
      console.error("Erro ao carregar contadores:", error);
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadNotifications(activeTab, 1, false);
  }, [activeTab]);

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadNotifications(activeTab, nextPage, true);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      const result = await markNotificationAsRead({ notificationId: notification.id });
      if (result.success) {
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
        await loadCounts();
      }
    }

    switch (notification.type) {
      case "FRIEND_REQUEST_RECEIVED":
        router.push("/profile/social/requests");
        break;
      case "FRIEND_REQUEST_ACCEPTED":
      case "FRIEND_INVITE_USED":
        router.push("/profile/social");
        break;
      default:
        break;
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    const result = await markNotificationAsRead({ notificationId });
    if (result.success) {
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
      await loadCounts();
      toast.success("Notificação marcada como lida");
    } else {
      toast.error("Erro ao marcar como lida");
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    const result = await deleteNotification({ notificationId });
    if (result.success) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      await loadCounts();
      toast.success("Notificação deletada");
    } else {
      toast.error("Erro ao deletar notificação");
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllNotificationsAsRead();
    if (result.success) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      await loadCounts();
      toast.success("Todas as notificações foram marcadas como lidas");
    } else {
      toast.error("Erro ao marcar todas como lidas");
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "FRIEND_REQUEST_RECEIVED":
        return (
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
            <UserPlus className="h-5 w-5" />
          </span>
        );
      case "FRIEND_REQUEST_ACCEPTED":
        return (
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
            <UserCheck className="h-5 w-5" />
          </span>
        );
      case "FRIEND_REQUEST_REJECTED":
        return (
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--destructive)/0.08)] text-destructive">
            <UserX className="h-5 w-5" />
          </span>
        );
      case "FRIEND_INVITE_USED":
        return (
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
            <Gift className="h-5 w-5" />
          </span>
        );
      default:
        return (
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.05)] text-fg-subtle">
            <Gift className="h-5 w-5" />
          </span>
        );
    }
  };

  const getActionButton = (notification: Notification) => {
    switch (notification.type) {
      case "FRIEND_REQUEST_RECEIVED":
        return (
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-4 py-2 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
            onClick={(e) => {
              e.stopPropagation();
              router.push("/profile/social/requests");
            }}
          >
            Ver solicitação
          </button>
        );
      case "FRIEND_REQUEST_ACCEPTED":
      case "FRIEND_INVITE_USED":
        return (
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-4 py-2 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
            onClick={(e) => {
              e.stopPropagation();
              router.push("/profile/social");
            }}
          >
            Ver perfil
          </button>
        );
      default:
        return null;
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return "agora";
    else if (diffInHours < 24) return `${Math.floor(diffInHours)}h atrás`;
    else if (diffInHours < 48) return "ontem";
    else return `${Math.floor(diffInHours / 24)} dias atrás`;
  };

  const EmptyState = ({ type }: { type: string }) => {
    const messages = {
      all: "Você não tem notificações ainda",
      unread: "Você está em dia! Nenhuma notificação não lida",
      read: "Nenhuma notificação lida",
    };

    return (
      <div className="rounded-2xl border border-border bg-surface-card p-12 text-center">
        <span className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--accent)/0.1)] text-accent">
          <Gift className="h-8 w-8" />
        </span>
        <h3 className="mb-2 font-semibold text-foreground">Nenhuma notificação</h3>
        <p className="text-sm text-fg-muted">
          {messages[type as keyof typeof messages]}
        </p>
      </div>
    );
  };

  const tabs = [
    { key: "all", label: "Todas", count: counts.all },
    { key: "unread", label: "Não lidas", count: counts.unread },
    { key: "read", label: "Lidas", count: counts.read },
  ];

  return (
    <div className="mb-20 min-h-screen w-full flex-col bg-background">
      <PageHero
        badge="Notificações"
        title="Suas Notificações"
        subtitle="Acompanhe as atualizações sobre suas conexões e atividades"
        actions={[{ label: "Voltar", href: "/profile", variant: "outline" }]}
      />

      {/* Tabs + Marcar todas */}
      <div className="sticky top-16 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex flex-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 border-b-2 py-2 text-sm font-medium transition-colors",
                  activeTab === tab.key
                    ? "border-accent text-accent"
                    : "border-transparent text-fg-muted hover:text-foreground"
                )}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={cn(
                      "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs",
                      tab.key === "unread"
                        ? "bg-accent text-on-accent"
                        : "bg-[hsl(var(--accent)/0.2)] text-accent"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          {counts.unread > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="ml-3 inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-3 py-2 text-xs font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
            >
              <Check className="h-3.5 w-3.5" />
              Marcar todas
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {isLoading ? (
          <NotificationsListSkeleton count={5} />
        ) : notifications.length === 0 ? (
          <EmptyState type={activeTab} />
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "card-hover cursor-pointer rounded-2xl border p-4 transition-all duration-300",
                  notification.read
                    ? "border-border bg-surface-card"
                    : "border-[hsl(var(--accent)/0.2)] bg-[hsl(var(--accent)/0.05)]"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <h3 className="truncate text-sm font-semibold text-foreground">
                        {notification.title}
                      </h3>
                      <div className="flex shrink-0 items-center gap-1">
                        <span className="whitespace-nowrap text-xs text-fg-subtle">
                          {getRelativeTime(new Date(notification.createdAt))}
                        </span>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-fg-muted transition-colors hover:text-foreground"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3 w-3" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!notification.read && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Marcar como lida
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification.id);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Deletar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <p className="mb-3 line-clamp-2 text-sm text-fg-muted">
                      {notification.message}
                    </p>

                    <div className="flex justify-end">
                      {getActionButton(notification)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    "Carregar mais"
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
