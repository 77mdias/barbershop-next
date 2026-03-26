import { t as db } from "./prisma-uKWGIJ7B.mjs";
import { F as emitRealtimeEvent } from "./rsc.mjs";
//#region node_modules/.nitro/vite/services/rsc/assets/notificationService-Bdc-jz2B.js
/**
* Service Layer para gerenciamento de notificações
*/
var NotificationService = class {
	/**
	* Cria uma nova notificação
	*/
	static async createNotification(userId, type, title, message, relatedId, metadata) {
		const notification = await db.notification.create({ data: {
			userId,
			type,
			title,
			message,
			relatedId,
			metadata: metadata || void 0
		} });
		try {
			const unreadCount = await this.getUnreadCount(userId);
			emitRealtimeEvent({
				type: "notification:new",
				payload: {
					notification: {
						...notification,
						createdAt: notification.createdAt.toISOString(),
						metadata: notification.metadata ?? null,
						relatedId: notification.relatedId ?? null
					},
					unreadCount
				},
				target: { users: [userId] }
			});
		} catch (error) {
			console.error("Erro ao emitir evento de notificação:", error);
		}
		return notification;
	}
	/**
	* Busca notificações do usuário com filtros
	*/
	static async getUserNotifications(userId, filters = {}) {
		const { read, type, page = 1, limit = 20 } = filters;
		const where = { userId };
		if (read !== void 0) where.read = read;
		if (type) where.type = type;
		const [notifications, total] = await Promise.all([db.notification.findMany({
			where,
			orderBy: { createdAt: "desc" },
			skip: (page - 1) * limit,
			take: limit
		}), db.notification.count({ where })]);
		return {
			notifications,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		};
	}
	/**
	* Conta notificações não lidas do usuário
	*/
	static async getUnreadCount(userId) {
		return db.notification.count({ where: {
			userId,
			read: false
		} });
	}
	/**
	* Marca uma notificação como lida
	*/
	static async markAsRead(notificationId) {
		return db.notification.update({
			where: { id: notificationId },
			data: { read: true }
		});
	}
	/**
	* Marca todas as notificações do usuário como lidas
	*/
	static async markAllAsRead(userId) {
		return db.notification.updateMany({
			where: {
				userId,
				read: false
			},
			data: { read: true }
		});
	}
	/**
	* Deleta uma notificação
	*/
	static async deleteNotification(notificationId) {
		return db.notification.delete({ where: { id: notificationId } });
	}
	/**
	* Busca notificação por ID
	*/
	static async findById(notificationId) {
		return db.notification.findUnique({ where: { id: notificationId } });
	}
	/**
	* Busca últimas N notificações do usuário (para dropdown)
	*/
	static async getRecentNotifications(userId, limit = 5) {
		return db.notification.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
			take: limit
		});
	}
	/**
	* Deleta notificações antigas (mais de 30 dias e já lidas)
	*/
	static async cleanupOldNotifications() {
		const thirtyDaysAgo = /* @__PURE__ */ new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		return db.notification.deleteMany({ where: {
			createdAt: { lt: thirtyDaysAgo },
			read: true
		} });
	}
};
//#endregion
export { NotificationService as t };
