"use client";

import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/UserAvatar";
import { getUnreadCount, getUserConversations } from "@/server/chatActions";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  lastMessageAt?: Date | string | null;
  participants: Array<{
    user: {
      id: string;
      name: string;
      image?: string | null;
    };
  }>;
  messages: Array<{
    content: string;
    createdAt: Date | string;
  }>;
  _count?: {
    messages: number;
  };
}

interface ChatBellProps {
  currentUserId: string;
}

/**
 * ChatBell - Componente de notificações de chat no header
 *
 * Features:
 * - Badge com contador de mensagens não lidas
 * - Dropdown com preview das últimas conversas
 * - Auto-refresh a cada 10 segundos
 * - Navegação para chat
 */
export function ChatBell({ currentUserId }: ChatBellProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Carregar conversas e contador de não lidas
  const loadData = async () => {
    try {
      const [conversationsResult, countResult] = await Promise.all([
        getUserConversations({ page: 1, limit: 5, unreadOnly: false }),
        getUnreadCount(),
      ]);

      if (conversationsResult.success) {
        setConversations((conversationsResult.data || []) as Conversation[]);
      }

      if (countResult.success && countResult.data) {
        setUnreadCount(countResult.data.count);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do chat:", error);
    }
  };

  // Auto-refresh a cada 10 segundos
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Navegar para conversa
  const handleConversationClick = (conversationId: string) => {
    setIsOpen(false);
    router.push(`/chat/${conversationId}`);
  };

  // Ver todas as conversas
  const handleViewAll = () => {
    setIsOpen(false);
    router.push("/chat");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Mensagens"
        >
          <MessageCircle className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-accent text-[hsl(var(--background))]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0 bg-surface-card border-border" align="end">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Mensagens</h3>
            {unreadCount > 0 && (
              <Badge className="text-xs bg-[hsl(var(--accent)/0.12)] text-accent border border-[hsl(var(--accent)/0.25)]">
                {unreadCount} não lida{unreadCount !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="h-[320px]">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <MessageCircle className="h-12 w-12 text-fg-subtle mb-3" />
              <p className="text-sm text-fg-muted mb-1">
                Nenhuma conversa ainda
              </p>
              <p className="text-xs text-fg-subtle">
                Comece conversando com seus amigos
              </p>
            </div>
          ) : (
            <div>
              {conversations.map((conversation) => {
                const friend = conversation.participants.find(
                  (p) => p.user.id !== currentUserId
                );

                if (!friend) return null;

                const lastMessage = conversation.messages[0];
                const unreadCount = conversation._count?.messages || 0;
                const timeAgo = lastMessage?.createdAt
                  ? formatDistanceToNow(
                      typeof lastMessage.createdAt === "string"
                        ? new Date(lastMessage.createdAt)
                        : lastMessage.createdAt,
                      { locale: ptBR, addSuffix: true }
                    )
                  : null;

                return (
                  <button
                    key={conversation.id}
                    onClick={() => handleConversationClick(conversation.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 transition-colors border-b border-border",
                      unreadCount > 0
                        ? "bg-[hsl(var(--accent)/0.06)] hover:bg-[hsl(var(--accent)/0.10)]"
                        : "hover:bg-[hsl(var(--accent)/0.04)]"
                    )}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <UserAvatar
                        src={friend.user.image}
                        name={friend.user.name}
                        email=""
                        size="sm"
                        className="w-10 h-10"
                      />
                      {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-accent text-[hsl(var(--background))] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-baseline justify-between mb-0.5">
                        <h4
                          className={cn(
                            "text-sm font-medium truncate",
                            "text-foreground"
                          )}
                        >
                          {friend.user.name}
                        </h4>
                        {timeAgo && (
                          <span className="text-xs text-fg-subtle flex-shrink-0 ml-2">
                            {timeAgo.replace("há cerca de ", "").replace("há ", "")}
                          </span>
                        )}
                      </div>
                      {lastMessage && (
                        <p
                          className={cn(
                            "text-xs truncate",
                            unreadCount > 0
                              ? "text-foreground font-medium"
                              : "text-fg-muted"
                          )}
                        >
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {conversations.length > 0 && (
          <div className="p-2 border-t border-border">
            <Button
              variant="ghost"
              className="w-full text-sm text-accent hover:text-accent/80 hover:bg-[hsl(var(--accent)/0.08)]"
              onClick={handleViewAll}
            >
              Ver todas as mensagens
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
