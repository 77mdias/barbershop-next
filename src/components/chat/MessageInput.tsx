"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void> | void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * MessageInput - Input para enviar mensagens
 *
 * Features:
 * - Textarea com auto-resize
 * - Envio com Enter (Shift+Enter = nova linha)
 * - Validação de mensagens vazias
 * - Loading state
 * - Contador de caracteres
 */
export function MessageInput({
  onSendMessage,
  isLoading = false,
  placeholder = "Digite sua mensagem...",
  disabled = false,
  className,
}: MessageInputProps) {
  const [content, setContent] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent || isLoading || disabled) {
      return;
    }

    // Validar tamanho máximo
    if (trimmedContent.length > 5000) {
      return;
    }

    await onSendMessage(trimmedContent);
    setContent("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sem Shift envia a mensagem
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isDisabled = disabled || isLoading;
  const isSendDisabled = isDisabled || !content.trim();

  return (
    <form onSubmit={handleSubmit} className={cn("flex gap-2 items-end", className)}>
      {/* Textarea */}
      <div className="flex-1 relative">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          rows={1}
          className={cn(
            "min-h-[44px] max-h-[120px] resize-none pr-12",
            "focus-visible:ring-blue-600"
          )}
        />

        {/* Character counter */}
        {content.length > 4500 && (
          <div
            className={cn(
              "absolute bottom-2 right-2 text-xs",
              content.length > 5000 ? "text-red-500" : "text-gray-500"
            )}
          >
            {content.length}/5000
          </div>
        )}
      </div>

      {/* Send button */}
      <Button
        type="submit"
        size="icon"
        disabled={isSendDisabled}
        className="h-11 w-11 flex-shrink-0 bg-blue-600 hover:bg-blue-700"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
      </Button>
    </form>
  );
}
