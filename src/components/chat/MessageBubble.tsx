"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/UserAvatar";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  content: string;
  createdAt: Date | string;
  isOwn: boolean;
  isRead?: boolean;
  senderName?: string;
  senderImage?: string | null;
  showAvatar?: boolean;
}

/**
 * MessageBubble - Componente de mensagem individual
 *
 * Features:
 * - Diferenciação visual entre mensagens enviadas/recebidas
 * - Timestamp formatado
 * - Status de leitura (checkmarks)
 * - Avatar do remetente
 * - Quebra de linha e formatação de texto
 */
export function MessageBubble({
  content,
  createdAt,
  isOwn,
  isRead = false,
  senderName,
  senderImage,
  showAvatar = true,
}: MessageBubbleProps) {
  const timestamp =
    typeof createdAt === "string" ? new Date(createdAt) : createdAt;

  const formattedTime = format(timestamp, "HH:mm", { locale: ptBR });

  return (
    <div
      className={cn(
        "flex gap-2 mb-3 max-w-[85%] sm:max-w-[70%]",
        isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <div className="flex-shrink-0">
          <UserAvatar
            src={senderImage}
            name={senderName || "User"}
            email=""
            size="sm"
            className="w-8 h-8"
          />
        </div>
      )}

      {/* Message Content */}
      <div className="flex flex-col gap-1">
        {/* Sender name (only for received messages) */}
        {!isOwn && senderName && (
          <span className="text-xs text-gray-500 px-1">{senderName}</span>
        )}

        {/* Bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2 break-words shadow-sm",
            isOwn
              ? "bg-blue-600 text-white rounded-br-sm"
              : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm"
          )}
        >
          {/* Message text */}
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {content}
          </p>

          {/* Timestamp and read status */}
          <div
            className={cn(
              "flex items-center gap-1 mt-1 text-xs",
              isOwn ? "text-blue-100" : "text-gray-500"
            )}
          >
            <span>{formattedTime}</span>

            {/* Read status (only for own messages) */}
            {isOwn && (
              <span className="ml-1">
                {isRead ? (
                  <CheckCheck className="w-3.5 h-3.5" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
