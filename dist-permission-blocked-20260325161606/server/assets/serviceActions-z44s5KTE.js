import { o as __toESM } from "./chunk-D3zDcpJC.js";
import { i as registerServerReference } from "./encryption-runtime-CBVwOrRm.js";
import { n as require_next_auth, t as authOptions } from "./auth-Ps0x5MHh.js";
import { n as ServiceFiltersSchema } from "./serviceSchemas-BWw2jOiA.js";
import { t as ServiceService } from "./serviceService-oxunMZsR.js";
import { a as serializeService, c as serializeServicesResult, s as serializeServices } from "./serializers-D_85L3hs.js";
//#region src/server/serviceActions.ts
var import_next_auth = /* @__PURE__ */ __toESM(require_next_auth());
/**
* Server Action para buscar serviços disponíveis
*/
async function getServices(filters) {
	try {
		const validatedFilters = filters ? ServiceFiltersSchema.parse(filters) : {
			active: true,
			page: 1,
			limit: 50
		};
		return {
			success: true,
			data: serializeServicesResult(await ServiceService.findMany(validatedFilters))
		};
	} catch (error) {
		console.error("Erro ao buscar serviços:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Server Action para buscar serviços ativos (para formulários)
*/
async function getActiveServices() {
	try {
		return {
			success: true,
			data: serializeServices(await ServiceService.findActive())
		};
	} catch (error) {
		console.error("Erro ao buscar serviços ativos:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Server Action para buscar serviço por ID
*/
async function getServiceById(id) {
	try {
		const service = await ServiceService.findById(id);
		if (!service) return {
			success: false,
			error: "Serviço não encontrado"
		};
		return {
			success: true,
			data: serializeService(service)
		};
	} catch (error) {
		console.error("Erro ao buscar serviço:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Server Action para verificar disponibilidade de um serviço para uma data
*/
async function checkServiceAvailability(serviceId, date) {
	try {
		return {
			success: true,
			data: await ServiceService.checkAvailabilityForDate(serviceId, date)
		};
	} catch (error) {
		console.error("Erro ao verificar disponibilidade:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Server Action para buscar estatísticas de um serviço (admin/barber)
*/
async function getServiceStats(serviceId) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		if (!["ADMIN", "BARBER"].includes(session.user.role)) return {
			success: false,
			error: "Sem permissão para visualizar estatísticas"
		};
		return {
			success: true,
			data: await ServiceService.getServiceStats(serviceId)
		};
	} catch (error) {
		console.error("Erro ao buscar estatísticas:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Server Action para buscar serviços populares
*/
async function getPopularServices(limit = 5) {
	try {
		return {
			success: true,
			data: await ServiceService.findPopular(limit)
		};
	} catch (error) {
		console.error("Erro ao buscar serviços populares:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Server Action para buscar serviços com promoções ativas
*/
async function getServicesWithPromotions() {
	try {
		return {
			success: true,
			data: await ServiceService.findWithActivePromotions()
		};
	} catch (error) {
		console.error("Erro ao buscar serviços com promoções:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
getServices = /* @__PURE__ */ registerServerReference(getServices, "3594ff9ff0bf", "getServices");
getActiveServices = /* @__PURE__ */ registerServerReference(getActiveServices, "3594ff9ff0bf", "getActiveServices");
getServiceById = /* @__PURE__ */ registerServerReference(getServiceById, "3594ff9ff0bf", "getServiceById");
checkServiceAvailability = /* @__PURE__ */ registerServerReference(checkServiceAvailability, "3594ff9ff0bf", "checkServiceAvailability");
getServiceStats = /* @__PURE__ */ registerServerReference(getServiceStats, "3594ff9ff0bf", "getServiceStats");
getPopularServices = /* @__PURE__ */ registerServerReference(getPopularServices, "3594ff9ff0bf", "getPopularServices");
getServicesWithPromotions = /* @__PURE__ */ registerServerReference(getServicesWithPromotions, "3594ff9ff0bf", "getServicesWithPromotions");
//#endregion
export { checkServiceAvailability, getActiveServices, getPopularServices, getServiceById, getServiceStats, getServices, getServicesWithPromotions };
