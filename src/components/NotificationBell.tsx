"use client";

import { useState, useEffect } from "react";
import { Bell, UserPlus, UserCheck, UserX, Gift } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getRecentNotifications, getUnreadCount, markNotificationAsRead, markAllNotificationsAsRead } from "@/server/notificationActions";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: "FRIEND_REQUEST_RECEIVED" | "FRIEND_REQUEST_ACCEPTED" | "FRIEND_REQUEST_REJECTED" | "FRIEND_INVITE_USED";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  relatedId?: string;
  metadata?: any;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Carregar notificações
  const loadNotifications = async () => {
    try {
      const [notificationsResult, countResult] = await Promise.all([
        getRecentNotifications(5),
        getUnreadCount()
      ]);

      if (notificationsResult.success) {
        setNotifications(notificationsResult.data || []);
      }

      if (countResult.success) {
        setUnreadCount(countResult.data || 0);
      }
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    }
  };

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Marcar notificação como lida
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      const result = await markNotificationAsRead(notification.id);
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }

    // Navegar para página apropriada
    setIsOpen(false);
    switch (notification.type) {
      case "FRIEND_REQUEST_RECEIVED":
        router.push("/profile/social/requests");
        break;
      case "FRIEND_REQUEST_ACCEPTED":
      case "FRIEND_INVITE_USED":
        router.push("/profile/social");
        break;
      default:
        router.push("/profile/notifications");
    }
  };

  // Marcar todas como lidas
  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    try {
      const result = await markAllNotificationsAsRead();
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Ícone por tipo de notificação
  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "FRIEND_REQUEST_RECEIVED":
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case "FRIEND_REQUEST_ACCEPTED":
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case "FRIEND_REQUEST_REJECTED":
        return <UserX className="h-4 w-4 text-red-500" />;
      case "FRIEND_INVITE_USED":
        return <Gift className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Formatação de tempo relativo
  const getRelativeTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: ptBR 
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 w-9 rounded-full"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Notificações</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={isLoading}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>

          <Separator className="mb-3" />

          {/* Lista de notificações */}
          <ScrollArea className="max-h-80">
            {notifications.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Nenhuma notificação
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`
                      p-3 rounded-lg cursor-pointer transition-colors border
                      ${notification.read 
                        ? "bg-background hover:bg-muted/50 border-border" 
                        : "bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-950/50 dark:hover:bg-blue-950/70 dark:border-blue-800"
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">
                            {notification.title}
                          </p>
                          <span className="text-xs text-muted-foreground ml-2">
                            {getRelativeTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {notifications.length > 0 && (
            <>
              <Separator className="mt-3 mb-3" />
              {/* Footer */}
              <div className="text-center">
                <Link href="/profile/notifications">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    Ver todas as notificações
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}