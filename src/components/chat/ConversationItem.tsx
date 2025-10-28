"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ConversationItemProps {
  conversationId: string;
  friendName: string;
  friendImage?: string | null;
  lastMessage?: string;
  lastMessageAt?: Date | string | null;
  unreadCount?: number;
  isActive?: boolean;
}

/**
 * ConversationItem - Item na lista de conversas
 *
 * Features:
 * - Avatar do amigo
 * - Nome do amigo
 * - Prévia da última mensagem
 * - Timestamp relativo
 * - Badge de não lidas
 * - Indicador de conversa ativa
 */
export function ConversationItem({
  conversationId,
  friendName,
  friendImage,
  lastMessage,
  lastMessageAt,
  unreadCount = 0,
  isActive = false,
}: ConversationItemProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/chat/${conversationId}`);
  };

  const timeAgo = lastMessageAt
    ? formatDistanceToNow(
        typeof lastMessageAt === "string" ? new Date(lastMessageAt) : lastMessageAt,
        { locale: ptBR, addSuffix: true }
      )
    : null;

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-center gap-3 p-4 cursor-pointer transition-all border-b border-gray-100",
        "hover:bg-gray-50 active:bg-gray-100",
        isActive && "bg-blue-50 hover:bg-blue-50 border-l-4 border-l-blue-600"
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 relative">
        <UserAvatar
          src={friendImage}
          name={friendName}
          email=""
          size="md"
          className="w-12 h-12"
        />

        {/* Unread badge on avatar */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1">
          {/* Friend name */}
          <h3
            className={cn(
              "font-semibold truncate",
              unreadCount > 0 ? "text-gray-900" : "text-gray-700"
            )}
          >
            {friendName}
          </h3>

          {/* Timestamp */}
          {timeAgo && (
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {timeAgo}
            </span>
          )}
        </div>

        {/* Last message preview */}
        {lastMessage && (
          <p
            className={cn(
              "text-sm truncate",
              unreadCount > 0
                ? "text-gray-900 font-medium"
                : "text-gray-500"
            )}
          >
            {lastMessage}
          </p>
        )}
      </div>

      {/* Unread indicator */}
      {unreadCount > 0 && (
        <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full" />
      )}
    </div>
  );
}
