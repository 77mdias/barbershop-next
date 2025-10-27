"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FriendshipService } from "./services/friendshipService";
import {
  SendFriendRequestSchema,
  RespondFriendRequestSchema,
  FriendshipFiltersSchema,
  UserSearchSchema,
  BlockUserSchema,
  GenerateInviteCodeSchema,
  AcceptInviteSchema,
  type SendFriendRequestInput,
  type RespondFriendRequestInput,
  type FriendshipFiltersInput,
  type UserSearchInput,
  type BlockUserInput,
  type GenerateInviteCodeInput,
  type AcceptInviteInput,
} from "@/schemas/friendshipSchemas";

/**
 * Server Action para enviar solicitação de amizade
 */
export async function sendFriendRequest(data: SendFriendRequestInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const validated = SendFriendRequestSchema.parse(data);

    const request = await FriendshipService.sendFriendRequest(
      session.user.id,
      validated.receiverId
    );

    return {
      success: true,
      data: request,
    };
  } catch (error) {
    console.error("Erro ao enviar solicitação de amizade:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Erro ao enviar solicitação de amizade",
    };
  }
}

/**
 * Server Action para responder solicitação de amizade
 */
export async function respondFriendRequest(data: RespondFriendRequestInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const validated = RespondFriendRequestSchema.parse(data);

    // Verificar se o usuário é o destinatário da solicitação
    const request = await FriendshipService.findRequestById(validated.requestId);

    if (!request) {
      return {
        success: false,
        error: "Solicitação não encontrada",
      };
    }

    if (request.receiverId !== session.user.id) {
      return {
        success: false,
        error: "Você não tem permissão para responder esta solicitação",
      };
    }

    let result;
    if (validated.action === "ACCEPT") {
      result = await FriendshipService.acceptFriendRequest(validated.requestId);
    } else {
      result = await FriendshipService.rejectFriendRequest(validated.requestId);
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Erro ao responder solicitação:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Erro ao responder solicitação",
    };
  }
}

/**
 * Server Action para cancelar solicitação de amizade enviada
 */
export async function cancelFriendRequest(requestId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    await FriendshipService.cancelFriendRequest(requestId, session.user.id);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao cancelar solicitação:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Erro ao cancelar solicitação",
    };
  }
}

/**
 * Server Action para remover amigo
 */
export async function removeFriend(friendId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    await FriendshipService.removeFriend(session.user.id, friendId);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao remover amigo:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Erro ao remover amigo",
    };
  }
}

/**
 * Server Action para bloquear/desbloquear usuário
 */
export async function toggleBlockUser(data: BlockUserInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const validated = BlockUserSchema.parse(data);

    await FriendshipService.toggleBlockUser(
      session.user.id,
      validated.userId,
      validated.block
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao bloquear/desbloquear usuário:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Erro ao processar bloqueio",
    };
  }
}

/**
 * Server Action para listar amigos
 */
export async function getFriends(filters?: Partial<FriendshipFiltersInput>) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const validatedFilters = filters
      ? FriendshipFiltersSchema.parse(filters)
      : { page: 1, limit: 20 };

    const result = await FriendshipService.getFriends(
      session.user.id,
      validatedFilters
    );

    return {
      success: true,
      data: result.friends,
      pagination: result.pagination,
    };
  } catch (error) {
    console.error("Erro ao buscar amigos:", error);
    return {
      success: false,
      error: "Erro ao buscar amigos",
    };
  }
}

/**
 * Server Action para listar solicitações recebidas
 */
export async function getReceivedRequests() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const requests = await FriendshipService.getReceivedRequests(session.user.id);

    return {
      success: true,
      data: requests,
    };
  } catch (error) {
    console.error("Erro ao buscar solicitações:", error);
    return {
      success: false,
      error: "Erro ao buscar solicitações",
    };
  }
}

/**
 * Server Action para listar solicitações enviadas
 */
export async function getSentRequests() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const requests = await FriendshipService.getSentRequests(session.user.id);

    return {
      success: true,
      data: requests,
    };
  } catch (error) {
    console.error("Erro ao buscar solicitações enviadas:", error);
    return {
      success: false,
      error: "Erro ao buscar solicitações enviadas",
    };
  }
}

/**
 * Server Action para buscar sugestões de amigos
 */
export async function getFriendSuggestions(limit = 10) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const suggestions = await FriendshipService.getSuggestions(
      session.user.id,
      limit
    );

    return {
      success: true,
      data: suggestions,
    };
  } catch (error) {
    console.error("Erro ao buscar sugestões:", error);
    return {
      success: false,
      error: "Erro ao buscar sugestões",
    };
  }
}

/**
 * Server Action para buscar usuários
 */
export async function searchUsers(filters: UserSearchInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const validated = UserSearchSchema.parse(filters);

    const result = await FriendshipService.searchUsers(
      session.user.id,
      validated
    );

    return {
      success: true,
      data: result.users,
      pagination: result.pagination,
    };
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Erro ao buscar usuários",
    };
  }
}

/**
 * Server Action para gerar código de convite
 */
export async function generateInviteCode(data?: GenerateInviteCodeInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const validated = data
      ? GenerateInviteCodeSchema.parse(data)
      : { regenerate: false };

    const inviteCode = await FriendshipService.generateInviteCode(
      session.user.id,
      validated.regenerate
    );

    return {
      success: true,
      data: { inviteCode },
    };
  } catch (error) {
    console.error("Erro ao gerar código de convite:", error);
    return {
      success: false,
      error: "Erro ao gerar código de convite",
    };
  }
}

/**
 * Server Action para aceitar convite via código
 */
export async function acceptInvite(data: AcceptInviteInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const validated = AcceptInviteSchema.parse(data);

    const result = await FriendshipService.acceptInvite(
      session.user.id,
      validated.inviteCode
    );

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Erro ao aceitar convite:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Erro ao aceitar convite",
    };
  }
}

/**
 * Server Action para buscar estatísticas sociais
 */
export async function getSocialStats() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const stats = await FriendshipService.getUserSocialStats(session.user.id);

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
