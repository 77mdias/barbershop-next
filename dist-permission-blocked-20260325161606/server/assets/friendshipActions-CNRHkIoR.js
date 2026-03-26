import { o as __toESM } from "./chunk-D3zDcpJC.js";
import { i as registerServerReference } from "./encryption-runtime-CBVwOrRm.js";
import { n as require_next_auth, t as authOptions } from "./auth-Ps0x5MHh.js";
import { B as RespondFriendRequestSchema, H as UserSearchSchema, I as AcceptInviteSchema, L as BlockUserSchema, R as FriendshipFiltersSchema, V as SendFriendRequestSchema, et as FriendshipService, z as GenerateInviteCodeSchema } from "../index.js";
import { t as NotificationService } from "./notificationService-Baqvo8cp.js";
//#region src/server/friendshipActions.ts
var import_next_auth = /* @__PURE__ */ __toESM(require_next_auth());
/**
* Server Action para enviar solicitação de amizade
*/
async function sendFriendRequest(data) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const validated = SendFriendRequestSchema.parse(data);
		const request = await FriendshipService.sendFriendRequest(session.user.id, validated.receiverId);
		await NotificationService.createNotification(validated.receiverId, "FRIEND_REQUEST_RECEIVED", "Nova solicitação de amizade", `${session.user.name} enviou uma solicitação de amizade`, request.id, {
			senderName: session.user.name,
			senderId: session.user.id,
			senderImage: session.user.image
		});
		return {
			success: true,
			data: request
		};
	} catch (error) {
		console.error("Erro ao enviar solicitação de amizade:", error);
		if (error instanceof Error) return {
			success: false,
			error: error.message
		};
		return {
			success: false,
			error: "Erro ao enviar solicitação de amizade"
		};
	}
}
/**
* Server Action para responder solicitação de amizade
*/
async function respondFriendRequest(data) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const validated = RespondFriendRequestSchema.parse(data);
		const request = await FriendshipService.findRequestById(validated.requestId);
		if (!request) return {
			success: false,
			error: "Solicitação não encontrada"
		};
		if (request.receiverId !== session.user.id) return {
			success: false,
			error: "Você não tem permissão para responder esta solicitação"
		};
		let result;
		if (validated.action === "ACCEPT") {
			result = await FriendshipService.acceptFriendRequest(validated.requestId);
			await NotificationService.createNotification(request.senderId, "FRIEND_REQUEST_ACCEPTED", "Solicitação aceita!", `${session.user.name} aceitou sua solicitação de amizade`, validated.requestId, {
				accepterName: session.user.name,
				accepterId: session.user.id,
				accepterImage: session.user.image
			});
		} else result = await FriendshipService.rejectFriendRequest(validated.requestId);
		return {
			success: true,
			data: result
		};
	} catch (error) {
		console.error("Erro ao responder solicitação:", error);
		if (error instanceof Error) return {
			success: false,
			error: error.message
		};
		return {
			success: false,
			error: "Erro ao responder solicitação"
		};
	}
}
/**
* Server Action para cancelar solicitação de amizade enviada
*/
async function cancelFriendRequest(requestId) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		await FriendshipService.cancelFriendRequest(requestId, session.user.id);
		return { success: true };
	} catch (error) {
		console.error("Erro ao cancelar solicitação:", error);
		if (error instanceof Error) return {
			success: false,
			error: error.message
		};
		return {
			success: false,
			error: "Erro ao cancelar solicitação"
		};
	}
}
/**
* Server Action para remover amigo
*/
async function removeFriend(friendId) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		await FriendshipService.removeFriend(session.user.id, friendId);
		return { success: true };
	} catch (error) {
		console.error("Erro ao remover amigo:", error);
		if (error instanceof Error) return {
			success: false,
			error: error.message
		};
		return {
			success: false,
			error: "Erro ao remover amigo"
		};
	}
}
/**
* Server Action para bloquear/desbloquear usuário
*/
async function toggleBlockUser(data) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const validated = BlockUserSchema.parse(data);
		await FriendshipService.toggleBlockUser(session.user.id, validated.userId, validated.block);
		return { success: true };
	} catch (error) {
		console.error("Erro ao bloquear/desbloquear usuário:", error);
		if (error instanceof Error) return {
			success: false,
			error: error.message
		};
		return {
			success: false,
			error: "Erro ao processar bloqueio"
		};
	}
}
/**
* Server Action para listar amigos
*/
async function getFriends(filters) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const validatedFilters = filters ? FriendshipFiltersSchema.parse(filters) : {
			page: 1,
			limit: 20
		};
		const result = await FriendshipService.getFriends(session.user.id, validatedFilters);
		return {
			success: true,
			data: result.friends,
			pagination: result.pagination
		};
	} catch (error) {
		console.error("Erro ao buscar amigos:", error);
		return {
			success: false,
			error: "Erro ao buscar amigos"
		};
	}
}
/**
* Server Action para listar solicitações recebidas
*/
async function getReceivedRequests() {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		return {
			success: true,
			data: await FriendshipService.getReceivedRequests(session.user.id)
		};
	} catch (error) {
		console.error("Erro ao buscar solicitações:", error);
		return {
			success: false,
			error: "Erro ao buscar solicitações"
		};
	}
}
/**
* Server Action para listar solicitações enviadas
*/
async function getSentRequests() {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		return {
			success: true,
			data: await FriendshipService.getSentRequests(session.user.id)
		};
	} catch (error) {
		console.error("Erro ao buscar solicitações enviadas:", error);
		return {
			success: false,
			error: "Erro ao buscar solicitações enviadas"
		};
	}
}
/**
* Server Action para buscar sugestões de amigos
*/
async function getFriendSuggestions(limit = 10) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		return {
			success: true,
			data: await FriendshipService.getSuggestions(session.user.id, limit)
		};
	} catch (error) {
		console.error("Erro ao buscar sugestões:", error);
		return {
			success: false,
			error: "Erro ao buscar sugestões"
		};
	}
}
/**
* Server Action para buscar usuários
*/
async function searchUsers(filters) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const validated = UserSearchSchema.parse(filters);
		const result = await FriendshipService.searchUsers(session.user.id, validated);
		return {
			success: true,
			data: result.users,
			pagination: result.pagination
		};
	} catch (error) {
		console.error("Erro ao buscar usuários:", error);
		if (error instanceof Error) return {
			success: false,
			error: error.message
		};
		return {
			success: false,
			error: "Erro ao buscar usuários"
		};
	}
}
/**
* Server Action para gerar código de convite
*/
async function generateInviteCode(data) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const validated = data ? GenerateInviteCodeSchema.parse(data) : { regenerate: false };
		return {
			success: true,
			data: { inviteCode: await FriendshipService.generateInviteCode(session.user.id, validated.regenerate) }
		};
	} catch (error) {
		console.error("Erro ao gerar código de convite:", error);
		return {
			success: false,
			error: "Erro ao gerar código de convite"
		};
	}
}
/**
* Server Action para aceitar convite via código
*/
async function acceptInvite(data) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const validated = AcceptInviteSchema.parse(data);
		const inviter = await FriendshipService.findUserByInviteCode(validated.inviteCode);
		if (!inviter) return {
			success: false,
			error: "Código de convite inválido"
		};
		const result = await FriendshipService.acceptInvite(session.user.id, validated.inviteCode);
		await NotificationService.createNotification(inviter.id, "FRIEND_INVITE_USED", "Seu código foi usado!", `${session.user.name} usou seu código de convite`, session.user.id, {
			newFriendName: session.user.name,
			newFriendId: session.user.id,
			newFriendImage: session.user.image
		});
		return {
			success: true,
			data: result
		};
	} catch (error) {
		console.error("Erro ao aceitar convite:", error);
		if (error instanceof Error) return {
			success: false,
			error: error.message
		};
		return {
			success: false,
			error: "Erro ao aceitar convite"
		};
	}
}
/**
* Server Action para buscar estatísticas sociais
*/
async function getSocialStats() {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		return {
			success: true,
			data: await FriendshipService.getUserSocialStats(session.user.id)
		};
	} catch (error) {
		console.error("Erro ao buscar estatísticas:", error);
		return {
			success: false,
			error: "Erro ao buscar estatísticas"
		};
	}
}
sendFriendRequest = /* @__PURE__ */ registerServerReference(sendFriendRequest, "ecf484c486ec", "sendFriendRequest");
respondFriendRequest = /* @__PURE__ */ registerServerReference(respondFriendRequest, "ecf484c486ec", "respondFriendRequest");
cancelFriendRequest = /* @__PURE__ */ registerServerReference(cancelFriendRequest, "ecf484c486ec", "cancelFriendRequest");
removeFriend = /* @__PURE__ */ registerServerReference(removeFriend, "ecf484c486ec", "removeFriend");
toggleBlockUser = /* @__PURE__ */ registerServerReference(toggleBlockUser, "ecf484c486ec", "toggleBlockUser");
getFriends = /* @__PURE__ */ registerServerReference(getFriends, "ecf484c486ec", "getFriends");
getReceivedRequests = /* @__PURE__ */ registerServerReference(getReceivedRequests, "ecf484c486ec", "getReceivedRequests");
getSentRequests = /* @__PURE__ */ registerServerReference(getSentRequests, "ecf484c486ec", "getSentRequests");
getFriendSuggestions = /* @__PURE__ */ registerServerReference(getFriendSuggestions, "ecf484c486ec", "getFriendSuggestions");
searchUsers = /* @__PURE__ */ registerServerReference(searchUsers, "ecf484c486ec", "searchUsers");
generateInviteCode = /* @__PURE__ */ registerServerReference(generateInviteCode, "ecf484c486ec", "generateInviteCode");
acceptInvite = /* @__PURE__ */ registerServerReference(acceptInvite, "ecf484c486ec", "acceptInvite");
getSocialStats = /* @__PURE__ */ registerServerReference(getSocialStats, "ecf484c486ec", "getSocialStats");
//#endregion
export { acceptInvite, cancelFriendRequest, generateInviteCode, getFriendSuggestions, getFriends, getReceivedRequests, getSentRequests, getSocialStats, removeFriend, respondFriendRequest, searchUsers, sendFriendRequest, toggleBlockUser };
