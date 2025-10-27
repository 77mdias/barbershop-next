"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NotificationService } from "./services/notificationService";
import {
  NotificationFiltersSchema,
  MarkAsReadSchema,
  DeleteNotificationSchema,
  type NotificationFiltersInput,
  type MarkAsReadInput,
  type DeleteNotificationInput,
} from "@/schemas/notificationSchemas";

/**
 * Server Action para buscar notificações do usuário
 */
export async function getNotifications(filters?: Partial<NotificationFiltersInput>) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const validatedFilters = filters
      ? NotificationFiltersSchema.parse(filters)
      : { page: 1, limit: 20 };

    const result = await NotificationService.getUserNotifications(
      session.user.id,
      validatedFilters
    );

    return {
      success: true,
      data: result.notifications,
      pagination: result.pagination,
    };
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    return {
      success: false,
      error: "Erro ao buscar notificações",
    };
  }
}

/**
 * Server Action para buscar contador de notificações não lidas
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

    const count = await NotificationService.getUnreadCount(session.user.id);

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

/**
 * Server Action para buscar notificações recentes (para dropdown)
 */
export async function getRecentNotifications(limit = 5) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const notifications = await NotificationService.getRecentNotifications(
      session.user.id,
      limit
    );

    return {
      success: true,
      data: notifications,
    };
  } catch (error) {
    console.error("Erro ao buscar notificações recentes:", error);
    return {
      success: false,
      error: "Erro ao buscar notificações recentes",
    };
  }
}

/**
 * Server Action para marcar notificação como lida
 */
export async function markNotificationAsRead(data: MarkAsReadInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const validated = MarkAsReadSchema.parse(data);

    // Verificar se a notificação pertence ao usuário
    const notification = await NotificationService.findById(
      validated.notificationId
    );

    if (!notification) {
      return {
        success: false,
        error: "Notificação não encontrada",
      };
    }

    if (notification.userId !== session.user.id) {
      return {
        success: false,
        error: "Sem permissão para marcar esta notificação",
      };
    }

    await NotificationService.markAsRead(validated.notificationId);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao marcar notificação:", error);
    return {
      success: false,
      error: "Erro ao marcar notificação",
    };
  }
}

/**
 * Server Action para marcar todas as notificações como lidas
 */
export async function markAllNotificationsAsRead() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    await NotificationService.markAllAsRead(session.user.id);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao marcar todas as notificações:", error);
    return {
      success: false,
      error: "Erro ao marcar todas as notificações",
    };
  }
}

/**
 * Server Action para deletar notificação
 */
export async function deleteNotification(data: DeleteNotificationInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const validated = DeleteNotificationSchema.parse(data);

    // Verificar se a notificação pertence ao usuário
    const notification = await NotificationService.findById(
      validated.notificationId
    );

    if (!notification) {
      return {
        success: false,
        error: "Notificação não encontrada",
      };
    }

    if (notification.userId !== session.user.id) {
      return {
        success: false,
        error: "Sem permissão para deletar esta notificação",
      };
    }

    await NotificationService.deleteNotification(validated.notificationId);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao deletar notificação:", error);
    return {
      success: false,
      error: "Erro ao deletar notificação",
    };
  }
}
