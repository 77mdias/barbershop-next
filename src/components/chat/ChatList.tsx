"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { ConversationItem } from "./ConversationItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageCircle, Search, X } from "lucide-react";
import { getUserConversations } from "@/server/chatActions";
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

interface ChatListProps {
  currentUserId: string;
  initialConversations?: Conversation[];
}

/**
 * ChatList - Lista de conversas
 *
 * Features:
 * - Lista todas as conversas do usuário
 * - Busca/filtro de conversas
 * - Badge com contador de não lidas
 * - Última mensagem preview
 * - Auto-refresh a cada 10 segundos
 * - Loading states e empty state
 */
export function ChatList({
  currentUserId,
  initialConversations = [],
}: ChatListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [conversations, setConversations] =
    React.useState<Conversation[]>(initialConversations);
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Carregar conversas
  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const result = await getUserConversations({ page: 1, limit: 50 });

      if (result.success && result.data) {
        setConversations(result.data as Conversation[]);
      }
    } catch (error) {
      console.error("Erro ao carregar conversas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh a cada 10 segundos
  React.useEffect(() => {
    loadConversations();

    const interval = setInterval(() => {
      loadConversations();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Filtrar conversas por nome do amigo
  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery) return true;

    const friend = conversation.participants.find(
      (p) => p.user.id !== currentUserId
    );

    return friend?.user.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  // Verificar se uma conversa está ativa
  const isConversationActive = (conversationId: string) => {
    return pathname === `/chat/${conversationId}`;
  };

  return (
    <div className="flex flex-col w-full h-full bg-white">
      {/* Header */}
      <div className="border-b px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Mensagens</h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        {isLoading && conversations.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">
              {searchQuery ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery
                ? "Tente buscar por outro nome"
                : "Comece uma conversa com seus amigos"}
            </p>
            {!searchQuery && (
              <Button
                variant="outline"
                onClick={() => router.push("/profile/social")}
              >
                Ver Amigos
              </Button>
            )}
          </div>
        ) : (
          <div>
            {filteredConversations.map((conversation) => {
              const friend = conversation.participants.find(
                (p) => p.user.id !== currentUserId
              );

              if (!friend) return null;

              const lastMessage = conversation.messages[0];
              const unreadCount = conversation._count?.messages || 0;

              return (
                <ConversationItem
                  key={conversation.id}
                  conversationId={conversation.id}
                  friendName={friend.user.name}
                  friendImage={friend.user.image}
                  lastMessage={lastMessage?.content}
                  lastMessageAt={lastMessage?.createdAt}
                  unreadCount={unreadCount}
                  isActive={isConversationActive(conversation.id)}
                />
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
