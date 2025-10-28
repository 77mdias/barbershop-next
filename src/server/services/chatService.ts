import { db } from "@/lib/prisma";
import type { ConversationFiltersInput } from "@/schemas/chatSchemas";

/**
 * ChatService - Service layer para gerenciamento de conversas e mensagens
 *
 * Funcionalidades:
 * - Criar/buscar conversas entre amigos
 * - Enviar e buscar mensagens
 * - Marcar mensagens como lidas
 * - Contar mensagens não lidas
 * - Validar participação em conversas
 */
export class ChatService {
  /**
   * Busca ou cria uma conversa entre dois usuários
   */
  static async getOrCreateConversation(userId1: string, userId2: string) {
    // Verificar se já existe uma conversa entre esses usuários
    const existingConversation = await db.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                userId: userId1,
              },
            },
          },
          {
            participants: {
              some: {
                userId: userId2,
              },
            },
          },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                nickname: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (existingConversation) {
      return existingConversation;
    }

    // Verificar se são amigos antes de criar a conversa
    const areFriends = await this.areFriends(userId1, userId2);

    if (!areFriends) {
      throw new Error("Só é possível criar conversas com amigos");
    }

    // Criar nova conversa com os dois participantes
    const newConversation = await db.conversation.create({
      data: {
        participants: {
          create: [{ userId: userId1 }, { userId: userId2 }],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                nickname: true,
              },
            },
          },
        },
        messages: true,
      },
    });

    return newConversation;
  }

  /**
   * Busca todas as conversas de um usuário
   */
  static async getUserConversations(
    userId: string,
    filters?: Partial<ConversationFiltersInput>
  ) {
    const { page = 1, limit = 20, unreadOnly = false } = filters || {};
    const skip = (page - 1) * limit;

    // Buscar conversas onde o usuário é participante
    const conversations = await db.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                nickname: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: {
                  not: userId,
                },
              },
            },
          },
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
      skip,
      take: limit,
    });

    // Filtrar apenas conversas com mensagens não lidas se necessário
    const filteredConversations = unreadOnly
      ? conversations.filter((conv) => conv._count.messages > 0)
      : conversations;

    const total = await db.conversation.count({
      where: {
        participants: {
          some: {
            userId: userId,
          },
        },
      },
    });

    return {
      conversations: filteredConversations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca uma conversa específica por ID
   */
  static async getConversationById(conversationId: string, userId: string) {
    // Verificar se o usuário é participante
    const isParticipant = await this.isUserParticipant(conversationId, userId);

    if (!isParticipant) {
      throw new Error("Você não tem acesso a esta conversa");
    }

    const conversation = await db.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                nickname: true,
              },
            },
          },
        },
      },
    });

    return conversation;
  }

  /**
   * Envia uma mensagem em uma conversa
   */
  static async sendMessage(
    conversationId: string,
    senderId: string,
    content: string
  ) {
    // Verificar se o usuário é participante
    const isParticipant = await this.isUserParticipant(conversationId, senderId);

    if (!isParticipant) {
      throw new Error("Você não tem acesso a esta conversa");
    }

    // Criar mensagem e atualizar lastMessageAt da conversa
    const message = await db.message.create({
      data: {
        content,
        conversationId,
        senderId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            nickname: true,
          },
        },
      },
    });

    // Atualizar timestamp da conversa
    await db.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        lastMessageAt: new Date(),
      },
    });

    return message;
  }

  /**
   * Busca mensagens de uma conversa com paginação
   */
  static async getMessages(
    conversationId: string,
    userId: string,
    page: number = 1,
    limit: number = 50
  ) {
    // Verificar se o usuário é participante
    const isParticipant = await this.isUserParticipant(conversationId, userId);

    if (!isParticipant) {
      throw new Error("Você não tem acesso a esta conversa");
    }

    const skip = (page - 1) * limit;

    const messages = await db.message.findMany({
      where: {
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            nickname: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    const total = await db.message.count({
      where: {
        conversationId,
      },
    });

    return {
      messages: messages.reverse(), // Reverter para ordem cronológica
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Marca todas as mensagens de uma conversa como lidas
   */
  static async markMessagesAsRead(conversationId: string, userId: string) {
    // Verificar se o usuário é participante
    const isParticipant = await this.isUserParticipant(conversationId, userId);

    if (!isParticipant) {
      throw new Error("Você não tem acesso a esta conversa");
    }

    // Marcar mensagens como lidas (exceto as enviadas pelo próprio usuário)
    await db.message.updateMany({
      where: {
        conversationId,
        senderId: {
          not: userId,
        },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    // Atualizar lastReadAt do participante
    await db.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId,
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    return true;
  }

  /**
   * Conta total de mensagens não lidas de um usuário
   */
  static async getUnreadCount(userId: string) {
    const count = await db.message.count({
      where: {
        conversation: {
          participants: {
            some: {
              userId: userId,
            },
          },
        },
        senderId: {
          not: userId,
        },
        isRead: false,
      },
    });

    return count;
  }

  /**
   * Conta mensagens não lidas em uma conversa específica
   */
  static async getUnreadCountPerConversation(
    conversationId: string,
    userId: string
  ) {
    const count = await db.message.count({
      where: {
        conversationId,
        senderId: {
          not: userId,
        },
        isRead: false,
      },
    });

    return count;
  }

  /**
   * Verifica se um usuário é participante de uma conversa
   */
  static async isUserParticipant(
    conversationId: string,
    userId: string
  ): Promise<boolean> {
    const participant = await db.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
      },
    });

    return !!participant;
  }

  /**
   * Verifica se dois usuários são amigos
   */
  static async areFriends(userId1: string, userId2: string): Promise<boolean> {
    const friendship = await db.friendship.findFirst({
      where: {
        OR: [
          {
            userId: userId1,
            friendId: userId2,
            status: "ACCEPTED",
          },
          {
            userId: userId2,
            friendId: userId1,
            status: "ACCEPTED",
          },
        ],
      },
    });

    return !!friendship;
  }

  /**
   * Busca estatísticas de chat do usuário
   */
  static async getChatStats(userId: string) {
    const totalConversations = await db.conversation.count({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
    });

    const unreadCount = await this.getUnreadCount(userId);

    const totalMessagesSent = await db.message.count({
      where: {
        senderId: userId,
      },
    });

    return {
      totalConversations,
      unreadCount,
      totalMessagesSent,
    };
  }
}
