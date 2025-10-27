import { db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type {
  NotificationFiltersInput,
  NotificationType,
} from "@/schemas/notificationSchemas";

/**
 * Service Layer para gerenciamento de notificações
 */
export class NotificationService {
  /**
   * Cria uma nova notificação
   */
  static async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedId?: string,
    metadata?: Record<string, any>
  ) {
    return db.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        relatedId,
        metadata: metadata || undefined,
      },
    });
  }

  /**
   * Busca notificações do usuário com filtros
   */
  static async getUserNotifications(
    userId: string,
    filters: NotificationFiltersInput = {}
  ) {
    const { read, type, page = 1, limit = 20 } = filters;

    const where: Prisma.NotificationWhereInput = {
      userId,
    };

    if (read !== undefined) {
      where.read = read;
    }

    if (type) {
      where.type = type;
    }

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.notification.count({ where }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Conta notificações não lidas do usuário
   */
  static async getUnreadCount(userId: string) {
    return db.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  /**
   * Marca uma notificação como lida
   */
  static async markAsRead(notificationId: string) {
    return db.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  /**
   * Marca todas as notificações do usuário como lidas
   */
  static async markAllAsRead(userId: string) {
    return db.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: { read: true },
    });
  }

  /**
   * Deleta uma notificação
   */
  static async deleteNotification(notificationId: string) {
    return db.notification.delete({
      where: { id: notificationId },
    });
  }

  /**
   * Busca notificação por ID
   */
  static async findById(notificationId: string) {
    return db.notification.findUnique({
      where: { id: notificationId },
    });
  }

  /**
   * Busca últimas N notificações do usuário (para dropdown)
   */
  static async getRecentNotifications(userId: string, limit = 5) {
    return db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Deleta notificações antigas (mais de 30 dias e já lidas)
   */
  static async cleanupOldNotifications() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return db.notification.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
        read: true,
      },
    });
  }
}
