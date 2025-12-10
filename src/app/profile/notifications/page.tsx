"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, UserPlus, UserCheck, UserX, Gift, MoreVertical, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from "@/server/notificationActions";
import { NotificationsListSkeleton } from "@/components/notifications/NotificationSkeleton";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

  // Função para carregar notificações baseado na aba ativa
  const loadNotifications = async (tabFilter: string, pageNum: number = 1, append = false) => {
    if (pageNum === 1) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      const filters: Record<string, unknown> = {
        page: pageNum,
        limit: 10,
      };

      if (tabFilter === "unread") {
        filters.read = false;
      } else if (tabFilter === "read") {
        filters.read = true;
      }

      const result = await getNotifications(filters);

      if (result.success) {
        const newNotifications = Array.isArray(result.data) ? result.data : [];
        setNotifications(prev => 
          append ? [...prev, ...newNotifications] : newNotifications
        );
        if (result.pagination) {
          setHasMore(result.pagination.page < result.pagination.totalPages);
        } else {
          setHasMore(newNotifications.length === 10);
        }
      }

      // Carregar contadores
      await loadCounts();
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
      toast.error("Erro ao carregar notificações");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Função para carregar contadores
  const loadCounts = async () => {
    try {
      const [allResult, unreadCountResult] = await Promise.all([
        getNotifications({ page: 1, limit: 1 }),
        getUnreadCount(),
      ]);

      const totalAll = allResult.success ? allResult.pagination?.total ?? 0 : 0;
      const unreadTotal = unreadCountResult.success
        ? unreadCountResult.data?.count ?? 0
        : 0;
      const readTotal = Math.max(0, totalAll - unreadTotal);

      setCounts({
        all: totalAll,
        unread: unreadTotal,
        read: readTotal,
      });
    } catch (error) {
      console.error("Erro ao carregar contadores:", error);
    }
  };

  // Carregar notificações quando a aba muda
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadNotifications(activeTab, 1, false);
  }, [activeTab]);

  // Carregar mais notificações
  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadNotifications(activeTab, nextPage, true);
    }
  };

  // Marcar notificação como lida
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      const result = await markNotificationAsRead({ notificationId: notification.id });
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
        await loadCounts();
      }
    }

    // Navegar para página apropriada
    switch (notification.type) {
      case "FRIEND_REQUEST_RECEIVED":
        router.push("/profile/social/requests");
        break;
      case "FRIEND_REQUEST_ACCEPTED":
      case "FRIEND_INVITE_USED":
        router.push("/profile/social");
        break;
      default:
        // Página atual
        break;
    }
  };

  // Marcar notificação individual como lida
  const handleMarkAsRead = async (notificationId: string) => {
    const result = await markNotificationAsRead({ notificationId });
    if (result.success) {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      await loadCounts();
      toast.success("Notificação marcada como lida");
    } else {
      toast.error("Erro ao marcar como lida");
    }
  };

  // Deletar notificação
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

  // Marcar todas como lidas
  const handleMarkAllAsRead = async () => {
    const result = await markAllNotificationsAsRead();
    if (result.success) {
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      await loadCounts();
      toast.success("Todas as notificações foram marcadas como lidas");
    } else {
      toast.error("Erro ao marcar todas como lidas");
    }
  };

  // Ícone por tipo de notificação
  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "FRIEND_REQUEST_RECEIVED":
        return <UserPlus className="h-5 w-5 text-blue-500" />;
      case "FRIEND_REQUEST_ACCEPTED":
        return <UserCheck className="h-5 w-5 text-green-500" />;
      case "FRIEND_REQUEST_REJECTED":
        return <UserX className="h-5 w-5 text-red-500" />;
      case "FRIEND_INVITE_USED":
        return <Gift className="h-5 w-5 text-purple-500" />;
      default:
        return <div className="h-5 w-5 bg-gray-300 rounded-full" />;
    }
  };

  // Botão de ação contextual
  const getActionButton = (notification: Notification) => {
    switch (notification.type) {
      case "FRIEND_REQUEST_RECEIVED":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push("/profile/social/requests");
            }}
          >
            Ver solicitação
          </Button>
        );
      case "FRIEND_REQUEST_ACCEPTED":
      case "FRIEND_INVITE_USED":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push("/profile/social");
            }}
          >
            Ver perfil
          </Button>
        );
      default:
        return null;
    }
  };

  // Formatação de tempo relativo
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return "agora";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h atrás`;
    } else if (diffInHours < 48) {
      return "ontem";
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} dias atrás`;
    }
  };


  // Componente Empty State
  const EmptyState = ({ type }: { type: string }) => {
    const messages = {
      all: "Você não tem notificações ainda",
      unread: "Você está em dia! Nenhuma notificação não lida",
      read: "Nenhuma notificação lida"
    };

    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Gift className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">Nenhuma notificação</h3>
        <p className="text-muted-foreground">
          {messages[type as keyof typeof messages]}
        </p>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Notificações</h1>
          </div>
          
          {counts.unread > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </div>

      {/* Filtros (Tabs) */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-2">
            Todas
            {counts.all > 0 && (
              <Badge variant="secondary" className="text-xs">
                {counts.all}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center gap-2">
            Não lidas
            {counts.unread > 0 && (
              <Badge variant="destructive" className="text-xs">
                {counts.unread}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="read" className="flex items-center gap-2">
            Lidas
            {counts.read > 0 && (
              <Badge variant="outline" className="text-xs">
                {counts.read}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Conteúdo das Tabs */}
        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <NotificationsListSkeleton count={5} />
          ) : notifications.length === 0 ? (
            <EmptyState type={activeTab} />
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`
                    cursor-pointer transition-all hover:shadow-md
                    ${notification.read 
                      ? "bg-background" 
                      : "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800"
                    }
                  `}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-sm truncate">
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-2 ml-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {getRelativeTime(notification.createdAt)}
                            </span>
                            
                            {/* Menu de ações */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {!notification.read && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsRead(notification.id);
                                    }}
                                  >
                                    <Check className="h-4 w-4 mr-2" />
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
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Deletar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        {/* Botão de ação contextual */}
                        <div className="flex justify-end">
                          {getActionButton(notification)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Botão Carregar Mais */}
              {hasMore && (
                <div className="flex justify-center pt-6">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? "Carregando..." : "Carregar mais"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}