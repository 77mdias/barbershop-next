import { d as registerServerReference, o as __toESM } from "./encryption-runtime-LT6HXFPw.mjs";
import { n as authOptions, y as require_next_auth } from "./auth-D37wSDgg.mjs";
import { a as boolean, c as number, d as record, f as string, l as object, n as _enum, r as any } from "../_libs/zod.mjs";
import { F as emitRealtimeEvent } from "./rsc.mjs";
import { t as NotificationService } from "./notificationService-Bdc-jz2B.mjs";
//#region node_modules/.nitro/vite/services/rsc/assets/notificationActions-DUjnbdla.js
var import_next_auth = /* @__PURE__ */ __toESM(require_next_auth());
var NotificationTypeEnum = _enum([
	"FRIEND_REQUEST_RECEIVED",
	"FRIEND_REQUEST_ACCEPTED",
	"FRIEND_REQUEST_REJECTED",
	"FRIEND_INVITE_USED"
]);
/**
* Schema para filtros de listagem de notificações
*/
var NotificationFiltersSchema = object({
	read: boolean().optional(),
	type: NotificationTypeEnum.optional(),
	page: number().int().positive().default(1),
	limit: number().int().positive().max(50).default(20)
});
/**
* Schema para marcar notificação como lida
*/
var MarkAsReadSchema = object({ notificationId: string().cuid("ID de notificação inválido") });
/**
* Schema para deletar notificação
*/
var DeleteNotificationSchema = object({ notificationId: string().cuid("ID de notificação inválido") });
object({
	userId: string().cuid(),
	type: NotificationTypeEnum,
	title: string().min(1, "Título é obrigatório"),
	message: string().min(1, "Mensagem é obrigatória"),
	relatedId: string().optional(),
	metadata: record(string(), any()).optional()
});
/**
* Server Action para buscar notificações do usuário
*/
async function getNotifications(filters) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const validatedFilters = filters ? NotificationFiltersSchema.parse(filters) : {
			page: 1,
			limit: 20
		};
		const result = await NotificationService.getUserNotifications(session.user.id, validatedFilters);
		return {
			success: true,
			data: result.notifications,
			pagination: result.pagination
		};
	} catch (error) {
		console.error("Erro ao buscar notificações:", error);
		return {
			success: false,
			error: "Erro ao buscar notificações"
		};
	}
}
/**
* Server Action para buscar contador de notificações não lidas
*/
async function getUnreadCount() {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		return {
			success: true,
			data: { count: await NotificationService.getUnreadCount(session.user.id) }
		};
	} catch (error) {
		console.error("Erro ao buscar contador:", error);
		return {
			success: false,
			error: "Erro ao buscar contador"
		};
	}
}
/**
* Server Action para buscar notificações recentes (para dropdown)
*/
async function getRecentNotifications(limit = 5) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		return {
			success: true,
			data: await NotificationService.getRecentNotifications(session.user.id, limit)
		};
	} catch (error) {
		console.error("Erro ao buscar notificações recentes:", error);
		return {
			success: false,
			error: "Erro ao buscar notificações recentes"
		};
	}
}
/**
* Server Action para marcar notificação como lida
*/
async function markNotificationAsRead(data) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const notificationId = typeof data === "string" ? data : data.notificationId;
		const validated = MarkAsReadSchema.parse({ notificationId });
		const notification = await NotificationService.findById(validated.notificationId);
		if (!notification) return {
			success: false,
			error: "Notificação não encontrada"
		};
		if (notification.userId !== session.user.id) return {
			success: false,
			error: "Sem permissão para marcar esta notificação"
		};
		await NotificationService.markAsRead(validated.notificationId);
		try {
			const unreadCount = await NotificationService.getUnreadCount(session.user.id);
			emitRealtimeEvent({
				type: "notification:read",
				payload: {
					notificationId: validated.notificationId,
					unreadCount
				},
				target: { users: [session.user.id] }
			});
		} catch (error) {
			console.error("Erro ao emitir evento de leitura de notificação:", error);
		}
		return { success: true };
	} catch (error) {
		console.error("Erro ao marcar notificação:", error);
		return {
			success: false,
			error: "Erro ao marcar notificação"
		};
	}
}
/**
* Server Action para marcar todas as notificações como lidas
*/
async function markAllNotificationsAsRead() {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		await NotificationService.markAllAsRead(session.user.id);
		try {
			emitRealtimeEvent({
				type: "notification:read",
				payload: { unreadCount: await NotificationService.getUnreadCount(session.user.id) },
				target: { users: [session.user.id] }
			});
		} catch (error) {
			console.error("Erro ao emitir evento de marcar todas como lidas:", error);
		}
		return { success: true };
	} catch (error) {
		console.error("Erro ao marcar todas as notificações:", error);
		return {
			success: false,
			error: "Erro ao marcar todas as notificações"
		};
	}
}
/**
* Server Action para deletar notificação
*/
async function deleteNotification(data) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const validated = DeleteNotificationSchema.parse(data);
		const notification = await NotificationService.findById(validated.notificationId);
		if (!notification) return {
			success: false,
			error: "Notificação não encontrada"
		};
		if (notification.userId !== session.user.id) return {
			success: false,
			error: "Sem permissão para deletar esta notificação"
		};
		await NotificationService.deleteNotification(validated.notificationId);
		try {
			const unreadCount = await NotificationService.getUnreadCount(session.user.id);
			emitRealtimeEvent({
				type: "notification:refresh",
				payload: { reason: "deleted" },
				target: { users: [session.user.id] }
			});
			emitRealtimeEvent({
				type: "notification:read",
				payload: { unreadCount },
				target: { users: [session.user.id] }
			});
		} catch (error) {
			console.error("Erro ao emitir evento de deleção de notificação:", error);
		}
		return { success: true };
	} catch (error) {
		console.error("Erro ao deletar notificação:", error);
		return {
			success: false,
			error: "Erro ao deletar notificação"
		};
	}
}
getNotifications = /* @__PURE__ */ registerServerReference(getNotifications, "3eb2398ba3d9", "getNotifications");
getUnreadCount = /* @__PURE__ */ registerServerReference(getUnreadCount, "3eb2398ba3d9", "getUnreadCount");
getRecentNotifications = /* @__PURE__ */ registerServerReference(getRecentNotifications, "3eb2398ba3d9", "getRecentNotifications");
markNotificationAsRead = /* @__PURE__ */ registerServerReference(markNotificationAsRead, "3eb2398ba3d9", "markNotificationAsRead");
markAllNotificationsAsRead = /* @__PURE__ */ registerServerReference(markAllNotificationsAsRead, "3eb2398ba3d9", "markAllNotificationsAsRead");
deleteNotification = /* @__PURE__ */ registerServerReference(deleteNotification, "3eb2398ba3d9", "deleteNotification");
//#endregion
export { deleteNotification, getNotifications, getRecentNotifications, getUnreadCount, markAllNotificationsAsRead, markNotificationAsRead };
