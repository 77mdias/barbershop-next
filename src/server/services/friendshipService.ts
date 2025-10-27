import { db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type {
  FriendshipFiltersInput,
  UserSearchInput
} from "@/schemas/friendshipSchemas";

/**
 * Service Layer para gerenciamento de amizades e relacionamentos sociais
 */
export class FriendshipService {
  /**
   * Busca solicitação de amizade por ID
   */
  static async findRequestById(requestId: string) {
    return db.friendRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            nickname: true,
            image: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            nickname: true,
            image: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Envia solicitação de amizade
   */
  static async sendFriendRequest(senderId: string, receiverId: string) {
    // Validações
    if (senderId === receiverId) {
      throw new Error("Você não pode adicionar a si mesmo como amigo");
    }

    // Verificar se já são amigos
    const existingFriendship = await db.friendship.findFirst({
      where: {
        OR: [
          { userId: senderId, friendId: receiverId },
          { userId: receiverId, friendId: senderId },
        ],
      },
    });

    if (existingFriendship) {
      if (existingFriendship.status === "BLOCKED") {
        throw new Error("Não é possível enviar solicitação para este usuário");
      }
      throw new Error("Vocês já são amigos");
    }

    // Verificar se já existe solicitação pendente
    const existingRequest = await db.friendRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId, status: "PENDING" },
          { senderId: receiverId, receiverId: senderId, status: "PENDING" },
        ],
      },
    });

    if (existingRequest) {
      if (existingRequest.senderId === receiverId) {
        // O outro usuário já enviou uma solicitação, aceitar automaticamente
        return this.acceptFriendRequest(existingRequest.id);
      }
      throw new Error("Solicitação já enviada");
    }

    // Criar solicitação
    return db.friendRequest.create({
      data: {
        senderId,
        receiverId,
        status: "PENDING",
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            nickname: true,
            image: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Aceita solicitação de amizade
   */
  static async acceptFriendRequest(requestId: string) {
    const request = await this.findRequestById(requestId);

    if (!request) {
      throw new Error("Solicitação não encontrada");
    }

    if (request.status !== "PENDING") {
      throw new Error("Esta solicitação já foi processada");
    }

    // Usar transação para garantir consistência
    return db.$transaction(async (tx) => {
      // Atualizar status da solicitação
      await tx.friendRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" },
      });

      // Criar amizade bidirecional
      await tx.friendship.createMany({
        data: [
          {
            userId: request.senderId,
            friendId: request.receiverId,
            status: "ACCEPTED",
          },
          {
            userId: request.receiverId,
            friendId: request.senderId,
            status: "ACCEPTED",
          },
        ],
      });

      return request;
    });
  }

  /**
   * Rejeita solicitação de amizade
   */
  static async rejectFriendRequest(requestId: string) {
    const request = await this.findRequestById(requestId);

    if (!request) {
      throw new Error("Solicitação não encontrada");
    }

    if (request.status !== "PENDING") {
      throw new Error("Esta solicitação já foi processada");
    }

    return db.friendRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
    });
  }

  /**
   * Cancela solicitação de amizade enviada
   */
  static async cancelFriendRequest(requestId: string, userId: string) {
    const request = await this.findRequestById(requestId);

    if (!request) {
      throw new Error("Solicitação não encontrada");
    }

    if (request.senderId !== userId) {
      throw new Error("Você não pode cancelar esta solicitação");
    }

    if (request.status !== "PENDING") {
      throw new Error("Esta solicitação já foi processada");
    }

    return db.friendRequest.update({
      where: { id: requestId },
      data: { status: "CANCELLED" },
    });
  }

  /**
   * Remove amizade
   */
  static async removeFriend(userId: string, friendId: string) {
    return db.$transaction(async (tx) => {
      // Remover amizade bidirecional
      await tx.friendship.deleteMany({
        where: {
          OR: [
            { userId, friendId },
            { userId: friendId, friendId: userId },
          ],
        },
      });
    });
  }

  /**
   * Bloqueia ou desbloqueia usuário
   */
  static async toggleBlockUser(userId: string, targetUserId: string, block: boolean) {
    if (userId === targetUserId) {
      throw new Error("Você não pode bloquear a si mesmo");
    }

    return db.$transaction(async (tx) => {
      if (block) {
        // Remover amizade se existir
        await tx.friendship.deleteMany({
          where: {
            OR: [
              { userId, friendId: targetUserId },
              { userId: targetUserId, friendId: userId },
            ],
          },
        });

        // Remover solicitações pendentes
        await tx.friendRequest.deleteMany({
          where: {
            OR: [
              { senderId: userId, receiverId: targetUserId },
              { senderId: targetUserId, receiverId: userId },
            ],
            status: "PENDING",
          },
        });

        // Criar registro de bloqueio
        return tx.friendship.create({
          data: {
            userId,
            friendId: targetUserId,
            status: "BLOCKED",
          },
        });
      } else {
        // Remover bloqueio
        await tx.friendship.deleteMany({
          where: {
            userId,
            friendId: targetUserId,
            status: "BLOCKED",
          },
        });
      }
    });
  }

  /**
   * Lista amigos do usuário
   */
  static async getFriends(userId: string, filters: FriendshipFiltersInput = {}) {
    const { search, status = "ACCEPTED", page = 1, limit = 20 } = filters;

    const where: Prisma.FriendshipWhereInput = {
      userId,
      status,
    };

    if (search) {
      where.friend = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { nickname: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const [friends, total] = await Promise.all([
      db.friendship.findMany({
        where,
        include: {
          friend: {
            select: {
              id: true,
              name: true,
              nickname: true,
              image: true,
              role: true,
              email: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.friendship.count({ where }),
    ]);

    return {
      friends: friends.map((f) => f.friend),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lista solicitações de amizade recebidas
   */
  static async getReceivedRequests(userId: string) {
    return db.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: "PENDING",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            nickname: true,
            image: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Lista solicitações de amizade enviadas
   */
  static async getSentRequests(userId: string) {
    return db.friendRequest.findMany({
      where: {
        senderId: userId,
        status: "PENDING",
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            nickname: true,
            image: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Busca sugestões de amigos baseado em amigos em comum
   */
  static async getSuggestions(userId: string, limit = 10) {
    // Buscar IDs dos amigos atuais
    const currentFriends = await db.friendship.findMany({
      where: { userId, status: "ACCEPTED" },
      select: { friendId: true },
    });

    const friendIds = currentFriends.map((f) => f.friendId);

    // Buscar solicitações pendentes (enviadas e recebidas)
    const pendingRequests = await db.friendRequest.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        status: "PENDING",
      },
      select: { senderId: true, receiverId: true },
    });

    const pendingUserIds = [
      ...pendingRequests.map((r) => r.senderId),
      ...pendingRequests.map((r) => r.receiverId),
    ].filter((id) => id !== userId);

    // Buscar usuários bloqueados
    const blockedUsers = await db.friendship.findMany({
      where: {
        OR: [
          { userId, status: "BLOCKED" },
          { friendId: userId, status: "BLOCKED" },
        ],
      },
      select: { userId: true, friendId: true },
    });

    const blockedUserIds = [
      ...blockedUsers.map((b) => b.friendId),
      ...blockedUsers.map((b) => b.userId),
    ].filter((id) => id !== userId);

    // Buscar amigos de amigos
    if (friendIds.length === 0) {
      // Se não tem amigos, retornar usuários aleatórios
      return db.user.findMany({
        where: {
          id: {
            notIn: [userId, ...pendingUserIds, ...blockedUserIds],
          },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          nickname: true,
          image: true,
          role: true,
        },
        take: limit,
      });
    }

    // Query SQL para encontrar amigos de amigos com contagem de amigos em comum
    const suggestions = await db.$queryRaw<
      Array<{
        id: string;
        name: string;
        nickname: string | null;
        image: string | null;
        role: string;
        mutualFriends: bigint;
      }>
    >`
      SELECT DISTINCT u.id, u.name, u.nickname, u.image, u.role,
        COUNT(f.userId) as "mutualFriends"
      FROM "User" u
      INNER JOIN "Friendship" f ON f.friendId = u.id
      WHERE f.userId IN (${Prisma.join(friendIds)})
        AND f.status = 'ACCEPTED'
        AND u.id != ${userId}
        AND u.id NOT IN (${Prisma.join([...friendIds, ...pendingUserIds, ...blockedUserIds])})
        AND u."isActive" = true
      GROUP BY u.id, u.name, u.nickname, u.image, u.role
      ORDER BY "mutualFriends" DESC
      LIMIT ${limit}
    `;

    return suggestions.map((s) => ({
      ...s,
      mutualFriends: Number(s.mutualFriends),
    }));
  }

  /**
   * Busca usuários por nome/email
   */
  static async searchUsers(userId: string, filters: UserSearchInput) {
    const { query, excludeFriends = true, page = 1, limit = 20 } = filters;

    let excludedIds = [userId];

    if (excludeFriends) {
      const friends = await db.friendship.findMany({
        where: { userId, status: "ACCEPTED" },
        select: { friendId: true },
      });
      excludedIds = [...excludedIds, ...friends.map((f) => f.friendId)];
    }

    const where: Prisma.UserWhereInput = {
      id: { notIn: excludedIds },
      isActive: true,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { nickname: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    };

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          nickname: true,
          image: true,
          role: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: "asc" },
      }),
      db.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Gera ou regenera código de convite único
   */
  static async generateInviteCode(userId: string, regenerate = false) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { inviteCode: true },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Se já tem código e não quer regenerar
    if (user.inviteCode && !regenerate) {
      return user.inviteCode;
    }

    // Gerar código único (8 caracteres alfanuméricos)
    let inviteCode: string;
    let isUnique = false;

    while (!isUnique) {
      inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      const existing = await db.user.findUnique({
        where: { inviteCode },
      });

      if (!existing) {
        isUnique = true;
      }
    }

    await db.user.update({
      where: { id: userId },
      data: { inviteCode: inviteCode! },
    });

    return inviteCode!;
  }

  /**
   * Aceita convite via código
   */
  static async acceptInvite(userId: string, inviteCode: string) {
    const inviter = await this.findUserByInviteCode(inviteCode);

    if (!inviter) {
      throw new Error("Código de convite inválido");
    }

    if (inviter.id === userId) {
      throw new Error("Você não pode usar seu próprio código de convite");
    }

    // Enviar solicitação de amizade automaticamente
    return this.sendFriendRequest(userId, inviter.id);
  }

  /**
   * Busca usuário pelo código de convite
   */
  static async findUserByInviteCode(inviteCode: string) {
    return db.user.findUnique({
      where: { inviteCode },
      select: { 
        id: true, 
        name: true, 
        nickname: true, 
        image: true 
      },
    });
  }

  /**
   * Obtém estatísticas sociais do usuário
   */
  static async getUserSocialStats(userId: string) {
    const [friendsCount, pendingReceivedCount, pendingSentCount] = await Promise.all([
      db.friendship.count({
        where: { userId, status: "ACCEPTED" },
      }),
      db.friendRequest.count({
        where: { receiverId: userId, status: "PENDING" },
      }),
      db.friendRequest.count({
        where: { senderId: userId, status: "PENDING" },
      }),
    ]);

    return {
      friendsCount,
      pendingReceivedCount,
      pendingSentCount,
    };
  }
}
