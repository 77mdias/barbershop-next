"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/UserAvatar";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { sendMessage, getMessages, markMessagesAsRead } from "@/server/chatActions";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  createdAt: Date | string;
  senderId: string;
  isRead: boolean;
  sender: {
    id: string;
    name: string;
    image?: string | null;
  };
}

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  friendName: string;
  friendImage?: string | null;
  friendId: string;
  initialMessages?: Message[];
}

/**
 * ChatWindow - Janela principal do chat
 *
 * Features:
 * - Header com info do amigo
 * - ScrollArea com mensagens
 * - Auto-scroll para última mensagem
 * - Paginação infinita (load more)
 * - Envio de mensagens
 * - Auto-refresh a cada 5 segundos
 * - Marca mensagens como lidas
 */
export function ChatWindow({
  conversationId,
  currentUserId,
  friendName,
  friendImage,
  friendId,
  initialMessages = [],
}: ChatWindowProps) {
  const router = useRouter();
  const [messages, setMessages] = React.useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Carregar mais mensagens (paginação)
  const loadMoreMessages = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const result = await getMessages({
        conversationId,
        page: page + 1,
        limit: 50,
      });

      if (result.success && result.data) {
        const newMessages = result.data as Message[];
        if (newMessages.length > 0) {
          setMessages((prev) => [...newMessages, ...prev]);
          setPage((prev) => prev + 1);
        }

        if (result.pagination && result.pagination.page >= result.pagination.totalPages) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Enviar mensagem
  const handleSendMessage = async (content: string) => {
    setIsSending(true);
    try {
      const result = await sendMessage({
        conversationId,
        content,
      });

      if (result.success && result.data) {
        setMessages((prev) => [...prev, result.data as Message]);
        setTimeout(scrollToBottom, 100);
      } else {
        toast.error(result.error || "Erro ao enviar mensagem");
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setIsSending(false);
    }
  };

  // Marcar mensagens como lidas
  React.useEffect(() => {
    const markAsRead = async () => {
      await markMessagesAsRead({ conversationId });
    };

    markAsRead();
  }, [conversationId]);

  // Auto-refresh a cada 5 segundos
  React.useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const result = await getMessages({
          conversationId,
          page: 1,
          limit: 50,
        });

        if (result.success && result.data) {
          const latestMessages = result.data as Message[];
          setMessages(latestMessages);
        }
      } catch (error) {
        console.error("Erro ao atualizar mensagens:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [conversationId]);

  // Auto-scroll em mount e quando novas mensagens chegam
  React.useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="flex-shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <UserAvatar
          src={friendImage}
          name={friendName}
          email=""
          size="sm"
          className="w-10 h-10 flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 truncate">{friendName}</h2>
          <p className="text-xs text-gray-500">Online</p>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
        <div className="py-4">
          {/* Load more button */}
          {hasMore && messages.length >= 50 && (
            <div className="text-center mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={loadMoreMessages}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  "Carregar mais"
                )}
              </Button>
            </div>
          )}

          {/* Messages */}
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhuma mensagem ainda</p>
              <p className="text-sm text-gray-400 mt-1">
                Envie uma mensagem para começar a conversa
              </p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwn = message.senderId === currentUserId;
              const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.senderId !== message.senderId);

              return (
                <MessageBubble
                  key={message.id}
                  content={message.content}
                  createdAt={message.createdAt}
                  isOwn={isOwn}
                  isRead={message.isRead}
                  senderName={message.sender.name}
                  senderImage={message.sender.image}
                  showAvatar={showAvatar}
                />
              );
            })
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-white border-t shadow-lg px-4 py-3">
        <MessageInput
          onSendMessage={handleSendMessage}
          isLoading={isSending}
          placeholder="Digite uma mensagem..."
        />
      </div>
    </div>
  );
}
