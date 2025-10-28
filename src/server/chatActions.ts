"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChatService } from "./services/chatService";
import {
  SendMessageSchema,
  GetMessagesSchema,
  CreateConversationSchema,
  MarkAsReadSchema,
  ConversationFiltersSchema,
  type SendMessageInput,
  type GetMessagesInput,
  type CreateConversationInput,
  type MarkAsReadInput,
  type ConversationFiltersInput,
} from "@/schemas/chatSchemas";

/**
 * Server Action para criar ou buscar conversa com um amigo
 */
export async function getOrCreateConversation(data: CreateConversationInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const validated = CreateConversationSchema.parse(data);

    // Não permitir criar conversa consigo mesmo
    if (validated.friendId === session.user.id) {
      return {
        success: false,
        error: "Não é possível criar conversa consigo mesmo",
      };
    }

    const conversation = await ChatService.getOrCreateConversation(
      session.user.id,
      validated.friendId
    );

    return {
      success: true,
      data: conversation,
    };
  } catch (error) {
    console.error("Erro ao criar/buscar conversa:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Erro ao criar/buscar conversa",
    };
  }
}

/**
 * Server Action para buscar conversas do usuário
 */
export async function getUserConversations(
  filters?: Partial<ConversationFiltersInput>
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const validatedFilters = filters
      ? ConversationFiltersSchema.parse(filters)
      : { page: 1, limit: 20 };

    const result = await ChatService.getUserConversations(
      session.user.id,
      validatedFilters
    );

    return {
      success: true,
      data: result.conversations,
      pagination: result.pagination,
    };
  } catch (error) {
    console.error("Erro ao buscar conversas:", error);
    return {
      success: false,
      error: "Erro ao buscar conversas",
    };
  }
}

/**
 * Server Action para buscar uma conversa específica
 */
export async function getConversationById(conversationId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const conversation = await ChatService.getConversationById(
      conversationId,
      session.user.id
    );

    return {
      success: true,
      data: conversation,
    };
  } catch (error) {
    console.error("Erro ao buscar conversa:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Erro ao buscar conversa",
    };
  }
}

/**
 * Server Action para enviar mensagem
 */
export async function sendMessage(data: SendMessageInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const validated = SendMessageSchema.parse(data);

    const message = await ChatService.sendMessage(
      validated.conversationId,
      session.user.id,
      validated.content
    );

    return {
      success: true,
      data: message,
    };
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Erro ao enviar mensagem",
    };
  }
}

/**
 * Server Action para buscar mensagens
 */
export async function getMessages(data: GetMessagesInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const validated = GetMessagesSchema.parse(data);

    const result = await ChatService.getMessages(
      validated.conversationId,
      session.user.id,
      validated.page,
      validated.limit
    );

    return {
      success: true,
      data: result.messages,
      pagination: result.pagination,
    };
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Erro ao buscar mensagens",
    };
  }
}

/**
 * Server Action para marcar mensagens como lidas
 */
export async function markMessagesAsRead(data: MarkAsReadInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const validated = MarkAsReadSchema.parse(data);

    await ChatService.markMessagesAsRead(
      validated.conversationId,
      session.user.id
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao marcar mensagens como lidas:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Erro ao marcar mensagens como lidas",
    };
  }
}

/**
 * Server Action para buscar estatísticas de chat
 */
export async function getChatStats() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const stats = await ChatService.getChatStats(session.user.id);

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return {
      success: false,
      error: "Erro ao buscar estatísticas",
    };
  }
}

/**
 * Server Action para buscar contador de mensagens não lidas
 */
export async function getUnreadCount() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const count = await ChatService.getUnreadCount(session.user.id);

    return {
      success: true,
      data: { count },
    };
  } catch (error) {
    console.error("Erro ao buscar contador:", error);
    return {
      success: false,
      error: "Erro ao buscar contador",
    };
  }
}
