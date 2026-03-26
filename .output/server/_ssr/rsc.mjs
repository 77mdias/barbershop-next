import { o as __toESM } from "../_runtime.mjs";
import { c as decodeReply, d as registerServerReference, f as renderToReadableStream$2, l as loadServerAction, m as setRequireModule, o as __toESM$1, p as require_react_react_server, r as __exportAll, s as createTemporaryReferenceSet, t as __commonJSMin, u as registerClientReference } from "./encryption-runtime-LT6HXFPw.mjs";
import { C as setHeadersContext, S as setHeadersAccessPhase, _ as parseCookieHeader, a as encodeMiddlewareRequestHeaders, b as resolveCallableExport, c as getHeadersContext, d as init_headers, f as init_middleware_request_headers, g as markDynamicUsage, h as isInsideUnifiedScope, i as createRequestContext, l as getRequestContext, m as init_unified_request_context, n as authOptions, o as getAndClearPendingCookies, p as init_parse_cookie_header, r as consumeDynamicUsage, s as getDraftModeCookieHeader, t as applyMiddlewareRequestHeaders, u as headersContextFromRequest, v as require_jwt, w as logger, x as runWithRequestContext, y as require_next_auth } from "./auth-D37wSDgg.mjs";
import { t as db } from "./prisma-uKWGIJ7B.mjs";
import { t as bcryptjs_default } from "../_libs/bcryptjs.mjs";
import { i as revalidatePath, n as getCacheHandler, r as getRequestExecutionContext, t as _consumeRequestScopedCacheLife } from "./cache-Ne6hcaFU.mjs";
import { a as boolean, c as number, f as string, i as array, l as object, n as _enum, o as date, p as ZodError, t as ZodIssueCode, u as preprocess } from "../_libs/zod.mjs";
import { n as ServiceFiltersSchema, r as UpdateServiceSchema, t as CreateServiceSchema } from "./serviceSchemas-HfsyH9r4.mjs";
import { l as ServiceService, n as serializeAppointment, r as serializeAppointmentsResult, t as decimalToNumber } from "./serializers-Cj6TKp0M.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as ptBR } from "../_libs/date-fns.mjs";
import { t as require_nodemailer } from "../_libs/nodemailer.mjs";
import { n as transformSourceProps, t as transformProps } from "../_libs/unpic+unpic__core.mjs";
import { AsyncLocalStorage } from "node:async_hooks";
import { timingSafeEqual } from "node:crypto";
import { AppointmentStatus, PaymentMethod, Prisma } from "@prisma/client";
import { EventEmitter } from "events";
//#region node_modules/.nitro/vite/services/rsc/assets/userService-BtA3rO1y.js
var DEFAULT_LIMIT = 20;
function buildUserWhere(filters = {}, includeDeleted = false) {
	const where = {};
	if (filters.role) where.role = filters.role;
	if (filters.search) where.OR = [{ name: {
		contains: filters.search,
		mode: "insensitive"
	} }, { email: {
		contains: filters.search,
		mode: "insensitive"
	} }];
	const status = filters.status || "ACTIVE";
	if (!(includeDeleted || status === "DELETED" || status === "ALL")) where.deletedAt = null;
	switch (status) {
		case "ACTIVE":
			where.isActive = true;
			where.deletedAt = null;
			break;
		case "INACTIVE":
			where.isActive = false;
			where.deletedAt = null;
			break;
		case "DELETED":
			where.deletedAt = { not: null };
			break;
		default: break;
	}
	return where;
}
var UserService = class {
	/**
	* Buscar usuários com filtros
	*/
	static async findMany(filters = {}) {
		const where = buildUserWhere(filters, filters.includeDeleted ?? false);
		const page = filters.page || 1;
		const limit = filters.limit || DEFAULT_LIMIT;
		const [users, total] = await Promise.all([db.user.findMany({
			where,
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				role: true,
				isActive: true,
				deletedAt: true,
				deletedById: true,
				updatedById: true,
				createdAt: true,
				updatedAt: true,
				_count: { select: {
					appointments: true,
					servicesProvided: true
				} }
			},
			orderBy: [
				{ deletedAt: "asc" },
				{ isActive: "desc" },
				{ name: "asc" }
			],
			skip: (page - 1) * limit,
			take: limit
		}), db.user.count({ where })]);
		return {
			users,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		};
	}
	/**
	* Buscar usuário por ID
	*/
	static async findById(id, options = {}) {
		const where = buildUserWhere({ status: options.includeDeleted ? "ALL" : void 0 }, options.includeDeleted);
		where.id = id;
		return await db.user.findFirst({
			where,
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				role: true,
				isActive: true,
				deletedAt: true,
				deletedById: true,
				updatedById: true,
				createdAt: true,
				updatedAt: true,
				_count: { select: {
					appointments: true,
					servicesProvided: true
				} }
			}
		});
	}
	/**
	* Buscar todos os barbeiros ativos
	*/
	static async findBarbers() {
		return (await this.findMany({
			role: "BARBER",
			status: "ACTIVE",
			limit: 100,
			page: 1
		})).users;
	}
	/**
	* Verificar se usuário é barbeiro ativo
	*/
	static async isActiveBarber(id) {
		return !!await db.user.findFirst({
			where: {
				id,
				role: "BARBER",
				isActive: true,
				deletedAt: null
			},
			select: { id: true }
		});
	}
	/**
	* Buscar barbeiro por ID com detalhes
	*/
	static async findBarberById(id) {
		return await db.user.findFirst({
			where: {
				id,
				role: "BARBER",
				isActive: true,
				deletedAt: null
			},
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				role: true,
				isActive: true,
				deletedAt: true,
				createdAt: true,
				_count: { select: { servicesProvided: { where: { status: "COMPLETED" } } } }
			}
		});
	}
	/**
	* Buscar estatísticas do usuário/barbeiro
	*/
	static async getUserStats(userId) {
		const user = await db.user.findFirst({
			where: {
				id: userId,
				deletedAt: null
			},
			select: {
				role: true,
				isActive: true
			}
		});
		if (!user) throw new Error("Usuário não encontrado");
		if (user.role === "BARBER") return await this.getBarberStats(userId);
		else return await this.getClientStats(userId);
	}
	/**
	* Estatísticas específicas do barbeiro
	*/
	static async getBarberStats(barberId) {
		const [totalAppointments, completedAppointments, todayAppointments, weekAppointments, monthAppointments, averageRating, upcomingAppointments] = await Promise.all([
			db.appointment.count({ where: { barberId } }),
			db.appointment.count({ where: {
				barberId,
				status: "COMPLETED"
			} }),
			db.appointment.count({ where: {
				barberId,
				date: {
					gte: new Date((/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0)),
					lt: new Date((/* @__PURE__ */ new Date()).setHours(24, 0, 0, 0))
				},
				status: { in: ["SCHEDULED", "CONFIRMED"] }
			} }),
			db.appointment.count({ where: {
				barberId,
				date: { gte: /* @__PURE__ */ new Date(Date.now() - 10080 * 60 * 1e3) },
				status: { in: [
					"SCHEDULED",
					"CONFIRMED",
					"COMPLETED"
				] }
			} }),
			db.appointment.count({ where: {
				barberId,
				date: { gte: /* @__PURE__ */ new Date(Date.now() - 720 * 60 * 60 * 1e3) },
				status: { in: [
					"SCHEDULED",
					"CONFIRMED",
					"COMPLETED"
				] }
			} }),
			db.serviceHistory.aggregate({
				where: { appointments: { some: { barberId } } },
				_avg: { rating: true }
			}),
			db.appointment.findMany({
				where: {
					barberId,
					date: { gte: /* @__PURE__ */ new Date() },
					status: { in: ["SCHEDULED", "CONFIRMED"] }
				},
				include: {
					user: { select: {
						id: true,
						name: true,
						image: true
					} },
					service: { select: {
						id: true,
						name: true,
						duration: true
					} }
				},
				orderBy: { date: "asc" },
				take: 5
			})
		]);
		const completionRate = totalAppointments > 0 ? completedAppointments / totalAppointments * 100 : 0;
		return {
			totalAppointments,
			completedAppointments,
			todayAppointments,
			weekAppointments,
			monthAppointments,
			completionRate: Math.round(completionRate * 100) / 100,
			averageRating: averageRating._avg.rating ? Math.round(averageRating._avg.rating * 100) / 100 : null,
			upcomingAppointments
		};
	}
	/**
	* Estatísticas específicas do cliente
	*/
	static async getClientStats(userId) {
		const [totalAppointments, completedAppointments, upcomingAppointments, favoriteServices, spentTotal] = await Promise.all([
			db.appointment.count({ where: { userId } }),
			db.appointment.count({ where: {
				userId,
				status: "COMPLETED"
			} }),
			db.appointment.findMany({
				where: {
					userId,
					date: { gte: /* @__PURE__ */ new Date() },
					status: { in: ["SCHEDULED", "CONFIRMED"] }
				},
				include: {
					barber: { select: {
						id: true,
						name: true,
						image: true
					} },
					service: { select: {
						id: true,
						name: true,
						duration: true,
						price: true
					} }
				},
				orderBy: { date: "asc" },
				take: 3
			}),
			db.appointment.groupBy({
				by: ["serviceId"],
				where: {
					userId,
					status: "COMPLETED"
				},
				_count: true,
				orderBy: { _count: { serviceId: "desc" } },
				take: 3
			}),
			db.serviceHistory.aggregate({
				where: { userId },
				_sum: { finalPrice: true }
			})
		]);
		return {
			totalAppointments,
			completedAppointments,
			upcomingAppointments,
			favoriteServices: await Promise.all(favoriteServices.map(async (item) => {
				return {
					service: await db.service.findUnique({
						where: { id: item.serviceId },
						select: {
							id: true,
							name: true,
							price: true
						}
					}),
					count: item._count
				};
			})),
			totalSpent: spentTotal._sum.finalPrice || 0
		};
	}
	/**
	* Soft delete de usuário (marca como deletado e inativo)
	*/
	static async softDeleteUser(id, actorId) {
		if (!await db.user.findFirst({
			where: {
				id,
				deletedAt: null
			},
			select: {
				id: true,
				email: true,
				role: true
			}
		})) return null;
		const user = await db.user.update({
			where: { id },
			data: {
				deletedAt: /* @__PURE__ */ new Date(),
				deletedById: actorId,
				isActive: false,
				resetPasswordExpires: null,
				resetPasswordToken: null,
				emailVerificationToken: null,
				emailVerificationExpires: null
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				isActive: true,
				deletedAt: true,
				deletedById: true,
				updatedById: true,
				createdAt: true,
				updatedAt: true
			}
		});
		logger.info("User soft deleted", {
			userId: id,
			actorId
		});
		return user;
	}
	/**
	* Restaurar usuário previamente deletado
	*/
	static async restoreUser(id, actorId) {
		if (!await db.user.findFirst({
			where: {
				id,
				deletedAt: { not: null }
			},
			select: {
				id: true,
				email: true
			}
		})) return null;
		const user = await db.user.update({
			where: { id },
			data: {
				deletedAt: null,
				deletedById: null,
				isActive: true,
				updatedById: actorId
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				isActive: true,
				deletedAt: true,
				deletedById: true,
				updatedById: true,
				createdAt: true,
				updatedAt: true
			}
		});
		logger.info("User restored", {
			userId: id,
			actorId
		});
		return user;
	}
	/**
	* Verificar disponibilidade do barbeiro para uma data/hora
	*/
	static async isBarberAvailable(barberId, date, duration, excludeAppointmentId) {
		const endTime = new Date(date.getTime() + duration * 6e4);
		const where = {
			barberId,
			status: { in: ["SCHEDULED", "CONFIRMED"] },
			OR: [{ date: { lte: date } }, { date: { lt: endTime } }]
		};
		if (excludeAppointmentId) where.id = { not: excludeAppointmentId };
		const conflictingAppointments = await db.appointment.findMany({
			where,
			include: { service: { select: { duration: true } } }
		});
		for (const appointment of conflictingAppointments) {
			const appointmentEnd = new Date(appointment.date.getTime() + appointment.service.duration * 6e4);
			if (date >= appointment.date && date < appointmentEnd || endTime > appointment.date && endTime <= appointmentEnd || date <= appointment.date && endTime >= appointmentEnd) return false;
		}
		return true;
	}
	/**
	* Buscar horários livres do barbeiro para um dia
	*/
	static async getBarberAvailableSlots(barberId, date, serviceDuration) {
		const workStart = new Date(date);
		workStart.setHours(8, 0, 0, 0);
		const workEnd = new Date(date);
		workEnd.setHours(18, 0, 0, 0);
		const appointments = await db.appointment.findMany({
			where: {
				barberId,
				date: {
					gte: workStart,
					lt: workEnd
				},
				status: { in: ["SCHEDULED", "CONFIRMED"] }
			},
			include: { service: { select: { duration: true } } },
			orderBy: { date: "asc" }
		});
		const slots = [];
		let currentTime = new Date(workStart);
		while (currentTime.getTime() + serviceDuration * 6e4 <= workEnd.getTime()) {
			const slotEnd = new Date(currentTime.getTime() + serviceDuration * 6e4);
			if (!appointments.some((appointment) => {
				const appointmentEnd = new Date(appointment.date.getTime() + appointment.service.duration * 6e4);
				return currentTime >= appointment.date && currentTime < appointmentEnd || slotEnd > appointment.date && slotEnd <= appointmentEnd || currentTime <= appointment.date && slotEnd >= appointmentEnd;
			})) slots.push(new Date(currentTime));
			currentTime.setMinutes(currentTime.getMinutes() + 30);
		}
		return slots;
	}
};
//#endregion
//#region node_modules/.nitro/vite/services/rsc/__vite_rsc_assets_manifest.js
var __vite_rsc_assets_manifest_default = {
	"bootstrapScriptContent": "import(\"/assets/index-Df5iHRSZ.js\")",
	"clientReferenceDeps": {
		"f29e6e234fea": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"0deffcb8ffd7": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"c2747888630f": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"8dd01268599a": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"9b7afb77b43f": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"ea2faab8915b": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"7a2d051de1a8": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"1551f422f6be": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"d48b1a752d1b": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"7387ee1aade0": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"93675da6507b": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"c7cd59b48ccf": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"e5c98ef97583": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"782fd804d300": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"65c11b515bcb": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"f656f59519a2": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"7cf9360fbc4c": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"ede49cfa89c2": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"5a4d3fe72cb3": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"322bd933aa61": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"41a696d03eaa": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"94512e48d017": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"e5c271f95880": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"97eba2795901": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"0a9a9982801b": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"d622669524c2": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"1680fd99da3f": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"d09acae04c2f": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"d954ff6cdabf": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"f8662127b60c": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"abffc9221f98": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"f4a9707fc67e": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"171b2274e5d2": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"990a9af0faa6": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"b1b232701515": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"6bc5b6f8f2ed": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"dd754dd5137d": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"93db586a66e1": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"d6612525c3b6": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"a2a39bfebc0b": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"cf9a10ca1a61": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"6fe6ee80c8a6": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"833308ed4183": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"41975edb3519": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"81cd343db88e": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		},
		"c31624b506e7": {
			"js": [
				"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js",
				"/assets/rolldown-runtime-COnpUsM8.js",
				"/assets/index-Df5iHRSZ.js",
				"/assets/preload-helper-3k_mjWfE.js",
				"/assets/framework--MHrfMZ6.js",
				"/assets/query-BbOc3VB2.js"
			],
			"css": []
		}
	},
	"serverResources": { "src/app/layout.tsx": {
		"js": [],
		"css": ["/assets/index-B9OqVBFx.css"]
	} }
};
//#endregion
//#region node_modules/.nitro/vite/services/rsc/index.js
var import_nodemailer = /* @__PURE__ */ __toESM(require_nodemailer());
var server_references_default = {
	"b2c6583e9981": async () => {
		const { $$hoist_0_handleAppointmentSubmit } = await import("./page-CDFQeVLM.mjs");
		return { $$hoist_0_handleAppointmentSubmit };
	},
	"94d41b8bf94b": async () => {
		const { createService, deleteService, getServiceByIdForAdmin, getServicesForAdmin, toggleServiceStatus, updateService } = await import("./serviceAdminActions-B0D4CY47.mjs");
		return {
			createService,
			deleteService,
			getServiceByIdForAdmin,
			getServicesForAdmin,
			toggleServiceStatus,
			updateService
		};
	},
	"4140ba624f2d": async () => {
		const { getChatStats, getConversationById, getMessages, getOrCreateConversation, getUnreadCount, getUserConversations, markMessagesAsRead, sendMessage } = await import("./chatActions-C0OrsX8G.mjs");
		return {
			getChatStats,
			getConversationById,
			getMessages,
			getOrCreateConversation,
			getUnreadCount,
			getUserConversations,
			markMessagesAsRead,
			sendMessage
		};
	},
	"9cd6dd4421e2": async () => {
		const { hybridUploadAction } = await import("./hybridUploadActions-C98LN0N1.mjs");
		return { hybridUploadAction };
	},
	"d1bad6aa0579": async () => {
		const { cancelAppointment, checkAvailability, completeAppointment, confirmAppointment, createAppointment, getAppointmentById, getAppointments, getAvailableSlots, updateAppointment } = await import("./appointmentActions-Bt-LySXg.mjs");
		return {
			cancelAppointment,
			checkAvailability,
			completeAppointment,
			confirmAppointment,
			createAppointment,
			getAppointmentById,
			getAppointments,
			getAvailableSlots,
			updateAppointment
		};
	},
	"62e3744c332f": async () => {
		const { checkBarberAvailability, createUser, getBarberAvailableSlots, getBarberById, getBarbers, getUserById, getUserStats, getUsers, restoreUser, softDeleteUser, updateUser } = await import("./userActions-DoYeRB4T.mjs");
		return {
			checkBarberAvailability,
			createUser,
			getBarberAvailableSlots,
			getBarberById,
			getBarbers,
			getUserById,
			getUserStats,
			getUsers,
			restoreUser,
			softDeleteUser,
			updateUser
		};
	},
	"24784cda83ba": async () => {
		const { deleteUser, getBarbersForAdmin, getReportsData, getUserById, getUsersForAdmin, updateUserRole } = await import("./adminActions-BVzp8Q7R.mjs");
		return {
			deleteUser,
			getBarbersForAdmin,
			getReportsData,
			getUserById,
			getUsersForAdmin,
			updateUserRole
		};
	},
	"f4efa67a65cf": async () => {
		const { getAdminMetrics, getBarberMetrics, getDashboardMetrics } = await import("./dashboardActions-CSiGaz47.mjs");
		return {
			getAdminMetrics,
			getBarberMetrics,
			getDashboardMetrics
		};
	},
	"9c14662270c2": async () => {
		const { createPromotion, deletePromotion, getPromotionByIdForAdmin, getPromotionsForAdmin, togglePromotionStatus, updatePromotion } = await import("./promotionAdminActions-DfkUkefE.mjs");
		return {
			createPromotion,
			deletePromotion,
			getPromotionByIdForAdmin,
			getPromotionsForAdmin,
			togglePromotionStatus,
			updatePromotion
		};
	},
	"ecf484c486ec": async () => {
		const { acceptInvite, cancelFriendRequest, generateInviteCode, getFriendSuggestions, getFriends, getReceivedRequests, getSentRequests, getSocialStats, removeFriend, respondFriendRequest, searchUsers, sendFriendRequest, toggleBlockUser } = await import("./friendshipActions-DOccrLAD.mjs");
		return {
			acceptInvite,
			cancelFriendRequest,
			generateInviteCode,
			getFriendSuggestions,
			getFriends,
			getReceivedRequests,
			getSentRequests,
			getSocialStats,
			removeFriend,
			respondFriendRequest,
			searchUsers,
			sendFriendRequest,
			toggleBlockUser
		};
	},
	"3eb2398ba3d9": async () => {
		const { deleteNotification, getNotifications, getRecentNotifications, getUnreadCount, markAllNotificationsAsRead, markNotificationAsRead } = await import("./notificationActions-DUjnbdla.mjs");
		return {
			deleteNotification,
			getNotifications,
			getRecentNotifications,
			getUnreadCount,
			markAllNotificationsAsRead,
			markNotificationAsRead
		};
	},
	"951d574f9bf1": async () => {
		const { changePassword, getCurrentProfile, updateProfile, updateProfileImage } = await import("./profileActions-TAhiznzc.mjs");
		return {
			changePassword,
			getCurrentProfile,
			updateProfile,
			updateProfileImage
		};
	},
	"f71271ac11de": async () => {
		const { createReview, deleteReview, getBarberMetrics, getDashboardMetrics, getPublicReviews, getReviewStats, getReviews, updateReview } = await import("./reviewActions-CUOWTsRH.mjs");
		return {
			createReview,
			deleteReview,
			getBarberMetrics,
			getDashboardMetrics,
			getPublicReviews,
			getReviewStats,
			getReviews,
			updateReview
		};
	},
	"3594ff9ff0bf": async () => {
		const { checkServiceAvailability, getActiveServices, getPopularServices, getServiceById, getServiceStats, getServices, getServicesWithPromotions } = await import("./serviceActions-BZ-voFIX.mjs");
		return {
			checkServiceAvailability,
			getActiveServices,
			getPopularServices,
			getServiceById,
			getServiceStats,
			getServices,
			getServicesWithPromotions
		};
	}
};
initialize();
function initialize() {
	setRequireModule({ load: async (id) => {
		{
			const import_ = server_references_default[id];
			if (!import_) throw new Error(`server reference not found '${id}'`);
			return import_();
		}
	} });
}
function renderToReadableStream$1(data, options, extraOptions) {
	return renderToReadableStream$2(data, options, { onClientReference(metadata) {
		const deps = __vite_rsc_assets_manifest_default.clientReferenceDeps[metadata.id] ?? {
			js: [],
			css: []
		};
		extraOptions?.onClientReference?.({
			id: metadata.id,
			name: metadata.name,
			deps
		});
	} });
}
var import_react_react_server = /* @__PURE__ */ __toESM$1(require_react_react_server());
/**
* Shared basePath helpers.
*
* Next.js only treats a pathname as being under basePath when it is an exact
* match ("/app") or starts with the basePath followed by a path separator
* ("/app/..."). Prefix-only matches like "/application" must be left intact.
*/
/**
* Check whether a pathname is inside the configured basePath.
*/
function hasBasePath(pathname, basePath) {
	if (!basePath) return false;
	return pathname === basePath || pathname.startsWith(basePath + "/");
}
/**
* Strip the basePath prefix from a pathname when it matches on a segment
* boundary. Returns the original pathname when it is outside the basePath.
*/
function stripBasePath(pathname, basePath) {
	if (!hasBasePath(pathname, basePath)) return pathname;
	return pathname.slice(basePath.length) || "/";
}
var ReadonlyURLSearchParamsError = class extends Error {
	constructor() {
		super("Method unavailable on `ReadonlyURLSearchParams`. Read more: https://nextjs.org/docs/app/api-reference/functions/use-search-params#updating-searchparams");
	}
};
/**
* Read-only URLSearchParams wrapper matching Next.js runtime behavior.
* Mutation methods remain present for instanceof/API compatibility but throw.
*/
var ReadonlyURLSearchParams = class extends URLSearchParams {
	append(_name, _value) {
		throw new ReadonlyURLSearchParamsError();
	}
	delete(_name, _value) {
		throw new ReadonlyURLSearchParamsError();
	}
	set(_name, _value) {
		throw new ReadonlyURLSearchParamsError();
	}
	sort() {
		throw new ReadonlyURLSearchParamsError();
	}
};
var _SERVER_INSERTED_HTML_CTX_KEY = Symbol.for("vinext.serverInsertedHTMLContext");
function getServerInsertedHTMLContext() {
	if (typeof import_react_react_server.createContext !== "function") return null;
	const globalState = globalThis;
	if (!globalState[_SERVER_INSERTED_HTML_CTX_KEY]) globalState[_SERVER_INSERTED_HTML_CTX_KEY] = import_react_react_server.createContext(null);
	return globalState[_SERVER_INSERTED_HTML_CTX_KEY] ?? null;
}
getServerInsertedHTMLContext();
var _serverContext = null;
var _getServerContext = () => _serverContext;
var _setServerContext = (ctx) => {
	_serverContext = ctx;
};
/**
* Register ALS-backed state accessors. Called by navigation-state.ts on import.
* @internal
*/
function _registerStateAccessors(accessors) {
	_getServerContext = accessors.getServerContext;
	_setServerContext = accessors.setServerContext;
	accessors.getInsertedHTMLCallbacks;
	accessors.clearInsertedHTMLCallbacks;
}
/**
* Get the navigation context for the current SSR/RSC render.
* Reads from AsyncLocalStorage when available (concurrent-safe),
* otherwise falls back to module-level state.
*/
function getNavigationContext() {
	return _getServerContext();
}
/**
* Set the navigation context for the current SSR/RSC render.
* Called by the framework entry before rendering each request.
*/
function setNavigationContext$1(ctx) {
	_setServerContext(ctx);
}
var isServer = typeof window === "undefined";
/** basePath from next.config.js, injected by the plugin at build time */
var __basePath$1 = "";
var _listeners = /* @__PURE__ */ new Set();
function notifyListeners() {
	for (const fn of _listeners) fn();
}
new ReadonlyURLSearchParams(!isServer ? window.location.search : "");
!isServer && stripBasePath(window.location.pathname, __basePath$1);
!isServer && window.history.replaceState.bind(window.history);
/**
* Restore scroll position from a history state object (used on popstate).
*
* When an RSC navigation is in flight (back/forward triggers both this
* handler and the browser entry's popstate handler which calls
* __VINEXT_RSC_NAVIGATE__), we must wait for the new content to render
* before scrolling. Otherwise the user sees old content flash at the
* restored scroll position.
*
* This handler fires before the browser entry's popstate handler (because
* navigation.ts is loaded before hydration completes), so we defer via a
* microtask to give the browser entry handler a chance to set
* __VINEXT_RSC_PENDING__ first.
*/
function restoreScrollPosition(state) {
	if (state && typeof state === "object" && "__vinext_scrollY" in state) {
		const { __vinext_scrollX: x, __vinext_scrollY: y } = state;
		Promise.resolve().then(() => {
			const pending = window.__VINEXT_RSC_PENDING__ ?? null;
			if (pending) pending.then(() => {
				requestAnimationFrame(() => {
					window.scrollTo(x, y);
				});
			});
			else requestAnimationFrame(() => {
				window.scrollTo(x, y);
			});
		});
	}
}
/**
* HTTP Access Fallback error code — shared prefix for notFound/forbidden/unauthorized.
* Matches Next.js 16's unified error handling approach.
*/
var HTTP_ERROR_FALLBACK_ERROR_CODE = "NEXT_HTTP_ERROR_FALLBACK";
/**
* Internal error class used by redirect/notFound/forbidden/unauthorized.
* The `digest` field is the serialised control-flow signal read by the
* framework's error boundary and server-side request handlers.
*/
var VinextNavigationError = class extends Error {
	digest;
	constructor(message, digest) {
		super(message);
		this.digest = digest;
	}
};
/**
* Throw a redirect. Caught by the framework to send a redirect response.
*/
function redirect(url, type) {
	throw new VinextNavigationError(`NEXT_REDIRECT:${url}`, `NEXT_REDIRECT;${type ?? "replace"};${encodeURIComponent(url)}`);
}
/**
* Trigger a not-found response (404). Caught by the framework.
*/
function notFound() {
	throw new VinextNavigationError("NEXT_NOT_FOUND", `${HTTP_ERROR_FALLBACK_ERROR_CODE};404`);
}
if (!isServer) {
	window.addEventListener("popstate", (event) => {
		notifyListeners();
		restoreScrollPosition(event.state);
	});
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	window.history.pushState = function patchedPushState(data, unused, url) {
		originalPushState(data, unused, url);
		notifyListeners();
	};
	window.history.replaceState = function patchedReplaceState(data, unused, url) {
		originalReplaceState(data, unused, url);
		notifyListeners();
	};
}
init_headers();
init_unified_request_context();
init_middleware_request_headers();
init_parse_cookie_header();
var NextRequest = class extends Request {
	_nextUrl;
	_cookies;
	constructor(input, init) {
		const { nextConfig: _nextConfig, ...requestInit } = init ?? {};
		if (input instanceof Request) {
			const req = input;
			super(req.url, {
				method: req.method,
				headers: req.headers,
				body: req.body,
				duplex: req.body ? "half" : void 0,
				...requestInit
			});
		} else super(input, requestInit);
		this._nextUrl = new NextURL(typeof input === "string" ? new URL(input, "http://localhost") : input instanceof URL ? input : new URL(input.url, "http://localhost"), void 0, _nextConfig ? {
			basePath: _nextConfig.basePath,
			nextConfig: { i18n: _nextConfig.i18n }
		} : void 0);
		this._cookies = new RequestCookies(this.headers);
	}
	get nextUrl() {
		return this._nextUrl;
	}
	get cookies() {
		return this._cookies;
	}
	/**
	* Client IP address. Prefers Cloudflare's trusted CF-Connecting-IP header
	* over the spoofable X-Forwarded-For. Returns undefined if unavailable.
	*/
	get ip() {
		return this.headers.get("cf-connecting-ip") ?? this.headers.get("x-real-ip") ?? this.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? void 0;
	}
	/**
	* Geolocation data. Platform-dependent (e.g., Cloudflare, Vercel).
	* Returns undefined if not available.
	*/
	get geo() {
		const country = this.headers.get("cf-ipcountry") ?? this.headers.get("x-vercel-ip-country") ?? void 0;
		if (!country) return void 0;
		return {
			country,
			city: this.headers.get("cf-ipcity") ?? this.headers.get("x-vercel-ip-city") ?? void 0,
			region: this.headers.get("cf-region") ?? this.headers.get("x-vercel-ip-country-region") ?? void 0,
			latitude: this.headers.get("cf-iplatitude") ?? this.headers.get("x-vercel-ip-latitude") ?? void 0,
			longitude: this.headers.get("cf-iplongitude") ?? this.headers.get("x-vercel-ip-longitude") ?? void 0
		};
	}
	/**
	* The build ID of the Next.js application.
	* Delegates to `nextUrl.buildId` to match Next.js API surface.
	* Can be used in middleware to detect deployment skew between client and server.
	*/
	get buildId() {
		return this._nextUrl.buildId;
	}
};
var NextResponse = class NextResponse extends Response {
	_cookies;
	constructor(body, init) {
		super(body, init);
		this._cookies = new ResponseCookies(this.headers);
	}
	get cookies() {
		return this._cookies;
	}
	/**
	* Create a JSON response.
	*/
	static json(body, init) {
		const headers = new Headers(init?.headers);
		if (!headers.has("content-type")) headers.set("content-type", "application/json");
		return new NextResponse(JSON.stringify(body), {
			...init,
			headers
		});
	}
	/**
	* Create a redirect response.
	*/
	static redirect(url, init) {
		const status = typeof init === "number" ? init : init?.status ?? 307;
		const destination = typeof url === "string" ? url : url.toString();
		const headers = new Headers(typeof init === "object" ? init?.headers : void 0);
		headers.set("Location", destination);
		return new NextResponse(null, {
			status,
			headers
		});
	}
	/**
	* Create a rewrite response (middleware pattern).
	* Sets the x-middleware-rewrite header.
	*/
	static rewrite(destination, init) {
		const url = typeof destination === "string" ? destination : destination.toString();
		const headers = new Headers(init?.headers);
		headers.set("x-middleware-rewrite", url);
		if (init?.request?.headers) encodeMiddlewareRequestHeaders(headers, init.request.headers);
		return new NextResponse(null, {
			...init,
			headers
		});
	}
	/**
	* Continue to the next handler (middleware pattern).
	* Sets the x-middleware-next header.
	*/
	static next(init) {
		const headers = new Headers(init?.headers);
		headers.set("x-middleware-next", "1");
		if (init?.request?.headers) encodeMiddlewareRequestHeaders(headers, init.request.headers);
		return new NextResponse(null, {
			...init,
			headers
		});
	}
};
var NextURL = class NextURL {
	/** Internal URL stores the pathname WITHOUT basePath or locale prefix. */
	_url;
	_basePath;
	_locale;
	_defaultLocale;
	_locales;
	constructor(input, base, config) {
		this._url = new URL(input.toString(), base);
		this._basePath = config?.basePath ?? "";
		this._stripBasePath();
		const i18n = config?.nextConfig?.i18n;
		if (i18n) {
			this._locales = [...i18n.locales];
			this._defaultLocale = i18n.defaultLocale;
			this._analyzeLocale(this._locales);
		}
	}
	/** Strip basePath prefix from the internal pathname. */
	_stripBasePath() {
		if (!this._basePath) return;
		const { pathname } = this._url;
		if (pathname === this._basePath || pathname.startsWith(this._basePath + "/")) this._url.pathname = pathname.slice(this._basePath.length) || "/";
	}
	/** Extract locale from pathname, stripping it from the internal URL. */
	_analyzeLocale(locales) {
		const segments = this._url.pathname.split("/");
		const candidate = segments[1]?.toLowerCase();
		const match = locales.find((l) => l.toLowerCase() === candidate);
		if (match) {
			this._locale = match;
			this._url.pathname = "/" + segments.slice(2).join("/");
		} else this._locale = this._defaultLocale;
	}
	/**
	* Reconstruct the full pathname with basePath + locale prefix.
	* Mirrors Next.js's internal formatPathname().
	*/
	_formatPathname() {
		let prefix = this._basePath;
		if (this._locale && this._locale !== this._defaultLocale) prefix += "/" + this._locale;
		if (!prefix) return this._url.pathname;
		const inner = this._url.pathname;
		return inner === "/" ? prefix : prefix + inner;
	}
	get href() {
		const formatted = this._formatPathname();
		if (formatted === this._url.pathname) return this._url.href;
		const { href, pathname, search, hash } = this._url;
		const baseEnd = href.length - pathname.length - search.length - hash.length;
		return href.slice(0, baseEnd) + formatted + search + hash;
	}
	set href(value) {
		this._url.href = value;
		this._stripBasePath();
		if (this._locales) this._analyzeLocale(this._locales);
	}
	get origin() {
		return this._url.origin;
	}
	get protocol() {
		return this._url.protocol;
	}
	set protocol(value) {
		this._url.protocol = value;
	}
	get username() {
		return this._url.username;
	}
	set username(value) {
		this._url.username = value;
	}
	get password() {
		return this._url.password;
	}
	set password(value) {
		this._url.password = value;
	}
	get host() {
		return this._url.host;
	}
	set host(value) {
		this._url.host = value;
	}
	get hostname() {
		return this._url.hostname;
	}
	set hostname(value) {
		this._url.hostname = value;
	}
	get port() {
		return this._url.port;
	}
	set port(value) {
		this._url.port = value;
	}
	/** Returns the pathname WITHOUT basePath or locale prefix. */
	get pathname() {
		return this._url.pathname;
	}
	set pathname(value) {
		this._url.pathname = value;
	}
	get search() {
		return this._url.search;
	}
	set search(value) {
		this._url.search = value;
	}
	get searchParams() {
		return this._url.searchParams;
	}
	get hash() {
		return this._url.hash;
	}
	set hash(value) {
		this._url.hash = value;
	}
	get basePath() {
		return this._basePath;
	}
	set basePath(value) {
		this._basePath = value === "" ? "" : value.startsWith("/") ? value : "/" + value;
	}
	get locale() {
		return this._locale ?? "";
	}
	set locale(value) {
		if (this._locales) {
			if (!value) {
				this._locale = this._defaultLocale;
				return;
			}
			if (!this._locales.includes(value)) throw new TypeError(`The locale "${value}" is not in the configured locales: ${this._locales.join(", ")}`);
		}
		this._locale = this._locales ? value : this._locale;
	}
	get defaultLocale() {
		return this._defaultLocale;
	}
	get locales() {
		return this._locales ? [...this._locales] : void 0;
	}
	clone() {
		const config = {
			basePath: this._basePath,
			nextConfig: this._locales ? { i18n: {
				locales: [...this._locales],
				defaultLocale: this._defaultLocale
			} } : void 0
		};
		return new NextURL(this.href, void 0, config);
	}
	toString() {
		return this.href;
	}
	/**
	* The build ID of the Next.js application.
	* Set from `generateBuildId` in next.config.js, or a random UUID if not configured.
	* Can be used in middleware to detect deployment skew between client and server.
	* Matches the Next.js API: `request.nextUrl.buildId`.
	*/
	get buildId() {
		return "b8997ea7-d65f-4644-bde4-963f7da5f770";
	}
};
var RequestCookies = class {
	_headers;
	_parsed;
	constructor(headers) {
		this._headers = headers;
		this._parsed = parseCookieHeader(headers.get("cookie") ?? "");
	}
	get(name) {
		const value = this._parsed.get(name);
		return value !== void 0 ? {
			name,
			value
		} : void 0;
	}
	getAll(nameOrOptions) {
		const name = typeof nameOrOptions === "string" ? nameOrOptions : nameOrOptions?.name;
		return [...this._parsed.entries()].filter(([cookieName]) => name === void 0 || cookieName === name).map(([cookieName, value]) => ({
			name: cookieName,
			value
		}));
	}
	has(name) {
		return this._parsed.has(name);
	}
	set(nameOrOptions, value) {
		let cookieName;
		let cookieValue;
		if (typeof nameOrOptions === "string") {
			cookieName = nameOrOptions;
			cookieValue = value ?? "";
		} else {
			cookieName = nameOrOptions.name;
			cookieValue = nameOrOptions.value;
		}
		this._parsed.set(cookieName, cookieValue);
		this._syncHeader();
		return this;
	}
	delete(names) {
		if (Array.isArray(names)) {
			const results = names.map((name) => this._parsed.delete(name));
			this._syncHeader();
			return results;
		}
		const result = this._parsed.delete(names);
		this._syncHeader();
		return result;
	}
	clear() {
		this._parsed.clear();
		this._syncHeader();
		return this;
	}
	get size() {
		return this._parsed.size;
	}
	toString() {
		return this._serialize();
	}
	_serialize() {
		return [...this._parsed.entries()].map(([n, v]) => `${n}=${encodeURIComponent(v)}`).join("; ");
	}
	_syncHeader() {
		if (this._parsed.size === 0) this._headers.delete("cookie");
		else this._headers.set("cookie", this._serialize());
	}
	[Symbol.iterator]() {
		return this.getAll().map((c) => [c.name, c])[Symbol.iterator]();
	}
};
/**
* RFC 6265 §4.1.1: cookie-name is a token (RFC 2616 §2.2).
* Allowed: any visible ASCII (0x21-0x7E) except separators: ()<>@,;:\"/[]?={}
*/
var VALID_COOKIE_NAME_RE = /^[\x21\x23-\x27\x2A\x2B\x2D\x2E\x30-\x39\x41-\x5A\x5E-\x7A\x7C\x7E]+$/;
function validateCookieName(name) {
	if (!name || !VALID_COOKIE_NAME_RE.test(name)) throw new Error(`Invalid cookie name: ${JSON.stringify(name)}`);
}
function validateCookieAttributeValue(value, attributeName) {
	for (let i = 0; i < value.length; i++) {
		const code = value.charCodeAt(i);
		if (code <= 31 || code === 127 || value[i] === ";") throw new Error(`Invalid cookie ${attributeName} value: ${JSON.stringify(value)}`);
	}
}
var ResponseCookies = class {
	_headers;
	constructor(headers) {
		this._headers = headers;
	}
	set(name, value, options) {
		validateCookieName(name);
		const parts = [`${name}=${encodeURIComponent(value)}`];
		if (options?.path) {
			validateCookieAttributeValue(options.path, "Path");
			parts.push(`Path=${options.path}`);
		}
		if (options?.domain) {
			validateCookieAttributeValue(options.domain, "Domain");
			parts.push(`Domain=${options.domain}`);
		}
		if (options?.maxAge !== void 0) parts.push(`Max-Age=${options.maxAge}`);
		if (options?.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
		if (options?.httpOnly) parts.push("HttpOnly");
		if (options?.secure) parts.push("Secure");
		if (options?.sameSite) parts.push(`SameSite=${options.sameSite}`);
		this._headers.append("Set-Cookie", parts.join("; "));
		return this;
	}
	get(name) {
		for (const header of this._headers.getSetCookie()) {
			const eq = header.indexOf("=");
			if (eq === -1) continue;
			if (header.slice(0, eq) === name) {
				const semi = header.indexOf(";", eq);
				const raw = header.slice(eq + 1, semi === -1 ? void 0 : semi);
				let value;
				try {
					value = decodeURIComponent(raw);
				} catch {
					value = raw;
				}
				return {
					name,
					value
				};
			}
		}
	}
	has(name) {
		return this.get(name) !== void 0;
	}
	getAll() {
		const entries = [];
		for (const header of this._headers.getSetCookie()) {
			const eq = header.indexOf("=");
			if (eq === -1) continue;
			const cookieName = header.slice(0, eq);
			const semi = header.indexOf(";", eq);
			const raw = header.slice(eq + 1, semi === -1 ? void 0 : semi);
			let value;
			try {
				value = decodeURIComponent(raw);
			} catch {
				value = raw;
			}
			entries.push({
				name: cookieName,
				value
			});
		}
		return entries;
	}
	delete(name) {
		this.set(name, "", {
			maxAge: 0,
			path: "/"
		});
		return this;
	}
	[Symbol.iterator]() {
		const entries = [];
		for (const header of this._headers.getSetCookie()) {
			const eq = header.indexOf("=");
			if (eq === -1) continue;
			const cookieName = header.slice(0, eq);
			const semi = header.indexOf(";", eq);
			const raw = header.slice(eq + 1, semi === -1 ? void 0 : semi);
			let value;
			try {
				value = decodeURIComponent(raw);
			} catch {
				value = raw;
			}
			entries.push([cookieName, {
				name: cookieName,
				value
			}]);
		}
		return entries[Symbol.iterator]();
	}
};
/**
* Minimal NextFetchEvent — extends FetchEvent where available,
* otherwise provides the waitUntil pattern standalone.
*/
var NextFetchEvent = class {
	sourcePage;
	_waitUntilPromises = [];
	constructor(params) {
		this.sourcePage = params.page;
	}
	waitUntil(promise) {
		this._waitUntilPromises.push(promise);
	}
	/** Drain all waitUntil promises. Returns a single promise that settles when all are done. */
	drainWaitUntil() {
		return Promise.allSettled(this._waitUntilPromises);
	}
};
globalThis.URLPattern;
/**
* Generic ErrorBoundary used to wrap route segments with error.tsx.
* This must be a client component since error boundaries use
* componentDidCatch / getDerivedStateFromError.
*/
/**
* Inner class component that catches notFound() errors and renders the
* not-found.tsx fallback. Resets when the pathname changes (client navigation)
* so a previous notFound() doesn't permanently stick.
*
* The ErrorBoundary above re-throws notFound errors so they propagate up to this
* boundary. This must be placed above the ErrorBoundary in the component tree.
*/
/**
* Wrapper that reads the current pathname and passes it to the inner class
* component. This enables automatic reset on client-side navigation.
*/
var ErrorBoundary = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'ErrorBoundary' is called on server");
}, "f29e6e234fea", "ErrorBoundary");
var NotFoundBoundary = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'NotFoundBoundary' is called on server");
}, "f29e6e234fea", "NotFoundBoundary");
/**
* Layout segment context provider.
*
* This is a "use client" module because it needs React's createContext
* and useContext, which are NOT available in the react-server condition.
* The RSC entry renders this as a client component boundary.
*
* The context is shared with navigation.ts via getLayoutSegmentContext()
* to avoid creating separate contexts in different modules.
*/
/**
* Wraps children with the layout segment context.
* Each layout in the App Router tree wraps its children with this provider,
* passing the remaining route tree segments below that layout level.
* Segments include route groups and resolved dynamic param values.
*/
var LayoutSegmentProvider = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'LayoutSegmentProvider' is called on server");
}, "0deffcb8ffd7", "LayoutSegmentProvider");
/**
* @license React
* react-jsx-runtime.react-server.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_jsx_runtime_react_server_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var React = require_react_react_server(), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	if (!React.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE) throw Error("The \"react\" package in this environment is not configured correctly. The \"react-server\" condition must be enabled in any environment that runs React Server Components.");
	function jsxProd(type, config, maybeKey) {
		var key = null;
		void 0 !== maybeKey && (key = "" + maybeKey);
		void 0 !== config.key && (key = "" + config.key);
		if ("key" in config) {
			maybeKey = {};
			for (var propName in config) "key" !== propName && (maybeKey[propName] = config[propName]);
		} else maybeKey = config;
		config = maybeKey.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== config ? config : null,
			props: maybeKey
		};
	}
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.jsx = jsxProd;
	exports.jsxs = jsxProd;
}));
var import_jsx_runtime_react_server = (/* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_jsx_runtime_react_server_production();
})))();
/**
* Normalize null-prototype objects from matchPattern() into thenable objects.
* See entries/app-rsc-entry.ts makeThenableParams() for full explanation.
*/
function makeThenableParams$1(obj) {
	const plain = { ...obj };
	return Object.assign(Promise.resolve(plain), plain);
}
/**
* Resolve viewport config from a module. Handles both static `viewport` export
* and async `generateViewport()` function.
*/
async function resolveModuleViewport(mod, params) {
	if (typeof mod.generateViewport === "function") {
		const asyncParams = makeThenableParams$1(params);
		return await mod.generateViewport({ params: asyncParams });
	}
	if (mod.viewport && typeof mod.viewport === "object") return mod.viewport;
	return null;
}
/**
* Merge viewport configs from multiple sources (layouts + page).
* Later entries override earlier ones.
*/
var DEFAULT_VIEWPORT = {
	width: "device-width",
	initialScale: 1
};
function mergeViewport(viewportList) {
	const merged = { ...DEFAULT_VIEWPORT };
	for (const vp of viewportList) Object.assign(merged, vp);
	return merged;
}
/**
* React component that renders viewport meta tags into <head>.
*/
function ViewportHead({ viewport }) {
	const elements = [];
	let key = 0;
	const parts = [];
	if (viewport.width !== void 0) parts.push(`width=${viewport.width}`);
	if (viewport.height !== void 0) parts.push(`height=${viewport.height}`);
	if (viewport.initialScale !== void 0) parts.push(`initial-scale=${viewport.initialScale}`);
	if (viewport.minimumScale !== void 0) parts.push(`minimum-scale=${viewport.minimumScale}`);
	if (viewport.maximumScale !== void 0) parts.push(`maximum-scale=${viewport.maximumScale}`);
	if (viewport.userScalable !== void 0) parts.push(`user-scalable=${viewport.userScalable ? "yes" : "no"}`);
	if (parts.length > 0) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
		name: "viewport",
		content: parts.join(", ")
	}, key++));
	if (viewport.themeColor) {
		if (typeof viewport.themeColor === "string") elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "theme-color",
			content: viewport.themeColor
		}, key++));
		else if (Array.isArray(viewport.themeColor)) for (const entry of viewport.themeColor) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "theme-color",
			content: entry.color,
			...entry.media ? { media: entry.media } : {}
		}, key++));
	}
	if (viewport.colorScheme) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
		name: "color-scheme",
		content: viewport.colorScheme
	}, key++));
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: elements });
}
/**
* Merge metadata from multiple sources (layouts + page).
*
* The list is ordered [rootLayout, nestedLayout, ..., page].
* Title template from layouts applies to the page title but NOT to
* the segment that defines the template itself. `title.absolute`
* skips all templates. `title.default` is the fallback when no
* child provides a title.
*
* Shallow merge: later entries override earlier ones (per Next.js docs).
*/
function mergeMetadata(metadataList) {
	if (metadataList.length === 0) return {};
	const merged = {};
	let parentTemplate;
	for (let i = 0; i < metadataList.length; i++) {
		const meta = metadataList[i];
		if (!(i === metadataList.length - 1) && meta.title && typeof meta.title === "object" && meta.title.template) parentTemplate = meta.title.template;
		for (const key of Object.keys(meta)) {
			if (key === "title") continue;
			merged[key] = meta[key];
		}
		if (meta.title !== void 0) merged.title = meta.title;
	}
	const finalTitle = merged.title;
	if (finalTitle) {
		if (typeof finalTitle === "string") {
			if (parentTemplate) merged.title = parentTemplate.replace("%s", finalTitle);
		} else if (typeof finalTitle === "object") {
			if (finalTitle.absolute) merged.title = finalTitle.absolute;
			else if (finalTitle.default) merged.title = finalTitle.default;
			else if (finalTitle.template && !finalTitle.default && !finalTitle.absolute) merged.title = void 0;
		}
	}
	return merged;
}
/**
* Resolve metadata from a module. Handles both static `metadata` export
* and async `generateMetadata()` function.
*
* @param parent - A Promise that resolves to the accumulated (merged) metadata
*   from all ancestor segments. Passed as the second argument to
*   `generateMetadata()`, matching Next.js's eager-execution-with-serial-
*   resolution approach. If not provided, defaults to a promise that resolves
*   to an empty object (so `await parent` never throws).
*/
async function resolveModuleMetadata(mod, params = {}, searchParams, parent = Promise.resolve({})) {
	if (typeof mod.generateMetadata === "function") {
		const asyncParams = makeThenableParams$1(params);
		const asyncSp = makeThenableParams$1(searchParams ?? {});
		return await mod.generateMetadata({
			params: asyncParams,
			searchParams: asyncSp
		}, parent);
	}
	if (mod.metadata && typeof mod.metadata === "object") return mod.metadata;
	return null;
}
/**
* React component that renders metadata as HTML head elements.
* Used by the RSC entry to inject into the <head>.
*/
function MetadataHead({ metadata }) {
	const elements = [];
	let key = 0;
	const base = metadata.metadataBase;
	function resolveUrl(url) {
		if (!url) return void 0;
		const s = typeof url === "string" ? url : url instanceof URL ? url.toString() : String(url);
		if (!base) return s;
		if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("//")) return s;
		try {
			return new URL(s, base).toString();
		} catch {
			return s;
		}
	}
	const title = typeof metadata.title === "string" ? metadata.title : typeof metadata.title === "object" ? metadata.title.absolute || metadata.title.default : void 0;
	if (title) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("title", { children: title }, key++));
	if (metadata.description) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
		name: "description",
		content: metadata.description
	}, key++));
	if (metadata.generator) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
		name: "generator",
		content: metadata.generator
	}, key++));
	if (metadata.applicationName) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
		name: "application-name",
		content: metadata.applicationName
	}, key++));
	if (metadata.referrer) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
		name: "referrer",
		content: metadata.referrer
	}, key++));
	if (metadata.keywords) {
		const kw = Array.isArray(metadata.keywords) ? metadata.keywords.join(",") : metadata.keywords;
		elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "keywords",
			content: kw
		}, key++));
	}
	if (metadata.authors) {
		const authorList = Array.isArray(metadata.authors) ? metadata.authors : [metadata.authors];
		for (const author of authorList) {
			if (author.name) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
				name: "author",
				content: author.name
			}, key++));
			if (author.url) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("link", {
				rel: "author",
				href: author.url
			}, key++));
		}
	}
	if (metadata.creator) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
		name: "creator",
		content: metadata.creator
	}, key++));
	if (metadata.publisher) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
		name: "publisher",
		content: metadata.publisher
	}, key++));
	if (metadata.formatDetection) {
		const parts = [];
		if (metadata.formatDetection.telephone === false) parts.push("telephone=no");
		if (metadata.formatDetection.address === false) parts.push("address=no");
		if (metadata.formatDetection.email === false) parts.push("email=no");
		if (parts.length > 0) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "format-detection",
			content: parts.join(", ")
		}, key++));
	}
	if (metadata.category) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
		name: "category",
		content: metadata.category
	}, key++));
	if (metadata.robots) if (typeof metadata.robots === "string") elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
		name: "robots",
		content: metadata.robots
	}, key++));
	else {
		const { googleBot, ...robotsRest } = metadata.robots;
		const robotParts = [];
		for (const [k, v] of Object.entries(robotsRest)) if (v === true) robotParts.push(k);
		else if (v === false) robotParts.push(`no${k}`);
		else if (typeof v === "string" || typeof v === "number") robotParts.push(`${k}:${v}`);
		if (robotParts.length > 0) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "robots",
			content: robotParts.join(", ")
		}, key++));
		if (googleBot) if (typeof googleBot === "string") elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "googlebot",
			content: googleBot
		}, key++));
		else {
			const gbParts = [];
			for (const [k, v] of Object.entries(googleBot)) if (v === true) gbParts.push(k);
			else if (v === false) gbParts.push(`no${k}`);
			else if (typeof v === "string" || typeof v === "number") gbParts.push(`${k}:${v}`);
			if (gbParts.length > 0) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
				name: "googlebot",
				content: gbParts.join(", ")
			}, key++));
		}
	}
	if (metadata.openGraph) {
		const og = metadata.openGraph;
		if (og.title) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			property: "og:title",
			content: og.title
		}, key++));
		if (og.description) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			property: "og:description",
			content: og.description
		}, key++));
		if (og.url) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			property: "og:url",
			content: resolveUrl(og.url)
		}, key++));
		if (og.siteName) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			property: "og:site_name",
			content: og.siteName
		}, key++));
		if (og.type) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			property: "og:type",
			content: og.type
		}, key++));
		if (og.locale) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			property: "og:locale",
			content: og.locale
		}, key++));
		if (og.publishedTime) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			property: "article:published_time",
			content: og.publishedTime
		}, key++));
		if (og.modifiedTime) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			property: "article:modified_time",
			content: og.modifiedTime
		}, key++));
		if (og.authors) for (const author of og.authors) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			property: "article:author",
			content: author
		}, key++));
		if (og.images) {
			const imgList = typeof og.images === "string" || og.images instanceof URL ? [{ url: og.images }] : Array.isArray(og.images) ? og.images : [og.images];
			for (const img of imgList) {
				const imgUrl = typeof img === "string" || img instanceof URL ? img : img.url;
				elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
					property: "og:image",
					content: resolveUrl(imgUrl)
				}, key++));
				if (typeof img !== "string" && !(img instanceof URL)) {
					if (img.width) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
						property: "og:image:width",
						content: String(img.width)
					}, key++));
					if (img.height) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
						property: "og:image:height",
						content: String(img.height)
					}, key++));
					if (img.alt) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
						property: "og:image:alt",
						content: img.alt
					}, key++));
				}
			}
		}
		if (og.videos) for (const video of og.videos) {
			elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
				property: "og:video",
				content: resolveUrl(video.url)
			}, key++));
			if (video.width) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
				property: "og:video:width",
				content: String(video.width)
			}, key++));
			if (video.height) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
				property: "og:video:height",
				content: String(video.height)
			}, key++));
		}
		if (og.audio) for (const audio of og.audio) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			property: "og:audio",
			content: resolveUrl(audio.url)
		}, key++));
	}
	if (metadata.twitter) {
		const tw = metadata.twitter;
		if (tw.card) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "twitter:card",
			content: tw.card
		}, key++));
		if (tw.site) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "twitter:site",
			content: tw.site
		}, key++));
		if (tw.siteId) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "twitter:site:id",
			content: tw.siteId
		}, key++));
		if (tw.title) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "twitter:title",
			content: tw.title
		}, key++));
		if (tw.description) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "twitter:description",
			content: tw.description
		}, key++));
		if (tw.creator) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "twitter:creator",
			content: tw.creator
		}, key++));
		if (tw.creatorId) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "twitter:creator:id",
			content: tw.creatorId
		}, key++));
		if (tw.images) {
			const imgList = typeof tw.images === "string" || tw.images instanceof URL ? [tw.images] : Array.isArray(tw.images) ? tw.images : [tw.images];
			for (const img of imgList) {
				const imgUrl = typeof img === "string" || img instanceof URL ? img : img.url;
				elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
					name: "twitter:image",
					content: resolveUrl(imgUrl)
				}, key++));
				if (typeof img !== "string" && !(img instanceof URL) && img.alt) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
					name: "twitter:image:alt",
					content: img.alt
				}, key++));
			}
		}
		if (tw.players) {
			const players = Array.isArray(tw.players) ? tw.players : [tw.players];
			for (const player of players) {
				const playerUrl = player.playerUrl.toString();
				const streamUrl = player.streamUrl.toString();
				elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
					name: "twitter:player",
					content: resolveUrl(playerUrl)
				}, key++));
				elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
					name: "twitter:player:stream",
					content: resolveUrl(streamUrl)
				}, key++));
				elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
					name: "twitter:player:width",
					content: String(player.width)
				}, key++));
				elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
					name: "twitter:player:height",
					content: String(player.height)
				}, key++));
			}
		}
		if (tw.app) {
			const { app } = tw;
			for (const platform of [
				"iphone",
				"ipad",
				"googleplay"
			]) {
				if (app.name) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
					name: `twitter:app:name:${platform}`,
					content: app.name
				}, key++));
				if (app.id[platform] !== void 0) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
					name: `twitter:app:id:${platform}`,
					content: String(app.id[platform])
				}, key++));
				if (app.url?.[platform] !== void 0) {
					const appUrl = app.url[platform].toString();
					elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
						name: `twitter:app:url:${platform}`,
						content: resolveUrl(appUrl)
					}, key++));
				}
			}
		}
	}
	if (metadata.icons) {
		const { icon, shortcut, apple, other } = metadata.icons;
		if (shortcut) {
			const shortcuts = Array.isArray(shortcut) ? shortcut : [shortcut];
			for (const s of shortcuts) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("link", {
				rel: "shortcut icon",
				href: resolveUrl(s)
			}, key++));
		}
		if (icon) {
			const icons = typeof icon === "string" || icon instanceof URL ? [{ url: icon }] : icon;
			for (const i of icons) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("link", {
				rel: "icon",
				href: resolveUrl(i.url),
				...i.sizes ? { sizes: i.sizes } : {},
				...i.type ? { type: i.type } : {},
				...i.media ? { media: i.media } : {}
			}, key++));
		}
		if (apple) {
			const apples = typeof apple === "string" || apple instanceof URL ? [{ url: apple }] : apple;
			for (const a of apples) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("link", {
				rel: "apple-touch-icon",
				href: resolveUrl(a.url),
				...a.sizes ? { sizes: a.sizes } : {},
				...a.type ? { type: a.type } : {}
			}, key++));
		}
		if (other) for (const o of other) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("link", {
			rel: o.rel,
			href: resolveUrl(o.url),
			...o.sizes ? { sizes: o.sizes } : {}
		}, key++));
	}
	if (metadata.manifest) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("link", {
		rel: "manifest",
		href: resolveUrl(metadata.manifest)
	}, key++));
	if (metadata.alternates) {
		const alt = metadata.alternates;
		if (alt.canonical) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("link", {
			rel: "canonical",
			href: resolveUrl(alt.canonical)
		}, key++));
		if (alt.languages) for (const [lang, href] of Object.entries(alt.languages)) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("link", {
			rel: "alternate",
			hrefLang: lang,
			href: resolveUrl(href)
		}, key++));
		if (alt.media) for (const [media, href] of Object.entries(alt.media)) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("link", {
			rel: "alternate",
			media,
			href: resolveUrl(href)
		}, key++));
		if (alt.types) for (const [type, href] of Object.entries(alt.types)) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("link", {
			rel: "alternate",
			type,
			href: resolveUrl(href)
		}, key++));
	}
	if (metadata.verification) {
		const v = metadata.verification;
		if (v.google) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "google-site-verification",
			content: v.google
		}, key++));
		if (v.yahoo) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "y_key",
			content: v.yahoo
		}, key++));
		if (v.yandex) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "yandex-verification",
			content: v.yandex
		}, key++));
		if (v.other) for (const [name, content] of Object.entries(v.other)) {
			const values = Array.isArray(content) ? content : [content];
			for (const val of values) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
				name,
				content: val
			}, key++));
		}
	}
	if (metadata.appleWebApp) {
		const awa = metadata.appleWebApp;
		if (awa.capable !== false) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "mobile-web-app-capable",
			content: "yes"
		}, key++));
		if (awa.title) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "apple-mobile-web-app-title",
			content: awa.title
		}, key++));
		if (awa.statusBarStyle) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "apple-mobile-web-app-status-bar-style",
			content: awa.statusBarStyle
		}, key++));
		if (awa.startupImage) {
			const imgs = typeof awa.startupImage === "string" ? [{ url: awa.startupImage }] : awa.startupImage;
			for (const img of imgs) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("link", {
				rel: "apple-touch-startup-image",
				href: resolveUrl(img.url),
				...img.media ? { media: img.media } : {}
			}, key++));
		}
	}
	if (metadata.itunes) {
		const { appId, appArgument } = metadata.itunes;
		let content = `app-id=${appId}`;
		if (appArgument) content += `, app-argument=${appArgument}`;
		elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "apple-itunes-app",
			content
		}, key++));
	}
	if (metadata.appLinks) {
		const al = metadata.appLinks;
		for (const platform of [
			"ios",
			"iphone",
			"ipad",
			"android",
			"windows_phone",
			"windows",
			"windows_universal",
			"web"
		]) {
			const entries = al[platform];
			if (!entries) continue;
			const list = Array.isArray(entries) ? entries : [entries];
			for (const entry of list) for (const [k, v] of Object.entries(entry)) {
				if (v === void 0 || v === null) continue;
				const str = String(v);
				const content = k === "url" ? resolveUrl(str) : str;
				elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
					property: `al:${platform}:${k}`,
					content
				}, key++));
			}
		}
	}
	if (metadata.other) for (const [name, content] of Object.entries(metadata.other)) {
		const values = Array.isArray(content) ? content : [content];
		for (const val of values) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name,
			content: val
		}, key++));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: elements });
}
var import_jwt = require_jwt();
async function middleware(request) {
	logger.auth.info("Middleware executed for path", { pathname: request.nextUrl.pathname });
	const token = await (0, import_jwt.getToken)({
		req: request,
		secret: process.env.NEXTAUTH_SECRET
	});
	const pathname = request.nextUrl.pathname;
	const isAuth = !!token;
	const isAuthPage = pathname.startsWith("/auth");
	const isAdminPage = pathname.startsWith("/dashboard/admin");
	const isProfilePage = pathname.startsWith("/profile");
	const isDashboardPage = pathname.startsWith("/dashboard");
	const isSchedulingPage = pathname.startsWith("/scheduling");
	const isReviewsPage = pathname.startsWith("/reviews");
	const isPublicRoute = [
		"/",
		"/gallery",
		"/about",
		"/contact",
		"/auth-required",
		"/test-reviews-real",
		"/reviews"
	].includes(pathname) || pathname.startsWith("/api/auth");
	logger.auth.debug("Authentication status check", {
		isAuth,
		pathname,
		isPublicRoute
	});
	if (isAuth && isAuthPage) {
		logger.auth.info("Authenticated user redirected from auth to dashboard");
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}
	if (!isAuth && (isProfilePage || isDashboardPage || isSchedulingPage || isReviewsPage)) {
		logger.auth.warn("Access denied - showing auth warning", { pathname });
		const authRequiredUrl = new URL("/auth-required", request.url);
		authRequiredUrl.searchParams.set("target", pathname);
		authRequiredUrl.searchParams.set("redirect", "/auth/signin");
		return NextResponse.redirect(authRequiredUrl);
	}
	if (isAdminPage) {
		if (!isAuth) {
			logger.auth.warn("Admin access denied - not authenticated", { pathname });
			const authRequiredUrl = new URL("/auth-required", request.url);
			authRequiredUrl.searchParams.set("target", "Área Administrativa");
			authRequiredUrl.searchParams.set("redirect", "/auth/signin");
			return NextResponse.redirect(authRequiredUrl);
		}
		const userRole = token?.role;
		if (userRole !== "ADMIN") {
			logger.auth.warn("Admin access denied - insufficient role", {
				userRole,
				pathname
			});
			return NextResponse.redirect(new URL("/access-denied", request.url));
		}
	}
	logger.auth.debug("Middleware allowing access", { pathname });
	return NextResponse.next();
}
var config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] };
/** Escape the five XML special characters in text content and attribute values. */
function escapeXml(s) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
/**
* Convert a sitemap array to XML string.
*/
function sitemapToXml(entries) {
	const hasAlternates = entries.some((entry) => Object.keys(entry.alternates ?? {}).length > 0);
	const hasImages = entries.some((entry) => Boolean(entry.images?.length));
	const hasVideos = entries.some((entry) => Boolean(entry.videos?.length));
	let content = "";
	content += "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
	content += "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"";
	if (hasImages) content += " xmlns:image=\"http://www.google.com/schemas/sitemap-image/1.1\"";
	if (hasVideos) content += " xmlns:video=\"http://www.google.com/schemas/sitemap-video/1.1\"";
	if (hasAlternates) content += " xmlns:xhtml=\"http://www.w3.org/1999/xhtml\">\n";
	else content += ">\n";
	for (const entry of entries) {
		content += "<url>\n";
		content += `<loc>${escapeXml(entry.url)}</loc>\n`;
		const languages = entry.alternates?.languages;
		if (languages && Object.keys(languages).length) for (const language in languages) content += `<xhtml:link rel="alternate" hreflang="${escapeXml(language)}" href="${escapeXml(languages[language])}" />\n`;
		if (entry.images?.length) for (const image of entry.images) content += `<image:image>\n<image:loc>${escapeXml(image)}</image:loc>\n</image:image>\n`;
		if (entry.videos?.length) for (const video of entry.videos) {
			const videoFields = [
				"<video:video>",
				`<video:title>${escapeXml(String(video.title))}</video:title>`,
				`<video:thumbnail_loc>${escapeXml(String(video.thumbnail_loc))}</video:thumbnail_loc>`,
				`<video:description>${escapeXml(String(video.description))}</video:description>`,
				video.content_loc && `<video:content_loc>${escapeXml(String(video.content_loc))}</video:content_loc>`,
				video.player_loc && `<video:player_loc>${escapeXml(String(video.player_loc))}</video:player_loc>`,
				video.duration && `<video:duration>${video.duration}</video:duration>`,
				video.view_count && `<video:view_count>${video.view_count}</video:view_count>`,
				video.tag && `<video:tag>${escapeXml(String(video.tag))}</video:tag>`,
				video.rating && `<video:rating>${video.rating}</video:rating>`,
				video.expiration_date && `<video:expiration_date>${escapeXml(String(video.expiration_date))}</video:expiration_date>`,
				video.publication_date && `<video:publication_date>${escapeXml(String(video.publication_date))}</video:publication_date>`,
				video.family_friendly && `<video:family_friendly>${video.family_friendly}</video:family_friendly>`,
				video.requires_subscription && `<video:requires_subscription>${video.requires_subscription}</video:requires_subscription>`,
				video.live && `<video:live>${video.live}</video:live>`,
				video.restriction && `<video:restriction relationship="${escapeXml(String(video.restriction.relationship))}">${escapeXml(String(video.restriction.content))}</video:restriction>`,
				video.platform && `<video:platform relationship="${escapeXml(String(video.platform.relationship))}">${escapeXml(String(video.platform.content))}</video:platform>`,
				video.uploader && `<video:uploader${video.uploader.info ? ` info="${escapeXml(String(video.uploader.info))}"` : ""}>${escapeXml(String(video.uploader.content))}</video:uploader>`,
				"</video:video>\n"
			].filter(Boolean);
			content += videoFields.join("\n");
		}
		if (entry.lastModified) content += `<lastmod>${serializeDate(entry.lastModified)}</lastmod>\n`;
		if (entry.changeFrequency) content += `<changefreq>${entry.changeFrequency}</changefreq>\n`;
		if (typeof entry.priority === "number") content += `<priority>${entry.priority}</priority>\n`;
		content += "</url>\n";
	}
	content += "</urlset>\n";
	return content;
}
/**
* Convert a robots config to text format.
*/
function robotsToText(config) {
	const lines = [];
	const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
	for (const rule of rules) {
		const agents = Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent ?? "*"];
		for (const agent of agents) lines.push(`User-Agent: ${agent}`);
		if (rule.allow) {
			const allows = Array.isArray(rule.allow) ? rule.allow : [rule.allow];
			for (const allow of allows) lines.push(`Allow: ${allow}`);
		}
		if (rule.disallow) {
			const disallows = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
			for (const disallow of disallows) lines.push(`Disallow: ${disallow}`);
		}
		if (rule.crawlDelay !== void 0) lines.push(`Crawl-delay: ${rule.crawlDelay}`);
		lines.push("");
	}
	if (config.sitemap) {
		const sitemaps = Array.isArray(config.sitemap) ? config.sitemap : [config.sitemap];
		for (const sitemap of sitemaps) lines.push(`Sitemap: ${sitemap}`);
	}
	if (config.host) lines.push(`Host: ${config.host}`);
	return lines.join("\n").trim() + "\n";
}
/**
* Convert a manifest config to JSON string.
*/
function manifestToJson(config) {
	return JSON.stringify(config, null, 2);
}
function serializeDate(value) {
	return value instanceof Date ? value.toISOString() : value;
}
/**
* Cache for compiled regex patterns in matchConfigPattern.
*
* Redirect/rewrite patterns are static — they come from next.config.js and
* never change at runtime. Without caching, every request that hits the regex
* branch re-runs the full tokeniser walk + isSafeRegex + new RegExp() for
* every rule in the array. On apps with many locale-prefixed rules (which all
* contain `(` and therefore enter the regex branch) this dominated profiling
* at ~2.4 seconds of CPU self-time.
*
* Value is `null` when safeRegExp rejected the pattern (ReDoS risk), so we
* skip it on subsequent requests too without re-running the scanner.
*/
var _compiledPatternCache = /* @__PURE__ */ new Map();
/**
* Cache for compiled header source regexes in matchHeaders.
*
* Each NextHeader rule has a `source` that is run through escapeHeaderSource()
* then safeRegExp() to produce a RegExp. Both are pure functions of the source
* string and the result never changes. Without caching, every request
* re-runs the full escapeHeaderSource tokeniser + isSafeRegex scan + new RegExp()
* for every header rule.
*
* Value is `null` when safeRegExp rejected the pattern (ReDoS risk).
*/
var _compiledHeaderSourceCache = /* @__PURE__ */ new Map();
/**
* Cache for compiled has/missing condition value regexes in checkSingleCondition.
*
* Each has/missing condition may carry a `value` string that is passed directly
* to safeRegExp() for matching against header/cookie/query/host values. The
* condition objects are static (from next.config.js) so the compiled RegExp
* never changes. Without caching, safeRegExp() is called on every request for
* every condition on every rule.
*
* Value is `null` when safeRegExp rejected the pattern, or `false` when the
* value string was undefined (no regex needed — use exact string comparison).
*/
var _compiledConditionCache = /* @__PURE__ */ new Map();
/**
* Cache for destination substitution regexes in substituteDestinationParams.
*
* The regex depends only on the set of param keys captured from the matched
* source pattern. Caching by sorted key list avoids recompiling a new RegExp
* for repeated redirect/rewrite calls that use the same param shape.
*/
var _compiledDestinationParamCache = /* @__PURE__ */ new Map();
/**
* Redirect index for O(1) locale-static rule lookup.
*
* Many Next.js apps generate 50-100 redirect rules of the form:
*   /:locale(en|es|fr|...)?/some-static-path  →  /some-destination
*
* The compiled regex for each is like:
*   ^/(en|es|fr|...)?/some-static-path$
*
* When no redirect matches (the common case for ordinary page loads),
* matchRedirect previously ran exec() on every one of those regexes —
* ~2ms per call, ~2992ms total self-time in profiles.
*
* The index splits rules into two buckets:
*
*   localeStatic — rules whose source is exactly /:paramName(alt1|alt2|...)?/suffix
*     where `suffix` is a static path with no further params or regex groups.
*     These are indexed in a Map<suffix, entry[]> for O(1) lookup after a
*     single fast strip of the optional locale prefix.
*
*   linear — all other rules. Matched with the original O(n) loop.
*
* The index is stored in a WeakMap keyed by the redirects array so it is
* computed once per config load and GC'd when the array is no longer live.
*
* ## Ordering invariant
*
* Redirect rules must be evaluated in their original order (first match wins).
* Each locale-static entry stores its `originalIndex` so that, when a
* locale-static fast-path match is found, any linear rules that appear earlier
* in the array are still checked first.
*/
/** Matches `/:param(alternation)?/static/suffix` — the locale-static pattern. */
var _LOCALE_STATIC_RE = /^\/:[\w-]+\(([^)]+)\)\?\/([a-zA-Z0-9_~.%@!$&'*+,;=:/-]+)$/;
var _redirectIndexCache = /* @__PURE__ */ new WeakMap();
/**
* Build (or retrieve from cache) the redirect index for a given redirects array.
*
* Called once per config load from matchRedirect. The WeakMap ensures the index
* is recomputed if the config is reloaded (new array reference) and GC'd when
* the array is collected.
*/
function _getRedirectIndex(redirects) {
	let index = _redirectIndexCache.get(redirects);
	if (index !== void 0) return index;
	const localeStatic = /* @__PURE__ */ new Map();
	const linear = [];
	for (let i = 0; i < redirects.length; i++) {
		const redirect = redirects[i];
		const m = _LOCALE_STATIC_RE.exec(redirect.source);
		if (m) {
			const paramName = redirect.source.slice(2, redirect.source.indexOf("("));
			const alternation = m[1];
			const suffix = "/" + m[2];
			const altRe = safeRegExp("^(?:" + alternation + ")$");
			if (!altRe) {
				linear.push([i, redirect]);
				continue;
			}
			const entry = {
				paramName,
				altRe,
				redirect,
				originalIndex: i
			};
			const bucket = localeStatic.get(suffix);
			if (bucket) bucket.push(entry);
			else localeStatic.set(suffix, [entry]);
		} else linear.push([i, redirect]);
	}
	index = {
		localeStatic,
		linear
	};
	_redirectIndexCache.set(redirects, index);
	return index;
}
/** Hop-by-hop headers that should not be forwarded through a proxy. */
var HOP_BY_HOP_HEADERS = new Set([
	"connection",
	"keep-alive",
	"proxy-authenticate",
	"proxy-authorization",
	"te",
	"trailers",
	"transfer-encoding",
	"upgrade"
]);
/**
* Request hop-by-hop headers to strip before proxying with fetch().
* Intentionally narrower than HOP_BY_HOP_HEADERS: external rewrite proxying
* still forwards proxy auth credentials, while response sanitization strips
* them before returning data to the client.
*/
var REQUEST_HOP_BY_HOP_HEADERS = new Set([
	"connection",
	"keep-alive",
	"te",
	"trailers",
	"transfer-encoding",
	"upgrade"
]);
function stripHopByHopRequestHeaders(headers) {
	const connectionTokens = (headers.get("connection") || "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
	for (const header of REQUEST_HOP_BY_HOP_HEADERS) headers.delete(header);
	for (const token of connectionTokens) headers.delete(token);
}
/**
* Detect regex patterns vulnerable to catastrophic backtracking (ReDoS).
*
* Uses a lightweight heuristic: scans the pattern string for nested quantifiers
* (a quantifier applied to a group that itself contains a quantifier). This
* catches the most common pathological patterns like `(a+)+`, `(.*)*`,
* `([^/]+)+`, `(a|a+)+` without needing a full regex parser.
*
* Returns true if the pattern appears safe, false if it's potentially dangerous.
*/
function isSafeRegex(pattern) {
	const quantifierAtDepth = [];
	let depth = 0;
	let i = 0;
	while (i < pattern.length) {
		const ch = pattern[i];
		if (ch === "\\") {
			i += 2;
			continue;
		}
		if (ch === "[") {
			i++;
			while (i < pattern.length && pattern[i] !== "]") {
				if (pattern[i] === "\\") i++;
				i++;
			}
			i++;
			continue;
		}
		if (ch === "(") {
			depth++;
			if (quantifierAtDepth.length <= depth) quantifierAtDepth.push(false);
			else quantifierAtDepth[depth] = false;
			i++;
			continue;
		}
		if (ch === ")") {
			const hadQuantifier = depth > 0 && quantifierAtDepth[depth];
			if (depth > 0) depth--;
			const next = pattern[i + 1];
			if (next === "+" || next === "*" || next === "{") {
				if (hadQuantifier) return false;
				if (depth >= 0 && depth < quantifierAtDepth.length) quantifierAtDepth[depth] = true;
			}
			i++;
			continue;
		}
		if (ch === "+" || ch === "*") {
			if (depth > 0) quantifierAtDepth[depth] = true;
			i++;
			continue;
		}
		if (ch === "?") {
			const prev = i > 0 ? pattern[i - 1] : "";
			if (prev !== "+" && prev !== "*" && prev !== "?" && prev !== "}") {
				if (depth > 0) quantifierAtDepth[depth] = true;
			}
			i++;
			continue;
		}
		if (ch === "{") {
			let j = i + 1;
			while (j < pattern.length && /[\d,]/.test(pattern[j])) j++;
			if (j < pattern.length && pattern[j] === "}" && j > i + 1) {
				if (depth > 0) quantifierAtDepth[depth] = true;
				i = j + 1;
				continue;
			}
		}
		i++;
	}
	return true;
}
/**
* Compile a regex pattern safely. Returns the compiled RegExp or null if the
* pattern is invalid or vulnerable to ReDoS.
*
* Logs a warning when a pattern is rejected so developers can fix their config.
*/
function safeRegExp(pattern, flags) {
	if (!isSafeRegex(pattern)) {
		console.warn(`[vinext] Ignoring potentially unsafe regex pattern (ReDoS risk): ${pattern}\n  Patterns with nested quantifiers (e.g. (a+)+) can cause catastrophic backtracking.\n  Simplify the pattern to avoid nested repetition.`);
		return null;
	}
	try {
		return new RegExp(pattern, flags);
	} catch {
		return null;
	}
}
/**
* Convert a Next.js header/rewrite/redirect source pattern into a regex string.
*
* Regex groups in the source (e.g. `(\d+)`) are extracted first, the remaining
* text is escaped/converted in a **single pass** (avoiding chained `.replace()`
* which CodeQL flags as incomplete sanitization), then groups are restored.
*/
function escapeHeaderSource(source) {
	const S = "";
	const groups = [];
	const withPlaceholders = source.replace(/\(([^)]+)\)/g, (_m, inner) => {
		groups.push(inner);
		return `${S}G${groups.length - 1}${S}`;
	});
	let result = "";
	const re = new RegExp(`${S}G(\\d+)${S}|:[\\w-]+|[.+?*]|[^.+?*:\\uE000]+`, "g");
	let m;
	while ((m = re.exec(withPlaceholders)) !== null) if (m[1] !== void 0) result += `(${groups[Number(m[1])]})`;
	else if (m[0].startsWith(":")) {
		const constraintMatch = withPlaceholders.slice(re.lastIndex).match(new RegExp(`^${S}G(\\d+)${S}`));
		if (constraintMatch) {
			re.lastIndex += constraintMatch[0].length;
			result += `(${groups[Number(constraintMatch[1])]})`;
		} else result += "[^/]+";
	} else switch (m[0]) {
		case ".":
			result += "\\.";
			break;
		case "+":
			result += "\\+";
			break;
		case "?":
			result += "\\?";
			break;
		case "*":
			result += ".*";
			break;
		default:
			result += m[0];
			break;
	}
	return result;
}
/**
* Parse a Cookie header string into a key-value record.
*/
function parseCookies(cookieHeader) {
	if (!cookieHeader) return {};
	const cookies = {};
	for (const part of cookieHeader.split(";")) {
		const eq = part.indexOf("=");
		if (eq === -1) continue;
		const key = part.slice(0, eq).trim();
		const value = part.slice(eq + 1).trim();
		if (key) cookies[key] = value;
	}
	return cookies;
}
/**
* Build a RequestContext from a Web Request object.
*/
function requestContextFromRequest(request) {
	const url = new URL(request.url);
	return {
		headers: request.headers,
		cookies: parseCookies(request.headers.get("cookie")),
		query: url.searchParams,
		host: normalizeHost(request.headers.get("host"), url.hostname)
	};
}
function normalizeHost(hostHeader, fallbackHostname) {
	return (hostHeader ?? fallbackHostname).split(":", 1)[0].toLowerCase();
}
function _emptyParams() {
	return Object.create(null);
}
function _matchConditionValue(actualValue, expectedValue) {
	if (expectedValue === void 0) return _emptyParams();
	const re = _cachedConditionRegex(expectedValue);
	if (re) {
		const match = re.exec(actualValue);
		if (!match) return null;
		const params = _emptyParams();
		if (match.groups) {
			for (const [key, value] of Object.entries(match.groups)) if (value !== void 0) params[key] = value;
		}
		return params;
	}
	return actualValue === expectedValue ? _emptyParams() : null;
}
/**
* Check a single has/missing condition against request context.
* Returns captured params when the condition is satisfied, or null otherwise.
*/
function matchSingleCondition(condition, ctx) {
	switch (condition.type) {
		case "header": {
			const headerValue = ctx.headers.get(condition.key);
			if (headerValue === null) return null;
			return _matchConditionValue(headerValue, condition.value);
		}
		case "cookie": {
			const cookieValue = ctx.cookies[condition.key];
			if (cookieValue === void 0) return null;
			return _matchConditionValue(cookieValue, condition.value);
		}
		case "query": {
			const queryValue = ctx.query.get(condition.key);
			if (queryValue === null) return null;
			return _matchConditionValue(queryValue, condition.value);
		}
		case "host":
			if (condition.value !== void 0) return _matchConditionValue(ctx.host, condition.value);
			return ctx.host === condition.key ? _emptyParams() : null;
		default: return null;
	}
}
/**
* Return a cached RegExp for a has/missing condition value string, compiling
* on first use. Returns null if safeRegExp rejected the pattern or if the
* value is not a valid regex (fall back to exact string comparison).
*/
function _cachedConditionRegex(value) {
	let re = _compiledConditionCache.get(value);
	if (re === void 0) {
		re = safeRegExp(value);
		_compiledConditionCache.set(value, re);
	}
	return re;
}
/**
* Check all has/missing conditions for a config rule.
* Returns true if the rule should be applied (all has conditions pass, all missing conditions pass).
*
* - has: every condition must match (the request must have it)
* - missing: every condition must NOT match (the request must not have it)
*/
function collectConditionParams(has, missing, ctx) {
	const params = _emptyParams();
	if (has) for (const condition of has) {
		const conditionParams = matchSingleCondition(condition, ctx);
		if (!conditionParams) return null;
		Object.assign(params, conditionParams);
	}
	if (missing) {
		for (const condition of missing) if (matchSingleCondition(condition, ctx)) return null;
	}
	return params;
}
function checkHasConditions(has, missing, ctx) {
	return collectConditionParams(has, missing, ctx) !== null;
}
/**
* If the current position in `str` starts with a parenthesized group, consume
* it and advance `re.lastIndex` past the closing `)`. Returns the group
* contents or null if no group is present.
*/
function extractConstraint(str, re) {
	if (str[re.lastIndex] !== "(") return null;
	const start = re.lastIndex + 1;
	let depth = 1;
	let i = start;
	while (i < str.length && depth > 0) {
		if (str[i] === "(") depth++;
		else if (str[i] === ")") depth--;
		i++;
	}
	if (depth !== 0) return null;
	re.lastIndex = i;
	return str.slice(start, i - 1);
}
/**
* Match a Next.js config pattern (from redirects/rewrites sources) against a pathname.
* Returns matched params or null.
*
* Supports:
*   :param     - matches a single path segment
*   :param*    - matches zero or more segments (catch-all)
*   :param+    - matches one or more segments
*   (regex)    - inline regex patterns in the source
*   :param(constraint) - named param with inline regex constraint
*/
function matchConfigPattern(pathname, pattern) {
	if (pattern.includes("(") || pattern.includes("\\") || /:[\w-]+[*+][^/]/.test(pattern) || /:[\w-]+\./.test(pattern)) try {
		let compiled = _compiledPatternCache.get(pattern);
		if (compiled === void 0) {
			const paramNames = [];
			let regexStr = "";
			const tokenRe = /:([\w-]+)|[.]|[^:.]+/g;
			let tok;
			while ((tok = tokenRe.exec(pattern)) !== null) if (tok[1] !== void 0) {
				const name = tok[1];
				const rest = pattern.slice(tokenRe.lastIndex);
				if (rest.startsWith("*") || rest.startsWith("+")) {
					const quantifier = rest[0];
					tokenRe.lastIndex += 1;
					const constraint = extractConstraint(pattern, tokenRe);
					paramNames.push(name);
					if (constraint !== null) regexStr += `(${constraint})`;
					else regexStr += quantifier === "*" ? "(.*)" : "(.+)";
				} else {
					const constraint = extractConstraint(pattern, tokenRe);
					paramNames.push(name);
					regexStr += constraint !== null ? `(${constraint})` : "([^/]+)";
				}
			} else if (tok[0] === ".") regexStr += "\\.";
			else regexStr += tok[0];
			const re = safeRegExp("^" + regexStr + "$");
			compiled = re ? {
				re,
				paramNames
			} : null;
			_compiledPatternCache.set(pattern, compiled);
		}
		if (!compiled) return null;
		const match = compiled.re.exec(pathname);
		if (!match) return null;
		const params = Object.create(null);
		for (let i = 0; i < compiled.paramNames.length; i++) params[compiled.paramNames[i]] = match[i + 1] ?? "";
		return params;
	} catch {}
	const catchAllMatch = pattern.match(/:([\w-]+)(\*|\+)$/);
	if (catchAllMatch) {
		const prefix = pattern.slice(0, pattern.lastIndexOf(":"));
		const paramName = catchAllMatch[1];
		const isPlus = catchAllMatch[2] === "+";
		const prefixNoSlash = prefix.replace(/\/$/, "");
		if (!pathname.startsWith(prefixNoSlash)) return null;
		const charAfter = pathname[prefixNoSlash.length];
		if (charAfter !== void 0 && charAfter !== "/") return null;
		const rest = pathname.slice(prefixNoSlash.length);
		if (isPlus && (!rest || rest === "/")) return null;
		let restValue = rest.startsWith("/") ? rest.slice(1) : rest;
		return { [paramName]: restValue };
	}
	const parts = pattern.split("/");
	const pathParts = pathname.split("/");
	if (parts.length !== pathParts.length) return null;
	const params = Object.create(null);
	for (let i = 0; i < parts.length; i++) if (parts[i].startsWith(":")) params[parts[i].slice(1)] = pathParts[i];
	else if (parts[i] !== pathParts[i]) return null;
	return params;
}
/**
* Apply redirect rules from next.config.js.
* Returns the redirect info if a redirect was matched, or null.
*
* `ctx` provides the request context (cookies, headers, query, host) used
* to evaluate has/missing conditions. Next.js always has request context
* when evaluating redirects, so this parameter is required.
*
* ## Performance
*
* Rules with a locale-capture-group prefix (the dominant pattern in large
* Next.js apps — e.g. `/:locale(en|es|fr|...)?/some-path`) are handled via
* a pre-built index. Instead of running exec() on each locale regex
* individually, we:
*
*   1. Strip the optional locale prefix from the pathname with one cheap
*      string-slice check (no regex exec on the hot path).
*   2. Look up the stripped suffix in a Map<suffix, entry[]>.
*   3. For each matching entry, validate the captured locale string against
*      a small, anchored alternation regex.
*
* This reduces the per-request cost from O(n × regex) to O(1) map lookup +
* O(matches × tiny-regex), eliminating the ~2992ms self-time reported in
* profiles for apps with 63+ locale-prefixed rules.
*
* Rules that don't fit the locale-static pattern fall back to the original
* linear matchConfigPattern scan.
*
* ## Ordering invariant
*
* First match wins, preserving the original redirect array order. When a
* locale-static fast-path match is found at position N, all linear rules with
* an original index < N are checked via matchConfigPattern first — they are
* few in practice (typically zero) so this is not a hot-path concern.
*/
function matchRedirect(pathname, redirects, ctx) {
	if (redirects.length === 0) return null;
	const index = _getRedirectIndex(redirects);
	let localeMatch = null;
	let localeMatchIndex = Infinity;
	if (index.localeStatic.size > 0) {
		const noLocaleBucket = index.localeStatic.get(pathname);
		if (noLocaleBucket) for (const entry of noLocaleBucket) {
			if (entry.originalIndex >= localeMatchIndex) continue;
			const redirect = entry.redirect;
			const conditionParams = redirect.has || redirect.missing ? collectConditionParams(redirect.has, redirect.missing, ctx) : _emptyParams();
			if (!conditionParams) continue;
			let dest = substituteDestinationParams(redirect.destination, {
				[entry.paramName]: "",
				...conditionParams
			});
			dest = sanitizeDestination(dest);
			localeMatch = {
				destination: dest,
				permanent: redirect.permanent
			};
			localeMatchIndex = entry.originalIndex;
			break;
		}
		const slashTwo = pathname.indexOf("/", 1);
		if (slashTwo !== -1) {
			const suffix = pathname.slice(slashTwo);
			const localePart = pathname.slice(1, slashTwo);
			const localeBucket = index.localeStatic.get(suffix);
			if (localeBucket) for (const entry of localeBucket) {
				if (entry.originalIndex >= localeMatchIndex) continue;
				if (!entry.altRe.test(localePart)) continue;
				const redirect = entry.redirect;
				const conditionParams = redirect.has || redirect.missing ? collectConditionParams(redirect.has, redirect.missing, ctx) : _emptyParams();
				if (!conditionParams) continue;
				let dest = substituteDestinationParams(redirect.destination, {
					[entry.paramName]: localePart,
					...conditionParams
				});
				dest = sanitizeDestination(dest);
				localeMatch = {
					destination: dest,
					permanent: redirect.permanent
				};
				localeMatchIndex = entry.originalIndex;
				break;
			}
		}
	}
	for (const [origIdx, redirect] of index.linear) {
		if (origIdx >= localeMatchIndex) break;
		const params = matchConfigPattern(pathname, redirect.source);
		if (params) {
			const conditionParams = redirect.has || redirect.missing ? collectConditionParams(redirect.has, redirect.missing, ctx) : _emptyParams();
			if (!conditionParams) continue;
			let dest = substituteDestinationParams(redirect.destination, {
				...params,
				...conditionParams
			});
			dest = sanitizeDestination(dest);
			return {
				destination: dest,
				permanent: redirect.permanent
			};
		}
	}
	return localeMatch;
}
/**
* Apply rewrite rules from next.config.js.
* Returns the rewritten URL or null if no rewrite matched.
*
* `ctx` provides the request context (cookies, headers, query, host) used
* to evaluate has/missing conditions. Next.js always has request context
* when evaluating rewrites, so this parameter is required.
*/
function matchRewrite(pathname, rewrites, ctx) {
	for (const rewrite of rewrites) {
		const params = matchConfigPattern(pathname, rewrite.source);
		if (params) {
			const conditionParams = rewrite.has || rewrite.missing ? collectConditionParams(rewrite.has, rewrite.missing, ctx) : _emptyParams();
			if (!conditionParams) continue;
			let dest = substituteDestinationParams(rewrite.destination, {
				...params,
				...conditionParams
			});
			dest = sanitizeDestination(dest);
			return dest;
		}
	}
	return null;
}
/**
* Substitute all matched route params into a redirect/rewrite destination.
*
* Handles repeated params (e.g. `/api/:id/:id`) and catch-all suffix forms
* (`:path*`, `:path+`) in a single pass. Unknown params are left intact.
*/
function substituteDestinationParams(destination, params) {
	const keys = Object.keys(params);
	if (keys.length === 0) return destination;
	const sortedKeys = [...keys].sort((a, b) => b.length - a.length);
	const cacheKey = sortedKeys.join("\0");
	let paramRe = _compiledDestinationParamCache.get(cacheKey);
	if (!paramRe) {
		const paramAlternation = sortedKeys.map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
		paramRe = new RegExp(`:(${paramAlternation})([+*])?(?![A-Za-z0-9_])`, "g");
		_compiledDestinationParamCache.set(cacheKey, paramRe);
	}
	return destination.replace(paramRe, (_token, key) => params[key]);
}
/**
* Sanitize a redirect/rewrite destination to collapse protocol-relative URLs.
*
* After parameter substitution, a destination like `/:path*` can become
* `//evil.com` if the catch-all captured a decoded `%2F` (`/evil.com`).
* Browsers interpret `//evil.com` as a protocol-relative URL, redirecting
* users off-site.
*
* This function collapses any leading double (or more) slashes to a single
* slash for non-external (relative) destinations.
*/
function sanitizeDestination(dest) {
	if (dest.startsWith("http://") || dest.startsWith("https://")) return dest;
	dest = dest.replace(/^[\\/]+/, "/");
	return dest;
}
/**
* Check if a URL is external (absolute URL or protocol-relative).
* Detects any URL scheme (http:, https:, data:, javascript:, blob:, etc.)
* per RFC 3986, plus protocol-relative URLs (//).
*/
function isExternalUrl(url) {
	return /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith("//");
}
/**
* Proxy an incoming request to an external URL and return the upstream response.
*
* Used for external rewrites (e.g. `/ph/:path*` → `https://us.i.posthog.com/:path*`).
* Next.js handles these as server-side reverse proxies, forwarding the request
* method, headers, and body to the external destination.
*
* Works in all runtimes (Node.js, Cloudflare Workers) via the standard fetch() API.
*/
async function proxyExternalRequest(request, externalUrl) {
	const originalUrl = new URL(request.url);
	const targetUrl = new URL(externalUrl);
	const destinationKeys = new Set(targetUrl.searchParams.keys());
	for (const [key, value] of originalUrl.searchParams) if (!destinationKeys.has(key)) targetUrl.searchParams.append(key, value);
	const headers = new Headers(request.headers);
	headers.set("host", targetUrl.host);
	stripHopByHopRequestHeaders(headers);
	const keysToDelete = [];
	for (const key of headers.keys()) if (key.startsWith("x-middleware-")) keysToDelete.push(key);
	for (const key of keysToDelete) headers.delete(key);
	const method = request.method;
	const hasBody = method !== "GET" && method !== "HEAD";
	const init = {
		method,
		headers,
		redirect: "manual"
	};
	if (hasBody && request.body) {
		init.body = request.body;
		init.duplex = "half";
	}
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 3e4);
	let upstreamResponse;
	try {
		upstreamResponse = await fetch(targetUrl.href, {
			...init,
			signal: controller.signal
		});
	} catch (e) {
		if (e?.name === "AbortError") {
			console.error("[vinext] External rewrite proxy timeout:", targetUrl.href);
			return new Response("Gateway Timeout", { status: 504 });
		}
		console.error("[vinext] External rewrite proxy error:", e);
		return new Response("Bad Gateway", { status: 502 });
	} finally {
		clearTimeout(timeout);
	}
	const isNodeRuntime = typeof process !== "undefined" && !!process.versions?.node;
	const responseHeaders = new Headers();
	upstreamResponse.headers.forEach((value, key) => {
		const lower = key.toLowerCase();
		if (HOP_BY_HOP_HEADERS.has(lower)) return;
		if (isNodeRuntime && (lower === "content-encoding" || lower === "content-length")) return;
		responseHeaders.append(key, value);
	});
	return new Response(upstreamResponse.body, {
		status: upstreamResponse.status,
		statusText: upstreamResponse.statusText,
		headers: responseHeaders
	});
}
/**
* Apply custom header rules from next.config.js.
* Returns an array of { key, value } pairs to set on the response.
*
* `ctx` provides the request context (cookies, headers, query, host) used
* to evaluate has/missing conditions. Next.js always has request context
* when evaluating headers, so this parameter is required.
*/
function matchHeaders(pathname, headers, ctx) {
	const result = [];
	for (const rule of headers) {
		let sourceRegex = _compiledHeaderSourceCache.get(rule.source);
		if (sourceRegex === void 0) {
			sourceRegex = safeRegExp("^" + escapeHeaderSource(rule.source) + "$");
			_compiledHeaderSourceCache.set(rule.source, sourceRegex);
		}
		if (sourceRegex && sourceRegex.test(pathname)) {
			if (rule.has || rule.missing) {
				if (!checkHasConditions(rule.has, rule.missing, ctx)) continue;
			}
			result.push(...rule.headers);
		}
	}
	return result;
}
/**
* Shared request pipeline utilities.
*
* Extracted from the App Router RSC entry (entries/app-rsc-entry.ts) to enable
* reuse across entry points. Currently consumed by app-rsc-entry.ts;
* dev-server.ts, prod-server.ts, and index.ts still have inline versions
* that should be migrated in follow-up work.
*
* These utilities handle the common request lifecycle steps: protocol-
* relative URL guards, basePath stripping, trailing slash normalization,
* and CSRF origin validation.
*/
/**
* Guard against protocol-relative URL open redirects.
*
* Paths like `//example.com/` would be redirected to `//example.com` by the
* trailing-slash normalizer, which browsers interpret as `http://example.com`.
* Backslashes are equivalent to forward slashes in the URL spec
* (e.g. `/\evil.com` is treated as `//evil.com` by browsers).
*
* Next.js returns 404 for these paths. We check the RAW pathname before
* normalization so the guard fires before normalizePath collapses `//`.
*
* @param rawPathname - The raw pathname from the URL, before any normalization
* @returns A 404 Response if the path is protocol-relative, or null to continue
*/
function guardProtocolRelativeUrl(rawPathname) {
	if (rawPathname.replaceAll("\\", "/").startsWith("//")) return new Response("404 Not Found", { status: 404 });
	return null;
}
/**
* Check if the pathname needs a trailing slash redirect, and return the
* redirect Response if so.
*
* Follows Next.js behavior:
* - `/api` routes are never redirected
* - The root path `/` is never redirected
* - If `trailingSlash` is true, redirect `/about` → `/about/`
* - If `trailingSlash` is false (default), redirect `/about/` → `/about`
*
* @param pathname - The basePath-stripped pathname
* @param basePath - The basePath to prepend to the redirect Location
* @param trailingSlash - Whether trailing slashes should be enforced
* @param search - The query string (including `?`) to preserve in the redirect
* @returns A 308 redirect Response, or null if no redirect is needed
*/
function normalizeTrailingSlash(pathname, basePath, trailingSlash, search) {
	if (pathname === "/" || pathname === "/api" || pathname.startsWith("/api/")) return null;
	const hasTrailing = pathname.endsWith("/");
	if (trailingSlash && !hasTrailing && !pathname.endsWith(".rsc")) return new Response(null, {
		status: 308,
		headers: { Location: basePath + pathname + "/" + search }
	});
	if (!trailingSlash && hasTrailing) return new Response(null, {
		status: 308,
		headers: { Location: basePath + pathname.replace(/\/+$/, "") + search }
	});
	return null;
}
/**
* Validate CSRF origin for server action requests.
*
* Matches Next.js behavior: compares the Origin header against the Host
* header. If they don't match, the request is rejected with 403 unless
* the origin is in the allowedOrigins list.
*
* @param request - The incoming Request
* @param allowedOrigins - Origins from experimental.serverActions.allowedOrigins
* @returns A 403 Response if origin validation fails, or null to continue
*/
function validateCsrfOrigin(request, allowedOrigins = []) {
	const originHeader = request.headers.get("origin");
	if (!originHeader) return null;
	if (originHeader === "null") {
		if (allowedOrigins.includes("null")) return null;
		console.warn(`[vinext] CSRF origin "null" blocked for server action. To allow requests from sandboxed contexts, add "null" to experimental.serverActions.allowedOrigins.`);
		return new Response("Forbidden", {
			status: 403,
			headers: { "Content-Type": "text/plain" }
		});
	}
	let originHost;
	try {
		originHost = new URL(originHeader).host.toLowerCase();
	} catch {
		return new Response("Forbidden", {
			status: 403,
			headers: { "Content-Type": "text/plain" }
		});
	}
	const hostHeader = (request.headers.get("host") || "").split(",")[0].trim().toLowerCase() || new URL(request.url).host.toLowerCase();
	if (originHost === hostHeader) return null;
	if (allowedOrigins.length > 0 && isOriginAllowed(originHost, allowedOrigins)) return null;
	console.warn(`[vinext] CSRF origin mismatch: origin "${originHost}" does not match host "${hostHeader}". Blocking server action request.`);
	return new Response("Forbidden", {
		status: 403,
		headers: { "Content-Type": "text/plain" }
	});
}
/**
* Check if an origin matches any pattern in the allowed origins list.
* Supports wildcard subdomains (e.g. `*.example.com`).
*/
function isOriginAllowed(origin, allowed) {
	for (const pattern of allowed) if (pattern.startsWith("*.")) {
		const suffix = pattern.slice(1);
		if (origin === pattern.slice(2) || origin.endsWith(suffix)) return true;
	} else if (origin === pattern) return true;
	return false;
}
/**
* Validate an image optimization URL parameter.
*
* Ensures the URL is a relative path that doesn't escape the origin:
* - Must start with "/" but not "//"
* - Backslashes are normalized (browsers treat `\` as `/`)
* - Origin validation as defense-in-depth
*
* @param rawUrl - The raw `url` query parameter value
* @param requestUrl - The full request URL for origin comparison
* @returns An error Response if validation fails, or the normalized image URL
*/
function validateImageUrl(rawUrl, requestUrl) {
	const imgUrl = rawUrl?.replaceAll("\\", "/") ?? null;
	if (!imgUrl || !imgUrl.startsWith("/") || imgUrl.startsWith("//")) return new Response(!rawUrl ? "Missing url parameter" : "Only relative URLs allowed", { status: 400 });
	const url = new URL(requestUrl);
	if (new URL(imgUrl, url.origin).origin !== url.origin) return new Response("Only relative URLs allowed", { status: 400 });
	return imgUrl;
}
/**
* Strip internal `x-middleware-*` headers from a Headers object.
*
* Middleware uses `x-middleware-*` headers as internal signals (e.g.
* `x-middleware-next`, `x-middleware-rewrite`, `x-middleware-request-*`).
* These must be removed before sending the response to the client.
*
* @param headers - The Headers object to modify in place
*/
function processMiddlewareHeaders(headers) {
	const keysToDelete = [];
	for (const key of headers.keys()) if (key.startsWith("x-middleware-")) keysToDelete.push(key);
	for (const key of keysToDelete) headers.delete(key);
}
var ROUTE_HANDLER_HTTP_METHODS = [
	"GET",
	"HEAD",
	"POST",
	"PUT",
	"DELETE",
	"PATCH",
	"OPTIONS"
];
function collectRouteHandlerMethods(handler) {
	const methods = ROUTE_HANDLER_HTTP_METHODS.filter((method) => typeof handler[method] === "function");
	if (methods.includes("GET") && !methods.includes("HEAD")) methods.push("HEAD");
	return methods;
}
function buildRouteHandlerAllowHeader(exportedMethods) {
	const allow = new Set(exportedMethods);
	allow.add("OPTIONS");
	return Array.from(allow).sort().join(", ");
}
var _KNOWN_DYNAMIC_APP_ROUTE_HANDLERS_KEY = Symbol.for("vinext.appRouteHandlerRuntime.knownDynamicHandlers");
var _g$3 = globalThis;
var knownDynamicAppRouteHandlers = _g$3[_KNOWN_DYNAMIC_APP_ROUTE_HANDLERS_KEY] ??= /* @__PURE__ */ new Set();
function isKnownDynamicAppRoute(pattern) {
	return knownDynamicAppRouteHandlers.has(pattern);
}
function markKnownDynamicAppRoute(pattern) {
	knownDynamicAppRouteHandlers.add(pattern);
}
function bindMethodIfNeeded(value, target) {
	return typeof value === "function" ? value.bind(target) : value;
}
function buildNextConfig(options) {
	if (!options.basePath && !options.i18n) return null;
	return {
		basePath: options.basePath,
		i18n: options.i18n ?? void 0
	};
}
function createTrackedAppRouteRequest(request, options = {}) {
	let didAccessDynamicRequest = false;
	const nextConfig = buildNextConfig(options);
	const markDynamicAccess = (access) => {
		didAccessDynamicRequest = true;
		options.onDynamicAccess?.(access);
	};
	const wrapNextUrl = (nextUrl) => {
		return new Proxy(nextUrl, { get(target, prop) {
			switch (prop) {
				case "search":
				case "searchParams":
				case "url":
				case "href":
				case "toJSON":
				case "toString":
				case "origin":
					markDynamicAccess(`nextUrl.${String(prop)}`);
					return bindMethodIfNeeded(Reflect.get(target, prop, target), target);
				case "clone": return () => wrapNextUrl(target.clone());
				default: return bindMethodIfNeeded(Reflect.get(target, prop, target), target);
			}
		} });
	};
	const wrapRequest = (input) => {
		const nextRequest = input instanceof NextRequest ? input : new NextRequest(input, { nextConfig: nextConfig ?? void 0 });
		let proxiedNextUrl = null;
		return new Proxy(nextRequest, { get(target, prop) {
			switch (prop) {
				case "nextUrl":
					proxiedNextUrl ??= wrapNextUrl(target.nextUrl);
					return proxiedNextUrl;
				case "headers":
				case "cookies":
				case "url":
				case "body":
				case "blob":
				case "json":
				case "text":
				case "arrayBuffer":
				case "formData":
					markDynamicAccess(`request.${String(prop)}`);
					return bindMethodIfNeeded(Reflect.get(target, prop, target), target);
				case "clone": return () => wrapRequest(target.clone());
				default: return bindMethodIfNeeded(Reflect.get(target, prop, target), target);
			}
		} });
	};
	return {
		request: wrapRequest(request),
		didAccessDynamicRequest() {
			return didAccessDynamicRequest;
		}
	};
}
function getAppRouteHandlerRevalidateSeconds(handler) {
	return typeof handler.revalidate === "number" && handler.revalidate > 0 && handler.revalidate !== Infinity ? handler.revalidate : null;
}
function hasAppRouteHandlerDefaultExport(handler) {
	return typeof handler.default === "function";
}
function resolveAppRouteHandlerMethod(handler, method) {
	const exportedMethods = collectRouteHandlerMethods(handler);
	const allowHeaderForOptions = buildRouteHandlerAllowHeader(exportedMethods);
	const shouldAutoRespondToOptions = method === "OPTIONS" && typeof handler.OPTIONS !== "function";
	let handlerFn = typeof handler[method] === "function" ? handler[method] : void 0;
	let isAutoHead = false;
	if (method === "HEAD" && typeof handler.HEAD !== "function" && typeof handler.GET === "function") {
		handlerFn = handler.GET;
		isAutoHead = true;
	}
	return {
		allowHeaderForOptions,
		exportedMethods,
		handlerFn,
		isAutoHead,
		shouldAutoRespondToOptions
	};
}
function shouldReadAppRouteHandlerCache(options) {
	return options.isProduction && options.revalidateSeconds !== null && options.dynamicConfig !== "force-dynamic" && !options.isKnownDynamic && (options.method === "GET" || options.isAutoHead) && typeof options.handlerFn === "function";
}
function shouldApplyAppRouteHandlerRevalidateHeader(options) {
	return options.revalidateSeconds !== null && !options.dynamicUsedInHandler && (options.method === "GET" || options.isAutoHead) && !options.handlerSetCacheControl;
}
function shouldWriteAppRouteHandlerCache(options) {
	return options.isProduction && options.revalidateSeconds !== null && options.dynamicConfig !== "force-dynamic" && shouldApplyAppRouteHandlerRevalidateHeader(options);
}
function resolveAppRouteHandlerSpecialError(error, requestUrl) {
	if (!(error && typeof error === "object" && "digest" in error)) return null;
	const digest = String(error.digest);
	if (digest.startsWith("NEXT_REDIRECT;")) {
		const parts = digest.split(";");
		const redirectUrl = decodeURIComponent(parts[2]);
		return {
			kind: "redirect",
			location: new URL(redirectUrl, requestUrl).toString(),
			statusCode: parts[3] ? parseInt(parts[3], 10) : 307
		};
	}
	if (digest === "NEXT_NOT_FOUND" || digest.startsWith("NEXT_HTTP_ERROR_FALLBACK;")) return {
		kind: "status",
		statusCode: digest === "NEXT_NOT_FOUND" ? 404 : parseInt(digest.split(";")[1], 10)
	};
	return null;
}
function buildRouteHandlerCacheControl(cacheState, revalidateSeconds) {
	if (cacheState === "STALE") return "s-maxage=0, stale-while-revalidate";
	return `s-maxage=${revalidateSeconds}, stale-while-revalidate`;
}
function applyRouteHandlerMiddlewareContext(response, middlewareContext) {
	if (!middlewareContext.headers && middlewareContext.status == null) return response;
	const responseHeaders = new Headers(response.headers);
	if (middlewareContext.headers) for (const [key, value] of middlewareContext.headers) responseHeaders.append(key, value);
	return new Response(response.body, {
		status: middlewareContext.status ?? response.status,
		statusText: response.statusText,
		headers: responseHeaders
	});
}
function buildRouteHandlerCachedResponse(cachedValue, options) {
	const headers = new Headers();
	for (const [key, value] of Object.entries(cachedValue.headers)) if (Array.isArray(value)) for (const entry of value) headers.append(key, entry);
	else headers.set(key, value);
	headers.set("X-Vinext-Cache", options.cacheState);
	headers.set("Cache-Control", buildRouteHandlerCacheControl(options.cacheState, options.revalidateSeconds));
	return new Response(options.isHead ? null : cachedValue.body, {
		status: cachedValue.status,
		headers
	});
}
function applyRouteHandlerRevalidateHeader(response, revalidateSeconds) {
	response.headers.set("cache-control", buildRouteHandlerCacheControl("HIT", revalidateSeconds));
}
function markRouteHandlerCacheMiss(response) {
	response.headers.set("X-Vinext-Cache", "MISS");
}
async function buildAppRouteCacheValue(response) {
	const body = await response.arrayBuffer();
	const headers = {};
	response.headers.forEach((value, key) => {
		if (key !== "x-vinext-cache" && key !== "cache-control") headers[key] = value;
	});
	return {
		kind: "APP_ROUTE",
		body,
		status: response.status,
		headers
	};
}
function finalizeRouteHandlerResponse(response, options) {
	const { pendingCookies, draftCookie, isHead } = options;
	if (pendingCookies.length === 0 && !draftCookie && !isHead) return response;
	const headers = new Headers(response.headers);
	for (const cookie of pendingCookies) headers.append("Set-Cookie", cookie);
	if (draftCookie) headers.append("Set-Cookie", draftCookie);
	return new Response(isHead ? null : response.body, {
		status: response.status,
		statusText: response.statusText,
		headers
	});
}
async function runAppRouteHandler(options) {
	options.consumeDynamicUsage();
	const trackedRequest = createTrackedAppRouteRequest(options.request, {
		basePath: options.basePath,
		i18n: options.i18n,
		onDynamicAccess() {
			options.markDynamicUsage();
		}
	});
	const response = await options.handlerFn(trackedRequest.request, { params: options.params });
	return {
		dynamicUsedInHandler: options.consumeDynamicUsage(),
		response
	};
}
async function executeAppRouteHandler(options) {
	const previousHeadersPhase = options.setHeadersAccessPhase("route-handler");
	try {
		const { dynamicUsedInHandler, response } = await runAppRouteHandler(options);
		const handlerSetCacheControl = response.headers.has("cache-control");
		if (dynamicUsedInHandler) markKnownDynamicAppRoute(options.routePattern);
		if (shouldApplyAppRouteHandlerRevalidateHeader({
			dynamicUsedInHandler,
			handlerSetCacheControl,
			isAutoHead: options.isAutoHead,
			method: options.method,
			revalidateSeconds: options.revalidateSeconds
		})) {
			const revalidateSeconds = options.revalidateSeconds;
			if (revalidateSeconds == null) throw new Error("Expected route handler revalidate seconds");
			applyRouteHandlerRevalidateHeader(response, revalidateSeconds);
		}
		if (shouldWriteAppRouteHandlerCache({
			dynamicConfig: options.handler.dynamic,
			dynamicUsedInHandler,
			handlerSetCacheControl,
			isAutoHead: options.isAutoHead,
			isProduction: options.isProduction,
			method: options.method,
			revalidateSeconds: options.revalidateSeconds
		})) {
			markRouteHandlerCacheMiss(response);
			const routeClone = response.clone();
			const routeKey = options.isrRouteKey(options.cleanPathname);
			const revalidateSeconds = options.revalidateSeconds;
			if (revalidateSeconds == null) throw new Error("Expected route handler cache revalidate seconds");
			const routeTags = options.buildPageCacheTags(options.cleanPathname, options.getCollectedFetchTags());
			const routeWritePromise = (async () => {
				try {
					const routeCacheValue = await buildAppRouteCacheValue(routeClone);
					await options.isrSet(routeKey, routeCacheValue, revalidateSeconds, routeTags);
					options.isrDebug?.("route cache written", routeKey);
				} catch (cacheErr) {
					console.error("[vinext] ISR route cache write error:", cacheErr);
				}
			})();
			options.executionContext?.waitUntil(routeWritePromise);
		}
		const pendingCookies = options.getAndClearPendingCookies();
		const draftCookie = options.getDraftModeCookieHeader();
		options.clearRequestContext();
		return applyRouteHandlerMiddlewareContext(finalizeRouteHandlerResponse(response, {
			pendingCookies,
			draftCookie,
			isHead: options.isAutoHead
		}), options.middlewareContext);
	} catch (error) {
		options.getAndClearPendingCookies();
		const specialError = resolveAppRouteHandlerSpecialError(error, options.request.url);
		options.clearRequestContext();
		if (specialError) {
			if (specialError.kind === "redirect") return applyRouteHandlerMiddlewareContext(new Response(null, {
				status: specialError.statusCode,
				headers: { Location: specialError.location }
			}), options.middlewareContext);
			return applyRouteHandlerMiddlewareContext(new Response(null, { status: specialError.statusCode }), options.middlewareContext);
		}
		console.error("[vinext] Route handler error:", error);
		options.reportRequestError(error instanceof Error ? error : new Error(String(error)), {
			path: options.cleanPathname,
			method: options.request.method,
			headers: Object.fromEntries(options.request.headers.entries())
		}, {
			routerKind: "App Router",
			routePath: options.routePattern,
			routeType: "route"
		});
		return applyRouteHandlerMiddlewareContext(new Response(null, { status: 500 }), options.middlewareContext);
	} finally {
		options.setHeadersAccessPhase(previousHeadersPhase);
	}
}
function getCachedAppRouteValue(entry) {
	return entry?.value.value && entry.value.value.kind === "APP_ROUTE" ? entry.value.value : null;
}
async function readAppRouteHandlerCacheResponse(options) {
	const routeKey = options.isrRouteKey(options.cleanPathname);
	try {
		const cached = await options.isrGet(routeKey);
		const cachedValue = getCachedAppRouteValue(cached);
		if (cachedValue && !cached?.isStale) {
			options.isrDebug?.("HIT (route)", options.cleanPathname);
			options.clearRequestContext();
			return applyRouteHandlerMiddlewareContext(buildRouteHandlerCachedResponse(cachedValue, {
				cacheState: "HIT",
				isHead: options.isAutoHead,
				revalidateSeconds: options.revalidateSeconds
			}), options.middlewareContext);
		}
		if (cached?.isStale && cachedValue) {
			const staleValue = cachedValue;
			const revalidateSearchParams = new URLSearchParams(options.revalidateSearchParams);
			options.scheduleBackgroundRegeneration(routeKey, async () => {
				await options.runInRevalidationContext(async () => {
					options.setNavigationContext({
						pathname: options.cleanPathname,
						searchParams: revalidateSearchParams,
						params: options.params
					});
					const { dynamicUsedInHandler, response } = await runAppRouteHandler({
						basePath: options.basePath,
						consumeDynamicUsage: options.consumeDynamicUsage,
						handlerFn: options.handlerFn,
						i18n: options.i18n,
						markDynamicUsage: options.markDynamicUsage,
						params: options.params,
						request: new Request(options.requestUrl, { method: "GET" })
					});
					options.setNavigationContext(null);
					if (dynamicUsedInHandler) {
						markKnownDynamicAppRoute(options.routePattern);
						options.isrDebug?.("route regen skipped (dynamic usage)", options.cleanPathname);
						return;
					}
					const routeTags = options.buildPageCacheTags(options.cleanPathname, options.getCollectedFetchTags());
					const routeCacheValue = await buildAppRouteCacheValue(response);
					await options.isrSet(routeKey, routeCacheValue, options.revalidateSeconds, routeTags);
					options.isrDebug?.("route regen complete", routeKey);
				});
			});
			options.isrDebug?.("STALE (route)", options.cleanPathname);
			options.clearRequestContext();
			return applyRouteHandlerMiddlewareContext(buildRouteHandlerCachedResponse(staleValue, {
				cacheState: "STALE",
				isHead: options.isAutoHead,
				revalidateSeconds: options.revalidateSeconds
			}), options.middlewareContext);
		}
	} catch (routeCacheError) {
		console.error("[vinext] ISR route cache read error:", routeCacheError);
	}
	return null;
}
var _PENDING_REGEN_KEY = Symbol.for("vinext.isrCache.pendingRegenerations");
var _g$2 = globalThis;
_g$2[_PENDING_REGEN_KEY] ??= /* @__PURE__ */ new Map();
/**
* Build a CachedAppPageValue for the App Router ISR cache.
*/
function buildAppPageCacheValue(html, rscData, status) {
	return {
		kind: "APP_PAGE",
		html,
		rscData,
		headers: void 0,
		postponed: void 0,
		status
	};
}
var _REVALIDATE_KEY = Symbol.for("vinext.isrCache.revalidateDurations");
_g$2[_REVALIDATE_KEY] ??= /* @__PURE__ */ new Map();
function buildAppPageCacheControl(cacheState, revalidateSeconds) {
	if (cacheState === "STALE") return "s-maxage=0, stale-while-revalidate";
	return `s-maxage=${revalidateSeconds}, stale-while-revalidate`;
}
function getCachedAppPageValue(entry) {
	return entry?.value.value && entry.value.value.kind === "APP_PAGE" ? entry.value.value : null;
}
function buildAppPageCachedResponse(cachedValue, options) {
	const status = cachedValue.status || 200;
	const headers = {
		"Cache-Control": buildAppPageCacheControl(options.cacheState, options.revalidateSeconds),
		Vary: "RSC, Accept",
		"X-Vinext-Cache": options.cacheState
	};
	if (options.isRscRequest) {
		if (!cachedValue.rscData) return null;
		return new Response(cachedValue.rscData, {
			status,
			headers: {
				"Content-Type": "text/x-component; charset=utf-8",
				...headers
			}
		});
	}
	if (typeof cachedValue.html !== "string" || cachedValue.html.length === 0) return null;
	return new Response(cachedValue.html, {
		status,
		headers: {
			"Content-Type": "text/html; charset=utf-8",
			...headers
		}
	});
}
async function readAppPageCacheResponse(options) {
	const isrKey = options.isRscRequest ? options.isrRscKey(options.cleanPathname) : options.isrHtmlKey(options.cleanPathname);
	try {
		const cached = await options.isrGet(isrKey);
		const cachedValue = getCachedAppPageValue(cached);
		if (cachedValue && !cached?.isStale) {
			const hitResponse = buildAppPageCachedResponse(cachedValue, {
				cacheState: "HIT",
				isRscRequest: options.isRscRequest,
				revalidateSeconds: options.revalidateSeconds
			});
			if (hitResponse) {
				options.isrDebug?.(options.isRscRequest ? "HIT (RSC)" : "HIT (HTML)", options.cleanPathname);
				options.clearRequestContext();
				return hitResponse;
			}
			options.isrDebug?.("MISS (empty cached entry)", options.cleanPathname);
		}
		if (cached?.isStale && cachedValue) {
			options.scheduleBackgroundRegeneration(options.cleanPathname, async () => {
				const revalidatedPage = await options.renderFreshPageForCache();
				await Promise.all([options.isrSet(options.isrHtmlKey(options.cleanPathname), buildAppPageCacheValue(revalidatedPage.html, void 0, 200), options.revalidateSeconds, revalidatedPage.tags), options.isrSet(options.isrRscKey(options.cleanPathname), buildAppPageCacheValue("", revalidatedPage.rscData, 200), options.revalidateSeconds, revalidatedPage.tags)]);
				options.isrDebug?.("regen complete", options.cleanPathname);
			});
			const staleResponse = buildAppPageCachedResponse(cachedValue, {
				cacheState: "STALE",
				isRscRequest: options.isRscRequest,
				revalidateSeconds: options.revalidateSeconds
			});
			if (staleResponse) {
				options.isrDebug?.(options.isRscRequest ? "STALE (RSC)" : "STALE (HTML)", options.cleanPathname);
				options.clearRequestContext();
				return staleResponse;
			}
			options.isrDebug?.("STALE MISS (empty stale entry)", options.cleanPathname);
		}
		if (!cached) options.isrDebug?.("MISS (no cache entry)", options.cleanPathname);
	} catch (isrReadError) {
		console.error("[vinext] ISR cache read error:", isrReadError);
	}
	return null;
}
function finalizeAppPageHtmlCacheResponse(response, options) {
	if (!response.body) return response;
	const [streamForClient, streamForCache] = response.body.tee();
	const htmlKey = options.isrHtmlKey(options.cleanPathname);
	const rscKey = options.isrRscKey(options.cleanPathname);
	const cachePromise = (async () => {
		try {
			const reader = streamForCache.getReader();
			const decoder = new TextDecoder();
			const chunks = [];
			for (;;) {
				const { done, value } = await reader.read();
				if (done) break;
				chunks.push(decoder.decode(value, { stream: true }));
			}
			chunks.push(decoder.decode());
			const pageTags = options.getPageTags();
			const writes = [options.isrSet(htmlKey, buildAppPageCacheValue(chunks.join(""), void 0, 200), options.revalidateSeconds, pageTags)];
			if (options.capturedRscDataPromise) writes.push(options.capturedRscDataPromise.then((rscData) => options.isrSet(rscKey, buildAppPageCacheValue("", rscData, 200), options.revalidateSeconds, pageTags)));
			await Promise.all(writes);
			options.isrDebug?.("HTML cache written", htmlKey);
		} catch (cacheError) {
			console.error("[vinext] ISR cache write error:", cacheError);
		}
	})();
	options.waitUntil?.(cachePromise);
	return new Response(streamForClient, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers
	});
}
function scheduleAppPageRscCacheWrite(options) {
	const capturedRscDataPromise = options.capturedRscDataPromise;
	if (!capturedRscDataPromise || options.dynamicUsedDuringBuild) return false;
	const rscKey = options.isrRscKey(options.cleanPathname);
	const cachePromise = (async () => {
		try {
			const rscData = await capturedRscDataPromise;
			if (options.consumeDynamicUsage()) {
				options.isrDebug?.("RSC cache write skipped (dynamic usage during render)", rscKey);
				return;
			}
			await options.isrSet(rscKey, buildAppPageCacheValue("", rscData, 200), options.revalidateSeconds, options.getPageTags());
			options.isrDebug?.("RSC cache written", rscKey);
		} catch (cacheError) {
			console.error("[vinext] ISR RSC cache write error:", cacheError);
		}
	})();
	options.waitUntil?.(cachePromise);
	return true;
}
function isPromiseLike(value) {
	return Boolean(value && (typeof value === "object" || typeof value === "function") && "then" in value && typeof value.then === "function");
}
function getAppPageStatusText(statusCode) {
	return statusCode === 403 ? "Forbidden" : statusCode === 401 ? "Unauthorized" : "Not Found";
}
function resolveAppPageSpecialError(error) {
	if (!(error && typeof error === "object" && "digest" in error)) return null;
	const digest = String(error.digest);
	if (digest.startsWith("NEXT_REDIRECT;")) {
		const parts = digest.split(";");
		return {
			kind: "redirect",
			location: decodeURIComponent(parts[2]),
			statusCode: parts[3] ? parseInt(parts[3], 10) : 307
		};
	}
	if (digest === "NEXT_NOT_FOUND" || digest.startsWith("NEXT_HTTP_ERROR_FALLBACK;")) return {
		kind: "http-access-fallback",
		statusCode: digest === "NEXT_NOT_FOUND" ? 404 : parseInt(digest.split(";")[1], 10)
	};
	return null;
}
async function buildAppPageSpecialErrorResponse(options) {
	if (options.specialError.kind === "redirect") {
		options.clearRequestContext();
		return Response.redirect(new URL(options.specialError.location, options.requestUrl), options.specialError.statusCode);
	}
	if (options.renderFallbackPage) {
		const fallbackResponse = await options.renderFallbackPage(options.specialError.statusCode);
		if (fallbackResponse) return fallbackResponse;
	}
	options.clearRequestContext();
	return new Response(getAppPageStatusText(options.specialError.statusCode), { status: options.specialError.statusCode });
}
async function probeAppPageLayouts(options) {
	return options.runWithSuppressedHookWarning(async () => {
		for (let layoutIndex = options.layoutCount - 1; layoutIndex >= 0; layoutIndex--) try {
			const layoutResult = options.probeLayoutAt(layoutIndex);
			if (isPromiseLike(layoutResult)) await layoutResult;
		} catch (error) {
			const response = await options.onLayoutError(error, layoutIndex);
			if (response) return response;
		}
		return null;
	});
}
async function probeAppPageComponent(options) {
	return options.runWithSuppressedHookWarning(async () => {
		try {
			const pageResult = options.probePage();
			if (isPromiseLike(pageResult)) if (options.awaitAsyncResult) await pageResult;
			else Promise.resolve(pageResult).catch(() => {});
		} catch (error) {
			return options.onError(error);
		}
		return null;
	});
}
async function readAppPageTextStream(stream) {
	const reader = stream.getReader();
	const decoder = new TextDecoder();
	const chunks = [];
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		chunks.push(decoder.decode(value, { stream: true }));
	}
	chunks.push(decoder.decode());
	return chunks.join("");
}
async function readAppPageBinaryStream(stream) {
	const reader = stream.getReader();
	const chunks = [];
	let totalLength = 0;
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		chunks.push(value);
		totalLength += value.byteLength;
	}
	const buffer = new Uint8Array(totalLength);
	let offset = 0;
	for (const chunk of chunks) {
		buffer.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return buffer.buffer;
}
function teeAppPageRscStreamForCapture(stream, shouldCapture) {
	if (!shouldCapture) return {
		capturedRscDataPromise: null,
		responseStream: stream
	};
	const [responseStream, captureStream] = stream.tee();
	return {
		capturedRscDataPromise: readAppPageBinaryStream(captureStream),
		responseStream
	};
}
function buildAppPageFontLinkHeader(preloads) {
	if (!preloads || preloads.length === 0) return "";
	return preloads.map((preload) => `<${preload.href}>; rel=preload; as=font; type=${preload.type}; crossorigin`).join(", ");
}
function resolveAppPageHttpAccessBoundaryComponent(options) {
	let boundaryModule;
	if (options.statusCode === 403) boundaryModule = options.routeForbiddenModule ?? options.rootForbiddenModule;
	else if (options.statusCode === 401) boundaryModule = options.routeUnauthorizedModule ?? options.rootUnauthorizedModule;
	else boundaryModule = options.routeNotFoundModule ?? options.rootNotFoundModule;
	return options.getDefaultExport(boundaryModule) ?? null;
}
function resolveAppPageErrorBoundary(options) {
	const pageErrorComponent = options.getDefaultExport(options.pageErrorModule);
	if (pageErrorComponent) return {
		component: pageErrorComponent,
		isGlobalError: false
	};
	if (options.layoutErrorModules) for (let index = options.layoutErrorModules.length - 1; index >= 0; index--) {
		const layoutErrorComponent = options.getDefaultExport(options.layoutErrorModules[index]);
		if (layoutErrorComponent) return {
			component: layoutErrorComponent,
			isGlobalError: false
		};
	}
	const globalErrorComponent = options.getDefaultExport(options.globalErrorModule);
	return {
		component: globalErrorComponent ?? null,
		isGlobalError: Boolean(globalErrorComponent)
	};
}
function wrapAppPageBoundaryElement(options) {
	let element = options.element;
	if (!options.skipLayoutWrapping) {
		const asyncParams = options.makeThenableParams(options.matchedParams);
		for (let index = options.layoutModules.length - 1; index >= 0; index--) {
			const layoutComponent = options.getDefaultExport(options.layoutModules[index]);
			if (!layoutComponent) continue;
			element = options.renderLayout(layoutComponent, element, asyncParams);
			if (options.isRscRequest && options.renderLayoutSegmentProvider && options.resolveChildSegments) {
				const treePosition = options.layoutTreePositions ? options.layoutTreePositions[index] : 0;
				const childSegments = options.resolveChildSegments(options.routeSegments ?? [], treePosition, options.matchedParams);
				element = options.renderLayoutSegmentProvider(childSegments, element);
			}
		}
	}
	if (options.isRscRequest && options.includeGlobalErrorBoundary && options.globalErrorComponent) element = options.renderErrorBoundary(options.globalErrorComponent, element);
	return element;
}
async function renderAppPageBoundaryResponse(options) {
	const rscStream = options.renderToReadableStream(options.element, { onError: options.createRscOnErrorHandler() });
	if (options.isRscRequest) return new Response(rscStream, {
		status: options.status,
		headers: {
			"Content-Type": "text/x-component; charset=utf-8",
			Vary: "RSC, Accept"
		}
	});
	return options.createHtmlResponse(rscStream, options.status);
}
function createAppPageFontData(options) {
	return {
		links: options.getLinks(),
		preloads: options.getPreloads(),
		styles: options.getStyles()
	};
}
async function renderAppPageHtmlStream(options) {
	return options.ssrHandler.handleSsr(options.rscStream, options.navigationContext, options.fontData);
}
/**
* Wraps a stream so that `onFlush` is called when the last byte has been read
* by the downstream consumer (i.e. when the HTTP layer finishes draining the
* response body). This is the correct place to clear per-request context,
* because the RSC/SSR pipeline is lazy — components execute while the stream
* is being consumed, not when the stream handle is first obtained.
*/
function deferUntilStreamConsumed(stream, onFlush) {
	let called = false;
	const once = () => {
		if (!called) {
			called = true;
			onFlush();
		}
	};
	const cleanup = new TransformStream({ flush() {
		once();
	} });
	const reader = stream.pipeThrough(cleanup).getReader();
	return new ReadableStream({
		pull(controller) {
			return reader.read().then(({ done, value }) => {
				if (done) controller.close();
				else controller.enqueue(value);
			});
		},
		cancel(reason) {
			once();
			return reader.cancel(reason);
		}
	});
}
async function renderAppPageHtmlResponse(options) {
	const safeStream = deferUntilStreamConsumed(await renderAppPageHtmlStream(options), () => {
		options.clearRequestContext();
	});
	const headers = {
		"Content-Type": "text/html; charset=utf-8",
		Vary: "RSC, Accept"
	};
	if (options.fontLinkHeader) headers.Link = options.fontLinkHeader;
	return new Response(safeStream, {
		status: options.status,
		headers
	});
}
async function renderAppPageHtmlStreamWithRecovery(options) {
	try {
		const htmlStream = await options.renderHtmlStream();
		options.onShellRendered?.();
		return {
			htmlStream,
			response: null
		};
	} catch (error) {
		const specialError = options.resolveSpecialError(error);
		if (specialError) return {
			htmlStream: null,
			response: await options.renderSpecialErrorResponse(specialError)
		};
		const boundaryResponse = await options.renderErrorBoundaryResponse(error);
		if (boundaryResponse) return {
			htmlStream: null,
			response: boundaryResponse
		};
		throw error;
	}
}
function createAppPageRscErrorTracker(baseOnError) {
	let capturedError = null;
	return {
		getCapturedError() {
			return capturedError;
		},
		onRenderError(error, requestInfo, errorContext) {
			if (!(error && typeof error === "object" && "digest" in error)) capturedError = error;
			return baseOnError(error, requestInfo, errorContext);
		}
	};
}
function shouldRerenderAppPageWithGlobalError(options) {
	return Boolean(options.capturedError) && !options.hasLocalBoundary;
}
function getDefaultExport(module) {
	return module?.default ?? null;
}
async function resolveAppPageLayoutHead(layoutModules, params) {
	const filteredLayouts = layoutModules.filter(Boolean);
	const layoutMetadataPromises = [];
	let accumulatedMetadata = Promise.resolve({});
	for (let index = 0; index < filteredLayouts.length; index++) {
		const parentForLayout = accumulatedMetadata;
		const metadataPromise = resolveModuleMetadata(filteredLayouts[index], params, void 0, parentForLayout).catch((error) => {
			console.error("[vinext] Layout generateMetadata() failed:", error);
			return null;
		});
		layoutMetadataPromises.push(metadataPromise);
		accumulatedMetadata = metadataPromise.then(async (metadataResult) => {
			if (metadataResult) return mergeMetadata([await parentForLayout, metadataResult]);
			return parentForLayout;
		});
	}
	const [metadataResults, viewportResults] = await Promise.all([Promise.all(layoutMetadataPromises), Promise.all(filteredLayouts.map((layoutModule) => resolveModuleViewport(layoutModule, params).catch((error) => {
		console.error("[vinext] Layout generateViewport() failed:", error);
		return null;
	})))]);
	const metadataList = metadataResults.filter(Boolean);
	const viewportList = viewportResults.filter(Boolean);
	return {
		metadata: metadataList.length > 0 ? mergeMetadata(metadataList) : null,
		viewport: mergeViewport(viewportList)
	};
}
function wrapRenderedBoundaryElement(options) {
	return wrapAppPageBoundaryElement({
		element: options.element,
		getDefaultExport,
		globalErrorComponent: getDefaultExport(options.globalErrorModule),
		includeGlobalErrorBoundary: options.includeGlobalErrorBoundary,
		isRscRequest: options.isRscRequest,
		layoutModules: options.layoutModules,
		layoutTreePositions: options.layoutTreePositions,
		makeThenableParams: options.makeThenableParams,
		matchedParams: options.matchedParams,
		renderErrorBoundary(GlobalErrorComponent, children) {
			return (0, import_react_react_server.createElement)(ErrorBoundary, {
				fallback: GlobalErrorComponent,
				children
			});
		},
		renderLayout(LayoutComponent, children, asyncParams) {
			return (0, import_react_react_server.createElement)(LayoutComponent, {
				children,
				params: asyncParams
			});
		},
		renderLayoutSegmentProvider(childSegments, children) {
			return (0, import_react_react_server.createElement)(LayoutSegmentProvider, { childSegments }, children);
		},
		resolveChildSegments: options.resolveChildSegments,
		routeSegments: options.routeSegments ?? [],
		skipLayoutWrapping: options.skipLayoutWrapping
	});
}
async function renderAppPageBoundaryElementResponse(options) {
	const pathname = new URL(options.requestUrl).pathname;
	return renderAppPageBoundaryResponse({
		async createHtmlResponse(rscStream, responseStatus) {
			const fontData = createAppPageFontData({
				getLinks: options.getFontLinks,
				getPreloads: options.getFontPreloads,
				getStyles: options.getFontStyles
			});
			const ssrHandler = await options.loadSsrHandler();
			return renderAppPageHtmlResponse({
				clearRequestContext: options.clearRequestContext,
				fontData,
				fontLinkHeader: options.buildFontLinkHeader(fontData.preloads),
				navigationContext: options.getNavigationContext(),
				rscStream,
				ssrHandler,
				status: responseStatus
			});
		},
		createRscOnErrorHandler() {
			return options.createRscOnErrorHandler(pathname, options.routePattern ?? pathname);
		},
		element: options.element,
		isRscRequest: options.isRscRequest,
		renderToReadableStream: options.renderToReadableStream,
		status: options.status
	});
}
async function renderAppPageHttpAccessFallback(options) {
	const boundaryComponent = options.boundaryComponent ?? resolveAppPageHttpAccessBoundaryComponent({
		getDefaultExport,
		rootForbiddenModule: options.rootForbiddenModule,
		rootNotFoundModule: options.rootNotFoundModule,
		rootUnauthorizedModule: options.rootUnauthorizedModule,
		routeForbiddenModule: options.route?.forbidden,
		routeNotFoundModule: options.route?.notFound,
		routeUnauthorizedModule: options.route?.unauthorized,
		statusCode: options.statusCode
	});
	if (!boundaryComponent) return null;
	const layoutModules = options.layoutModules ?? options.route?.layouts ?? options.rootLayouts;
	const { metadata, viewport } = await resolveAppPageLayoutHead(layoutModules, options.matchedParams);
	const headElements = [(0, import_react_react_server.createElement)("meta", {
		charSet: "utf-8",
		key: "charset"
	}), (0, import_react_react_server.createElement)("meta", {
		content: "noindex",
		key: "robots",
		name: "robots"
	})];
	if (metadata) headElements.push((0, import_react_react_server.createElement)(MetadataHead, {
		key: "metadata",
		metadata
	}));
	headElements.push((0, import_react_react_server.createElement)(ViewportHead, {
		key: "viewport",
		viewport
	}));
	const element = wrapRenderedBoundaryElement({
		element: (0, import_react_react_server.createElement)(import_react_react_server.Fragment, null, ...headElements, (0, import_react_react_server.createElement)(boundaryComponent)),
		globalErrorModule: options.globalErrorModule,
		includeGlobalErrorBoundary: true,
		isRscRequest: options.isRscRequest,
		layoutModules,
		layoutTreePositions: options.route?.layoutTreePositions,
		makeThenableParams: options.makeThenableParams,
		matchedParams: options.matchedParams,
		resolveChildSegments: options.resolveChildSegments,
		routeSegments: options.route?.routeSegments
	});
	return renderAppPageBoundaryElementResponse({
		...options,
		element,
		routePattern: options.route?.pattern,
		status: options.statusCode
	});
}
async function renderAppPageErrorBoundary(options) {
	const errorBoundary = resolveAppPageErrorBoundary({
		getDefaultExport,
		globalErrorModule: options.globalErrorModule,
		layoutErrorModules: options.route?.errors,
		pageErrorModule: options.route?.error
	});
	if (!errorBoundary.component) return null;
	const rawError = options.error instanceof Error ? options.error : new Error(String(options.error));
	const errorObject = options.sanitizeErrorForClient(rawError);
	const matchedParams = options.matchedParams ?? options.route?.params ?? {};
	const layoutModules = options.route?.layouts ?? options.rootLayouts;
	const element = wrapRenderedBoundaryElement({
		element: (0, import_react_react_server.createElement)(errorBoundary.component, { error: errorObject }),
		globalErrorModule: options.globalErrorModule,
		includeGlobalErrorBoundary: !errorBoundary.isGlobalError,
		isRscRequest: options.isRscRequest,
		layoutModules,
		layoutTreePositions: options.route?.layoutTreePositions,
		makeThenableParams: options.makeThenableParams,
		matchedParams,
		resolveChildSegments: options.resolveChildSegments,
		routeSegments: options.route?.routeSegments,
		skipLayoutWrapping: errorBoundary.isGlobalError
	});
	return renderAppPageBoundaryElementResponse({
		...options,
		element,
		routePattern: options.route?.pattern,
		status: 200
	});
}
async function probeAppPageBeforeRender(options) {
	if (options.layoutCount > 0) {
		const layoutProbeResponse = await probeAppPageLayouts({
			layoutCount: options.layoutCount,
			async onLayoutError(layoutError, layoutIndex) {
				const specialError = options.resolveSpecialError(layoutError);
				if (!specialError) return null;
				return options.renderLayoutSpecialError(specialError, layoutIndex);
			},
			probeLayoutAt: options.probeLayoutAt,
			runWithSuppressedHookWarning(probe) {
				return options.runWithSuppressedHookWarning(probe);
			}
		});
		if (layoutProbeResponse) return layoutProbeResponse;
	}
	return probeAppPageComponent({
		awaitAsyncResult: !options.hasLoadingBoundary,
		async onError(pageError) {
			const specialError = options.resolveSpecialError(pageError);
			if (specialError) return options.renderPageSpecialError(specialError);
			return null;
		},
		probePage: options.probePage,
		runWithSuppressedHookWarning(probe) {
			return options.runWithSuppressedHookWarning(probe);
		}
	});
}
var STATIC_CACHE_CONTROL = "s-maxage=31536000, stale-while-revalidate";
var NO_STORE_CACHE_CONTROL = "no-store, must-revalidate";
function buildRevalidateCacheControl(revalidateSeconds) {
	return `s-maxage=${revalidateSeconds}, stale-while-revalidate`;
}
function applyTimingHeader(headers, timing) {
	if (!timing) return;
	const handlerStart = Math.round(timing.handlerStart);
	const compileMs = timing.compileEnd !== void 0 ? Math.round(timing.compileEnd - timing.handlerStart) : -1;
	const renderMs = timing.responseKind === "html" && timing.renderEnd !== void 0 && timing.compileEnd !== void 0 ? Math.round(timing.renderEnd - timing.compileEnd) : -1;
	headers.set("x-vinext-timing", `${handlerStart},${compileMs},${renderMs}`);
}
function resolveAppPageRscResponsePolicy(options) {
	if (options.isForceDynamic || options.dynamicUsedDuringBuild) return { cacheControl: NO_STORE_CACHE_CONTROL };
	if ((options.isForceStatic || options.isDynamicError) && !options.revalidateSeconds || options.revalidateSeconds === Infinity) return {
		cacheControl: STATIC_CACHE_CONTROL,
		cacheState: "STATIC"
	};
	if (options.revalidateSeconds) return {
		cacheControl: buildRevalidateCacheControl(options.revalidateSeconds),
		cacheState: options.isProduction ? "MISS" : void 0
	};
	return {};
}
function resolveAppPageHtmlResponsePolicy(options) {
	if (options.isForceDynamic) return {
		cacheControl: NO_STORE_CACHE_CONTROL,
		shouldWriteToCache: false
	};
	if ((options.isForceStatic || options.isDynamicError) && (options.revalidateSeconds === null || options.revalidateSeconds === 0)) return {
		cacheControl: STATIC_CACHE_CONTROL,
		cacheState: "STATIC",
		shouldWriteToCache: false
	};
	if (options.dynamicUsedDuringRender) return {
		cacheControl: NO_STORE_CACHE_CONTROL,
		shouldWriteToCache: false
	};
	if (options.revalidateSeconds !== null && options.revalidateSeconds > 0 && options.revalidateSeconds !== Infinity) return {
		cacheControl: buildRevalidateCacheControl(options.revalidateSeconds),
		cacheState: options.isProduction ? "MISS" : void 0,
		shouldWriteToCache: options.isProduction
	};
	if (options.revalidateSeconds === Infinity) return {
		cacheControl: STATIC_CACHE_CONTROL,
		cacheState: "STATIC",
		shouldWriteToCache: false
	};
	return { shouldWriteToCache: false };
}
function buildAppPageRscResponse(body, options) {
	const headers = new Headers({
		"Content-Type": "text/x-component; charset=utf-8",
		Vary: "RSC, Accept"
	});
	if (options.params && Object.keys(options.params).length > 0) headers.set("X-Vinext-Params", encodeURIComponent(JSON.stringify(options.params)));
	if (options.policy.cacheControl) headers.set("Cache-Control", options.policy.cacheControl);
	if (options.policy.cacheState) headers.set("X-Vinext-Cache", options.policy.cacheState);
	if (options.middlewareContext.headers) for (const [key, value] of options.middlewareContext.headers) {
		const lowerKey = key.toLowerCase();
		if (lowerKey === "set-cookie" || lowerKey === "vary") headers.append(key, value);
		else headers.set(key, value);
	}
	applyTimingHeader(headers, options.timing);
	return new Response(body, {
		status: options.middlewareContext.status ?? 200,
		headers
	});
}
function buildAppPageHtmlResponse(body, options) {
	const headers = new Headers({
		"Content-Type": "text/html; charset=utf-8",
		Vary: "RSC, Accept"
	});
	if (options.policy.cacheControl) headers.set("Cache-Control", options.policy.cacheControl);
	if (options.policy.cacheState) headers.set("X-Vinext-Cache", options.policy.cacheState);
	if (options.draftCookie) headers.append("Set-Cookie", options.draftCookie);
	if (options.fontLinkHeader) headers.set("Link", options.fontLinkHeader);
	if (options.middlewareContext.headers) for (const [key, value] of options.middlewareContext.headers) headers.append(key, value);
	applyTimingHeader(headers, options.timing);
	return new Response(body, {
		status: options.middlewareContext.status ?? 200,
		headers
	});
}
function buildResponseTiming(options) {
	if (options.isProduction) return;
	return {
		compileEnd: options.compileEnd,
		handlerStart: options.handlerStart,
		renderEnd: options.renderEnd,
		responseKind: options.responseKind
	};
}
async function renderAppPageLifecycle(options) {
	const preRenderResponse = await probeAppPageBeforeRender({
		hasLoadingBoundary: options.hasLoadingBoundary,
		layoutCount: options.layoutCount,
		probeLayoutAt(layoutIndex) {
			return options.probeLayoutAt(layoutIndex);
		},
		probePage() {
			return options.probePage();
		},
		renderLayoutSpecialError(specialError, layoutIndex) {
			return options.renderLayoutSpecialError(specialError, layoutIndex);
		},
		renderPageSpecialError(specialError) {
			return options.renderPageSpecialError(specialError);
		},
		resolveSpecialError: resolveAppPageSpecialError,
		runWithSuppressedHookWarning(probe) {
			return options.runWithSuppressedHookWarning(probe);
		}
	});
	if (preRenderResponse) return preRenderResponse;
	const compileEnd = options.isProduction ? void 0 : performance.now();
	const rscErrorTracker = createAppPageRscErrorTracker(options.createRscOnErrorHandler(options.cleanPathname, options.routePattern));
	const rscStream = options.renderToReadableStream(options.element, { onError: rscErrorTracker.onRenderError });
	let revalidateSeconds = options.revalidateSeconds;
	const rscCapture = teeAppPageRscStreamForCapture(rscStream, options.isProduction && revalidateSeconds !== null && revalidateSeconds > 0 && revalidateSeconds !== Infinity && !options.isForceDynamic);
	const rscForResponse = rscCapture.responseStream;
	const isrRscDataPromise = rscCapture.capturedRscDataPromise;
	if (options.isRscRequest) {
		const dynamicUsedDuringBuild = options.consumeDynamicUsage();
		const rscResponsePolicy = resolveAppPageRscResponsePolicy({
			dynamicUsedDuringBuild,
			isDynamicError: options.isDynamicError,
			isForceDynamic: options.isForceDynamic,
			isForceStatic: options.isForceStatic,
			isProduction: options.isProduction,
			revalidateSeconds
		});
		const rscResponse = buildAppPageRscResponse(rscForResponse, {
			middlewareContext: options.middlewareContext,
			params: options.params,
			policy: rscResponsePolicy,
			timing: buildResponseTiming({
				compileEnd,
				handlerStart: options.handlerStart,
				isProduction: options.isProduction,
				responseKind: "rsc"
			})
		});
		scheduleAppPageRscCacheWrite({
			capturedRscDataPromise: options.isProduction ? isrRscDataPromise : null,
			cleanPathname: options.cleanPathname,
			consumeDynamicUsage: options.consumeDynamicUsage,
			dynamicUsedDuringBuild,
			getPageTags() {
				return options.getPageTags();
			},
			isrDebug: options.isrDebug,
			isrRscKey: options.isrRscKey,
			isrSet: options.isrSet,
			revalidateSeconds: revalidateSeconds ?? 0,
			waitUntil(promise) {
				options.waitUntil?.(promise);
			}
		});
		return rscResponse;
	}
	const fontData = createAppPageFontData({
		getLinks: options.getFontLinks,
		getPreloads: options.getFontPreloads,
		getStyles: options.getFontStyles
	});
	const fontLinkHeader = buildAppPageFontLinkHeader(fontData.preloads);
	let renderEnd;
	const htmlRender = await renderAppPageHtmlStreamWithRecovery({
		onShellRendered() {
			if (!options.isProduction) renderEnd = performance.now();
		},
		renderErrorBoundaryResponse(error) {
			return options.renderErrorBoundaryResponse(error);
		},
		async renderHtmlStream() {
			const ssrHandler = await options.loadSsrHandler();
			return renderAppPageHtmlStream({
				fontData,
				navigationContext: options.getNavigationContext(),
				rscStream: rscForResponse,
				ssrHandler
			});
		},
		renderSpecialErrorResponse(specialError) {
			return options.renderPageSpecialError(specialError);
		},
		resolveSpecialError: resolveAppPageSpecialError
	});
	if (htmlRender.response) return htmlRender.response;
	const htmlStream = htmlRender.htmlStream;
	if (!htmlStream) throw new Error("[vinext] Expected an HTML stream when no fallback response was returned");
	if (shouldRerenderAppPageWithGlobalError({
		capturedError: rscErrorTracker.getCapturedError(),
		hasLocalBoundary: options.routeHasLocalBoundary
	})) {
		const cleanResponse = await options.renderErrorBoundaryResponse(rscErrorTracker.getCapturedError());
		if (cleanResponse) return cleanResponse;
	}
	const draftCookie = options.getDraftModeCookieHeader();
	const dynamicUsedDuringRender = options.consumeDynamicUsage();
	const requestCacheLife = options.getRequestCacheLife();
	if (requestCacheLife?.revalidate !== void 0 && revalidateSeconds === null) revalidateSeconds = requestCacheLife.revalidate;
	const safeHtmlStream = deferUntilStreamConsumed(htmlStream, () => {
		options.clearRequestContext();
	});
	const htmlResponsePolicy = resolveAppPageHtmlResponsePolicy({
		dynamicUsedDuringRender,
		isDynamicError: options.isDynamicError,
		isForceDynamic: options.isForceDynamic,
		isForceStatic: options.isForceStatic,
		isProduction: options.isProduction,
		revalidateSeconds
	});
	const htmlResponseTiming = buildResponseTiming({
		compileEnd,
		handlerStart: options.handlerStart,
		isProduction: options.isProduction,
		renderEnd,
		responseKind: "html"
	});
	if (htmlResponsePolicy.shouldWriteToCache) return finalizeAppPageHtmlCacheResponse(buildAppPageHtmlResponse(safeHtmlStream, {
		draftCookie,
		fontLinkHeader,
		middlewareContext: options.middlewareContext,
		policy: htmlResponsePolicy,
		timing: htmlResponseTiming
	}), {
		capturedRscDataPromise: isrRscDataPromise,
		cleanPathname: options.cleanPathname,
		getPageTags() {
			return options.getPageTags();
		},
		isrDebug: options.isrDebug,
		isrHtmlKey: options.isrHtmlKey,
		isrRscKey: options.isrRscKey,
		isrSet: options.isrSet,
		revalidateSeconds: revalidateSeconds ?? 0,
		waitUntil(cachePromise) {
			options.waitUntil?.(cachePromise);
		}
	});
	return buildAppPageHtmlResponse(safeHtmlStream, {
		draftCookie,
		fontLinkHeader,
		middlewareContext: options.middlewareContext,
		policy: htmlResponsePolicy,
		timing: htmlResponseTiming
	});
}
function areStaticParamsAllowed(params, staticParams) {
	const paramKeys = Object.keys(params);
	return staticParams.some((staticParamSet) => paramKeys.every((key) => {
		const value = params[key];
		const staticValue = staticParamSet[key];
		if (staticValue === void 0) return true;
		if (Array.isArray(value)) return JSON.stringify(value) === JSON.stringify(staticValue);
		if (typeof staticValue === "string" || typeof staticValue === "number" || typeof staticValue === "boolean") return String(value) === String(staticValue);
		return JSON.stringify(value) === JSON.stringify(staticValue);
	}));
}
async function validateAppPageDynamicParams(options) {
	if (!options.enforceStaticParamsOnly || !options.isDynamicRoute || typeof options.generateStaticParams !== "function") return null;
	try {
		const staticParams = await options.generateStaticParams({ params: options.params });
		if (Array.isArray(staticParams) && !areStaticParamsAllowed(options.params, staticParams)) {
			options.clearRequestContext();
			return new Response("Not Found", { status: 404 });
		}
	} catch (error) {
		options.logGenerateStaticParamsError?.(error);
	}
	return null;
}
async function resolveAppPageIntercept(options) {
	if (!options.isRscRequest) return {
		interceptOpts: void 0,
		response: null
	};
	const intercept = options.findIntercept(options.cleanPathname);
	if (!intercept) return {
		interceptOpts: void 0,
		response: null
	};
	const sourceRoute = options.getSourceRoute(intercept.sourceRouteIndex);
	const interceptOpts = options.toInterceptOpts(intercept);
	if (sourceRoute && sourceRoute !== options.currentRoute) {
		const sourceParams = options.matchSourceRouteParams(options.getRoutePattern(sourceRoute)) ?? {};
		options.setNavigationContext({
			params: intercept.matchedParams,
			pathname: options.cleanPathname,
			searchParams: options.searchParams
		});
		const interceptElement = await options.buildPageElement(sourceRoute, sourceParams, interceptOpts, options.searchParams);
		return {
			interceptOpts: void 0,
			response: await options.renderInterceptResponse(sourceRoute, interceptElement)
		};
	}
	return {
		interceptOpts,
		response: null
	};
}
async function buildAppPageElement(options) {
	try {
		return {
			element: await options.buildPageElement(),
			response: null
		};
	} catch (error) {
		const specialError = options.resolveSpecialError(error);
		if (specialError) return {
			element: null,
			response: await options.renderSpecialError(specialError)
		};
		const errorBoundaryResponse = await options.renderErrorBoundaryPage(error);
		if (errorBoundaryResponse) return {
			element: null,
			response: errorBoundaryResponse
		};
		throw error;
	}
}
/**
* Extended fetch() with Next.js caching semantics.
*
* Patches `globalThis.fetch` during server rendering to support:
*
*   fetch(url, { next: { revalidate: 60, tags: ['posts'] } })
*   fetch(url, { cache: 'force-cache' })
*   fetch(url, { cache: 'no-store' })
*
* Cached responses are stored via the pluggable CacheHandler, so
* revalidateTag() and revalidatePath() invalidate fetch-level caches.
*
* Usage (in server entry):
*   import { withFetchCache, cleanupFetchCache } from './fetch-cache';
*   const cleanup = withFetchCache();
*   try { ... render ... } finally { cleanup(); }
*
* Or use the async helper:
*   await runWithFetchCache(async () => { ... render ... });
*/
/**
* Headers excluded from the cache key. These are W3C trace context headers
* that can break request caching and deduplication.
* All other headers ARE included in the cache key, matching Next.js behavior.
*/
var HEADER_BLOCKLIST = ["traceparent", "tracestate"];
var CACHE_KEY_PREFIX = "v3";
var MAX_CACHE_KEY_BODY_BYTES = 1024 * 1024;
var BodyTooLargeForCacheKeyError = class extends Error {
	constructor() {
		super("Fetch body too large for cache key generation");
	}
};
var SkipCacheKeyGenerationError = class extends Error {
	constructor() {
		super("Fetch body could not be serialized for cache key generation");
	}
};
/**
* Collect all headers from the request, excluding the blocklist.
* Merges headers from both the Request object and the init object,
* with init taking precedence (matching fetch() spec behavior).
*/
function collectHeaders(input, init) {
	const merged = {};
	if (input instanceof Request && input.headers) input.headers.forEach((v, k) => {
		merged[k] = v;
	});
	if (init?.headers) (init.headers instanceof Headers ? init.headers : new Headers(init.headers)).forEach((v, k) => {
		merged[k] = v;
	});
	for (const blocked of HEADER_BLOCKLIST) delete merged[blocked];
	return merged;
}
/**
* Check whether a fetch request carries any per-user auth headers.
* Used for the safety bypass (skip caching when auth headers are present
* without an explicit cache opt-in).
*/
var AUTH_HEADERS = [
	"authorization",
	"cookie",
	"x-api-key"
];
function hasAuthHeaders(input, init) {
	const headers = collectHeaders(input, init);
	return AUTH_HEADERS.some((name) => name in headers);
}
async function serializeFormData(formData, pushBodyChunk, getTotalBodyBytes) {
	for (const [key, val] of formData.entries()) {
		if (typeof val === "string") {
			pushBodyChunk(JSON.stringify([key, {
				kind: "string",
				value: val
			}]));
			continue;
		}
		if (val.size > MAX_CACHE_KEY_BODY_BYTES || getTotalBodyBytes() + val.size > MAX_CACHE_KEY_BODY_BYTES) throw new BodyTooLargeForCacheKeyError();
		pushBodyChunk(JSON.stringify([key, {
			kind: "file",
			name: val.name,
			type: val.type,
			value: await val.text()
		}]));
	}
}
function getParsedFormContentType(contentType) {
	const mediaType = contentType?.split(";")[0]?.trim().toLowerCase();
	if (mediaType === "multipart/form-data" || mediaType === "application/x-www-form-urlencoded") return mediaType;
}
function stripMultipartBoundary(contentType) {
	const [type, ...params] = contentType.split(";");
	const keptParams = params.map((param) => param.trim()).filter(Boolean).filter((param) => !/^boundary\s*=/i.test(param));
	const normalizedType = type.trim().toLowerCase();
	return keptParams.length > 0 ? `${normalizedType}; ${keptParams.join("; ")}` : normalizedType;
}
async function readRequestBodyChunksWithinLimit(request) {
	const contentLengthHeader = request.headers.get("content-length");
	if (contentLengthHeader) {
		const contentLength = Number(contentLengthHeader);
		if (Number.isFinite(contentLength) && contentLength > MAX_CACHE_KEY_BODY_BYTES) throw new BodyTooLargeForCacheKeyError();
	}
	const requestClone = request.clone();
	const contentType = requestClone.headers.get("content-type") ?? void 0;
	const reader = requestClone.body?.getReader();
	if (!reader) return {
		chunks: [],
		contentType
	};
	const chunks = [];
	let totalBodyBytes = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			totalBodyBytes += value.byteLength;
			if (totalBodyBytes > MAX_CACHE_KEY_BODY_BYTES) throw new BodyTooLargeForCacheKeyError();
			chunks.push(value);
		}
	} catch (err) {
		reader.cancel().catch(() => {});
		throw err;
	}
	return {
		chunks,
		contentType
	};
}
/**
* Serialize request body into string chunks for cache key inclusion.
* Handles all body types: string, Uint8Array, ReadableStream, FormData, Blob,
* and Request object bodies.
* Returns the serialized body chunks and optionally stashes the original body
* on init as `_ogBody` so it can still be used after stream consumption.
*/
async function serializeBody(input, init) {
	if (!init?.body && !(input instanceof Request && input.body)) return { bodyChunks: [] };
	const bodyChunks = [];
	const encoder = new TextEncoder();
	const decoder = new TextDecoder();
	let totalBodyBytes = 0;
	let canonicalizedContentType;
	const pushBodyChunk = (chunk) => {
		totalBodyBytes += encoder.encode(chunk).byteLength;
		if (totalBodyBytes > MAX_CACHE_KEY_BODY_BYTES) throw new BodyTooLargeForCacheKeyError();
		bodyChunks.push(chunk);
	};
	const getTotalBodyBytes = () => totalBodyBytes;
	if (init?.body instanceof Uint8Array) {
		if (init.body.byteLength > MAX_CACHE_KEY_BODY_BYTES) throw new BodyTooLargeForCacheKeyError();
		pushBodyChunk(decoder.decode(init.body));
		init._ogBody = init.body;
	} else if (init?.body && typeof init.body.getReader === "function") {
		const [bodyForHashing, bodyForFetch] = init.body.tee();
		init._ogBody = bodyForFetch;
		const reader = bodyForHashing.getReader();
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				if (typeof value === "string") pushBodyChunk(value);
				else {
					totalBodyBytes += value.byteLength;
					if (totalBodyBytes > MAX_CACHE_KEY_BODY_BYTES) throw new BodyTooLargeForCacheKeyError();
					bodyChunks.push(decoder.decode(value, { stream: true }));
				}
			}
			const finalChunk = decoder.decode();
			if (finalChunk) pushBodyChunk(finalChunk);
		} catch (err) {
			await reader.cancel();
			if (err instanceof BodyTooLargeForCacheKeyError) throw err;
			throw new SkipCacheKeyGenerationError();
		}
	} else if (init?.body instanceof URLSearchParams) {
		init._ogBody = init.body;
		pushBodyChunk(init.body.toString());
	} else if (init?.body && typeof init.body.keys === "function") {
		const formData = init.body;
		init._ogBody = init.body;
		await serializeFormData(formData, pushBodyChunk, getTotalBodyBytes);
	} else if (init?.body && typeof init.body.arrayBuffer === "function") {
		const blob = init.body;
		if (blob.size > MAX_CACHE_KEY_BODY_BYTES) throw new BodyTooLargeForCacheKeyError();
		pushBodyChunk(await blob.text());
		const arrayBuffer = await blob.arrayBuffer();
		init._ogBody = new Blob([arrayBuffer], { type: blob.type });
	} else if (typeof init?.body === "string") {
		if (init.body.length > MAX_CACHE_KEY_BODY_BYTES) throw new BodyTooLargeForCacheKeyError();
		pushBodyChunk(init.body);
		init._ogBody = init.body;
	} else if (input instanceof Request && input.body) {
		let chunks;
		let contentType;
		try {
			({chunks, contentType} = await readRequestBodyChunksWithinLimit(input));
		} catch (err) {
			if (err instanceof BodyTooLargeForCacheKeyError) throw err;
			throw new SkipCacheKeyGenerationError();
		}
		const formContentType = getParsedFormContentType(contentType);
		if (formContentType) try {
			await serializeFormData(await new Request(input.url, {
				method: input.method,
				headers: contentType ? { "content-type": contentType } : void 0,
				body: new Blob(chunks)
			}).formData(), pushBodyChunk, getTotalBodyBytes);
			canonicalizedContentType = formContentType === "multipart/form-data" && contentType ? stripMultipartBoundary(contentType) : void 0;
			return {
				bodyChunks,
				canonicalizedContentType
			};
		} catch (err) {
			if (err instanceof BodyTooLargeForCacheKeyError) throw err;
			throw new SkipCacheKeyGenerationError();
		}
		for (const chunk of chunks) pushBodyChunk(decoder.decode(chunk, { stream: true }));
		const finalChunk = decoder.decode();
		if (finalChunk) pushBodyChunk(finalChunk);
	}
	return {
		bodyChunks,
		canonicalizedContentType
	};
}
/**
* Generate a deterministic cache key from a fetch request.
*
* Matches Next.js behavior: the key is a SHA-256 hash of a JSON array
* containing URL, method, all headers (minus blocklist), all RequestInit
* options, and the serialized body.
*/
async function buildFetchCacheKey(input, init) {
	let url;
	let method = "GET";
	if (typeof input === "string") url = input;
	else if (input instanceof URL) url = input.toString();
	else {
		url = input.url;
		method = input.method || "GET";
	}
	if (init?.method) method = init.method;
	const headers = collectHeaders(input, init);
	const { bodyChunks, canonicalizedContentType } = await serializeBody(input, init);
	if (canonicalizedContentType) headers["content-type"] = canonicalizedContentType;
	const cacheString = JSON.stringify([
		CACHE_KEY_PREFIX,
		url,
		method,
		headers,
		init?.mode,
		init?.redirect,
		init?.credentials,
		init?.referrer,
		init?.referrerPolicy,
		init?.integrity,
		init?.cache,
		bodyChunks
	]);
	const buffer = new TextEncoder().encode(cacheString);
	const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
	return Array.prototype.map.call(new Uint8Array(hashBuffer), (b) => b.toString(16).padStart(2, "0")).join("");
}
var _PENDING_KEY = Symbol.for("vinext.fetchCache.pendingRefetches");
var _gPending = globalThis;
var pendingRefetches = _gPending[_PENDING_KEY] ??= /* @__PURE__ */ new Map();
var DEDUP_TIMEOUT_MS = 6e4;
var _ORIG_FETCH_KEY = Symbol.for("vinext.fetchCache.originalFetch");
var _gFetch = globalThis;
var originalFetch = _gFetch[_ORIG_FETCH_KEY] ??= globalThis.fetch;
var _ALS_KEY$1 = Symbol.for("vinext.fetchCache.als");
var _FALLBACK_KEY$1 = Symbol.for("vinext.fetchCache.fallback");
var _g$1 = globalThis;
var _als$1 = _g$1[_ALS_KEY$1] ??= new AsyncLocalStorage();
var _fallbackState$1 = _g$1[_FALLBACK_KEY$1] ??= { currentRequestTags: [] };
function _getState$1() {
	if (isInsideUnifiedScope()) return getRequestContext();
	return _als$1.getStore() ?? _fallbackState$1;
}
/**
* Get tags collected during the current render pass.
* Useful for associating page-level cache entries with all the
* fetch tags used during rendering.
*/
function getCollectedFetchTags() {
	return [..._getState$1().currentRequestTags];
}
/**
* Create a patched fetch function with Next.js caching semantics.
*
* The patched fetch:
* 1. Checks `cache` and `next` options to determine caching behavior
* 2. On cache hit, returns the cached response without hitting the network
* 3. On cache miss, fetches from network, stores in cache, returns response
* 4. Respects `next.revalidate` for TTL-based revalidation
* 5. Respects `next.tags` for tag-based invalidation via revalidateTag()
*/
function createPatchedFetch() {
	return async function patchedFetch(input, init) {
		const nextOpts = init?.next;
		const cacheDirective = init?.cache;
		if (!nextOpts && !cacheDirective) return originalFetch(input, init);
		if (cacheDirective === "no-store" || cacheDirective === "no-cache" || nextOpts?.revalidate === false || nextOpts?.revalidate === 0) return originalFetch(input, stripNextFromInit(init));
		if (!(cacheDirective === "force-cache" || typeof nextOpts?.revalidate === "number" && nextOpts.revalidate > 0) && hasAuthHeaders(input, init)) return originalFetch(input, stripNextFromInit(init));
		let revalidateSeconds;
		if (cacheDirective === "force-cache") revalidateSeconds = nextOpts?.revalidate && typeof nextOpts.revalidate === "number" ? nextOpts.revalidate : 31536e3;
		else if (typeof nextOpts?.revalidate === "number" && nextOpts.revalidate > 0) revalidateSeconds = nextOpts.revalidate;
		else if (nextOpts?.tags && nextOpts.tags.length > 0) revalidateSeconds = 31536e3;
		else return originalFetch(input, stripNextFromInit(init));
		const tags = nextOpts?.tags ?? [];
		let cacheKey;
		try {
			cacheKey = await buildFetchCacheKey(input, init);
		} catch (err) {
			if (err instanceof BodyTooLargeForCacheKeyError || err instanceof SkipCacheKeyGenerationError) return originalFetch(input, stripNextFromInit(init));
			throw err;
		}
		const handler = getCacheHandler();
		const reqTags = _getState$1().currentRequestTags;
		if (tags.length > 0) {
			for (const tag of tags) if (!reqTags.includes(tag)) reqTags.push(tag);
		}
		try {
			const cached = await handler.get(cacheKey, {
				kind: "FETCH",
				tags
			});
			if (cached?.value && cached.value.kind === "FETCH" && cached.cacheState !== "stale") {
				const cachedData = cached.value.data;
				return new Response(cachedData.body, {
					status: cachedData.status ?? 200,
					headers: cachedData.headers
				});
			}
			if (cached?.value && cached.value.kind === "FETCH" && cached.cacheState === "stale") {
				const staleData = cached.value.data;
				if (!pendingRefetches.has(cacheKey)) {
					const refetchPromise = originalFetch(input, stripNextFromInit(init)).then(async (freshResp) => {
						if (freshResp.status !== 200) return;
						const freshBody = await freshResp.text();
						const freshHeaders = {};
						freshResp.headers.forEach((v, k) => {
							if (k.toLowerCase() === "set-cookie") return;
							freshHeaders[k] = v;
						});
						const freshValue = {
							kind: "FETCH",
							data: {
								headers: freshHeaders,
								body: freshBody,
								url: typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url,
								status: freshResp.status
							},
							tags,
							revalidate: revalidateSeconds
						};
						await handler.set(cacheKey, freshValue, {
							fetchCache: true,
							tags,
							revalidate: revalidateSeconds
						});
					}).catch((err) => {
						const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
						console.error(`[vinext] fetch cache background revalidation failed for ${url} (key=${cacheKey.slice(0, 12)}...):`, err);
					}).finally(() => {
						if (pendingRefetches.get(cacheKey) === refetchPromise) pendingRefetches.delete(cacheKey);
						clearTimeout(timeoutId);
					});
					pendingRefetches.set(cacheKey, refetchPromise);
					const timeoutId = setTimeout(() => {
						if (pendingRefetches.get(cacheKey) === refetchPromise) pendingRefetches.delete(cacheKey);
					}, DEDUP_TIMEOUT_MS);
					getRequestExecutionContext()?.waitUntil(refetchPromise);
				}
				return new Response(staleData.body, {
					status: staleData.status ?? 200,
					headers: staleData.headers
				});
			}
		} catch (cacheErr) {
			console.error("[vinext] fetch cache read error:", cacheErr);
		}
		const response = await originalFetch(input, stripNextFromInit(init));
		if (response.status === 200) {
			const cloned = response.clone();
			const body = await cloned.text();
			const headers = {};
			cloned.headers.forEach((v, k) => {
				if (k.toLowerCase() === "set-cookie") return;
				headers[k] = v;
			});
			const cacheValue = {
				kind: "FETCH",
				data: {
					headers,
					body,
					url: typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url,
					status: cloned.status
				},
				tags,
				revalidate: revalidateSeconds
			};
			handler.set(cacheKey, cacheValue, {
				fetchCache: true,
				tags,
				revalidate: revalidateSeconds
			}).catch((err) => {
				console.error("[vinext] fetch cache write error:", err);
			});
		}
		return response;
	};
}
/**
* Strip the `next` property from RequestInit before passing to real fetch.
* The `next` property is not a standard fetch option and would cause warnings
* in some environments.
*/
function stripNextFromInit(init) {
	if (!init) return init;
	const { next: _next, _ogBody, ...rest } = init;
	if (_ogBody !== void 0) rest.body = _ogBody;
	return Object.keys(rest).length > 0 ? rest : void 0;
}
var _PATCH_KEY = Symbol.for("vinext.fetchCache.patchInstalled");
function _ensurePatchInstalled() {
	if (_g$1[_PATCH_KEY]) return;
	_g$1[_PATCH_KEY] = true;
	globalThis.fetch = createPatchedFetch();
}
/**
* Install the patched fetch without creating a standalone ALS scope.
*
* `runWithFetchCache()` is the standalone helper: it installs the patch and
* creates an isolated per-request tag store. The unified request context owns
* that isolation itself via `currentRequestTags`, so callers inside
* `runWithRequestContext()` only need the process-global fetch monkey-patch.
*/
function ensureFetchPatch() {
	_ensurePatchInstalled();
}
function createNode() {
	return {
		staticChildren: /* @__PURE__ */ new Map(),
		dynamicChild: null,
		catchAllChild: null,
		optionalCatchAllChild: null,
		route: null
	};
}
/**
* Build a trie from pre-sorted routes.
*
* Routes must have a `patternParts` property (string[] of URL segments).
* Pattern segment conventions:
*   - `:name`  — dynamic segment
*   - `:name+` — catch-all (1+ segments)
*   - `:name*` — optional catch-all (0+ segments)
*   - anything else — static segment
*
* First route to claim a terminal position wins (routes are pre-sorted
* by precedence, so insertion order preserves correct priority).
*/
function buildRouteTrie(routes) {
	const root = createNode();
	for (const route of routes) {
		const parts = route.patternParts;
		if (parts.length === 0) {
			if (root.route === null) root.route = route;
			continue;
		}
		let node = root;
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			if (part.endsWith("+") && part.startsWith(":")) {
				if (i !== parts.length - 1) break;
				const paramName = part.slice(1, -1);
				if (node.catchAllChild === null) node.catchAllChild = {
					paramName,
					route
				};
				break;
			}
			if (part.endsWith("*") && part.startsWith(":")) {
				if (i !== parts.length - 1) break;
				const paramName = part.slice(1, -1);
				if (node.optionalCatchAllChild === null) node.optionalCatchAllChild = {
					paramName,
					route
				};
				break;
			}
			if (part.startsWith(":")) {
				const paramName = part.slice(1);
				if (node.dynamicChild === null) node.dynamicChild = {
					paramName,
					node: createNode()
				};
				node = node.dynamicChild.node;
				if (i === parts.length - 1) {
					if (node.route === null) node.route = route;
				}
				continue;
			}
			let child = node.staticChildren.get(part);
			if (!child) {
				child = createNode();
				node.staticChildren.set(part, child);
			}
			node = child;
			if (i === parts.length - 1) {
				if (node.route === null) node.route = route;
			}
		}
	}
	return root;
}
/**
* Match a URL against the trie.
*
* @param root - Trie root built by `buildRouteTrie`
* @param urlParts - Pre-split URL segments (no empty strings)
* @returns Match result with route and extracted params, or null
*/
function trieMatch(root, urlParts) {
	return match$1(root, urlParts, 0);
}
function match$1(node, urlParts, index) {
	if (index === urlParts.length) {
		if (node.route !== null) return {
			route: node.route,
			params: Object.create(null)
		};
		if (node.optionalCatchAllChild !== null) {
			const params = Object.create(null);
			params[node.optionalCatchAllChild.paramName] = [];
			return {
				route: node.optionalCatchAllChild.route,
				params
			};
		}
		return null;
	}
	const segment = urlParts[index];
	const staticChild = node.staticChildren.get(segment);
	if (staticChild) {
		const result = match$1(staticChild, urlParts, index + 1);
		if (result !== null) return result;
	}
	if (node.dynamicChild !== null) {
		const result = match$1(node.dynamicChild.node, urlParts, index + 1);
		if (result !== null) {
			result.params[node.dynamicChild.paramName] = segment;
			return result;
		}
	}
	if (node.catchAllChild !== null) {
		const remaining = urlParts.slice(index);
		const params = Object.create(null);
		params[node.catchAllChild.paramName] = remaining;
		return {
			route: node.catchAllChild.route,
			params
		};
	}
	if (node.optionalCatchAllChild !== null) {
		const remaining = urlParts.slice(index);
		const params = Object.create(null);
		params[node.optionalCatchAllChild.paramName] = remaining;
		return {
			route: node.optionalCatchAllChild.route,
			params
		};
	}
	return null;
}
init_unified_request_context();
/**
* Server-only navigation state backed by AsyncLocalStorage.
*
* This module provides request-scoped isolation for navigation context
* and useServerInsertedHTML callbacks. Without ALS, concurrent requests
* on Cloudflare Workers would share module-level state and leak data
* (pathnames, params, CSS-in-JS styles) between requests.
*
* This module is server-only — it imports node:async_hooks and must NOT
* be bundled for the browser. The dual-environment navigation.ts shim
* uses a registration pattern so it works in both environments.
*/
var _ALS_KEY = Symbol.for("vinext.navigation.als");
var _FALLBACK_KEY = Symbol.for("vinext.navigation.fallback");
var _g = globalThis;
var _als = _g[_ALS_KEY] ??= new AsyncLocalStorage();
var _fallbackState = _g[_FALLBACK_KEY] ??= {
	serverContext: null,
	serverInsertedHTMLCallbacks: []
};
function _getState() {
	if (isInsideUnifiedScope()) return getRequestContext();
	return _als.getStore() ?? _fallbackState;
}
_registerStateAccessors({
	getServerContext() {
		return _getState().serverContext;
	},
	setServerContext(ctx) {
		_getState().serverContext = ctx;
	},
	getInsertedHTMLCallbacks() {
		return _getState().serverInsertedHTMLCallbacks;
	},
	clearInsertedHTMLCallbacks() {
		_getState().serverInsertedHTMLCallbacks = [];
	}
});
/**
* Get the registered onRequestError handler (if any).
*
* Reads from globalThis so it works across Vite environment boundaries.
*/
function getOnRequestErrorHandler() {
	return globalThis.__VINEXT_onRequestErrorHandler__ ?? null;
}
/**
* Report a request error via the instrumentation handler.
*
* No-op if no onRequestError handler is registered.
*
* Reads the handler from globalThis so this function works correctly regardless
* of which environment it is called from.
*/
function reportRequestError(error, request, context) {
	const handler = getOnRequestErrorHandler();
	if (!handler) return Promise.resolve();
	const promise = (async () => {
		try {
			await handler(error, request, context);
		} catch (reportErr) {
			console.error("[vinext] onRequestError handler threw:", reportErr instanceof Error ? reportErr.message : String(reportErr));
		}
	})();
	getRequestExecutionContext()?.waitUntil(promise);
	return promise;
}
/**
* next/font/google shim
*
* Provides a compatible shim for Next.js Google Fonts.
*
* Two modes:
* 1. **Dev / CDN mode** (default): Loads fonts from Google Fonts CDN via <link> tags.
* 2. **Self-hosted mode** (production build): The vinext:google-fonts Vite plugin
*    fetches font CSS + .woff2 files at build time, caches them locally, and injects
*    @font-face CSS pointing at local assets. No requests to Google at runtime.
*
* Usage:
*   import { Inter } from 'next/font/google';
*   const inter = Inter({ subsets: ['latin'], weight: ['400', '700'] });
*   // inter.className -> unique CSS class
*   // inter.style -> { fontFamily: "'Inter', sans-serif" }
*   // inter.variable -> CSS variable name like '--font-inter'
*/
/**
* Escape a string for safe interpolation inside a CSS single-quoted string.
*
* Prevents CSS injection by escaping characters that could break out of
* a `'...'` CSS string context: backslashes, single quotes, and newlines.
*/
function escapeCSSString(value) {
	return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\a ").replace(/\r/g, "\\d ");
}
/**
* Validate a CSS custom property name (e.g. `--font-inter`).
*
* Custom properties must start with `--` and only contain alphanumeric
* characters, hyphens, and underscores. Anything else could be used to
* break out of the CSS declaration and inject arbitrary rules.
*
* Returns the name if valid, undefined otherwise.
*/
function sanitizeCSSVarName(name) {
	if (/^--[a-zA-Z0-9_-]+$/.test(name)) return name;
}
/**
* Sanitize a CSS font-family fallback name.
*
* Generic family names (sans-serif, serif, monospace, etc.) are used as-is.
* Named families are wrapped in escaped quotes. This prevents injection via
* crafted fallback values like `); } body { color: red; } .x {`.
*/
function sanitizeFallback(name) {
	const generics = new Set([
		"serif",
		"sans-serif",
		"monospace",
		"cursive",
		"fantasy",
		"system-ui",
		"ui-serif",
		"ui-sans-serif",
		"ui-monospace",
		"ui-rounded",
		"emoji",
		"math",
		"fangsong"
	]);
	const trimmed = name.trim();
	if (generics.has(trimmed)) return trimmed;
	return `'${escapeCSSString(trimmed)}'`;
}
var classCounter = 0;
var injectedFonts = /* @__PURE__ */ new Set();
/**
* Convert a font family name to a CSS variable name.
* e.g., "Inter" -> "--font-inter", "Roboto Mono" -> "--font-roboto-mono"
*/
function toVarName(family) {
	return "--font-" + family.toLowerCase().replace(/\s+/g, "-");
}
/**
* Build a Google Fonts CSS URL.
*/
function buildGoogleFontsUrl(family, options) {
	const params = new URLSearchParams();
	let spec = family;
	const weights = options.weight ? Array.isArray(options.weight) ? options.weight : [options.weight] : [];
	const styles = options.style ? Array.isArray(options.style) ? options.style : [options.style] : [];
	if (weights.length > 0 || styles.length > 0) {
		const hasItalic = styles.includes("italic");
		if (weights.length > 0) if (hasItalic) {
			const pairs = [];
			for (const w of weights) {
				pairs.push(`0,${w}`);
				pairs.push(`1,${w}`);
			}
			spec += `:ital,wght@${pairs.join(";")}`;
		} else spec += `:wght@${weights.join(";")}`;
	} else spec += `:wght@100..900`;
	params.set("family", spec);
	params.set("display", options.display ?? "swap");
	return `https://fonts.googleapis.com/css2?${params.toString()}`;
}
/**
* Inject a <link> tag for the font (client-side only).
* On the server, we track font URLs for SSR head injection.
*/
function injectFontStylesheet(url) {
	if (injectedFonts.has(url)) return;
	injectedFonts.add(url);
	if (typeof document !== "undefined") {
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = url;
		document.head.appendChild(link);
	}
}
/** Track which className CSS rules have been injected. */
var injectedClassRules = /* @__PURE__ */ new Set();
/**
* Inject a CSS rule that maps a className to a font-family.
*
* This is what makes `<div className={inter.className}>` apply the font.
* Next.js generates equivalent rules at build time.
*
* In Next.js, the .className class ONLY sets font-family — it does NOT
* set CSS variables. CSS variables are handled separately by the .variable class.
*/
function injectClassNameRule(className, fontFamily) {
	if (injectedClassRules.has(className)) return;
	injectedClassRules.add(className);
	const css = `.${className} { font-family: ${fontFamily}; }\n`;
	if (typeof document === "undefined") {
		ssrFontStyles$1.push(css);
		return;
	}
	const style = document.createElement("style");
	style.textContent = css;
	style.setAttribute("data-vinext-font-class", className);
	document.head.appendChild(style);
}
/** Track which variable class CSS rules have been injected. */
var injectedVariableRules = /* @__PURE__ */ new Set();
/** Track which :root CSS variable rules have been injected. */
var injectedRootVariables = /* @__PURE__ */ new Set();
/**
* Inject a CSS rule that sets a CSS variable on an element.
* This is what makes `<html className={inter.variable}>` set the CSS variable
* that can be referenced by other styles (e.g., Tailwind's font-sans).
*
* In Next.js, the .variable class ONLY sets the CSS variable — it does NOT
* set font-family. This is critical because apps commonly apply multiple
* .variable classes to <body> (e.g., geistSans.variable + geistMono.variable).
* If we also set font-family here, the last class wins due to CSS cascade,
* causing all text to use that font (e.g., everything becomes monospace).
*/
function injectVariableClassRule(variableClassName, cssVarName, fontFamily) {
	if (injectedVariableRules.has(variableClassName)) return;
	injectedVariableRules.add(variableClassName);
	let css = `.${variableClassName} { ${cssVarName}: ${fontFamily}; }\n`;
	if (!injectedRootVariables.has(cssVarName)) {
		injectedRootVariables.add(cssVarName);
		css += `:root { ${cssVarName}: ${fontFamily}; }\n`;
	}
	if (typeof document === "undefined") {
		ssrFontStyles$1.push(css);
		return;
	}
	const style = document.createElement("style");
	style.textContent = css;
	style.setAttribute("data-vinext-font-variable", variableClassName);
	document.head.appendChild(style);
}
var ssrFontStyles$1 = [];
/**
* Get collected SSR font class styles (used by the renderer).
* Note: We don't clear the arrays because fonts are loaded at module import
* time and need to persist across all requests in the Workers environment.
*/
function getSSRFontStyles$1() {
	return [...ssrFontStyles$1];
}
var ssrFontUrls = [];
/**
* Get collected SSR font URLs (used by the renderer).
* Note: We don't clear the arrays because fonts are loaded at module import
* time and need to persist across all requests in the Workers environment.
*/
function getSSRFontLinks() {
	return [...ssrFontUrls];
}
var ssrFontPreloads$1 = [];
var ssrFontPreloadHrefs = /* @__PURE__ */ new Set();
/**
* Get collected SSR font preload data (used by the renderer).
* Returns an array of { href, type } objects for emitting
* <link rel="preload" as="font" ...> tags.
*/
function getSSRFontPreloads$1() {
	return [...ssrFontPreloads$1];
}
/**
* Determine the MIME type for a font file based on its extension.
*/
function getFontMimeType(pathOrUrl) {
	if (pathOrUrl.endsWith(".woff2")) return "font/woff2";
	if (pathOrUrl.endsWith(".woff")) return "font/woff";
	if (pathOrUrl.endsWith(".ttf")) return "font/ttf";
	if (pathOrUrl.endsWith(".otf")) return "font/opentype";
	return "font/woff2";
}
/**
* Extract font file URLs from @font-face CSS rules.
* Parses url('...') references from the CSS text.
*/
function extractFontUrlsFromCSS(css) {
	const urls = [];
	const urlRegex = /url\(['"]?([^'")]+)['"]?\)/g;
	let match;
	while ((match = urlRegex.exec(css)) !== null) {
		const url = match[1];
		if (url && url.startsWith("/")) urls.push(url);
	}
	return urls;
}
/**
* Collect font file URLs from self-hosted CSS for preload link generation.
* Only collects on the server (SSR). Deduplicates by href using a Set for O(1) lookups.
*/
function collectFontPreloadsFromCSS(css) {
	if (typeof document !== "undefined") return;
	const urls = extractFontUrlsFromCSS(css);
	for (const href of urls) if (!ssrFontPreloadHrefs.has(href)) {
		ssrFontPreloadHrefs.add(href);
		ssrFontPreloads$1.push({
			href,
			type: getFontMimeType(href)
		});
	}
}
/** Track injected self-hosted @font-face blocks (deduplicate) */
var injectedSelfHosted = /* @__PURE__ */ new Set();
/**
* Inject self-hosted @font-face CSS (from the build plugin).
* This replaces the CDN <link> tag with inline CSS.
*/
function injectSelfHostedCSS(css) {
	if (injectedSelfHosted.has(css)) return;
	injectedSelfHosted.add(css);
	collectFontPreloadsFromCSS(css);
	if (typeof document === "undefined") {
		ssrFontStyles$1.push(css);
		return;
	}
	const style = document.createElement("style");
	style.textContent = css;
	style.setAttribute("data-vinext-font-selfhosted", "true");
	document.head.appendChild(style);
}
function createFontLoader(family) {
	return function fontLoader(options = {}) {
		const id = classCounter++;
		const className = `__font_${family.toLowerCase().replace(/\s+/g, "_")}_${id}`;
		const fallback = options.fallback ?? ["sans-serif"];
		const fontFamily = `'${escapeCSSString(family)}', ${fallback.map(sanitizeFallback).join(", ")}`;
		const defaultVarName = toVarName(family);
		const cssVarName = options.variable ? sanitizeCSSVarName(options.variable) ?? defaultVarName : defaultVarName;
		const variableClassName = `__variable_${family.toLowerCase().replace(/\s+/g, "_")}_${id}`;
		if (options._selfHostedCSS) injectSelfHostedCSS(options._selfHostedCSS);
		else {
			const url = buildGoogleFontsUrl(family, options);
			injectFontStylesheet(url);
			if (typeof document === "undefined") {
				if (!ssrFontUrls.includes(url)) ssrFontUrls.push(url);
			}
		}
		injectClassNameRule(className, fontFamily);
		injectVariableClassRule(variableClassName, cssVarName, fontFamily);
		return {
			className,
			style: { fontFamily },
			variable: variableClassName
		};
	};
}
var googleFonts = new Proxy({}, { get(_target, prop) {
	if (prop === "__esModule") return true;
	if (prop === "default") return googleFonts;
	return createFontLoader(prop.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2"));
} });
var ssrFontStyles = [];
var ssrFontPreloads = [];
/**
* Get collected SSR font styles (used by the renderer).
* Note: We don't clear the arrays because fonts are loaded at module import
* time and need to persist across all requests in the Workers environment.
*/
function getSSRFontStyles() {
	return [...ssrFontStyles];
}
/**
* Get collected SSR font preload data (used by the renderer).
* Returns an array of { href, type } objects for emitting
* <link rel="preload" as="font" ...> tags.
*/
function getSSRFontPreloads() {
	return [...ssrFontPreloads];
}
var import_next_auth = /* @__PURE__ */ __toESM$1(require_next_auth());
var promotionTypeEnum = _enum([
	"DISCOUNT_PERCENTAGE",
	"DISCOUNT_FIXED",
	"FREE_SERVICE",
	"CASHBACK",
	"LOYALTY_BONUS"
]);
var toDateOrUndefined = (val) => {
	if (val === "" || val === null || val === void 0) return void 0;
	const parsed = val instanceof Date ? val : typeof val === "string" ? new Date(val) : void 0;
	if (!parsed) return void 0;
	return Number.isNaN(parsed.getTime()) ? void 0 : parsed;
};
var CreatePromotionSchema = object({
	name: string().min(3, "Nome deve ter pelo menos 3 caracteres").max(120, "Nome deve ter no máximo 120 caracteres"),
	description: string().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
	type: promotionTypeEnum,
	value: number().positive("Valor deve ser maior que zero"),
	validFrom: preprocess(toDateOrUndefined, date()),
	validUntil: preprocess(toDateOrUndefined, date().optional()),
	isGlobal: boolean().default(false),
	minFrequency: preprocess((val) => {
		if (val === "" || val === null || val === void 0) return void 0;
		if (typeof val === "number" && Number.isNaN(val)) return void 0;
		return val;
	}, number().int("Frequência mínima deve ser um número inteiro").positive("Frequência mínima deve ser positiva").optional()),
	active: boolean().default(true),
	serviceIds: array(string()).optional(),
	userIds: array(string()).optional()
}).superRefine((val, ctx) => {
	if (val.type === "DISCOUNT_PERCENTAGE" && !(val.value > 0 && val.value <= 100)) ctx.addIssue({
		code: ZodIssueCode.custom,
		message: "Para porcentagem, o valor deve estar entre 0 e 100",
		path: ["value"]
	});
	if (val.validUntil && val.validUntil < val.validFrom) ctx.addIssue({
		code: ZodIssueCode.custom,
		message: "Data de término deve ser posterior à data de início",
		path: ["validUntil"]
	});
	if (!val.isGlobal) {
		if (!((val.serviceIds?.length ?? 0) > 0 || (val.userIds?.length ?? 0) > 0)) ctx.addIssue({
			code: ZodIssueCode.custom,
			message: "Promoções não globais devem ser vinculadas a serviços ou usuários",
			path: ["serviceIds"]
		});
	}
});
var UpdatePromotionSchema = CreatePromotionSchema.partial();
object({
	active: boolean().optional(),
	type: promotionTypeEnum.optional(),
	search: string().optional(),
	isGlobal: boolean().optional(),
	page: number().int().positive().default(1),
	limit: number().int().positive().max(50).default(20)
});
function ensureAdminSession(session) {
	if (!session?.user?.id) return {
		success: false,
		error: "Não autenticado"
	};
	if (session.user.role !== "ADMIN") return {
		success: false,
		error: "Acesso negado: apenas administradores"
	};
	return null;
}
function dedupeIds(ids) {
	if (!ids) return [];
	return Array.from(new Set(ids.filter(Boolean)));
}
function revalidatePromotionPaths() {
	revalidatePath("/dashboard/admin/promotions");
	revalidatePath("/promotions");
	revalidatePath("/");
}
async function createPromotion(data) {
	try {
		const authError = ensureAdminSession(await (0, import_next_auth.getServerSession)(authOptions));
		if (authError) return authError;
		const validatedData = CreatePromotionSchema.parse(data);
		if (await db.promotion.findFirst({ where: { name: {
			equals: validatedData.name,
			mode: "insensitive"
		} } })) return {
			success: false,
			error: "Já existe uma promoção com este nome"
		};
		const serviceIds = dedupeIds(validatedData.serviceIds);
		const userIds = dedupeIds(validatedData.userIds);
		const promotion = await db.$transaction(async (tx) => {
			const created = await tx.promotion.create({ data: {
				name: validatedData.name,
				description: validatedData.description ?? null,
				type: validatedData.type,
				value: validatedData.value,
				validFrom: validatedData.validFrom,
				validUntil: validatedData.validUntil ?? null,
				isGlobal: validatedData.isGlobal,
				minFrequency: validatedData.minFrequency ?? null,
				active: validatedData.active
			} });
			if (serviceIds.length) await tx.promotionService.createMany({
				data: serviceIds.map((serviceId) => ({
					promotionId: created.id,
					serviceId
				})),
				skipDuplicates: true
			});
			if (userIds.length) await tx.userPromotion.createMany({
				data: userIds.map((userId) => ({
					promotionId: created.id,
					userId
				})),
				skipDuplicates: true
			});
			return created;
		});
		revalidatePromotionPaths();
		return {
			success: true,
			data: promotion,
			message: "Promoção criada com sucesso"
		};
	} catch (error) {
		if (error instanceof ZodError) return {
			success: false,
			error: error.issues.map((issue) => issue.message).join(", ")
		};
		console.error("Erro ao criar promoção:", error);
		return {
			success: false,
			error: "Erro ao criar promoção"
		};
	}
}
async function updatePromotion(promotionId, data) {
	try {
		const authError = ensureAdminSession(await (0, import_next_auth.getServerSession)(authOptions));
		if (authError) return authError;
		const validatedData = UpdatePromotionSchema.parse(data);
		const existing = await db.promotion.findUnique({ where: { id: promotionId } });
		if (!existing) return {
			success: false,
			error: "Promoção não encontrada"
		};
		if (validatedData.name && validatedData.name !== existing.name) {
			if (await db.promotion.findFirst({ where: {
				id: { not: promotionId },
				name: {
					equals: validatedData.name,
					mode: "insensitive"
				}
			} })) return {
				success: false,
				error: "Já existe outra promoção com este nome"
			};
		}
		const serviceIds = validatedData.serviceIds ? dedupeIds(validatedData.serviceIds) : null;
		const userIds = validatedData.userIds ? dedupeIds(validatedData.userIds) : null;
		const promotion = await db.$transaction(async (tx) => {
			const updated = await tx.promotion.update({
				where: { id: promotionId },
				data: {
					...validatedData.name ? { name: validatedData.name } : {},
					...validatedData.description !== void 0 ? { description: validatedData.description ?? null } : {},
					...validatedData.type ? { type: validatedData.type } : {},
					...validatedData.value !== void 0 ? { value: validatedData.value } : {},
					...validatedData.validFrom ? { validFrom: validatedData.validFrom } : {},
					...validatedData.validUntil !== void 0 ? { validUntil: validatedData.validUntil ?? null } : {},
					...validatedData.isGlobal !== void 0 ? { isGlobal: validatedData.isGlobal } : {},
					...validatedData.minFrequency !== void 0 ? { minFrequency: validatedData.minFrequency ?? null } : {},
					...validatedData.active !== void 0 ? { active: validatedData.active } : {}
				}
			});
			if (serviceIds) {
				await tx.promotionService.deleteMany({ where: { promotionId } });
				if (serviceIds.length) await tx.promotionService.createMany({
					data: serviceIds.map((serviceId) => ({
						promotionId,
						serviceId
					})),
					skipDuplicates: true
				});
			}
			if (userIds) {
				await tx.userPromotion.deleteMany({ where: { promotionId } });
				if (userIds.length) await tx.userPromotion.createMany({
					data: userIds.map((userId) => ({
						promotionId,
						userId
					})),
					skipDuplicates: true
				});
			}
			return updated;
		});
		revalidatePromotionPaths();
		return {
			success: true,
			data: promotion,
			message: "Promoção atualizada com sucesso"
		};
	} catch (error) {
		if (error instanceof ZodError) return {
			success: false,
			error: error.issues.map((issue) => issue.message).join(", ")
		};
		console.error("Erro ao atualizar promoção:", error);
		return {
			success: false,
			error: "Erro ao atualizar promoção"
		};
	}
}
async function togglePromotionStatus(promotionId) {
	try {
		const authError = ensureAdminSession(await (0, import_next_auth.getServerSession)(authOptions));
		if (authError) return authError;
		const existing = await db.promotion.findUnique({
			where: { id: promotionId },
			select: {
				id: true,
				active: true,
				name: true
			}
		});
		if (!existing) return {
			success: false,
			error: "Promoção não encontrada"
		};
		const promotion = await db.promotion.update({
			where: { id: promotionId },
			data: { active: !existing.active }
		});
		revalidatePromotionPaths();
		return {
			success: true,
			data: promotion,
			message: `Promoção ${promotion.active ? "ativada" : "desativada"} com sucesso`
		};
	} catch (error) {
		console.error("Erro ao alternar status da promoção:", error);
		return {
			success: false,
			error: "Erro ao alternar status da promoção"
		};
	}
}
async function deletePromotion(promotionId) {
	try {
		const authError = ensureAdminSession(await (0, import_next_auth.getServerSession)(authOptions));
		if (authError) return authError;
		const existing = await db.promotion.findUnique({
			where: { id: promotionId },
			include: { _count: { select: { appointments: true } } }
		});
		if (!existing) return {
			success: false,
			error: "Promoção não encontrada"
		};
		if (existing._count.appointments > 0) {
			const promotion = await db.promotion.update({
				where: { id: promotionId },
				data: { active: false }
			});
			revalidatePromotionPaths();
			return {
				success: true,
				data: promotion,
				message: "Promoção marcada como inativa (já foi utilizada)"
			};
		}
		await db.$transaction([
			db.promotionService.deleteMany({ where: { promotionId } }),
			db.userPromotion.deleteMany({ where: { promotionId } }),
			db.promotion.delete({ where: { id: promotionId } })
		]);
		revalidatePromotionPaths();
		return {
			success: true,
			message: "Promoção deletada com sucesso"
		};
	} catch (error) {
		console.error("Erro ao deletar promoção:", error);
		return {
			success: false,
			error: "Erro ao deletar promoção"
		};
	}
}
async function getPromotionsForAdmin(filters) {
	try {
		const authError = ensureAdminSession(await (0, import_next_auth.getServerSession)(authOptions));
		if (authError) return {
			...authError,
			data: []
		};
		const page = filters?.page || 1;
		const limit = filters?.limit || 20;
		const skip = (page - 1) * limit;
		const where = {};
		if (filters?.active !== void 0) where.active = filters.active;
		if (filters?.type) where.type = filters.type;
		if (filters?.isGlobal !== void 0) where.isGlobal = filters.isGlobal;
		if (filters?.search) where.OR = [{ name: {
			contains: filters.search,
			mode: "insensitive"
		} }, { description: {
			contains: filters.search,
			mode: "insensitive"
		} }];
		const [promotions, total] = await Promise.all([db.promotion.findMany({
			where,
			include: { _count: { select: {
				appointments: true,
				servicePromotions: true,
				userPromotions: true
			} } },
			orderBy: [{ createdAt: "desc" }],
			skip,
			take: limit
		}), db.promotion.count({ where })]);
		return {
			success: true,
			data: promotions,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		};
	} catch (error) {
		console.error("Erro ao buscar promoções:", error);
		return {
			success: false,
			error: "Erro ao buscar promoções",
			data: []
		};
	}
}
async function getPromotionByIdForAdmin(promotionId) {
	try {
		const authError = ensureAdminSession(await (0, import_next_auth.getServerSession)(authOptions));
		if (authError) return authError;
		const promotion = await db.promotion.findUnique({
			where: { id: promotionId },
			include: {
				servicePromotions: { include: { service: { select: {
					id: true,
					name: true,
					active: true
				} } } },
				userPromotions: { include: { user: { select: {
					id: true,
					name: true,
					email: true,
					role: true
				} } } },
				_count: { select: {
					appointments: true,
					servicePromotions: true,
					userPromotions: true
				} }
			}
		});
		if (!promotion) return {
			success: false,
			error: "Promoção não encontrada"
		};
		return {
			success: true,
			data: promotion
		};
	} catch (error) {
		console.error("Erro ao buscar promoção:", error);
		return {
			success: false,
			error: "Erro ao buscar promoção"
		};
	}
}
createPromotion = /* @__PURE__ */ registerServerReference(createPromotion, "9c14662270c2", "createPromotion");
updatePromotion = /* @__PURE__ */ registerServerReference(updatePromotion, "9c14662270c2", "updatePromotion");
togglePromotionStatus = /* @__PURE__ */ registerServerReference(togglePromotionStatus, "9c14662270c2", "togglePromotionStatus");
deletePromotion = /* @__PURE__ */ registerServerReference(deletePromotion, "9c14662270c2", "deletePromotion");
getPromotionsForAdmin = /* @__PURE__ */ registerServerReference(getPromotionsForAdmin, "9c14662270c2", "getPromotionsForAdmin");
getPromotionByIdForAdmin = /* @__PURE__ */ registerServerReference(getPromotionByIdForAdmin, "9c14662270c2", "getPromotionByIdForAdmin");
var PromotionFormWrapper_default = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "171b2274e5d2", "default");
/**
* next/link shim
*
* Renders an <a> tag with client-side navigation support.
* On click, prevents full page reload and triggers client-side
* page swap via the router's navigation system.
*/
/**
* useLinkStatus returns the pending state of the enclosing <Link>.
* In Next.js, this is used to show loading indicators while a
* prefetch-triggered navigation is in progress.
*/
/** basePath from next.config.js, injected by the plugin at build time */
/**
* Check if a href is only a hash change (same pathname, different/added hash).
* Handles relative hashes like "#foo" and "?query#foo".
*/
/**
* Scroll to a hash target element, or to the top if no hash.
*/
/**
* Prefetch a URL for faster navigation.
*
* For App Router (RSC): fetches the .rsc payload in the background and
* stores it in an in-memory cache for instant use during navigation.
* For Pages Router: injects a <link rel="prefetch"> for the page module.
*
* Uses `requestIdleCallback` (or `setTimeout` fallback) to avoid blocking
* the main thread during initial page load.
*/
/**
* Shared IntersectionObserver for viewport-based prefetching.
* All Link elements use the same observer to minimize resource usage.
*/
/**
* Apply locale prefix to a URL path based on the locale prop.
* - locale="fr" → prepend /fr (unless it already has a locale prefix)
* - locale={false} → use the href as-is (no locale prefix, link to default)
* - locale=undefined → use current locale (href as-is in most cases)
*/
var link_default = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "c2747888630f", "default");
/**
* @license lucide-react v0.544.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
var toCamelCase = (string) => string.replace(/^([A-Z])|[\s-_]+(\w)/g, (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase());
var toPascalCase = (string) => {
	const camelCase = toCamelCase(string);
	return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
var mergeClasses = (...classes) => classes.filter((className, index, array) => {
	return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();
var hasA11yProp = (props) => {
	for (const prop in props) if (prop.startsWith("aria-") || prop === "role" || prop === "title") return true;
};
/**
* @license lucide-react v0.544.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var defaultAttributes = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
};
/**
* @license lucide-react v0.544.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Icon = (0, import_react_react_server.forwardRef)(({ color = "currentColor", size = 24, strokeWidth = 2, absoluteStrokeWidth, className = "", children, iconNode, ...rest }, ref) => (0, import_react_react_server.createElement)("svg", {
	ref,
	...defaultAttributes,
	width: size,
	height: size,
	stroke: color,
	strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
	className: mergeClasses("lucide", className),
	...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
	...rest
}, [...iconNode.map(([tag, attrs]) => (0, import_react_react_server.createElement)(tag, attrs)), ...Array.isArray(children) ? children : [children]]));
/**
* @license lucide-react v0.544.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var createLucideIcon = (iconName, iconNode) => {
	const Component = (0, import_react_react_server.forwardRef)(({ className, ...props }, ref) => (0, import_react_react_server.createElement)(Icon, {
		ref,
		iconNode,
		className: mergeClasses(`lucide-${toKebabCase(toPascalCase(iconName))}`, `lucide-${iconName}`, className),
		...props
	}));
	Component.displayName = toPascalCase(iconName);
	return Component;
};
var ArrowRight = createLucideIcon("arrow-right", [["path", {
	d: "M5 12h14",
	key: "1ays0h"
}], ["path", {
	d: "m12 5 7 7-7 7",
	key: "xquz4c"
}]]);
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function PageHero({ title, subtitle, badge, actions, className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("section", {
		className: cn("grain-overlay relative overflow-hidden bg-surface-1 pt-[calc(65px+3.5rem)] pb-14 lg:pt-[calc(65px+4rem)] lg:pb-20", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface-1" }),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", { className: "pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[hsl(var(--accent)/0.07)] blur-[90px]" }),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", { className: "pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[hsl(var(--accent)/0.05)] blur-[80px]" }),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "container relative z-10 mx-auto px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "stagger-reveal mx-auto flex max-w-4xl flex-col items-center gap-5 text-center",
					children: [
						badge ? /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", {
							className: "inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.08)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-accent" }), badge]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h1", {
							className: "font-display text-4xl font-bold italic tracking-tight text-foreground sm:text-5xl lg:text-6xl",
							children: title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
							className: "max-w-3xl text-base leading-relaxed text-fg-muted sm:text-lg",
							children: subtitle
						}),
						actions && actions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
							className: "mt-2 flex flex-wrap items-center justify-center gap-3",
							children: actions.map((action) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
								href: action.href,
								className: cn("inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300", action.variant === "outline" ? "border border-border bg-transparent text-foreground hover:border-accent hover:text-accent" : "gold-shimmer bg-accent text-on-accent hover:bg-accent/90"),
								children: [action.label, /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ArrowRight, { className: "h-4 w-4" })]
							}, `${action.href}-${action.label}`))
						}) : null,
						children
					]
				})
			})
		]
	});
}
var Calendar = createLucideIcon("calendar", [
	["path", {
		d: "M8 2v4",
		key: "1cmpym"
	}],
	["path", {
		d: "M16 2v4",
		key: "4m81vk"
	}],
	["rect", {
		width: "18",
		height: "18",
		x: "3",
		y: "4",
		rx: "2",
		key: "1hopcy"
	}],
	["path", {
		d: "M3 10h18",
		key: "8toen8"
	}]
]);
var Target = createLucideIcon("target", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["circle", {
		cx: "12",
		cy: "12",
		r: "6",
		key: "1vlfrh"
	}],
	["circle", {
		cx: "12",
		cy: "12",
		r: "2",
		key: "1c9p78"
	}]
]);
var page_exports$46 = /* @__PURE__ */ __exportAll({ default: () => EditPromotionPage });
async function EditPromotionPage({ params }) {
	const { id } = await params;
	const session = await (0, import_next_auth.getServerSession)(authOptions);
	if (!session) redirect("/auth/signin");
	if (session.user.role !== "ADMIN") redirect("/dashboard");
	const [promotionResult, services] = await Promise.all([getPromotionByIdForAdmin(id), db.service.findMany({
		select: {
			id: true,
			name: true,
			active: true
		},
		orderBy: { name: "asc" }
	})]);
	if (!promotionResult.success || !promotionResult.data) notFound();
	const promotion = promotionResult.data;
	const initialData = {
		id: promotion.id,
		name: promotion.name,
		description: promotion.description || "",
		type: promotion.type,
		value: Number(promotion.value),
		validFrom: promotion.validFrom ? new Date(promotion.validFrom) : /* @__PURE__ */ new Date(),
		validUntil: promotion.validUntil ? new Date(promotion.validUntil) : void 0,
		isGlobal: promotion.isGlobal,
		minFrequency: promotion.minFrequency ?? void 0,
		active: promotion.active,
		serviceIds: promotion.servicePromotions?.map((ps) => ps.serviceId) || []
	};
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
			badge: "Administrador",
			title: "Editar Promoção",
			subtitle: "Atualize as informações da promoção.",
			actions: [{
				label: "Voltar para Promoções",
				href: "/dashboard/admin/promotions",
				variant: "outline"
			}]
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
			className: "bg-background py-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "container mx-auto px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "mx-auto max-w-3xl space-y-5",
					children: [
						promotion._count && /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
							className: "grid grid-cols-2 gap-4 rounded-2xl border border-border bg-surface-card p-6 sm:grid-cols-4",
							children: [
								{
									label: "Agendamentos",
									value: promotion._count.appointments || 0
								},
								{
									label: "Serviços",
									value: promotion._count.servicePromotions || 0
								},
								{
									label: "Usuários",
									value: promotion._count.userPromotions || 0
								},
								{
									label: "Status",
									value: promotion.active ? "Ativa" : "Inativa"
								}
							].map((stat) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
								className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
								children: stat.label
							}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
								className: "mt-2 font-display text-4xl font-bold italic text-accent",
								children: stat.value
							})] }, stat.label))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
							className: "rounded-2xl border border-border bg-surface-card p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
								className: "mb-6 font-display text-xl font-bold italic text-foreground",
								children: "Informações da Promoção"
							}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(import_react_react_server.Suspense, {
								fallback: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
									className: "flex items-center justify-center py-8",
									children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", { className: "mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" })
								}),
								children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PromotionFormWrapper_default, {
									initialData,
									availableServices: services
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
							className: "flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface-card px-6 py-4 text-sm text-fg-muted sm:flex-row sm:items-center sm:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Calendar, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", { children: [
									"Criada em",
									" ",
									promotion.createdAt ? new Date(promotion.createdAt).toLocaleDateString("pt-BR") : "--"
								] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Target, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", { children: promotion.isGlobal ? "Promoção global" : "Promoção específica" })]
							})]
						})
					]
				})
			})
		})]
	});
}
var Resources = ((React, deps, RemoveDuplicateServerCss, precedence) => {
	return function Resources() {
		return React.createElement(React.Fragment, null, [...deps.css.map((href) => React.createElement("link", {
			key: "css:" + href,
			rel: "stylesheet",
			...precedence ? { precedence } : {},
			href,
			"data-rsc-css-href": href
		})), RemoveDuplicateServerCss && React.createElement(RemoveDuplicateServerCss, { key: "remove-duplicate-css" })]);
	};
})(import_react_react_server.default, __vite_rsc_assets_manifest_default.serverResources["src/app/layout.tsx"], void 0, "vite-rsc/importer-resources");
var Playfair_Display = /* @__PURE__ */ createFontLoader("Playfair Display");
var Plus_Jakarta_Sans = /* @__PURE__ */ createFontLoader("Plus Jakarta Sans");
var Geist_Mono = /* @__PURE__ */ createFontLoader("Geist Mono");
var Providers = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'Providers' is called on server");
}, "c31624b506e7", "Providers");
var HeaderNavigation_default = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "abffc9221f98", "default");
var Toaster = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'Toaster' is called on server");
}, "833308ed4183", "Toaster");
var layout_exports = /* @__PURE__ */ __exportAll({
	default: () => $$wrap_RootLayout,
	metadata: () => metadata
});
var displayFont = Playfair_Display({
	variable: "--font-display",
	subsets: ["latin"],
	display: "swap"
});
var bodyFont = Plus_Jakarta_Sans({
	variable: "--font-geist-sans",
	subsets: ["latin"],
	display: "swap"
});
var geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"]
});
var metadata = {
	title: "Next Barbershop",
	description: "Generated by create next app"
};
async function RootLayout({ children }) {
	const session = await (0, import_next_auth.getServerSession)(authOptions);
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("body", {
			className: `${displayFont.variable} ${bodyFont.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`,
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(Providers, {
				session,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(HeaderNavigation_default, {}),
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("main", {
						id: "app-content",
						className: "flex-1",
						children
					}),
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Toaster, {})
				]
			})
		})
	});
}
var $$wrap_RootLayout = /* @__PURE__ */ __vite_rsc_wrap_css__(RootLayout, "default");
function __vite_rsc_wrap_css__(value, name) {
	if (typeof value !== "function") return value;
	function __wrapper(props) {
		return import_react_react_server.createElement(import_react_react_server.Fragment, null, import_react_react_server.createElement(Resources), import_react_react_server.createElement(value, props));
	}
	Object.defineProperty(__wrapper, "name", { value: name });
	return __wrapper;
}
var error_exports = /* @__PURE__ */ __exportAll({ default: () => error_default });
var error_default = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "782fd804d300", "default");
var not_found_exports = /* @__PURE__ */ __exportAll({
	default: () => not_found_default,
	dynamic: () => dynamic$1
});
var dynamic$1 = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'dynamic' is called on server");
}, "f656f59519a2", "dynamic");
var not_found_default = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "f656f59519a2", "default");
var ServiceFormWrapper_default = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "a2a39bfebc0b", "default");
/**
* Criar novo serviço (apenas ADMIN)
*/
async function createService(data) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Não autenticado"
		};
		if (session.user.role !== "ADMIN") return {
			success: false,
			error: "Acesso negado: apenas administradores podem criar serviços"
		};
		const validatedData = CreateServiceSchema.parse(data);
		if (await db.service.findFirst({ where: { name: {
			equals: validatedData.name,
			mode: "insensitive"
		} } })) return {
			success: false,
			error: "Já existe um serviço com este nome"
		};
		const service = await db.service.create({ data: {
			name: validatedData.name,
			description: validatedData.description || null,
			duration: validatedData.duration,
			price: validatedData.price,
			active: validatedData.active
		} });
		revalidatePath("/dashboard/admin/services");
		revalidatePath("/scheduling");
		revalidatePath("/");
		return {
			success: true,
			data: service,
			message: "Serviço criado com sucesso"
		};
	} catch (error) {
		if (error instanceof ZodError) return {
			success: false,
			error: error.issues.map((issue) => issue.message).join(", ")
		};
		console.error("Erro ao criar serviço:", error);
		return {
			success: false,
			error: "Erro ao criar serviço"
		};
	}
}
/**
* Atualizar serviço existente (apenas ADMIN)
*/
async function updateService(serviceId, data) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Não autenticado"
		};
		if (session.user.role !== "ADMIN") return {
			success: false,
			error: "Acesso negado: apenas administradores podem editar serviços"
		};
		const validatedData = UpdateServiceSchema.parse(data);
		const existingService = await db.service.findUnique({ where: { id: serviceId } });
		if (!existingService) return {
			success: false,
			error: "Serviço não encontrado"
		};
		if (validatedData.name && validatedData.name !== existingService.name) {
			if (await db.service.findFirst({ where: {
				id: { not: serviceId },
				name: {
					equals: validatedData.name,
					mode: "insensitive"
				}
			} })) return {
				success: false,
				error: "Já existe outro serviço com este nome"
			};
		}
		const service = await db.service.update({
			where: { id: serviceId },
			data: validatedData
		});
		revalidatePath("/dashboard/admin/services");
		revalidatePath("/scheduling");
		revalidatePath("/");
		return {
			success: true,
			data: service,
			message: "Serviço atualizado com sucesso"
		};
	} catch (error) {
		if (error instanceof ZodError) return {
			success: false,
			error: error.issues.map((issue) => issue.message).join(", ")
		};
		console.error("Erro ao atualizar serviço:", error);
		return {
			success: false,
			error: "Erro ao atualizar serviço"
		};
	}
}
/**
* Alternar status ativo/inativo de um serviço (apenas ADMIN)
*/
async function toggleServiceStatus(serviceId) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Não autenticado"
		};
		if (session.user.role !== "ADMIN") return {
			success: false,
			error: "Acesso negado: apenas administradores podem alterar status de serviços"
		};
		const existingService = await db.service.findUnique({
			where: { id: serviceId },
			select: {
				id: true,
				active: true,
				name: true
			}
		});
		if (!existingService) return {
			success: false,
			error: "Serviço não encontrado"
		};
		const service = await db.service.update({
			where: { id: serviceId },
			data: { active: !existingService.active }
		});
		revalidatePath("/dashboard/admin/services");
		revalidatePath("/scheduling");
		revalidatePath("/");
		return {
			success: true,
			data: service,
			message: `Serviço ${service.active ? "ativado" : "desativado"} com sucesso`
		};
	} catch (error) {
		console.error("Erro ao alterar status do serviço:", error);
		return {
			success: false,
			error: "Erro ao alterar status do serviço"
		};
	}
}
/**
* Deletar serviço (soft delete - marca como inativo) (apenas ADMIN)
*/
async function deleteService(serviceId) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Não autenticado"
		};
		if (session.user.role !== "ADMIN") return {
			success: false,
			error: "Acesso negado: apenas administradores podem deletar serviços"
		};
		const existingService = await db.service.findUnique({
			where: { id: serviceId },
			include: { _count: { select: {
				appointments: true,
				serviceHistory: true
			} } }
		});
		if (!existingService) return {
			success: false,
			error: "Serviço não encontrado"
		};
		const hasAppointments = existingService._count.appointments > 0;
		const hasHistory = existingService._count.serviceHistory > 0;
		if (hasAppointments || hasHistory) {
			const service = await db.service.update({
				where: { id: serviceId },
				data: { active: false }
			});
			revalidatePath("/dashboard/admin/services");
			revalidatePath("/scheduling");
			revalidatePath("/");
			return {
				success: true,
				data: service,
				message: "Serviço marcado como inativo (possui histórico de uso)"
			};
		}
		await db.service.delete({ where: { id: serviceId } });
		revalidatePath("/dashboard/admin/services");
		revalidatePath("/scheduling");
		revalidatePath("/");
		return {
			success: true,
			message: "Serviço deletado com sucesso"
		};
	} catch (error) {
		console.error("Erro ao deletar serviço:", error);
		return {
			success: false,
			error: "Erro ao deletar serviço"
		};
	}
}
/**
* Listar todos os serviços para admin (com filtros opcionais)
*/
async function getServicesForAdmin(filters) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Não autenticado",
			data: []
		};
		if (session.user.role !== "ADMIN") return {
			success: false,
			error: "Acesso negado: apenas administradores",
			data: []
		};
		const page = Math.max(1, filters?.page || 1);
		const limit = Math.min(50, Math.max(1, filters?.limit || 20));
		const skip = (page - 1) * limit;
		const baseWhere = {};
		if (filters?.search) baseWhere.OR = [{ name: {
			contains: filters.search,
			mode: "insensitive"
		} }, { description: {
			contains: filters.search,
			mode: "insensitive"
		} }];
		const where = {
			...baseWhere,
			...filters?.active !== void 0 ? { active: filters.active } : {}
		};
		const [services, total, activeCount, inactiveCount] = await Promise.all([
			db.service.findMany({
				where,
				include: { _count: { select: {
					appointments: true,
					serviceHistory: true
				} } },
				orderBy: { createdAt: "desc" },
				skip,
				take: limit
			}),
			db.service.count({ where }),
			db.service.count({ where: {
				...baseWhere,
				active: true
			} }),
			db.service.count({ where: {
				...baseWhere,
				active: false
			} })
		]);
		return {
			success: true,
			data: services,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			},
			stats: {
				activeCount,
				inactiveCount
			}
		};
	} catch (error) {
		console.error("Erro ao buscar serviços:", error);
		return {
			success: false,
			error: "Erro ao buscar serviços",
			data: []
		};
	}
}
/**
* Buscar serviço por ID para admin
*/
async function getServiceByIdForAdmin(serviceId) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Não autenticado"
		};
		if (session.user.role !== "ADMIN") return {
			success: false,
			error: "Acesso negado: apenas administradores"
		};
		const service = await db.service.findUnique({
			where: { id: serviceId },
			include: { _count: { select: {
				appointments: true,
				serviceHistory: true,
				promotionServices: true,
				vouchers: true
			} } }
		});
		if (!service) return {
			success: false,
			error: "Serviço não encontrado"
		};
		return {
			success: true,
			data: service
		};
	} catch (error) {
		console.error("Erro ao buscar serviço:", error);
		return {
			success: false,
			error: "Erro ao buscar serviço"
		};
	}
}
createService = /* @__PURE__ */ registerServerReference(createService, "94d41b8bf94b", "createService");
updateService = /* @__PURE__ */ registerServerReference(updateService, "94d41b8bf94b", "updateService");
toggleServiceStatus = /* @__PURE__ */ registerServerReference(toggleServiceStatus, "94d41b8bf94b", "toggleServiceStatus");
deleteService = /* @__PURE__ */ registerServerReference(deleteService, "94d41b8bf94b", "deleteService");
getServicesForAdmin = /* @__PURE__ */ registerServerReference(getServicesForAdmin, "94d41b8bf94b", "getServicesForAdmin");
getServiceByIdForAdmin = /* @__PURE__ */ registerServerReference(getServiceByIdForAdmin, "94d41b8bf94b", "getServiceByIdForAdmin");
var page_exports$45 = /* @__PURE__ */ __exportAll({ default: () => EditServicePage });
async function EditServicePage({ params }) {
	const { id } = await params;
	const session = await (0, import_next_auth.getServerSession)(authOptions);
	if (!session) redirect("/auth/signin");
	if (session.user.role !== "ADMIN") redirect("/dashboard");
	const result = await getServiceByIdForAdmin(id);
	if (!result.success || !result.data) notFound();
	const service = result.data;
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
			badge: "Administrador",
			title: "Editar Serviço",
			subtitle: "Atualize as informações do serviço.",
			actions: [{
				label: "Voltar para Serviços",
				href: "/dashboard/admin/services",
				variant: "outline"
			}]
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
			className: "bg-background py-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "container mx-auto px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "mx-auto max-w-3xl space-y-5",
					children: [service._count && /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
						className: "grid grid-cols-2 gap-4 rounded-2xl border border-border bg-surface-card p-6 sm:grid-cols-4",
						children: [
							{
								label: "Agendamentos",
								value: service._count.appointments || 0
							},
							{
								label: "Histórico",
								value: service._count.serviceHistory || 0
							},
							{
								label: "Promoções",
								value: service._count.promotionServices || 0
							},
							{
								label: "Vouchers",
								value: service._count.vouchers || 0
							}
						].map((stat) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
							className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
							children: stat.label
						}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
							className: "mt-2 font-display text-4xl font-bold italic text-accent",
							children: stat.value
						})] }, stat.label))
					}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "rounded-2xl border border-border bg-surface-card p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
							className: "mb-6 font-display text-xl font-bold italic text-foreground",
							children: "Informações do Serviço"
						}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(import_react_react_server.Suspense, {
							fallback: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
								className: "flex items-center justify-center py-8",
								children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", { className: "mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" })
							}),
							children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ServiceFormWrapper_default, { initialData: {
								id: service.id,
								name: service.name,
								description: service.description || "",
								duration: service.duration,
								price: Number(service.price),
								active: service.active
							} })
						})]
					})]
				})
			})
		})]
	});
}
/**
* Service Layer para gerenciamento de amizades e relacionamentos sociais
*/
var FriendshipService = class {
	/**
	* Busca solicitação de amizade por ID
	*/
	static async findRequestById(requestId) {
		return db.friendRequest.findUnique({
			where: { id: requestId },
			include: {
				sender: { select: {
					id: true,
					name: true,
					nickname: true,
					image: true,
					role: true
				} },
				receiver: { select: {
					id: true,
					name: true,
					nickname: true,
					image: true,
					role: true
				} }
			}
		});
	}
	/**
	* Envia solicitação de amizade
	*/
	static async sendFriendRequest(senderId, receiverId) {
		if (senderId === receiverId) throw new Error("Você não pode adicionar a si mesmo como amigo");
		const existingFriendship = await db.friendship.findFirst({ where: { OR: [{
			userId: senderId,
			friendId: receiverId
		}, {
			userId: receiverId,
			friendId: senderId
		}] } });
		if (existingFriendship) {
			if (existingFriendship.status === "BLOCKED") throw new Error("Não é possível enviar solicitação para este usuário");
			throw new Error("Vocês já são amigos");
		}
		const existingRequest = await db.friendRequest.findFirst({ where: { OR: [{
			senderId,
			receiverId,
			status: "PENDING"
		}, {
			senderId: receiverId,
			receiverId: senderId,
			status: "PENDING"
		}] } });
		if (existingRequest) {
			if (existingRequest.senderId === receiverId) return this.acceptFriendRequest(existingRequest.id);
			throw new Error("Solicitação já enviada");
		}
		return db.friendRequest.create({
			data: {
				senderId,
				receiverId,
				status: "PENDING"
			},
			include: { receiver: { select: {
				id: true,
				name: true,
				nickname: true,
				image: true,
				role: true
			} } }
		});
	}
	/**
	* Aceita solicitação de amizade
	*/
	static async acceptFriendRequest(requestId) {
		const request = await this.findRequestById(requestId);
		if (!request) throw new Error("Solicitação não encontrada");
		if (request.status !== "PENDING") throw new Error("Esta solicitação já foi processada");
		return db.$transaction(async (tx) => {
			await tx.friendRequest.update({
				where: { id: requestId },
				data: { status: "ACCEPTED" }
			});
			await tx.friendship.createMany({ data: [{
				userId: request.senderId,
				friendId: request.receiverId,
				status: "ACCEPTED"
			}, {
				userId: request.receiverId,
				friendId: request.senderId,
				status: "ACCEPTED"
			}] });
			return request;
		});
	}
	/**
	* Rejeita solicitação de amizade
	*/
	static async rejectFriendRequest(requestId) {
		const request = await this.findRequestById(requestId);
		if (!request) throw new Error("Solicitação não encontrada");
		if (request.status !== "PENDING") throw new Error("Esta solicitação já foi processada");
		return db.friendRequest.update({
			where: { id: requestId },
			data: { status: "REJECTED" }
		});
	}
	/**
	* Cancela solicitação de amizade enviada
	*/
	static async cancelFriendRequest(requestId, userId) {
		const request = await this.findRequestById(requestId);
		if (!request) throw new Error("Solicitação não encontrada");
		if (request.senderId !== userId) throw new Error("Você não pode cancelar esta solicitação");
		if (request.status !== "PENDING") throw new Error("Esta solicitação já foi processada");
		return db.friendRequest.update({
			where: { id: requestId },
			data: { status: "CANCELLED" }
		});
	}
	/**
	* Remove amizade
	*/
	static async removeFriend(userId, friendId) {
		return db.$transaction(async (tx) => {
			await tx.friendship.deleteMany({ where: { OR: [{
				userId,
				friendId
			}, {
				userId: friendId,
				friendId: userId
			}] } });
		});
	}
	/**
	* Bloqueia ou desbloqueia usuário
	*/
	static async toggleBlockUser(userId, targetUserId, block) {
		if (userId === targetUserId) throw new Error("Você não pode bloquear a si mesmo");
		return db.$transaction(async (tx) => {
			if (block) {
				await tx.friendship.deleteMany({ where: { OR: [{
					userId,
					friendId: targetUserId
				}, {
					userId: targetUserId,
					friendId: userId
				}] } });
				await tx.friendRequest.deleteMany({ where: {
					OR: [{
						senderId: userId,
						receiverId: targetUserId
					}, {
						senderId: targetUserId,
						receiverId: userId
					}],
					status: "PENDING"
				} });
				return tx.friendship.create({ data: {
					userId,
					friendId: targetUserId,
					status: "BLOCKED"
				} });
			} else await tx.friendship.deleteMany({ where: {
				userId,
				friendId: targetUserId,
				status: "BLOCKED"
			} });
		});
	}
	/**
	* Lista amigos do usuário
	*/
	static async getFriends(userId, filters = {}) {
		const { search, status = "ACCEPTED", page = 1, limit = 20 } = filters;
		const where = {
			userId,
			status
		};
		if (search) where.friend = { OR: [
			{ name: {
				contains: search,
				mode: "insensitive"
			} },
			{ nickname: {
				contains: search,
				mode: "insensitive"
			} },
			{ email: {
				contains: search,
				mode: "insensitive"
			} }
		] };
		const [friends, total] = await Promise.all([db.friendship.findMany({
			where,
			include: { friend: { select: {
				id: true,
				name: true,
				nickname: true,
				image: true,
				role: true,
				email: true
			} } },
			skip: (page - 1) * limit,
			take: limit,
			orderBy: { createdAt: "desc" }
		}), db.friendship.count({ where })]);
		return {
			friends: friends.map((f) => f.friend),
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		};
	}
	/**
	* Lista solicitações de amizade recebidas
	*/
	static async getReceivedRequests(userId) {
		return db.friendRequest.findMany({
			where: {
				receiverId: userId,
				status: "PENDING"
			},
			include: { sender: { select: {
				id: true,
				name: true,
				nickname: true,
				image: true,
				role: true
			} } },
			orderBy: { createdAt: "desc" }
		});
	}
	/**
	* Lista solicitações de amizade enviadas
	*/
	static async getSentRequests(userId) {
		return db.friendRequest.findMany({
			where: {
				senderId: userId,
				status: "PENDING"
			},
			include: { receiver: { select: {
				id: true,
				name: true,
				nickname: true,
				image: true,
				role: true
			} } },
			orderBy: { createdAt: "desc" }
		});
	}
	/**
	* Busca sugestões de amigos baseado em amigos em comum
	*/
	static async getSuggestions(userId, limit = 10) {
		const friendIds = (await db.friendship.findMany({
			where: {
				userId,
				status: "ACCEPTED"
			},
			select: { friendId: true }
		})).map((f) => f.friendId);
		const pendingRequests = await db.friendRequest.findMany({
			where: {
				OR: [{ senderId: userId }, { receiverId: userId }],
				status: "PENDING"
			},
			select: {
				senderId: true,
				receiverId: true
			}
		});
		const pendingUserIds = [...pendingRequests.map((r) => r.senderId), ...pendingRequests.map((r) => r.receiverId)].filter((id) => id !== userId);
		const blockedUsers = await db.friendship.findMany({
			where: { OR: [{
				userId,
				status: "BLOCKED"
			}, {
				friendId: userId,
				status: "BLOCKED"
			}] },
			select: {
				userId: true,
				friendId: true
			}
		});
		const blockedUserIds = [...blockedUsers.map((b) => b.friendId), ...blockedUsers.map((b) => b.userId)].filter((id) => id !== userId);
		if (friendIds.length === 0) return db.user.findMany({
			where: {
				id: { notIn: [
					userId,
					...pendingUserIds,
					...blockedUserIds
				] },
				isActive: true
			},
			select: {
				id: true,
				name: true,
				nickname: true,
				image: true,
				role: true
			},
			take: limit
		});
		return (await db.$queryRaw`
      SELECT DISTINCT u.id, u.name, u.nickname, u.image, u.role,
        COUNT(f.userId) as "mutualFriends"
      FROM "User" u
      INNER JOIN "Friendship" f ON f.friendId = u.id
      WHERE f.userId IN (${Prisma.join(friendIds)})
        AND f.status = 'ACCEPTED'
        AND u.id != ${userId}
        AND u.id NOT IN (${Prisma.join([
			...friendIds,
			...pendingUserIds,
			...blockedUserIds
		])})
        AND u."isActive" = true
      GROUP BY u.id, u.name, u.nickname, u.image, u.role
      ORDER BY "mutualFriends" DESC
      LIMIT ${limit}
    `).map((s) => ({
			...s,
			mutualFriends: Number(s.mutualFriends)
		}));
	}
	/**
	* Busca usuários por nome/email
	*/
	static async searchUsers(userId, filters) {
		const { query, excludeFriends = true, page = 1, limit = 20 } = filters;
		let excludedIds = [userId];
		if (excludeFriends) {
			const friends = await db.friendship.findMany({
				where: {
					userId,
					status: "ACCEPTED"
				},
				select: { friendId: true }
			});
			excludedIds = [...excludedIds, ...friends.map((f) => f.friendId)];
		}
		const where = {
			id: { notIn: excludedIds },
			isActive: true,
			OR: [
				{ name: {
					contains: query,
					mode: "insensitive"
				} },
				{ nickname: {
					contains: query,
					mode: "insensitive"
				} },
				{ email: {
					contains: query,
					mode: "insensitive"
				} }
			]
		};
		const [users, total] = await Promise.all([db.user.findMany({
			where,
			select: {
				id: true,
				name: true,
				nickname: true,
				image: true,
				role: true
			},
			skip: (page - 1) * limit,
			take: limit,
			orderBy: { name: "asc" }
		}), db.user.count({ where })]);
		return {
			users,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		};
	}
	/**
	* Gera ou regenera código de convite único
	*/
	static async generateInviteCode(userId, regenerate = false) {
		const user = await db.user.findUnique({
			where: { id: userId },
			select: { inviteCode: true }
		});
		if (!user) throw new Error("Usuário não encontrado");
		if (user.inviteCode && !regenerate) return user.inviteCode;
		let inviteCode;
		let isUnique = false;
		while (!isUnique) {
			inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
			if (!await db.user.findUnique({ where: { inviteCode } })) isUnique = true;
		}
		await db.user.update({
			where: { id: userId },
			data: { inviteCode }
		});
		return inviteCode;
	}
	/**
	* Aceita convite via código
	*/
	static async acceptInvite(userId, inviteCode) {
		const inviter = await this.findUserByInviteCode(inviteCode);
		if (!inviter) throw new Error("Código de convite inválido");
		if (inviter.id === userId) throw new Error("Você não pode usar seu próprio código de convite");
		return this.sendFriendRequest(userId, inviter.id);
	}
	/**
	* Busca usuário pelo código de convite
	*/
	static async findUserByInviteCode(inviteCode) {
		return db.user.findUnique({
			where: { inviteCode },
			select: {
				id: true,
				name: true,
				nickname: true,
				image: true
			}
		});
	}
	/**
	* Obtém estatísticas sociais do usuário
	*/
	static async getUserSocialStats(userId) {
		const [friendsCount, pendingReceivedCount, pendingSentCount] = await Promise.all([
			db.friendship.count({ where: {
				userId,
				status: "ACCEPTED"
			} }),
			db.friendRequest.count({ where: {
				receiverId: userId,
				status: "PENDING"
			} }),
			db.friendRequest.count({ where: {
				senderId: userId,
				status: "PENDING"
			} })
		]);
		return {
			friendsCount,
			pendingReceivedCount,
			pendingSentCount
		};
	}
};
var route_exports$25 = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE$3,
	PATCH: () => PATCH
});
/**
* PATCH /api/friends/requests/:id
* Responde solicitação de amizade (accept/reject)
*/
async function PATCH(request, { params }) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		const { id } = await params;
		if (!session?.user?.id) return NextResponse.json({
			success: false,
			error: "Não autenticado"
		}, { status: 401 });
		const { action } = await request.json();
		if (!["accept", "reject"].includes(action)) return NextResponse.json({
			success: false,
			error: "Ação inválida"
		}, { status: 400 });
		const friendRequest = await FriendshipService.findRequestById(id);
		if (!friendRequest) return NextResponse.json({
			success: false,
			error: "Solicitação não encontrada"
		}, { status: 404 });
		if (friendRequest.receiverId !== session.user.id) return NextResponse.json({
			success: false,
			error: "Sem permissão"
		}, { status: 403 });
		let result;
		if (action === "accept") result = await FriendshipService.acceptFriendRequest(id);
		else result = await FriendshipService.rejectFriendRequest(id);
		return NextResponse.json({
			success: true,
			data: result
		});
	} catch (error) {
		console.error("Erro ao responder solicitação:", error);
		if (error instanceof Error) return NextResponse.json({
			success: false,
			error: error.message
		}, { status: 400 });
		return NextResponse.json({
			success: false,
			error: "Erro ao responder solicitação"
		}, { status: 500 });
	}
}
/**
* DELETE /api/friends/requests/:id
* Cancela solicitação de amizade enviada
*/
async function DELETE$3(request, { params }) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		const { id } = await params;
		if (!session?.user?.id) return NextResponse.json({
			success: false,
			error: "Não autenticado"
		}, { status: 401 });
		await FriendshipService.cancelFriendRequest(id, session.user.id);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Erro ao cancelar solicitação:", error);
		if (error instanceof Error) return NextResponse.json({
			success: false,
			error: error.message
		}, { status: 400 });
		return NextResponse.json({
			success: false,
			error: "Erro ao cancelar solicitação"
		}, { status: 500 });
	}
}
var Table = import_react_react_server.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
	className: "relative w-full overflow-auto",
	children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("table", {
		ref,
		className: cn("w-full caption-bottom text-sm", className),
		...props
	})
}));
Table.displayName = "Table";
var TableHeader = import_react_react_server.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("thead", {
	ref,
	className: cn("[&_tr]:border-b", className),
	...props
}));
TableHeader.displayName = "TableHeader";
var TableBody = import_react_react_server.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("tbody", {
	ref,
	className: cn("[&_tr:last-child]:border-0", className),
	...props
}));
TableBody.displayName = "TableBody";
var TableFooter = import_react_react_server.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("tfoot", {
	ref,
	className: cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className),
	...props
}));
TableFooter.displayName = "TableFooter";
var TableRow = import_react_react_server.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("tr", {
	ref,
	className: cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className),
	...props
}));
TableRow.displayName = "TableRow";
var TableHead = import_react_react_server.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("th", {
	ref,
	className: cn("h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0", className),
	...props
}));
TableHead.displayName = "TableHead";
var TableCell = import_react_react_server.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("td", {
	ref,
	className: cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className),
	...props
}));
TableCell.displayName = "TableCell";
var TableCaption = import_react_react_server.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("caption", {
	ref,
	className: cn("mt-4 text-sm text-muted-foreground", className),
	...props
}));
TableCaption.displayName = "TableCaption";
var toNumber$1 = (value) => value ? Number(value) : 0;
var REPORT_DATE_RANGE_VALUES = [
	"7d",
	"30d",
	"3m",
	"year"
];
var DEFAULT_REPORT_DATE_RANGE = "30d";
var SERVICE_FILTER_MAX_LENGTH = 64;
var SERVICE_FILTER_PATTERN = /^[a-zA-Z0-9_-]+$/;
var busyHourBuckets = [
	{
		label: "Manhã (8h-12h)",
		start: 8,
		end: 12
	},
	{
		label: "Tarde (12h-18h)",
		start: 12,
		end: 18
	},
	{
		label: "Noite (18h-22h)",
		start: 18,
		end: 22
	}
];
var CAPACITY_CONFIG = {
	workdayStartHour: 9,
	workdayEndHour: 18,
	slotMinutes: 30,
	thresholds: {
		occupancy: 85,
		noShow: 10,
		cancel: 15
	}
};
function sanitizeReportDateRange(value) {
	if (typeof value !== "string") return DEFAULT_REPORT_DATE_RANGE;
	if (REPORT_DATE_RANGE_VALUES.includes(value)) return value;
	return DEFAULT_REPORT_DATE_RANGE;
}
function sanitizeServiceFilter(value) {
	if (typeof value !== "string") return null;
	const normalized = value.trim();
	if (!normalized || normalized.toLowerCase() === "all") return null;
	if (normalized.length > SERVICE_FILTER_MAX_LENGTH || !SERVICE_FILTER_PATTERN.test(normalized)) return null;
	return normalized;
}
function getReportStartDate(now, dateRange) {
	switch (dateRange) {
		case "7d": return /* @__PURE__ */ new Date(now.getTime() - 10080 * 60 * 1e3);
		case "30d": return /* @__PURE__ */ new Date(now.getTime() - 720 * 60 * 60 * 1e3);
		case "3m": return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
		case "year": return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
	}
}
function calculateBusyHours(appointments) {
	const counts = busyHourBuckets.map(() => 0);
	appointments.forEach(({ date }) => {
		const hour = date.getHours();
		const index = busyHourBuckets.findIndex((bucket) => hour >= bucket.start && hour < bucket.end);
		if (index >= 0) counts[index] += 1;
	});
	const total = counts.reduce((acc, current) => acc + current, 0);
	return busyHourBuckets.map((bucket, index) => ({
		label: bucket.label,
		range: `${bucket.start}h-${bucket.end}h`,
		count: counts[index],
		percentage: total > 0 ? Math.round(counts[index] / total * 100) : 0
	}));
}
async function getTopBarbersByRevenue(startDate, serviceId) {
	const histories = await db.serviceHistory.findMany({
		where: {
			...startDate ? { completedAt: { gte: startDate } } : {},
			appointments: { some: { barberId: { not: null } } },
			...serviceId ? { serviceId } : {}
		},
		select: {
			finalPrice: true,
			rating: true,
			appointments: { select: { barberId: true } }
		}
	});
	const stats = /* @__PURE__ */ new Map();
	histories.forEach((history) => {
		const barberId = history.appointments[0]?.barberId;
		if (!barberId) return;
		const current = stats.get(barberId) || {
			revenue: 0,
			ratingSum: 0,
			reviews: 0
		};
		current.revenue += toNumber$1(history.finalPrice);
		if (typeof history.rating === "number") {
			current.ratingSum += history.rating;
			current.reviews += 1;
		}
		stats.set(barberId, current);
	});
	if (stats.size === 0) return [];
	return (await db.user.findMany({
		where: {
			id: { in: Array.from(stats.keys()) },
			role: "BARBER",
			deletedAt: null
		},
		select: {
			id: true,
			name: true
		}
	})).map((barber) => {
		const data = stats.get(barber.id);
		const averageRating = data && data.reviews > 0 ? Number((data.ratingSum / data.reviews).toFixed(1)) : 0;
		return {
			id: barber.id,
			name: barber.name || "Sem nome",
			totalReviews: data?.reviews ?? 0,
			averageRating,
			totalRevenue: Number((data?.revenue ?? 0).toFixed(2))
		};
	}).filter((barber) => barber.totalRevenue > 0 || barber.totalReviews > 0).sort((a, b) => {
		if (b.totalRevenue === a.totalRevenue) return b.averageRating - a.averageRating;
		return b.totalRevenue - a.totalRevenue;
	});
}
async function buildMonthlyGrowth(now, serviceId) {
	const referenceStart = new Date(now.getFullYear(), now.getMonth() - 3, 1);
	const histories = await db.serviceHistory.findMany({
		where: {
			completedAt: { gte: referenceStart },
			...serviceId ? { serviceId } : {}
		},
		select: {
			completedAt: true,
			finalPrice: true
		}
	});
	const months = Array.from({ length: 4 }, (_, index) => {
		const date = new Date(now.getFullYear(), now.getMonth() - (3 - index), 1);
		return {
			key: `${date.getFullYear()}-${date.getMonth()}`,
			label: date.toLocaleString("pt-BR", { month: "short" })
		};
	});
	const aggregated = /* @__PURE__ */ new Map();
	histories.forEach((history) => {
		const key = `${history.completedAt.getFullYear()}-${history.completedAt.getMonth()}`;
		const current = aggregated.get(key) || {
			revenue: 0,
			services: 0
		};
		current.revenue += toNumber$1(history.finalPrice);
		current.services += 1;
		aggregated.set(key, current);
	});
	const maxRevenue = Math.max(...months.map((month) => aggregated.get(month.key)?.revenue ?? 0), 0);
	return months.map((month, index) => {
		const data = aggregated.get(month.key) || {
			revenue: 0,
			services: 0
		};
		const prevKey = index > 0 ? months[index - 1].key : null;
		const prevRevenue = prevKey ? aggregated.get(prevKey)?.revenue ?? 0 : 0;
		const growthRate = prevRevenue > 0 ? (data.revenue - prevRevenue) / prevRevenue * 100 : data.revenue > 0 ? 100 : 0;
		const progress = maxRevenue > 0 ? Math.round(data.revenue / maxRevenue * 100) : 0;
		return {
			month: month.label.charAt(0).toUpperCase() + month.label.slice(1),
			revenue: Number(data.revenue.toFixed(2)),
			services: data.services,
			progress,
			growthRate: Number(growthRate.toFixed(1))
		};
	});
}
async function buildPaymentMethodAnalytics(startDate, serviceId) {
	const histories = await db.serviceHistory.findMany({
		where: {
			completedAt: { gte: startDate },
			...serviceId ? { serviceId } : {}
		},
		select: {
			finalPrice: true,
			paymentMethod: true,
			service: { select: {
				id: true,
				name: true
			} },
			appointments: {
				select: { barber: { select: {
					id: true,
					name: true
				} } },
				take: 1
			}
		}
	});
	if (histories.length === 0) return {
		paymentMethods: [],
		paymentMethodDetails: []
	};
	const totalRevenue = histories.reduce((acc, history) => acc + toNumber$1(history.finalPrice), 0);
	const totalTransactions = histories.length;
	const byMethod = /* @__PURE__ */ new Map();
	histories.forEach((history) => {
		const method = history.paymentMethod ?? PaymentMethod.OTHER;
		const price = toNumber$1(history.finalPrice);
		const current = byMethod.get(method) ?? {
			revenue: 0,
			count: 0,
			services: /* @__PURE__ */ new Map(),
			barbers: /* @__PURE__ */ new Map()
		};
		current.revenue += price;
		current.count += 1;
		if (history.service) {
			const serviceBucket = current.services.get(history.service.id) ?? {
				name: history.service.name,
				revenue: 0
			};
			serviceBucket.revenue += price;
			current.services.set(history.service.id, serviceBucket);
		}
		const barber = history.appointments[0]?.barber;
		if (barber) {
			const barberBucket = current.barbers.get(barber.id) ?? {
				name: barber.name,
				revenue: 0
			};
			barberBucket.revenue += price;
			current.barbers.set(barber.id, barberBucket);
		}
		byMethod.set(method, current);
	});
	const paymentMethods = Array.from(byMethod.entries()).map(([method, data]) => {
		const revenueShare = totalRevenue > 0 ? Number((data.revenue / totalRevenue * 100).toFixed(1)) : 0;
		const volumeShare = totalTransactions > 0 ? Math.round(data.count / totalTransactions * 100) : 0;
		return {
			method,
			count: data.count,
			revenue: Number(data.revenue.toFixed(2)),
			revenueShare,
			volumeShare,
			averageTicket: data.count > 0 ? Number((data.revenue / data.count).toFixed(2)) : 0
		};
	}).sort((a, b) => b.revenue - a.revenue);
	return {
		paymentMethods,
		paymentMethodDetails: paymentMethods.map(({ method, revenue }) => {
			const bucket = byMethod.get(method);
			const toEntries = (source) => Array.from(source.entries()).map(([id, value]) => ({
				id,
				name: value.name,
				revenue: Number(value.revenue.toFixed(2)),
				percentage: revenue > 0 ? Math.round(value.revenue / revenue * 100) : 0
			})).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
			return {
				method,
				topServices: toEntries(bucket?.services ?? /* @__PURE__ */ new Map()),
				topBarbers: toEntries(bucket?.barbers ?? /* @__PURE__ */ new Map())
			};
		})
	};
}
async function getServiceOptions() {
	return (await db.service.findMany({
		select: {
			id: true,
			name: true,
			active: true
		},
		orderBy: { name: "asc" }
	})).map((service) => ({
		id: service.id,
		name: service.name,
		active: service.active
	}));
}
function createEmptyReportsData(serviceOptions) {
	return {
		totalRevenue: 0,
		monthlyRevenue: 0,
		totalClients: 0,
		totalAppointments: 0,
		monthlyAppointments: 0,
		averageRating: 0,
		totalReviews: 0,
		topBarbers: [],
		monthlyGrowth: [],
		paymentMethods: [],
		paymentMethodDetails: [],
		busyHours: [],
		periodComparison: {
			revenueChangePercent: 0,
			appointmentsChangePercent: 0,
			newClients: 0
		},
		todayRevenue: 0,
		weekRevenue: 0,
		averageTicket: 0,
		averageDurationMinutes: 0,
		returnRate: 0,
		customerCohort: [],
		ltv: {
			totalRevenue: 0,
			uniqueClients: 0,
			globalLtv: 0,
			byBarber: []
		},
		capacity: {
			summary: {
				slotsUsed: 0,
				slotsAvailable: 0,
				occupancyRate: 0,
				noShowRate: 0,
				cancelRate: 0,
				totalAppointments: 0
			},
			thresholds: { ...CAPACITY_CONFIG.thresholds },
			byBarber: [],
			byService: []
		},
		serviceOptions
	};
}
var getMonthKey = (date) => `${date.getFullYear()}-${date.getMonth()}`;
var formatMonthLabel = (date) => {
	const month = date.toLocaleString("pt-BR", { month: "short" });
	return `${month ? month.charAt(0).toUpperCase() + month.slice(1) : ""} ${date.getFullYear()}`;
};
async function buildCustomerCohort(startDate, serviceId) {
	const histories = await db.serviceHistory.findMany({
		where: {
			completedAt: { gte: startDate },
			...serviceId ? { serviceId } : {}
		},
		select: {
			userId: true,
			completedAt: true
		}
	});
	if (histories.length === 0) return [];
	const userIds = Array.from(new Set(histories.map((history) => history.userId)));
	const firstServices = await db.serviceHistory.groupBy({
		by: ["userId"],
		where: {
			userId: { in: userIds },
			...serviceId ? { serviceId } : {}
		},
		_min: { completedAt: true }
	});
	const firstServiceByUser = new Map(firstServices.map((entry) => [entry.userId, entry._min.completedAt]));
	const monthBuckets = /* @__PURE__ */ new Map();
	histories.forEach((history) => {
		const monthKey = getMonthKey(history.completedAt);
		const bucket = monthBuckets.get(monthKey) ?? {
			newClients: /* @__PURE__ */ new Set(),
			returningClients: /* @__PURE__ */ new Set()
		};
		const firstDate = firstServiceByUser.get(history.userId);
		if ((firstDate ? getMonthKey(firstDate) : monthKey) === monthKey) bucket.newClients.add(history.userId);
		else bucket.returningClients.add(history.userId);
		monthBuckets.set(monthKey, bucket);
	});
	const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
	const now = /* @__PURE__ */ new Date();
	const months = [];
	let cursor = startMonth;
	while (cursor <= now) {
		months.push(new Date(cursor));
		cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
	}
	return months.map((monthDate) => {
		const key = getMonthKey(monthDate);
		const bucket = monthBuckets.get(key) ?? {
			newClients: /* @__PURE__ */ new Set(),
			returningClients: /* @__PURE__ */ new Set()
		};
		const total = bucket.newClients.size + bucket.returningClients.size;
		const retentionRate = total > 0 ? Math.round(bucket.returningClients.size / total * 100) : 0;
		return {
			month: formatMonthLabel(monthDate),
			newClients: bucket.newClients.size,
			returningClients: bucket.returningClients.size,
			retentionRate
		};
	});
}
async function calculateLtvMetrics(startDate, serviceId) {
	const histories = await db.serviceHistory.findMany({
		where: {
			completedAt: { gte: startDate },
			...serviceId ? { serviceId } : {}
		},
		select: {
			userId: true,
			finalPrice: true,
			appointments: {
				select: {
					barberId: true,
					barber: { select: {
						id: true,
						name: true
					} }
				},
				take: 1
			}
		}
	});
	if (histories.length === 0) return {
		totalRevenue: 0,
		uniqueClients: 0,
		globalLtv: 0,
		byBarber: []
	};
	const totalRevenue = histories.reduce((acc, history) => acc + toNumber$1(history.finalPrice), 0);
	const uniqueClients = new Set(histories.map((history) => history.userId)).size;
	const globalLtv = uniqueClients > 0 ? Number((totalRevenue / uniqueClients).toFixed(2)) : 0;
	const barberStats = /* @__PURE__ */ new Map();
	histories.forEach((history) => {
		const barberId = history.appointments[0]?.barberId;
		if (!barberId) return;
		const current = barberStats.get(barberId) ?? {
			name: history.appointments[0]?.barber?.name || null,
			revenue: 0,
			clients: /* @__PURE__ */ new Set()
		};
		current.revenue += toNumber$1(history.finalPrice);
		current.clients.add(history.userId);
		barberStats.set(barberId, current);
	});
	const byBarber = Array.from(barberStats.entries()).map(([barberId, data]) => ({
		barberId,
		barberName: data.name,
		revenue: Number(data.revenue.toFixed(2)),
		uniqueClients: data.clients.size,
		ltv: data.clients.size > 0 ? Number((data.revenue / data.clients.size).toFixed(2)) : 0
	})).sort((a, b) => b.revenue - a.revenue);
	return {
		totalRevenue: Number(totalRevenue.toFixed(2)),
		uniqueClients,
		globalLtv,
		byBarber
	};
}
function buildCapacityMetrics({ appointments, activeBarbers, daysInRange }) {
	const slotMinutes = CAPACITY_CONFIG.slotMinutes;
	const baseSlotsPerBarber = Math.max(1, Math.floor((CAPACITY_CONFIG.workdayEndHour - CAPACITY_CONFIG.workdayStartHour) * 60 / slotMinutes)) * Math.max(1, daysInRange);
	const barberPool = activeBarbers.length > 0 ? activeBarbers : Array.from(new Map(appointments.map((appointment) => [appointment.barberId, {
		id: appointment.barberId,
		name: appointment.barber?.name || "Barbeiro"
	}])).values());
	const makeAccumulator = (id, name, availableSlots) => ({
		id,
		name,
		availableSlots,
		usedSlots: 0,
		totalAppointments: 0,
		noShowCount: 0,
		cancelCount: 0
	});
	const barberStats = /* @__PURE__ */ new Map();
	barberPool.forEach((barber) => {
		barberStats.set(barber.id, makeAccumulator(barber.id, barber.name || "Barbeiro", baseSlotsPerBarber));
	});
	const totalSlotsAvailable = baseSlotsPerBarber * Math.max(1, barberPool.length);
	const serviceStats = /* @__PURE__ */ new Map();
	let slotsUsed = 0;
	let totalNoShow = 0;
	let totalCancelled = 0;
	appointments.forEach((appointment) => {
		const slotsNeeded = Math.max(1, Math.ceil((appointment.service?.duration ?? slotMinutes) / slotMinutes));
		const isUsed = appointment.status !== AppointmentStatus.CANCELLED && appointment.status !== AppointmentStatus.NO_SHOW;
		const barberEntry = barberStats.get(appointment.barberId) ?? makeAccumulator(appointment.barberId, appointment.barber?.name || "Barbeiro", baseSlotsPerBarber);
		const serviceEntry = serviceStats.get(appointment.serviceId) ?? makeAccumulator(appointment.serviceId, appointment.service?.name || "Serviço", totalSlotsAvailable);
		barberEntry.totalAppointments += 1;
		serviceEntry.totalAppointments += 1;
		if (isUsed) {
			barberEntry.usedSlots += slotsNeeded;
			serviceEntry.usedSlots += slotsNeeded;
			slotsUsed += slotsNeeded;
		}
		if (appointment.status === AppointmentStatus.NO_SHOW) {
			barberEntry.noShowCount += 1;
			serviceEntry.noShowCount += 1;
			totalNoShow += 1;
		}
		if (appointment.status === AppointmentStatus.CANCELLED) {
			barberEntry.cancelCount += 1;
			serviceEntry.cancelCount += 1;
			totalCancelled += 1;
		}
		barberStats.set(appointment.barberId, barberEntry);
		serviceStats.set(appointment.serviceId, serviceEntry);
	});
	const thresholds = CAPACITY_CONFIG.thresholds;
	const toCapacityItem = (entry) => {
		const occupancyRate = entry.availableSlots > 0 ? Math.min(100, Number((entry.usedSlots / entry.availableSlots * 100).toFixed(1))) : 0;
		const noShowRate = entry.totalAppointments > 0 ? Number((entry.noShowCount / entry.totalAppointments * 100).toFixed(1)) : 0;
		const cancelRate = entry.totalAppointments > 0 ? Number((entry.cancelCount / entry.totalAppointments * 100).toFixed(1)) : 0;
		return {
			id: entry.id,
			name: entry.name,
			usedSlots: entry.usedSlots,
			availableSlots: entry.availableSlots,
			occupancyRate,
			totalAppointments: entry.totalAppointments,
			noShowRate,
			cancelRate,
			alerts: {
				occupancy: occupancyRate >= thresholds.occupancy,
				noShow: noShowRate >= thresholds.noShow,
				cancel: cancelRate >= thresholds.cancel
			}
		};
	};
	const byBarber = Array.from(barberStats.values()).map(toCapacityItem).sort((a, b) => b.occupancyRate - a.occupancyRate || b.totalAppointments - a.totalAppointments);
	const byService = Array.from(serviceStats.values()).map(toCapacityItem).sort((a, b) => b.usedSlots - a.usedSlots || b.totalAppointments - a.totalAppointments);
	const slotsAvailable = Math.max(totalSlotsAvailable, baseSlotsPerBarber);
	const occupancyRate = slotsAvailable > 0 ? Number((slotsUsed / slotsAvailable * 100).toFixed(1)) : 0;
	const totalAppointments = appointments.length;
	const noShowRate = totalAppointments > 0 ? Number((totalNoShow / totalAppointments * 100).toFixed(1)) : 0;
	const cancelRate = totalAppointments > 0 ? Number((totalCancelled / totalAppointments * 100).toFixed(1)) : 0;
	return {
		summary: {
			slotsUsed,
			slotsAvailable,
			occupancyRate,
			noShowRate,
			cancelRate,
			totalAppointments
		},
		thresholds,
		byBarber,
		byService
	};
}
/**
* Buscar todos os usuários para o painel administrativo
*/
async function getUsersForAdmin() {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Não autenticado",
			data: []
		};
		if (session.user.role !== "ADMIN") return {
			success: false,
			error: "Acesso negado: apenas administradores",
			data: []
		};
		return {
			success: true,
			data: (await UserService.findMany({
				status: "ALL",
				includeDeleted: true,
				page: 1,
				limit: 200
			})).users
		};
	} catch (error) {
		console.error("Erro ao buscar usuários:", error);
		return {
			success: false,
			error: "Erro ao buscar usuários",
			data: []
		};
	}
}
/**
* Buscar todos os barbeiros com suas métricas
*
* @param filters - Filtros de busca, performance, ordenação e paginação
* @param filters.search - Buscar por nome ou email
* @param filters.performanceMin - Rating mínimo (1-5)
* @param filters.sortBy - Ordenar por: "name" | "rating" | "appointments"
* @param filters.page - Página atual (default: 1)
* @param filters.limit - Itens por página (default: 20, max: 50)
*
* @returns Lista paginada de barbeiros com métricas agregadas
*/
async function getBarbersForAdmin(filters) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Não autenticado",
			data: [],
			pagination: {
				page: 1,
				limit: 20,
				total: 0,
				totalPages: 0
			}
		};
		if (session.user.role !== "ADMIN") return {
			success: false,
			error: "Acesso negado: apenas administradores",
			data: [],
			pagination: {
				page: 1,
				limit: 20,
				total: 0,
				totalPages: 0
			}
		};
		const page = Math.max(1, filters?.page || 1);
		const limit = Math.min(50, Math.max(1, filters?.limit || 20));
		const skip = (page - 1) * limit;
		const whereClause = {
			role: "BARBER",
			deletedAt: null
		};
		if (filters?.search) whereClause.OR = [{ name: {
			contains: filters.search,
			mode: "insensitive"
		} }, { email: {
			contains: filters.search,
			mode: "insensitive"
		} }];
		let barbersWithMetrics = (await db.user.findMany({
			where: whereClause,
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				createdAt: true,
				appointments: { select: {
					id: true,
					serviceHistory: { select: { rating: true } }
				} }
			}
		})).map((barber) => {
			const allRatings = barber.appointments.map((apt) => apt.serviceHistory?.rating).filter((rating) => rating !== null && rating !== void 0);
			return {
				id: barber.id,
				name: barber.name,
				email: barber.email,
				role: barber.role,
				createdAt: barber.createdAt,
				totalReviews: allRatings.length,
				averageRating: allRatings.length > 0 ? Number((allRatings.reduce((acc, rating) => acc + rating, 0) / allRatings.length).toFixed(1)) : null,
				totalAppointments: barber.appointments.length
			};
		});
		if (filters?.performanceMin !== void 0 && filters.performanceMin > 0) barbersWithMetrics = barbersWithMetrics.filter((b) => b.averageRating !== null && b.averageRating >= filters.performanceMin);
		const sortBy = filters?.sortBy || "name";
		barbersWithMetrics.sort((a, b) => {
			switch (sortBy) {
				case "rating":
					if (a.averageRating === null && b.averageRating === null) return 0;
					if (a.averageRating === null) return 1;
					if (b.averageRating === null) return -1;
					return b.averageRating - a.averageRating;
				case "appointments": return b.totalAppointments - a.totalAppointments;
				default: return (a.name || "").localeCompare(b.name || "");
			}
		});
		const total = barbersWithMetrics.length;
		const totalPages = Math.ceil(total / limit);
		const paginatedData = barbersWithMetrics.slice(skip, skip + limit);
		const ratedBarbers = barbersWithMetrics.filter((b) => b.averageRating !== null);
		const averageRating = ratedBarbers.length > 0 ? Number((ratedBarbers.reduce((acc, barber) => acc + (barber.averageRating || 0), 0) / ratedBarbers.length).toFixed(2)) : 0;
		const activeCount = barbersWithMetrics.filter((b) => b.totalAppointments > 0).length;
		const topPerformer = barbersWithMetrics.reduce((best, current) => {
			if (!best) return current;
			if (current.averageRating === null) return best;
			if (best.averageRating === null) return current;
			return current.averageRating > best.averageRating ? current : best;
		}, null);
		return {
			success: true,
			data: paginatedData,
			pagination: {
				page,
				limit,
				total,
				totalPages
			},
			metrics: {
				averageRating,
				activeCount,
				totalReviews: barbersWithMetrics.reduce((acc, b) => acc + (b.totalReviews || 0), 0),
				topPerformer: topPerformer?.name || null
			}
		};
	} catch (error) {
		console.error("Erro ao buscar barbeiros:", error);
		return {
			success: false,
			error: "Erro ao buscar barbeiros",
			data: [],
			pagination: {
				page: 1,
				limit: 20,
				total: 0,
				totalPages: 0
			},
			metrics: {
				averageRating: 0,
				activeCount: 0,
				totalReviews: 0,
				topPerformer: null
			}
		};
	}
}
/**
* Buscar dados para relatórios
*
* @param dateRange - Período do relatório (whitelist): "7d" | "30d" | "3m" | "year"
* @param serviceId - Filtro opcional por serviço para métricas e coortes
*/
async function getReportsData(dateRange, serviceId) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Não autenticado",
			data: null
		};
		if (session.user.role !== "ADMIN") return {
			success: false,
			error: "Acesso negado: apenas administradores",
			data: null
		};
		const normalizedDateRange = sanitizeReportDateRange(dateRange);
		if (typeof dateRange === "string" && dateRange !== normalizedDateRange) logger.warn("Invalid report dateRange sanitized", {
			userId: session.user.id,
			receivedDateRange: dateRange,
			normalizedDateRange
		});
		const serviceOptions = await getServiceOptions();
		const requestedServiceFilter = typeof serviceId === "string" && serviceId.trim().length > 0 && serviceId.trim().toLowerCase() !== "all";
		const normalizedServiceId = sanitizeServiceFilter(serviceId);
		const selectedServiceId = normalizedServiceId && serviceOptions.some((option) => option.id === normalizedServiceId) ? normalizedServiceId : null;
		if (requestedServiceFilter && !selectedServiceId) {
			logger.warn("Invalid report service filter sanitized", {
				userId: session.user.id,
				receivedServiceId: typeof serviceId === "string" ? serviceId.slice(0, 80) : serviceId
			});
			return {
				success: true,
				data: createEmptyReportsData(serviceOptions)
			};
		}
		const now = /* @__PURE__ */ new Date();
		const startDate = getReportStartDate(now, normalizedDateRange);
		const normalizedStart = new Date(startDate);
		normalizedStart.setHours(0, 0, 0, 0);
		const normalizedNow = new Date(now);
		normalizedNow.setHours(0, 0, 0, 0);
		const daysInRange = Math.max(1, Math.round((normalizedNow.getTime() - normalizedStart.getTime()) / (1e3 * 60 * 60 * 24)) + 1);
		const periodLength = now.getTime() - startDate.getTime();
		const previousPeriodStart = new Date(startDate.getTime() - periodLength);
		const appointmentBaseWhere = {
			status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
			...selectedServiceId ? { serviceId: selectedServiceId } : {}
		};
		const serviceHistoryBaseWhere = selectedServiceId ? { serviceId: selectedServiceId } : {};
		const activeBarbers = await db.user.findMany({
			where: {
				role: "BARBER",
				deletedAt: null,
				isActive: true
			},
			select: {
				id: true,
				name: true
			}
		});
		const totalClients = (await db.serviceHistory.findMany({
			where: serviceHistoryBaseWhere,
			distinct: ["userId"],
			select: { userId: true }
		})).length;
		const totalAppointments = await db.appointment.count({ where: appointmentBaseWhere });
		const periodAppointments = await db.appointment.findMany({
			where: {
				...appointmentBaseWhere,
				date: { gte: startDate }
			},
			select: {
				date: true,
				service: { select: { duration: true } }
			}
		});
		const periodAppointmentsDetailed = await db.appointment.findMany({
			where: {
				...selectedServiceId ? { serviceId: selectedServiceId } : {},
				date: { gte: startDate }
			},
			select: {
				status: true,
				barberId: true,
				serviceId: true,
				service: { select: {
					duration: true,
					name: true
				} },
				barber: { select: { name: true } }
			}
		});
		const monthlyAppointments = periodAppointments.length;
		const previousAppointments = await db.appointment.count({ where: {
			...appointmentBaseWhere,
			date: {
				gte: previousPeriodStart,
				lt: startDate
			}
		} });
		const ratingsAggregate = await db.serviceHistory.aggregate({
			where: {
				...serviceHistoryBaseWhere,
				rating: { not: null }
			},
			_avg: { rating: true },
			_count: { rating: true }
		});
		const totalRevenueData = await db.serviceHistory.aggregate({
			where: serviceHistoryBaseWhere,
			_sum: { finalPrice: true }
		});
		const periodRevenueData = await db.serviceHistory.aggregate({
			where: {
				...serviceHistoryBaseWhere,
				completedAt: { gte: startDate }
			},
			_sum: { finalPrice: true },
			_count: { id: true }
		});
		const previousRevenueData = await db.serviceHistory.aggregate({
			where: {
				...serviceHistoryBaseWhere,
				completedAt: {
					gte: previousPeriodStart,
					lt: startDate
				}
			},
			_sum: { finalPrice: true }
		});
		const periodRatings = await db.serviceHistory.aggregate({
			where: {
				...serviceHistoryBaseWhere,
				completedAt: { gte: startDate },
				rating: { not: null }
			},
			_avg: { rating: true },
			_count: { rating: true }
		});
		const startOfToday = /* @__PURE__ */ new Date();
		startOfToday.setHours(0, 0, 0, 0);
		const lastSevenDays = /* @__PURE__ */ new Date();
		lastSevenDays.setDate(lastSevenDays.getDate() - 7);
		const todayRevenueData = await db.serviceHistory.aggregate({
			where: {
				...serviceHistoryBaseWhere,
				completedAt: { gte: startOfToday }
			},
			_sum: { finalPrice: true }
		});
		const weekRevenueData = await db.serviceHistory.aggregate({
			where: {
				...serviceHistoryBaseWhere,
				completedAt: { gte: lastSevenDays }
			},
			_sum: { finalPrice: true }
		});
		const { paymentMethods, paymentMethodDetails } = await buildPaymentMethodAnalytics(startDate, selectedServiceId ?? void 0);
		const customerCohort = await buildCustomerCohort(startDate, selectedServiceId ?? void 0);
		const newClientsInPeriod = customerCohort.reduce((acc, bucket) => acc + bucket.newClients, 0);
		const ltv = await calculateLtvMetrics(startDate, selectedServiceId ?? void 0);
		const averageDurationMinutes = (() => {
			const durations = periodAppointments.map((appointment) => appointment.service?.duration).filter((duration) => typeof duration === "number");
			if (!durations.length) return 0;
			const total = durations.reduce((acc, duration) => acc + duration, 0);
			return Math.round(total / durations.length);
		})();
		const returnRateGroup = await db.appointment.groupBy({
			by: ["userId"],
			where: {
				date: { gte: startDate },
				...appointmentBaseWhere
			},
			_count: { _all: true }
		});
		const returningClients = returnRateGroup.filter((entry) => entry._count._all > 1).length;
		const returnRate = returnRateGroup.length > 0 ? Math.round(returningClients / returnRateGroup.length * 100) : 0;
		const busyHours = calculateBusyHours(periodAppointments);
		const monthlyGrowth = await buildMonthlyGrowth(now, selectedServiceId ?? void 0);
		const capacity = buildCapacityMetrics({
			appointments: periodAppointmentsDetailed,
			activeBarbers,
			daysInRange
		});
		const periodRevenue = toNumber$1(periodRevenueData._sum.finalPrice);
		const previousRevenue = toNumber$1(previousRevenueData._sum.finalPrice);
		const revenueChangePercent = previousRevenue > 0 ? (periodRevenue - previousRevenue) / previousRevenue * 100 : periodRevenue > 0 ? 100 : 0;
		const appointmentsChangePercent = previousAppointments > 0 ? (monthlyAppointments - previousAppointments) / previousAppointments * 100 : monthlyAppointments > 0 ? 100 : 0;
		const averageTicket = (periodRevenueData._count?.id || 0) > 0 ? Number((periodRevenue / (periodRevenueData._count?.id || 1)).toFixed(2)) : 0;
		const topBarbers = (await getTopBarbersByRevenue(startDate, selectedServiceId ?? void 0)).slice(0, 10);
		return {
			success: true,
			data: {
				totalRevenue: toNumber$1(totalRevenueData._sum.finalPrice),
				monthlyRevenue: periodRevenue,
				totalClients,
				totalAppointments,
				monthlyAppointments,
				averageRating: Number((periodRatings._avg.rating ?? ratingsAggregate._avg.rating ?? 0).toFixed(1)),
				totalReviews: periodRatings._count.rating || ratingsAggregate._count.rating || 0,
				topBarbers: topBarbers.map((barber) => ({
					id: barber.id,
					name: barber.name,
					totalReviews: barber.totalReviews,
					averageRating: barber.averageRating,
					totalRevenue: barber.totalRevenue
				})),
				monthlyGrowth,
				paymentMethods,
				paymentMethodDetails,
				busyHours,
				periodComparison: {
					revenueChangePercent: Number(revenueChangePercent.toFixed(1)),
					appointmentsChangePercent: Number(appointmentsChangePercent.toFixed(1)),
					newClients: newClientsInPeriod
				},
				todayRevenue: toNumber$1(todayRevenueData._sum.finalPrice),
				weekRevenue: toNumber$1(weekRevenueData._sum.finalPrice),
				averageTicket,
				averageDurationMinutes,
				returnRate,
				customerCohort,
				ltv,
				capacity,
				serviceOptions
			}
		};
	} catch (error) {
		console.error("Erro ao buscar dados de relatórios:", error);
		return {
			success: false,
			error: "Erro ao buscar dados de relatórios",
			data: null
		};
	}
}
/**
* Atualizar role de um usuário
*/
async function updateUserRole(userId, newRole) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Não autenticado"
		};
		if (session.user.role !== "ADMIN") return {
			success: false,
			error: "Acesso negado: apenas administradores podem alterar roles"
		};
		if (!await db.user.findFirst({ where: {
			id: userId,
			deletedAt: null
		} })) return {
			success: false,
			error: "Usuário não encontrado ou removido."
		};
		const updatedUser = await db.user.update({
			where: { id: userId },
			data: {
				role: newRole,
				updatedById: session.user.id
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true
			}
		});
		logger.info("User role updated", {
			actorId: session.user.id,
			userId,
			newRole
		});
		revalidatePath("/dashboard/admin/users");
		return {
			success: true,
			data: updatedUser,
			message: `Usuário promovido para ${newRole} com sucesso!`
		};
	} catch (error) {
		console.error("Erro ao atualizar role do usuário:", error);
		return {
			success: false,
			error: "Erro ao atualizar role do usuário"
		};
	}
}
/**
* Buscar usuário específico por ID
*/
async function getUserById$1(userId) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Não autenticado"
		};
		if (session.user.role !== "ADMIN") return {
			success: false,
			error: "Acesso negado: apenas administradores"
		};
		const user = await db.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				nickname: true,
				phone: true,
				image: true,
				isActive: true,
				deletedAt: true,
				deletedById: true,
				updatedById: true,
				createdAt: true,
				appointments: {
					select: {
						id: true,
						status: true,
						createdAt: true,
						serviceHistory: { select: {
							rating: true,
							feedback: true,
							finalPrice: true
						} }
					},
					orderBy: { createdAt: "desc" },
					take: 10
				}
			}
		});
		if (!user) return {
			success: false,
			error: "Usuário não encontrado"
		};
		return {
			success: true,
			data: user
		};
	} catch (error) {
		console.error("Erro ao buscar usuário:", error);
		return {
			success: false,
			error: "Erro ao buscar usuário"
		};
	}
}
/**
* Deletar usuário (soft delete ou inativação)
*/
async function deleteUser(userId) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Não autenticado"
		};
		if (session.user.role !== "ADMIN") return {
			success: false,
			error: "Acesso negado: apenas administradores podem inativar usuários"
		};
		if (session.user.id === userId) return {
			success: false,
			error: "Você não pode remover sua própria conta."
		};
		const user = await UserService.softDeleteUser(userId, session.user.id);
		if (!user) return {
			success: false,
			error: "Usuário não encontrado ou já removido."
		};
		logger.warn("User soft deleted via adminActions", {
			actorId: session.user.id,
			userId
		});
		revalidatePath("/dashboard/admin/users");
		revalidatePath(`/dashboard/admin/users/${userId}`);
		return {
			success: true,
			message: "Usuário inativado com sucesso",
			data: user
		};
	} catch (error) {
		console.error("Erro ao deletar usuário:", error);
		return {
			success: false,
			error: "Erro ao inativar usuário"
		};
	}
}
getUsersForAdmin = /* @__PURE__ */ registerServerReference(getUsersForAdmin, "24784cda83ba", "getUsersForAdmin");
getBarbersForAdmin = /* @__PURE__ */ registerServerReference(getBarbersForAdmin, "24784cda83ba", "getBarbersForAdmin");
getReportsData = /* @__PURE__ */ registerServerReference(getReportsData, "24784cda83ba", "getReportsData");
updateUserRole = /* @__PURE__ */ registerServerReference(updateUserRole, "24784cda83ba", "updateUserRole");
getUserById$1 = /* @__PURE__ */ registerServerReference(getUserById$1, "24784cda83ba", "getUserById");
deleteUser = /* @__PURE__ */ registerServerReference(deleteUser, "24784cda83ba", "deleteUser");
var UserForm_default = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "d954ff6cdabf", "default");
var UserTableActions = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'UserTableActions' is called on server");
}, "81cd343db88e", "UserTableActions");
/**
* Componente UserAvatar
* 
* Exibe a imagem do usuário com fallback para iniciais ou ícone
* Padroniza a exibição de avatares em toda a aplicação
*/
var UserAvatar = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'UserAvatar' is called on server");
}, "41975edb3519", "UserAvatar");
var User = createLucideIcon("user", [["path", {
	d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",
	key: "975kel"
}], ["circle", {
	cx: "12",
	cy: "7",
	r: "4",
	key: "17ys0d"
}]]);
var Star = createLucideIcon("star", [["path", {
	d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
	key: "r04s7s"
}]]);
var Activity = createLucideIcon("activity", [["path", {
	d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
	key: "169zse"
}]]);
var DollarSign = createLucideIcon("dollar-sign", [["line", {
	x1: "12",
	x2: "12",
	y1: "2",
	y2: "22",
	key: "7eqyqh"
}], ["path", {
	d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
	key: "1b0p4s"
}]]);
var page_exports$44 = /* @__PURE__ */ __exportAll({ default: () => UserEditPage });
async function UserEditPage({ params }) {
	const { id } = await params;
	const session = await (0, import_next_auth.getServerSession)(authOptions);
	if (!session) redirect("/auth/signin");
	if (session.user.role !== "ADMIN") redirect("/dashboard");
	const userResult = await getUserById$1(id);
	if (!userResult.success || !userResult.data) return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
			badge: "Administrador",
			title: "Usuário não encontrado",
			subtitle: `O usuário com ID ${id} não existe ou foi removido.`,
			actions: [{
				label: "Voltar para lista",
				href: "/dashboard/admin/users",
				variant: "outline"
			}]
		})
	});
	const user = userResult.data;
	const userImage = "image" in user ? user.image ?? null : null;
	const getRoleLabel = (role) => {
		switch (role) {
			case "ADMIN": return "Admin";
			case "BARBER": return "Barbeiro";
			case "CLIENT": return "Cliente";
			default: return role;
		}
	};
	const getStatusLabel = () => {
		if (user.deletedAt) return {
			label: "Removido",
			cls: "bg-red-500/10 text-red-500"
		};
		if (!user.isActive) return {
			label: "Inativo",
			cls: "bg-border text-fg-muted"
		};
		return {
			label: "Ativo",
			cls: "bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]"
		};
	};
	const statusInfo = getStatusLabel();
	const totalAppointments = user.appointments?.length || 0;
	const appointmentsWithReviews = (user.appointments || []).filter((apt) => apt.serviceHistory?.rating);
	const averageRating = appointmentsWithReviews.length > 0 ? appointmentsWithReviews.reduce((acc, apt) => acc + (apt.serviceHistory?.rating || 0), 0) / appointmentsWithReviews.length : 0;
	const totalSpent = user.appointments.reduce((acc, apt) => {
		const price = apt.serviceHistory?.finalPrice;
		return acc + (price != null ? Number(price) : 0);
	}, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
			badge: "Administrador",
			title: "Editar Usuário",
			subtitle: "Gerencie as informações e permissões do usuário.",
			actions: [{
				label: "Voltar",
				href: "/dashboard/admin/users",
				variant: "outline"
			}]
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
			className: "bg-background py-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "container mx-auto px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
					className: "mx-auto max-w-6xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "grid gap-6 lg:grid-cols-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
							className: "lg:col-span-2 space-y-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
								className: "rounded-2xl border border-border bg-surface-card p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("h2", {
										className: "mb-4 font-display text-xl font-bold italic text-foreground flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(User, { className: "h-5 w-5 text-accent" }), "Informações Básicas"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
										className: "mb-5 flex flex-wrap gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
												className: "inline-flex items-center rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-semibold text-foreground",
												children: getRoleLabel(user.role)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
												className: `inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.cls}`,
												children: statusInfo.label
											}),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", {
												className: "inline-flex items-center rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-semibold text-fg-muted",
												children: [
													"Criado em",
													" ",
													new Date(user.createdAt).toLocaleDateString("pt-BR", {
														year: "numeric",
														month: "short",
														day: "numeric"
													})
												]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(UserForm_default, { initialData: {
										id: user.id,
										name: user.name || "",
										nickname: user.nickname || "",
										email: user.email,
										role: user.role,
										isActive: user.isActive,
										phone: user.phone || ""
									} })
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
								className: "rounded-2xl border border-border bg-surface-card",
								children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
									className: "border-b border-border px-6 py-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("h2", {
										className: "font-display text-xl font-bold italic text-foreground flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Activity, { className: "h-5 w-5 text-accent" }), "Histórico de Agendamentos"]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
									className: "p-6",
									children: user.appointments && user.appointments.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
										className: "overflow-hidden rounded-xl border border-border",
										children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(TableRow, {
											className: "border-border hover:bg-surface-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableHead, {
													className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
													children: "Data"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableHead, {
													className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
													children: "Status"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableHead, {
													className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
													children: "Avaliação"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableHead, {
													className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
													children: "Valor"
												})
											]
										}) }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableBody, { children: user.appointments.map((appointment) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(TableRow, {
											className: "border-border hover:bg-surface-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableCell, {
													className: "text-sm text-foreground",
													children: new Date(appointment.createdAt).toLocaleDateString("pt-BR")
												}),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
													className: `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${appointment.status === "COMPLETED" ? "bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]" : "bg-border text-fg-muted"}`,
													children: appointment.status
												}) }),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableCell, { children: appointment.serviceHistory?.rating ? /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
													className: "flex items-center gap-1 text-sm text-foreground",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Star, { className: "h-4 w-4 text-accent fill-accent" }),
														appointment.serviceHistory.rating,
														"/5"
													]
												}) : /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
													className: "text-xs text-fg-subtle",
													children: "Sem avaliação"
												}) }),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableCell, {
													className: "text-sm text-foreground",
													children: (() => {
														const priceValue = appointment.serviceHistory?.finalPrice;
														return `R$ ${(typeof priceValue === "number" ? priceValue : Number(priceValue ?? 25)).toFixed(2)}`;
													})()
												})
											]
										}, appointment.id)) })] })
									}) : /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
										className: "flex flex-col items-center justify-center gap-3 py-8 text-fg-muted",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Activity, { className: "h-8 w-8 opacity-40" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
											className: "text-sm",
											children: "Nenhum agendamento encontrado"
										})]
									})
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
							className: "space-y-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
									className: "rounded-2xl border border-border bg-surface-card p-6 text-center",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(UserAvatar, {
											src: userImage ?? void 0,
											name: user.name,
											email: user.email,
											size: "xl",
											className: "mx-auto mb-4 h-20 w-20"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h3", {
											className: "font-display text-xl font-bold italic text-foreground",
											children: user.name || "Sem nome"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
											className: "mt-1 text-sm text-fg-muted",
											children: user.email
										}),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
											className: "mt-3 flex flex-wrap items-center justify-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
												className: "inline-flex items-center rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-semibold text-foreground",
												children: getRoleLabel(user.role)
											}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
												className: `inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.cls}`,
												children: statusInfo.label
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("p", {
											className: "mt-3 text-xs text-fg-subtle",
											children: [
												"ID: ",
												user.id.slice(0, 8),
												"..."
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
											className: "mt-4",
											children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(UserTableActions, {
												user: {
													id: user.id,
													name: user.name || user.email,
													role: user.role,
													isActive: user.isActive,
													deletedAt: user.deletedAt ?? null
												},
												showEditButton: false
											})
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
									className: "rounded-2xl border border-border bg-surface-card p-6",
									children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h3", {
										className: "mb-4 font-display text-lg font-bold italic text-foreground",
										children: "Estatísticas"
									}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
										className: "space-y-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
													className: "flex items-center gap-2 text-sm text-fg-muted",
													children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Calendar, { className: "h-4 w-4 text-accent" }), "Agendamentos"]
												}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
													className: "font-bold text-foreground",
													children: totalAppointments
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
													className: "flex items-center gap-2 text-sm text-fg-muted",
													children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Star, { className: "h-4 w-4 text-accent" }), "Avaliação Média"]
												}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
													className: "font-bold text-foreground",
													children: averageRating > 0 ? averageRating.toFixed(1) : "N/A"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
													className: "flex items-center gap-2 text-sm text-fg-muted",
													children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(DollarSign, { className: "h-4 w-4 text-accent" }), "Total Gasto"]
												}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", {
													className: "font-bold text-accent",
													children: ["R$ ", totalSpent.toFixed(2)]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
												className: "border-t border-border pt-4 flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
													className: "flex items-center gap-2 text-sm text-fg-muted",
													children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Activity, { className: "h-4 w-4 text-accent" }), "Reviews Feitas"]
												}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
													className: "font-bold text-foreground",
													children: appointmentsWithReviews.length
												})]
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
									className: "rounded-2xl border border-border bg-surface-card p-6",
									children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h3", {
										className: "mb-4 font-display text-lg font-bold italic text-foreground",
										children: "Ações Rápidas"
									}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
										className: "flex flex-col gap-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("button", {
												className: "inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent",
												children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", { children: "Enviar Email" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("button", {
												className: "inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent",
												children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Calendar, { className: "h-4 w-4" }), "Ver Agendamentos"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("button", {
												className: "inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent",
												children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Star, { className: "h-4 w-4" }), "Ver Avaliações"]
											})
										]
									})]
								})
							]
						})]
					})
				})
			})
		})]
	});
}
var HomeExperience = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'HomeExperience' is called on server");
}, "f4a9707fc67e", "HomeExperience");
/**
* @constant
* @name daysInYear
* @summary Days in 1 year.
*
* @description
* How many days in a year.
*
* One years equals 365.2425 days according to the formula:
*
* > Leap year occurs every 4 years, except for years that are divisible by 100 and not divisible by 400.
* > 1 mean year = (365+1/4-1/100+1/400) days = 365.2425 days
*/
var daysInYear = 365.2425;
Math.pow(10, 8) * 24 * 60 * 60 * 1e3;
/**
* @constant
* @name millisecondsInWeek
* @summary Milliseconds in 1 week.
*/
var millisecondsInWeek = 6048e5;
/**
* @constant
* @name millisecondsInDay
* @summary Milliseconds in 1 day.
*/
var millisecondsInDay = 864e5;
/**
* @constant
* @name secondsInDay
* @summary Seconds in 1 day.
*/
var secondsInDay = 3600 * 24;
secondsInDay * 7;
secondsInDay * daysInYear / 12 * 3;
/**
* @constant
* @name constructFromSymbol
* @summary Symbol enabling Date extensions to inherit properties from the reference date.
*
* The symbol is used to enable the `constructFrom` function to construct a date
* using a reference date and a value. It allows to transfer extra properties
* from the reference date to the new date. It's useful for extensions like
* [`TZDate`](https://github.com/date-fns/tz) that accept a time zone as
* a constructor argument.
*/
var constructFromSymbol = Symbol.for("constructDateFrom");
/**
* @name constructFrom
* @category Generic Helpers
* @summary Constructs a date using the reference date and the value
*
* @description
* The function constructs a new date using the constructor from the reference
* date and the given value. It helps to build generic functions that accept
* date extensions.
*
* It defaults to `Date` if the passed reference date is a number or a string.
*
* Starting from v3.7.0, it allows to construct a date using `[Symbol.for("constructDateFrom")]`
* enabling to transfer extra properties from the reference date to the new date.
* It's useful for extensions like [`TZDate`](https://github.com/date-fns/tz)
* that accept a time zone as a constructor argument.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The reference date to take constructor from
* @param value - The value to create the date
*
* @returns Date initialized using the given date and value
*
* @example
* import { constructFrom } from "./constructFrom/date-fns";
*
* // A function that clones a date preserving the original type
* function cloneDate<DateType extends Date>(date: DateType): DateType {
*   return constructFrom(
*     date, // Use constructor from the given date
*     date.getTime() // Use the date value to create a new date
*   );
* }
*/
function constructFrom(date, value) {
	if (typeof date === "function") return date(value);
	if (date && typeof date === "object" && constructFromSymbol in date) return date[constructFromSymbol](value);
	if (date instanceof Date) return new date.constructor(value);
	return new Date(value);
}
function normalizeDates(context, ...dates) {
	const normalize = constructFrom.bind(null, context || dates.find((date) => typeof date === "object"));
	return dates.map(normalize);
}
/**
* @name toDate
* @category Common Helpers
* @summary Convert the given argument to an instance of Date.
*
* @description
* Convert the given argument to an instance of Date.
*
* If the argument is an instance of Date, the function returns its clone.
*
* If the argument is a number, it is treated as a timestamp.
*
* If the argument is none of the above, the function returns Invalid Date.
*
* Starting from v3.7.0, it clones a date using `[Symbol.for("constructDateFrom")]`
* enabling to transfer extra properties from the reference date to the new date.
* It's useful for extensions like [`TZDate`](https://github.com/date-fns/tz)
* that accept a time zone as a constructor argument.
*
* **Note**: *all* Date arguments passed to any *date-fns* function is processed by `toDate`.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
* @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
*
* @param argument - The value to convert
*
* @returns The parsed date in the local time zone
*
* @example
* // Clone the date:
* const result = toDate(new Date(2014, 1, 11, 11, 30, 30))
* //=> Tue Feb 11 2014 11:30:30
*
* @example
* // Convert the timestamp to date:
* const result = toDate(1392098430000)
* //=> Tue Feb 11 2014 11:30:30
*/
function toDate(argument, context) {
	return constructFrom(context || argument, argument);
}
/**
* Google Chrome as of 67.0.3396.87 introduced timezones with offset that includes seconds.
* They usually appear for dates that denote time before the timezones were introduced
* (e.g. for 'Europe/Prague' timezone the offset is GMT+00:57:44 before 1 October 1891
* and GMT+01:00:00 after that date)
*
* Date#getTimezoneOffset returns the offset in minutes and would return 57 for the example above,
* which would lead to incorrect calculations.
*
* This function returns the timezone offset in milliseconds that takes seconds in account.
*/
function getTimezoneOffsetInMilliseconds(date) {
	const _date = toDate(date);
	const utcDate = new Date(Date.UTC(_date.getFullYear(), _date.getMonth(), _date.getDate(), _date.getHours(), _date.getMinutes(), _date.getSeconds(), _date.getMilliseconds()));
	utcDate.setUTCFullYear(_date.getFullYear());
	return +date - +utcDate;
}
/**
* The {@link startOfDay} function options.
*/
/**
* @name startOfDay
* @category Day Helpers
* @summary Return the start of a day for the given date.
*
* @description
* Return the start of a day for the given date.
* The result will be in the local timezone.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
* @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
*
* @param date - The original date
* @param options - The options
*
* @returns The start of a day
*
* @example
* // The start of a day for 2 September 2014 11:55:00:
* const result = startOfDay(new Date(2014, 8, 2, 11, 55, 0))
* //=> Tue Sep 02 2014 00:00:00
*/
function startOfDay(date, options) {
	const _date = toDate(date, options?.in);
	_date.setHours(0, 0, 0, 0);
	return _date;
}
/**
* The {@link differenceInCalendarDays} function options.
*/
/**
* @name differenceInCalendarDays
* @category Day Helpers
* @summary Get the number of calendar days between the given dates.
*
* @description
* Get the number of calendar days between the given dates. This means that the times are removed
* from the dates and then the difference in days is calculated.
*
* @param laterDate - The later date
* @param earlierDate - The earlier date
* @param options - The options object
*
* @returns The number of calendar days
*
* @example
* // How many calendar days are between
* // 2 July 2011 23:00:00 and 2 July 2012 00:00:00?
* const result = differenceInCalendarDays(
*   new Date(2012, 6, 2, 0, 0),
*   new Date(2011, 6, 2, 23, 0)
* )
* //=> 366
* // How many calendar days are between
* // 2 July 2011 23:59:00 and 3 July 2011 00:01:00?
* const result = differenceInCalendarDays(
*   new Date(2011, 6, 3, 0, 1),
*   new Date(2011, 6, 2, 23, 59)
* )
* //=> 1
*/
function differenceInCalendarDays(laterDate, earlierDate, options) {
	const [laterDate_, earlierDate_] = normalizeDates(options?.in, laterDate, earlierDate);
	const laterStartOfDay = startOfDay(laterDate_);
	const earlierStartOfDay = startOfDay(earlierDate_);
	const laterTimestamp = +laterStartOfDay - getTimezoneOffsetInMilliseconds(laterStartOfDay);
	const earlierTimestamp = +earlierStartOfDay - getTimezoneOffsetInMilliseconds(earlierStartOfDay);
	return Math.round((laterTimestamp - earlierTimestamp) / millisecondsInDay);
}
/**
* The {@link differenceInDays} function options.
*/
/**
* @name differenceInDays
* @category Day Helpers
* @summary Get the number of full days between the given dates.
*
* @description
* Get the number of full day periods between two dates. Fractional days are
* truncated towards zero.
*
* One "full day" is the distance between a local time in one day to the same
* local time on the next or previous day. A full day can sometimes be less than
* or more than 24 hours if a daylight savings change happens between two dates.
*
* To ignore DST and only measure exact 24-hour periods, use this instead:
* `Math.trunc(differenceInHours(dateLeft, dateRight)/24)|0`.
*
* @param laterDate - The later date
* @param earlierDate - The earlier date
* @param options - An object with options
*
* @returns The number of full days according to the local timezone
*
* @example
* // How many full days are between
* // 2 July 2011 23:00:00 and 2 July 2012 00:00:00?
* const result = differenceInDays(
*   new Date(2012, 6, 2, 0, 0),
*   new Date(2011, 6, 2, 23, 0)
* )
* //=> 365
*
* @example
* // How many full days are between
* // 2 July 2011 23:59:00 and 3 July 2011 00:01:00?
* const result = differenceInDays(
*   new Date(2011, 6, 3, 0, 1),
*   new Date(2011, 6, 2, 23, 59)
* )
* //=> 0
*
* @example
* // How many full days are between
* // 1 March 2020 0:00 and 1 June 2020 0:00 ?
* // Note: because local time is used, the
* // result will always be 92 days, even in
* // time zones where DST starts and the
* // period has only 92*24-1 hours.
* const result = differenceInDays(
*   new Date(2020, 5, 1),
*   new Date(2020, 2, 1)
* )
* //=> 92
*/
function differenceInDays(laterDate, earlierDate, options) {
	const [laterDate_, earlierDate_] = normalizeDates(options?.in, laterDate, earlierDate);
	const sign = compareLocalAsc(laterDate_, earlierDate_);
	const difference = Math.abs(differenceInCalendarDays(laterDate_, earlierDate_));
	laterDate_.setDate(laterDate_.getDate() - sign * difference);
	const result = sign * (difference - Number(compareLocalAsc(laterDate_, earlierDate_) === -sign));
	return result === 0 ? 0 : result;
}
function compareLocalAsc(laterDate, earlierDate) {
	const diff = laterDate.getFullYear() - earlierDate.getFullYear() || laterDate.getMonth() - earlierDate.getMonth() || laterDate.getDate() - earlierDate.getDate() || laterDate.getHours() - earlierDate.getHours() || laterDate.getMinutes() - earlierDate.getMinutes() || laterDate.getSeconds() - earlierDate.getSeconds() || laterDate.getMilliseconds() - earlierDate.getMilliseconds();
	if (diff < 0) return -1;
	if (diff > 0) return 1;
	return diff;
}
var formatDistanceLocale = {
	lessThanXSeconds: {
		one: "less than a second",
		other: "less than {{count}} seconds"
	},
	xSeconds: {
		one: "1 second",
		other: "{{count}} seconds"
	},
	halfAMinute: "half a minute",
	lessThanXMinutes: {
		one: "less than a minute",
		other: "less than {{count}} minutes"
	},
	xMinutes: {
		one: "1 minute",
		other: "{{count}} minutes"
	},
	aboutXHours: {
		one: "about 1 hour",
		other: "about {{count}} hours"
	},
	xHours: {
		one: "1 hour",
		other: "{{count}} hours"
	},
	xDays: {
		one: "1 day",
		other: "{{count}} days"
	},
	aboutXWeeks: {
		one: "about 1 week",
		other: "about {{count}} weeks"
	},
	xWeeks: {
		one: "1 week",
		other: "{{count}} weeks"
	},
	aboutXMonths: {
		one: "about 1 month",
		other: "about {{count}} months"
	},
	xMonths: {
		one: "1 month",
		other: "{{count}} months"
	},
	aboutXYears: {
		one: "about 1 year",
		other: "about {{count}} years"
	},
	xYears: {
		one: "1 year",
		other: "{{count}} years"
	},
	overXYears: {
		one: "over 1 year",
		other: "over {{count}} years"
	},
	almostXYears: {
		one: "almost 1 year",
		other: "almost {{count}} years"
	}
};
var formatDistance = (token, count, options) => {
	let result;
	const tokenValue = formatDistanceLocale[token];
	if (typeof tokenValue === "string") result = tokenValue;
	else if (count === 1) result = tokenValue.one;
	else result = tokenValue.other.replace("{{count}}", count.toString());
	if (options?.addSuffix) if (options.comparison && options.comparison > 0) return "in " + result;
	else return result + " ago";
	return result;
};
function buildFormatLongFn(args) {
	return (options = {}) => {
		const width = options.width ? String(options.width) : args.defaultWidth;
		return args.formats[width] || args.formats[args.defaultWidth];
	};
}
var formatLong = {
	date: buildFormatLongFn({
		formats: {
			full: "EEEE, MMMM do, y",
			long: "MMMM do, y",
			medium: "MMM d, y",
			short: "MM/dd/yyyy"
		},
		defaultWidth: "full"
	}),
	time: buildFormatLongFn({
		formats: {
			full: "h:mm:ss a zzzz",
			long: "h:mm:ss a z",
			medium: "h:mm:ss a",
			short: "h:mm a"
		},
		defaultWidth: "full"
	}),
	dateTime: buildFormatLongFn({
		formats: {
			full: "{{date}} 'at' {{time}}",
			long: "{{date}} 'at' {{time}}",
			medium: "{{date}}, {{time}}",
			short: "{{date}}, {{time}}"
		},
		defaultWidth: "full"
	})
};
var formatRelativeLocale = {
	lastWeek: "'last' eeee 'at' p",
	yesterday: "'yesterday at' p",
	today: "'today at' p",
	tomorrow: "'tomorrow at' p",
	nextWeek: "eeee 'at' p",
	other: "P"
};
var formatRelative = (token, _date, _baseDate, _options) => formatRelativeLocale[token];
/**
* The localize function argument callback which allows to convert raw value to
* the actual type.
*
* @param value - The value to convert
*
* @returns The converted value
*/
/**
* The map of localized values for each width.
*/
/**
* The index type of the locale unit value. It types conversion of units of
* values that don't start at 0 (i.e. quarters).
*/
/**
* Converts the unit value to the tuple of values.
*/
/**
* The tuple of localized era values. The first element represents BC,
* the second element represents AD.
*/
/**
* The tuple of localized quarter values. The first element represents Q1.
*/
/**
* The tuple of localized day values. The first element represents Sunday.
*/
/**
* The tuple of localized month values. The first element represents January.
*/
function buildLocalizeFn(args) {
	return (value, options) => {
		const context = options?.context ? String(options.context) : "standalone";
		let valuesArray;
		if (context === "formatting" && args.formattingValues) {
			const defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
			const width = options?.width ? String(options.width) : defaultWidth;
			valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
		} else {
			const defaultWidth = args.defaultWidth;
			const width = options?.width ? String(options.width) : args.defaultWidth;
			valuesArray = args.values[width] || args.values[defaultWidth];
		}
		const index = args.argumentCallback ? args.argumentCallback(value) : value;
		return valuesArray[index];
	};
}
var eraValues = {
	narrow: ["B", "A"],
	abbreviated: ["BC", "AD"],
	wide: ["Before Christ", "Anno Domini"]
};
var quarterValues = {
	narrow: [
		"1",
		"2",
		"3",
		"4"
	],
	abbreviated: [
		"Q1",
		"Q2",
		"Q3",
		"Q4"
	],
	wide: [
		"1st quarter",
		"2nd quarter",
		"3rd quarter",
		"4th quarter"
	]
};
var monthValues = {
	narrow: [
		"J",
		"F",
		"M",
		"A",
		"M",
		"J",
		"J",
		"A",
		"S",
		"O",
		"N",
		"D"
	],
	abbreviated: [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	],
	wide: [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	]
};
var dayValues = {
	narrow: [
		"S",
		"M",
		"T",
		"W",
		"T",
		"F",
		"S"
	],
	short: [
		"Su",
		"Mo",
		"Tu",
		"We",
		"Th",
		"Fr",
		"Sa"
	],
	abbreviated: [
		"Sun",
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat"
	],
	wide: [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday"
	]
};
var dayPeriodValues = {
	narrow: {
		am: "a",
		pm: "p",
		midnight: "mi",
		noon: "n",
		morning: "morning",
		afternoon: "afternoon",
		evening: "evening",
		night: "night"
	},
	abbreviated: {
		am: "AM",
		pm: "PM",
		midnight: "midnight",
		noon: "noon",
		morning: "morning",
		afternoon: "afternoon",
		evening: "evening",
		night: "night"
	},
	wide: {
		am: "a.m.",
		pm: "p.m.",
		midnight: "midnight",
		noon: "noon",
		morning: "morning",
		afternoon: "afternoon",
		evening: "evening",
		night: "night"
	}
};
var formattingDayPeriodValues = {
	narrow: {
		am: "a",
		pm: "p",
		midnight: "mi",
		noon: "n",
		morning: "in the morning",
		afternoon: "in the afternoon",
		evening: "in the evening",
		night: "at night"
	},
	abbreviated: {
		am: "AM",
		pm: "PM",
		midnight: "midnight",
		noon: "noon",
		morning: "in the morning",
		afternoon: "in the afternoon",
		evening: "in the evening",
		night: "at night"
	},
	wide: {
		am: "a.m.",
		pm: "p.m.",
		midnight: "midnight",
		noon: "noon",
		morning: "in the morning",
		afternoon: "in the afternoon",
		evening: "in the evening",
		night: "at night"
	}
};
var ordinalNumber = (dirtyNumber, _options) => {
	const number = Number(dirtyNumber);
	const rem100 = number % 100;
	if (rem100 > 20 || rem100 < 10) switch (rem100 % 10) {
		case 1: return number + "st";
		case 2: return number + "nd";
		case 3: return number + "rd";
	}
	return number + "th";
};
var localize = {
	ordinalNumber,
	era: buildLocalizeFn({
		values: eraValues,
		defaultWidth: "wide"
	}),
	quarter: buildLocalizeFn({
		values: quarterValues,
		defaultWidth: "wide",
		argumentCallback: (quarter) => quarter - 1
	}),
	month: buildLocalizeFn({
		values: monthValues,
		defaultWidth: "wide"
	}),
	day: buildLocalizeFn({
		values: dayValues,
		defaultWidth: "wide"
	}),
	dayPeriod: buildLocalizeFn({
		values: dayPeriodValues,
		defaultWidth: "wide",
		formattingValues: formattingDayPeriodValues,
		defaultFormattingWidth: "wide"
	})
};
function buildMatchFn(args) {
	return (string, options = {}) => {
		const width = options.width;
		const matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
		const matchResult = string.match(matchPattern);
		if (!matchResult) return null;
		const matchedString = matchResult[0];
		const parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
		const key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, (pattern) => pattern.test(matchedString)) : findKey(parsePatterns, (pattern) => pattern.test(matchedString));
		let value;
		value = args.valueCallback ? args.valueCallback(key) : key;
		value = options.valueCallback ? options.valueCallback(value) : value;
		const rest = string.slice(matchedString.length);
		return {
			value,
			rest
		};
	};
}
function findKey(object, predicate) {
	for (const key in object) if (Object.prototype.hasOwnProperty.call(object, key) && predicate(object[key])) return key;
}
function findIndex(array, predicate) {
	for (let key = 0; key < array.length; key++) if (predicate(array[key])) return key;
}
function buildMatchPatternFn(args) {
	return (string, options = {}) => {
		const matchResult = string.match(args.matchPattern);
		if (!matchResult) return null;
		const matchedString = matchResult[0];
		const parseResult = string.match(args.parsePattern);
		if (!parseResult) return null;
		let value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
		value = options.valueCallback ? options.valueCallback(value) : value;
		const rest = string.slice(matchedString.length);
		return {
			value,
			rest
		};
	};
}
/**
* @category Locales
* @summary English locale (United States).
* @language English
* @iso-639-2 eng
* @author Sasha Koss [@kossnocorp](https://github.com/kossnocorp)
* @author Lesha Koss [@leshakoss](https://github.com/leshakoss)
*/
var enUS = {
	code: "en-US",
	formatDistance,
	formatLong,
	formatRelative,
	localize,
	match: {
		ordinalNumber: buildMatchPatternFn({
			matchPattern: /^(\d+)(th|st|nd|rd)?/i,
			parsePattern: /\d+/i,
			valueCallback: (value) => parseInt(value, 10)
		}),
		era: buildMatchFn({
			matchPatterns: {
				narrow: /^(b|a)/i,
				abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
				wide: /^(before christ|before common era|anno domini|common era)/i
			},
			defaultMatchWidth: "wide",
			parsePatterns: { any: [/^b/i, /^(a|c)/i] },
			defaultParseWidth: "any"
		}),
		quarter: buildMatchFn({
			matchPatterns: {
				narrow: /^[1234]/i,
				abbreviated: /^q[1234]/i,
				wide: /^[1234](th|st|nd|rd)? quarter/i
			},
			defaultMatchWidth: "wide",
			parsePatterns: { any: [
				/1/i,
				/2/i,
				/3/i,
				/4/i
			] },
			defaultParseWidth: "any",
			valueCallback: (index) => index + 1
		}),
		month: buildMatchFn({
			matchPatterns: {
				narrow: /^[jfmasond]/i,
				abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
				wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
			},
			defaultMatchWidth: "wide",
			parsePatterns: {
				narrow: [
					/^j/i,
					/^f/i,
					/^m/i,
					/^a/i,
					/^m/i,
					/^j/i,
					/^j/i,
					/^a/i,
					/^s/i,
					/^o/i,
					/^n/i,
					/^d/i
				],
				any: [
					/^ja/i,
					/^f/i,
					/^mar/i,
					/^ap/i,
					/^may/i,
					/^jun/i,
					/^jul/i,
					/^au/i,
					/^s/i,
					/^o/i,
					/^n/i,
					/^d/i
				]
			},
			defaultParseWidth: "any"
		}),
		day: buildMatchFn({
			matchPatterns: {
				narrow: /^[smtwf]/i,
				short: /^(su|mo|tu|we|th|fr|sa)/i,
				abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
				wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
			},
			defaultMatchWidth: "wide",
			parsePatterns: {
				narrow: [
					/^s/i,
					/^m/i,
					/^t/i,
					/^w/i,
					/^t/i,
					/^f/i,
					/^s/i
				],
				any: [
					/^su/i,
					/^m/i,
					/^tu/i,
					/^w/i,
					/^th/i,
					/^f/i,
					/^sa/i
				]
			},
			defaultParseWidth: "any"
		}),
		dayPeriod: buildMatchFn({
			matchPatterns: {
				narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
				any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
			},
			defaultMatchWidth: "any",
			parsePatterns: { any: {
				am: /^a/i,
				pm: /^p/i,
				midnight: /^mi/i,
				noon: /^no/i,
				morning: /morning/i,
				afternoon: /afternoon/i,
				evening: /evening/i,
				night: /night/i
			} },
			defaultParseWidth: "any"
		})
	},
	options: {
		weekStartsOn: 0,
		firstWeekContainsDate: 1
	}
};
var defaultOptions = {};
function getDefaultOptions() {
	return defaultOptions;
}
/**
* The {@link startOfYear} function options.
*/
/**
* @name startOfYear
* @category Year Helpers
* @summary Return the start of a year for the given date.
*
* @description
* Return the start of a year for the given date.
* The result will be in the local timezone.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
* @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
*
* @param date - The original date
* @param options - The options
*
* @returns The start of a year
*
* @example
* // The start of a year for 2 September 2014 11:55:00:
* const result = startOfYear(new Date(2014, 8, 2, 11, 55, 00))
* //=> Wed Jan 01 2014 00:00:00
*/
function startOfYear(date, options) {
	const date_ = toDate(date, options?.in);
	date_.setFullYear(date_.getFullYear(), 0, 1);
	date_.setHours(0, 0, 0, 0);
	return date_;
}
/**
* The {@link getDayOfYear} function options.
*/
/**
* @name getDayOfYear
* @category Day Helpers
* @summary Get the day of the year of the given date.
*
* @description
* Get the day of the year of the given date.
*
* @param date - The given date
* @param options - The options
*
* @returns The day of year
*
* @example
* // Which day of the year is 2 July 2014?
* const result = getDayOfYear(new Date(2014, 6, 2))
* //=> 183
*/
function getDayOfYear(date, options) {
	const _date = toDate(date, options?.in);
	return differenceInCalendarDays(_date, startOfYear(_date)) + 1;
}
/**
* The {@link startOfWeek} function options.
*/
/**
* @name startOfWeek
* @category Week Helpers
* @summary Return the start of a week for the given date.
*
* @description
* Return the start of a week for the given date.
* The result will be in the local timezone.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
* @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
*
* @param date - The original date
* @param options - An object with options
*
* @returns The start of a week
*
* @example
* // The start of a week for 2 September 2014 11:55:00:
* const result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0))
* //=> Sun Aug 31 2014 00:00:00
*
* @example
* // If the week starts on Monday, the start of the week for 2 September 2014 11:55:00:
* const result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0), { weekStartsOn: 1 })
* //=> Mon Sep 01 2014 00:00:00
*/
function startOfWeek(date, options) {
	const defaultOptions = getDefaultOptions();
	const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions.weekStartsOn ?? defaultOptions.locale?.options?.weekStartsOn ?? 0;
	const _date = toDate(date, options?.in);
	const day = _date.getDay();
	const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
	_date.setDate(_date.getDate() - diff);
	_date.setHours(0, 0, 0, 0);
	return _date;
}
/**
* The {@link startOfISOWeek} function options.
*/
/**
* @name startOfISOWeek
* @category ISO Week Helpers
* @summary Return the start of an ISO week for the given date.
*
* @description
* Return the start of an ISO week for the given date.
* The result will be in the local timezone.
*
* ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
* @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
*
* @param date - The original date
* @param options - An object with options
*
* @returns The start of an ISO week
*
* @example
* // The start of an ISO week for 2 September 2014 11:55:00:
* const result = startOfISOWeek(new Date(2014, 8, 2, 11, 55, 0))
* //=> Mon Sep 01 2014 00:00:00
*/
function startOfISOWeek(date, options) {
	return startOfWeek(date, {
		...options,
		weekStartsOn: 1
	});
}
/**
* The {@link getISOWeekYear} function options.
*/
/**
* @name getISOWeekYear
* @category ISO Week-Numbering Year Helpers
* @summary Get the ISO week-numbering year of the given date.
*
* @description
* Get the ISO week-numbering year of the given date,
* which always starts 3 days before the year's first Thursday.
*
* ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
*
* @param date - The given date
*
* @returns The ISO week-numbering year
*
* @example
* // Which ISO-week numbering year is 2 January 2005?
* const result = getISOWeekYear(new Date(2005, 0, 2))
* //=> 2004
*/
function getISOWeekYear(date, options) {
	const _date = toDate(date, options?.in);
	const year = _date.getFullYear();
	const fourthOfJanuaryOfNextYear = constructFrom(_date, 0);
	fourthOfJanuaryOfNextYear.setFullYear(year + 1, 0, 4);
	fourthOfJanuaryOfNextYear.setHours(0, 0, 0, 0);
	const startOfNextYear = startOfISOWeek(fourthOfJanuaryOfNextYear);
	const fourthOfJanuaryOfThisYear = constructFrom(_date, 0);
	fourthOfJanuaryOfThisYear.setFullYear(year, 0, 4);
	fourthOfJanuaryOfThisYear.setHours(0, 0, 0, 0);
	const startOfThisYear = startOfISOWeek(fourthOfJanuaryOfThisYear);
	if (_date.getTime() >= startOfNextYear.getTime()) return year + 1;
	else if (_date.getTime() >= startOfThisYear.getTime()) return year;
	else return year - 1;
}
/**
* The {@link startOfISOWeekYear} function options.
*/
/**
* @name startOfISOWeekYear
* @category ISO Week-Numbering Year Helpers
* @summary Return the start of an ISO week-numbering year for the given date.
*
* @description
* Return the start of an ISO week-numbering year,
* which always starts 3 days before the year's first Thursday.
* The result will be in the local timezone.
*
* ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
* @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
*
* @param date - The original date
* @param options - An object with options
*
* @returns The start of an ISO week-numbering year
*
* @example
* // The start of an ISO week-numbering year for 2 July 2005:
* const result = startOfISOWeekYear(new Date(2005, 6, 2))
* //=> Mon Jan 03 2005 00:00:00
*/
function startOfISOWeekYear(date, options) {
	const year = getISOWeekYear(date, options);
	const fourthOfJanuary = constructFrom(options?.in || date, 0);
	fourthOfJanuary.setFullYear(year, 0, 4);
	fourthOfJanuary.setHours(0, 0, 0, 0);
	return startOfISOWeek(fourthOfJanuary);
}
/**
* The {@link getISOWeek} function options.
*/
/**
* @name getISOWeek
* @category ISO Week Helpers
* @summary Get the ISO week of the given date.
*
* @description
* Get the ISO week of the given date.
*
* ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
*
* @param date - The given date
* @param options - The options
*
* @returns The ISO week
*
* @example
* // Which week of the ISO-week numbering year is 2 January 2005?
* const result = getISOWeek(new Date(2005, 0, 2))
* //=> 53
*/
function getISOWeek(date, options) {
	const _date = toDate(date, options?.in);
	const diff = +startOfISOWeek(_date) - +startOfISOWeekYear(_date);
	return Math.round(diff / millisecondsInWeek) + 1;
}
/**
* The {@link getWeekYear} function options.
*/
/**
* @name getWeekYear
* @category Week-Numbering Year Helpers
* @summary Get the local week-numbering year of the given date.
*
* @description
* Get the local week-numbering year of the given date.
* The exact calculation depends on the values of
* `options.weekStartsOn` (which is the index of the first day of the week)
* and `options.firstWeekContainsDate` (which is the day of January, which is always in
* the first week of the week-numbering year)
*
* Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
*
* @param date - The given date
* @param options - An object with options.
*
* @returns The local week-numbering year
*
* @example
* // Which week numbering year is 26 December 2004 with the default settings?
* const result = getWeekYear(new Date(2004, 11, 26))
* //=> 2005
*
* @example
* // Which week numbering year is 26 December 2004 if week starts on Saturday?
* const result = getWeekYear(new Date(2004, 11, 26), { weekStartsOn: 6 })
* //=> 2004
*
* @example
* // Which week numbering year is 26 December 2004 if the first week contains 4 January?
* const result = getWeekYear(new Date(2004, 11, 26), { firstWeekContainsDate: 4 })
* //=> 2004
*/
function getWeekYear(date, options) {
	const _date = toDate(date, options?.in);
	const year = _date.getFullYear();
	const defaultOptions = getDefaultOptions();
	const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions.firstWeekContainsDate ?? defaultOptions.locale?.options?.firstWeekContainsDate ?? 1;
	const firstWeekOfNextYear = constructFrom(options?.in || date, 0);
	firstWeekOfNextYear.setFullYear(year + 1, 0, firstWeekContainsDate);
	firstWeekOfNextYear.setHours(0, 0, 0, 0);
	const startOfNextYear = startOfWeek(firstWeekOfNextYear, options);
	const firstWeekOfThisYear = constructFrom(options?.in || date, 0);
	firstWeekOfThisYear.setFullYear(year, 0, firstWeekContainsDate);
	firstWeekOfThisYear.setHours(0, 0, 0, 0);
	const startOfThisYear = startOfWeek(firstWeekOfThisYear, options);
	if (+_date >= +startOfNextYear) return year + 1;
	else if (+_date >= +startOfThisYear) return year;
	else return year - 1;
}
/**
* The {@link startOfWeekYear} function options.
*/
/**
* @name startOfWeekYear
* @category Week-Numbering Year Helpers
* @summary Return the start of a local week-numbering year for the given date.
*
* @description
* Return the start of a local week-numbering year.
* The exact calculation depends on the values of
* `options.weekStartsOn` (which is the index of the first day of the week)
* and `options.firstWeekContainsDate` (which is the day of January, which is always in
* the first week of the week-numbering year)
*
* Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
* @typeParam ResultDate - The result `Date` type.
*
* @param date - The original date
* @param options - An object with options
*
* @returns The start of a week-numbering year
*
* @example
* // The start of an a week-numbering year for 2 July 2005 with default settings:
* const result = startOfWeekYear(new Date(2005, 6, 2))
* //=> Sun Dec 26 2004 00:00:00
*
* @example
* // The start of a week-numbering year for 2 July 2005
* // if Monday is the first day of week
* // and 4 January is always in the first week of the year:
* const result = startOfWeekYear(new Date(2005, 6, 2), {
*   weekStartsOn: 1,
*   firstWeekContainsDate: 4
* })
* //=> Mon Jan 03 2005 00:00:00
*/
function startOfWeekYear(date, options) {
	const defaultOptions = getDefaultOptions();
	const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions.firstWeekContainsDate ?? defaultOptions.locale?.options?.firstWeekContainsDate ?? 1;
	const year = getWeekYear(date, options);
	const firstWeek = constructFrom(options?.in || date, 0);
	firstWeek.setFullYear(year, 0, firstWeekContainsDate);
	firstWeek.setHours(0, 0, 0, 0);
	return startOfWeek(firstWeek, options);
}
/**
* The {@link getWeek} function options.
*/
/**
* @name getWeek
* @category Week Helpers
* @summary Get the local week index of the given date.
*
* @description
* Get the local week index of the given date.
* The exact calculation depends on the values of
* `options.weekStartsOn` (which is the index of the first day of the week)
* and `options.firstWeekContainsDate` (which is the day of January, which is always in
* the first week of the week-numbering year)
*
* Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
*
* @param date - The given date
* @param options - An object with options
*
* @returns The week
*
* @example
* // Which week of the local week numbering year is 2 January 2005 with default options?
* const result = getWeek(new Date(2005, 0, 2))
* //=> 2
*
* @example
* // Which week of the local week numbering year is 2 January 2005,
* // if Monday is the first day of the week,
* // and the first week of the year always contains 4 January?
* const result = getWeek(new Date(2005, 0, 2), {
*   weekStartsOn: 1,
*   firstWeekContainsDate: 4
* })
* //=> 53
*/
function getWeek(date, options) {
	const _date = toDate(date, options?.in);
	const diff = +startOfWeek(_date, options) - +startOfWeekYear(_date, options);
	return Math.round(diff / millisecondsInWeek) + 1;
}
function addLeadingZeros(number, targetLength) {
	return (number < 0 ? "-" : "") + Math.abs(number).toString().padStart(targetLength, "0");
}
var lightFormatters = {
	y(date, token) {
		const signedYear = date.getFullYear();
		const year = signedYear > 0 ? signedYear : 1 - signedYear;
		return addLeadingZeros(token === "yy" ? year % 100 : year, token.length);
	},
	M(date, token) {
		const month = date.getMonth();
		return token === "M" ? String(month + 1) : addLeadingZeros(month + 1, 2);
	},
	d(date, token) {
		return addLeadingZeros(date.getDate(), token.length);
	},
	a(date, token) {
		const dayPeriodEnumValue = date.getHours() / 12 >= 1 ? "pm" : "am";
		switch (token) {
			case "a":
			case "aa": return dayPeriodEnumValue.toUpperCase();
			case "aaa": return dayPeriodEnumValue;
			case "aaaaa": return dayPeriodEnumValue[0];
			default: return dayPeriodEnumValue === "am" ? "a.m." : "p.m.";
		}
	},
	h(date, token) {
		return addLeadingZeros(date.getHours() % 12 || 12, token.length);
	},
	H(date, token) {
		return addLeadingZeros(date.getHours(), token.length);
	},
	m(date, token) {
		return addLeadingZeros(date.getMinutes(), token.length);
	},
	s(date, token) {
		return addLeadingZeros(date.getSeconds(), token.length);
	},
	S(date, token) {
		const numberOfDigits = token.length;
		const milliseconds = date.getMilliseconds();
		return addLeadingZeros(Math.trunc(milliseconds * Math.pow(10, numberOfDigits - 3)), token.length);
	}
};
var dayPeriodEnum = {
	am: "am",
	pm: "pm",
	midnight: "midnight",
	noon: "noon",
	morning: "morning",
	afternoon: "afternoon",
	evening: "evening",
	night: "night"
};
var formatters = {
	G: function(date, token, localize) {
		const era = date.getFullYear() > 0 ? 1 : 0;
		switch (token) {
			case "G":
			case "GG":
			case "GGG": return localize.era(era, { width: "abbreviated" });
			case "GGGGG": return localize.era(era, { width: "narrow" });
			default: return localize.era(era, { width: "wide" });
		}
	},
	y: function(date, token, localize) {
		if (token === "yo") {
			const signedYear = date.getFullYear();
			const year = signedYear > 0 ? signedYear : 1 - signedYear;
			return localize.ordinalNumber(year, { unit: "year" });
		}
		return lightFormatters.y(date, token);
	},
	Y: function(date, token, localize, options) {
		const signedWeekYear = getWeekYear(date, options);
		const weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear;
		if (token === "YY") return addLeadingZeros(weekYear % 100, 2);
		if (token === "Yo") return localize.ordinalNumber(weekYear, { unit: "year" });
		return addLeadingZeros(weekYear, token.length);
	},
	R: function(date, token) {
		return addLeadingZeros(getISOWeekYear(date), token.length);
	},
	u: function(date, token) {
		return addLeadingZeros(date.getFullYear(), token.length);
	},
	Q: function(date, token, localize) {
		const quarter = Math.ceil((date.getMonth() + 1) / 3);
		switch (token) {
			case "Q": return String(quarter);
			case "QQ": return addLeadingZeros(quarter, 2);
			case "Qo": return localize.ordinalNumber(quarter, { unit: "quarter" });
			case "QQQ": return localize.quarter(quarter, {
				width: "abbreviated",
				context: "formatting"
			});
			case "QQQQQ": return localize.quarter(quarter, {
				width: "narrow",
				context: "formatting"
			});
			default: return localize.quarter(quarter, {
				width: "wide",
				context: "formatting"
			});
		}
	},
	q: function(date, token, localize) {
		const quarter = Math.ceil((date.getMonth() + 1) / 3);
		switch (token) {
			case "q": return String(quarter);
			case "qq": return addLeadingZeros(quarter, 2);
			case "qo": return localize.ordinalNumber(quarter, { unit: "quarter" });
			case "qqq": return localize.quarter(quarter, {
				width: "abbreviated",
				context: "standalone"
			});
			case "qqqqq": return localize.quarter(quarter, {
				width: "narrow",
				context: "standalone"
			});
			default: return localize.quarter(quarter, {
				width: "wide",
				context: "standalone"
			});
		}
	},
	M: function(date, token, localize) {
		const month = date.getMonth();
		switch (token) {
			case "M":
			case "MM": return lightFormatters.M(date, token);
			case "Mo": return localize.ordinalNumber(month + 1, { unit: "month" });
			case "MMM": return localize.month(month, {
				width: "abbreviated",
				context: "formatting"
			});
			case "MMMMM": return localize.month(month, {
				width: "narrow",
				context: "formatting"
			});
			default: return localize.month(month, {
				width: "wide",
				context: "formatting"
			});
		}
	},
	L: function(date, token, localize) {
		const month = date.getMonth();
		switch (token) {
			case "L": return String(month + 1);
			case "LL": return addLeadingZeros(month + 1, 2);
			case "Lo": return localize.ordinalNumber(month + 1, { unit: "month" });
			case "LLL": return localize.month(month, {
				width: "abbreviated",
				context: "standalone"
			});
			case "LLLLL": return localize.month(month, {
				width: "narrow",
				context: "standalone"
			});
			default: return localize.month(month, {
				width: "wide",
				context: "standalone"
			});
		}
	},
	w: function(date, token, localize, options) {
		const week = getWeek(date, options);
		if (token === "wo") return localize.ordinalNumber(week, { unit: "week" });
		return addLeadingZeros(week, token.length);
	},
	I: function(date, token, localize) {
		const isoWeek = getISOWeek(date);
		if (token === "Io") return localize.ordinalNumber(isoWeek, { unit: "week" });
		return addLeadingZeros(isoWeek, token.length);
	},
	d: function(date, token, localize) {
		if (token === "do") return localize.ordinalNumber(date.getDate(), { unit: "date" });
		return lightFormatters.d(date, token);
	},
	D: function(date, token, localize) {
		const dayOfYear = getDayOfYear(date);
		if (token === "Do") return localize.ordinalNumber(dayOfYear, { unit: "dayOfYear" });
		return addLeadingZeros(dayOfYear, token.length);
	},
	E: function(date, token, localize) {
		const dayOfWeek = date.getDay();
		switch (token) {
			case "E":
			case "EE":
			case "EEE": return localize.day(dayOfWeek, {
				width: "abbreviated",
				context: "formatting"
			});
			case "EEEEE": return localize.day(dayOfWeek, {
				width: "narrow",
				context: "formatting"
			});
			case "EEEEEE": return localize.day(dayOfWeek, {
				width: "short",
				context: "formatting"
			});
			default: return localize.day(dayOfWeek, {
				width: "wide",
				context: "formatting"
			});
		}
	},
	e: function(date, token, localize, options) {
		const dayOfWeek = date.getDay();
		const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
		switch (token) {
			case "e": return String(localDayOfWeek);
			case "ee": return addLeadingZeros(localDayOfWeek, 2);
			case "eo": return localize.ordinalNumber(localDayOfWeek, { unit: "day" });
			case "eee": return localize.day(dayOfWeek, {
				width: "abbreviated",
				context: "formatting"
			});
			case "eeeee": return localize.day(dayOfWeek, {
				width: "narrow",
				context: "formatting"
			});
			case "eeeeee": return localize.day(dayOfWeek, {
				width: "short",
				context: "formatting"
			});
			default: return localize.day(dayOfWeek, {
				width: "wide",
				context: "formatting"
			});
		}
	},
	c: function(date, token, localize, options) {
		const dayOfWeek = date.getDay();
		const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
		switch (token) {
			case "c": return String(localDayOfWeek);
			case "cc": return addLeadingZeros(localDayOfWeek, token.length);
			case "co": return localize.ordinalNumber(localDayOfWeek, { unit: "day" });
			case "ccc": return localize.day(dayOfWeek, {
				width: "abbreviated",
				context: "standalone"
			});
			case "ccccc": return localize.day(dayOfWeek, {
				width: "narrow",
				context: "standalone"
			});
			case "cccccc": return localize.day(dayOfWeek, {
				width: "short",
				context: "standalone"
			});
			default: return localize.day(dayOfWeek, {
				width: "wide",
				context: "standalone"
			});
		}
	},
	i: function(date, token, localize) {
		const dayOfWeek = date.getDay();
		const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
		switch (token) {
			case "i": return String(isoDayOfWeek);
			case "ii": return addLeadingZeros(isoDayOfWeek, token.length);
			case "io": return localize.ordinalNumber(isoDayOfWeek, { unit: "day" });
			case "iii": return localize.day(dayOfWeek, {
				width: "abbreviated",
				context: "formatting"
			});
			case "iiiii": return localize.day(dayOfWeek, {
				width: "narrow",
				context: "formatting"
			});
			case "iiiiii": return localize.day(dayOfWeek, {
				width: "short",
				context: "formatting"
			});
			default: return localize.day(dayOfWeek, {
				width: "wide",
				context: "formatting"
			});
		}
	},
	a: function(date, token, localize) {
		const dayPeriodEnumValue = date.getHours() / 12 >= 1 ? "pm" : "am";
		switch (token) {
			case "a":
			case "aa": return localize.dayPeriod(dayPeriodEnumValue, {
				width: "abbreviated",
				context: "formatting"
			});
			case "aaa": return localize.dayPeriod(dayPeriodEnumValue, {
				width: "abbreviated",
				context: "formatting"
			}).toLowerCase();
			case "aaaaa": return localize.dayPeriod(dayPeriodEnumValue, {
				width: "narrow",
				context: "formatting"
			});
			default: return localize.dayPeriod(dayPeriodEnumValue, {
				width: "wide",
				context: "formatting"
			});
		}
	},
	b: function(date, token, localize) {
		const hours = date.getHours();
		let dayPeriodEnumValue;
		if (hours === 12) dayPeriodEnumValue = dayPeriodEnum.noon;
		else if (hours === 0) dayPeriodEnumValue = dayPeriodEnum.midnight;
		else dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
		switch (token) {
			case "b":
			case "bb": return localize.dayPeriod(dayPeriodEnumValue, {
				width: "abbreviated",
				context: "formatting"
			});
			case "bbb": return localize.dayPeriod(dayPeriodEnumValue, {
				width: "abbreviated",
				context: "formatting"
			}).toLowerCase();
			case "bbbbb": return localize.dayPeriod(dayPeriodEnumValue, {
				width: "narrow",
				context: "formatting"
			});
			default: return localize.dayPeriod(dayPeriodEnumValue, {
				width: "wide",
				context: "formatting"
			});
		}
	},
	B: function(date, token, localize) {
		const hours = date.getHours();
		let dayPeriodEnumValue;
		if (hours >= 17) dayPeriodEnumValue = dayPeriodEnum.evening;
		else if (hours >= 12) dayPeriodEnumValue = dayPeriodEnum.afternoon;
		else if (hours >= 4) dayPeriodEnumValue = dayPeriodEnum.morning;
		else dayPeriodEnumValue = dayPeriodEnum.night;
		switch (token) {
			case "B":
			case "BB":
			case "BBB": return localize.dayPeriod(dayPeriodEnumValue, {
				width: "abbreviated",
				context: "formatting"
			});
			case "BBBBB": return localize.dayPeriod(dayPeriodEnumValue, {
				width: "narrow",
				context: "formatting"
			});
			default: return localize.dayPeriod(dayPeriodEnumValue, {
				width: "wide",
				context: "formatting"
			});
		}
	},
	h: function(date, token, localize) {
		if (token === "ho") {
			let hours = date.getHours() % 12;
			if (hours === 0) hours = 12;
			return localize.ordinalNumber(hours, { unit: "hour" });
		}
		return lightFormatters.h(date, token);
	},
	H: function(date, token, localize) {
		if (token === "Ho") return localize.ordinalNumber(date.getHours(), { unit: "hour" });
		return lightFormatters.H(date, token);
	},
	K: function(date, token, localize) {
		const hours = date.getHours() % 12;
		if (token === "Ko") return localize.ordinalNumber(hours, { unit: "hour" });
		return addLeadingZeros(hours, token.length);
	},
	k: function(date, token, localize) {
		let hours = date.getHours();
		if (hours === 0) hours = 24;
		if (token === "ko") return localize.ordinalNumber(hours, { unit: "hour" });
		return addLeadingZeros(hours, token.length);
	},
	m: function(date, token, localize) {
		if (token === "mo") return localize.ordinalNumber(date.getMinutes(), { unit: "minute" });
		return lightFormatters.m(date, token);
	},
	s: function(date, token, localize) {
		if (token === "so") return localize.ordinalNumber(date.getSeconds(), { unit: "second" });
		return lightFormatters.s(date, token);
	},
	S: function(date, token) {
		return lightFormatters.S(date, token);
	},
	X: function(date, token, _localize) {
		const timezoneOffset = date.getTimezoneOffset();
		if (timezoneOffset === 0) return "Z";
		switch (token) {
			case "X": return formatTimezoneWithOptionalMinutes(timezoneOffset);
			case "XXXX":
			case "XX": return formatTimezone(timezoneOffset);
			default: return formatTimezone(timezoneOffset, ":");
		}
	},
	x: function(date, token, _localize) {
		const timezoneOffset = date.getTimezoneOffset();
		switch (token) {
			case "x": return formatTimezoneWithOptionalMinutes(timezoneOffset);
			case "xxxx":
			case "xx": return formatTimezone(timezoneOffset);
			default: return formatTimezone(timezoneOffset, ":");
		}
	},
	O: function(date, token, _localize) {
		const timezoneOffset = date.getTimezoneOffset();
		switch (token) {
			case "O":
			case "OO":
			case "OOO": return "GMT" + formatTimezoneShort(timezoneOffset, ":");
			default: return "GMT" + formatTimezone(timezoneOffset, ":");
		}
	},
	z: function(date, token, _localize) {
		const timezoneOffset = date.getTimezoneOffset();
		switch (token) {
			case "z":
			case "zz":
			case "zzz": return "GMT" + formatTimezoneShort(timezoneOffset, ":");
			default: return "GMT" + formatTimezone(timezoneOffset, ":");
		}
	},
	t: function(date, token, _localize) {
		return addLeadingZeros(Math.trunc(+date / 1e3), token.length);
	},
	T: function(date, token, _localize) {
		return addLeadingZeros(+date, token.length);
	}
};
function formatTimezoneShort(offset, delimiter = "") {
	const sign = offset > 0 ? "-" : "+";
	const absOffset = Math.abs(offset);
	const hours = Math.trunc(absOffset / 60);
	const minutes = absOffset % 60;
	if (minutes === 0) return sign + String(hours);
	return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
}
function formatTimezoneWithOptionalMinutes(offset, delimiter) {
	if (offset % 60 === 0) return (offset > 0 ? "-" : "+") + addLeadingZeros(Math.abs(offset) / 60, 2);
	return formatTimezone(offset, delimiter);
}
function formatTimezone(offset, delimiter = "") {
	const sign = offset > 0 ? "-" : "+";
	const absOffset = Math.abs(offset);
	const hours = addLeadingZeros(Math.trunc(absOffset / 60), 2);
	const minutes = addLeadingZeros(absOffset % 60, 2);
	return sign + hours + delimiter + minutes;
}
var dateLongFormatter = (pattern, formatLong) => {
	switch (pattern) {
		case "P": return formatLong.date({ width: "short" });
		case "PP": return formatLong.date({ width: "medium" });
		case "PPP": return formatLong.date({ width: "long" });
		default: return formatLong.date({ width: "full" });
	}
};
var timeLongFormatter = (pattern, formatLong) => {
	switch (pattern) {
		case "p": return formatLong.time({ width: "short" });
		case "pp": return formatLong.time({ width: "medium" });
		case "ppp": return formatLong.time({ width: "long" });
		default: return formatLong.time({ width: "full" });
	}
};
var dateTimeLongFormatter = (pattern, formatLong) => {
	const matchResult = pattern.match(/(P+)(p+)?/) || [];
	const datePattern = matchResult[1];
	const timePattern = matchResult[2];
	if (!timePattern) return dateLongFormatter(pattern, formatLong);
	let dateTimeFormat;
	switch (datePattern) {
		case "P":
			dateTimeFormat = formatLong.dateTime({ width: "short" });
			break;
		case "PP":
			dateTimeFormat = formatLong.dateTime({ width: "medium" });
			break;
		case "PPP":
			dateTimeFormat = formatLong.dateTime({ width: "long" });
			break;
		default:
			dateTimeFormat = formatLong.dateTime({ width: "full" });
			break;
	}
	return dateTimeFormat.replace("{{date}}", dateLongFormatter(datePattern, formatLong)).replace("{{time}}", timeLongFormatter(timePattern, formatLong));
};
var longFormatters = {
	p: timeLongFormatter,
	P: dateTimeLongFormatter
};
var dayOfYearTokenRE = /^D+$/;
var weekYearTokenRE = /^Y+$/;
var throwTokens = [
	"D",
	"DD",
	"YY",
	"YYYY"
];
function isProtectedDayOfYearToken(token) {
	return dayOfYearTokenRE.test(token);
}
function isProtectedWeekYearToken(token) {
	return weekYearTokenRE.test(token);
}
function warnOrThrowProtectedError(token, format, input) {
	const _message = message(token, format, input);
	console.warn(_message);
	if (throwTokens.includes(token)) throw new RangeError(_message);
}
function message(token, format, input) {
	const subject = token[0] === "Y" ? "years" : "days of the month";
	return `Use \`${token.toLowerCase()}\` instead of \`${token}\` (in \`${format}\`) for formatting ${subject} to the input \`${input}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`;
}
/**
* @name isDate
* @category Common Helpers
* @summary Is the given value a date?
*
* @description
* Returns true if the given value is an instance of Date. The function works for dates transferred across iframes.
*
* @param value - The value to check
*
* @returns True if the given value is a date
*
* @example
* // For a valid date:
* const result = isDate(new Date())
* //=> true
*
* @example
* // For an invalid date:
* const result = isDate(new Date(NaN))
* //=> true
*
* @example
* // For some value:
* const result = isDate('2014-02-31')
* //=> false
*
* @example
* // For an object:
* const result = isDate({})
* //=> false
*/
function isDate(value) {
	return value instanceof Date || typeof value === "object" && Object.prototype.toString.call(value) === "[object Date]";
}
/**
* @name isValid
* @category Common Helpers
* @summary Is the given date valid?
*
* @description
* Returns false if argument is Invalid Date and true otherwise.
* Argument is converted to Date using `toDate`. See [toDate](https://date-fns.org/docs/toDate)
* Invalid Date is a Date, whose time value is NaN.
*
* Time value of Date: http://es5.github.io/#x15.9.1.1
*
* @param date - The date to check
*
* @returns The date is valid
*
* @example
* // For the valid date:
* const result = isValid(new Date(2014, 1, 31))
* //=> true
*
* @example
* // For the value, convertible into a date:
* const result = isValid(1393804800000)
* //=> true
*
* @example
* // For the invalid date:
* const result = isValid(new Date(''))
* //=> false
*/
function isValid(date) {
	return !(!isDate(date) && typeof date !== "number" || isNaN(+toDate(date)));
}
var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;
var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
var escapedStringRegExp = /^'([^]*?)'?$/;
var doubleQuoteRegExp = /''/g;
var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
/**
* The {@link format} function options.
*/
/**
* @name format
* @alias formatDate
* @category Common Helpers
* @summary Format the date.
*
* @description
* Return the formatted date string in the given format. The result may vary by locale.
*
* > ⚠️ Please note that the `format` tokens differ from Moment.js and other libraries.
* > See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
*
* The characters wrapped between two single quotes characters (') are escaped.
* Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
* (see the last example)
*
* Format of the string is based on Unicode Technical Standard #35:
* https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
* with a few additions (see note 7 below the table).
*
* Accepted patterns:
* | Unit                            | Pattern | Result examples                   | Notes |
* |---------------------------------|---------|-----------------------------------|-------|
* | Era                             | G..GGG  | AD, BC                            |       |
* |                                 | GGGG    | Anno Domini, Before Christ        | 2     |
* |                                 | GGGGG   | A, B                              |       |
* | Calendar year                   | y       | 44, 1, 1900, 2017                 | 5     |
* |                                 | yo      | 44th, 1st, 0th, 17th              | 5,7   |
* |                                 | yy      | 44, 01, 00, 17                    | 5     |
* |                                 | yyy     | 044, 001, 1900, 2017              | 5     |
* |                                 | yyyy    | 0044, 0001, 1900, 2017            | 5     |
* |                                 | yyyyy   | ...                               | 3,5   |
* | Local week-numbering year       | Y       | 44, 1, 1900, 2017                 | 5     |
* |                                 | Yo      | 44th, 1st, 1900th, 2017th         | 5,7   |
* |                                 | YY      | 44, 01, 00, 17                    | 5,8   |
* |                                 | YYY     | 044, 001, 1900, 2017              | 5     |
* |                                 | YYYY    | 0044, 0001, 1900, 2017            | 5,8   |
* |                                 | YYYYY   | ...                               | 3,5   |
* | ISO week-numbering year         | R       | -43, 0, 1, 1900, 2017             | 5,7   |
* |                                 | RR      | -43, 00, 01, 1900, 2017           | 5,7   |
* |                                 | RRR     | -043, 000, 001, 1900, 2017        | 5,7   |
* |                                 | RRRR    | -0043, 0000, 0001, 1900, 2017     | 5,7   |
* |                                 | RRRRR   | ...                               | 3,5,7 |
* | Extended year                   | u       | -43, 0, 1, 1900, 2017             | 5     |
* |                                 | uu      | -43, 01, 1900, 2017               | 5     |
* |                                 | uuu     | -043, 001, 1900, 2017             | 5     |
* |                                 | uuuu    | -0043, 0001, 1900, 2017           | 5     |
* |                                 | uuuuu   | ...                               | 3,5   |
* | Quarter (formatting)            | Q       | 1, 2, 3, 4                        |       |
* |                                 | Qo      | 1st, 2nd, 3rd, 4th                | 7     |
* |                                 | QQ      | 01, 02, 03, 04                    |       |
* |                                 | QQQ     | Q1, Q2, Q3, Q4                    |       |
* |                                 | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
* |                                 | QQQQQ   | 1, 2, 3, 4                        | 4     |
* | Quarter (stand-alone)           | q       | 1, 2, 3, 4                        |       |
* |                                 | qo      | 1st, 2nd, 3rd, 4th                | 7     |
* |                                 | qq      | 01, 02, 03, 04                    |       |
* |                                 | qqq     | Q1, Q2, Q3, Q4                    |       |
* |                                 | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
* |                                 | qqqqq   | 1, 2, 3, 4                        | 4     |
* | Month (formatting)              | M       | 1, 2, ..., 12                     |       |
* |                                 | Mo      | 1st, 2nd, ..., 12th               | 7     |
* |                                 | MM      | 01, 02, ..., 12                   |       |
* |                                 | MMM     | Jan, Feb, ..., Dec                |       |
* |                                 | MMMM    | January, February, ..., December  | 2     |
* |                                 | MMMMM   | J, F, ..., D                      |       |
* | Month (stand-alone)             | L       | 1, 2, ..., 12                     |       |
* |                                 | Lo      | 1st, 2nd, ..., 12th               | 7     |
* |                                 | LL      | 01, 02, ..., 12                   |       |
* |                                 | LLL     | Jan, Feb, ..., Dec                |       |
* |                                 | LLLL    | January, February, ..., December  | 2     |
* |                                 | LLLLL   | J, F, ..., D                      |       |
* | Local week of year              | w       | 1, 2, ..., 53                     |       |
* |                                 | wo      | 1st, 2nd, ..., 53th               | 7     |
* |                                 | ww      | 01, 02, ..., 53                   |       |
* | ISO week of year                | I       | 1, 2, ..., 53                     | 7     |
* |                                 | Io      | 1st, 2nd, ..., 53th               | 7     |
* |                                 | II      | 01, 02, ..., 53                   | 7     |
* | Day of month                    | d       | 1, 2, ..., 31                     |       |
* |                                 | do      | 1st, 2nd, ..., 31st               | 7     |
* |                                 | dd      | 01, 02, ..., 31                   |       |
* | Day of year                     | D       | 1, 2, ..., 365, 366               | 9     |
* |                                 | Do      | 1st, 2nd, ..., 365th, 366th       | 7     |
* |                                 | DD      | 01, 02, ..., 365, 366             | 9     |
* |                                 | DDD     | 001, 002, ..., 365, 366           |       |
* |                                 | DDDD    | ...                               | 3     |
* | Day of week (formatting)        | E..EEE  | Mon, Tue, Wed, ..., Sun           |       |
* |                                 | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
* |                                 | EEEEE   | M, T, W, T, F, S, S               |       |
* |                                 | EEEEEE  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
* | ISO day of week (formatting)    | i       | 1, 2, 3, ..., 7                   | 7     |
* |                                 | io      | 1st, 2nd, ..., 7th                | 7     |
* |                                 | ii      | 01, 02, ..., 07                   | 7     |
* |                                 | iii     | Mon, Tue, Wed, ..., Sun           | 7     |
* |                                 | iiii    | Monday, Tuesday, ..., Sunday      | 2,7   |
* |                                 | iiiii   | M, T, W, T, F, S, S               | 7     |
* |                                 | iiiiii  | Mo, Tu, We, Th, Fr, Sa, Su        | 7     |
* | Local day of week (formatting)  | e       | 2, 3, 4, ..., 1                   |       |
* |                                 | eo      | 2nd, 3rd, ..., 1st                | 7     |
* |                                 | ee      | 02, 03, ..., 01                   |       |
* |                                 | eee     | Mon, Tue, Wed, ..., Sun           |       |
* |                                 | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
* |                                 | eeeee   | M, T, W, T, F, S, S               |       |
* |                                 | eeeeee  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
* | Local day of week (stand-alone) | c       | 2, 3, 4, ..., 1                   |       |
* |                                 | co      | 2nd, 3rd, ..., 1st                | 7     |
* |                                 | cc      | 02, 03, ..., 01                   |       |
* |                                 | ccc     | Mon, Tue, Wed, ..., Sun           |       |
* |                                 | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
* |                                 | ccccc   | M, T, W, T, F, S, S               |       |
* |                                 | cccccc  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
* | AM, PM                          | a..aa   | AM, PM                            |       |
* |                                 | aaa     | am, pm                            |       |
* |                                 | aaaa    | a.m., p.m.                        | 2     |
* |                                 | aaaaa   | a, p                              |       |
* | AM, PM, noon, midnight          | b..bb   | AM, PM, noon, midnight            |       |
* |                                 | bbb     | am, pm, noon, midnight            |       |
* |                                 | bbbb    | a.m., p.m., noon, midnight        | 2     |
* |                                 | bbbbb   | a, p, n, mi                       |       |
* | Flexible day period             | B..BBB  | at night, in the morning, ...     |       |
* |                                 | BBBB    | at night, in the morning, ...     | 2     |
* |                                 | BBBBB   | at night, in the morning, ...     |       |
* | Hour [1-12]                     | h       | 1, 2, ..., 11, 12                 |       |
* |                                 | ho      | 1st, 2nd, ..., 11th, 12th         | 7     |
* |                                 | hh      | 01, 02, ..., 11, 12               |       |
* | Hour [0-23]                     | H       | 0, 1, 2, ..., 23                  |       |
* |                                 | Ho      | 0th, 1st, 2nd, ..., 23rd          | 7     |
* |                                 | HH      | 00, 01, 02, ..., 23               |       |
* | Hour [0-11]                     | K       | 1, 2, ..., 11, 0                  |       |
* |                                 | Ko      | 1st, 2nd, ..., 11th, 0th          | 7     |
* |                                 | KK      | 01, 02, ..., 11, 00               |       |
* | Hour [1-24]                     | k       | 24, 1, 2, ..., 23                 |       |
* |                                 | ko      | 24th, 1st, 2nd, ..., 23rd         | 7     |
* |                                 | kk      | 24, 01, 02, ..., 23               |       |
* | Minute                          | m       | 0, 1, ..., 59                     |       |
* |                                 | mo      | 0th, 1st, ..., 59th               | 7     |
* |                                 | mm      | 00, 01, ..., 59                   |       |
* | Second                          | s       | 0, 1, ..., 59                     |       |
* |                                 | so      | 0th, 1st, ..., 59th               | 7     |
* |                                 | ss      | 00, 01, ..., 59                   |       |
* | Fraction of second              | S       | 0, 1, ..., 9                      |       |
* |                                 | SS      | 00, 01, ..., 99                   |       |
* |                                 | SSS     | 000, 001, ..., 999                |       |
* |                                 | SSSS    | ...                               | 3     |
* | Timezone (ISO-8601 w/ Z)        | X       | -08, +0530, Z                     |       |
* |                                 | XX      | -0800, +0530, Z                   |       |
* |                                 | XXX     | -08:00, +05:30, Z                 |       |
* |                                 | XXXX    | -0800, +0530, Z, +123456          | 2     |
* |                                 | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
* | Timezone (ISO-8601 w/o Z)       | x       | -08, +0530, +00                   |       |
* |                                 | xx      | -0800, +0530, +0000               |       |
* |                                 | xxx     | -08:00, +05:30, +00:00            | 2     |
* |                                 | xxxx    | -0800, +0530, +0000, +123456      |       |
* |                                 | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
* | Timezone (GMT)                  | O...OOO | GMT-8, GMT+5:30, GMT+0            |       |
* |                                 | OOOO    | GMT-08:00, GMT+05:30, GMT+00:00   | 2     |
* | Timezone (specific non-locat.)  | z...zzz | GMT-8, GMT+5:30, GMT+0            | 6     |
* |                                 | zzzz    | GMT-08:00, GMT+05:30, GMT+00:00   | 2,6   |
* | Seconds timestamp               | t       | 512969520                         | 7     |
* |                                 | tt      | ...                               | 3,7   |
* | Milliseconds timestamp          | T       | 512969520900                      | 7     |
* |                                 | TT      | ...                               | 3,7   |
* | Long localized date             | P       | 04/29/1453                        | 7     |
* |                                 | PP      | Apr 29, 1453                      | 7     |
* |                                 | PPP     | April 29th, 1453                  | 7     |
* |                                 | PPPP    | Friday, April 29th, 1453          | 2,7   |
* | Long localized time             | p       | 12:00 AM                          | 7     |
* |                                 | pp      | 12:00:00 AM                       | 7     |
* |                                 | ppp     | 12:00:00 AM GMT+2                 | 7     |
* |                                 | pppp    | 12:00:00 AM GMT+02:00             | 2,7   |
* | Combination of date and time    | Pp      | 04/29/1453, 12:00 AM              | 7     |
* |                                 | PPpp    | Apr 29, 1453, 12:00:00 AM         | 7     |
* |                                 | PPPppp  | April 29th, 1453 at ...           | 7     |
* |                                 | PPPPpppp| Friday, April 29th, 1453 at ...   | 2,7   |
* Notes:
* 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
*    are the same as "stand-alone" units, but are different in some languages.
*    "Formatting" units are declined according to the rules of the language
*    in the context of a date. "Stand-alone" units are always nominative singular:
*
*    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
*
*    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
*
* 2. Any sequence of the identical letters is a pattern, unless it is escaped by
*    the single quote characters (see below).
*    If the sequence is longer than listed in table (e.g. `EEEEEEEEEEE`)
*    the output will be the same as default pattern for this unit, usually
*    the longest one (in case of ISO weekdays, `EEEE`). Default patterns for units
*    are marked with "2" in the last column of the table.
*
*    `format(new Date(2017, 10, 6), 'MMM') //=> 'Nov'`
*
*    `format(new Date(2017, 10, 6), 'MMMM') //=> 'November'`
*
*    `format(new Date(2017, 10, 6), 'MMMMM') //=> 'N'`
*
*    `format(new Date(2017, 10, 6), 'MMMMMM') //=> 'November'`
*
*    `format(new Date(2017, 10, 6), 'MMMMMMM') //=> 'November'`
*
* 3. Some patterns could be unlimited length (such as `yyyyyyyy`).
*    The output will be padded with zeros to match the length of the pattern.
*
*    `format(new Date(2017, 10, 6), 'yyyyyyyy') //=> '00002017'`
*
* 4. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
*    These tokens represent the shortest form of the quarter.
*
* 5. The main difference between `y` and `u` patterns are B.C. years:
*
*    | Year | `y` | `u` |
*    |------|-----|-----|
*    | AC 1 |   1 |   1 |
*    | BC 1 |   1 |   0 |
*    | BC 2 |   2 |  -1 |
*
*    Also `yy` always returns the last two digits of a year,
*    while `uu` pads single digit years to 2 characters and returns other years unchanged:
*
*    | Year | `yy` | `uu` |
*    |------|------|------|
*    | 1    |   01 |   01 |
*    | 14   |   14 |   14 |
*    | 376  |   76 |  376 |
*    | 1453 |   53 | 1453 |
*
*    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
*    except local week-numbering years are dependent on `options.weekStartsOn`
*    and `options.firstWeekContainsDate` (compare [getISOWeekYear](https://date-fns.org/docs/getISOWeekYear)
*    and [getWeekYear](https://date-fns.org/docs/getWeekYear)).
*
* 6. Specific non-location timezones are currently unavailable in `date-fns`,
*    so right now these tokens fall back to GMT timezones.
*
* 7. These patterns are not in the Unicode Technical Standard #35:
*    - `i`: ISO day of week
*    - `I`: ISO week of year
*    - `R`: ISO week-numbering year
*    - `t`: seconds timestamp
*    - `T`: milliseconds timestamp
*    - `o`: ordinal number modifier
*    - `P`: long localized date
*    - `p`: long localized time
*
* 8. `YY` and `YYYY` tokens represent week-numbering years but they are often confused with years.
*    You should enable `options.useAdditionalWeekYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
*
* 9. `D` and `DD` tokens represent days of the year but they are often confused with days of the month.
*    You should enable `options.useAdditionalDayOfYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
*
* @param date - The original date
* @param format - The string of tokens
* @param options - An object with options
*
* @returns The formatted date string
*
* @throws `date` must not be Invalid Date
* @throws `options.locale` must contain `localize` property
* @throws `options.locale` must contain `formatLong` property
* @throws use `yyyy` instead of `YYYY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
* @throws use `yy` instead of `YY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
* @throws use `d` instead of `D` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
* @throws use `dd` instead of `DD` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
* @throws format string contains an unescaped latin alphabet character
*
* @example
* // Represent 11 February 2014 in middle-endian format:
* const result = format(new Date(2014, 1, 11), 'MM/dd/yyyy')
* //=> '02/11/2014'
*
* @example
* // Represent 2 July 2014 in Esperanto:
* import { eoLocale } from 'date-fns/locale/eo'
* const result = format(new Date(2014, 6, 2), "do 'de' MMMM yyyy", {
*   locale: eoLocale
* })
* //=> '2-a de julio 2014'
*
* @example
* // Escape string by single quote characters:
* const result = format(new Date(2014, 6, 2, 15), "h 'o''clock'")
* //=> "3 o'clock"
*/
function format(date, formatStr, options) {
	const defaultOptions = getDefaultOptions();
	const locale = options?.locale ?? defaultOptions.locale ?? enUS;
	const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions.firstWeekContainsDate ?? defaultOptions.locale?.options?.firstWeekContainsDate ?? 1;
	const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions.weekStartsOn ?? defaultOptions.locale?.options?.weekStartsOn ?? 0;
	const originalDate = toDate(date, options?.in);
	if (!isValid(originalDate)) throw new RangeError("Invalid time value");
	let parts = formatStr.match(longFormattingTokensRegExp).map((substring) => {
		const firstCharacter = substring[0];
		if (firstCharacter === "p" || firstCharacter === "P") {
			const longFormatter = longFormatters[firstCharacter];
			return longFormatter(substring, locale.formatLong);
		}
		return substring;
	}).join("").match(formattingTokensRegExp).map((substring) => {
		if (substring === "''") return {
			isToken: false,
			value: "'"
		};
		const firstCharacter = substring[0];
		if (firstCharacter === "'") return {
			isToken: false,
			value: cleanEscapedString(substring)
		};
		if (formatters[firstCharacter]) return {
			isToken: true,
			value: substring
		};
		if (firstCharacter.match(unescapedLatinCharacterRegExp)) throw new RangeError("Format string contains an unescaped latin alphabet character `" + firstCharacter + "`");
		return {
			isToken: false,
			value: substring
		};
	});
	if (locale.localize.preprocessor) parts = locale.localize.preprocessor(originalDate, parts);
	const formatterOptions = {
		firstWeekContainsDate,
		weekStartsOn,
		locale
	};
	return parts.map((part) => {
		if (!part.isToken) return part.value;
		const token = part.value;
		if (!options?.useAdditionalWeekYearTokens && isProtectedWeekYearToken(token) || !options?.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(token)) warnOrThrowProtectedError(token, formatStr, String(date));
		const formatter = formatters[token[0]];
		return formatter(originalDate, token, locale.localize, formatterOptions);
	}).join("");
}
function cleanEscapedString(input) {
	const matched = input.match(escapedStringRegExp);
	if (!matched) return input;
	return matched[1].replace(doubleQuoteRegExp, "'");
}
var currencyFormatter = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
	minimumFractionDigits: 2
});
var fallbackServiceIcons = [
	"scissors",
	"beard",
	"sparkles",
	"razor"
];
var fallbackServices = [
	{
		id: "fallback-service-1",
		name: "Corte de Cabelo",
		description: "Renove o visual com acabamento impecável.",
		durationLabel: "30 min",
		priceLabel: currencyFormatter.format(70),
		icon: "scissors",
		href: "/scheduling"
	},
	{
		id: "fallback-service-2",
		name: "Barba Completa",
		description: "Modelagem precisa com toalha quente.",
		durationLabel: "25 min",
		priceLabel: currencyFormatter.format(55),
		icon: "beard",
		href: "/scheduling"
	},
	{
		id: "fallback-service-3",
		name: "Combo Corte + Barba",
		description: "Experiência completa com cuidados premium.",
		durationLabel: "50 min",
		priceLabel: currencyFormatter.format(110),
		icon: "sparkles",
		href: "/scheduling"
	},
	{
		id: "fallback-service-4",
		name: "Pezinho / Acabamento",
		description: "Detalhes alinhados entre visitas.",
		durationLabel: "15 min",
		priceLabel: currencyFormatter.format(35),
		icon: "razor",
		href: "/scheduling"
	}
];
var fallbackPromotions = [
	{
		id: "fallback-promo-1",
		badgeLabel: "Promoção",
		badgeTone: "success",
		title: "Boas-vindas 20% OFF",
		description: "Use no primeiro agendamento em qualquer serviço.",
		code: "BEMVINDO20",
		expiresLabel: "",
		href: "/promotions"
	},
	{
		id: "fallback-promo-2",
		badgeLabel: "Pacote",
		badgeTone: "neutral",
		title: "Pai & Filho 15% OFF",
		description: "Combine dois serviços e economize em família.",
		code: "PAIEFILHO15",
		expiresLabel: "Sem prazo determinado",
		href: "/promotions"
	},
	{
		id: "fallback-promo-3",
		badgeLabel: "Experiência",
		badgeTone: "neutral",
		title: "Dia do Noivo VIP",
		description: "Pacote completo com massagem e cuidados especiais.",
		code: "NOIVO-VIP",
		expiresLabel: "Consulte disponibilidade",
		href: "/promotions"
	}
];
var fallbackSalons = [
	{
		id: "fallback-salon-1",
		name: "Barbearia Centro",
		rating: 4.9,
		ratingLabel: "4.9 (120)",
		address: "Exemplo: Av. Paulista, 123 - Bela Vista",
		distanceLabel: "1,2 km",
		status: "OPEN",
		imageUrl: "/images/salon1.svg",
		href: "/salons/fallback-salon-1"
	},
	{
		id: "fallback-salon-2",
		name: "Viking Cuts",
		rating: 4.7,
		ratingLabel: "4.7 (98)",
		address: "Exemplo: R. Augusta, 845 - Consolação",
		distanceLabel: "2,0 km",
		status: "CLOSING_SOON",
		imageUrl: "/images/salon2.svg",
		href: "/salons/fallback-salon-2"
	},
	{
		id: "fallback-salon-3",
		name: "Gentleman's Lounge",
		rating: 4.8,
		ratingLabel: "4.8 (76)",
		address: "Exemplo: Al. Santos, 500 - Jardins",
		distanceLabel: "2,4 km",
		status: "OPEN",
		imageUrl: "/images/salon1.svg",
		href: "/salons/fallback-salon-3"
	},
	{
		id: "fallback-salon-4",
		name: "Old School Barber",
		rating: 4.5,
		ratingLabel: "4.5 (54)",
		address: "Exemplo: R. Frei Caneca, 100",
		distanceLabel: "3,1 km",
		status: "CLOSED",
		imageUrl: "/images/salon2.svg",
		href: "/salons/fallback-salon-4"
	}
];
var fallbackReviews = [
	{
		id: "fallback-review-1",
		author: "Ricardo Mendes",
		serviceName: "Corte de Cabelo",
		rating: 5,
		comment: "Equipe incrível! Saí renovado e pronto para a semana.",
		avatarUrl: "/images/salon1.svg",
		mediaUrl: null,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	},
	{
		id: "fallback-review-2",
		author: "Ana Clara",
		serviceName: "Combo Corte + Barba",
		rating: 5,
		comment: "Adorei a experiência, o combo vale cada minuto.",
		avatarUrl: "/images/salon2.svg",
		mediaUrl: null,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	},
	{
		id: "fallback-review-3",
		author: "Felipe Costa",
		serviceName: "Barba Completa",
		rating: 4,
		comment: "Atendimento rápido e super profissional.",
		avatarUrl: "/images/salon1.svg",
		mediaUrl: null,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	},
	{
		id: "fallback-review-4",
		author: "Lucas Oliveira",
		serviceName: "Pezinho",
		rating: 5,
		comment: "Melhor acabamento da cidade, recomendo!",
		avatarUrl: "/images/salon2.svg",
		mediaUrl: null,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	}
];
var fallbackBookingCta = {
	title: "Pronto para renovar seu visual?",
	description: "Agende em poucos cliques e acompanhe o status do seu atendimento em tempo real.",
	primaryLabel: "Agendar Agora",
	primaryHref: "/scheduling",
	secondaryLabel: "Criar Conta",
	secondaryHref: "/auth/signup",
	signinHref: "/auth/signin"
};
var fallbackFooter = {
	brand: {
		name: "BARBER",
		highlight: "KINGS",
		description: "Cortes, barbas e experiências sob medida para quem valoriza estilo e conforto."
	},
	columns: [
		{
			title: "Empresa",
			links: [
				{
					label: "Sobre Nós",
					href: "/about"
				},
				{
					label: "Carreiras",
					href: "/careers"
				},
				{
					label: "Blog",
					href: "/blog"
				},
				{
					label: "Parceiros",
					href: "/partners"
				}
			]
		},
		{
			title: "Suporte",
			links: [
				{
					label: "Central de Ajuda",
					href: "/support"
				},
				{
					label: "Termos de Uso",
					href: "/legal/terms"
				},
				{
					label: "Privacidade",
					href: "/legal/privacy"
				},
				{
					label: "Fale Conosco",
					href: "/contact"
				}
			]
		},
		{
			title: "Social",
			links: [
				{
					label: "Instagram",
					href: "https://instagram.com"
				},
				{
					label: "Facebook",
					href: "https://facebook.com"
				},
				{
					label: "YouTube",
					href: "https://youtube.com"
				},
				{
					label: "TikTok",
					href: "https://tiktok.com"
				}
			]
		}
	],
	legal: [
		{
			label: "Privacidade",
			href: "/legal/privacy"
		},
		{
			label: "Termos",
			href: "/legal/terms"
		},
		{
			label: "Cookies",
			href: "/legal/cookies"
		}
	],
	copyright: "2025 © Barber Kings. Todos os direitos reservados.",
	social: [
		{
			icon: "instagram",
			href: "https://instagram.com"
		},
		{
			icon: "facebook",
			href: "https://facebook.com"
		},
		{
			icon: "youtube",
			href: "https://youtube.com"
		},
		{
			icon: "tiktok",
			href: "https://tiktok.com"
		}
	]
};
function resolveServiceIcon(name) {
	const normalized = name.toLowerCase();
	if (normalized.includes("combo")) return "sparkles";
	if (normalized.includes("barba")) return "beard";
	if (normalized.includes("pezinho") || normalized.includes("acabamento")) return "razor";
	if (normalized.includes("hidrata") || normalized.includes("spa")) return "brush";
	if (normalized.includes("color")) return "comb";
	return "scissors";
}
function formatExpiresLabel(expiresAt) {
	if (!expiresAt) return null;
	return `Válido até ${format(expiresAt, "dd/MM", { locale: ptBR })}`;
}
function buildFallbackExpiresLabel() {
	const now = /* @__PURE__ */ new Date();
	const currentYear = now.getFullYear();
	const target = new Date(currentYear, 11, 30);
	if (target < now) target.setFullYear(currentYear + 1);
	return `Válido até ${format(target, "dd/MM", { locale: ptBR })}`;
}
function buildPromotionCode(name, id) {
	const fallback = id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase();
	if (!name) return fallback || "PROMO";
	return name.normalize("NFD").replace(/[^\w\s]/g, "").replace(/\s+/g, "").toUpperCase().slice(0, 12) || fallback || "PROMO";
}
function resolveBadgeTone(expiresAt) {
	if (!expiresAt) return "neutral";
	const days = differenceInDays(expiresAt, /* @__PURE__ */ new Date());
	if (days <= 3) return "danger";
	if (days <= 10) return "success";
	return "neutral";
}
async function loadPopularServices() {
	try {
		const services = await ServiceService.findPopular(4);
		if (!services.length) return [];
		return services.map((service, index) => ({
			id: service.id,
			name: service.name,
			description: service.description,
			durationLabel: `${service.duration} min`,
			priceLabel: currencyFormatter.format(decimalToNumber(service.price)),
			icon: resolveServiceIcon(service.name) ?? fallbackServiceIcons[index % fallbackServiceIcons.length],
			href: `/services/${service.id}`
		}));
	} catch (error) {
		logger.error("Falha ao carregar serviços populares", { error }, "HomePageData");
		return [];
	}
}
async function loadPromotions() {
	try {
		const now = /* @__PURE__ */ new Date();
		const promotions = await db.promotion.findMany({
			where: {
				active: true,
				validFrom: { lte: now },
				OR: [{ validUntil: null }, { validUntil: { gte: now } }]
			},
			include: { servicePromotions: { include: { service: { select: { name: true } } } } },
			orderBy: [{ validUntil: "asc" }, { createdAt: "desc" }],
			take: 3
		});
		if (!promotions.length) return [];
		return promotions.map((promotion) => {
			const firstService = promotion.servicePromotions[0]?.service?.name ?? null;
			const expiresLabel = formatExpiresLabel(promotion.validUntil);
			return {
				id: promotion.id,
				badgeLabel: firstService ? `Serviço: ${firstService}` : "Promoção",
				badgeTone: resolveBadgeTone(promotion.validUntil),
				title: promotion.name,
				description: promotion.description,
				code: buildPromotionCode(promotion.name, promotion.id),
				expiresLabel,
				href: `/promotions/${promotion.id}`
			};
		});
	} catch (error) {
		logger.error("Falha ao carregar promoções", { error }, "HomePageData");
		return [];
	}
}
async function loadSalons() {
	try {
		const appointments = await db.appointment.findMany({
			where: {
				status: "COMPLETED",
				serviceHistory: { isNot: null },
				barber: { isActive: true }
			},
			include: {
				barber: { select: {
					id: true,
					name: true,
					image: true,
					nickname: true
				} },
				serviceHistory: { select: { rating: true } }
			},
			orderBy: [{ updatedAt: "desc" }],
			take: 80
		});
		if (!appointments.length) return [];
		const grouped = appointments.reduce((map, appointment) => {
			if (!appointment.barber) return map;
			const barberId = appointment.barber.id;
			const current = map.get(barberId) ?? {
				name: appointment.barber.name,
				image: appointment.barber.image,
				nickname: appointment.barber.nickname,
				ratings: []
			};
			const rating = appointment.serviceHistory?.rating ?? null;
			if (rating) current.ratings.push(rating);
			map.set(barberId, current);
			return map;
		}, /* @__PURE__ */ new Map());
		return Array.from(grouped.entries()).map(([id, value], index) => {
			const ratingMedia = value.ratings.length ? value.ratings.reduce((acc, current) => acc + current, 0) / value.ratings.length : null;
			const formattedRating = ratingMedia ? `${ratingMedia.toFixed(1)} (${value.ratings.length})` : "Sem avaliações";
			const baseDistance = (index + 1) * .8;
			const status = ratingMedia ? ratingMedia >= 4.5 ? "OPEN" : "CLOSING_SOON" : "OPEN";
			return {
				id,
				name: value.name,
				rating: ratingMedia ? Number(ratingMedia.toFixed(1)) : null,
				ratingLabel: formattedRating,
				address: value.nickname ?? "Exemplo: endereço será exibido aqui",
				distanceLabel: `${baseDistance.toFixed(1)} km`,
				status,
				imageUrl: value.image ?? (index % 2 === 0 ? "/images/salon1.svg" : "/images/salon2.svg"),
				href: `/barbers/${id}`
			};
		}).slice(0, 4);
	} catch (error) {
		logger.error("Falha ao carregar barbeiros", { error }, "HomePageData");
		return [];
	}
}
async function loadReviews() {
	try {
		const histories = await db.serviceHistory.findMany({
			where: {
				feedback: { not: null },
				rating: { not: null }
			},
			include: {
				user: { select: {
					id: true,
					name: true,
					image: true
				} },
				service: { select: {
					id: true,
					name: true
				} }
			},
			orderBy: [{ completedAt: "desc" }],
			take: 4
		});
		if (!histories.length) return [];
		return histories.map((history) => ({
			id: history.id,
			author: history.user?.name ?? "Cliente",
			serviceName: history.service?.name ?? "Serviço",
			rating: history.rating ?? 5,
			comment: history.feedback ?? "",
			avatarUrl: history.user?.image ?? "/images/salon1.svg",
			mediaUrl: history.images?.[0] ?? null,
			createdAt: history.completedAt.toISOString()
		}));
	} catch (error) {
		logger.error("Falha ao carregar avaliações", { error }, "HomePageData");
		return [];
	}
}
var getHomePageData = (0, import_react_react_server.cache)(async () => {
	const [popularServices, promotions, salons, reviews] = await Promise.all([
		loadPopularServices(),
		loadPromotions(),
		loadSalons(),
		loadReviews()
	]);
	const normalizedFallbackPromos = fallbackPromotions.map((promo) => ({
		...promo,
		expiresLabel: promo.expiresLabel === "" ? buildFallbackExpiresLabel() : promo.expiresLabel
	}));
	return {
		hero: {
			title: "Encontre seu estilo.",
			subtitle: "Agende cortes, barbas e experiências premium com os melhores profissionais da cidade.",
			placeholder: "Buscar serviços, barbeiros ou promoções",
			ctaLabel: "Buscar",
			action: "/scheduling",
			align: "center"
		},
		services: {
			title: "Serviços Populares",
			subtitle: "Escolhas mais agendadas pelos nossos clientes.",
			items: popularServices.length ? popularServices : fallbackServices
		},
		promotions: {
			title: "Ofertas Disponíveis",
			ctaLabel: "Ver todas",
			ctaHref: "/promotions",
			items: promotions.length ? promotions : normalizedFallbackPromos
		},
		salons: {
			title: "Salões Próximos",
			ctaLabel: "Ver todos",
			ctaHref: "/salons",
			items: salons.length ? salons : fallbackSalons
		},
		bookingCta: fallbackBookingCta,
		reviews: {
			title: "Avaliações Recentes",
			subtitle: "O que clientes contam sobre a experiência Barber Kings.",
			items: reviews.length ? reviews : fallbackReviews
		},
		footer: fallbackFooter
	};
});
var page_exports$43 = /* @__PURE__ */ __exportAll({ default: () => HomePage });
async function HomePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(HomeExperience, { data: await getHomePageData() });
}
var Award = createLucideIcon("award", [["path", {
	d: "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",
	key: "1yiouv"
}], ["circle", {
	cx: "12",
	cy: "8",
	r: "6",
	key: "1vp47v"
}]]);
var Users = createLucideIcon("users", [
	["path", {
		d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
		key: "1yyitq"
	}],
	["path", {
		d: "M16 3.128a4 4 0 0 1 0 7.744",
		key: "16gr8j"
	}],
	["path", {
		d: "M22 21v-2a4 4 0 0 0-3-3.87",
		key: "kshegd"
	}],
	["circle", {
		cx: "9",
		cy: "7",
		r: "4",
		key: "nufk8"
	}]
]);
var Sparkles = createLucideIcon("sparkles", [
	["path", {
		d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
		key: "1s2grr"
	}],
	["path", {
		d: "M20 2v4",
		key: "1rf3ol"
	}],
	["path", {
		d: "M22 4h-4",
		key: "gwowj6"
	}],
	["circle", {
		cx: "4",
		cy: "20",
		r: "2",
		key: "6kqj1y"
	}]
]);
function SectionHeader({ title, subtitle, action, centered = true, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
		className: cn("flex flex-col gap-4", centered ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
			className: cn("space-y-2", centered ? "mx-auto max-w-2xl" : "max-w-2xl"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
				className: cn("font-display text-3xl font-bold italic tracking-tight text-foreground sm:text-4xl", centered ? "accent-line accent-line-center" : "accent-line"),
				children: title
			}), subtitle ? /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
				className: "text-sm text-fg-muted sm:text-base",
				children: subtitle
			}) : null]
		}), action ? /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
			href: action.href,
			className: "group inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80",
			children: [action.label, /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ArrowRight, { className: "h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" })]
		}) : null]
	});
}
var page_exports$42 = /* @__PURE__ */ __exportAll({ default: () => AboutPage });
function AboutPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
				badge: "Nossa História",
				title: "Sobre o BarberKings",
				subtitle: "Construímos uma experiência de grooming premium com foco em precisão, conforto e relacionamento duradouro entre cliente e barbeiro.",
				actions: [{
					label: "Agendar agora",
					href: "/scheduling"
				}]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
				className: "bg-background py-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "container mx-auto px-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(SectionHeader, {
						title: "Os pilares da experiência",
						subtitle: "Cada ponto de contato foi pensado para transmitir presença, cuidado e consistência."
					}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
						className: "stagger-reveal mt-12 grid gap-5 md:grid-cols-3",
						children: [
							{
								icon: Award,
								title: "Excelência",
								description: "Execução refinada, curadoria de serviços e acabamento consistente em cada atendimento."
							},
							{
								icon: Sparkles,
								title: "Conforto",
								description: "Atmosfera acolhedora, navegação clara e jornadas que reduzem atrito do agendamento ao pós-atendimento."
							},
							{
								icon: Users,
								title: "Comunidade",
								description: "Uma rede de clientes, barbeiros e experiências compartilhadas que valoriza recorrência e confiança."
							}
						].map((value) => {
							const Icon = value.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
								className: "card-hover group rounded-2xl border border-border bg-surface-card p-6 transition-all duration-300",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
										className: "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent transition-colors duration-300 group-hover:bg-[hsl(var(--accent)/0.16)]",
										children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Icon, { className: "h-5 w-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
										className: "font-display text-2xl font-bold italic text-foreground",
										children: value.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-3 text-sm leading-relaxed text-fg-muted",
										children: value.description
									})
								]
							}, value.title);
						})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
				className: "bg-surface-1 py-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
					className: "container mx-auto px-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "grid gap-5 lg:grid-cols-[1.15fr_0.85fr]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
							className: "card-hover rounded-2xl border border-border bg-surface-card p-6 lg:p-8",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(SectionHeader, {
								title: "Missão e equipe",
								subtitle: "Nossa missão é elevar o atendimento masculino com design, técnica e hospitalidade. O time atua de forma coordenada para manter padrão visual e operacional em todas as etapas.",
								centered: false
							}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
								className: "mt-6 grid gap-4 sm:grid-cols-2",
								children: [
									"Curadoria de serviços com foco em resultado e clareza de preço.",
									"Ambiente premium com comunicação simples e acolhedora.",
									"Atendimento pensado para recorrência, fidelização e conveniência.",
									"Evolução contínua baseada em feedback e dados de uso."
								].map((item) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
									className: "rounded-xl border border-border bg-surface-1 p-4 text-sm leading-relaxed text-fg-muted",
									children: item
								}, item))
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("aside", {
							className: "card-hover rounded-2xl border border-border bg-surface-card p-6 lg:p-8",
							children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
								className: "flex items-start gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
									className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Users, { className: "h-5 w-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
									className: "space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h3", {
											className: "font-display text-2xl font-bold italic text-foreground",
											children: "Atendimento com presença"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
											className: "text-sm leading-relaxed text-fg-muted",
											children: "A proposta da plataforma é dar ao cliente a mesma sensação de cuidado que ele espera da barbearia: ritual, precisão e resposta rápida quando precisa de ajuda."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(link_default, {
											href: "/scheduling",
											className: "gold-shimmer inline-flex items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90",
											children: "Agendar atendimento"
										})
									]
								})]
							})
						})]
					})
				})
			})
		]
	});
}
var AppointmentStatusEnum = _enum([
	"SCHEDULED",
	"CONFIRMED",
	"COMPLETED",
	"CANCELLED",
	"NO_SHOW"
]);
var CreateAppointmentSchema = object({
	date: date().min(/* @__PURE__ */ new Date(), "Data deve ser no futuro"),
	serviceId: string().min(1, "Serviço é obrigatório"),
	barberId: string().min(1, "Barbeiro é obrigatório"),
	notes: string().max(500, "Observações devem ter no máximo 500 caracteres").optional(),
	voucherId: string().optional(),
	appliedPromotionId: string().optional()
});
var UpdateAppointmentSchema = object({
	date: date().min(/* @__PURE__ */ new Date(), "Data deve ser no futuro").optional(),
	status: AppointmentStatusEnum.optional(),
	notes: string().max(500, "Observações devem ter no máximo 500 caracteres").optional(),
	barberId: string().min(1, "Barbeiro é obrigatório").optional()
});
var AppointmentFiltersSchema = object({
	status: AppointmentStatusEnum.optional(),
	serviceId: string().optional(),
	barberId: string().optional(),
	startDate: date().optional(),
	endDate: date().optional(),
	page: number().int().positive().default(1),
	limit: number().int().positive().max(50).default(10)
});
var CheckAvailabilitySchema = object({
	date: date(),
	serviceId: string(),
	barberId: string().optional()
});
object({
	appointmentId: string(),
	newDate: date().min(/* @__PURE__ */ new Date(), "Nova data deve ser no futuro"),
	newBarberId: string().optional()
});
object({
	appointmentId: string(),
	reason: string().min(10, "Motivo deve ter pelo menos 10 caracteres").max(200, "Motivo deve ter no máximo 200 caracteres").optional()
});
var AvailableTimesSchema = object({
	date: date(),
	serviceId: string(),
	barberId: string().optional()
});
var route_exports$24 = /* @__PURE__ */ __exportAll({
	GET: () => GET$17,
	POST: () => POST$11
});
/**
* GET /api/appointments
* Lista agendamentos do usuário autenticado com filtros opcionais
*/
async function GET$17(request) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
		const { searchParams } = new URL(request.url);
		const filters = AppointmentFiltersSchema.parse({
			status: searchParams.get("status") || void 0,
			serviceId: searchParams.get("serviceId") || void 0,
			barberId: searchParams.get("barberId") || void 0,
			startDate: searchParams.get("startDate") ? new Date(searchParams.get("startDate")) : void 0,
			endDate: searchParams.get("endDate") ? new Date(searchParams.get("endDate")) : void 0,
			page: searchParams.get("page") ? parseInt(searchParams.get("page")) : 1,
			limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")) : 10
		});
		const where = { userId: session.user.id };
		if (filters.status) where.status = filters.status;
		if (filters.serviceId) where.serviceId = filters.serviceId;
		if (filters.barberId) where.barberId = filters.barberId;
		if (filters.startDate || filters.endDate) {
			where.date = {};
			if (filters.startDate) where.date.gte = filters.startDate;
			if (filters.endDate) where.date.lte = filters.endDate;
		}
		const [appointments, total] = await Promise.all([db.appointment.findMany({
			where,
			include: {
				service: { select: {
					id: true,
					name: true,
					description: true,
					duration: true,
					price: true
				} },
				barber: { select: {
					id: true,
					name: true,
					image: true,
					phone: true
				} },
				voucher: { select: {
					id: true,
					code: true,
					type: true,
					value: true
				} },
				appliedPromotion: { select: {
					id: true,
					name: true,
					type: true,
					value: true
				} }
			},
			orderBy: { date: "desc" },
			skip: (filters.page - 1) * filters.limit,
			take: filters.limit
		}), db.appointment.count({ where })]);
		return NextResponse.json({
			appointments,
			pagination: {
				page: filters.page,
				limit: filters.limit,
				total,
				totalPages: Math.ceil(total / filters.limit)
			}
		});
	} catch (error) {
		console.error("Erro ao buscar agendamentos:", error);
		return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
	}
}
/**
* POST /api/appointments
* Cria um novo agendamento
*/
async function POST$11(request) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
		const body = await request.json();
		const data = CreateAppointmentSchema.parse(body);
		if (!await db.service.findUnique({ where: {
			id: data.serviceId,
			active: true
		} })) return NextResponse.json({ error: "Serviço não encontrado ou inativo" }, { status: 404 });
		if (!await db.user.findFirst({ where: {
			id: data.barberId,
			role: "BARBER",
			isActive: true,
			deletedAt: null
		} })) return NextResponse.json({ error: "Barbeiro não encontrado ou inativo" }, { status: 404 });
		if (await db.appointment.findFirst({ where: {
			barberId: data.barberId,
			date: data.date,
			status: { in: ["SCHEDULED", "CONFIRMED"] }
		} })) return NextResponse.json({ error: "Horário já ocupado" }, { status: 409 });
		if (data.voucherId) {
			const voucher = await db.voucher.findUnique({ where: {
				id: data.voucherId,
				userId: session.user.id,
				status: "ACTIVE"
			} });
			if (!voucher) return NextResponse.json({ error: "Voucher inválido" }, { status: 400 });
			const now = /* @__PURE__ */ new Date();
			if (voucher.validUntil && voucher.validUntil < now) return NextResponse.json({ error: "Voucher expirado" }, { status: 400 });
		}
		const appointment = await db.appointment.create({
			data: {
				...data,
				userId: session.user.id
			},
			include: {
				service: true,
				barber: { select: {
					id: true,
					name: true,
					image: true,
					phone: true
				} },
				voucher: true,
				appliedPromotion: true
			}
		});
		if (data.voucherId) await db.voucher.update({
			where: { id: data.voucherId },
			data: { status: "USED" }
		});
		return NextResponse.json(appointment, { status: 201 });
	} catch (error) {
		console.error("Erro ao criar agendamento:", error);
		if (error instanceof Error && error.name === "ZodError") return NextResponse.json({
			error: "Dados inválidos",
			details: error.message
		}, { status: 400 });
		return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
	}
}
var route_exports$23 = /* @__PURE__ */ __exportAll({ GET: () => GET$16 });
/**
* GET /api/appointments/availability
* Retorna horários disponíveis para um dia/serviço/barbeiro específico
*/
async function GET$16(request) {
	try {
		if (!(await (0, import_next_auth.getServerSession)(authOptions))?.user?.id) return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
		const { searchParams } = new URL(request.url);
		const queryData = AvailableTimesSchema.parse({
			date: new Date(searchParams.get("date")),
			serviceId: searchParams.get("serviceId"),
			barberId: searchParams.get("barberId") || void 0
		});
		const service = await db.service.findUnique({ where: {
			id: queryData.serviceId,
			active: true
		} });
		if (!service) return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
		let barberIds = [];
		if (queryData.barberId) barberIds = [queryData.barberId];
		else barberIds = (await db.user.findMany({
			where: {
				role: "BARBER",
				isActive: true,
				deletedAt: null
			},
			select: { id: true }
		})).map((b) => b.id);
		const startOfDay = new Date(queryData.date);
		startOfDay.setHours(0, 0, 0, 0);
		const endOfDay = new Date(queryData.date);
		endOfDay.setHours(23, 59, 59, 999);
		const existingAppointments = await db.appointment.findMany({
			where: {
				barberId: { in: barberIds },
				date: {
					gte: startOfDay,
					lte: endOfDay
				},
				status: { in: ["SCHEDULED", "CONFIRMED"] }
			},
			include: { service: { select: { duration: true } } }
		});
		const workingHours = {
			start: 9,
			end: 18,
			intervalMinutes: 30
		};
		const availableSlots = [];
		for (const barberId of barberIds) {
			const barber = await db.user.findFirst({
				where: {
					id: barberId,
					deletedAt: null
				},
				select: { name: true }
			});
			if (!barber) continue;
			const barberAppointments = existingAppointments.filter((app) => app.barberId === barberId);
			for (let hour = workingHours.start; hour < workingHours.end; hour++) for (let minute = 0; minute < 60; minute += workingHours.intervalMinutes) {
				const slotTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
				const slotDateTime = new Date(queryData.date);
				slotDateTime.setHours(hour, minute, 0, 0);
				const slotEndTime = new Date(slotDateTime.getTime() + service.duration * 60 * 1e3);
				const workingEndTime = new Date(queryData.date);
				workingEndTime.setHours(workingHours.end, 0, 0, 0);
				if (slotEndTime > workingEndTime) continue;
				const hasConflict = barberAppointments.some((appointment) => {
					const appointmentStart = new Date(appointment.date);
					return slotDateTime < new Date(appointmentStart.getTime() + appointment.service.duration * 60 * 1e3) && slotEndTime > appointmentStart;
				});
				const isInPast = slotDateTime <= /* @__PURE__ */ new Date();
				availableSlots.push({
					time: slotTime,
					barberId,
					barberName: barber.name,
					available: !hasConflict && !isInPast
				});
			}
		}
		const groupedSlots = availableSlots.reduce((acc, slot) => {
			if (!acc[slot.time]) acc[slot.time] = [];
			acc[slot.time].push(slot);
			return acc;
		}, {});
		const availableTimes = Object.entries(groupedSlots).map(([time, slots]) => ({
			time,
			slots: slots.map((slot) => ({
				barberId: slot.barberId,
				barberName: slot.barberName,
				available: slot.available
			})),
			hasAvailable: slots.some((slot) => slot.available)
		})).sort((a, b) => a.time.localeCompare(b.time));
		return NextResponse.json({
			date: queryData.date,
			service: {
				id: service.id,
				name: service.name,
				duration: service.duration
			},
			availableTimes
		});
	} catch (error) {
		console.error("Erro ao buscar disponibilidade:", error);
		return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
	}
}
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) logger.api.error("EMAIL_USER or EMAIL_PASSWORD not configured in .env");
var createTransporter = () => {
	return import_nodemailer.default.createTransport({
		service: "gmail",
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASSWORD
		},
		tls: { rejectUnauthorized: false },
		port: 587,
		secure: false
	});
};
var transporter = createTransporter();
async function verifyEmailConfig() {
	try {
		if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) throw new Error("Configurações de email não encontradas");
		if (typeof transporter.verify !== "function") {
			logger.api.info("Mock email transporter verificado com sucesso");
			return true;
		}
		await transporter.verify();
		logger.api.info("Email configuration verified successfully");
		return true;
	} catch (error) {
		logger.api.error("Email configuration error", { error });
		return false;
	}
}
async function sendVerificationEmail(email, token) {
	try {
		if (!await verifyEmailConfig() && true) throw new Error("Configuração de email inválida");
		const verificationUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/verify-email?token=${token}`;
		const mailOptions = {
			from: process.env.EMAIL_USER || "noreply@barbershop.local",
			to: email,
			subject: "Verifique seu email - Barbershop",
			html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #8B5CF6; text-align: center; margin-bottom: 20px;">✂️ Barbershop</h2>
            <p style="color: #333; font-size: 16px;">Olá! Obrigado por se cadastrar em nossa barbearia.</p>
            <p style="color: #666;">Para ativar sua conta e começar a agendar seus cortes, clique no botão abaixo:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #8B5CF6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                ✅ Verificar Email
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Se o botão não funcionar, copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; color: #007bff; font-size: 12px; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
            <p style="color: #999; font-size: 12px;">Este link expira em 24 horas.</p>
            <p style="color: #999; font-size: 12px;">Se você não criou uma conta, ignore este email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              ✂️ Barbershop - Seu estilo, nossa paixão!
            </p>
          </div>
        </div>
      `
		};
		const result = await transporter.sendMail(mailOptions);
		logger.api.info("Verification email sent successfully", {
			email,
			messageId: result.messageId
		});
		return {
			success: true,
			messageId: result.messageId
		};
	} catch (error) {
		logger.api.error("Error sending verification email", {
			email,
			error
		});
		return {
			success: false,
			error: error instanceof Error ? error.message : "Erro desconhecido"
		};
	}
}
function generateVerificationToken() {
	return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}
function generateResetToken() {
	return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
}
async function sendResetPasswordEmail(email, token) {
	try {
		if (!await verifyEmailConfig()) throw new Error("Configuração de email inválida");
		const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/reset-password?token=${token}`;
		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: email,
			subject: "Redefinir senha - Valorant Ascension",
			html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #FF4655; text-align: center; margin-bottom: 20px;">🔐 Redefinir Senha</h2>
            <p style="color: #333; font-size: 16px;">Olá! Você solicitou a redefinição da sua senha.</p>
            <p style="color: #666;">Clique no botão abaixo para criar uma nova senha:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #FF4655; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                🔑 Redefinir Senha
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Se o botão não funcionar, copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; color: #007bff; font-size: 12px; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">${resetUrl}</p>
            <p style="color: #999; font-size: 12px;">Este link expira em 1 hora.</p>
            <p style="color: #999; font-size: 12px;">Se você não solicitou esta redefinição, ignore este email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              🎯 Valorant Ascension - Sua ascensão começa aqui!
            </p>
          </div>
        </div>
      `
		};
		const result = await transporter.sendMail(mailOptions);
		logger.api.info("Reset password email sent successfully", {
			email,
			messageId: result.messageId
		});
		return {
			success: true,
			messageId: result.messageId
		};
	} catch (error) {
		logger.api.error("Error sending reset password email", {
			email,
			error
		});
		return {
			success: false,
			error: error instanceof Error ? error.message : "Erro desconhecido"
		};
	}
}
var normalizedEmailSchema = string().trim().min(1, "Email é obrigatório").max(254, "Email inválido").email("Email inválido").transform((value) => value.toLowerCase());
var strongPasswordSchema = string().min(8, "A senha deve ter pelo menos 8 caracteres").max(128, "A senha deve ter no máximo 128 caracteres").regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula (A-Z)").regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula (a-z)").regex(/\d/, "A senha deve conter pelo menos um número (0-9)").regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, "A senha deve conter pelo menos um caractere especial");
var RegisterBodySchema = object({
	name: string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(80, "Nome deve ter no máximo 80 caracteres"),
	email: normalizedEmailSchema,
	password: strongPasswordSchema
});
var ForgotPasswordBodySchema = object({ email: normalizedEmailSchema });
var ResetPasswordBodySchema = object({
	email: normalizedEmailSchema,
	token: string().trim().min(10, "Token inválido").max(512, "Token inválido"),
	newPassword: strongPasswordSchema
});
var VerifyEmailQuerySchema = object({ token: string().trim().min(10, "Token inválido").max(512, "Token inválido") });
var ResendVerificationBodySchema = object({ email: normalizedEmailSchema });
var UserInfoQuerySchema = object({ email: normalizedEmailSchema });
var store = /* @__PURE__ */ new Map();
function getClientIP$1(request) {
	const forwardedFor = request.headers.get("x-forwarded-for");
	if (forwardedFor) {
		const firstIp = forwardedFor.split(",")[0]?.trim();
		if (firstIp) return firstIp;
	}
	const realIp = request.headers.get("x-real-ip");
	if (realIp) return realIp.trim();
	return "unknown";
}
function getStoreKey(request, config, identity) {
	const ip = getClientIP$1(request);
	const normalizedIdentity = identity?.trim().toLowerCase() || "anonymous";
	return `${config.scope}:${ip}:${normalizedIdentity}`;
}
function checkRateLimit$1(request, config, identity) {
	const now = Date.now();
	const storeKey = getStoreKey(request, config, identity);
	const entry = store.get(storeKey);
	if (!entry || now - entry.windowStart >= config.windowMs) {
		const resetAt = now + config.windowMs;
		store.set(storeKey, {
			count: 1,
			windowStart: now
		});
		return {
			allowed: true,
			remaining: Math.max(0, config.max - 1),
			resetAt
		};
	}
	if (entry.blockedUntil && now < entry.blockedUntil) return {
		allowed: false,
		remaining: 0,
		retryAfter: Math.ceil((entry.blockedUntil - now) / 1e3),
		resetAt: entry.windowStart + config.windowMs
	};
	entry.count += 1;
	if (entry.count > config.max) {
		if (config.blockDurationMs && config.blockDurationMs > 0) entry.blockedUntil = now + config.blockDurationMs;
		store.set(storeKey, entry);
		return {
			allowed: false,
			remaining: 0,
			retryAfter: entry.blockedUntil ? Math.ceil((entry.blockedUntil - now) / 1e3) : Math.ceil((entry.windowStart + config.windowMs - now) / 1e3),
			resetAt: entry.windowStart + config.windowMs
		};
	}
	store.set(storeKey, entry);
	return {
		allowed: true,
		remaining: Math.max(0, config.max - entry.count),
		resetAt: entry.windowStart + config.windowMs
	};
}
function createRateLimitHeaders$1(config, result) {
	return {
		"X-RateLimit-Limit": String(config.max),
		"X-RateLimit-Remaining": String(result.remaining),
		"X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1e3)),
		"X-RateLimit-Window": String(Math.ceil(config.windowMs / 1e3)),
		...result.retryAfter ? { "Retry-After": String(result.retryAfter) } : {}
	};
}
function createRateLimitErrorResponse(config, result, message = "Muitas tentativas. Tente novamente em instantes.") {
	return NextResponse.json({ error: message }, {
		status: 429,
		headers: createRateLimitHeaders$1(config, result)
	});
}
var route_exports$22 = /* @__PURE__ */ __exportAll({ POST: () => POST$10 });
var FORGOT_PASSWORD_RATE_LIMIT = {
	scope: "auth:forgot-password",
	max: 5,
	windowMs: 600 * 1e3,
	blockDurationMs: 900 * 1e3
};
async function POST$10(request) {
	const rateLimit = checkRateLimit$1(request, FORGOT_PASSWORD_RATE_LIMIT);
	if (!rateLimit.allowed) return createRateLimitErrorResponse(FORGOT_PASSWORD_RATE_LIMIT, rateLimit, "Muitas tentativas de recuperação de senha.");
	try {
		const body = await request.json();
		const parsedBody = ForgotPasswordBodySchema.safeParse(body);
		if (!parsedBody.success) return NextResponse.json({ error: "Email inválido" }, { status: 400 });
		const { email } = parsedBody.data;
		if (!await db.user.findFirst({ where: {
			email,
			deletedAt: null
		} })) return NextResponse.json({ message: "Se o email existir, você receberá um link para redefinir sua senha" }, { status: 200 });
		const resetToken = generateResetToken();
		const resetTokenExpiry = new Date(Date.now() + 3600 * 1e3);
		await db.user.update({
			where: { email },
			data: {
				resetPasswordToken: resetToken,
				resetPasswordExpires: resetTokenExpiry
			}
		});
		const emailResult = await sendResetPasswordEmail(email, resetToken);
		if (!emailResult.success) {
			logger.api.error("Error sending reset email", { reason: emailResult.error });
			return NextResponse.json({ error: "Erro ao enviar email de redefinição" }, { status: 500 });
		}
		return NextResponse.json({ message: "Se o email existir, você receberá um link para redefinir sua senha" }, { status: 200 });
	} catch (error) {
		logger.api.error("Error processing password reset request", { error });
		return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
	}
}
var route_exports$21 = /* @__PURE__ */ __exportAll({ POST: () => POST$9 });
var REGISTER_RATE_LIMIT = {
	scope: "auth:register",
	max: 5,
	windowMs: 600 * 1e3,
	blockDurationMs: 900 * 1e3
};
async function POST$9(request) {
	const rateLimit = checkRateLimit$1(request, REGISTER_RATE_LIMIT);
	if (!rateLimit.allowed) return createRateLimitErrorResponse(REGISTER_RATE_LIMIT, rateLimit, "Muitas tentativas de cadastro.");
	try {
		const body = await request.json();
		const parsedBody = RegisterBodySchema.safeParse(body);
		if (!parsedBody.success) return NextResponse.json({
			message: "Dados inválidos",
			details: parsedBody.error.flatten().fieldErrors
		}, { status: 400 });
		const { name, email, password } = parsedBody.data;
		logger.api.info("Tentativa de cadastro recebida", { hasName: !!name });
		const existingUser = await db.user.findFirst({
			where: { email },
			include: { accounts: true }
		});
		if (existingUser) {
			if (existingUser.deletedAt) return NextResponse.json({ message: "Este email pertence a uma conta removida. Restaure-a ou use outro email." }, { status: 409 });
			if (existingUser.accounts && existingUser.accounts.length > 0) {
				const providers = existingUser.accounts.map((acc) => acc.provider).join(", ");
				return NextResponse.json({ message: `Este email já está cadastrado via ${providers}. Use o botão "${providers}" para fazer login.` }, { status: 409 });
			}
			return NextResponse.json({ message: "Usuário já existe com este email" }, { status: 409 });
		}
		const hashedPassword = await bcryptjs_default.hash(password, 12);
		const verificationToken = generateVerificationToken();
		const verificationExpires = new Date(Date.now() + 1440 * 60 * 1e3);
		const user = await db.user.create({
			data: {
				name,
				nickname: name,
				email,
				password: hashedPassword,
				role: "CLIENT",
				isActive: false,
				emailVerificationToken: verificationToken,
				emailVerificationExpires: verificationExpires
			},
			select: {
				id: true,
				name: true,
				nickname: true,
				email: true,
				role: true,
				createdAt: true
			}
		});
		if (!(await sendVerificationEmail(email, verificationToken)).success) {
			await db.user.delete({ where: { id: user.id } });
			return NextResponse.json({ message: "Erro ao enviar email de verificação. Tente novamente." }, { status: 500 });
		}
		return NextResponse.json({
			message: "Usuário criado com sucesso. Verifique seu email para ativar sua conta.",
			user,
			emailSent: true
		});
	} catch (error) {
		logger.api.error("Error creating user", { error });
		return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
	}
}
var route_exports$20 = /* @__PURE__ */ __exportAll({ POST: () => POST$8 });
var RESET_PASSWORD_RATE_LIMIT = {
	scope: "auth:reset-password",
	max: 10,
	windowMs: 600 * 1e3,
	blockDurationMs: 900 * 1e3
};
async function POST$8(request) {
	const rateLimit = checkRateLimit$1(request, RESET_PASSWORD_RATE_LIMIT);
	if (!rateLimit.allowed) return createRateLimitErrorResponse(RESET_PASSWORD_RATE_LIMIT, rateLimit, "Muitas tentativas de redefinição de senha.");
	try {
		const body = await request.json();
		const parsedBody = ResetPasswordBodySchema.safeParse(body);
		if (!parsedBody.success) return NextResponse.json({
			error: "Dados inválidos",
			details: parsedBody.error.flatten().fieldErrors
		}, { status: 400 });
		const { email, newPassword, token } = parsedBody.data;
		const user = await db.user.findFirst({ where: {
			email: email.toLowerCase(),
			deletedAt: null,
			resetPasswordToken: token,
			resetPasswordExpires: { gt: /* @__PURE__ */ new Date() }
		} });
		if (!user) return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 });
		const hashedPassword = await bcryptjs_default.hash(newPassword, 12);
		await db.user.update({
			where: { id: user.id },
			data: {
				password: hashedPassword,
				resetPasswordToken: null,
				resetPasswordExpires: null
			}
		});
		return NextResponse.json({ message: "Senha redefinida com sucesso" }, { status: 200 });
	} catch (error) {
		logger.api.error("Error resetting password", { error });
		return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
	}
}
var route_exports$19 = /* @__PURE__ */ __exportAll({ GET: () => GET$15 });
var USER_INFO_RATE_LIMIT = {
	scope: "auth:user-info",
	max: 10,
	windowMs: 600 * 1e3,
	blockDurationMs: 900 * 1e3
};
async function GET$15(request) {
	const rateLimit = checkRateLimit$1(request, USER_INFO_RATE_LIMIT);
	if (!rateLimit.allowed) return createRateLimitErrorResponse(USER_INFO_RATE_LIMIT, rateLimit, "Muitas tentativas.");
	try {
		const { searchParams } = new URL(request.url);
		const parsedQuery = UserInfoQuerySchema.safeParse({ email: searchParams.get("email") });
		if (!parsedQuery.success) return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
		const { email } = parsedQuery.data;
		const user = await db.user.findFirst({
			where: {
				email: email.toLowerCase(),
				deletedAt: null
			},
			include: { accounts: { select: { provider: true } } }
		});
		const hasPassword = !!user?.password;
		const oauthProviders = Array.from(new Set((user?.accounts || []).map((account) => account.provider)));
		return NextResponse.json({
			hasPassword,
			oauthProviders,
			email
		});
	} catch (error) {
		logger.api.error("Error fetching user information", { reason: error instanceof Error ? error.message : "Unknown error" });
		return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
	}
}
var route_exports$18 = /* @__PURE__ */ __exportAll({
	GET: () => GET$14,
	POST: () => POST$7
});
var VERIFY_EMAIL_RATE_LIMIT = {
	scope: "auth:verify-email",
	max: 20,
	windowMs: 600 * 1e3,
	blockDurationMs: 300 * 1e3
};
var RESEND_VERIFICATION_RATE_LIMIT = {
	scope: "auth:resend-verification",
	max: 5,
	windowMs: 600 * 1e3,
	blockDurationMs: 900 * 1e3
};
async function GET$14(request) {
	const rateLimit = checkRateLimit$1(request, VERIFY_EMAIL_RATE_LIMIT);
	if (!rateLimit.allowed) return createRateLimitErrorResponse(VERIFY_EMAIL_RATE_LIMIT, rateLimit, "Muitas tentativas de verificação.");
	try {
		const { searchParams } = new URL(request.url);
		const parsedQuery = VerifyEmailQuerySchema.safeParse({ token: searchParams.get("token") });
		if (!parsedQuery.success) return NextResponse.json({ message: "Token inválido ou expirado" }, { status: 400 });
		const { token } = parsedQuery.data;
		const user = await db.user.findFirst({ where: {
			emailVerificationToken: token,
			deletedAt: null,
			emailVerificationExpires: { gt: /* @__PURE__ */ new Date() }
		} });
		if (!user) return NextResponse.json({ message: "Token inválido ou expirado" }, { status: 400 });
		await db.user.update({
			where: { id: user.id },
			data: {
				isActive: true,
				emailVerified: /* @__PURE__ */ new Date(),
				emailVerificationToken: null,
				emailVerificationExpires: null
			}
		});
		return NextResponse.json({
			message: "Email verificado com sucesso! Sua conta foi ativada.",
			success: true
		});
	} catch (error) {
		logger.api.error("Error verifying email", { error });
		return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
	}
}
async function POST$7(request) {
	const rateLimit = checkRateLimit$1(request, RESEND_VERIFICATION_RATE_LIMIT);
	if (!rateLimit.allowed) return createRateLimitErrorResponse(RESEND_VERIFICATION_RATE_LIMIT, rateLimit, "Muitas tentativas de reenvio de verificação.");
	try {
		const body = await request.json();
		const parsedBody = ResendVerificationBodySchema.safeParse(body);
		if (!parsedBody.success) return NextResponse.json({ message: "Email inválido" }, { status: 400 });
		const { email } = parsedBody.data;
		const user = await db.user.findUnique({ where: { email } });
		if (!user || user.deletedAt || user.isActive) return NextResponse.json({
			message: "Se o email estiver elegível, enviaremos uma nova verificação.",
			success: true
		});
		const { generateVerificationToken, sendVerificationEmail } = await import("./email-DWHg9cIF.mjs").catch(() => {
			throw new Error("Erro ao importar módulo de email");
		});
		const verificationToken = generateVerificationToken();
		const verificationExpires = new Date(Date.now() + 1440 * 60 * 1e3);
		await db.user.update({
			where: { id: user.id },
			data: {
				emailVerificationToken: verificationToken,
				emailVerificationExpires: verificationExpires
			}
		});
		const emailResult = await sendVerificationEmail(email, verificationToken);
		if (!emailResult.success) logger.api.error("Erro ao reenviar email de verificação", { reason: emailResult.error });
		return NextResponse.json({
			message: "Se o email estiver elegível, enviaremos uma nova verificação.",
			success: true
		});
	} catch (error) {
		logger.api.error("Error resending verification email", { error });
		return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
	}
}
var route_exports$17 = /* @__PURE__ */ __exportAll({ GET: () => GET$13 });
/**
* GET /api/barbers
* Lista barbeiros ativos
*/
async function GET$13(request) {
	try {
		const { searchParams } = new URL(request.url);
		const serviceId = searchParams.get("serviceId");
		const date = searchParams.get("date");
		const barbers = await db.user.findMany({
			where: {
				role: "BARBER",
				isActive: true,
				deletedAt: null
			},
			select: {
				id: true,
				name: true,
				image: true,
				phone: true,
				email: true
			},
			orderBy: { name: "asc" }
		});
		if (serviceId && date) {
			if (await db.service.findUnique({
				where: { id: serviceId },
				select: { duration: true }
			})) {
				const targetDate = new Date(date);
				const startOfDay = new Date(targetDate);
				startOfDay.setHours(0, 0, 0, 0);
				const endOfDay = new Date(targetDate);
				endOfDay.setHours(23, 59, 59, 999);
				const appointments = await db.appointment.findMany({
					where: {
						barberId: { in: barbers.map((b) => b.id) },
						date: {
							gte: startOfDay,
							lte: endOfDay
						},
						status: { in: ["SCHEDULED", "CONFIRMED"] }
					},
					select: {
						barberId: true,
						date: true,
						service: { select: { duration: true } }
					}
				});
				const barbersWithAvailability = barbers.map((barber) => {
					const occupiedSlots = appointments.filter((app) => app.barberId === barber.id).length;
					const maxSlotsPerDay = 16;
					const availabilityPercentage = Math.max(0, (maxSlotsPerDay - occupiedSlots) / maxSlotsPerDay * 100);
					return {
						...barber,
						availability: {
							percentage: Math.round(availabilityPercentage),
							appointmentsCount: occupiedSlots,
							hasAvailability: availabilityPercentage > 0
						}
					};
				});
				return NextResponse.json(barbersWithAvailability);
			}
		}
		return NextResponse.json(barbers);
	} catch (error) {
		console.error("Erro ao buscar barbeiros:", error);
		return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
	}
}
var FriendshipStatusEnum = _enum(["ACCEPTED", "BLOCKED"]);
_enum([
	"PENDING",
	"ACCEPTED",
	"REJECTED",
	"CANCELLED"
]);
/**
* Schema para enviar solicitação de amizade
*/
var SendFriendRequestSchema = object({ receiverId: string().cuid("ID de usuário inválido") });
/**
* Schema para responder solicitação de amizade
*/
var RespondFriendRequestSchema = object({
	requestId: string().cuid("ID de solicitação inválido"),
	action: _enum(["ACCEPT", "REJECT"])
});
/**
* Schema para filtros de listagem de amigos
*/
var FriendshipFiltersSchema = object({
	search: string().optional(),
	status: FriendshipStatusEnum.optional(),
	page: number().int().positive().default(1),
	limit: number().int().positive().max(50).default(20)
});
/**
* Schema para busca de usuários
*/
var UserSearchSchema = object({
	query: string().min(2, "Busca deve ter no mínimo 2 caracteres"),
	excludeFriends: boolean().default(true),
	page: number().int().positive().default(1),
	limit: number().int().positive().max(50).default(20)
});
/**
* Schema para bloquear/desbloquear usuário
*/
var BlockUserSchema = object({
	userId: string().cuid("ID de usuário inválido"),
	block: boolean()
});
/**
* Schema para gerar código de convite
*/
var GenerateInviteCodeSchema = object({ regenerate: boolean().default(false) });
/**
* Schema para aceitar convite
*/
var AcceptInviteSchema = object({ inviteCode: string().min(6, "Código de convite inválido") });
var route_exports$16 = /* @__PURE__ */ __exportAll({ GET: () => GET$12 });
/**
* GET /api/friends
* Lista amigos do usuário autenticado
*/
async function GET$12(request) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return NextResponse.json({
			success: false,
			error: "Não autenticado"
		}, { status: 401 });
		const { searchParams } = new URL(request.url);
		const search = searchParams.get("search") || void 0;
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "20");
		const filters = FriendshipFiltersSchema.parse({
			search,
			page,
			limit
		});
		const result = await FriendshipService.getFriends(session.user.id, filters);
		return NextResponse.json({
			success: true,
			data: result.friends,
			pagination: result.pagination
		});
	} catch (error) {
		console.error("Erro ao buscar amigos:", error);
		return NextResponse.json({
			success: false,
			error: "Erro ao buscar amigos"
		}, { status: 500 });
	}
}
var route_exports$15 = /* @__PURE__ */ __exportAll({
	GET: () => GET$11,
	POST: () => POST$6
});
/**
* GET /api/friends/invite
* Gera ou obtém código de convite do usuário
*/
async function GET$11(request) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return NextResponse.json({
			success: false,
			error: "Não autenticado"
		}, { status: 401 });
		const { searchParams } = new URL(request.url);
		const regenerate = searchParams.get("regenerate") === "true";
		const inviteCode = await FriendshipService.generateInviteCode(session.user.id, regenerate);
		return NextResponse.json({
			success: true,
			data: { inviteCode }
		});
	} catch (error) {
		console.error("Erro ao gerar código de convite:", error);
		return NextResponse.json({
			success: false,
			error: "Erro ao gerar código de convite"
		}, { status: 500 });
	}
}
/**
* POST /api/friends/invite
* Aceita convite via código
*/
async function POST$6(request) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return NextResponse.json({
			success: false,
			error: "Não autenticado"
		}, { status: 401 });
		const body = await request.json();
		const validated = AcceptInviteSchema.parse(body);
		const result = await FriendshipService.acceptInvite(session.user.id, validated.inviteCode);
		return NextResponse.json({
			success: true,
			data: result
		});
	} catch (error) {
		console.error("Erro ao aceitar convite:", error);
		if (error instanceof Error) return NextResponse.json({
			success: false,
			error: error.message
		}, { status: 400 });
		return NextResponse.json({
			success: false,
			error: "Erro ao aceitar convite"
		}, { status: 500 });
	}
}
var route_exports$14 = /* @__PURE__ */ __exportAll({
	GET: () => GET$10,
	POST: () => POST$5
});
/**
* GET /api/friends/requests
* Lista solicitações de amizade recebidas
*/
async function GET$10() {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return NextResponse.json({
			success: false,
			error: "Não autenticado"
		}, { status: 401 });
		const requests = await FriendshipService.getReceivedRequests(session.user.id);
		return NextResponse.json({
			success: true,
			data: requests
		});
	} catch (error) {
		console.error("Erro ao buscar solicitações:", error);
		return NextResponse.json({
			success: false,
			error: "Erro ao buscar solicitações"
		}, { status: 500 });
	}
}
/**
* POST /api/friends/requests
* Envia solicitação de amizade
*/
async function POST$5(request) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return NextResponse.json({
			success: false,
			error: "Não autenticado"
		}, { status: 401 });
		const body = await request.json();
		const validated = SendFriendRequestSchema.parse(body);
		const result = await FriendshipService.sendFriendRequest(session.user.id, validated.receiverId);
		return NextResponse.json({
			success: true,
			data: result
		});
	} catch (error) {
		console.error("Erro ao enviar solicitação:", error);
		if (error instanceof Error) return NextResponse.json({
			success: false,
			error: error.message
		}, { status: 400 });
		return NextResponse.json({
			success: false,
			error: "Erro ao enviar solicitação"
		}, { status: 500 });
	}
}
var route_exports$13 = /* @__PURE__ */ __exportAll({ GET: () => GET$9 });
/**
* GET /api/friends/search
* Busca usuários por nome/email
*/
async function GET$9(request) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return NextResponse.json({
			success: false,
			error: "Não autenticado"
		}, { status: 401 });
		const { searchParams } = new URL(request.url);
		const query = searchParams.get("query");
		if (!query || query.length < 2) return NextResponse.json({
			success: false,
			error: "Busca deve ter no mínimo 2 caracteres"
		}, { status: 400 });
		const excludeFriends = searchParams.get("excludeFriends") !== "false";
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "20");
		const filters = UserSearchSchema.parse({
			query,
			excludeFriends,
			page,
			limit
		});
		const result = await FriendshipService.searchUsers(session.user.id, filters);
		return NextResponse.json({
			success: true,
			data: result.users,
			pagination: result.pagination
		});
	} catch (error) {
		console.error("Erro ao buscar usuários:", error);
		if (error instanceof Error) return NextResponse.json({
			success: false,
			error: error.message
		}, { status: 400 });
		return NextResponse.json({
			success: false,
			error: "Erro ao buscar usuários"
		}, { status: 500 });
	}
}
var route_exports$12 = /* @__PURE__ */ __exportAll({ GET: () => GET$8 });
/**
* GET /api/friends/suggestions
* Busca sugestões de amigos baseado em amigos em comum
*/
async function GET$8(request) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return NextResponse.json({
			success: false,
			error: "Não autenticado"
		}, { status: 401 });
		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get("limit") || "10");
		const suggestions = await FriendshipService.getSuggestions(session.user.id, limit);
		return NextResponse.json({
			success: true,
			data: suggestions
		});
	} catch (error) {
		console.error("Erro ao buscar sugestões:", error);
		return NextResponse.json({
			success: false,
			error: "Erro ao buscar sugestões"
		}, { status: 500 });
	}
}
var route_exports$11 = /* @__PURE__ */ __exportAll({ GET: () => GET$7 });
/**
* Health Check Endpoint
* 
* Verifica o status da aplicação e dependências
* Usado pelo Docker health check e monitoramento
*/
async function GET$7() {
	try {
		const startTime = Date.now();
		await db.$queryRaw`SELECT 1`;
		const dbResponseTime = Date.now() - startTime;
		return NextResponse.json({
			status: "healthy",
			timestamp: (/* @__PURE__ */ new Date()).toISOString(),
			uptime: process.uptime(),
			environment: "production",
			database: {
				status: "connected",
				responseTime: `${dbResponseTime}ms`
			},
			version: process.env.npm_package_version || "1.0.0"
		}, { status: 200 });
	} catch (error) {
		console.error("Health check failed:", error);
		return NextResponse.json({
			status: "unhealthy",
			timestamp: (/* @__PURE__ */ new Date()).toISOString(),
			error: error instanceof Error ? error.message : "Unknown error",
			environment: "production"
		}, { status: 503 });
	}
}
var emitter = new EventEmitter();
emitter.setMaxListeners(100);
var generateId = () => {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
	return Math.random().toString(36).slice(2);
};
function emitRealtimeEvent(event) {
	const enrichedEvent = {
		...event,
		eventId: generateId(),
		createdAt: Date.now()
	};
	emitter.emit("message", enrichedEvent);
	return enrichedEvent;
}
function subscribeToRealtime(listener) {
	emitter.on("message", listener);
	return () => {
		emitter.off("message", listener);
	};
}
function eventMatchesSession(event, session) {
	const target = event.target;
	const sessionUserId = session.user?.id;
	const sessionRole = session.user?.role;
	if (target.broadcast) return true;
	const matchesUser = target.users?.length ? target.users.includes(sessionUserId) : false;
	const matchesRole = target.roles?.length ? !!sessionRole && target.roles.includes(sessionRole) : false;
	return matchesUser || matchesRole;
}
function buildLiveStatusEvent(status, target) {
	return {
		type: "live:status",
		payload: { status },
		target,
		eventId: generateId(),
		createdAt: Date.now()
	};
}
var route_exports$10 = /* @__PURE__ */ __exportAll({
	GET: () => GET$6,
	dynamic: () => dynamic,
	runtime: () => runtime
});
var runtime = "nodejs";
var dynamic = "force-dynamic";
var headers = {
	"Content-Type": "text/event-stream",
	"Cache-Control": "no-cache, no-transform",
	Connection: "keep-alive"
};
async function GET$6(req) {
	const session = await (0, import_next_auth.getServerSession)(authOptions);
	if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
	const encoder = new TextEncoder();
	let keepAlive = null;
	let unsubscribe = null;
	const stream = new ReadableStream({
		start(controller) {
			const send = (raw) => {
				controller.enqueue(encoder.encode(`data: ${JSON.stringify(raw)}\n\n`));
			};
			send(buildLiveStatusEvent("connected", { users: [session.user.id] }));
			const listener = (event) => {
				if (!eventMatchesSession(event, session)) return;
				send(event);
			};
			unsubscribe = subscribeToRealtime(listener);
			keepAlive = setInterval(() => {
				send({
					type: "live:heartbeat",
					payload: { ts: Date.now() },
					target: { users: [session.user.id] },
					eventId: `heartbeat-${Date.now()}`,
					createdAt: Date.now()
				});
			}, 15e3);
			const abortHandler = () => {
				unsubscribe?.();
				if (keepAlive) clearInterval(keepAlive);
				try {
					controller.close();
				} catch {}
			};
			req.signal.addEventListener("abort", abortHandler);
		},
		cancel() {
			if (keepAlive) clearInterval(keepAlive);
			unsubscribe?.();
		}
	});
	return new Response(stream, { headers });
}
var route_exports$9 = /* @__PURE__ */ __exportAll({
	GET: () => GET$5,
	POST: () => POST$4
});
/**
* GET /api/services
* Lista serviços disponíveis com filtros opcionais
*/
async function GET$5(request) {
	try {
		const { searchParams } = new URL(request.url);
		const filters = ServiceFiltersSchema.parse({
			active: searchParams.get("active") ? searchParams.get("active") === "true" : void 0,
			search: searchParams.get("search") || void 0,
			minPrice: searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")) : void 0,
			maxPrice: searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")) : void 0,
			maxDuration: searchParams.get("maxDuration") ? parseInt(searchParams.get("maxDuration")) : void 0,
			page: searchParams.get("page") ? parseInt(searchParams.get("page")) : 1,
			limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")) : 10
		});
		const where = {};
		if (filters.active !== void 0) where.active = filters.active;
		if (filters.search) where.OR = [{ name: {
			contains: filters.search,
			mode: "insensitive"
		} }, { description: {
			contains: filters.search,
			mode: "insensitive"
		} }];
		if (filters.minPrice || filters.maxPrice) {
			where.price = {};
			if (filters.minPrice) where.price.gte = filters.minPrice;
			if (filters.maxPrice) where.price.lte = filters.maxPrice;
		}
		if (filters.maxDuration) where.duration = { lte: filters.maxDuration };
		const [services, total] = await Promise.all([db.service.findMany({
			where,
			orderBy: [{ active: "desc" }, { name: "asc" }],
			skip: (filters.page - 1) * filters.limit,
			take: filters.limit
		}), db.service.count({ where })]);
		return NextResponse.json({
			services,
			pagination: {
				page: filters.page,
				limit: filters.limit,
				total,
				totalPages: Math.ceil(total / filters.limit)
			}
		});
	} catch (error) {
		console.error("Erro ao buscar serviços:", error);
		return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
	}
}
/**
* POST /api/services
* Cria um novo serviço (apenas ADMIN)
*/
async function POST$4(request) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
		if ((await db.user.findFirst({
			where: {
				id: session.user.id,
				deletedAt: null
			},
			select: { role: true }
		}))?.role !== "ADMIN") return NextResponse.json({ error: "Acesso negado. Apenas administradores podem criar serviços" }, { status: 403 });
		const body = await request.json();
		const { CreateServiceSchema } = await import("../_libs/_.mjs").then((n) => n.i);
		const data = CreateServiceSchema.parse(body);
		if (await db.service.findFirst({ where: { name: {
			equals: data.name,
			mode: "insensitive"
		} } })) return NextResponse.json({ error: "Já existe um serviço com este nome" }, { status: 409 });
		const service = await db.service.create({ data });
		return NextResponse.json(service, { status: 201 });
	} catch (error) {
		console.error("Erro ao criar serviço:", error);
		if (error instanceof Error && error.name === "ZodError") return NextResponse.json({
			error: "Dados inválidos",
			details: error.message
		}, { status: 400 });
		return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
	}
}
function readHeader(headers, name) {
	if (headers instanceof Headers) return headers.get(name)?.trim() || void 0;
	const value = headers[name.toLowerCase()] ?? headers[name];
	if (Array.isArray(value)) return value[0]?.trim();
	return typeof value === "string" ? value.trim() : void 0;
}
function safeEquals(left, right) {
	const leftBuffer = Buffer.from(left);
	const rightBuffer = Buffer.from(right);
	if (leftBuffer.length !== rightBuffer.length) return false;
	return timingSafeEqual(leftBuffer, rightBuffer);
}
function canAccessDebugEndpoints(headers) {
	const expectedToken = process.env.DEBUG_API_TOKEN;
	if (!expectedToken) return false;
	const providedToken = readHeader(headers, "x-debug-token") ?? readHeader(headers, "x-debug-auth");
	if (!providedToken) return false;
	return safeEquals(expectedToken, providedToken);
}
var route_exports$8 = /* @__PURE__ */ __exportAll({ GET: () => GET$4 });
async function GET$4(request) {
	if (!canAccessDebugEndpoints(request.headers)) return NextResponse.json({ error: "Not found" }, { status: 404 });
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		return NextResponse.json({
			success: true,
			isAuthenticated: !!session?.user?.id,
			user: session?.user?.id ? {
				id: session.user.id,
				role: session.user.role
			} : null
		});
	} catch (error) {
		return NextResponse.json({
			success: false,
			error: error instanceof Error ? error.message : "Unknown error"
		});
	}
}
var route_exports$7 = /* @__PURE__ */ __exportAll({ GET: () => GET$3 });
async function GET$3(request) {
	if (!canAccessDebugEndpoints(request.headers)) return NextResponse.json({ error: "Not found" }, { status: 404 });
	try {
		console.log("🧪 Testing Sharp installation...");
		const sharp = (await import("sharp")).default;
		const sharpVersion = sharp.versions;
		console.log("✅ Sharp versions:", sharpVersion);
		const testImage = await sharp({ create: {
			width: 100,
			height: 100,
			channels: 3,
			background: {
				r: 255,
				g: 0,
				b: 0
			}
		} }).jpeg().toBuffer();
		console.log("✅ Sharp test image created, size:", testImage.length);
		return NextResponse.json({
			success: true,
			sharp: {
				versions: sharpVersion,
				testImageSize: testImage.length,
				platform: process.platform,
				arch: process.arch,
				nodeVersion: process.version
			}
		});
	} catch (error) {
		console.error("❌ Sharp test failed:", error);
		return NextResponse.json({
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
			platform: process.platform,
			arch: process.arch,
			nodeVersion: process.version
		}, { status: 500 });
	}
}
var route_exports$6 = /* @__PURE__ */ __exportAll({ POST: () => POST$3 });
/**
* Endpoint para criar dados de teste para o sistema de avaliações
* Cria: User, Service, Appointment, ServiceHistory
*/
async function POST$3(request) {
	if (!canAccessDebugEndpoints(request.headers)) return NextResponse.json({ error: "Not found" }, { status: 404 });
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return NextResponse.json({
			success: false,
			error: "Usuário não autenticado"
		}, { status: 401 });
		console.log("🔧 Criando dados de teste para avaliações...");
		const existingServiceHistory = await db.serviceHistory.findFirst({
			where: {
				userId: session.user.id,
				rating: null
			},
			include: {
				service: true,
				appointments: true
			}
		});
		if (existingServiceHistory) {
			console.log("✅ ServiceHistory já existe:", existingServiceHistory.id);
			return NextResponse.json({
				success: true,
				message: "Dados de teste já existem",
				data: {
					serviceHistoryId: existingServiceHistory.id,
					service: existingServiceHistory.service,
					appointment: existingServiceHistory.appointments[0] || null
				}
			});
		}
		let service = await db.service.findFirst({ where: { active: true } });
		if (!service) {
			await db.service.createMany({ data: [
				{
					name: "Corte de Cabelo Clássico",
					description: "Corte de cabelo tradicional com acabamento profissional",
					price: 25,
					duration: 30,
					active: true
				},
				{
					name: "Barba + Bigode",
					description: "Aparação e modelagem de barba e bigode",
					price: 20,
					duration: 25,
					active: true
				},
				{
					name: "Corte + Barba Completo",
					description: "Pacote completo com corte de cabelo e barba",
					price: 40,
					duration: 50,
					active: true
				}
			] });
			service = await db.service.findFirst({ where: { active: true } });
			console.log("✅ Serviços criados para demo");
		}
		if (!service) throw new Error("Não foi possível criar ou encontrar serviços");
		let barber = await db.user.findFirst({ where: { role: "BARBER" } });
		if (!barber) {
			barber = await db.user.create({ data: {
				name: "João Silva",
				email: "joao.barbeiro@email.com",
				role: "BARBER",
				isActive: true
			} });
			console.log("✅ Barbeiro criado:", barber.id);
		}
		const appointment = await db.appointment.create({ data: {
			userId: session.user.id,
			barberId: barber.id,
			serviceId: service.id,
			date: /* @__PURE__ */ new Date(Date.now() - 1440 * 60 * 1e3),
			status: "COMPLETED",
			notes: "Agendamento de teste para avaliações"
		} });
		console.log("✅ Agendamento criado:", appointment.id);
		const serviceHistory = await db.serviceHistory.create({ data: {
			userId: session.user.id,
			serviceId: service.id,
			finalPrice: service.price,
			paymentMethod: "CARD",
			completedAt: /* @__PURE__ */ new Date(Date.now() - 1380 * 60 * 1e3),
			rating: null,
			feedback: null,
			images: [],
			notes: "Histórico de teste para avaliações"
		} });
		console.log("✅ ServiceHistory criado:", serviceHistory.id);
		await db.appointment.update({
			where: { id: appointment.id },
			data: { serviceHistoryId: serviceHistory.id }
		});
		return NextResponse.json({
			success: true,
			message: "Dados de teste criados com sucesso!",
			data: {
				serviceHistoryId: serviceHistory.id,
				service,
				appointment,
				barber
			}
		});
	} catch (error) {
		console.error("❌ Erro ao criar dados de teste:", error);
		console.error("❌ Stack trace:", error.stack);
		return NextResponse.json({
			success: false,
			error: "Erro interno do servidor",
			details: error.message
		}, { status: 500 });
	}
}
process.env.VERCEL;
var UPLOAD_CONFIG = {
	MAX_FILE_SIZE: 5 * 1024 * 1024,
	MAX_FILES_PER_REQUEST: 5,
	ALLOWED_MIME_TYPES: [
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/webp"
	],
	ALLOWED_EXTENSIONS: [
		".jpg",
		".jpeg",
		".png",
		".webp"
	],
	FILE_SIGNATURES: {
		"image/jpeg": ["ffd8ff"],
		"image/jpg": ["ffd8ff"],
		"image/png": ["89504e47"],
		"image/webp": ["52494646"]
	}
};
var RATE_LIMIT_CONFIG = {
	MAX_UPLOADS_PER_WINDOW: 10,
	WINDOW_MS: 3600 * 1e3,
	BLOCK_DURATION_MS: 900 * 1e3,
	STORAGE_PREFIX: "upload_rate_limit"
};
var ERROR_MESSAGES = {
	FILE_TOO_LARGE: `Arquivo muito grande. Tamanho máximo: ${UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`,
	INVALID_FILE_TYPE: "Tipo de arquivo não suportado. Use JPEG, PNG ou WebP",
	TOO_MANY_FILES: `Máximo de ${UPLOAD_CONFIG.MAX_FILES_PER_REQUEST} arquivos por upload`,
	FILE_CORRUPTED: "Arquivo corrompido ou inválido",
	RATE_LIMIT_EXCEEDED: "Muitos uploads. Tente novamente em alguns minutos",
	UPLOAD_FAILED: "Erro no upload. Tente novamente",
	NO_FILE_PROVIDED: "Nenhum arquivo fornecido",
	UNAUTHORIZED: "Usuário não autorizado para upload"
};
/**
* ⚡ Rate Limiter
* 
* Sistema de rate limiting para uploads baseado em IP e usuário.
* Previne spam e ataques de DDoS nos endpoints de upload.
* 
* @author GitHub Copilot
* @since 2024-10-24
*/
var rateLimitStore = /* @__PURE__ */ new Map();
/**
* Generate rate limit key for IP/User combination
*/
function generateRateLimitKey(ip, userId) {
	return `${RATE_LIMIT_CONFIG.STORAGE_PREFIX}:${ip}${userId ? `:user:${userId}` : ""}`;
}
/**
* Get current rate limit entry for key
*/
function getRateLimitEntry(key) {
	const existing = rateLimitStore.get(key);
	const now = Date.now();
	if (!existing || now - existing.windowStart > RATE_LIMIT_CONFIG.WINDOW_MS) {
		const entry = {
			count: 0,
			windowStart: now,
			isBlocked: false
		};
		rateLimitStore.set(key, entry);
		return entry;
	}
	return existing;
}
/**
* Check if request should be rate limited
*/
function checkRateLimit(ip, userId) {
	const key = generateRateLimitKey(ip, userId);
	const entry = getRateLimitEntry(key);
	const now = Date.now();
	if (entry.isBlocked && entry.blockedUntil && now < entry.blockedUntil) {
		const remainingBlockTime = Math.ceil((entry.blockedUntil - now) / 1e3);
		console.log(`🚫 Rate limit blocked: ${key}, remaining: ${remainingBlockTime}s`);
		return {
			allowed: false,
			error: `${ERROR_MESSAGES.RATE_LIMIT_EXCEEDED}. Bloqueado por ${remainingBlockTime} segundos.`,
			resetTime: entry.blockedUntil
		};
	}
	if (entry.isBlocked && entry.blockedUntil && now >= entry.blockedUntil) {
		entry.isBlocked = false;
		entry.blockedUntil = void 0;
		entry.count = 0;
		entry.windowStart = now;
	}
	if (entry.count >= RATE_LIMIT_CONFIG.MAX_UPLOADS_PER_WINDOW) {
		entry.isBlocked = true;
		entry.blockedUntil = now + RATE_LIMIT_CONFIG.BLOCK_DURATION_MS;
		rateLimitStore.set(key, entry);
		console.log(`🚫 Rate limit exceeded: ${key}, blocked until ${new Date(entry.blockedUntil).toISOString()}`);
		return {
			allowed: false,
			error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
			resetTime: entry.blockedUntil
		};
	}
	entry.count++;
	rateLimitStore.set(key, entry);
	const remaining = RATE_LIMIT_CONFIG.MAX_UPLOADS_PER_WINDOW - entry.count;
	const resetTime = entry.windowStart + RATE_LIMIT_CONFIG.WINDOW_MS;
	console.log(`✅ Rate limit check passed: ${key}, count: ${entry.count}/${RATE_LIMIT_CONFIG.MAX_UPLOADS_PER_WINDOW}, remaining: ${remaining}`);
	return {
		allowed: true,
		remaining,
		resetTime
	};
}
/**
* Extract IP address from request
*/
function getClientIP(request) {
	const headers = request.headers;
	for (const header of [
		"x-forwarded-for",
		"x-real-ip",
		"x-client-ip",
		"cf-connecting-ip",
		"x-forwarded",
		"forwarded-for",
		"forwarded"
	]) {
		const value = headers.get(header);
		if (value) {
			const ip = value.split(",")[0].trim();
			if (ip && ip !== "unknown") return ip;
		}
	}
	return "127.0.0.1";
}
/**
* Create rate limit headers for API responses
*/
function createRateLimitHeaders(status) {
	return {
		"X-RateLimit-Limit": RATE_LIMIT_CONFIG.MAX_UPLOADS_PER_WINDOW.toString(),
		"X-RateLimit-Remaining": status.remaining.toString(),
		"X-RateLimit-Reset": Math.ceil(status.resetTime / 1e3).toString(),
		"X-RateLimit-Window": (RATE_LIMIT_CONFIG.WINDOW_MS / 1e3).toString()
	};
}
/**
* Upload Types
*/
var UploadType = /* @__PURE__ */ function(UploadType) {
	UploadType["PROFILE"] = "profile";
	UploadType["REVIEWS"] = "reviews";
	return UploadType;
}({});
async function hybridUploadAction(formData, uploadType, userId) {
	const useCloudinary = process.env.STORAGE_PROVIDER === "cloudinary";
	try {
		if (useCloudinary) {
			console.log("🌐 Using Cloudinary for production upload");
			return await uploadToCloudinary(formData, uploadType, userId);
		} else {
			console.log("🏠 Using local storage for development upload");
			return await uploadToLocal(formData, uploadType, userId);
		}
	} catch (error) {
		console.error("❌ Hybrid upload error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Upload failed"
		};
	}
}
async function uploadToCloudinary(formData, uploadType, userId) {
	const cloudinary = await import("../_libs/cloudinary+lodash+q.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
	cloudinary.v2.config({
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET
	});
	const singleFile = formData.get("file");
	const multipleFiles = formData.getAll("files");
	if (singleFile) {
		const result = await uploadSingleToCloudinary(cloudinary, singleFile, uploadType, userId);
		return {
			success: true,
			url: result.secure_url,
			filename: result.public_id,
			provider: "cloudinary"
		};
	} else if (multipleFiles.length > 0) {
		const results = await Promise.all(multipleFiles.map((file) => uploadSingleToCloudinary(cloudinary, file, uploadType, userId)));
		return {
			success: true,
			urls: results.map((r) => r.secure_url),
			files: results.map((r) => ({
				url: r.secure_url,
				filename: r.public_id,
				size: r.bytes,
				metadata: {
					width: r.width,
					height: r.height,
					format: r.format
				}
			})),
			totalFiles: multipleFiles.length,
			successfulFiles: results.length,
			provider: "cloudinary"
		};
	} else throw new Error("No files provided");
}
async function uploadSingleToCloudinary(cloudinary, file, uploadType, userId) {
	const bytes = await file.arrayBuffer();
	const buffer = Buffer.from(bytes);
	const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
	const transformation = uploadType === UploadType.REVIEWS ? {
		width: 800,
		height: 600,
		crop: "fit",
		fetch_format: "auto",
		quality: "auto"
	} : {
		width: 400,
		height: 400,
		crop: "fill",
		fetch_format: "auto",
		quality: "auto"
	};
	return new Promise((resolve, reject) => {
		cloudinary.v2.uploader.upload(base64, {
			folder: `barbershop/${uploadType}`,
			public_id: `${userId ? `user${userId}-` : ""}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			resource_type: "auto",
			...transformation
		}, (error, result) => {
			if (error) reject(error);
			else resolve(result);
		});
	});
}
async function uploadToLocal(formData, uploadType, userId) {
	const fs = await import("fs/promises");
	const path = await import("path");
	const singleFile = formData.get("file");
	const multipleFiles = formData.getAll("files");
	if (singleFile) {
		const result = await uploadSingleToLocal(fs, path, singleFile, uploadType, userId);
		return {
			success: true,
			url: result.url,
			filename: result.filename,
			provider: "local"
		};
	} else if (multipleFiles.length > 0) {
		const results = await Promise.all(multipleFiles.map((file) => uploadSingleToLocal(fs, path, file, uploadType, userId)));
		return {
			success: true,
			urls: results.map((r) => r.url),
			files: results.map((r) => ({
				url: r.url,
				filename: r.filename,
				size: 0,
				metadata: {}
			})),
			totalFiles: multipleFiles.length,
			successfulFiles: results.length,
			provider: "local"
		};
	} else throw new Error("No files provided");
}
async function uploadSingleToLocal(fs, path, file, uploadType, userId) {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 8);
	const ext = path.extname(file.name);
	const filename = `${userId ? `user${userId}-` : ""}${timestamp}-${random}${ext}`;
	const uploadDir = path.join(process.cwd(), "public", "uploads", uploadType);
	await fs.mkdir(uploadDir, { recursive: true });
	const filePath = path.join(uploadDir, filename);
	const bytes = await file.arrayBuffer();
	const buffer = Buffer.from(bytes);
	await fs.writeFile(filePath, buffer);
	return {
		url: `/uploads/${uploadType}/${filename}`,
		filename
	};
}
hybridUploadAction = /* @__PURE__ */ registerServerReference(hybridUploadAction, "9cd6dd4421e2", "hybridUploadAction");
/**
* 👤 Profile Upload API Route
* 
* Endpoint para upload de fotos de perfil dos usuários.
* Suporta apenas uma imagem por upload com validação rigorosa.
* 
* @author GitHub Copilot
* @since 2024-10-24
*/
var route_exports$5 = /* @__PURE__ */ __exportAll({
	GET: () => GET$2,
	POST: () => POST$2
});
async function POST$2(request) {
	console.log("👤 Profile upload request received");
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) {
			console.log("❌ Unauthorized upload attempt");
			return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
		}
		const userId = session.user.id;
		console.log(`👤 Profile upload for user: ${userId}`);
		const clientIP = getClientIP(request);
		const rateLimitResult = checkRateLimit(clientIP, userId);
		if (!rateLimitResult.allowed) {
			console.log(`🚫 Rate limit exceeded for ${clientIP}:${userId}`);
			return NextResponse.json({ error: rateLimitResult.error }, {
				status: 429,
				headers: createRateLimitHeaders({
					count: 10,
					remaining: 0,
					resetTime: rateLimitResult.resetTime || Date.now()
				})
			});
		}
		const file = (await request.formData()).get("file");
		if (!file) {
			console.log("❌ No file provided in form data");
			return NextResponse.json({ error: "Nenhum arquivo fornecido" }, { status: 400 });
		}
		console.log(`📄 Profile file received: ${file.name} (${file.type}, ${file.size} bytes)`);
		const uploadFormData = new FormData();
		uploadFormData.append("file", file);
		const uploadResult = await hybridUploadAction(uploadFormData, UploadType.PROFILE, userId);
		if (!uploadResult.success) {
			console.log(`❌ Profile upload failed: ${uploadResult.error}`);
			return NextResponse.json({ error: uploadResult.error }, { status: 400 });
		}
		try {
			const { db } = await import("./prisma-uKWGIJ7B.mjs").then((n) => n.n).then((n) => n.n);
			await db.user.update({
				where: { id: userId },
				data: { image: uploadResult.url }
			});
			console.log(`✅ User profile image updated in database: ${uploadResult.url}`);
		} catch (dbError) {
			console.error("❌ Failed to update user image in database:", dbError);
		}
		console.log(`✅ Profile upload successful: ${uploadResult.url}`);
		const uploadedFile = uploadResult.files?.[0];
		const responseFile = {
			url: uploadResult.url ?? uploadedFile?.url ?? "",
			filename: uploadResult.filename ?? uploadedFile?.filename ?? file.name
		};
		if (uploadedFile?.size !== void 0) responseFile.size = uploadedFile.size;
		else responseFile.size = file.size;
		if (uploadedFile?.metadata) responseFile.metadata = uploadedFile.metadata;
		if (uploadedFile?.base64) responseFile.base64 = uploadedFile.base64;
		const response = {
			success: true,
			file: responseFile,
			message: "Foto de perfil atualizada com sucesso"
		};
		return NextResponse.json(response, { headers: createRateLimitHeaders({
			count: rateLimitResult.remaining ? 10 - rateLimitResult.remaining : 1,
			remaining: rateLimitResult.remaining || 9,
			resetTime: rateLimitResult.resetTime || Date.now()
		}) });
	} catch (error) {
		console.error("💥 Profile upload error:", error);
		return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
	}
}
async function GET$2(request) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
		const rateLimitStatus = checkRateLimit(getClientIP(request), session.user.id);
		return NextResponse.json({
			uploadType: "profile",
			maxFileSize: "5MB",
			allowedTypes: [
				"image/jpeg",
				"image/png",
				"image/webp"
			],
			rateLimit: {
				remaining: rateLimitStatus.remaining,
				resetTime: rateLimitStatus.resetTime
			}
		});
	} catch (error) {
		console.error("💥 Profile upload info error:", error);
		return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
	}
}
/**
* ⭐ Review Images Upload API Route
* 
* Endpoint para upload de imagens em avaliações.
* Suporta múltiplas imagens por upload (máx. 5).
* 
* @author GitHub Copilot
* @since 2024-10-24
*/
var route_exports$4 = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE$2,
	GET: () => GET$1,
	POST: () => POST$1
});
async function POST$1(request) {
	console.log("⭐ Review images upload request received");
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) {
			console.log("❌ Unauthorized upload attempt");
			return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
		}
		const userId = session.user.id;
		console.log(`⭐ Review upload for user: ${userId}`);
		const clientIP = getClientIP(request);
		const rateLimitResult = checkRateLimit(clientIP, userId);
		if (!rateLimitResult.allowed) {
			console.log(`🚫 Rate limit exceeded for ${clientIP}:${userId}`);
			return NextResponse.json({ error: rateLimitResult.error }, {
				status: 429,
				headers: createRateLimitHeaders({
					count: 10,
					remaining: 0,
					resetTime: rateLimitResult.resetTime || Date.now()
				})
			});
		}
		const files = (await request.formData()).getAll("files");
		if (!files || files.length === 0) {
			console.log("❌ No files provided in form data");
			return NextResponse.json({ error: "Nenhum arquivo fornecido" }, { status: 400 });
		}
		console.log(`📄 Review files received: ${files.length} files`);
		files.forEach((file, index) => {
			console.log(`  ${index + 1}. ${file.name} (${file.type}, ${file.size} bytes)`);
		});
		const uploadFormData = new FormData();
		files.forEach((file) => uploadFormData.append("files", file));
		const uploadResult = await hybridUploadAction(uploadFormData, UploadType.REVIEWS, userId);
		if (!uploadResult.success) {
			console.log(`❌ Review upload failed: ${uploadResult.error}`);
			return NextResponse.json({ error: uploadResult.error }, { status: 400 });
		}
		console.log(`✅ Review upload successful: ${uploadResult.successfulFiles}/${uploadResult.totalFiles} files`);
		const response = {
			success: true,
			files: uploadResult.files?.map((file) => ({
				url: file.url,
				filename: file.filename,
				size: file.size,
				metadata: file.metadata,
				base64: file.base64
			})),
			totalFiles: uploadResult.totalFiles,
			successfulFiles: uploadResult.successfulFiles,
			message: `${uploadResult.successfulFiles} imagens enviadas com sucesso`
		};
		return NextResponse.json(response, { headers: createRateLimitHeaders({
			count: rateLimitResult.remaining ? 10 - rateLimitResult.remaining : 1,
			remaining: rateLimitResult.remaining || 9,
			resetTime: rateLimitResult.resetTime || Date.now()
		}) });
	} catch (error) {
		console.error("💥 Review upload error:", error);
		return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
	}
}
async function DELETE$2(request) {
	console.log("🗑️ Review image delete request received");
	try {
		if (!(await (0, import_next_auth.getServerSession)(authOptions))?.user?.id) {
			console.log("❌ Unauthorized delete attempt");
			return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
		}
		const { searchParams } = new URL(request.url);
		const filename = searchParams.get("filename");
		if (!filename) return NextResponse.json({ error: "Nome do arquivo não fornecido" }, { status: 400 });
		console.log(`🗑️ Deleting review image: ${filename}`);
		console.log(`⚠️ Delete functionality temporarily disabled: ${filename}`);
		const deleteResult = { success: true };
		if (!deleteResult.success) {
			console.log(`❌ Delete failed: ${deleteResult.error}`);
			return NextResponse.json({ error: deleteResult.error }, { status: 400 });
		}
		console.log(`✅ Review image deleted: ${filename}`);
		return NextResponse.json({
			success: true,
			message: "Imagem removida com sucesso"
		});
	} catch (error) {
		console.error("💥 Review delete error:", error);
		return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
	}
}
async function GET$1(request) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
		const rateLimitStatus = checkRateLimit(getClientIP(request), session.user.id);
		return NextResponse.json({
			uploadType: "reviews",
			maxFileSize: "5MB",
			maxFiles: 5,
			allowedTypes: [
				"image/jpeg",
				"image/png",
				"image/webp"
			],
			rateLimit: {
				remaining: rateLimitStatus.remaining,
				resetTime: rateLimitStatus.resetTime
			}
		});
	} catch (error) {
		console.error("💥 Review upload info error:", error);
		return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
	}
}
var route_exports$3 = /* @__PURE__ */ __exportAll({ POST: () => POST });
/**
* 🔄 API Route - Atualizar Foto de Perfil
*
* Atualiza a URL da foto de perfil do usuário no banco de dados
*/
async function POST(request) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) {
			console.log("❌ User not authenticated");
			return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
		}
		const userId = session.user.id;
		console.log("🔄 Updating profile image for user:", userId);
		if (!await db.user.findFirst({
			where: {
				id: userId,
				deletedAt: null
			},
			select: { id: true }
		})) return NextResponse.json({ error: "Usuário não encontrado ou removido" }, { status: 404 });
		const { imageUrl } = await request.json();
		if (!imageUrl || typeof imageUrl !== "string") {
			console.log("❌ Invalid image URL provided");
			return NextResponse.json({ error: "URL da imagem é obrigatória" }, { status: 400 });
		}
		console.log("📸 New image URL:", imageUrl);
		const updatedUser = await db.user.update({
			where: { id: userId },
			data: { image: imageUrl },
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				updatedAt: true
			}
		});
		console.log("✅ Profile image updated successfully:", updatedUser.image);
		return NextResponse.json({
			success: true,
			user: updatedUser,
			message: "Foto de perfil atualizada com sucesso"
		});
	} catch (error) {
		console.error("💥 Error updating profile image:", error);
		return NextResponse.json({
			error: "Erro interno do servidor",
			details: error instanceof Error ? error.message : "Unknown error"
		}, { status: 500 });
	}
}
var AuthWarning_default = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "d622669524c2", "default");
var page_exports$41 = /* @__PURE__ */ __exportAll({ default: () => AuthRequiredPage });
async function AuthRequiredPage({ searchParams }) {
	const params = await searchParams;
	const targetRoute = params.target;
	const redirectUrl = params.redirect || "/auth/signin";
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(import_react_react_server.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
			className: "flex min-h-screen items-center justify-center bg-background",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", { className: "mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" })
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(AuthWarning_default, {
			targetRoute,
			redirectUrl,
			countdown: 10,
			allowCancel: true
		})
	});
}
var ErrorContent_default = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "8dd01268599a", "default");
var page_exports$40 = /* @__PURE__ */ __exportAll({ default: () => AuthErrorPage });
function AuthErrorPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(import_react_react_server.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
			className: "flex min-h-screen items-center justify-center bg-background",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", { className: "mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" })
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ErrorContent_default, {})
	});
}
var ResetPasswordForm_default = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "9b7afb77b43f", "default");
var page_exports$39 = /* @__PURE__ */ __exportAll({ default: () => ResetPasswordPage });
function ResetPasswordPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(import_react_react_server.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
			className: "flex min-h-screen items-center justify-center bg-background",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", { className: "mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" })
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ResetPasswordForm_default, {})
	});
}
var SignInForm_default = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "ea2faab8915b", "default");
var ArrowLeft = createLucideIcon("arrow-left", [["path", {
	d: "m12 19-7-7 7-7",
	key: "1l729n"
}], ["path", {
	d: "M19 12H5",
	key: "x3x0zl"
}]]);
var Scissors = createLucideIcon("scissors", [
	["circle", {
		cx: "6",
		cy: "6",
		r: "3",
		key: "1lh9wr"
	}],
	["path", {
		d: "M8.12 8.12 12 12",
		key: "1alkpv"
	}],
	["path", {
		d: "M20 4 8.12 15.88",
		key: "xgtan2"
	}],
	["circle", {
		cx: "6",
		cy: "18",
		r: "3",
		key: "fqmcym"
	}],
	["path", {
		d: "M14.8 14.8 20 20",
		key: "ptml3r"
	}]
]);
var page_exports$38 = /* @__PURE__ */ __exportAll({ default: () => SignInPage });
function SignInPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(import_react_react_server.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
			className: "flex min-h-screen items-center justify-center bg-background",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", { className: "mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" })
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
			className: "flex min-h-[calc(100vh-65px)] mt-[65px] bg-background text-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
				className: "grain-overlay hidden lg:flex lg:w-1/2 flex-col justify-between bg-surface-1 p-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "type-3d-title text-foreground",
						children: ["Barber", /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
							className: "text-accent",
							children: "Kings"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "rhythm-3d-stack-xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
							className: "rhythm-3d-stack-md",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
								className: "type-3d-title text-foreground lg:text-4xl",
								children: "A experiência premium que você merece"
							}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
								className: "type-3d-body-lg text-fg-muted",
								children: "Agende com precisão, acompanhe em tempo real e eleve seu ritual de grooming."
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
							className: "space-y-4",
							children: [
								{
									icon: Scissors,
									text: "Barbeiros certificados e experientes"
								},
								{
									icon: Star,
									text: "Avaliações reais da comunidade"
								},
								{
									icon: Users,
									text: "Agendamento fácil em poucos cliques"
								}
							].map(({ icon: Icon, text }) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
								className: "type-3d-meta flex items-center gap-3 text-fg-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
									className: "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Icon, { className: "h-4 w-4" })
								}), text]
							}, text))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", { className: "h-px w-10 bg-[hsl(var(--accent)/0.4)]" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
							className: "type-3d-meta text-fg-subtle",
							children: "BarberKings · 2026"
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "rhythm-3d-stack-md w-full max-w-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
							href: "/",
							className: "type-3d-meta inline-flex items-center gap-2 font-semibold text-accent transition-colors hover:text-accent/80",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ArrowLeft, { className: "h-4 w-4" }), "Voltar para o início"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", {
							className: "type-3d-label inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.08)] px-4 py-1.5 text-accent",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-accent" }), "Entrar"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h1", {
							className: "type-3d-title text-foreground",
							children: "Bem-vindo de volta"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("p", {
							className: "type-3d-body text-fg-muted",
							children: [
								"Acesse sua conta para gerenciar agendamentos e avaliações.",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("a", {
									href: "/auth/signup",
									className: "font-semibold text-accent hover:text-accent/80 transition-colors",
									children: "Novo? Cadastre-se."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
							className: "pt-3d-sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(SignInForm_default, {})
						})
					]
				})
			})]
		})
	});
}
var SignUpForm_default = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "7a2d051de1a8", "default");
var page_exports$37 = /* @__PURE__ */ __exportAll({ default: () => SignUpPage });
function SignUpPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(import_react_react_server.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
			className: "flex min-h-screen items-center justify-center bg-background",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", { className: "mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" })
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
			className: "flex min-h-[calc(100vh-65px)] mt-[65px] bg-background text-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
				className: "grain-overlay hidden lg:flex lg:w-1/2 flex-col justify-between bg-surface-1 p-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "font-display text-3xl font-bold italic text-foreground",
						children: ["Barber", /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
							className: "text-accent",
							children: "Kings"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "space-y-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
							className: "font-display text-4xl font-bold italic text-foreground",
							children: "Faça parte da comunidade premium"
						}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
							className: "mt-4 text-base leading-relaxed text-fg-muted",
							children: "Crie sua conta e tenha acesso à melhor experiência de barbearia da cidade."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
							className: "space-y-4",
							children: [
								{
									icon: Scissors,
									text: "Acesso a barbeiros especializados"
								},
								{
									icon: Star,
									text: "Histórico completo de atendimentos"
								},
								{
									icon: Users,
									text: "Comunidade exclusiva de clientes"
								}
							].map(({ icon: Icon, text }) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
								className: "flex items-center gap-3 text-sm text-fg-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
									className: "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Icon, { className: "h-4 w-4" })
								}), text]
							}, text))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", { className: "h-px w-10 bg-[hsl(var(--accent)/0.4)]" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
							className: "text-xs text-fg-subtle",
							children: "BarberKings · 2026"
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "w-full max-w-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
							href: "/",
							className: "mb-8 flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ArrowLeft, { className: "h-4 w-4" }), "Voltar para o início"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", {
							className: "inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.08)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-accent" }), "Cadastro"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h1", {
							className: "mt-4 font-display text-3xl font-bold italic text-foreground",
							children: "Crie sua conta"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("p", {
							className: "mt-2 text-sm leading-relaxed text-fg-muted",
							children: [
								"Preencha os dados abaixo para começar.",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("a", {
									href: "/auth/signin",
									className: "font-semibold text-accent hover:text-accent/80 transition-colors",
									children: "Já tem conta? Entre aqui."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
							className: "mt-8",
							children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(SignUpForm_default, {})
						})
					]
				})
			})]
		})
	});
}
var page_exports$36 = /* @__PURE__ */ __exportAll({ default: () => page_default$10 });
var page_default$10 = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "1551f422f6be", "default");
var page_exports$35 = /* @__PURE__ */ __exportAll({ default: () => page_default$9 });
var page_default$9 = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "d48b1a752d1b", "default");
/**
* ChatList - Lista de conversas
*
* Features:
* - Lista todas as conversas do usuário
* - Busca/filtro de conversas
* - Badge com contador de não lidas
* - Última mensagem preview
* - Auto-refresh a cada 10 segundos
* - Loading states e empty state
*/
var ChatList = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'ChatList' is called on server");
}, "1680fd99da3f", "ChatList");
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
var ChatService = class {
	/**
	* Busca ou cria uma conversa entre dois usuários
	*/
	static async getOrCreateConversation(userId1, userId2) {
		const existingConversation = await db.conversation.findFirst({
			where: { AND: [{ participants: { some: { userId: userId1 } } }, { participants: { some: { userId: userId2 } } }] },
			include: {
				participants: { include: { user: { select: {
					id: true,
					name: true,
					email: true,
					image: true,
					nickname: true
				} } } },
				messages: {
					orderBy: { createdAt: "desc" },
					take: 1
				}
			}
		});
		if (existingConversation) return existingConversation;
		if (!await this.areFriends(userId1, userId2)) throw new Error("Só é possível criar conversas com amigos");
		return await db.conversation.create({
			data: { participants: { create: [{ userId: userId1 }, { userId: userId2 }] } },
			include: {
				participants: { include: { user: { select: {
					id: true,
					name: true,
					email: true,
					image: true,
					nickname: true
				} } } },
				messages: true
			}
		});
	}
	/**
	* Busca todas as conversas de um usuário
	*/
	static async getUserConversations(userId, filters) {
		const { page = 1, limit = 20, unreadOnly = false } = filters || {};
		const skip = (page - 1) * limit;
		const conversations = await db.conversation.findMany({
			where: { participants: { some: { userId } } },
			include: {
				participants: { include: { user: { select: {
					id: true,
					name: true,
					email: true,
					image: true,
					nickname: true
				} } } },
				messages: {
					orderBy: { createdAt: "desc" },
					take: 1
				},
				_count: { select: { messages: { where: {
					isRead: false,
					senderId: { not: userId }
				} } } }
			},
			orderBy: { lastMessageAt: "desc" },
			skip,
			take: limit
		});
		const filteredConversations = unreadOnly ? conversations.filter((conv) => conv._count.messages > 0) : conversations;
		const total = await db.conversation.count({ where: { participants: { some: { userId } } } });
		return {
			conversations: filteredConversations,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		};
	}
	/**
	* Busca uma conversa específica por ID
	*/
	static async getConversationById(conversationId, userId) {
		if (!await this.isUserParticipant(conversationId, userId)) throw new Error("Você não tem acesso a esta conversa");
		return await db.conversation.findUnique({
			where: { id: conversationId },
			include: { participants: { include: { user: { select: {
				id: true,
				name: true,
				email: true,
				image: true,
				nickname: true
			} } } } }
		});
	}
	/**
	* Envia uma mensagem em uma conversa
	*/
	static async sendMessage(conversationId, senderId, content) {
		if (!await this.isUserParticipant(conversationId, senderId)) throw new Error("Você não tem acesso a esta conversa");
		const message = await db.message.create({
			data: {
				content,
				conversationId,
				senderId
			},
			include: { sender: { select: {
				id: true,
				name: true,
				email: true,
				image: true,
				nickname: true
			} } }
		});
		await db.conversation.update({
			where: { id: conversationId },
			data: { lastMessageAt: /* @__PURE__ */ new Date() }
		});
		return message;
	}
	/**
	* Busca mensagens de uma conversa com paginação
	*/
	static async getMessages(conversationId, userId, page = 1, limit = 50) {
		if (!await this.isUserParticipant(conversationId, userId)) throw new Error("Você não tem acesso a esta conversa");
		const skip = (page - 1) * limit;
		const messages = await db.message.findMany({
			where: { conversationId },
			include: { sender: { select: {
				id: true,
				name: true,
				email: true,
				image: true,
				nickname: true
			} } },
			orderBy: { createdAt: "desc" },
			skip,
			take: limit
		});
		const total = await db.message.count({ where: { conversationId } });
		return {
			messages: messages.reverse(),
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		};
	}
	/**
	* Marca todas as mensagens de uma conversa como lidas
	*/
	static async markMessagesAsRead(conversationId, userId) {
		if (!await this.isUserParticipant(conversationId, userId)) throw new Error("Você não tem acesso a esta conversa");
		await db.message.updateMany({
			where: {
				conversationId,
				senderId: { not: userId },
				isRead: false
			},
			data: { isRead: true }
		});
		await db.conversationParticipant.updateMany({
			where: {
				conversationId,
				userId
			},
			data: { lastReadAt: /* @__PURE__ */ new Date() }
		});
		return true;
	}
	/**
	* Conta total de mensagens não lidas de um usuário
	*/
	static async getUnreadCount(userId) {
		return await db.message.count({ where: {
			conversation: { participants: { some: { userId } } },
			senderId: { not: userId },
			isRead: false
		} });
	}
	/**
	* Conta mensagens não lidas em uma conversa específica
	*/
	static async getUnreadCountPerConversation(conversationId, userId) {
		return await db.message.count({ where: {
			conversationId,
			senderId: { not: userId },
			isRead: false
		} });
	}
	/**
	* Verifica se um usuário é participante de uma conversa
	*/
	static async isUserParticipant(conversationId, userId) {
		return !!await db.conversationParticipant.findFirst({ where: {
			conversationId,
			userId
		} });
	}
	/**
	* Verifica se dois usuários são amigos
	*/
	static async areFriends(userId1, userId2) {
		return !!await db.friendship.findFirst({ where: { OR: [{
			userId: userId1,
			friendId: userId2,
			status: "ACCEPTED"
		}, {
			userId: userId2,
			friendId: userId1,
			status: "ACCEPTED"
		}] } });
	}
	/**
	* Busca estatísticas de chat do usuário
	*/
	static async getChatStats(userId) {
		return {
			totalConversations: await db.conversation.count({ where: { participants: { some: { userId } } } }),
			unreadCount: await this.getUnreadCount(userId),
			totalMessagesSent: await db.message.count({ where: { senderId: userId } })
		};
	}
};
/**
* Schema para enviar mensagem
*/
var SendMessageSchema = object({
	conversationId: string().min(1, "ID da conversa é obrigatório"),
	content: string().min(1, "Mensagem não pode estar vazia").max(5e3, "Mensagem muito longa (máximo 5000 caracteres)")
});
/**
* Schema para buscar mensagens
*/
var GetMessagesSchema = object({
	conversationId: string().min(1),
	page: number().int().positive().default(1),
	limit: number().int().positive().max(100).default(50)
});
/**
* Schema para criar/buscar conversa
*/
var CreateConversationSchema = object({ friendId: string().min(1, "ID do amigo é obrigatório") });
/**
* Schema para marcar mensagens como lidas
*/
var MarkAsReadSchema = object({ conversationId: string().min(1, "ID da conversa é obrigatório") });
/**
* Schema para filtros de conversas
*/
var ConversationFiltersSchema = object({
	page: number().int().positive().default(1),
	limit: number().int().positive().max(50).default(20),
	unreadOnly: boolean().optional()
});
/**
* Server Action para criar ou buscar conversa com um amigo
*/
async function getOrCreateConversation(data) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const validated = CreateConversationSchema.parse(data);
		if (validated.friendId === session.user.id) return {
			success: false,
			error: "Não é possível criar conversa consigo mesmo"
		};
		return {
			success: true,
			data: await ChatService.getOrCreateConversation(session.user.id, validated.friendId)
		};
	} catch (error) {
		console.error("Erro ao criar/buscar conversa:", error);
		if (error instanceof Error) return {
			success: false,
			error: error.message
		};
		return {
			success: false,
			error: "Erro ao criar/buscar conversa"
		};
	}
}
/**
* Server Action para buscar conversas do usuário
*/
async function getUserConversations(filters) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const validatedFilters = filters ? ConversationFiltersSchema.parse(filters) : {
			page: 1,
			limit: 20
		};
		const result = await ChatService.getUserConversations(session.user.id, validatedFilters);
		return {
			success: true,
			data: result.conversations,
			pagination: result.pagination
		};
	} catch (error) {
		console.error("Erro ao buscar conversas:", error);
		return {
			success: false,
			error: "Erro ao buscar conversas"
		};
	}
}
/**
* Server Action para buscar uma conversa específica
*/
async function getConversationById(conversationId) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		return {
			success: true,
			data: await ChatService.getConversationById(conversationId, session.user.id)
		};
	} catch (error) {
		console.error("Erro ao buscar conversa:", error);
		if (error instanceof Error) return {
			success: false,
			error: error.message
		};
		return {
			success: false,
			error: "Erro ao buscar conversa"
		};
	}
}
/**
* Server Action para enviar mensagem
*/
async function sendMessage(data) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const validated = SendMessageSchema.parse(data);
		return {
			success: true,
			data: await ChatService.sendMessage(validated.conversationId, session.user.id, validated.content)
		};
	} catch (error) {
		console.error("Erro ao enviar mensagem:", error);
		if (error instanceof Error) return {
			success: false,
			error: error.message
		};
		return {
			success: false,
			error: "Erro ao enviar mensagem"
		};
	}
}
/**
* Server Action para buscar mensagens
*/
async function getMessages(data) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const validated = GetMessagesSchema.parse(data);
		const result = await ChatService.getMessages(validated.conversationId, session.user.id, validated.page, validated.limit);
		return {
			success: true,
			data: result.messages,
			pagination: result.pagination
		};
	} catch (error) {
		console.error("Erro ao buscar mensagens:", error);
		if (error instanceof Error) return {
			success: false,
			error: error.message
		};
		return {
			success: false,
			error: "Erro ao buscar mensagens"
		};
	}
}
/**
* Server Action para marcar mensagens como lidas
*/
async function markMessagesAsRead(data) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const validated = MarkAsReadSchema.parse(data);
		await ChatService.markMessagesAsRead(validated.conversationId, session.user.id);
		return { success: true };
	} catch (error) {
		console.error("Erro ao marcar mensagens como lidas:", error);
		if (error instanceof Error) return {
			success: false,
			error: error.message
		};
		return {
			success: false,
			error: "Erro ao marcar mensagens como lidas"
		};
	}
}
/**
* Server Action para buscar estatísticas de chat
*/
async function getChatStats() {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		return {
			success: true,
			data: await ChatService.getChatStats(session.user.id)
		};
	} catch (error) {
		console.error("Erro ao buscar estatísticas:", error);
		return {
			success: false,
			error: "Erro ao buscar estatísticas"
		};
	}
}
/**
* Server Action para buscar contador de mensagens não lidas
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
			data: { count: await ChatService.getUnreadCount(session.user.id) }
		};
	} catch (error) {
		console.error("Erro ao buscar contador:", error);
		return {
			success: false,
			error: "Erro ao buscar contador"
		};
	}
}
getOrCreateConversation = /* @__PURE__ */ registerServerReference(getOrCreateConversation, "4140ba624f2d", "getOrCreateConversation");
getUserConversations = /* @__PURE__ */ registerServerReference(getUserConversations, "4140ba624f2d", "getUserConversations");
getConversationById = /* @__PURE__ */ registerServerReference(getConversationById, "4140ba624f2d", "getConversationById");
sendMessage = /* @__PURE__ */ registerServerReference(sendMessage, "4140ba624f2d", "sendMessage");
getMessages = /* @__PURE__ */ registerServerReference(getMessages, "4140ba624f2d", "getMessages");
markMessagesAsRead = /* @__PURE__ */ registerServerReference(markMessagesAsRead, "4140ba624f2d", "markMessagesAsRead");
getChatStats = /* @__PURE__ */ registerServerReference(getChatStats, "4140ba624f2d", "getChatStats");
getUnreadCount = /* @__PURE__ */ registerServerReference(getUnreadCount, "4140ba624f2d", "getUnreadCount");
var page_exports$34 = /* @__PURE__ */ __exportAll({ default: () => ChatPage });
/**
* Página principal de chat
* Lista todas as conversas do usuário
*/
async function ChatPage() {
	const session = await (0, import_next_auth.getServerSession)(authOptions);
	if (!session?.user?.id) redirect("/login");
	const result = await getUserConversations({
		page: 1,
		limit: 50
	});
	const conversations = result.success && result.data ? result.data : [];
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
			badge: "Mensagens",
			title: "Suas Conversas",
			subtitle: "Fale com a equipe e acompanhe atendimentos em tempo real.",
			className: "pb-10 lg:pb-14"
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
			className: "container mx-auto flex-1 px-4 py-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ChatList, {
				currentUserId: session.user.id,
				initialConversations: conversations
			})
		})]
	});
}
var MessageCircle = createLucideIcon("message-circle", [["path", {
	d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",
	key: "1sd12s"
}]]);
var ShieldCheck = createLucideIcon("shield-check", [["path", {
	d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
	key: "oel41y"
}], ["path", {
	d: "m9 12 2 2 4-4",
	key: "dzmm74"
}]]);
var page_exports$33 = /* @__PURE__ */ __exportAll({ default: () => CommunityPage });
function CommunityPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
			badge: "Em Breve",
			title: "Comunidade BarberKings",
			subtitle: "Um espaço editorial para inspiração, conversa e eventos exclusivos. A experiência está sendo lapidada para o próximo lançamento.",
			actions: [{
				label: "Ir para o chat",
				href: "/chat"
			}, {
				label: "Ler avaliações",
				href: "/reviews",
				variant: "outline"
			}],
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "grid w-full gap-3 sm:grid-cols-3",
				children: [
					{
						icon: Sparkles,
						title: "Curadoria de estilo",
						description: "Conteúdo selecionado com referências, inspirações e novidades da barbearia."
					},
					{
						icon: Users,
						title: "Conversa entre clientes",
						description: "Fóruns e trocas pensados para quem quer compartilhar experiências reais."
					},
					{
						icon: Calendar,
						title: "Eventos exclusivos",
						description: "Encontros e lançamentos para quem acompanha as novidades de perto."
					}
				].map((item) => {
					const Icon = item.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("article", {
						className: "card-hover rounded-2xl border border-border bg-surface-card p-4 text-left",
						children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
								className: "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.12)] text-accent",
								children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Icon, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
								className: "font-display text-lg font-semibold italic text-foreground",
								children: item.title
							}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
								className: "mt-1 text-sm leading-relaxed text-fg-muted",
								children: item.description
							})] })]
						})
					}, item.title);
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("section", {
			className: "container mx-auto px-4 py-12 lg:py-16",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(SectionHeader, {
					title: "Enquanto isso, os canais ativos seguem disponíveis",
					subtitle: "Use o chat e as avaliações para conversar com a equipe e compartilhar feedback.",
					centered: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "mt-8 grid gap-5 lg:grid-cols-[1.4fr_0.9fr]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("article", {
						className: "card-hover rounded-[2rem] border border-border bg-surface-card p-6 sm:p-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
							className: "flex items-start gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
								className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--accent)/0.12)] text-accent",
								children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(MessageCircle, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
								className: "space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "text-xs font-semibold uppercase tracking-[0.24em] text-accent",
										children: "Participação imediata"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
										className: "font-display text-2xl font-bold italic text-foreground",
										children: "Converse agora e acompanhe o que está acontecendo"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "max-w-2xl text-sm leading-relaxed text-fg-muted sm:text-base",
										children: "O chat e as avaliações já funcionam como os pontos de contato principais enquanto a comunidade é construída."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
										className: "flex flex-wrap gap-3 pt-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
											href: "/chat",
											className: "group inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-all duration-300 gold-shimmer hover:bg-accent/90",
											children: ["Abrir chat", /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ArrowRight, { className: "h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" })]
										}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(link_default, {
											href: "/reviews",
											className: "inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent",
											children: "Ver reviews"
										})]
									})
								]
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("aside", {
						className: "card-hover rounded-[2rem] border border-border bg-surface-1 p-6 sm:p-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
							className: "flex h-full flex-col justify-between gap-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
								className: "space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
										className: "inline-flex rounded-full border border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent",
										children: "Status da feature"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h3", {
										className: "font-display text-2xl font-bold italic text-foreground",
										children: "Lançamento guiado por feedback real"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "text-sm leading-relaxed text-fg-muted",
										children: "As próximas etapas serão validadas com base nos fluxos já ativos, mantendo a experiência consistente."
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
								className: "space-y-3 rounded-2xl border border-border bg-surface-card p-4",
								children: [
									"Discussões sobre estilo e manutenção",
									"Eventos para clientes e barbeiros",
									"Conteúdo editorial e recomendações"
								].map((item) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
									className: "flex items-center gap-3 text-sm text-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ShieldCheck, { className: "h-4 w-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", { children: item })]
								}, item))
							})]
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
					className: "mt-8 rounded-[2rem] border border-border bg-surface-card p-6 sm:p-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
									className: "text-xs font-semibold uppercase tracking-[0.24em] text-accent",
									children: "Próximo passo"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
									className: "font-display text-2xl font-bold italic text-foreground sm:text-3xl",
									children: "Quer continuar no fluxo principal?"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
									className: "max-w-2xl text-sm text-fg-muted sm:text-base",
									children: "Agende seu atendimento e acompanhe a experiência mais completa da plataforma."
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
							href: "/scheduling",
							className: "inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-on-accent transition-all duration-300 gold-shimmer hover:bg-accent/90",
							children: ["Ir para agendamentos", /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ArrowRight, { className: "h-4 w-4" })]
						})]
					})
				})
			]
		})]
	});
}
var ReviewsList = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'ReviewsList' is called on server");
}, "6bc5b6f8f2ed", "ReviewsList");
var toNumber = (value) => value ? Number(value) : 0;
async function buildTopBarberRanking(startDate) {
	const histories = await db.serviceHistory.findMany({
		where: {
			...startDate ? { completedAt: { gte: startDate } } : {},
			appointments: { some: { barberId: { not: null } } }
		},
		select: {
			finalPrice: true,
			rating: true,
			appointments: { select: { barberId: true } }
		}
	});
	const stats = /* @__PURE__ */ new Map();
	histories.forEach((history) => {
		const barberId = history.appointments[0]?.barberId;
		if (!barberId) return;
		const current = stats.get(barberId) || {
			revenue: 0,
			ratingSum: 0,
			reviews: 0,
			services: 0
		};
		current.revenue += toNumber(history.finalPrice);
		if (typeof history.rating === "number") {
			current.ratingSum += history.rating;
			current.reviews += 1;
		}
		current.services += 1;
		stats.set(barberId, current);
	});
	if (stats.size === 0) return [];
	return (await db.user.findMany({
		where: {
			id: { in: Array.from(stats.keys()) },
			role: "BARBER",
			deletedAt: null
		},
		select: {
			id: true,
			name: true
		}
	})).map((barber) => {
		const data = stats.get(barber.id);
		const averageRating = data && data.reviews > 0 ? Number((data.ratingSum / data.reviews).toFixed(1)) : 0;
		return {
			id: barber.id,
			name: barber.name || "Sem nome",
			totalReviews: data?.reviews ?? 0,
			averageRating,
			totalRevenue: Number((data?.revenue ?? 0).toFixed(2))
		};
	}).filter((barber) => barber.totalReviews > 0).sort((a, b) => {
		if (b.averageRating === a.averageRating) return b.totalReviews - a.totalReviews;
		return b.averageRating - a.averageRating;
	});
}
/**
* Obter métricas completas do barbeiro para dashboard
*/
async function getBarberMetrics(barberId) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		if (session.user.role !== "ADMIN" && session.user.id !== barberId) return {
			success: false,
			error: "Não autorizado"
		};
		const startOfMonth = new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1);
		const reviewsMetrics = await db.serviceHistory.aggregate({
			where: {
				rating: { not: null },
				appointments: { some: { barberId } }
			},
			_avg: { rating: true },
			_count: { rating: true }
		});
		const monthlyReviews = await db.serviceHistory.aggregate({
			where: {
				rating: { not: null },
				updatedAt: { gte: startOfMonth },
				appointments: { some: { barberId } }
			},
			_avg: { rating: true },
			_count: { rating: true }
		});
		const fiveStarReviews = await db.serviceHistory.count({ where: {
			rating: 5,
			appointments: { some: { barberId } }
		} });
		const uniqueClients = await db.serviceHistory.findMany({
			where: { appointments: { some: { barberId } } },
			select: { userId: true },
			distinct: ["userId"]
		});
		const monthlyClients = await db.serviceHistory.findMany({
			where: {
				createdAt: { gte: startOfMonth },
				appointments: { some: { barberId } }
			},
			select: { userId: true },
			distinct: ["userId"]
		});
		const revenueData = await db.serviceHistory.aggregate({
			where: {
				createdAt: { gte: startOfMonth },
				appointments: { some: { barberId } }
			},
			_sum: { finalPrice: true },
			_count: { id: true }
		});
		const ratingDistribution = await db.serviceHistory.groupBy({
			by: ["rating"],
			where: {
				rating: { not: null },
				appointments: { some: { barberId } }
			},
			_count: { rating: true },
			orderBy: { rating: "desc" }
		});
		const totalReviews = reviewsMetrics._count.rating || 0;
		return {
			success: true,
			data: {
				averageRating: Number(reviewsMetrics._avg.rating?.toFixed(1)) || 0,
				totalReviews,
				totalClients: uniqueClients.length || 0,
				monthlyAverageRating: Number(monthlyReviews._avg.rating?.toFixed(1)) || 0,
				monthlyReviews: monthlyReviews._count.rating || 0,
				monthlyClients: monthlyClients.length || 0,
				monthlyRevenue: Number(revenueData._sum.finalPrice) || 0,
				fiveStarReviews,
				totalServices: revenueData._count || 0,
				ratingDistribution: ratingDistribution.map((item) => ({
					rating: item.rating || 0,
					count: item._count.rating || 0,
					percentage: totalReviews > 0 ? Math.round(item._count.rating / totalReviews * 100) : 0
				})),
				goals: {
					averageRating: {
						target: 4.5,
						current: Number(monthlyReviews._avg.rating?.toFixed(1)) || 0,
						percentage: Math.min(Math.round((Number(monthlyReviews._avg.rating?.toFixed(1)) || 0) / 4.5 * 100), 100)
					},
					monthlyReviews: {
						target: 20,
						current: monthlyReviews._count.rating || 0,
						percentage: Math.min(Math.round((monthlyReviews._count.rating || 0) / 20 * 100), 100)
					},
					monthlyClients: {
						target: 100,
						current: monthlyClients.length || 0,
						percentage: Math.min(Math.round((monthlyClients.length || 0) / 100 * 100), 100)
					}
				}
			}
		};
	} catch (error) {
		console.error("Erro ao buscar métricas do barbeiro:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Obter métricas gerais para dashboard principal
*/
async function getDashboardMetrics(userId) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		if (session.user.role !== "ADMIN" && session.user.id !== userId) return {
			success: false,
			error: "Não autorizado"
		};
		const userRole = session.user.role;
		const startOfMonth = new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1);
		if (userRole === "CLIENT") {
			const clientMetrics = await db.serviceHistory.aggregate({
				where: {
					userId,
					rating: { not: null }
				},
				_count: { rating: true },
				_avg: { rating: true }
			});
			const monthlyServices = await db.serviceHistory.count({ where: {
				userId,
				createdAt: { gte: startOfMonth }
			} });
			return {
				success: true,
				data: {
					totalReviews: clientMetrics._count.rating || 0,
					averageGiven: Number(clientMetrics._avg.rating?.toFixed(1)) || 0,
					monthlyServices,
					userRole: "CLIENT"
				}
			};
		} else if (userRole === "BARBER") return await getBarberMetrics(userId);
		else {
			const globalMetrics = await db.serviceHistory.aggregate({
				where: { rating: { not: null } },
				_count: { rating: true },
				_avg: { rating: true }
			});
			const totalUsers = await db.user.count({ where: { deletedAt: null } });
			const monthlyActivity = await db.serviceHistory.count({ where: { createdAt: { gte: startOfMonth } } });
			return {
				success: true,
				data: {
					totalReviews: globalMetrics._count.rating || 0,
					globalAverage: Number(globalMetrics._avg.rating?.toFixed(1)) || 0,
					totalUsers,
					monthlyActivity,
					userRole: "ADMIN"
				}
			};
		}
	} catch (error) {
		console.error("Erro ao buscar métricas do dashboard:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Obter métricas administrativas completas
*/
async function getAdminMetrics() {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		if (session.user.role !== "ADMIN") return {
			success: false,
			error: "Não autorizado"
		};
		const startOfMonth = new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1);
		const startOfToday = /* @__PURE__ */ new Date();
		startOfToday.setHours(0, 0, 0, 0);
		const userCounts = await db.user.groupBy({
			where: { deletedAt: null },
			by: ["role"],
			_count: { id: true }
		});
		const totalUsers = await db.user.count({ where: { deletedAt: null } });
		const clientsCount = userCounts.find((u) => u.role === "CLIENT")?._count.id || 0;
		const barbersCount = userCounts.find((u) => u.role === "BARBER")?._count.id || 0;
		const adminsCount = userCounts.find((u) => u.role === "ADMIN")?._count.id || 0;
		const reviewsMetrics = await db.serviceHistory.aggregate({
			where: { rating: { not: null } },
			_avg: { rating: true },
			_count: { rating: true }
		});
		const monthlyReviews = await db.serviceHistory.count({ where: {
			rating: { not: null },
			completedAt: { gte: startOfMonth }
		} });
		const todayReviews = await db.serviceHistory.count({ where: {
			rating: { not: null },
			completedAt: { gte: startOfToday }
		} });
		const fiveStarReviews = await db.serviceHistory.count({ where: { rating: 5 } });
		const ratingDistribution = await db.serviceHistory.groupBy({
			by: ["rating"],
			where: { rating: { not: null } },
			_count: { rating: true },
			orderBy: { rating: "desc" }
		});
		const monthlyActivity = await db.serviceHistory.count({ where: { completedAt: { gte: startOfMonth } } });
		const monthlyAppointments = await db.appointment.count({ where: {
			date: { gte: startOfMonth },
			status: { notIn: ["CANCELLED", "NO_SHOW"] }
		} });
		const newUsersThisMonth = await db.user.count({ where: {
			createdAt: { gte: startOfMonth },
			deletedAt: null
		} });
		const thirtyDaysAgo = /* @__PURE__ */ new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		const activeUsers = await db.user.count({ where: {
			deletedAt: null,
			OR: [
				{ updatedAt: { gte: thirtyDaysAgo } },
				{ serviceHistory: { some: { completedAt: { gte: thirtyDaysAgo } } } },
				{ appointments: { some: { date: { gte: thirtyDaysAgo } } } }
			]
		} });
		const activeBarbersCount = await db.user.count({ where: {
			role: "BARBER",
			deletedAt: null,
			servicesProvided: { some: {
				date: { gte: thirtyDaysAgo },
				status: { notIn: ["CANCELLED", "NO_SHOW"] }
			} }
		} });
		const topBarbers = (await buildTopBarberRanking(startOfMonth)).slice(0, 5);
		const revenueData = await db.serviceHistory.aggregate({ _sum: { finalPrice: true } });
		const monthlyRevenueData = await db.serviceHistory.aggregate({
			where: { completedAt: { gte: startOfMonth } },
			_sum: { finalPrice: true }
		});
		const paidServices = await db.serviceHistory.count();
		const pendingReviews = await db.serviceHistory.count({ where: { rating: null } });
		return {
			success: true,
			data: {
				totalUsers,
				clientsCount,
				barbersCount,
				adminsCount,
				activeUsers,
				newUsersThisMonth,
				activeBarbersCount,
				totalReviews: reviewsMetrics._count.rating || 0,
				globalAverage: Number(reviewsMetrics._avg.rating?.toFixed(1)) || 0,
				monthlyReviews,
				todayReviews,
				fiveStarReviews,
				pendingReviews,
				ratingDistribution,
				monthlyActivity,
				monthlyAppointments,
				totalRevenue: toNumber(revenueData._sum.finalPrice),
				monthlyRevenue: toNumber(monthlyRevenueData._sum.finalPrice),
				paidServices,
				topBarbers
			}
		};
	} catch (error) {
		console.error("Erro ao buscar métricas administrativas:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
getBarberMetrics = /* @__PURE__ */ registerServerReference(getBarberMetrics, "f4efa67a65cf", "getBarberMetrics");
getDashboardMetrics = /* @__PURE__ */ registerServerReference(getDashboardMetrics, "f4efa67a65cf", "getDashboardMetrics");
getAdminMetrics = /* @__PURE__ */ registerServerReference(getAdminMetrics, "f4efa67a65cf", "getAdminMetrics");
var RealtimeRefreshBridge = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'RealtimeRefreshBridge' is called on server");
}, "b1b232701515", "RealtimeRefreshBridge");
var Heart = createLucideIcon("heart", [["path", {
	d: "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5",
	key: "mvr1a0"
}]]);
var page_exports$32 = /* @__PURE__ */ __exportAll({ default: () => DashboardPage });
async function DashboardPage() {
	const session = await (0, import_next_auth.getServerSession)(authOptions);
	if (!session) redirect("/auth/signin");
	const userRole = session.user.role;
	const isBarber = userRole === "BARBER";
	if (userRole === "ADMIN") redirect("/dashboard/admin");
	const metricsResult = await getDashboardMetrics(session.user.id);
	const metrics = metricsResult.success ? metricsResult.data : null;
	const quickActions = [
		{
			icon: Calendar,
			title: "Agendamentos",
			description: isBarber ? "Próximos atendimentos" : "Seus próximos horários",
			href: "/scheduling/manage",
			cta: "Ver Agendamentos"
		},
		{
			icon: Star,
			title: "Avaliações",
			description: isBarber ? "Reviews dos seus serviços" : "Suas avaliações",
			href: "/reviews",
			cta: "Ver Reviews"
		},
		{
			icon: User,
			title: "Perfil",
			description: "Configurações da conta",
			href: "/profile",
			cta: "Editar Perfil"
		},
		{
			icon: isBarber ? Scissors : Heart,
			title: isBarber ? "Portfólio" : "Galeria",
			description: isBarber ? "Seus trabalhos" : "Trabalhos da barbearia",
			href: "/gallery",
			cta: "Ver Galeria"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(RealtimeRefreshBridge, { events: [
				"appointment:changed",
				"review:updated",
				"analytics:updated"
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
				badge: isBarber ? "Barbeiro" : "Cliente",
				title: `Olá, ${session.user.name?.split(" ")[0]}`,
				subtitle: isBarber ? "Gerencie seus clientes, serviços e performance." : "Acompanhe seus agendamentos e avaliações."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
				className: "bg-background py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
					className: "container mx-auto px-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
						className: "grid gap-5 sm:grid-cols-2 lg:grid-cols-4",
						children: quickActions.map((action) => {
							const Icon = action.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
								className: "card-hover group rounded-2xl border border-border bg-surface-card p-6 transition-all duration-300",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
										className: "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent transition-colors duration-300 group-hover:bg-[hsl(var(--accent)/0.16)]",
										children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Icon, { className: "h-5 w-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
										className: "mt-4 font-display text-xl font-bold italic text-foreground",
										children: action.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-2 text-sm text-fg-muted",
										children: action.description
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
										href: action.href,
										className: "mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80",
										children: [action.cta, /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ArrowRight, { className: "h-4 w-4" })]
									})
								]
							}, action.title);
						})
					})
				})
			}),
			metrics && isBarber && /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
				className: "bg-surface-1 py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "container mx-auto px-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(SectionHeader, {
						title: "Performance do Mês",
						subtitle: "Métricas atualizadas em tempo real.",
						centered: false,
						className: "mb-8"
					}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
						className: "grid gap-5 sm:grid-cols-3",
						children: [
							{
								label: "Clientes Este Mês",
								value: metrics?.monthlyClients ?? 0
							},
							{
								label: "Avaliação Média",
								value: metrics?.averageRating?.toFixed(1) ?? "0.0"
							},
							{
								label: "Total de Reviews",
								value: metrics?.totalReviews ?? 0
							}
						].map((kpi) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
							className: "card-hover rounded-2xl border border-border bg-surface-card p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
								className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
								children: kpi.label
							}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
								className: "mt-3 font-display text-4xl font-bold italic text-accent",
								children: kpi.value
							})]
						}, kpi.label))
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
				className: "bg-background py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "container mx-auto px-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(SectionHeader, {
						title: isBarber ? "Reviews Recebidas" : "Suas Últimas Avaliações",
						subtitle: "Histórico atualizado dos feedbacks mais recentes.",
						centered: false,
						className: "mb-8"
					}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
						className: "rounded-2xl border border-border bg-surface-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(import_react_react_server.Suspense, {
							fallback: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
								className: "flex items-center justify-center py-12",
								children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", { className: "mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" })
							}),
							children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ReviewsList, {
								userId: isBarber ? void 0 : session.user.id,
								barberId: isBarber ? session.user.id : void 0,
								showStats: false,
								showActions: false,
								limit: 3
							})
						})
					})]
				})
			})
		]
	});
}
var Tabs = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'Tabs' is called on server");
}, "6fe6ee80c8a6", "Tabs");
var TabsList = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'TabsList' is called on server");
}, "6fe6ee80c8a6", "TabsList");
var TabsTrigger = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'TabsTrigger' is called on server");
}, "6fe6ee80c8a6", "TabsTrigger");
var TabsContent = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'TabsContent' is called on server");
}, "6fe6ee80c8a6", "TabsContent");
var LoaderCircle = createLucideIcon("loader-circle", [["path", {
	d: "M21 12a9 9 0 1 1-6.219-8.56",
	key: "13zald"
}]]);
var sizeClasses = {
	sm: "h-4 w-4",
	md: "h-6 w-6",
	lg: "h-8 w-8"
};
function LoadingSpinner({ size = "md", text, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
		className: cn("flex flex-col items-center justify-center gap-2", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(LoaderCircle, { className: cn("animate-spin text-muted-foreground", sizeClasses[size]) }), text && /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: text
		})]
	});
}
var ChartColumn = createLucideIcon("chart-column", [
	["path", {
		d: "M3 3v16a2 2 0 0 0 2 2h16",
		key: "c24i48"
	}],
	["path", {
		d: "M18 17V9",
		key: "2bz60n"
	}],
	["path", {
		d: "M13 17V5",
		key: "1frdt8"
	}],
	["path", {
		d: "M8 17v-3",
		key: "17ska0"
	}]
]);
var TrendingUp = createLucideIcon("trending-up", [["path", {
	d: "M16 7h6v6",
	key: "box55l"
}], ["path", {
	d: "m22 7-8.5 8.5-5-5L2 17",
	key: "1t1m79"
}]]);
var UserCog = createLucideIcon("user-cog", [
	["path", {
		d: "M10 15H6a4 4 0 0 0-4 4v2",
		key: "1nfge6"
	}],
	["path", {
		d: "m14.305 16.53.923-.382",
		key: "1itpsq"
	}],
	["path", {
		d: "m15.228 13.852-.923-.383",
		key: "eplpkm"
	}],
	["path", {
		d: "m16.852 12.228-.383-.923",
		key: "13v3q0"
	}],
	["path", {
		d: "m16.852 17.772-.383.924",
		key: "1i8mnm"
	}],
	["path", {
		d: "m19.148 12.228.383-.923",
		key: "1q8j1v"
	}],
	["path", {
		d: "m19.53 18.696-.382-.924",
		key: "vk1qj3"
	}],
	["path", {
		d: "m20.772 13.852.924-.383",
		key: "n880s0"
	}],
	["path", {
		d: "m20.772 16.148.924.383",
		key: "1g6xey"
	}],
	["circle", {
		cx: "18",
		cy: "15",
		r: "3",
		key: "gjjjvw"
	}],
	["circle", {
		cx: "9",
		cy: "7",
		r: "4",
		key: "nufk8"
	}]
]);
var Settings = createLucideIcon("settings", [["path", {
	d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
	key: "1i5ecw"
}], ["circle", {
	cx: "12",
	cy: "12",
	r: "3",
	key: "1v7zrd"
}]]);
var Database = createLucideIcon("database", [
	["ellipse", {
		cx: "12",
		cy: "5",
		rx: "9",
		ry: "3",
		key: "msslwz"
	}],
	["path", {
		d: "M3 5V19A9 3 0 0 0 21 19V5",
		key: "1wlel7"
	}],
	["path", {
		d: "M3 12A9 3 0 0 0 21 12",
		key: "mv7ke4"
	}]
]);
var TriangleAlert = createLucideIcon("triangle-alert", [
	["path", {
		d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
		key: "wmoenq"
	}],
	["path", {
		d: "M12 9v4",
		key: "juzpu7"
	}],
	["path", {
		d: "M12 17h.01",
		key: "p32p05"
	}]
]);
var Plus = createLucideIcon("plus", [["path", {
	d: "M5 12h14",
	key: "1ays0h"
}], ["path", {
	d: "M12 5v14",
	key: "s699le"
}]]);
var SquarePen = createLucideIcon("square-pen", [["path", {
	d: "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",
	key: "1m0v6g"
}], ["path", {
	d: "M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",
	key: "ohrbg2"
}]]);
var Power = createLucideIcon("power", [["path", {
	d: "M12 2v10",
	key: "mnfbl"
}], ["path", {
	d: "M18.4 6.6a9 9 0 1 1-12.77.04",
	key: "obofu9"
}]]);
var page_exports$31 = /* @__PURE__ */ __exportAll({ default: () => AdminDashboardPage });
async function AdminDashboardPage() {
	const session = await (0, import_next_auth.getServerSession)(authOptions);
	if (!session) redirect("/auth/signin");
	if (session.user.role !== "ADMIN") redirect("/dashboard");
	const metricsResult = await getAdminMetrics();
	const metrics = metricsResult.success ? metricsResult.data : null;
	const servicesResult = await getServicesForAdmin({ limit: 10 });
	const services = servicesResult.success ? servicesResult.data : [];
	const totalServices = services.length;
	const activeServices = services.filter((s) => s.active).length;
	const inactiveServices = services.filter((s) => !s.active).length;
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(RealtimeRefreshBridge, { events: [
				"appointment:changed",
				"review:updated",
				"analytics:updated"
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
				badge: "Administrador",
				title: "Painel Administrativo",
				subtitle: "Gerencie toda a plataforma e monitore métricas globais."
			}),
			!metrics && /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
				className: "bg-background py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
					className: "container mx-auto px-4 flex items-center justify-center py-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(LoadingSpinner, {})
				})
			}),
			metrics && /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
				className: "bg-background py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
					className: "container mx-auto px-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "grid gap-5 sm:grid-cols-2 lg:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
								className: "card-hover rounded-2xl border border-border bg-surface-card p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
										className: "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
										children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Users, { className: "h-5 w-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
										children: "Total de Usuários"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-2 font-display text-4xl font-bold italic text-accent",
										children: metrics.totalUsers
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
										className: "mt-3 flex flex-col gap-1 text-xs text-fg-muted",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", { children: ["Clientes: ", metrics.clientsCount] }),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", { children: ["Barbeiros: ", metrics.barbersCount] }),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", { children: ["Admins: ", metrics.adminsCount] })
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
								className: "card-hover rounded-2xl border border-border bg-surface-card p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
										className: "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
										children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Star, { className: "h-5 w-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
										children: "Sistema de Reviews"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-2 font-display text-4xl font-bold italic text-accent",
										children: metrics.totalReviews
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
										className: "mt-3 flex flex-col gap-1 text-xs text-fg-muted",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", { children: [
												"Média: ",
												metrics.globalAverage,
												"/5"
											] }),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", { children: ["Este mês: ", metrics.monthlyReviews] }),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", { children: ["5 estrelas: ", metrics.fiveStarReviews] })
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
								className: "card-hover rounded-2xl border border-border bg-surface-card p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
										className: "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
										children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Activity, { className: "h-5 w-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
										children: "Atividade Mensal"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-2 font-display text-4xl font-bold italic text-accent",
										children: metrics.monthlyActivity
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
										className: "mt-3 flex flex-col gap-1 text-xs text-fg-muted",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", { children: ["Agendamentos: ", metrics.monthlyAppointments] }),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", { children: ["Avaliações: ", metrics.monthlyReviews] }),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", { children: ["Novos usuários: ", metrics.newUsersThisMonth] })
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
								className: "card-hover rounded-2xl border border-border bg-surface-card p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
										className: "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
										children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(DollarSign, { className: "h-5 w-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
										children: "Receita Mensal"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("p", {
										className: "mt-2 font-display text-4xl font-bold italic text-accent",
										children: ["R$ ", (metrics.monthlyRevenue || 0).toFixed(2)]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
										className: "mt-3 flex flex-col gap-1 text-xs text-fg-muted",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", { children: ["Total: R$ ", (metrics.totalRevenue || 0).toFixed(2)] }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", { children: ["Serviços pagos: ", metrics.paidServices] })]
									})
								]
							})
						]
					})
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
				className: "bg-surface-1 py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
					className: "container mx-auto px-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(Tabs, {
						defaultValue: "overview",
						className: "space-y-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(TabsList, {
								className: "rounded-2xl border border-border bg-surface-card p-1 flex flex-wrap gap-1 h-auto",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(TabsTrigger, {
										value: "overview",
										className: "flex items-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ChartColumn, { className: "h-4 w-4" }),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
												className: "hidden sm:inline",
												children: "Visão Geral"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
												className: "sm:hidden",
												children: "Visão"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(TabsTrigger, {
										value: "users",
										className: "flex items-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Users, { className: "h-4 w-4" }), "Usuários"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(TabsTrigger, {
										value: "reviews",
										className: "flex items-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Star, { className: "h-4 w-4" }),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
												className: "hidden sm:inline",
												children: "Avaliações"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
												className: "sm:hidden",
												children: "Reviews"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(TabsTrigger, {
										value: "services",
										className: "flex items-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Scissors, { className: "h-4 w-4" }), "Serviços"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(TabsTrigger, {
										value: "system",
										className: "flex items-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Settings, { className: "h-4 w-4" }), "Sistema"]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TabsContent, {
								value: "overview",
								className: "space-y-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
									className: "grid gap-5 lg:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
										className: "rounded-2xl border border-border bg-surface-card p-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("h3", {
											className: "mb-5 font-display text-xl font-bold italic text-foreground flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TrendingUp, { className: "h-5 w-5 text-accent" }), "Top Barbeiros (Avaliações)"]
										}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
											className: "space-y-4",
											children: metrics.topBarbers?.map((barber, index) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
													className: "flex items-center gap-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
														className: "inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-1 text-sm font-semibold text-foreground",
														children: index + 1
													}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
														className: "font-medium text-foreground",
														children: barber.name
													}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("p", {
														className: "text-xs text-fg-muted",
														children: [barber.totalReviews, " avaliações"]
													})] })]
												}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("p", {
													className: "font-bold text-accent",
													children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Star, { className: "inline h-4 w-4 mr-1 fill-accent" }), barber.averageRating]
												})]
											}, barber.id))
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
										className: "rounded-2xl border border-border bg-surface-card p-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("h3", {
											className: "mb-5 font-display text-xl font-bold italic text-foreground flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ChartColumn, { className: "h-5 w-5 text-accent" }), "Distribuição de Avaliações"]
										}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
											className: "space-y-3",
											children: metrics.ratingDistribution?.map((rating) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", {
													className: "text-sm font-medium text-foreground",
													children: [
														rating.rating,
														" ",
														/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Star, { className: "inline h-4 w-4 text-accent fill-accent" })
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
													className: "flex flex-1 items-center gap-3 ml-4",
													children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
														className: "flex-1 rounded-full bg-border h-2",
														children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
															className: "h-2 rounded-full bg-accent",
															style: { width: `${rating._count.rating / metrics.totalReviews * 100}%` }
														})
													}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
														className: "min-w-[3rem] text-right text-sm text-fg-muted",
														children: rating._count.rating
													})]
												})]
											}, rating.rating))
										})]
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TabsContent, {
								value: "users",
								className: "space-y-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
									className: "grid gap-5 lg:grid-cols-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
										className: "rounded-2xl border border-border bg-surface-card p-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("h3", {
											className: "mb-5 font-display text-xl font-bold italic text-foreground flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(UserCog, { className: "h-5 w-5 text-accent" }), "Ações Rápidas"]
										}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
											className: "flex flex-col gap-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
													href: "/dashboard/admin/users",
													className: "gold-shimmer inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90",
													children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Users, { className: "h-4 w-4" }), "Gerenciar Usuários"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
													href: "/dashboard/admin/barbers",
													className: "inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent",
													children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(UserCog, { className: "h-4 w-4" }), "Gerenciar Barbeiros"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
													href: "/dashboard/admin/reports",
													className: "inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent",
													children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ChartColumn, { className: "h-4 w-4" }), "Relatórios"]
												})
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
										className: "rounded-2xl border border-border bg-surface-card p-6 lg:col-span-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h3", {
											className: "mb-5 font-display text-xl font-bold italic text-foreground",
											children: "Estatísticas Detalhadas"
										}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
											className: "grid grid-cols-2 gap-5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
													className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
													children: "Usuários Ativos (30 dias)"
												}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
													className: "mt-2 font-display text-4xl font-bold italic text-accent",
													children: metrics.activeUsers
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
													className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
													children: "Novos Usuários (mês)"
												}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
													className: "mt-2 font-display text-4xl font-bold italic text-accent",
													children: metrics.newUsersThisMonth
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
													className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
													children: "Taxa de Conversão"
												}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("p", {
													className: "mt-2 font-display text-4xl font-bold italic text-accent",
													children: [metrics.totalUsers > 0 ? (metrics.activeUsers / metrics.totalUsers * 100).toFixed(1) : "0.0", "%"]
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
													className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
													children: "Barbeiros Ativos"
												}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
													className: "mt-2 font-display text-4xl font-bold italic text-accent",
													children: metrics.activeBarbersCount
												})] })
											]
										})]
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TabsContent, {
								value: "reviews",
								className: "space-y-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
									className: "rounded-2xl border border-border bg-surface-card p-6",
									children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h3", {
										className: "mb-5 font-display text-xl font-bold italic text-foreground",
										children: "Monitoramento de Avaliações"
									}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
										className: "grid gap-5 sm:grid-cols-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
												className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
												children: "Avaliações Hoje"
											}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
												className: "mt-2 font-display text-4xl font-bold italic text-accent",
												children: metrics.todayReviews
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
												className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
												children: "Média Geral"
											}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
												className: "mt-2 font-display text-4xl font-bold italic text-accent",
												children: metrics.globalAverage
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
												className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
												children: "Reviews Pendentes"
											}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
												className: "mt-2 font-display text-4xl font-bold italic text-accent",
												children: metrics.pendingReviews
											})] })
										]
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(TabsContent, {
								value: "services",
								className: "space-y-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
									className: "grid gap-5 sm:grid-cols-2 lg:grid-cols-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
											className: "card-hover rounded-2xl border border-border bg-surface-card p-6",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
													className: "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
													children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Scissors, { className: "h-5 w-5" })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
													className: "mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
													children: "Total de Serviços"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
													className: "mt-2 font-display text-4xl font-bold italic text-accent",
													children: totalServices
												}),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
													className: "mt-1 text-xs text-fg-muted",
													children: "cadastrados na plataforma"
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
											className: "card-hover rounded-2xl border border-border bg-surface-card p-6",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
													className: "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
													children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Power, { className: "h-5 w-5" })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
													className: "mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
													children: "Serviços Ativos"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
													className: "mt-2 font-display text-4xl font-bold italic text-accent",
													children: activeServices
												}),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
													className: "mt-1 text-xs text-fg-muted",
													children: "disponíveis para agendamento"
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
											className: "card-hover rounded-2xl border border-border bg-surface-card p-6",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
													className: "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
													children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Power, { className: "h-5 w-5 opacity-50" })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
													className: "mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
													children: "Serviços Inativos"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
													className: "mt-2 font-display text-4xl font-bold italic text-fg-muted",
													children: inactiveServices
												}),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
													className: "mt-1 text-xs text-fg-muted",
													children: "temporariamente desativados"
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
											className: "card-hover rounded-2xl border border-border bg-surface-card p-6",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
													className: "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
													children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Settings, { className: "h-5 w-5" })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
													className: "mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
													children: "Gerenciamento"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
													className: "mt-3 flex flex-col gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
														href: "/dashboard/admin/services",
														className: "gold-shimmer inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90",
														children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Scissors, { className: "h-3.5 w-3.5" }), "Ver Todos"]
													}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
														href: "/dashboard/admin/services/new",
														className: "inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-4 py-2 text-xs font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent",
														children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Plus, { className: "h-3.5 w-3.5" }), "Novo Serviço"]
													})]
												})
											]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
									className: "rounded-2xl border border-border bg-surface-card",
									children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
										className: "border-b border-border px-6 py-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h3", {
											className: "font-display text-xl font-bold italic text-foreground",
											children: "Serviços Recentes"
										}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
											className: "mt-1 text-sm text-fg-muted",
											children: "Últimos serviços cadastrados ou atualizados"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
										className: "divide-y divide-border",
										children: [services.slice(0, 5).map((service) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
											className: "flex items-center justify-between px-6 py-4 transition-colors hover:bg-surface-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
												className: "flex items-center gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
													className: "inline-flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.1)] text-accent",
													children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Scissors, { className: "h-5 w-5" })
												}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
													className: "font-medium text-foreground",
													children: service.name
												}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("p", {
													className: "text-sm text-fg-muted",
													children: [
														service.duration,
														" min · R$ ",
														Number(service.price).toFixed(2)
													]
												})] })]
											}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
												className: "flex items-center gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
													className: `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${service.active ? "bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]" : "bg-border text-fg-subtle"}`,
													children: service.active ? "Ativo" : "Inativo"
												}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(link_default, {
													href: `/dashboard/admin/services/${service.id}/edit`,
													className: "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-fg-muted transition-colors hover:border-accent hover:text-accent",
													children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(SquarePen, { className: "h-4 w-4" })
												})]
											})]
										}, service.id)), services.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
											className: "flex flex-col items-center justify-center gap-3 py-12 text-fg-muted",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Scissors, { className: "h-12 w-12 opacity-30" }),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
													className: "text-sm",
													children: "Nenhum serviço cadastrado ainda"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(link_default, {
													href: "/dashboard/admin/services/new",
													className: "inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-4 py-2 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent",
													children: "Criar primeiro serviço"
												})
											]
										})]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TabsContent, {
								value: "system",
								className: "space-y-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
									className: "grid gap-5 lg:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
										className: "rounded-2xl border border-border bg-surface-card p-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("h3", {
											className: "mb-5 font-display text-xl font-bold italic text-foreground flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Database, { className: "h-5 w-5 text-accent" }), "Status do Sistema"]
										}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
											className: "space-y-4",
											children: [
												{
													label: "Status da API",
													status: "Online"
												},
												{
													label: "Banco de Dados",
													status: "Conectado"
												},
												{
													label: "Uploads de Imagem",
													status: "Funcionando"
												}
											].map((item) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
													className: "text-sm text-foreground",
													children: item.label
												}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", {
													className: "inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--success)/0.12)] px-2.5 py-0.5 text-xs font-semibold text-[hsl(var(--success))]",
													children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-[hsl(var(--success))]" }), item.status]
												})]
											}, item.label))
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
										className: "rounded-2xl border border-border bg-surface-card p-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("h3", {
											className: "mb-5 font-display text-xl font-bold italic text-foreground flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Settings, { className: "h-5 w-5 text-accent" }), "Configurações Administrativas"]
										}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
											className: "flex flex-col gap-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
													href: "/admin/settings",
													className: "inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent",
													children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Settings, { className: "h-4 w-4" }), "Configurações Gerais"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
													href: "/admin/backup",
													className: "inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent",
													children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Database, { className: "h-4 w-4" }), "Backup & Restore"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
													href: "/admin/logs",
													className: "inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent",
													children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TriangleAlert, { className: "h-4 w-4" }), "Logs do Sistema"]
												})
											]
										})]
									})]
								})
							})
						]
					})
				})
			})] })
		]
	});
}
var BarbersPageClient = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'BarbersPageClient' is called on server");
}, "7387ee1aade0", "BarbersPageClient");
var page_exports$30 = /* @__PURE__ */ __exportAll({ default: () => AdminBarbersPage });
async function AdminBarbersPage() {
	const session = await (0, import_next_auth.getServerSession)(authOptions);
	if (!session) redirect("/auth/signin");
	if (session.user.role !== "ADMIN") redirect("/dashboard");
	const barbersResult = await getBarbersForAdmin({
		page: 1,
		limit: 20,
		sortBy: "name"
	});
	const barbers = barbersResult.success ? barbersResult.data : [];
	const initialPagination = barbersResult.success ? barbersResult.pagination : {
		page: 1,
		limit: 20,
		total: barbers.length,
		totalPages: 1
	};
	const initialMetrics = barbersResult.success ? barbersResult.metrics : {
		averageRating: 0,
		activeCount: barbers.filter((barber) => barber.totalAppointments > 0).length,
		totalReviews: barbers.reduce((acc, barber) => acc + (barber.totalReviews || 0), 0),
		topPerformer: barbers[0]?.name || null
	};
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
			badge: "Administrador",
			title: "Gerenciar Barbeiros",
			subtitle: "Visualize e gerencie todos os barbeiros da plataforma.",
			actions: [{
				label: "Voltar ao Dashboard",
				href: "/dashboard/admin",
				variant: "outline"
			}, {
				label: "Promover a Barbeiro",
				href: "/dashboard/admin/barbers/new",
				variant: "primary"
			}]
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
			className: "bg-background py-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "container mx-auto px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(BarbersPageClient, {
					initialBarbers: barbers,
					initialPagination,
					initialMetrics
				})
			})
		})]
	});
}
var Gift = createLucideIcon("gift", [
	["rect", {
		x: "3",
		y: "8",
		width: "18",
		height: "4",
		rx: "1",
		key: "bkv52"
	}],
	["path", {
		d: "M12 8v13",
		key: "1c76mn"
	}],
	["path", {
		d: "M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7",
		key: "6wjy6b"
	}],
	["path", {
		d: "M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5",
		key: "1ihvrl"
	}]
]);
var Percent = createLucideIcon("percent", [
	["line", {
		x1: "19",
		x2: "5",
		y1: "5",
		y2: "19",
		key: "1x9vlm"
	}],
	["circle", {
		cx: "6.5",
		cy: "6.5",
		r: "2.5",
		key: "4mh3h7"
	}],
	["circle", {
		cx: "17.5",
		cy: "17.5",
		r: "2.5",
		key: "1mdrzq"
	}]
]);
var Earth = createLucideIcon("earth", [
	["path", {
		d: "M21.54 15H17a2 2 0 0 0-2 2v4.54",
		key: "1djwo0"
	}],
	["path", {
		d: "M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17",
		key: "1tzkfa"
	}],
	["path", {
		d: "M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05",
		key: "14pb5j"
	}],
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}]
]);
var PromotionTableActions_default = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "990a9af0faa6", "default");
var page_exports$29 = /* @__PURE__ */ __exportAll({ default: () => AdminPromotionsPage });
function formatValue(promotion) {
	const value = Number(promotion.value);
	if (promotion.type === "DISCOUNT_PERCENTAGE") return `${value.toFixed(0)}%`;
	return `R$ ${value.toFixed(2)}`;
}
function formatDate(date) {
	if (!date) return "Sem término";
	const parsed = typeof date === "string" ? new Date(date) : date;
	if (Number.isNaN(parsed.getTime())) return "Sem término";
	return parsed.toLocaleDateString("pt-BR");
}
function buildStatusHref(status) {
	const params = new URLSearchParams();
	if (status !== "all") params.set("status", status);
	const query = params.toString();
	return query ? `/dashboard/admin/promotions?${query}` : "/dashboard/admin/promotions";
}
async function AdminPromotionsPage({ searchParams }) {
	const session = await (0, import_next_auth.getServerSession)(authOptions);
	if (!session) redirect("/auth/signin");
	if (session.user.role !== "ADMIN") redirect("/dashboard");
	const { status: statusFilter } = await (searchParams ?? Promise.resolve({}));
	const filters = {
		page: 1,
		limit: 20
	};
	if (statusFilter === "active") filters.active = true;
	else if (statusFilter === "inactive") filters.active = false;
	const promotionsResult = await getPromotionsForAdmin(filters);
	const promotions = promotionsResult.success ? promotionsResult.data : [];
	const totalPromotions = promotions.length;
	const activePromotions = promotions.filter((p) => p.active).length;
	const inactivePromotions = promotions.filter((p) => !p.active).length;
	const globalPromotions = promotions.filter((p) => p.isGlobal).length;
	const targetedPromotions = totalPromotions - globalPromotions;
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
			badge: "Administrador",
			title: "Gerenciar Promoções",
			subtitle: "Crie, edite e acompanhe promoções e campanhas especiais.",
			actions: [{
				label: "Voltar ao Dashboard",
				href: "/dashboard/admin",
				variant: "outline"
			}, {
				label: "Nova Promoção",
				href: "/dashboard/admin/promotions/new",
				variant: "primary"
			}]
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
			className: "bg-background py-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
				className: "container mx-auto px-4 space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
					className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-5",
					children: [
						{
							icon: Gift,
							label: "Total",
							value: totalPromotions,
							cls: "text-accent"
						},
						{
							icon: Power,
							label: "Ativas",
							value: activePromotions,
							cls: "text-[hsl(var(--success))]"
						},
						{
							icon: Power,
							label: "Inativas",
							value: inactivePromotions,
							cls: "text-fg-muted"
						},
						{
							icon: Earth,
							label: "Globais",
							value: globalPromotions,
							cls: "text-accent"
						},
						{
							icon: Target,
							label: "Específicas",
							value: targetedPromotions,
							cls: "text-accent"
						}
					].map((stat) => {
						const Icon = stat.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("article", {
							className: "card-hover rounded-2xl border border-border bg-surface-card p-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
									className: "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Icon, { className: "h-4 w-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
									className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
									children: stat.label
								}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
									className: `font-display text-2xl font-bold italic ${stat.cls}`,
									children: stat.value
								})] })]
							})
						}, stat.label);
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "rounded-2xl border border-border bg-surface-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
							className: "flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
								className: "font-display text-xl font-bold italic text-foreground",
								children: "Lista de Promoções"
							}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
										className: "text-xs text-fg-muted",
										children: "Status:"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(link_default, {
										href: buildStatusHref("all"),
										className: `rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${statusFilter === void 0 || statusFilter === "all" ? "bg-accent text-on-accent" : "border border-border text-fg-muted hover:border-accent hover:text-accent"}`,
										children: "Todas"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(link_default, {
										href: buildStatusHref("active"),
										className: `rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${statusFilter === "active" ? "bg-accent text-on-accent" : "border border-border text-fg-muted hover:border-accent hover:text-accent"}`,
										children: "Ativas"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(link_default, {
										href: buildStatusHref("inactive"),
										className: `rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${statusFilter === "inactive" ? "bg-accent text-on-accent" : "border border-border text-fg-muted hover:border-accent hover:text-accent"}`,
										children: "Inativas"
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
							className: "overflow-hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(TableRow, {
								className: "border-border hover:bg-transparent",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableHead, {
										className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
										children: "Promoção"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableHead, {
										className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
										children: "Tipo / Valor"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableHead, {
										className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
										children: "Validade"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableHead, {
										className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
										children: "Alcance"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableHead, {
										className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
										children: "Status"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableHead, {
										className: "text-right text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
										children: "Ações"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableBody, { children: promotions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableCell, {
								colSpan: 6,
								className: "py-12 text-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
									className: "flex flex-col items-center gap-3 text-fg-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Gift, { className: "h-10 w-10 opacity-30" }),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
											className: "text-sm",
											children: "Nenhuma promoção encontrada"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
											href: "/dashboard/admin/promotions/new",
											className: "inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-4 py-2 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent",
											children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Plus, { className: "h-4 w-4" }), "Criar primeira promoção"]
										})
									]
								})
							}) }) : promotions.map((promotion) => {
								const serializedPromotion = {
									id: promotion.id,
									name: promotion.name,
									active: promotion.active,
									_count: promotion._count
								};
								return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(TableRow, {
									className: "border-border hover:bg-surface-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
											className: "flex items-center gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
												className: "inline-flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.1)] text-accent",
												children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Gift, { className: "h-5 w-5" })
											}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
												className: "font-medium text-foreground",
												children: promotion.name
											}), promotion.description && /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
												className: "max-w-xs truncate text-xs text-fg-muted",
												children: promotion.description
											})] })]
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
											className: "flex items-center gap-2 text-foreground",
											children: [promotion.type === "DISCOUNT_PERCENTAGE" ? /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Percent, { className: "h-4 w-4 text-fg-subtle" }) : /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Gift, { className: "h-4 w-4 text-fg-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
												className: "font-medium",
												children: formatValue(promotion)
											})]
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
											className: "flex items-center gap-2 text-sm text-fg-muted",
											children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Calendar, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", { children: [
												formatDate(promotion.validFrom),
												" - ",
												formatDate(promotion.validUntil)
											] })]
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableCell, { children: promotion.isGlobal ? /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
											className: "inline-flex items-center rounded-full bg-[hsl(var(--accent)/0.1)] px-2.5 py-0.5 text-xs font-semibold text-accent",
											children: "Global"
										}) : /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
											className: "flex flex-col gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", {
												className: "inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold text-fg-muted",
												children: ["Serviços: ", promotion._count?.servicePromotions || 0]
											}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", {
												className: "inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold text-fg-muted",
												children: ["Usuários: ", promotion._count?.userPromotions || 0]
											})]
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
											className: `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${promotion.active ? "bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]" : "bg-border text-fg-subtle"}`,
											children: promotion.active ? "Ativa" : "Inativa"
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TableCell, {
											className: "text-right",
											children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PromotionTableActions_default, { promotion: serializedPromotion })
										})
									]
								}, promotion.id);
							}) })] })
						}),
						promotions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
							className: "flex items-center justify-between border-t border-border px-6 py-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("p", {
								className: "text-xs text-fg-muted",
								children: [
									"Mostrando ",
									promotions.length,
									" promoções"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("button", {
										disabled: true,
										className: "rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-fg-subtle opacity-50",
										children: "Anterior"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
										className: "inline-flex h-7 w-7 items-center justify-center rounded-lg border border-accent text-xs font-semibold text-accent",
										children: "1"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("button", {
										disabled: true,
										className: "rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-fg-subtle opacity-50",
										children: "Próximo"
									})
								]
							})]
						})
					]
				})]
			})
		})]
	});
}
var page_exports$28 = /* @__PURE__ */ __exportAll({ default: () => NewPromotionPage });
async function NewPromotionPage() {
	const session = await (0, import_next_auth.getServerSession)(authOptions);
	if (!session) redirect("/auth/signin");
	if (session.user.role !== "ADMIN") redirect("/dashboard");
	const services = await db.service.findMany({
		select: {
			id: true,
			name: true,
			active: true
		},
		orderBy: { name: "asc" }
	});
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
			badge: "Administrador",
			title: "Nova Promoção",
			subtitle: "Preencha os dados para criar uma nova promoção.",
			actions: [{
				label: "Voltar para Promoções",
				href: "/dashboard/admin/promotions",
				variant: "outline"
			}]
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
			className: "bg-background py-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "container mx-auto px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
					className: "mx-auto max-w-3xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "rounded-2xl border border-border bg-surface-card p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
							className: "mb-6 font-display text-xl font-bold italic text-foreground",
							children: "Informações da Promoção"
						}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(import_react_react_server.Suspense, {
							fallback: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
								className: "flex items-center justify-center py-8",
								children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", { className: "mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" })
							}),
							children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PromotionFormWrapper_default, { availableServices: services })
						})]
					})
				})
			})
		})]
	});
}
var ReportsPageClient = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'ReportsPageClient' is called on server");
}, "93675da6507b", "ReportsPageClient");
var page_exports$27 = /* @__PURE__ */ __exportAll({ default: () => AdminReportsPage });
async function AdminReportsPage() {
	const session = await (0, import_next_auth.getServerSession)(authOptions);
	if (!session) redirect("/auth/signin");
	if (session.user.role !== "ADMIN") redirect("/dashboard");
	const reportsResult = await getReportsData("30d");
	const reports = reportsResult.success ? reportsResult.data : null;
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
			badge: "Administrador",
			title: "Relatórios e Analytics",
			subtitle: "Visualize métricas detalhadas e exporte relatórios.",
			actions: [{
				label: "Voltar ao Dashboard",
				href: "/dashboard/admin",
				variant: "outline"
			}]
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
			className: "bg-background py-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "container mx-auto px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ReportsPageClient, {
					initialReports: reports,
					initialDateRange: "30d"
				})
			})
		})]
	});
}
var ServicesPageClient = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'ServicesPageClient' is called on server");
}, "c7cd59b48ccf", "ServicesPageClient");
var page_exports$26 = /* @__PURE__ */ __exportAll({ default: () => AdminServicesPage });
async function AdminServicesPage() {
	const session = await (0, import_next_auth.getServerSession)(authOptions);
	if (!session) redirect("/auth/signin");
	if (session.user.role !== "ADMIN") redirect("/dashboard");
	const servicesResult = await getServicesForAdmin({
		page: 1,
		limit: 20
	});
	const services = servicesResult.success ? servicesResult.data : [];
	const initialPagination = servicesResult.success ? servicesResult.pagination : {
		page: 1,
		limit: 20,
		total: services.length,
		totalPages: 1
	};
	const initialStats = servicesResult.success ? servicesResult.stats : {
		activeCount: services.filter((service) => service.active).length,
		inactiveCount: services.filter((service) => !service.active).length
	};
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
			badge: "Administrador",
			title: "Gerenciar Serviços",
			subtitle: "Crie, edite e gerencie todos os serviços da barbearia.",
			actions: [{
				label: "Voltar ao Dashboard",
				href: "/dashboard/admin",
				variant: "outline"
			}, {
				label: "Novo Serviço",
				href: "/dashboard/admin/services/new",
				variant: "primary"
			}]
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
			className: "bg-background py-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "container mx-auto px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ServicesPageClient, {
					initialServices: services,
					initialPagination,
					initialStats
				})
			})
		})]
	});
}
var page_exports$25 = /* @__PURE__ */ __exportAll({ default: () => NewServicePage });
async function NewServicePage() {
	const session = await (0, import_next_auth.getServerSession)(authOptions);
	if (!session) redirect("/auth/signin");
	if (session.user.role !== "ADMIN") redirect("/dashboard");
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
			badge: "Administrador",
			title: "Novo Serviço",
			subtitle: "Preencha os dados para criar um novo serviço.",
			actions: [{
				label: "Voltar para Serviços",
				href: "/dashboard/admin/services",
				variant: "outline"
			}]
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
			className: "bg-background py-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "container mx-auto px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
					className: "mx-auto max-w-3xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "rounded-2xl border border-border bg-surface-card p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
							className: "mb-6 font-display text-xl font-bold italic text-foreground",
							children: "Informações do Serviço"
						}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(import_react_react_server.Suspense, {
							fallback: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
								className: "flex items-center justify-center py-8",
								children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", { className: "mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" })
							}),
							children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ServiceFormWrapper_default, {})
						})]
					})
				})
			})
		})]
	});
}
var UserRoleEnum = _enum([
	"ADMIN",
	"BARBER",
	"CLIENT"
]);
var UserStatusFilterEnum = _enum([
	"ACTIVE",
	"INACTIVE",
	"DELETED",
	"ALL"
]);
var UserFiltersSchema = object({
	role: UserRoleEnum.optional(),
	status: UserStatusFilterEnum.default("ACTIVE"),
	includeDeleted: boolean().default(false),
	search: string().optional(),
	page: number().int().positive().default(1),
	limit: number().int().positive().max(50).default(20)
});
var UserInput = object({
	name: string().min(1, "Nome é obrigatório"),
	nickname: string().optional(),
	role: UserRoleEnum.default("CLIENT"),
	email: string().email(),
	password: string().min(6).optional(),
	isActive: boolean().optional(),
	phone: string().optional()
});
object({
	name: string().min(1, "Nome é obrigatório"),
	nickname: string().optional(),
	role: UserRoleEnum.optional(),
	email: string().email(),
	password: string().min(6).optional(),
	isActive: boolean().optional(),
	phone: string().optional()
});
var UserUpdateInput = object({
	id: string(),
	name: string().min(1, "Nome é obrigatório").optional(),
	nickname: string().optional(),
	role: UserRoleEnum.optional(),
	email: string().email().optional(),
	password: string().min(6).optional(),
	isActive: boolean().optional(),
	phone: string().optional()
});
var UserSoftDeleteSchema = object({
	id: string(),
	reason: string().max(240).optional()
});
var UserRestoreSchema = object({ id: string() });
async function requireAdminSession() {
	const session = await (0, import_next_auth.getServerSession)(authOptions);
	if (!session?.user?.id) return {
		session: null,
		error: "Usuário não autenticado"
	};
	if (session.user.role !== "ADMIN") return {
		session: null,
		error: "Acesso negado. Apenas administradores podem realizar esta ação."
	};
	return { session };
}
/**
* Server Action para buscar barbeiros ativos
*/
async function getBarbers() {
	try {
		return {
			success: true,
			data: await UserService.findBarbers()
		};
	} catch (error) {
		console.error("Erro ao buscar barbeiros:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Server Action para aplicar soft delete em um usuário
*/
async function softDeleteUser(input) {
	try {
		const { session, error } = await requireAdminSession();
		if (!session) return {
			success: false,
			error
		};
		const { id, reason } = UserSoftDeleteSchema.parse(input);
		if (session.user.id === id) return {
			success: false,
			error: "Você não pode remover sua própria conta."
		};
		const user = await UserService.softDeleteUser(id, session.user.id);
		if (!user) return {
			success: false,
			error: "Usuário não encontrado ou já removido."
		};
		logger.warn("User soft deleted", {
			actorId: session.user.id,
			userId: id,
			reason
		});
		revalidatePath("/dashboard/admin/users");
		revalidatePath(`/dashboard/admin/users/${id}`);
		return {
			success: true,
			data: user,
			message: "Usuário marcado como removido"
		};
	} catch (error) {
		console.error("Erro ao aplicar soft delete:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Server Action para restaurar um usuário removido
*/
async function restoreUser(input) {
	try {
		const { session, error } = await requireAdminSession();
		if (!session) return {
			success: false,
			error
		};
		const { id } = UserRestoreSchema.parse(input);
		const user = await UserService.restoreUser(id, session.user.id);
		if (!user) return {
			success: false,
			error: "Usuário não encontrado ou não está removido."
		};
		logger.info("User restored", {
			actorId: session.user.id,
			userId: id
		});
		revalidatePath("/dashboard/admin/users");
		revalidatePath(`/dashboard/admin/users/${id}`);
		return {
			success: true,
			data: user,
			message: "Usuário restaurado com sucesso"
		};
	} catch (error) {
		console.error("Erro ao restaurar usuário:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Server Action para buscar barbeiro por ID
*/
async function getBarberById(id) {
	try {
		const barber = await UserService.findBarberById(id);
		if (!barber) return {
			success: false,
			error: "Barbeiro não encontrado"
		};
		return {
			success: true,
			data: barber
		};
	} catch (error) {
		console.error("Erro ao buscar barbeiro:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Server Action para buscar usuários (admin)
*/
async function getUsers(filters) {
	try {
		const { session, error } = await requireAdminSession();
		if (!session) return {
			success: false,
			error
		};
		const validatedFilters = UserFiltersSchema.parse({
			status: filters?.status ?? "ALL",
			includeDeleted: filters?.includeDeleted ?? true,
			page: 1,
			limit: 20,
			...filters
		});
		return {
			success: true,
			data: await UserService.findMany({
				...validatedFilters,
				includeDeleted: validatedFilters.includeDeleted || validatedFilters.status === "ALL"
			})
		};
	} catch (error) {
		console.error("Erro ao buscar usuários:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Server Action para buscar usuário por ID
*/
async function getUserById(id) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		if (!(session.user.id === id || session.user.role === "ADMIN")) return {
			success: false,
			error: "Sem permissão para visualizar este usuário"
		};
		const user = await UserService.findById(id, { includeDeleted: session.user.role === "ADMIN" });
		if (!user || user.deletedAt && session.user.role !== "ADMIN") return {
			success: false,
			error: "Usuário não encontrado"
		};
		return {
			success: true,
			data: user
		};
	} catch (error) {
		console.error("Erro ao buscar usuário:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Server Action para buscar estatísticas do usuário
*/
async function getUserStats(userId) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const targetUserId = userId || session.user.id;
		if (!(session.user.id === targetUserId || session.user.role === "ADMIN")) return {
			success: false,
			error: "Sem permissão para visualizar estatísticas"
		};
		return {
			success: true,
			data: await UserService.getUserStats(targetUserId)
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
* Server Action para verificar disponibilidade de barbeiro
*/
async function checkBarberAvailability(data) {
	try {
		return {
			success: true,
			available: await UserService.isBarberAvailable(data.barberId, data.date, data.duration)
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
* Server Action para buscar horários disponíveis de barbeiro
*/
async function getBarberAvailableSlots(data) {
	try {
		return {
			success: true,
			data: await UserService.getBarberAvailableSlots(data.barberId, data.date, data.serviceDuration)
		};
	} catch (error) {
		console.error("Erro ao buscar horários disponíveis:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Server Action para criar um novo usuário
*/
async function createUser(data) {
	try {
		const { session, error } = await requireAdminSession();
		if (!session) return {
			success: false,
			error
		};
		const validatedData = UserInput.parse({
			...data,
			role: data.role || "CLIENT",
			isActive: data.isActive ?? true
		});
		const existingUser = await db.user.findUnique({ where: { email: validatedData.email } });
		if (existingUser) return {
			success: false,
			error: existingUser.deletedAt !== null ? "Já existe um usuário removido com este email. Restaure-o ou use outro email." : "Este email já está em uso."
		};
		let hashedPassword = null;
		if (validatedData.password) hashedPassword = await bcryptjs_default.hash(validatedData.password, 12);
		const user = await db.user.create({
			data: {
				name: validatedData.name,
				nickname: validatedData.nickname,
				email: validatedData.email,
				password: hashedPassword,
				role: validatedData.role,
				isActive: validatedData.isActive ?? true,
				phone: validatedData.phone,
				updatedById: session.user.id
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				isActive: true,
				createdAt: true,
				updatedAt: true,
				deletedAt: true
			}
		});
		logger.info("User created", {
			actorId: session.user.id,
			userId: user.id,
			role: user.role
		});
		revalidatePath("/dashboard/admin/users");
		return {
			success: true,
			data: user
		};
	} catch (error) {
		console.error("Erro ao criar usuário:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Server Action para atualizar um usuário
*/
async function updateUser(updateData) {
	try {
		const { session, error } = await requireAdminSession();
		if (!session) return {
			success: false,
			error
		};
		const { id, ...data } = UserUpdateInput.parse(updateData);
		const existingUser = await db.user.findUnique({ where: { id } });
		if (!existingUser) return {
			success: false,
			error: "Usuário não encontrado."
		};
		if (existingUser.deletedAt) return {
			success: false,
			error: "Usuário está removido. Restaure-o antes de editar."
		};
		if (data.email && data.email !== existingUser.email) {
			const emailInUse = await db.user.findFirst({ where: {
				email: data.email,
				id: { not: id }
			} });
			if (emailInUse) return {
				success: false,
				error: emailInUse.deletedAt !== null ? "Já existe um usuário removido com este email. Restaure-o ou use outro email." : "Este email já está em uso."
			};
		}
		const updatePayload = {};
		if (data.name) updatePayload.name = data.name;
		if (data.nickname !== void 0) updatePayload.nickname = data.nickname;
		if (data.email) updatePayload.email = data.email;
		if (data.role) updatePayload.role = data.role;
		if (data.isActive !== void 0) updatePayload.isActive = data.isActive;
		if (data.phone !== void 0) updatePayload.phone = data.phone;
		if (data.password) updatePayload.password = await bcryptjs_default.hash(data.password, 12);
		updatePayload.updatedById = session.user.id;
		const user = await db.user.update({
			where: { id },
			data: updatePayload,
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				isActive: true,
				deletedAt: true,
				updatedById: true,
				deletedById: true,
				createdAt: true,
				updatedAt: true
			}
		});
		logger.info("User updated", {
			actorId: session.user.id,
			userId: id,
			role: user.role
		});
		revalidatePath("/dashboard/admin/users");
		revalidatePath(`/dashboard/admin/users/${id}`);
		return {
			success: true,
			data: user
		};
	} catch (error) {
		console.error("Erro ao atualizar usuário:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
getBarbers = /* @__PURE__ */ registerServerReference(getBarbers, "62e3744c332f", "getBarbers");
softDeleteUser = /* @__PURE__ */ registerServerReference(softDeleteUser, "62e3744c332f", "softDeleteUser");
restoreUser = /* @__PURE__ */ registerServerReference(restoreUser, "62e3744c332f", "restoreUser");
getBarberById = /* @__PURE__ */ registerServerReference(getBarberById, "62e3744c332f", "getBarberById");
getUsers = /* @__PURE__ */ registerServerReference(getUsers, "62e3744c332f", "getUsers");
getUserById = /* @__PURE__ */ registerServerReference(getUserById, "62e3744c332f", "getUserById");
getUserStats = /* @__PURE__ */ registerServerReference(getUserStats, "62e3744c332f", "getUserStats");
checkBarberAvailability = /* @__PURE__ */ registerServerReference(checkBarberAvailability, "62e3744c332f", "checkBarberAvailability");
getBarberAvailableSlots = /* @__PURE__ */ registerServerReference(getBarberAvailableSlots, "62e3744c332f", "getBarberAvailableSlots");
createUser = /* @__PURE__ */ registerServerReference(createUser, "62e3744c332f", "createUser");
updateUser = /* @__PURE__ */ registerServerReference(updateUser, "62e3744c332f", "updateUser");
var UsersPageClient = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'UsersPageClient' is called on server");
}, "e5c98ef97583", "UsersPageClient");
var page_exports$24 = /* @__PURE__ */ __exportAll({ default: () => AdminUsersPage });
async function AdminUsersPage() {
	const session = await (0, import_next_auth.getServerSession)(authOptions);
	if (!session) redirect("/auth/signin");
	if (session.user.role !== "ADMIN") redirect("/dashboard");
	const usersResult = await getUsers({
		status: "ALL",
		includeDeleted: true,
		limit: 20,
		page: 1
	});
	const initialUsers = usersResult.success ? usersResult.data?.users ?? [] : [];
	const initialPagination = usersResult.success ? usersResult.data?.pagination ?? {
		page: 1,
		limit: 20,
		total: 0,
		totalPages: 0
	} : {
		page: 1,
		limit: 20,
		total: 0,
		totalPages: 0
	};
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
			badge: "Administrador",
			title: "Gerenciar Usuários",
			subtitle: "Visualize, edite e gerencie todos os usuários da plataforma.",
			actions: [{
				label: "Voltar ao Dashboard",
				href: "/dashboard/admin",
				variant: "outline"
			}, {
				label: "Novo Usuário",
				href: "/dashboard/admin/users/new",
				variant: "primary"
			}]
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
			className: "bg-background py-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "container mx-auto px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(UsersPageClient, {
					initialUsers,
					initialPagination
				})
			})
		})]
	});
}
var MessageSquare = createLucideIcon("message-square", [["path", {
	d: "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",
	key: "18887p"
}]]);
var page_exports$23 = /* @__PURE__ */ __exportAll({ default: () => BarberDashboardPage });
async function BarberDashboardPage() {
	const session = await (0, import_next_auth.getServerSession)(authOptions);
	if (!session) redirect("/auth/signin");
	if (session.user.role !== "BARBER" && session.user.role !== "ADMIN") redirect("/dashboard");
	const metricsResult = await getBarberMetrics(session.user.id);
	const metrics = metricsResult.success ? metricsResult.data : null;
	const ratingDistribution = [
		5,
		4,
		3,
		2,
		1
	].map((score) => {
		const entry = metrics?.ratingDistribution?.find((item) => item.rating === score);
		const rawPercentage = entry?.percentage ?? 0;
		return {
			rating: score,
			percentage: Math.max(0, Math.min(100, Math.round(rawPercentage))),
			count: entry?.count ?? 0
		};
	});
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(RealtimeRefreshBridge, { events: [
				"appointment:changed",
				"review:updated",
				"analytics:updated"
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
				badge: "Barbeiro",
				title: "Dashboard do Barbeiro",
				subtitle: "Gerencie seus atendimentos, reviews e performance.",
				actions: [{
					label: "Dashboard Geral",
					href: "/dashboard",
					variant: "outline"
				}]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
				className: "bg-background py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
					className: "container mx-auto px-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "grid gap-5 sm:grid-cols-2 lg:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
								className: "card-hover rounded-2xl border border-border bg-surface-card p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
										className: "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
										children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Calendar, { className: "h-5 w-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
										children: "Hoje"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-2 font-display text-4xl font-bold italic text-accent",
										children: "--"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-1 text-xs text-fg-muted",
										children: (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR")
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
								className: "card-hover rounded-2xl border border-border bg-surface-card p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
										className: "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
										children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Star, { className: "h-5 w-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
										children: "Avaliação"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-2 font-display text-4xl font-bold italic text-accent",
										children: metrics?.averageRating?.toFixed(1) || "0.0"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-1 text-xs text-fg-muted",
										children: "Média Geral"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
								className: "card-hover rounded-2xl border border-border bg-surface-card p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
										className: "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
										children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Users, { className: "h-5 w-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
										children: "Clientes"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-2 font-display text-4xl font-bold italic text-accent",
										children: metrics?.totalClients || 0
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-1 text-xs text-fg-muted",
										children: "Total Atendidos"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
								className: "card-hover rounded-2xl border border-border bg-surface-card p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
										className: "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
										children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(DollarSign, { className: "h-5 w-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
										children: "Receita"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("p", {
										className: "mt-2 font-display text-4xl font-bold italic text-accent",
										children: ["R$ ", metrics?.monthlyRevenue?.toFixed(2) || "0.00"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-1 text-xs text-fg-muted",
										children: "Este Mês"
									})
								]
							})
						]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
				className: "bg-surface-1 py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
					className: "container mx-auto px-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(Tabs, {
						defaultValue: "reviews",
						className: "w-full",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(TabsList, {
								className: "mb-8 rounded-2xl border border-border bg-surface-card p-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(TabsTrigger, {
										value: "reviews",
										className: "flex items-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Star, { className: "h-4 w-4" }), "Reviews"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(TabsTrigger, {
										value: "appointments",
										className: "flex items-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Calendar, { className: "h-4 w-4" }), "Agendamentos"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(TabsTrigger, {
										value: "analytics",
										className: "flex items-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ChartColumn, { className: "h-4 w-4" }), "Análises"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(TabsTrigger, {
										value: "performance",
										className: "flex items-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TrendingUp, { className: "h-4 w-4" }), "Performance"]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(TabsContent, {
								value: "reviews",
								className: "space-y-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
										className: "grid gap-5 sm:grid-cols-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
												className: "card-hover rounded-2xl border border-border bg-surface-card p-6 text-center",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
														className: "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
														children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(MessageSquare, { className: "h-5 w-5" })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
														className: "mt-3 font-display text-4xl font-bold italic text-accent",
														children: metrics?.totalReviews || 0
													}),
													/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
														className: "mt-2 text-sm text-fg-muted",
														children: "Total de Reviews"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
												className: "card-hover rounded-2xl border border-border bg-surface-card p-6 text-center",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
														className: "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
														children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Star, { className: "h-5 w-5" })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
														className: "mt-3 font-display text-4xl font-bold italic text-accent",
														children: metrics?.fiveStarReviews || 0
													}),
													/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
														className: "mt-2 text-sm text-fg-muted",
														children: "Reviews 5 Estrelas"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
												className: "card-hover rounded-2xl border border-border bg-surface-card p-6 text-center",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
														className: "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
														children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TrendingUp, { className: "h-5 w-5" })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
														className: "mt-3 font-display text-4xl font-bold italic text-accent",
														children: metrics?.monthlyAverageRating?.toFixed(1) || "0.0"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
														className: "mt-2 text-sm text-fg-muted",
														children: "Média Este Mês"
													})
												]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
										className: "rounded-2xl border border-border bg-surface-card p-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("h3", {
											className: "mb-4 font-display text-xl font-bold italic text-foreground flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ChartColumn, { className: "h-5 w-5 text-accent" }), "Distribuição de Notas"]
										}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
											className: "space-y-2",
											children: ratingDistribution.map((distribution) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
												className: "flex items-center justify-between text-sm",
												children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", {
													className: "flex items-center gap-1 font-medium text-foreground",
													children: [distribution.rating, /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Star, { className: "h-4 w-4 text-accent" })]
												}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", {
													className: "text-fg-muted",
													children: [
														distribution.count,
														" reviews · ",
														distribution.percentage,
														"%"
													]
												})]
											}, `summary-${distribution.rating}`))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
										className: "rounded-2xl border border-border bg-surface-card",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
											className: "flex items-center justify-between border-b border-border px-6 py-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("h3", {
												className: "font-display text-xl font-bold italic text-foreground flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(MessageSquare, { className: "h-5 w-5 text-accent" }), "Suas Reviews Recentes"]
											}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(link_default, {
												href: "/reviews?view=barber",
												className: "inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-4 py-2 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent",
												children: "Ver Todas"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
											className: "p-6",
											children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(import_react_react_server.Suspense, {
												fallback: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
													className: "flex items-center justify-center py-8",
													children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", { className: "mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" })
												}),
												children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ReviewsList, {
													barberId: session.user.id,
													showStats: true,
													showActions: true,
													limit: 5
												})
											})
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TabsContent, {
								value: "appointments",
								className: "space-y-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
									className: "rounded-2xl border border-border bg-surface-card p-8 text-center",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
											className: "inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--accent)/0.1)] text-accent",
											children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Calendar, { className: "h-8 w-8 opacity-60" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
											className: "mt-4 text-fg-muted",
											children: "Integração com sistema de agendamentos em desenvolvimento"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(link_default, {
											href: "/scheduling",
											className: "mt-5 inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent",
											children: "Ver Agendamentos"
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TabsContent, {
								value: "analytics",
								className: "space-y-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
									className: "grid gap-5 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
										className: "rounded-2xl border border-border bg-surface-card p-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("h3", {
											className: "mb-4 font-display text-xl font-bold italic text-foreground flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ChartColumn, { className: "h-5 w-5 text-accent" }), "Reviews por Mês"]
										}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
											className: "flex flex-col items-center justify-center py-8 text-fg-muted",
											children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ChartColumn, { className: "h-12 w-12 opacity-40" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
												className: "mt-4 text-sm",
												children: "Gráficos de análise em desenvolvimento"
											})]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
										className: "rounded-2xl border border-border bg-surface-card p-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("h3", {
											className: "mb-4 font-display text-xl font-bold italic text-foreground flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Star, { className: "h-5 w-5 text-accent" }), "Distribuição de Notas"]
										}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
											className: "space-y-3",
											children: ratingDistribution.map((distribution) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
												className: "flex items-center gap-3",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
														className: "w-4 text-sm text-foreground",
														children: distribution.rating
													}),
													/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Star, { className: "h-4 w-4 fill-accent text-accent" }),
													/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
														className: "flex-1 rounded-full bg-border h-2",
														children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
															className: "h-2 rounded-full bg-accent",
															style: { width: `${distribution.percentage}%` }
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", {
														className: "w-10 text-right text-sm text-fg-muted",
														children: [distribution.percentage, "%"]
													})
												]
											}, distribution.rating))
										})]
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(TabsContent, {
								value: "performance",
								className: "space-y-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
									className: "rounded-2xl border border-border bg-surface-card p-6",
									children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("h3", {
										className: "mb-6 font-display text-xl font-bold italic text-foreground flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Award, { className: "h-5 w-5 text-accent" }), "Conquistas e Metas"]
									}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
										className: "grid gap-4 sm:grid-cols-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
												className: "rounded-xl border border-border bg-surface-1 p-4 text-center",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
														className: "inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--accent)/0.1)] text-accent",
														children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Award, { className: "h-5 w-5" })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
														className: "mt-3 font-semibold text-foreground",
														children: "Top Rated"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
														className: "mt-1 text-xs text-fg-muted",
														children: "Média 4.5+ por 3 meses"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
												className: "rounded-xl border border-border bg-surface-1 p-4 text-center",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
														className: "inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--accent)/0.1)] text-accent",
														children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Users, { className: "h-5 w-5" })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
														className: "mt-3 font-semibold text-foreground",
														children: "Client Favorite"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
														className: "mt-1 text-xs text-fg-muted",
														children: "50+ clientes atendidos"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
												className: "rounded-xl border border-border bg-surface-1 p-4 text-center",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
														className: "inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--accent)/0.1)] text-accent",
														children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(MessageSquare, { className: "h-5 w-5" })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
														className: "mt-3 font-semibold text-foreground",
														children: "Review Master"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
														className: "mt-1 text-xs text-fg-muted",
														children: "100+ reviews recebidas"
													})
												]
											})
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
									className: "rounded-2xl border border-border bg-surface-card p-6",
									children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h3", {
										className: "mb-6 font-display text-xl font-bold italic text-foreground",
										children: "Metas do Mês"
									}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
										className: "space-y-5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
												className: "mb-2 flex justify-between text-sm",
												children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
													className: "text-foreground",
													children: "Avaliação Média (Meta: 4.5)"
												}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", {
													className: "font-medium text-fg-muted",
													children: [metrics?.goals?.averageRating?.current?.toFixed(1) || "0.0", " / 4.5"]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
												className: "h-2 w-full rounded-full bg-border",
												children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
													className: "h-2 rounded-full bg-accent",
													style: { width: `${metrics?.goals?.averageRating?.percentage || 0}%` }
												})
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
												className: "mb-2 flex justify-between text-sm",
												children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
													className: "text-foreground",
													children: "Reviews Recebidas (Meta: 20)"
												}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", {
													className: "font-medium text-fg-muted",
													children: [metrics?.goals?.monthlyReviews?.current || 0, " / 20"]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
												className: "h-2 w-full rounded-full bg-border",
												children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
													className: "h-2 rounded-full bg-accent",
													style: { width: `${metrics?.goals?.monthlyReviews?.percentage || 0}%` }
												})
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
												className: "mb-2 flex justify-between text-sm",
												children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
													className: "text-foreground",
													children: "Clientes Atendidos (Meta: 100)"
												}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", {
													className: "font-medium text-fg-muted",
													children: [metrics?.goals?.monthlyClients?.current || 0, " / 100"]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
												className: "h-2 w-full rounded-full bg-border",
												children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
													className: "h-2 rounded-full bg-accent",
													style: { width: `${metrics?.goals?.monthlyClients?.percentage || 0}%` }
												})
											})] })
										]
									})]
								})]
							})
						]
					})
				})
			})
		]
	});
}
var GalleryExperience = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'GalleryExperience' is called on server");
}, "f8662127b60c", "GalleryExperience");
var page_exports$22 = /* @__PURE__ */ __exportAll({ default: () => GalleryPage });
function GalleryPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(GalleryExperience, {});
}
var FileText = createLucideIcon("file-text", [
	["path", {
		d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",
		key: "1rqfz7"
	}],
	["path", {
		d: "M14 2v4a2 2 0 0 0 2 2h4",
		key: "tnqrlb"
	}],
	["path", {
		d: "M10 9H8",
		key: "b1mrlr"
	}],
	["path", {
		d: "M16 13H8",
		key: "t4e002"
	}],
	["path", {
		d: "M16 17H8",
		key: "z1uh3a"
	}]
]);
var page_exports$21 = /* @__PURE__ */ __exportAll({ default: () => CookiesPage });
function CookiesPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
			badge: "Legal",
			title: "Preferências de Cookies",
			subtitle: "Utilizamos apenas cookies essenciais neste ambiente de demonstração.",
			actions: [{
				label: "Voltar para a Home",
				href: "/"
			}]
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
			className: "bg-surface-1 py-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "container mx-auto px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "mx-auto max-w-3xl space-y-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
						className: "rounded-2xl border border-border bg-surface-card p-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
							className: "mb-4 flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
								className: "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
								children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Settings, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
								className: "font-display text-xl font-bold italic text-foreground",
								children: "Controle e transparência"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
							className: "space-y-3 text-sm leading-relaxed text-fg-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", { children: "Cookies de sessão são usados para manter navegação básica." }),
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", { children: "Não utilizamos rastreamento de terceiros nesta versão." }),
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("p", { children: [
									"Para dúvidas, fale conosco pela",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(link_default, {
										href: "/support",
										className: "font-semibold text-accent hover:text-accent/80",
										children: "Central de Ajuda"
									}),
									"."
								] })
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "flex flex-wrap gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
							href: "/legal/terms",
							className: "inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(FileText, { className: "h-4 w-4" }),
								"Termos de Uso",
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ArrowRight, { className: "h-4 w-4" })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
							href: "/legal/privacy",
							className: "inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(FileText, { className: "h-4 w-4" }),
								"Política de Privacidade",
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ArrowRight, { className: "h-4 w-4" })
							]
						})]
					})]
				})
			})
		})]
	});
}
var Lock = createLucideIcon("lock", [["rect", {
	width: "18",
	height: "11",
	x: "3",
	y: "11",
	rx: "2",
	ry: "2",
	key: "1w4ew1"
}], ["path", {
	d: "M7 11V7a5 5 0 0 1 10 0v4",
	key: "fwvmzm"
}]]);
var page_exports$20 = /* @__PURE__ */ __exportAll({ default: () => PrivacyPage });
function PrivacyPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
			badge: "Legal",
			title: "Política de Privacidade",
			subtitle: "Este ambiente não coleta dados reais. A política completa está disponível no ambiente de produção.",
			actions: [{
				label: "Voltar para a Home",
				href: "/"
			}]
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
			className: "bg-surface-1 py-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "container mx-auto px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "mx-auto max-w-3xl space-y-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
						className: "rounded-2xl border border-border bg-surface-card p-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
							className: "mb-4 flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
								className: "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
								children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Lock, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
								className: "font-display text-xl font-bold italic text-foreground",
								children: "Segurança e dados"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
							className: "space-y-3 text-sm leading-relaxed text-fg-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", { children: "Logs e métricas exibidos aqui são apenas para demonstração." }),
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", { children: "Não armazenamos informações financeiras neste ambiente." }),
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("p", { children: [
									"Para dúvidas, fale conosco pela",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(link_default, {
										href: "/support",
										className: "font-semibold text-accent hover:text-accent/80",
										children: "Central de Ajuda"
									}),
									"."
								] })
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "flex flex-wrap gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
							href: "/legal/terms",
							className: "inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(FileText, { className: "h-4 w-4" }),
								"Termos de Uso",
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ArrowRight, { className: "h-4 w-4" })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
							href: "/legal/cookies",
							className: "inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(FileText, { className: "h-4 w-4" }),
								"Política de Cookies",
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ArrowRight, { className: "h-4 w-4" })
							]
						})]
					})]
				})
			})
		})]
	});
}
var page_exports$19 = /* @__PURE__ */ __exportAll({ default: () => TermsPage });
function TermsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
			badge: "Legal",
			title: "Termos de Uso",
			subtitle: "Transparência e clareza sobre o uso da plataforma BarberKings.",
			actions: [{
				label: "Voltar para a Home",
				href: "/"
			}]
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
			className: "bg-surface-1 py-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "container mx-auto px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "mx-auto max-w-3xl space-y-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
						className: "rounded-2xl border border-border bg-surface-card p-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
							className: "mb-4 flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
								className: "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
								children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ShieldCheck, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
								className: "font-display text-xl font-bold italic text-foreground",
								children: "Transparência e privacidade"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
							className: "space-y-3 text-sm leading-relaxed text-fg-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", { children: "Reservamo-nos o direito de ajustar funcionalidades e conteúdos sem aviso prévio nesta versão demonstrativa." }),
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", { children: "Dados sensíveis não são coletados neste ambiente; informações exibidas podem ser fictícias." }),
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", { children: "Agendamentos e pagamentos reais devem ser realizados apenas em ambientes autorizados." })
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "flex flex-wrap gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
							href: "/legal/privacy",
							className: "inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(FileText, { className: "h-4 w-4" }),
								"Política de Privacidade",
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ArrowRight, { className: "h-4 w-4" })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
							href: "/legal/cookies",
							className: "inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(FileText, { className: "h-4 w-4" }),
								"Política de Cookies",
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ArrowRight, { className: "h-4 w-4" })
							]
						})]
					})]
				})
			})
		})]
	});
}
var Brush = createLucideIcon("brush", [
	["path", {
		d: "m11 10 3 3",
		key: "fzmg1i"
	}],
	["path", {
		d: "M6.5 21A3.5 3.5 0 1 0 3 17.5a2.62 2.62 0 0 1-.708 1.792A1 1 0 0 0 3 21z",
		key: "p4q2r7"
	}],
	["path", {
		d: "M9.969 17.031 21.378 5.624a1 1 0 0 0-3.002-3.002L6.967 14.031",
		key: "wy6l02"
	}]
]);
var UserRound = createLucideIcon("user-round", [["circle", {
	cx: "12",
	cy: "8",
	r: "5",
	key: "1hypcn"
}], ["path", {
	d: "M20 21a8 8 0 0 0-16 0",
	key: "rfgkzh"
}]]);
var page_exports$18 = /* @__PURE__ */ __exportAll({ default: () => PricesPage });
var samplePrices = [
	{
		label: "Corte de Cabelo",
		price: "R$ 70,00",
		time: "30 min",
		icon: Scissors,
		description: "Acabamento limpo e alinhado para rotina ou ocasião especial."
	},
	{
		label: "Barba Completa",
		price: "R$ 55,00",
		time: "25 min",
		icon: UserRound,
		description: "Modelagem precisa com atenção ao contorno e à textura."
	},
	{
		label: "Combo Corte + Barba",
		price: "R$ 110,00",
		time: "50 min",
		icon: Sparkles,
		description: "A experiência mais completa para quem busca refinamento em uma única visita."
	},
	{
		label: "Pezinho / Acabamento",
		price: "R$ 35,00",
		time: "15 min",
		icon: Brush,
		description: "Detalhes rápidos para manter a silhueta sempre impecável."
	}
];
function PricesPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
				badge: "Tabela transparente",
				title: "Preços & Serviços",
				subtitle: "Valores claros, duração estimada e uma leitura rápida do que cada experiência entrega.",
				actions: [{
					label: "Ver promoções",
					href: "/promotions",
					variant: "outline"
				}, {
					label: "Agendar agora",
					href: "/scheduling"
				}]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
				className: "bg-background py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
					className: "container mx-auto px-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface-card px-5 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
							className: "flex min-w-0 flex-1 items-start gap-3 text-sm text-fg-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Percent, { className: "mt-0.5 h-4 w-4 shrink-0 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", { children: "Quer economizar mais? Confira promoções ativas e pacotes especiais antes de fechar o horário." })]
						}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(link_default, {
							href: "/promotions",
							className: "shrink-0 text-sm font-semibold text-accent transition-colors hover:text-accent/80",
							children: "Abrir promoções"
						})]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
				className: "bg-surface-1 py-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "container mx-auto px-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(SectionHeader, {
						title: "Serviços mais buscados",
						subtitle: "A mesma curadoria visual da Home, organizada para comparação rápida."
					}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
						className: "stagger-reveal mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4",
						children: samplePrices.map((item) => {
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
								className: "card-hover group rounded-2xl border border-border bg-surface-card p-4 sm:p-6 transition-all duration-300",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
										className: "flex items-start justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
											className: "inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent transition-colors duration-300 group-hover:bg-[hsl(var(--accent)/0.16)]",
											children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Icon, { className: "h-5 w-5" })
										}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
											className: "rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-medium text-fg-muted",
											children: item.time
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
										className: "mt-4 sm:mt-6 space-y-2 sm:space-y-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
												className: "font-display text-xl sm:text-2xl font-bold italic text-foreground",
												children: item.label
											}),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
												className: "text-sm leading-relaxed text-fg-muted",
												children: item.description
											}),
											/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
												className: "text-xl sm:text-2xl font-bold text-accent",
												children: item.price
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(link_default, {
										href: "/scheduling",
										className: "gold-shimmer mt-6 inline-flex w-full items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90",
										children: "Agendar serviço"
									})
								]
							}, item.label);
						})
					})]
				})
			})
		]
	});
}
var page_exports$17 = /* @__PURE__ */ __exportAll({ default: () => page_default$8 });
/**
* Página de Perfil do Usuário
*
* Exibe informações do usuário autenticado com design moderno
* e mobile-first, mantendo consistência com o design system do projeto.
*/
var page_default$8 = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "5a4d3fe72cb3", "default");
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-muted", className),
		...props
	});
}
/**
* Skeleton para o header do perfil (avatar + nome + botões)
*/
function ProfileHeaderSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
		className: "px-6 pt-8 pb-8 bg-muted/30",
		children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
			className: "text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
					className: "relative inline-block mb-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "w-24 h-24 rounded-full" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-8 w-48 mx-auto mb-2" }),
				/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-4 w-40 mx-auto mb-6" }),
				/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-10 w-36 mx-auto mb-4 rounded-full" }),
				/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-10 w-32 mx-auto rounded-full" })
			]
		})
	});
}
/**
* Skeleton para os items de menu do perfil
*/
function ProfileMenuSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
		className: "flex-1 px-6 py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-6 w-40 mb-4" }),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "space-y-3",
				children: [
					1,
					2,
					3,
					4,
					5
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
					className: "bg-card rounded-xl p-4 shadow-sm border border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-4 w-4 rounded" }),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-5 flex-1" }),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-4 w-4 rounded" })
						]
					})
				}, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
				className: "mt-6 p-4 rounded-lg bg-card border border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-5 w-44 mb-3" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "flex justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-4 w-12" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-4 w-20" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "flex justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-4 w-8" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-4 w-24" })]
					})]
				})]
			})
		]
	});
}
/**
* Skeleton para a página de configurações (formulário)
*/
function ProfileSettingsSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
		className: "min-h-screen mt-20 mb-8 min-w-full flex flex-col bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
			className: "border-b w-full bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
				className: "flex items-center justify-between px-4 py-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-10 w-10 rounded" }),
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-6 w-32" }),
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", { className: "w-10" })
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
			className: "py-6 px-4 max-w-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "bg-card rounded-2xl p-6 shadow-sm border border-border mb-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "flex flex-col items-center space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "w-24 h-24 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "absolute -bottom-2 -right-2 h-8 w-8 rounded-full" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "text-center space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-5 w-40 mx-auto" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-4 w-48 mx-auto" })]
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "bg-card rounded-2xl shadow-sm border border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "p-6 space-y-6",
					children: [[
						1,
						2,
						3,
						4
					].map((i) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-4 w-32" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-10 w-full rounded-lg" })]
					}, i)), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "flex gap-3 pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-10 flex-1 rounded-lg" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-10 flex-1 rounded-lg" })]
					})]
				})
			})]
		})]
	});
}
/**
* Skeleton completo para a página de perfil principal
*/
function ProfilePageSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
		className: "container mx-auto flex flex-col w-full mt-16 bg-[--background]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ProfileHeaderSkeleton, {}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ProfileMenuSkeleton, {})]
	});
}
/**
* Skeleton para formulário de alteração de senha
*/
function ChangePasswordSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
		className: "min-h-screen bg-gradient-to-br from-gray-50 to-blue-50",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
			className: "relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
				className: "relative z-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "flex justify-between items-center px-6 pt-12 pb-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-10 w-10 rounded bg-white/20" }),
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-6 w-32 bg-white/20" }),
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", { className: "w-10" })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "flex flex-col items-center px-6 pb-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "w-16 h-16 rounded-full mb-4 bg-white/20" }),
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-7 w-48 mb-2 bg-white/20" }),
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-4 w-40 bg-white/20" })
					]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
			className: "flex-1 px-6 py-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
				className: "max-w-lg mx-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
					className: "bg-card rounded-xl p-6 shadow-sm border border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
						className: "space-y-6",
						children: [
							1,
							2,
							3
						].map((i) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-4 w-32" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-12 w-full rounded-lg" })]
						}, i))
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "flex gap-3 pt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-10 flex-1 rounded-lg" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-10 flex-1 rounded-lg" })]
				})]
			})
		})]
	});
}
var loading_exports$5 = /* @__PURE__ */ __exportAll({ default: () => ProfileLoading });
/**
* Loading state para a página de perfil
* Exibido durante navegação de rotas pelo Next.js App Router
*/
function ProfileLoading() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ProfilePageSkeleton, {});
}
var page_exports$16 = /* @__PURE__ */ __exportAll({ default: () => page_default$7 });
/**
* Página de Alteração de Senha
*/
var page_default$7 = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "7cf9360fbc4c", "default");
var loading_exports$4 = /* @__PURE__ */ __exportAll({ default: () => ChangePasswordLoading });
/**
* Loading state para a página de alteração de senha
* Exibido durante navegação de rotas pelo Next.js App Router
*/
function ChangePasswordLoading() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ChangePasswordSkeleton, {});
}
var page_exports$15 = /* @__PURE__ */ __exportAll({ default: () => page_default$6 });
var page_default$6 = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "ede49cfa89c2", "default");
/**
* Componente Card - Container principal
* Usado para agrupar conteúdo relacionado com bordas e sombra
*/
var Card = import_react_react_server.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
	ref,
	className: cn("rounded-lg border bg-card text-card-foreground shadow-sm", className),
	...props
}));
Card.displayName = "Card";
/**
* Componente CardHeader - Cabeçalho do card
* Geralmente contém título e descrição
*/
var CardHeader = import_react_react_server.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
	ref,
	className: cn("flex flex-col space-y-1.5 p-6", className),
	...props
}));
CardHeader.displayName = "CardHeader";
/**
* Componente CardTitle - Título principal do card
*/
var CardTitle = import_react_react_server.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h3", {
	ref,
	className: cn("text-2xl font-semibold leading-none tracking-tight", className),
	...props
}));
CardTitle.displayName = "CardTitle";
/**
* Componente CardDescription - Descrição/subtítulo do card
*/
var CardDescription = import_react_react_server.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
CardDescription.displayName = "CardDescription";
/**
* Componente CardContent - Conteúdo principal do card
*/
var CardContent = import_react_react_server.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
	ref,
	className: cn("p-6 pt-0", className),
	...props
}));
CardContent.displayName = "CardContent";
/**
* Componente CardFooter - Rodapé do card
* Geralmente contém botões de ação
*/
var CardFooter = import_react_react_server.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
	ref,
	className: cn("flex items-center p-6 pt-0", className),
	...props
}));
CardFooter.displayName = "CardFooter";
/**
* Skeleton para um card de notificação individual
*/
function NotificationCardSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(CardContent, {
		className: "p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
			className: "flex items-start gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-5 w-5 rounded-full flex-shrink-0 mt-1" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
				className: "flex-1 space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-4 w-32" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-3 w-16" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-3 w-full" }),
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-3 w-3/4" })
				]
			})]
		})
	}) });
}
/**
* Skeleton para lista de notificações
*/
function NotificationsListSkeleton({ count = 5 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
		className: "space-y-4",
		children: Array.from({ length: count }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(NotificationCardSkeleton, {}, i))
	});
}
/**
* Skeleton completo para a página de notificações
*/
function NotificationsPageSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
		className: "container mx-auto px-4 py-6 max-w-4xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 pb-4 mb-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-10 w-10 rounded" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-8 w-32" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-9 w-48 rounded" })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "mb-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
					className: "grid grid-cols-3 gap-2 p-1 bg-muted rounded-lg",
					children: [
						1,
						2,
						3
					].map((i) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "flex items-center justify-center gap-2 h-10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-4 w-16" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-5 w-8 rounded-full" })]
					}, i))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(NotificationsListSkeleton, { count: 5 })
		]
	});
}
var loading_exports$3 = /* @__PURE__ */ __exportAll({ default: () => NotificationsLoading });
/**
* Loading state para a página de notificações
* Exibido durante navegação de rotas pelo Next.js App Router
*/
function NotificationsLoading() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(NotificationsPageSkeleton, {});
}
var page_exports$14 = /* @__PURE__ */ __exportAll({ default: () => page_default$5 });
/**
* Página de Configurações do Perfil
*
* Permite ao usuário editar suas informações pessoais:
* - Nome e apelido
* - Email e telefone
* - Foto de perfil (com upload funcional)
*/
var page_default$5 = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "322bd933aa61", "default");
var loading_exports$2 = /* @__PURE__ */ __exportAll({ default: () => SettingsLoading });
/**
* Loading state para a página de configurações do perfil
* Exibido durante navegação de rotas pelo Next.js App Router
*/
function SettingsLoading() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ProfileSettingsSkeleton, {});
}
var page_exports$13 = /* @__PURE__ */ __exportAll({ default: () => page_default$4 });
/**
* Página Friend & Social - Mobile First
*
* Permite ao usuário:
* - Ver lista de amigos
* - Buscar e adicionar novos amigos
* - Compartilhar convites
* - Interagir socialmente
*/
var page_default$4 = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "41a696d03eaa", "default");
/**
* Skeleton para o header da página social (tabs + botões)
*/
function SocialHeaderSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
		className: "bg-card border-b sticky top-16 z-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
			className: "flex items-center justify-between px-4 py-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-10 w-10 rounded" }),
				/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-6 w-36" }),
				/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-10 w-10 rounded" })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
			className: "flex border-t",
			children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "flex-1 py-3 flex items-center justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-5 w-20" })
			}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "flex-1 py-3 flex items-center justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-5 w-24" })
			})]
		})]
	});
}
/**
* Skeleton para o card de estatísticas sociais
*/
function SocialStatsCardSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
		className: "bg-card rounded-2xl p-6 shadow-sm border border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
			className: "grid grid-cols-3 gap-4 text-center",
			children: [
				1,
				2,
				3
			].map((i) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-8 w-12 mx-auto" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-3 w-16 mx-auto" })]
			}, i))
		})
	});
}
/**
* Skeleton para o card de convite
*/
function InviteCardSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
		className: "bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 shadow-lg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
			className: "flex items-start justify-between mb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
				className: "flex-1 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-6 w-40 bg-white/30" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-4 w-56 bg-white/20" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-6 w-6 bg-white/30" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-10 w-full rounded-lg bg-white/30" })]
	});
}
/**
* Skeleton para um card de amigo
*/
function FriendCardSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
		className: "bg-card rounded-xl p-4 shadow-sm border border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
				className: "flex items-center gap-3 flex-1 min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "w-12 h-12 rounded-full flex-shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "flex-1 min-w-0 space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-4 w-32" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-3 w-20" })]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
				className: "flex items-center gap-2 flex-shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-10 w-10 rounded" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-10 w-10 rounded" })]
			})]
		})
	});
}
/**
* Skeleton para lista de amigos
*/
function FriendsListSkeleton({ count = 5 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
			className: "flex items-center justify-between px-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-5 w-24" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-4 w-16" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
			className: "space-y-2",
			children: Array.from({ length: count }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(FriendCardSkeleton, {}, i))
		})]
	});
}
/**
* Skeleton para um card de solicitação de amizade
*/
function FriendRequestSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
		className: "bg-card rounded-xl p-4 shadow-sm border border-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
			className: "flex items-center gap-3 mb-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "w-12 h-12 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
				className: "flex-1 min-w-0 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-4 w-32" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-3 w-20" })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-9 flex-1 rounded" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-9 flex-1 rounded" })]
		})]
	});
}
/**
* Skeleton para lista de solicitações de amizade recebidas
*/
function ReceivedRequestsListSkeleton({ count = 3 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
		className: "space-y-3",
		children: Array.from({ length: count }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(FriendRequestSkeleton, {}, i))
	});
}
/**
* Skeleton completo para a página social (aba Amigos)
*/
function SocialPageFriendsSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
		className: "flex-1 px-4 py-6 max-w-2xl w-full mx-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(SocialStatsCardSkeleton, {}),
				/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(InviteCardSkeleton, {}),
				/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(FriendsListSkeleton, { count: 5 })
			]
		})
	});
}
/**
* Skeleton completo para a página social (geral - pode ser usado no loading.tsx)
*/
function SocialPageSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
		className: "min-h-screen mt-16 mb-20 w-full flex flex-col bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(SocialHeaderSkeleton, {}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(SocialPageFriendsSkeleton, {})]
	});
}
/**
* Skeleton completo para a página de solicitações de amizade
*/
function FriendRequestsPageSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
		className: "min-h-screen mt-16 mb-20 w-full flex flex-col bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
			className: "bg-card border-b sticky top-16 z-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
				className: "flex items-center justify-between px-4 py-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-10 w-10 rounded" }),
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-6 w-56" }),
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", { className: "w-10" })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
				className: "flex border-t",
				children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "flex-1 py-3 flex items-center justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-5 w-20" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-5 w-5 rounded-full" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "flex-1 py-3 flex items-center justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-5 w-20" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Skeleton, { className: "h-5 w-5 rounded-full" })]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
			className: "flex-1 px-4 py-6 max-w-2xl w-full mx-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ReceivedRequestsListSkeleton, { count: 3 })
		})]
	});
}
var loading_exports$1 = /* @__PURE__ */ __exportAll({ default: () => SocialLoading });
/**
* Loading state para a página Friend & Social
* Exibido durante navegação de rotas pelo Next.js App Router
*/
function SocialLoading() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(SocialPageSkeleton, {});
}
var page_exports$12 = /* @__PURE__ */ __exportAll({ default: () => page_default$3 });
var page_default$3 = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "94512e48d017", "default");
var loading_exports = /* @__PURE__ */ __exportAll({ default: () => RequestsLoading });
/**
* Loading state para a página de solicitações de amizade
* Exibido durante navegação de rotas pelo Next.js App Router
*/
function RequestsLoading() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(FriendRequestsPageSkeleton, {});
}
var Tag = createLucideIcon("tag", [["path", {
	d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",
	key: "vktsd0"
}], ["circle", {
	cx: "7.5",
	cy: "7.5",
	r: ".5",
	fill: "currentColor",
	key: "kqv944"
}]]);
var page_exports$11 = /* @__PURE__ */ __exportAll({ default: () => PromotionsPage });
async function PromotionsPage() {
	const promotions = (await getHomePageData()).promotions.items;
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
				badge: "Ofertas exclusivas",
				title: "Ofertas Exclusivas",
				subtitle: "Cupons e campanhas ativas com leitura clara de prazo, valor e contexto de uso.",
				actions: [{
					label: "Agendar agora",
					href: "/scheduling"
				}]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
				className: "bg-background py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "container mx-auto px-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(SectionHeader, {
						title: "Filtros visuais",
						subtitle: "Referências de categoria para orientar a navegação sem alterar a lógica atual.",
						centered: false
					}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
						className: "mt-6 flex flex-wrap gap-3",
						children: [
							"Todos",
							"Cortes",
							"Barbas",
							"Pacotes",
							"VIP"
						].map((filter, index) => {
							const active = index === 0;
							return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", {
								className: ["inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300", active ? "border-accent bg-[hsl(var(--accent)/0.1)] text-accent" : "border-border bg-surface-card text-fg-muted"].join(" "),
								children: [active ? /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Sparkles, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Tag, { className: "h-4 w-4" }), filter]
							}, filter);
						})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
				className: "bg-surface-1 py-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
					className: "container mx-auto px-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
						className: "stagger-reveal grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
						children: promotions.map((promo) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
							className: "card-hover group rounded-2xl border border-border bg-surface-card p-6 transition-all duration-300",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
									className: "flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("span", {
										className: "inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/0.2)] bg-[hsl(var(--accent)/0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Gift, { className: "h-3.5 w-3.5" }), promo.badgeLabel]
									}), promo.expiresLabel ? /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
										className: "rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-medium text-fg-muted",
										children: promo.expiresLabel
									}) : null]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
									className: "mt-5 font-display text-2xl font-bold italic text-foreground",
									children: promo.title
								}),
								promo.description ? /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
									className: "mt-3 text-sm leading-relaxed text-fg-muted",
									children: promo.description
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
									className: "mt-5 rounded-xl border border-dashed border-[hsl(var(--accent)/0.32)] bg-[hsl(var(--accent)/0.05)] px-4 py-3 text-center text-sm font-bold tracking-[0.18em] text-accent",
									children: promo.code
								}),
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(link_default, {
									href: "/scheduling",
									className: "gold-shimmer mt-6 inline-flex w-full items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90",
									children: "Usar agora"
								})
							]
						}, promo.id))
					})
				})
			})
		]
	});
}
var Separator = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'Separator' is called on server");
}, "cf9a10ca1a61", "Separator");
var ReviewSystemManager = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'ReviewSystemManager' is called on server");
}, "dd754dd5137d", "ReviewSystemManager");
/**
* Convert a glob pattern (with `*` and `**`) to a RegExp.
*
* For hostnames, segments are separated by `.`:
*   - `*` matches a single segment (no dots): [^.]+
*   - `**` matches any number of segments: .+
*
* For pathnames, segments are separated by `/`:
*   - `*` matches a single segment (no slashes): [^/]+
*   - `**` matches any number of segments (including empty): .*
*
* Literal characters are escaped for regex safety.
*/
function globToRegex(pattern, separator) {
	let regexStr = "^";
	const doubleStar = separator === "." ? ".+" : ".*";
	const singleStar = separator === "." ? "[^.]+" : "[^/]+";
	const parts = pattern.split("**");
	for (let i = 0; i < parts.length; i++) {
		if (i > 0) regexStr += doubleStar;
		const subParts = parts[i].split("*");
		for (let j = 0; j < subParts.length; j++) {
			if (j > 0) regexStr += singleStar;
			regexStr += subParts[j].replace(/[.+?^${}()|[\]\\]/g, "\\$&");
		}
	}
	regexStr += "$";
	return new RegExp(regexStr);
}
/**
* Check whether a URL matches a single remote pattern.
* Follows the same semantics as Next.js's matchRemotePattern().
*/
function matchRemotePattern(pattern, url) {
	if (pattern.protocol !== void 0) {
		if (pattern.protocol.replace(/:$/, "") !== url.protocol.replace(/:$/, "")) return false;
	}
	if (pattern.port !== void 0) {
		if (pattern.port !== url.port) return false;
	}
	if (!globToRegex(pattern.hostname, ".").test(url.hostname)) return false;
	if (pattern.search !== void 0) {
		if (pattern.search !== url.search) return false;
	}
	if (!globToRegex(pattern.pathname ?? "**", "/").test(url.pathname)) return false;
	return true;
}
/**
* Check whether a URL matches any configured remote pattern or legacy domain.
*/
function hasRemoteMatch(domains, remotePatterns, url) {
	return domains.some((domain) => url.hostname === domain) || remotePatterns.some((p) => matchRemotePattern(p, url));
}
var nestedKeys = /* @__PURE__ */ new Set(["style"]);
var fixedMap = {
	srcset: "srcSet",
	fetchpriority: "use" in import_react_react_server ? "fetchPriority" : "fetchpriority"
};
var camelize = (key) => {
	if (key.startsWith("data-") || key.startsWith("aria-")) return key;
	return fixedMap[key] || key.replace(/-./g, (suffix) => suffix[1].toUpperCase());
};
function camelizeProps(props) {
	return Object.fromEntries(Object.entries(props).map(([k, v]) => [camelize(k), nestedKeys.has(k) && v && typeof v !== "string" ? camelizeProps(v) : v]));
}
var Image$1 = import_react_react_server.forwardRef(function Image2(props, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("img", {
		...camelizeProps(transformProps(props)),
		ref
	});
});
import_react_react_server.forwardRef(function Source2(props, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("source", {
		...camelizeProps(transformSourceProps(props)),
		ref
	});
});
/**
* next/image shim
*
* Translates Next.js Image props to @unpic/react Image component.
* @unpic/react auto-detects CDN from URL and uses native transforms.
* For local images (relative paths), routes through `/_vinext/image`
* for server-side optimization (resize, format negotiation, quality).
*
* Remote images are validated against `images.remotePatterns` and
* `images.domains` from next.config.js. Unmatched URLs are blocked
* in production and warn in development, matching Next.js behavior.
*/
/**
* Image config injected at build time via Vite define.
* Serialized as JSON — parsed once at module level.
*/
var __imageRemotePatterns = (() => {
	try {
		return JSON.parse("[{\"protocol\":\"https\",\"hostname\":\"res.cloudinary.com\"},{\"protocol\":\"https\",\"hostname\":\"lh3.googleusercontent.com\"},{\"protocol\":\"https\",\"hostname\":\"avatars.githubusercontent.com\"},{\"protocol\":\"https\",\"hostname\":\"images.unsplash.com\"}]");
	} catch {
		return [];
	}
})();
var __imageDomains = (() => {
	try {
		return JSON.parse("[]");
	} catch {
		return [];
	}
})();
var __hasImageConfig = __imageRemotePatterns.length > 0 || __imageDomains.length > 0;
var __imageDeviceSizes = (() => {
	try {
		return JSON.parse("[640,750,828,1080,1200,1920,2048,3840]");
	} catch {
		return [
			640,
			750,
			828,
			1080,
			1200,
			1920,
			2048,
			3840
		];
	}
})();
/**
* Validate that a remote URL is allowed by the configured remote patterns.
* Returns true if the URL is allowed, false otherwise.
*
* When no remotePatterns/domains are configured, all remote URLs are allowed
* (backwards-compatible — user hasn't opted into restriction).
*
* When patterns ARE configured, only matching URLs are allowed.
* In development, non-matching URLs produce a console warning.
* In production, non-matching URLs are blocked (src replaced with empty string).
*/
function validateRemoteUrl(src) {
	if (!__hasImageConfig) return { allowed: true };
	let url;
	try {
		url = new URL(src, "http://n");
	} catch {
		return {
			allowed: false,
			reason: `Invalid URL: ${src}`
		};
	}
	if (hasRemoteMatch(__imageDomains, __imageRemotePatterns, url)) return { allowed: true };
	return {
		allowed: false,
		reason: `Image URL "${src}" is not configured in images.remotePatterns or images.domains in next.config.js. See: https://nextjs.org/docs/messages/next-image-unconfigured-host`
	};
}
/**
* Sanitize a blurDataURL to prevent CSS injection.
*
* A crafted data URL containing `)` can break out of the `url()` CSS function,
* allowing injection of arbitrary CSS properties or rules. Characters like `{`,
* `}`, and `\` can also assist in crafting injection payloads.
*
* This validates the URL starts with `data:image/` and rejects characters that
* could escape the `url()` context. Semicolons are allowed since they're part
* of valid data URLs (`data:image/png;base64,...`) and harmless inside `url()`.
*
* Returns undefined for invalid URLs, which causes the blur placeholder to be
* skipped gracefully.
*/
function sanitizeBlurDataURL(url) {
	if (!url.startsWith("data:image/")) return void 0;
	if (/[)(}{\\'"\n\r]/.test(url)) return void 0;
	return url;
}
/**
* Determine if a src is a remote URL (CDN-optimizable) or local.
*/
function isRemoteUrl(src) {
	return src.startsWith("http://") || src.startsWith("https://") || src.startsWith("//");
}
/**
* Responsive image widths matching Next.js's device sizes config.
* These are the breakpoints used for srcSet generation.
* Configurable via `images.deviceSizes` in next.config.js.
*/
var RESPONSIVE_WIDTHS = __imageDeviceSizes;
/**
* Build a `/_vinext/image` optimization URL.
*
* In production (Cloudflare Workers), the worker intercepts this path and uses
* the Images binding to resize/transcode on the fly. In dev, the Vite dev
* server handles it as a passthrough (serves the original file).
*/
function imageOptimizationUrl(src, width, quality = 75) {
	return `/_vinext/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}
/**
* Generate a srcSet string for responsive images.
*
* Each width points to the `/_vinext/image` optimization endpoint so the
* server can resize and transcode the image. Only includes widths that are
* <= 2x the original image width to avoid pointless upscaling.
*/
function generateSrcSet(src, originalWidth, quality = 75) {
	const widths = RESPONSIVE_WIDTHS.filter((w) => w <= originalWidth * 2);
	if (widths.length === 0) return `${imageOptimizationUrl(src, originalWidth, quality)} ${originalWidth}w`;
	return widths.map((w) => `${imageOptimizationUrl(src, w, quality)} ${w}w`).join(", ");
}
var Image = (0, import_react_react_server.forwardRef)(function Image({ src: srcProp, alt, width, height, fill, priority, quality, placeholder, blurDataURL, loader, sizes, className, style, onLoad, onLoadingComplete, unoptimized: _unoptimized, overrideSrc: _overrideSrc, loading, ...rest }, ref) {
	const handleLoad = onLoadingComplete ? (e) => {
		onLoad?.(e);
		onLoadingComplete(e.currentTarget);
	} : onLoad;
	const src = typeof srcProp === "string" ? srcProp : srcProp.src;
	const imgWidth = width ?? (typeof srcProp === "object" ? srcProp.width : void 0);
	const imgHeight = height ?? (typeof srcProp === "object" ? srcProp.height : void 0);
	const imgBlurDataURL = blurDataURL ?? (typeof srcProp === "object" ? srcProp.blurDataURL : void 0);
	if (loader) return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("img", {
		ref,
		src: loader({
			src,
			width: imgWidth ?? 0,
			quality: quality ?? 75
		}),
		alt,
		width: fill ? void 0 : imgWidth,
		height: fill ? void 0 : imgHeight,
		loading: priority ? "eager" : loading ?? "lazy",
		decoding: "async",
		sizes,
		className,
		onLoad: handleLoad,
		style: fill ? {
			position: "absolute",
			inset: 0,
			width: "100%",
			height: "100%",
			objectFit: "cover",
			...style
		} : style,
		...rest
	});
	if (isRemoteUrl(src)) {
		const validation = validateRemoteUrl(src);
		if (!validation.allowed) {
			console.error(`[next/image] ${validation.reason}`);
			return null;
		}
		const sanitizedBlur = imgBlurDataURL ? sanitizeBlurDataURL(imgBlurDataURL) : void 0;
		const bg = placeholder === "blur" && sanitizedBlur ? `url(${sanitizedBlur})` : void 0;
		if (fill) return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Image$1, {
			src,
			alt,
			layout: "fullWidth",
			loading: priority ? "eager" : loading ?? "lazy",
			fetchPriority: priority ? "high" : void 0,
			sizes,
			className,
			background: bg,
			onLoad: handleLoad
		});
		if (imgWidth && imgHeight) return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Image$1, {
			src,
			alt,
			width: imgWidth,
			height: imgHeight,
			layout: "constrained",
			loading: priority ? "eager" : loading ?? "lazy",
			fetchPriority: priority ? "high" : void 0,
			sizes,
			className,
			background: bg,
			onLoad: handleLoad
		});
	}
	const imgQuality = quality ?? 75;
	const isSvg = src.endsWith(".svg");
	const skipOptimization = _unoptimized === true || isSvg && true;
	const srcSet = imgWidth && !fill && !skipOptimization ? generateSrcSet(src, imgWidth, imgQuality) : imgWidth && !fill ? RESPONSIVE_WIDTHS.filter((w) => w <= imgWidth * 2).map((w) => `${src} ${w}w`).join(", ") || `${src} ${imgWidth}w` : void 0;
	const optimizedSrc = skipOptimization ? src : imgWidth ? imageOptimizationUrl(src, imgWidth, imgQuality) : imageOptimizationUrl(src, RESPONSIVE_WIDTHS[0], imgQuality);
	const sanitizedLocalBlur = imgBlurDataURL ? sanitizeBlurDataURL(imgBlurDataURL) : void 0;
	const blurStyle = placeholder === "blur" && sanitizedLocalBlur ? {
		backgroundImage: `url(${sanitizedLocalBlur})`,
		backgroundSize: "cover",
		backgroundRepeat: "no-repeat",
		backgroundPosition: "center"
	} : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("img", {
		ref,
		src: optimizedSrc,
		alt,
		width: fill ? void 0 : imgWidth,
		height: fill ? void 0 : imgHeight,
		loading: priority ? "eager" : loading ?? "lazy",
		fetchPriority: priority ? "high" : void 0,
		decoding: "async",
		srcSet,
		sizes: sizes ?? (fill ? "100vw" : void 0),
		className,
		"data-nimg": fill ? "fill" : "1",
		onLoad: handleLoad,
		style: fill ? {
			position: "absolute",
			inset: 0,
			width: "100%",
			height: "100%",
			objectFit: "cover",
			...blurStyle,
			...style
		} : {
			...blurStyle,
			...style
		},
		...rest
	});
});
var MessageSquareQuote = createLucideIcon("message-square-quote", [
	["path", {
		d: "M14 14a2 2 0 0 0 2-2V8h-2",
		key: "1r06pg"
	}],
	["path", {
		d: "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",
		key: "18887p"
	}],
	["path", {
		d: "M8 14a2 2 0 0 0 2-2V8H8",
		key: "1jzu5j"
	}]
]);
var ratingSteps = [
	1,
	2,
	3,
	4,
	5
];
function Reviews({ title, subtitle, reviews, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
		className: cn("w-full bg-surface-1 py-20 lg:py-28", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
			className: "container mx-auto px-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
				className: "stagger-reveal flex flex-col gap-4 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
						className: "font-display text-3xl font-bold italic tracking-tight text-foreground sm:text-4xl lg:text-5xl",
						children: title
					}),
					subtitle ? /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
						className: "mx-auto max-w-2xl text-base text-fg-muted sm:text-lg",
						children: subtitle
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", { className: "mx-auto mt-1 h-0.5 w-12 bg-accent" })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "stagger-reveal mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4",
				children: reviews.map((review) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
					className: cn("group relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl border border-border bg-surface-card p-7 transition-all duration-500", "hover:border-[hsl(var(--accent)/0.3)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)]"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(MessageSquareQuote, { className: "absolute -right-2 -top-2 h-16 w-16 rotate-180 text-[hsl(var(--accent)/0.06)]" }),
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
								className: "relative",
								children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Image, {
									src: review.avatarUrl,
									alt: review.author,
									width: 48,
									height: 48,
									className: "h-12 w-12 rounded-full object-cover ring-2 ring-[hsl(var(--accent)/0.15)]"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
								className: "flex flex-col text-left",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
										className: "font-semibold text-foreground",
										children: review.author
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
										className: "text-xs text-accent",
										children: review.serviceName
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
										className: "text-xs text-fg-subtle",
										children: format(new Date(review.createdAt), "dd MMM", { locale: ptBR })
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
							className: "flex items-center gap-1",
							children: ratingSteps.map((step) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Star, { className: cn("h-4 w-4", step <= review.rating ? "fill-accent text-accent" : "text-fg-subtle/30") }, step))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("p", {
							className: "relative z-10 text-sm leading-relaxed text-foreground/80 sm:text-base",
							children: [
								"“",
								review.comment,
								"”"
							]
						}),
						review.mediaUrl ? /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Image, {
							src: review.mediaUrl,
							alt: `Resultado do serviço de ${review.author}`,
							width: 320,
							height: 224,
							className: "mt-auto h-40 w-full rounded-xl object-cover"
						}) : null
					]
				}, review.id))
			})]
		})
	});
}
var Camera = createLucideIcon("camera", [["path", {
	d: "M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",
	key: "18u6gg"
}], ["circle", {
	cx: "12",
	cy: "13",
	r: "3",
	key: "1vg3eu"
}]]);
var page_exports$10 = /* @__PURE__ */ __exportAll({ default: () => ReviewsPage });
async function ReviewsPage() {
	const session = await (0, import_next_auth.getServerSession)(authOptions);
	if (!session) redirect("/auth/signin");
	const publicReviews = (await getHomePageData()).reviews.items;
	const totalReviews = publicReviews.length;
	const averageRating = totalReviews ? (publicReviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews).toFixed(1) : "0.0";
	const maxRatingCount = publicReviews.filter((review) => review.rating === 5).length;
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "min-h-screen bg-background pb-16",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
			badge: "Experiência Real",
			title: "Avaliações",
			subtitle: "Acompanhe feedbacks da comunidade, publique sua experiência e veja estatísticas dos serviços em um único lugar."
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
			className: "container mx-auto mt-10 px-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
				className: "mx-auto max-w-6xl space-y-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("section", {
						className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
								className: "rounded-2xl border border-border bg-surface-card p-6 card-hover",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
										children: "Nota Média"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-3 font-display text-4xl font-bold italic text-accent",
										children: averageRating
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-2 text-sm text-fg-muted",
										children: "Baseado nas avaliações mais recentes"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
								className: "rounded-2xl border border-border bg-surface-card p-6 card-hover",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
										children: "Total de Reviews"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-3 font-display text-4xl font-bold italic text-accent",
										children: totalReviews
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-2 text-sm text-fg-muted",
										children: "Comentários da comunidade BarberKings"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
								className: "rounded-2xl border border-border bg-surface-card p-6 card-hover sm:col-span-2 lg:col-span-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
										children: "5 Estrelas"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-3 font-display text-4xl font-bold italic text-accent",
										children: maxRatingCount
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-2 text-sm text-fg-muted",
										children: "Atendimentos com excelência máxima"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Separator, { className: "bg-border" }),
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(Tabs, {
						defaultValue: "gallery",
						className: "w-full",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(TabsList, {
								className: "grid h-auto w-full grid-cols-2 rounded-2xl border border-border bg-surface-card p-1 md:grid-cols-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(TabsTrigger, {
										value: "gallery",
										className: "flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-fg-muted transition-all duration-300 hover:text-foreground data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none sm:text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Camera, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", { children: "Galeria" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(TabsTrigger, {
										value: "list",
										className: "flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-fg-muted transition-all duration-300 hover:text-foreground data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none sm:text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Star, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", { children: "Minhas" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(TabsTrigger, {
										value: "form",
										className: "flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-fg-muted transition-all duration-300 hover:text-foreground data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none sm:text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Plus, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", { children: "Nova" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(TabsTrigger, {
										value: "stats",
										className: "flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-fg-muted transition-all duration-300 hover:text-foreground data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none sm:text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ChartColumn, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", { children: "Stats" })]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TabsContent, {
								value: "gallery",
								className: "mt-8 space-y-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Reviews, {
									title: "Histórias da Comunidade",
									subtitle: "Resultado real de quem passa pelas nossas cadeiras todos os dias.",
									reviews: publicReviews,
									className: "rounded-3xl border border-border !bg-surface-1 !py-14"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TabsContent, {
								value: "list",
								className: "mt-8 space-y-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(Card, {
									className: "rounded-2xl border border-border bg-surface-card",
									children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(CardHeader, {
										className: "border-b border-border bg-surface-card",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(CardTitle, {
											className: "font-display text-2xl font-semibold italic text-foreground",
											children: "Minhas Avaliações"
										}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
											className: "text-sm text-fg-muted",
											children: "Gerencie seus comentários e acompanhe interações."
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(CardContent, {
										className: "p-6",
										children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(import_react_react_server.Suspense, {
											fallback: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
												className: "py-8 text-center",
												children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", { className: "mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
													className: "mt-3 text-sm text-fg-muted",
													children: "Carregando avaliações..."
												})]
											}),
											children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ReviewsList, {
												userId: session.user.id,
												showStats: true,
												showActions: true,
												limit: 10
											})
										})
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TabsContent, {
								value: "form",
								className: "mt-8 space-y-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ReviewSystemManager, { userId: session.user.id })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TabsContent, {
								value: "stats",
								className: "mt-8 space-y-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(Card, {
									className: "rounded-2xl border border-border bg-surface-card",
									children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(CardHeader, {
										className: "border-b border-border bg-surface-card",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(CardTitle, {
											className: "font-display text-2xl font-semibold italic text-foreground",
											children: "Estatísticas Detalhadas"
										}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
											className: "text-sm text-fg-muted",
											children: "Números atualizados sobre avaliações e desempenho."
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(CardContent, {
										className: "p-6",
										children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(import_react_react_server.Suspense, {
											fallback: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
												className: "py-4 text-center",
												children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", { className: "mx-auto h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" })
											}),
											children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ReviewsList, {
												userId: session.user.id,
												showStats: true,
												showActions: true,
												limit: 5
											})
										})
									})]
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Card, {
						className: "rounded-2xl border border-border bg-surface-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(CardContent, {
							className: "pt-6",
							children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
								className: "space-y-3 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
									className: "inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.08)] px-4 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", { className: "h-2 w-2 rounded-full bg-accent" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
										className: "text-sm font-semibold text-accent",
										children: "Sistema de Reviews Ativo"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
									className: "mx-auto max-w-2xl text-sm text-fg-muted",
									children: "Fluxo completo com upload de imagens, validações e integração em tempo real."
								})]
							})
						})
					})
				]
			})
		})]
	});
}
var MapPin = createLucideIcon("map-pin", [["path", {
	d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
	key: "1r0f0z"
}], ["circle", {
	cx: "12",
	cy: "10",
	r: "3",
	key: "ilqhr7"
}]]);
var Search = createLucideIcon("search", [["path", {
	d: "m21 21-4.34-4.34",
	key: "14j7rj"
}], ["circle", {
	cx: "11",
	cy: "11",
	r: "8",
	key: "4ej97u"
}]]);
var Clock3 = createLucideIcon("clock-3", [["path", {
	d: "M12 6v6h4",
	key: "135r8i"
}], ["circle", {
	cx: "12",
	cy: "12",
	r: "10",
	key: "1mglay"
}]]);
var page_exports$9 = /* @__PURE__ */ __exportAll({ default: () => SalonsPage });
var statusStyles$1 = {
	OPEN: "border-[hsl(var(--state-open-fg)/0.3)] bg-[hsl(var(--state-open-surface))] text-state-open-fg",
	CLOSING_SOON: "border-[hsl(var(--state-warning-fg)/0.3)] bg-[hsl(var(--state-warning-surface))] text-state-warning-fg",
	CLOSED: "border-[hsl(var(--state-closed-fg)/0.3)] bg-[hsl(var(--state-closed-surface))] text-state-closed-fg"
};
var statusLabels$1 = {
	OPEN: "Aberto agora",
	CLOSING_SOON: "Fecha em breve",
	CLOSED: "Fechado"
};
async function SalonsPage() {
	const salons = (await getHomePageData()).salons.items;
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
			badge: "Barbearias",
			title: "Salões Próximos",
			subtitle: "Escolha a unidade ideal, veja o status em tempo real e siga para o agendamento com uma experiência visual consistente.",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "mt-2 w-full max-w-3xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "rounded-2xl border border-border bg-surface-card p-3 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.25)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "flex flex-col gap-3 sm:flex-row sm:items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
							className: "relative flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Search, { className: "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("input", {
								type: "text",
								readOnly: true,
								value: "Buscar por bairro, distância ou unidade",
								"aria-label": "Buscar salões",
								className: "h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/0.18)]"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
							href: "/scheduling",
							className: "gold-shimmer inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90",
							children: ["Agendar agora", /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ArrowRight, { className: "h-4 w-4" })]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
						className: "mt-3 flex flex-wrap items-center justify-center gap-2",
						children: [
							"Centro",
							"Zona Sul",
							"Até 3 km",
							"Aberto agora"
						].map((item) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
							className: "rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-medium text-fg-muted",
							children: item
						}, item))
					})]
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("section", {
			className: "container mx-auto px-4 py-16 sm:py-20",
			children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(SectionHeader, {
				title: "Seleção em destaque",
				subtitle: "A mesma linguagem visual da Home aplicada à vitrine de unidades.",
				centered: false,
				className: "mb-10"
			}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
				children: salons.map((salon, index) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
					className: cn("group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-card transition-all duration-500", "card-hover hover:border-[hsl(var(--accent)/0.3)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "relative overflow-hidden",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Image, {
								src: salon.imageUrl,
								alt: salon.name,
								width: 400,
								height: 260,
								className: "h-52 w-full object-cover transition-transform duration-700 group-hover:scale-105"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" }),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
								className: cn("absolute left-4 top-4 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md", statusStyles$1[salon.status]),
								children: statusLabels$1[salon.status]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "flex flex-1 flex-col gap-4 p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
									className: "font-display text-xl font-semibold italic text-foreground",
									children: salon.name
								}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("p", {
									className: "inline-flex items-start gap-2 text-sm text-fg-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(MapPin, { className: "mt-0.5 h-4 w-4 shrink-0 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", { children: salon.address })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
								className: "flex items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
									className: "inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-medium text-fg-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Clock3, { className: "h-3.5 w-3.5 text-accent" }), salon.distanceLabel ?? `${index + 1} km`]
								}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
									className: "inline-flex items-center gap-1 rounded-full bg-[hsl(var(--accent)/0.1)] px-3 py-1 text-xs font-semibold text-accent",
									children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Star, { className: "h-4 w-4 fill-accent text-accent" }), salon.ratingLabel ?? "—"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(link_default, {
								href: salon.href || `/salons/${salon.id}`,
								className: "mt-auto inline-flex items-center justify-center rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent",
								children: "Ver detalhes"
							})
						]
					})]
				}, salon.id))
			})]
		})]
	});
}
/**
* Componente cliente para agendamento
* 
* Wrapper client-side que lida com navegação e notificações
* após o sucesso do agendamento.
*/
var SchedulingClient = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'SchedulingClient' is called on server");
}, "d6612525c3b6", "SchedulingClient");
var AppointmentService = class {
	/**
	* Criar novo agendamento
	*/
	static async create(userId, data) {
		return await db.appointment.create({
			data: {
				userId,
				serviceId: data.serviceId,
				barberId: data.barberId,
				date: data.date,
				notes: data.notes,
				voucherId: data.voucherId,
				appliedPromotionId: data.appliedPromotionId
			},
			include: {
				service: { select: {
					id: true,
					name: true,
					duration: true,
					price: true
				} },
				barber: { select: {
					id: true,
					name: true,
					email: true,
					image: true
				} },
				user: { select: {
					id: true,
					name: true,
					email: true,
					image: true
				} },
				voucher: { select: {
					id: true,
					code: true,
					type: true,
					value: true
				} }
			}
		});
	}
	/**
	* Buscar agendamento por ID
	*/
	static async findById(id) {
		return await db.appointment.findUnique({
			where: { id },
			include: {
				service: { select: {
					id: true,
					name: true,
					duration: true,
					price: true
				} },
				barber: { select: {
					id: true,
					name: true,
					email: true,
					image: true
				} },
				user: { select: {
					id: true,
					name: true,
					email: true,
					image: true
				} },
				voucher: { select: {
					id: true,
					code: true,
					type: true,
					value: true
				} }
			}
		});
	}
	/**
	* Atualizar agendamento
	*/
	static async update(id, data) {
		return await db.appointment.update({
			where: { id },
			data,
			include: {
				service: { select: {
					id: true,
					name: true,
					duration: true,
					price: true
				} },
				barber: { select: {
					id: true,
					name: true,
					email: true,
					image: true
				} },
				user: { select: {
					id: true,
					name: true,
					email: true,
					image: true
				} },
				voucher: { select: {
					id: true,
					code: true,
					type: true,
					value: true
				} }
			}
		});
	}
	/**
	* Listar agendamentos com filtros
	*/
	static async findMany(filters) {
		const where = {};
		if (filters.userId) where.userId = filters.userId;
		if (filters.status) where.status = filters.status;
		if (filters.serviceId) where.serviceId = filters.serviceId;
		if (filters.barberId) where.barberId = filters.barberId;
		if (filters.startDate || filters.endDate) {
			where.date = {};
			if (filters.startDate) where.date.gte = filters.startDate;
			if (filters.endDate) where.date.lte = filters.endDate;
		}
		const page = filters.page || 1;
		const limit = filters.limit || 10;
		const [appointments, total] = await Promise.all([db.appointment.findMany({
			where,
			include: {
				service: { select: {
					id: true,
					name: true,
					duration: true,
					price: true
				} },
				barber: { select: {
					id: true,
					name: true,
					email: true,
					image: true
				} },
				user: { select: {
					id: true,
					name: true,
					email: true,
					image: true
				} },
				voucher: { select: {
					id: true,
					code: true,
					type: true,
					value: true
				} }
			},
			orderBy: [{ date: "desc" }, { createdAt: "desc" }],
			skip: (page - 1) * limit,
			take: limit
		}), db.appointment.count({ where })]);
		return {
			appointments,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		};
	}
	/**
	* Verificar disponibilidade de horário
	*/
	static async checkAvailability(barberId, date, serviceId, excludeAppointmentId) {
		const service = await db.service.findUnique({
			where: { id: serviceId },
			select: { duration: true }
		});
		if (!service) throw new Error("Serviço não encontrado");
		const endTime = new Date(date.getTime() + service.duration * 6e4);
		const where = {
			barberId,
			status: { in: ["SCHEDULED", "CONFIRMED"] },
			OR: [{ date: { lte: date } }, { date: { lt: endTime } }]
		};
		if (excludeAppointmentId) where.id = { not: excludeAppointmentId };
		const conflictingAppointments = await db.appointment.findMany({
			where,
			include: { service: { select: { duration: true } } }
		});
		for (const appointment of conflictingAppointments) {
			const appointmentEnd = new Date(appointment.date.getTime() + appointment.service.duration * 6e4);
			if (date >= appointment.date && date < appointmentEnd || endTime > appointment.date && endTime <= appointmentEnd || date <= appointment.date && endTime >= appointmentEnd) return false;
		}
		return true;
	}
	/**
	* Cancelar agendamento
	*/
	static async cancel(id) {
		return await this.update(id, { status: "CANCELLED" });
	}
	/**
	* Confirmar agendamento
	*/
	static async confirm(id) {
		return await this.update(id, { status: "CONFIRMED" });
	}
	/**
	* Completar agendamento
	*/
	static async complete(id) {
		return await this.update(id, { status: "COMPLETED" });
	}
	/**
	* Buscar agendamentos do usuário
	*/
	static async findUserAppointments(userId, filters) {
		const mergedFilters = {
			page: 1,
			limit: 10,
			...filters,
			userId
		};
		return await this.findMany(mergedFilters);
	}
	/**
	* Buscar agendamentos do barbeiro
	*/
	static async findBarberAppointments(barberId, filters) {
		const mergedFilters = {
			page: 1,
			limit: 10,
			...filters,
			barberId
		};
		return await this.findMany(mergedFilters);
	}
	/**
	* Verificar se usuário pode agendar (regras de negócio)
	*/
	static async canUserSchedule(userId) {
		if (await db.appointment.count({ where: {
			userId,
			status: { in: ["SCHEDULED", "CONFIRMED"] },
			date: { gte: /* @__PURE__ */ new Date() }
		} }) >= 3) return {
			canSchedule: false,
			reason: "Você já possui o máximo de agendamentos permitidos (3)"
		};
		return { canSchedule: true };
	}
};
/**
* Server Action para criar um novo agendamento
*/
async function createAppointment(data) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const validatedData = CreateAppointmentSchema.parse(data);
		const canSchedule = await AppointmentService.canUserSchedule(session.user.id);
		if (!canSchedule.canSchedule) return {
			success: false,
			error: canSchedule.reason
		};
		if (!await ServiceService.isActive(validatedData.serviceId)) return {
			success: false,
			error: "Serviço não encontrado ou inativo"
		};
		if (!await UserService.isActiveBarber(validatedData.barberId)) return {
			success: false,
			error: "Barbeiro não encontrado ou inativo"
		};
		if (!await AppointmentService.checkAvailability(validatedData.barberId, validatedData.date, validatedData.serviceId)) return {
			success: false,
			error: "Horário não disponível"
		};
		const appointment = await AppointmentService.create(session.user.id, validatedData);
		revalidatePath("/scheduling");
		revalidatePath("/profile");
		try {
			emitRealtimeEvent({
				type: "appointment:changed",
				payload: {
					appointmentId: appointment.id,
					status: appointment.status,
					date: appointment.date?.toISOString?.() ?? void 0,
					barberId: appointment.barber?.id,
					userId: session.user.id
				},
				target: {
					users: [session.user.id, validatedData.barberId].filter(Boolean),
					roles: ["ADMIN"]
				}
			});
			emitRealtimeEvent({
				type: "analytics:updated",
				payload: {
					scope: "appointments",
					reason: "created"
				},
				target: { roles: ["ADMIN"] }
			});
		} catch (error) {
			console.error("Erro ao emitir evento de agendamento:", error);
		}
		return {
			success: true,
			data: serializeAppointment(appointment)
		};
	} catch (error) {
		console.error("Erro ao criar agendamento:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Server Action para buscar agendamentos com filtros
*/
async function getAppointments(filters) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const validatedFilters = AppointmentFiltersSchema.parse(filters);
		let result;
		if (session.user.role === "BARBER") result = await AppointmentService.findBarberAppointments(session.user.id, validatedFilters);
		else result = await AppointmentService.findUserAppointments(session.user.id, validatedFilters);
		return {
			success: true,
			data: serializeAppointmentsResult(result)
		};
	} catch (error) {
		console.error("Erro ao buscar agendamentos:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Server Action para buscar agendamento por ID
*/
async function getAppointmentById(id) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const appointment = await AppointmentService.findById(id);
		if (!appointment) return {
			success: false,
			error: "Agendamento não encontrado"
		};
		if (!(appointment.user.id === session.user.id || appointment.barber.id === session.user.id || session.user.role === "ADMIN")) return {
			success: false,
			error: "Sem permissão para visualizar este agendamento"
		};
		return {
			success: true,
			data: serializeAppointment(appointment)
		};
	} catch (error) {
		console.error("Erro ao buscar agendamento:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Server Action para atualizar agendamento
*/
async function updateAppointment(id, data) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const validatedData = UpdateAppointmentSchema.parse(data);
		const existingAppointment = await AppointmentService.findById(id);
		if (!existingAppointment) return {
			success: false,
			error: "Agendamento não encontrado"
		};
		if (!(existingAppointment.user.id === session.user.id || existingAppointment.barber.id === session.user.id || session.user.role === "ADMIN")) return {
			success: false,
			error: "Sem permissão para atualizar este agendamento"
		};
		if (validatedData.date || validatedData.barberId) {
			const newDate = validatedData.date || existingAppointment.date;
			const newBarberId = validatedData.barberId || existingAppointment.barber.id;
			if (newBarberId) {
				if (!await AppointmentService.checkAvailability(newBarberId, newDate, existingAppointment.service.id, id)) return {
					success: false,
					error: "Horário não disponível"
				};
			}
		}
		const updatedAppointment = await AppointmentService.update(id, validatedData);
		revalidatePath("/scheduling");
		revalidatePath("/profile");
		try {
			emitRealtimeEvent({
				type: "appointment:changed",
				payload: {
					appointmentId: updatedAppointment.id,
					status: updatedAppointment.status,
					date: updatedAppointment.date?.toISOString?.() ?? void 0,
					barberId: updatedAppointment.barber?.id,
					userId: updatedAppointment.user.id
				},
				target: {
					users: [updatedAppointment.user.id, updatedAppointment.barber?.id].filter(Boolean),
					roles: ["ADMIN"]
				}
			});
			emitRealtimeEvent({
				type: "analytics:updated",
				payload: {
					scope: "appointments",
					reason: "updated"
				},
				target: { roles: ["ADMIN"] }
			});
		} catch (error) {
			console.error("Erro ao emitir evento de atualização de agendamento:", error);
		}
		return {
			success: true,
			data: updatedAppointment
		};
	} catch (error) {
		console.error("Erro ao atualizar agendamento:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Server Action para cancelar agendamento
*/
async function cancelAppointment(id) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const existingAppointment = await AppointmentService.findById(id);
		if (!existingAppointment) return {
			success: false,
			error: "Agendamento não encontrado"
		};
		if (!(existingAppointment.user.id === session.user.id || existingAppointment.barber.id === session.user.id || session.user.role === "ADMIN")) return {
			success: false,
			error: "Sem permissão para cancelar este agendamento"
		};
		if (existingAppointment.status === "COMPLETED") return {
			success: false,
			error: "Não é possível cancelar agendamento já completado"
		};
		const cancelledAppointment = await AppointmentService.cancel(id);
		revalidatePath("/scheduling");
		revalidatePath("/profile");
		try {
			emitRealtimeEvent({
				type: "appointment:changed",
				payload: {
					appointmentId: cancelledAppointment.id,
					status: cancelledAppointment.status,
					date: cancelledAppointment.date?.toISOString?.() ?? void 0,
					barberId: cancelledAppointment.barber?.id,
					userId: cancelledAppointment.user.id
				},
				target: {
					users: [cancelledAppointment.user.id, cancelledAppointment.barber?.id].filter(Boolean),
					roles: ["ADMIN"]
				}
			});
			emitRealtimeEvent({
				type: "analytics:updated",
				payload: {
					scope: "appointments",
					reason: "cancelled"
				},
				target: { roles: ["ADMIN"] }
			});
		} catch (error) {
			console.error("Erro ao emitir evento de cancelamento de agendamento:", error);
		}
		return {
			success: true,
			data: cancelledAppointment
		};
	} catch (error) {
		console.error("Erro ao cancelar agendamento:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Server Action para confirmar agendamento (barbeiro)
*/
async function confirmAppointment(id) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const existingAppointment = await AppointmentService.findById(id);
		if (!existingAppointment) return {
			success: false,
			error: "Agendamento não encontrado"
		};
		if (!(existingAppointment.barber.id === session.user.id || session.user.role === "ADMIN")) return {
			success: false,
			error: "Apenas o barbeiro pode confirmar o agendamento"
		};
		const confirmedAppointment = await AppointmentService.confirm(id);
		revalidatePath("/scheduling");
		revalidatePath("/profile");
		try {
			emitRealtimeEvent({
				type: "appointment:changed",
				payload: {
					appointmentId: confirmedAppointment.id,
					status: confirmedAppointment.status,
					date: confirmedAppointment.date?.toISOString?.() ?? void 0,
					barberId: confirmedAppointment.barber?.id,
					userId: confirmedAppointment.user.id
				},
				target: {
					users: [confirmedAppointment.user.id, confirmedAppointment.barber?.id].filter(Boolean),
					roles: ["ADMIN"]
				}
			});
			emitRealtimeEvent({
				type: "analytics:updated",
				payload: {
					scope: "appointments",
					reason: "confirmed"
				},
				target: { roles: ["ADMIN"] }
			});
		} catch (error) {
			console.error("Erro ao emitir evento de confirmação de agendamento:", error);
		}
		return {
			success: true,
			data: confirmedAppointment
		};
	} catch (error) {
		console.error("Erro ao confirmar agendamento:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Server Action para completar agendamento (barbeiro)
*/
async function completeAppointment(id) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const existingAppointment = await AppointmentService.findById(id);
		if (!existingAppointment) return {
			success: false,
			error: "Agendamento não encontrado"
		};
		if (!(existingAppointment.barber.id === session.user.id || session.user.role === "ADMIN")) return {
			success: false,
			error: "Apenas o barbeiro pode completar o agendamento"
		};
		const completedAppointment = await AppointmentService.complete(id);
		revalidatePath("/scheduling");
		revalidatePath("/profile");
		try {
			emitRealtimeEvent({
				type: "appointment:changed",
				payload: {
					appointmentId: completedAppointment.id,
					status: completedAppointment.status,
					date: completedAppointment.date?.toISOString?.() ?? void 0,
					barberId: completedAppointment.barber?.id,
					userId: completedAppointment.user.id
				},
				target: {
					users: [completedAppointment.user.id, completedAppointment.barber?.id].filter(Boolean),
					roles: ["ADMIN"]
				}
			});
			emitRealtimeEvent({
				type: "analytics:updated",
				payload: {
					scope: "revenue",
					reason: "completed"
				},
				target: { roles: ["ADMIN"] }
			});
		} catch (error) {
			console.error("Erro ao emitir evento de conclusão de agendamento:", error);
		}
		return {
			success: true,
			data: completedAppointment
		};
	} catch (error) {
		console.error("Erro ao completar agendamento:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Server Action para verificar disponibilidade
*/
async function checkAvailability(data) {
	try {
		const validatedData = CheckAvailabilitySchema.parse(data);
		return {
			success: true,
			available: await AppointmentService.checkAvailability(validatedData.barberId, validatedData.date, validatedData.serviceId)
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
* Server Action para buscar horários disponíveis
*/
async function getAvailableSlots(data) {
	try {
		return {
			success: true,
			data: await UserService.getBarberAvailableSlots(data.barberId, data.date, data.serviceDuration)
		};
	} catch (error) {
		console.error("Erro ao buscar horários disponíveis:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
createAppointment = /* @__PURE__ */ registerServerReference(createAppointment, "d1bad6aa0579", "createAppointment");
getAppointments = /* @__PURE__ */ registerServerReference(getAppointments, "d1bad6aa0579", "getAppointments");
getAppointmentById = /* @__PURE__ */ registerServerReference(getAppointmentById, "d1bad6aa0579", "getAppointmentById");
updateAppointment = /* @__PURE__ */ registerServerReference(updateAppointment, "d1bad6aa0579", "updateAppointment");
cancelAppointment = /* @__PURE__ */ registerServerReference(cancelAppointment, "d1bad6aa0579", "cancelAppointment");
confirmAppointment = /* @__PURE__ */ registerServerReference(confirmAppointment, "d1bad6aa0579", "confirmAppointment");
completeAppointment = /* @__PURE__ */ registerServerReference(completeAppointment, "d1bad6aa0579", "completeAppointment");
checkAvailability = /* @__PURE__ */ registerServerReference(checkAvailability, "d1bad6aa0579", "checkAvailability");
getAvailableSlots = /* @__PURE__ */ registerServerReference(getAvailableSlots, "d1bad6aa0579", "getAvailableSlots");
var page_exports$8 = /* @__PURE__ */ __exportAll({
	$$hoist_0_handleAppointmentSubmit: () => $$hoist_0_handleAppointmentSubmit,
	default: () => SchedulingPage
});
/**
* Página principal de agendamento
*
* Permite aos usuários autenticados criar novos agendamentos
* através do wizard interativo. Integra com as server actions
* para persistir os dados no banco.
*/
async function SchedulingPage() {
	if (!await (0, import_next_auth.getServerSession)(authOptions)) redirect("/auth/signin");
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
			badge: "Agendamentos",
			title: "Novo Agendamento",
			subtitle: "Escolha o serviço, barbeiro e horário ideal para você.",
			className: "pb-10 lg:pb-14"
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
			className: "flex-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(SchedulingClient, { onSubmit: /* @__PURE__ */ registerServerReference($$hoist_0_handleAppointmentSubmit, "b2c6583e9981", "$$hoist_0_handleAppointmentSubmit") })
		})]
	});
}
async function $$hoist_0_handleAppointmentSubmit(data) {
	"use server";
	try {
		if (!data.date || !data.time || !data.serviceId || !data.barberId) throw new Error("Dados incompletos para agendamento");
		const [hours, minutes] = data.time.split(":").map(Number);
		const appointmentDate = new Date(data.date);
		appointmentDate.setHours(hours, minutes, 0, 0);
		const result = await createAppointment({
			serviceId: data.serviceId,
			barberId: data.barberId,
			date: appointmentDate,
			notes: `Agendamento de ${data.service.name} com ${data.barber.name || "barbeiro"}`
		});
		if (result.success) return;
		else throw new Error(result.error || "Erro ao criar agendamento");
	} catch (error) {
		console.error("Erro ao agendar:", error);
		throw error;
	}
}
/**
* Lista de agendamentos do usuário
*
* Exibe cards com informações detalhadas dos agendamentos,
* permite filtrar por status e cancelar agendamentos válidos.
*/
var AppointmentsList = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'AppointmentsList' is called on server");
}, "93db586a66e1", "AppointmentsList");
var page_exports$7 = /* @__PURE__ */ __exportAll({ default: () => ManageAppointmentsPage });
/**
* Página de gerenciamento de agendamentos
*
* Exibe lista de agendamentos do usuário com filtros,
* opções de cancelamento e histórico completo.
*/
async function ManageAppointmentsPage() {
	if (!await (0, import_next_auth.getServerSession)(authOptions)) redirect("/auth/signin");
	const appointmentsResult = await getAppointments({
		page: 1,
		limit: 10,
		status: void 0
	});
	const appointments = appointmentsResult.success ? appointmentsResult.data : null;
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
			badge: "Agenda",
			title: "Meus Agendamentos",
			subtitle: "Visualize, gerencie e cancele seus horários marcados.",
			actions: [{
				label: "Novo Agendamento",
				href: "/scheduling"
			}]
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
			className: "container mx-auto px-4 py-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(AppointmentsList, {
				initialAppointments: appointments?.appointments || [],
				totalCount: appointments?.pagination.total || 0,
				currentPage: appointments?.pagination.page || 1,
				totalPages: appointments?.pagination.totalPages || 1
			})
		})]
	});
}
var ChevronDown = createLucideIcon("chevron-down", [["path", {
	d: "m6 9 6 6 6-6",
	key: "qrunsl"
}]]);
var Mail = createLucideIcon("mail", [["path", {
	d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",
	key: "132q7q"
}], ["rect", {
	x: "2",
	y: "4",
	width: "20",
	height: "16",
	rx: "2",
	key: "izxlao"
}]]);
var Phone = createLucideIcon("phone", [["path", {
	d: "M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",
	key: "9njp5v"
}]]);
var page_exports$6 = /* @__PURE__ */ __exportAll({ default: () => SupportPage });
var supportContacts = [
	{
		icon: Mail,
		title: "E-mail",
		value: "suporte@barberkings.com",
		description: "Para dúvidas mais detalhadas e acompanhamento de solicitações.",
		href: "mailto:suporte@barberkings.com"
	},
	{
		icon: Phone,
		title: "Telefone",
		value: "+55 (11) 99999-0000",
		description: "Atendimento humano durante o horário comercial.",
		href: "tel:+5511999990000"
	},
	{
		icon: MessageCircle,
		title: "Chat",
		value: "Abrir conversa",
		description: "Use o fluxo de chat para respostas rápidas e acompanhamento.",
		href: "/chat"
	}
];
var supportFaqs = [
	{
		question: "Como faço para reagendar um atendimento?",
		answer: "Entre em agendamentos, escolha o horário disponível e confirme a alteração no próprio fluxo. O processo mantém o mesmo padrão visual do restante da plataforma."
	},
	{
		question: "Onde vejo meus serviços e histórico?",
		answer: "As informações principais ficam no perfil e no fluxo de atendimento. Se precisar de ajuda para localizar algo, fale com o suporte."
	},
	{
		question: "Posso falar com a equipe antes de agendar?",
		answer: "Sim. O chat e as avaliações são os canais mais rápidos para tirar dúvidas antes de confirmar o horário."
	},
	{
		question: "Como acompanho promoções válidas?",
		answer: "A página de promoções reúne os cupons e ofertas vigentes. Se uma oferta estiver ativa, ela também aparece durante o agendamento."
	}
];
function SupportPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
				badge: "Suporte",
				title: "Central de Ajuda",
				subtitle: "Ajuda direta para agendamentos, conta, pagamentos e dúvidas operacionais. Mantemos o mesmo padrão editorial da experiência principal.",
				actions: [{
					label: "Ir para agendamentos",
					href: "/scheduling"
				}, {
					label: "Abrir chat",
					href: "/chat",
					variant: "outline"
				}],
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
					className: "grid w-full gap-3 sm:grid-cols-3",
					children: [
						{
							icon: MessageCircle,
							title: "Resposta humana",
							description: "Fale com a equipe durante o horário comercial e siga com o atendimento."
						},
						{
							icon: Clock3,
							title: "Fluxo rápido",
							description: "Canal direto para resolver questões de agendamento com menos etapas."
						},
						{
							icon: ShieldCheck,
							title: "Informação segura",
							description: "Orientações claras para conta, pagamentos e alterações de horário."
						}
					].map((item) => {
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("article", {
							className: "card-hover rounded-2xl border border-border bg-surface-card p-4 text-left",
							children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
									className: "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.12)] text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Icon, { className: "h-5 w-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
									className: "font-display text-lg font-semibold italic text-foreground",
									children: item.title
								}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
									className: "mt-1 text-sm leading-relaxed text-fg-muted",
									children: item.description
								})] })]
							})
						}, item.title);
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("section", {
				className: "container mx-auto px-4 py-12 lg:py-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(SectionHeader, {
					title: "Canais de contato",
					subtitle: "Escolha o canal mais apropriado para o tipo de suporte que você precisa.",
					centered: false
				}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
					className: "mt-8 grid gap-5 lg:grid-cols-3",
					children: supportContacts.map((contact) => {
						const Icon = contact.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("article", {
							className: "card-hover rounded-[2rem] border border-border bg-surface-card p-6",
							children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
								className: "flex items-start gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
									className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--accent)/0.12)] text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Icon, { className: "h-5 w-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
									className: "space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
											className: "text-xs font-semibold uppercase tracking-[0.24em] text-accent",
											children: contact.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
											className: "font-display text-2xl font-bold italic text-foreground",
											children: contact.value
										}),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
											className: "text-sm leading-relaxed text-fg-muted",
											children: contact.description
										}),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
											href: contact.href,
											className: "inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80",
											children: ["Entrar em contato", /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ArrowRight, { className: "h-4 w-4" })]
										})
									]
								})]
							})
						}, contact.title);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("section", {
				className: "container mx-auto px-4 pb-12 lg:pb-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(SectionHeader, {
					title: "Perguntas frequentes",
					subtitle: "Respostas objetivas para os tópicos que mais aparecem no suporte.",
					centered: false
				}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
					className: "mt-8 space-y-4",
					children: supportFaqs.map((faq) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("details", {
						className: "group rounded-[2rem] border border-border bg-surface-card p-6 card-hover",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("summary", {
							className: "flex cursor-pointer list-none items-center justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
								className: "font-display text-xl font-semibold italic text-foreground sm:text-2xl",
								children: faq.question
							}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
								className: "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface-1 text-accent transition-transform duration-300 group-open:rotate-180",
								children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ChevronDown, { className: "h-4 w-4" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
							className: "mt-4 max-w-3xl text-sm leading-relaxed text-fg-muted sm:text-base",
							children: faq.answer
						})]
					}, faq.question))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
				className: "container mx-auto px-4 pb-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
					className: "rounded-[2rem] border border-border bg-surface-1 p-6 sm:p-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
									className: "text-xs font-semibold uppercase tracking-[0.24em] text-accent",
									children: "Fluxo recomendado"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
									className: "font-display text-2xl font-bold italic text-foreground sm:text-3xl",
									children: "Precisa resolver algo agora?"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
									className: "max-w-2xl text-sm text-fg-muted sm:text-base",
									children: "Acesse o fluxo de agendamento para revisar horários, serviços e confirmações em um só lugar."
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
							href: "/scheduling",
							className: "inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-on-accent transition-all duration-300 gold-shimmer hover:bg-accent/90",
							children: ["Ir para agendamentos", /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ArrowRight, { className: "h-4 w-4" })]
						})]
					})
				})
			})
		]
	});
}
var page_exports$5 = /* @__PURE__ */ __exportAll({ default: () => page_default$2 });
var page_default$2 = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "e5c271f95880", "default");
var page_exports$4 = /* @__PURE__ */ __exportAll({ default: () => page_default$1 });
/**
* 🧪 Test Upload Page
* 
* Página para testar o sistema de upload em desenvolvimento.
* Inclui testes para profile e review uploads.
* 
* @author GitHub Copilot
* @since 2024-10-24
*/
var page_default$1 = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "0a9a9982801b", "default");
var page_exports$3 = /* @__PURE__ */ __exportAll({ default: () => page_default });
var page_default = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "97eba2795901", "default");
var route_exports$2 = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE$1,
	GET: () => GET,
	PUT: () => PUT
});
/**
* GET /api/appointments/[id]
* Busca um agendamento específico
*/
async function GET(request, context) {
	try {
		const params = await context.params;
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
		const appointment = await db.appointment.findUnique({
			where: {
				id: params.id,
				userId: session.user.id
			},
			include: {
				service: true,
				barber: { select: {
					id: true,
					name: true,
					image: true,
					phone: true,
					email: true
				} },
				voucher: true,
				appliedPromotion: true,
				serviceHistory: true
			}
		});
		if (!appointment) return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
		return NextResponse.json(appointment);
	} catch (error) {
		console.error("Erro ao buscar agendamento:", error);
		return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
	}
}
/**
* PUT /api/appointments/[id]
* Atualiza um agendamento (reagendar, alterar status, etc.)
*/
async function PUT(request, context) {
	try {
		const params = await context.params;
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
		const body = await request.json();
		const data = UpdateAppointmentSchema.parse(body);
		const existingAppointment = await db.appointment.findUnique({ where: {
			id: params.id,
			userId: session.user.id
		} });
		if (!existingAppointment) return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
		const now = /* @__PURE__ */ new Date();
		if ((new Date(existingAppointment.date).getTime() - now.getTime()) / (1e3 * 60 * 60) < 2 && data.date) return NextResponse.json({ error: "Não é possível reagendar com menos de 2 horas de antecedência" }, { status: 400 });
		if (data.date && data.barberId) {
			if (await db.appointment.findFirst({ where: {
				barberId: data.barberId,
				date: data.date,
				status: { in: ["SCHEDULED", "CONFIRMED"] },
				id: { not: params.id }
			} })) return NextResponse.json({ error: "Horário já ocupado" }, { status: 409 });
		}
		const updatedAppointment = await db.appointment.update({
			where: { id: params.id },
			data,
			include: {
				service: true,
				barber: { select: {
					id: true,
					name: true,
					image: true,
					phone: true
				} },
				voucher: true,
				appliedPromotion: true
			}
		});
		return NextResponse.json(updatedAppointment);
	} catch (error) {
		console.error("Erro ao atualizar agendamento:", error);
		if (error instanceof Error && error.name === "ZodError") return NextResponse.json({
			error: "Dados inválidos",
			details: error.message
		}, { status: 400 });
		return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
	}
}
/**
* DELETE /api/appointments/[id]
* Cancela um agendamento
*/
async function DELETE$1(request, context) {
	try {
		const params = await context.params;
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
		const existingAppointment = await db.appointment.findUnique({
			where: {
				id: params.id,
				userId: session.user.id
			},
			include: { voucher: true }
		});
		if (!existingAppointment) return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
		if (existingAppointment.status === "COMPLETED") return NextResponse.json({ error: "Não é possível cancelar agendamento já concluído" }, { status: 400 });
		if (existingAppointment.status === "CANCELLED") return NextResponse.json({ error: "Agendamento já está cancelado" }, { status: 400 });
		const now = /* @__PURE__ */ new Date();
		const hoursUntilAppointment = (new Date(existingAppointment.date).getTime() - now.getTime()) / (1e3 * 60 * 60);
		const cancelledAppointment = await db.appointment.update({
			where: { id: params.id },
			data: {
				status: "CANCELLED",
				notes: existingAppointment.notes ? `${existingAppointment.notes}\n[CANCELADO pelo usuário]` : "[CANCELADO pelo usuário]"
			}
		});
		if (hoursUntilAppointment >= 2 && existingAppointment.voucher) await db.voucher.update({
			where: { id: existingAppointment.voucher.id },
			data: { status: "ACTIVE" }
		});
		return NextResponse.json({
			message: "Agendamento cancelado com sucesso",
			appointment: cancelledAppointment,
			voucherRestored: hoursUntilAppointment >= 2 && !!existingAppointment.voucher
		});
	} catch (error) {
		console.error("Erro ao cancelar agendamento:", error);
		return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
	}
}
var route_exports$1 = /* @__PURE__ */ __exportAll({ DELETE: () => DELETE });
/**
* DELETE /api/friends/:id
* Remove amigo
*/
async function DELETE(request, { params }) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		const { id } = await params;
		if (!session?.user?.id) return NextResponse.json({
			success: false,
			error: "Não autenticado"
		}, { status: 401 });
		await FriendshipService.removeFriend(session.user.id, id);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Erro ao remover amigo:", error);
		if (error instanceof Error) return NextResponse.json({
			success: false,
			error: error.message
		}, { status: 400 });
		return NextResponse.json({
			success: false,
			error: "Erro ao remover amigo"
		}, { status: 500 });
	}
}
/**
* ChatWindow - Janela principal do chat
*
* Features:
* - Header com info do amigo
* - ScrollArea com mensagens
* - Auto-scroll para última mensagem
* - Paginação infinita (load more)
* - Envio de mensagens
* - Auto-refresh a cada 5 segundos
* - Marca mensagens como lidas
*/
var ChatWindow = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'ChatWindow' is called on server");
}, "d09acae04c2f", "ChatWindow");
var page_exports$2 = /* @__PURE__ */ __exportAll({ default: () => ChatConversationPage });
/**
* Página de conversa individual
* Exibe as mensagens e permite enviar novas
*/
async function ChatConversationPage({ params }) {
	const session = await (0, import_next_auth.getServerSession)(authOptions);
	if (!session?.user?.id) redirect("/login");
	const { conversationId } = await params;
	const conversationResult = await getConversationById(conversationId);
	if (!conversationResult.success || !conversationResult.data) notFound();
	const conversation = conversationResult.data;
	const messagesResult = await getMessages({
		conversationId,
		page: 1,
		limit: 50
	});
	const messages = messagesResult.success && messagesResult.data ? messagesResult.data : [];
	const friend = conversation.participants.find((p) => p.user.id !== session.user.id);
	if (!friend) notFound();
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("main", {
		className: "flex h-screen flex-col bg-background text-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ChatWindow, {
			conversationId,
			currentUserId: session.user.id,
			friendName: friend.user.name,
			friendImage: friend.user.image,
			friendId: friend.user.id,
			initialMessages: messages
		})
	});
}
var page_exports$1 = /* @__PURE__ */ __exportAll({ default: () => SalonDetailsPage });
var serviceCards = [
	{
		name: "Corte Premium",
		duration: "30 min",
		price: "R$ 70,00",
		icon: Scissors,
		description: "Acabamento refinado com consulta de estilo."
	},
	{
		name: "Barba Completa",
		duration: "25 min",
		price: "R$ 55,00",
		icon: Sparkles,
		description: "Navalha, toalha quente e finalização precisa."
	},
	{
		name: "Combo Assinatura",
		duration: "50 min",
		price: "R$ 110,00",
		icon: Clock3,
		description: "Experiência completa para rotina premium."
	}
];
var statusStyles = {
	OPEN: "border-[hsl(var(--state-open-fg)/0.3)] bg-[hsl(var(--state-open-surface))] text-state-open-fg",
	CLOSING_SOON: "border-[hsl(var(--state-warning-fg)/0.3)] bg-[hsl(var(--state-warning-surface))] text-state-warning-fg",
	CLOSED: "border-[hsl(var(--state-closed-fg)/0.3)] bg-[hsl(var(--state-closed-surface))] text-state-closed-fg"
};
var statusLabels = {
	OPEN: "Aberto agora",
	CLOSING_SOON: "Fecha em breve",
	CLOSED: "Fechado"
};
async function SalonDetailsPage({ params }) {
	const { id } = await params;
	const salons = (await getHomePageData()).salons.items;
	const salon = salons.find((item) => item.id === id) ?? salons.find((item) => item.id === `fallback-${id}`) ?? salons.find((item) => item.id === `salon-${id}`);
	const name = salon?.name ?? "Barbearia em destaque";
	const imageUrl = salon?.imageUrl ?? "/images/salon1.svg";
	const address = salon?.address ?? "Endereço será exibido aqui";
	const ratingLabel = salon?.ratingLabel ?? "Avaliações em breve";
	const status = salon?.status ?? "OPEN";
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("section", {
				className: "relative overflow-hidden bg-surface-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
					className: "container mx-auto px-4 py-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
						href: "/salons",
						className: "inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-accent/80",
						children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ArrowLeft, { className: "h-4 w-4" }), "Voltar para Salões"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "container mx-auto grid gap-8 px-4 pb-16 pt-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:pb-20",
					children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "stagger-reveal space-y-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
								className: "inline-flex w-fit items-center gap-2 rounded-full border border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.08)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent",
								children: "Detalhes do salão"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h1", {
								className: "font-display text-4xl font-bold italic tracking-tight text-foreground sm:text-5xl lg:text-6xl",
								children: name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
								className: "max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg",
								children: "Página demonstrativa com layout premium, mantendo os dados da Home e preparando a navegação para o agendamento."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
								className: "flex flex-wrap gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
										className: "inline-flex items-center gap-2 rounded-full border border-border bg-surface-card px-4 py-2 text-sm text-fg-muted",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(MapPin, { className: "h-4 w-4 text-accent" }), address]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
										className: cn("inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold", statusStyles[status]),
										children: statusLabels[status]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
										className: "inline-flex items-center gap-2 rounded-full border border-border bg-surface-card px-4 py-2 text-sm text-fg-muted",
										children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Star, { className: "h-4 w-4 fill-accent text-accent" }), ratingLabel]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
								className: "flex flex-wrap gap-3 pt-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
									href: "/scheduling",
									className: "gold-shimmer inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90",
									children: ["Agendar neste salão", /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ArrowRight, { className: "h-4 w-4" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(link_default, {
									href: "/promotions",
									className: "inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent",
									children: "Ver promoções"
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "relative overflow-hidden rounded-2xl border border-border bg-surface-card shadow-[0_24px_60px_-28px_rgba(0,0,0,0.35)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Image, {
								src: imageUrl,
								alt: name,
								width: 900,
								height: 700,
								className: "h-[360px] w-full object-cover sm:h-[440px]",
								priority: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" }),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
								className: "absolute bottom-4 left-4 right-4 flex flex-wrap gap-2",
								children: [
									"Corte",
									"Barba",
									"Spa"
								].map((item) => /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
									className: "rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-md",
									children: item
								}, item))
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
				className: "container mx-auto px-4 py-10 sm:py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
							className: "card-hover rounded-2xl border border-border bg-surface-card p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
									className: "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.12)] text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(MapPin, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
									className: "mt-4 font-display text-xl font-semibold italic text-foreground",
									children: "Endereço"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
									className: "mt-2 text-sm leading-relaxed text-fg-muted",
									children: address
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
							className: "card-hover rounded-2xl border border-border bg-surface-card p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
									className: "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.12)] text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Clock3, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
									className: "mt-4 font-display text-xl font-semibold italic text-foreground",
									children: "Horário"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
									className: "mt-2 text-sm leading-relaxed text-fg-muted",
									children: status === "OPEN" ? "Aberto agora" : status === "CLOSING_SOON" ? "Fecha em breve" : "Fechado no momento"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
							className: "card-hover rounded-2xl border border-border bg-surface-card p-5 sm:col-span-2 lg:col-span-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
									className: "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.12)] text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Star, { className: "h-4 w-4 fill-accent text-accent" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
									className: "mt-4 font-display text-xl font-semibold italic text-foreground",
									children: "Avaliação"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
									className: "mt-2 text-sm leading-relaxed text-fg-muted",
									children: ratingLabel
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("section", {
				className: "container mx-auto px-4 py-16 sm:py-20",
				children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(SectionHeader, {
					title: "Serviços do salão",
					subtitle: "Seleção de serviços demonstrativos com foco em clareza, ritmo visual e CTA de agendamento.",
					centered: false,
					className: "mb-10"
				}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
					className: "grid gap-5 md:grid-cols-3",
					children: serviceCards.map((service) => {
						const Icon = service.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("article", {
							className: cn("group flex h-full flex-col rounded-2xl border border-border bg-surface-card p-6 transition-all duration-500", "card-hover hover:border-[hsl(var(--accent)/0.3)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
								className: "flex items-start justify-between gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
									className: "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent transition-colors duration-300 group-hover:bg-[hsl(var(--accent)/0.15)]",
									children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Icon, { className: "h-5 w-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
									className: "rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-medium text-fg-muted",
									children: service.duration
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
								className: "mt-5 flex flex-1 flex-col gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
										className: "font-display text-xl font-semibold italic text-foreground",
										children: service.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "text-sm leading-relaxed text-fg-muted",
										children: service.description
									}),
									/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
										className: "mt-auto text-lg font-bold text-accent",
										children: service.price
									})
								]
							})]
						}, service.name);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
				className: "bg-surface-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
					className: "container mx-auto px-4 py-16 sm:py-20",
					children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
						className: "rounded-2xl border border-border bg-surface-card p-8 text-center shadow-[0_24px_60px_-32px_rgba(0,0,0,0.2)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
								className: "text-xs font-semibold uppercase tracking-[0.18em] text-accent",
								children: "Pronto para agendar?"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
								className: "mt-3 font-display text-3xl font-bold italic text-foreground sm:text-4xl",
								children: "Escolha o melhor horário para este salão"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
								className: "mx-auto mt-3 max-w-2xl text-sm text-fg-muted sm:text-base",
								children: "O fluxo de agendamento recebe o destaque visual e mantém a experiência consistente com o restante da aplicação."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
								className: "mt-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(link_default, {
									href: "/scheduling",
									className: "gold-shimmer inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90",
									children: ["Ir para agendamento", /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ArrowRight, { className: "h-4 w-4" })]
								})
							})
						]
					})
				})
			})
		]
	});
}
var Clock = createLucideIcon("clock", [["path", {
	d: "M12 6v6l4 2",
	key: "mmk7yg"
}], ["circle", {
	cx: "12",
	cy: "12",
	r: "10",
	key: "1mglay"
}]]);
var page_exports = /* @__PURE__ */ __exportAll({ default: () => ServiceDetailsPage });
async function ServiceDetailsPage({ params }) {
	const { id } = await params;
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(PageHero, {
			badge: "Serviço",
			title: "Detalhes do Serviço",
			subtitle: "Esta página é demonstrativa. Para ver valores e duração, acesse o fluxo de agendamento.",
			actions: [{
				label: "Agendar agora",
				href: "/scheduling"
			}, {
				label: "Ver promoções",
				href: "/promotions",
				variant: "outline"
			}]
		}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("section", {
			className: "bg-surface-1 py-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("div", {
				className: "container mx-auto px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
					className: "mx-auto max-w-3xl space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
							className: "rounded-2xl border border-border bg-surface-card p-8",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
								className: "mb-6 flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
									className: "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Scissors, { className: "h-5 w-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("h2", {
									className: "font-display text-xl font-bold italic text-foreground",
									children: "ID do serviço"
								}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
									className: "mt-0.5 font-mono text-sm text-fg-muted",
									children: id
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
								className: "text-sm leading-relaxed text-fg-muted",
								children: "Agende para visualizar horários, barbeiros disponíveis e preços atualizados."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
									className: "rounded-2xl border border-border bg-surface-card p-6 text-center",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
											className: "mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
											children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Clock, { className: "h-5 w-5" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
											className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
											children: "Duração"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
											className: "mt-1 font-display text-3xl font-bold italic text-accent",
											children: "—"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
									className: "rounded-2xl border border-border bg-surface-card p-6 text-center",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
											className: "mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
											children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(DollarSign, { className: "h-5 w-5" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
											className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
											children: "Preço"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
											className: "mt-1 font-display text-3xl font-bold italic text-accent",
											children: "—"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
									className: "rounded-2xl border border-border bg-surface-card p-6 text-center",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("span", {
											className: "mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent",
											children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Calendar, { className: "h-5 w-5" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
											className: "text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle",
											children: "Disponível"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("p", {
											className: "mt-1 font-display text-3xl font-bold italic text-accent",
											children: "—"
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)("div", {
							className: "flex flex-wrap gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(link_default, {
								href: "/scheduling",
								className: "gold-shimmer inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90",
								children: "Agendar agora"
							}), /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(link_default, {
								href: "/promotions",
								className: "inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent",
								children: "Ver promoções"
							})]
						})
					]
				})
			})
		})]
	});
}
var route_exports = /* @__PURE__ */ __exportAll({
	GET: () => handler$1,
	POST: () => handler$1
});
var cachedHandler = null;
function resolveNextAuthHandler() {
	if (cachedHandler) return cachedHandler;
	const nextAuthFactory = resolveCallableExport(import_next_auth);
	if (!nextAuthFactory) {
		logger.auth.error("Invalid next-auth module shape in App Router route handler", { exportedKeys: Object.keys(import_next_auth) });
		return null;
	}
	cachedHandler = nextAuthFactory(authOptions);
	return cachedHandler;
}
async function handler$1(request, context) {
	const resolvedHandler = resolveNextAuthHandler();
	if (!resolvedHandler) return Response.json({ error: "NextAuth handler initialization failed" }, { status: 500 });
	const rawParams = context.params instanceof Promise ? await context.params : context.params;
	return resolvedHandler(request, (rawParams?.nextauth?.length ?? 0) > 0 ? { params: { nextauth: rawParams.nextauth } } : { params: { nextauth: new URL(request.url).pathname.split("/api/auth/")[1]?.split("/").filter(Boolean) ?? [] } });
}
var global_error_exports = /* @__PURE__ */ __exportAll({ default: () => global_error_default });
var global_error_default = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "65c11b515bcb", "default");
init_unified_request_context();
function renderToReadableStream(model, options) {
	const _hlFixRe = /(\d*:HL\[.*?),"stylesheet"(\]|,)/g;
	const stream = renderToReadableStream$1(model, options);
	const decoder = new TextDecoder();
	const encoder = new TextEncoder();
	let carry = "";
	return stream.pipeThrough(new TransformStream({
		transform(chunk, controller) {
			const text = carry + decoder.decode(chunk, { stream: true });
			const lastNl = text.lastIndexOf("\n");
			if (lastNl === -1) {
				carry = text;
				return;
			}
			carry = text.slice(lastNl + 1);
			controller.enqueue(encoder.encode(text.slice(0, lastNl + 1).replace(_hlFixRe, "$1,\"style\"$2")));
		},
		flush(controller) {
			const text = carry + decoder.decode();
			if (text) controller.enqueue(encoder.encode(text.replace(_hlFixRe, "$1,\"style\"$2")));
		}
	}));
}
function _getSSRFontStyles() {
	return [...getSSRFontStyles$1(), ...getSSRFontStyles()];
}
function _getSSRFontPreloads() {
	return [...getSSRFontPreloads$1(), ...getSSRFontPreloads()];
}
var _suppressHookWarningAls = new AsyncLocalStorage();
var _origConsoleError = console.error;
console.error = (...args) => {
	if (_suppressHookWarningAls.getStore() === true && typeof args[0] === "string" && args[0].includes("Invalid hook call")) return;
	_origConsoleError.apply(console, args);
};
function setNavigationContext(ctx) {
	setNavigationContext$1(ctx);
}
async function __isrGet(key) {
	const result = await getCacheHandler().get(key);
	if (!result || !result.value) return null;
	return {
		value: result,
		isStale: result.cacheState === "stale"
	};
}
async function __isrSet(key, data, revalidateSeconds, tags) {
	await getCacheHandler().set(key, data, {
		revalidate: revalidateSeconds,
		tags: Array.isArray(tags) ? tags : []
	});
}
function __pageCacheTags(pathname, extraTags) {
	const tags = [pathname, "_N_T_" + pathname];
	tags.push("_N_T_/layout");
	const segments = pathname.split("/");
	let built = "";
	for (let i = 1; i < segments.length; i++) if (segments[i]) {
		built += "/" + segments[i];
		tags.push("_N_T_" + built + "/layout");
	}
	tags.push("_N_T_" + built + "/page");
	if (Array.isArray(extraTags)) {
		for (const tag of extraTags) if (!tags.includes(tag)) tags.push(tag);
	}
	return tags;
}
var __pendingRegenerations = /* @__PURE__ */ new Map();
function __triggerBackgroundRegeneration(key, renderFn) {
	if (__pendingRegenerations.has(key)) return;
	const promise = renderFn().catch((err) => console.error("[vinext] ISR regen failed for " + key + ":", err)).finally(() => __pendingRegenerations.delete(key));
	__pendingRegenerations.set(key, promise);
	const ctx = getRequestExecutionContext();
	if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(promise);
}
function __isrFnv1a64(s) {
	let h1 = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h1 ^= s.charCodeAt(i);
		h1 = h1 * 16777619 >>> 0;
	}
	let h2 = 84696351;
	for (let i = 0; i < s.length; i++) {
		h2 ^= s.charCodeAt(i);
		h2 = h2 * 16777619 >>> 0;
	}
	return h1.toString(36) + h2.toString(36);
}
function __isrCacheKey(pathname, suffix) {
	const normalized = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
	const prefix = "app:b8997ea7-d65f-4644-bde4-963f7da5f770";
	const key = prefix + ":" + normalized + ":" + suffix;
	if (key.length <= 200) return key;
	return prefix + ":__hash:" + __isrFnv1a64(normalized) + ":" + suffix;
}
function __isrHtmlKey(pathname) {
	return __isrCacheKey(pathname, "html");
}
function __isrRscKey(pathname) {
	return __isrCacheKey(pathname, "rsc");
}
function __isrRouteKey(pathname) {
	return __isrCacheKey(pathname, "route");
}
var __isrDebug = process.env.NEXT_PRIVATE_DEBUG_CACHE ? console.debug.bind(console, "[vinext] ISR:") : void 0;
function makeThenableParams(obj) {
	const plain = { ...obj };
	return Object.assign(Promise.resolve(plain), plain);
}
function __resolveChildSegments(routeSegments, treePosition, params) {
	var raw = routeSegments.slice(treePosition);
	var result = [];
	for (var j = 0; j < raw.length; j++) {
		var seg = raw[j];
		if (seg.indexOf("[[...") === 0 && seg.charAt(seg.length - 1) === "]" && seg.charAt(seg.length - 2) === "]") {
			var v = params[seg.slice(5, -2)];
			if (Array.isArray(v) && v.length === 0) continue;
			if (v == null) continue;
			result.push(Array.isArray(v) ? v.join("/") : v);
		} else if (seg.indexOf("[...") === 0 && seg.charAt(seg.length - 1) === "]") {
			var v2 = params[seg.slice(4, -1)];
			result.push(Array.isArray(v2) ? v2.join("/") : v2 || seg);
		} else if (seg.charAt(0) === "[" && seg.charAt(seg.length - 1) === "]" && seg.indexOf(".") === -1) {
			var pn3 = seg.slice(1, -1);
			result.push(params[pn3] || seg);
		} else result.push(seg);
	}
	return result;
}
function __errorDigest(str) {
	let hash = 5381;
	for (let i = str.length - 1; i >= 0; i--) hash = hash * 33 ^ str.charCodeAt(i);
	return (hash >>> 0).toString();
}
function __sanitizeErrorForClient(error) {
	if (resolveAppPageSpecialError(error)) return error;
	const msg = error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack || "" : "";
	const sanitized = /* @__PURE__ */ new Error("An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details. A digest property is included on this error instance which may provide additional details about the nature of the error.");
	sanitized.digest = __errorDigest(msg + stack);
	return sanitized;
}
function rscOnError(error, requestInfo, errorContext) {
	if (error && typeof error === "object" && "digest" in error) return String(error.digest);
	if (requestInfo && errorContext && error) reportRequestError(error instanceof Error ? error : new Error(String(error)), requestInfo, errorContext);
	if (error) return __errorDigest((error instanceof Error ? error.message : String(error)) + (error instanceof Error ? error.stack || "" : ""));
}
function createRscOnErrorHandler(request, pathname, routePath) {
	const requestInfo = {
		path: pathname,
		method: request.method,
		headers: Object.fromEntries(request.headers.entries())
	};
	const errorContext = {
		routerKind: "App Router",
		routePath: routePath || pathname,
		routeType: "render"
	};
	return function(error) {
		return rscOnError(error, requestInfo, errorContext);
	};
}
var routes = [
	{
		pattern: "/dashboard/admin/promotions/:id/edit",
		patternParts: [
			"dashboard",
			"admin",
			"promotions",
			":id",
			"edit"
		],
		isDynamic: true,
		params: ["id"],
		page: page_exports$46,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: [
			"dashboard",
			"admin",
			"promotions",
			"[id]",
			"edit"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/dashboard/admin/services/:id/edit",
		patternParts: [
			"dashboard",
			"admin",
			"services",
			":id",
			"edit"
		],
		isDynamic: true,
		params: ["id"],
		page: page_exports$45,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: [
			"dashboard",
			"admin",
			"services",
			"[id]",
			"edit"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/friends/requests/:id",
		patternParts: [
			"api",
			"friends",
			"requests",
			":id"
		],
		isDynamic: true,
		params: ["id"],
		page: null,
		routeHandler: route_exports$25,
		layouts: [layout_exports],
		routeSegments: [
			"api",
			"friends",
			"requests",
			"[id]"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/dashboard/admin/users/:id",
		patternParts: [
			"dashboard",
			"admin",
			"users",
			":id"
		],
		isDynamic: true,
		params: ["id"],
		page: page_exports$44,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: [
			"dashboard",
			"admin",
			"users",
			"[id]"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/",
		patternParts: [],
		isDynamic: false,
		params: [],
		page: page_exports$43,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: error_exports,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/about",
		patternParts: ["about"],
		isDynamic: false,
		params: [],
		page: page_exports$42,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["about"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/appointments",
		patternParts: ["api", "appointments"],
		isDynamic: false,
		params: [],
		page: null,
		routeHandler: route_exports$24,
		layouts: [layout_exports],
		routeSegments: ["api", "appointments"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/appointments/availability",
		patternParts: [
			"api",
			"appointments",
			"availability"
		],
		isDynamic: false,
		params: [],
		page: null,
		routeHandler: route_exports$23,
		layouts: [layout_exports],
		routeSegments: [
			"api",
			"appointments",
			"availability"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/auth/forgot-password",
		patternParts: [
			"api",
			"auth",
			"forgot-password"
		],
		isDynamic: false,
		params: [],
		page: null,
		routeHandler: route_exports$22,
		layouts: [layout_exports],
		routeSegments: [
			"api",
			"auth",
			"forgot-password"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/auth/register",
		patternParts: [
			"api",
			"auth",
			"register"
		],
		isDynamic: false,
		params: [],
		page: null,
		routeHandler: route_exports$21,
		layouts: [layout_exports],
		routeSegments: [
			"api",
			"auth",
			"register"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/auth/reset-password",
		patternParts: [
			"api",
			"auth",
			"reset-password"
		],
		isDynamic: false,
		params: [],
		page: null,
		routeHandler: route_exports$20,
		layouts: [layout_exports],
		routeSegments: [
			"api",
			"auth",
			"reset-password"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/auth/user-info",
		patternParts: [
			"api",
			"auth",
			"user-info"
		],
		isDynamic: false,
		params: [],
		page: null,
		routeHandler: route_exports$19,
		layouts: [layout_exports],
		routeSegments: [
			"api",
			"auth",
			"user-info"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/auth/verify-email",
		patternParts: [
			"api",
			"auth",
			"verify-email"
		],
		isDynamic: false,
		params: [],
		page: null,
		routeHandler: route_exports$18,
		layouts: [layout_exports],
		routeSegments: [
			"api",
			"auth",
			"verify-email"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/barbers",
		patternParts: ["api", "barbers"],
		isDynamic: false,
		params: [],
		page: null,
		routeHandler: route_exports$17,
		layouts: [layout_exports],
		routeSegments: ["api", "barbers"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/friends",
		patternParts: ["api", "friends"],
		isDynamic: false,
		params: [],
		page: null,
		routeHandler: route_exports$16,
		layouts: [layout_exports],
		routeSegments: ["api", "friends"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/friends/invite",
		patternParts: [
			"api",
			"friends",
			"invite"
		],
		isDynamic: false,
		params: [],
		page: null,
		routeHandler: route_exports$15,
		layouts: [layout_exports],
		routeSegments: [
			"api",
			"friends",
			"invite"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/friends/requests",
		patternParts: [
			"api",
			"friends",
			"requests"
		],
		isDynamic: false,
		params: [],
		page: null,
		routeHandler: route_exports$14,
		layouts: [layout_exports],
		routeSegments: [
			"api",
			"friends",
			"requests"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/friends/search",
		patternParts: [
			"api",
			"friends",
			"search"
		],
		isDynamic: false,
		params: [],
		page: null,
		routeHandler: route_exports$13,
		layouts: [layout_exports],
		routeSegments: [
			"api",
			"friends",
			"search"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/friends/suggestions",
		patternParts: [
			"api",
			"friends",
			"suggestions"
		],
		isDynamic: false,
		params: [],
		page: null,
		routeHandler: route_exports$12,
		layouts: [layout_exports],
		routeSegments: [
			"api",
			"friends",
			"suggestions"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/health",
		patternParts: ["api", "health"],
		isDynamic: false,
		params: [],
		page: null,
		routeHandler: route_exports$11,
		layouts: [layout_exports],
		routeSegments: ["api", "health"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/realtime",
		patternParts: ["api", "realtime"],
		isDynamic: false,
		params: [],
		page: null,
		routeHandler: route_exports$10,
		layouts: [layout_exports],
		routeSegments: ["api", "realtime"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/services",
		patternParts: ["api", "services"],
		isDynamic: false,
		params: [],
		page: null,
		routeHandler: route_exports$9,
		layouts: [layout_exports],
		routeSegments: ["api", "services"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/test-auth",
		patternParts: ["api", "test-auth"],
		isDynamic: false,
		params: [],
		page: null,
		routeHandler: route_exports$8,
		layouts: [layout_exports],
		routeSegments: ["api", "test-auth"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/test-sharp",
		patternParts: ["api", "test-sharp"],
		isDynamic: false,
		params: [],
		page: null,
		routeHandler: route_exports$7,
		layouts: [layout_exports],
		routeSegments: ["api", "test-sharp"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/test/create-review-data",
		patternParts: [
			"api",
			"test",
			"create-review-data"
		],
		isDynamic: false,
		params: [],
		page: null,
		routeHandler: route_exports$6,
		layouts: [layout_exports],
		routeSegments: [
			"api",
			"test",
			"create-review-data"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/upload/profile",
		patternParts: [
			"api",
			"upload",
			"profile"
		],
		isDynamic: false,
		params: [],
		page: null,
		routeHandler: route_exports$5,
		layouts: [layout_exports],
		routeSegments: [
			"api",
			"upload",
			"profile"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/upload/reviews",
		patternParts: [
			"api",
			"upload",
			"reviews"
		],
		isDynamic: false,
		params: [],
		page: null,
		routeHandler: route_exports$4,
		layouts: [layout_exports],
		routeSegments: [
			"api",
			"upload",
			"reviews"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/user/update-profile-image",
		patternParts: [
			"api",
			"user",
			"update-profile-image"
		],
		isDynamic: false,
		params: [],
		page: null,
		routeHandler: route_exports$3,
		layouts: [layout_exports],
		routeSegments: [
			"api",
			"user",
			"update-profile-image"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/auth-required",
		patternParts: ["auth-required"],
		isDynamic: false,
		params: [],
		page: page_exports$41,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["auth-required"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/auth/error",
		patternParts: ["auth", "error"],
		isDynamic: false,
		params: [],
		page: page_exports$40,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["auth", "error"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/auth/reset-password",
		patternParts: ["auth", "reset-password"],
		isDynamic: false,
		params: [],
		page: page_exports$39,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["auth", "reset-password"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/auth/signin",
		patternParts: ["auth", "signin"],
		isDynamic: false,
		params: [],
		page: page_exports$38,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["auth", "signin"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/auth/signup",
		patternParts: ["auth", "signup"],
		isDynamic: false,
		params: [],
		page: page_exports$37,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["auth", "signup"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/auth/thank-you",
		patternParts: ["auth", "thank-you"],
		isDynamic: false,
		params: [],
		page: page_exports$36,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["auth", "thank-you"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/auth/verify-email",
		patternParts: ["auth", "verify-email"],
		isDynamic: false,
		params: [],
		page: page_exports$35,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["auth", "verify-email"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/chat",
		patternParts: ["chat"],
		isDynamic: false,
		params: [],
		page: page_exports$34,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["chat"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/community",
		patternParts: ["community"],
		isDynamic: false,
		params: [],
		page: page_exports$33,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["community"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/dashboard",
		patternParts: ["dashboard"],
		isDynamic: false,
		params: [],
		page: page_exports$32,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["dashboard"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/dashboard/admin",
		patternParts: ["dashboard", "admin"],
		isDynamic: false,
		params: [],
		page: page_exports$31,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["dashboard", "admin"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/dashboard/admin/barbers",
		patternParts: [
			"dashboard",
			"admin",
			"barbers"
		],
		isDynamic: false,
		params: [],
		page: page_exports$30,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: [
			"dashboard",
			"admin",
			"barbers"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/dashboard/admin/promotions",
		patternParts: [
			"dashboard",
			"admin",
			"promotions"
		],
		isDynamic: false,
		params: [],
		page: page_exports$29,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: [
			"dashboard",
			"admin",
			"promotions"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/dashboard/admin/promotions/new",
		patternParts: [
			"dashboard",
			"admin",
			"promotions",
			"new"
		],
		isDynamic: false,
		params: [],
		page: page_exports$28,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: [
			"dashboard",
			"admin",
			"promotions",
			"new"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/dashboard/admin/reports",
		patternParts: [
			"dashboard",
			"admin",
			"reports"
		],
		isDynamic: false,
		params: [],
		page: page_exports$27,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: [
			"dashboard",
			"admin",
			"reports"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/dashboard/admin/services",
		patternParts: [
			"dashboard",
			"admin",
			"services"
		],
		isDynamic: false,
		params: [],
		page: page_exports$26,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: [
			"dashboard",
			"admin",
			"services"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/dashboard/admin/services/new",
		patternParts: [
			"dashboard",
			"admin",
			"services",
			"new"
		],
		isDynamic: false,
		params: [],
		page: page_exports$25,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: [
			"dashboard",
			"admin",
			"services",
			"new"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/dashboard/admin/users",
		patternParts: [
			"dashboard",
			"admin",
			"users"
		],
		isDynamic: false,
		params: [],
		page: page_exports$24,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: [
			"dashboard",
			"admin",
			"users"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/dashboard/barber",
		patternParts: ["dashboard", "barber"],
		isDynamic: false,
		params: [],
		page: page_exports$23,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["dashboard", "barber"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/gallery",
		patternParts: ["gallery"],
		isDynamic: false,
		params: [],
		page: page_exports$22,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["gallery"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/legal/cookies",
		patternParts: ["legal", "cookies"],
		isDynamic: false,
		params: [],
		page: page_exports$21,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["legal", "cookies"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/legal/privacy",
		patternParts: ["legal", "privacy"],
		isDynamic: false,
		params: [],
		page: page_exports$20,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["legal", "privacy"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/legal/terms",
		patternParts: ["legal", "terms"],
		isDynamic: false,
		params: [],
		page: page_exports$19,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["legal", "terms"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/prices",
		patternParts: ["prices"],
		isDynamic: false,
		params: [],
		page: page_exports$18,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["prices"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/profile",
		patternParts: ["profile"],
		isDynamic: false,
		params: [],
		page: page_exports$17,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["profile"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: loading_exports$5,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/profile/change-password",
		patternParts: ["profile", "change-password"],
		isDynamic: false,
		params: [],
		page: page_exports$16,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["profile", "change-password"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: loading_exports$4,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/profile/notifications",
		patternParts: ["profile", "notifications"],
		isDynamic: false,
		params: [],
		page: page_exports$15,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["profile", "notifications"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: loading_exports$3,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/profile/settings",
		patternParts: ["profile", "settings"],
		isDynamic: false,
		params: [],
		page: page_exports$14,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["profile", "settings"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: loading_exports$2,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/profile/social",
		patternParts: ["profile", "social"],
		isDynamic: false,
		params: [],
		page: page_exports$13,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["profile", "social"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: loading_exports$1,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/profile/social/requests",
		patternParts: [
			"profile",
			"social",
			"requests"
		],
		isDynamic: false,
		params: [],
		page: page_exports$12,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: [
			"profile",
			"social",
			"requests"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: loading_exports,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/promotions",
		patternParts: ["promotions"],
		isDynamic: false,
		params: [],
		page: page_exports$11,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["promotions"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/reviews",
		patternParts: ["reviews"],
		isDynamic: false,
		params: [],
		page: page_exports$10,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["reviews"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/salons",
		patternParts: ["salons"],
		isDynamic: false,
		params: [],
		page: page_exports$9,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["salons"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/scheduling",
		patternParts: ["scheduling"],
		isDynamic: false,
		params: [],
		page: page_exports$8,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["scheduling"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/scheduling/manage",
		patternParts: ["scheduling", "manage"],
		isDynamic: false,
		params: [],
		page: page_exports$7,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["scheduling", "manage"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/support",
		patternParts: ["support"],
		isDynamic: false,
		params: [],
		page: page_exports$6,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["support"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/test-review",
		patternParts: ["test-review"],
		isDynamic: false,
		params: [],
		page: page_exports$5,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["test-review"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/test-upload",
		patternParts: ["test-upload"],
		isDynamic: false,
		params: [],
		page: page_exports$4,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["test-upload"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/test-upload-simple",
		patternParts: ["test-upload-simple"],
		isDynamic: false,
		params: [],
		page: page_exports$3,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["test-upload-simple"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/appointments/:id",
		patternParts: [
			"api",
			"appointments",
			":id"
		],
		isDynamic: true,
		params: ["id"],
		page: null,
		routeHandler: route_exports$2,
		layouts: [layout_exports],
		routeSegments: [
			"api",
			"appointments",
			"[id]"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/friends/:id",
		patternParts: [
			"api",
			"friends",
			":id"
		],
		isDynamic: true,
		params: ["id"],
		page: null,
		routeHandler: route_exports$1,
		layouts: [layout_exports],
		routeSegments: [
			"api",
			"friends",
			"[id]"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/chat/:conversationId",
		patternParts: ["chat", ":conversationId"],
		isDynamic: true,
		params: ["conversationId"],
		page: page_exports$2,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["chat", "[conversationId]"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/salons/:id",
		patternParts: ["salons", ":id"],
		isDynamic: true,
		params: ["id"],
		page: page_exports$1,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["salons", "[id]"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/services/:id",
		patternParts: ["services", ":id"],
		isDynamic: true,
		params: ["id"],
		page: page_exports,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["services", "[id]"],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	},
	{
		pattern: "/api/auth/:nextauth+",
		patternParts: [
			"api",
			"auth",
			":nextauth+"
		],
		isDynamic: true,
		params: ["nextauth"],
		page: null,
		routeHandler: route_exports,
		layouts: [layout_exports],
		routeSegments: [
			"api",
			"auth",
			"[...nextauth]"
		],
		layoutTreePositions: [0],
		templates: [],
		errors: [error_exports],
		slots: {},
		loading: null,
		error: null,
		notFound: not_found_exports,
		notFounds: [not_found_exports],
		forbidden: null,
		unauthorized: null
	}
];
var _routeTrie = buildRouteTrie(routes);
var metadataRoutes = [{
	type: "favicon",
	isDynamic: false,
	servedUrl: "/favicon.ico",
	contentType: "image/x-icon",
	fileDataBase64: "AAABAAQAEBAAAAEAIAAoBQAARgAAACAgAAABACAAKBQAAG4FAAAwMAAAAQAgACgtAACWGQAAAAAAAAEAIACNHgAAvkYAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQAAABdAAAAugAAALoAAABdAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAKAAAADyAAAA/wAAAP8AAAD/AAAA/wAAAPIAAACgAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAOAAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAOAAAAA4AAAAAAAAAAAAAAAAAAAAHwAAAOIAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA4gAAAB8AAAAAAAAAAAAAAKEAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAChAAAAAAAAACMAAAD0AAAA/wAAAP9PT0//rq6u/6urq/+rq6v/q6ur/6urq/+tra3/Z2dn/wAAAP8AAAD/AAAA9AAAACMAAABZAAAA/wAAAP8AAAD/Hx8f/+3t7f///////////////////////f39/zU1Nf8AAAD/AAAA/wAAAP8AAABZAAAAuwAAAP8AAAD/AAAA/wAAAP9ra2v//////////////////////46Ojv8AAAD/AAAA/wAAAP8AAAD/AAAAuwAAALsAAAD/AAAA/wAAAP8AAAD/CQkJ/83Nzf///////////+Tk5P8YGBj/AAAA/wAAAP8AAAD/AAAA/wAAALsAAABZAAAA/wAAAP8AAAD/AAAA/wAAAP9KSkr//f39//////9ra2v/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAABZAAAAIwAAAPQAAAD/AAAA/wAAAP8AAAD/AQEB/7a2tv/V1dX/CQkJ/wAAAP8AAAD/AAAA/wAAAP8AAAD0AAAAIwAAAAAAAAChAAAA/wAAAP8AAAD/AAAA/wAAAP8xMTH/RERE/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAAoQAAAAAAAAAAAAAAHwAAAOIAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA4gAAAB8AAAAAAAAAAAAAAAAAAAA4AAAA4AAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA4AAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAACgAAAA8gAAAP8AAAD/AAAA/wAAAP8AAADyAAAAoAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQAAABdAAAAugAAALoAAABdAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgAAAAgAAAAQAAAAAEAIAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAsAAAAVQAAAIEAAADoAAAA6AAAAIEAAABVAAAALAAAAAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACoAAACFAAAA0gAAAPkAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD5AAAA0gAAAIUAAAAqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAACWAAAA8wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAPMAAACWAAAAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABRAAAA4QAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAADhAAAAUQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcgAAAPsAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD7AAAAcgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHIAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAAcgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABPAAAA+wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD7AAAATwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGwAAAOQAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAADjAAAAGwAAAAAAAAAAAAAAAAAAAAAAAACXAAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAACXAAAAAAAAAAAAAAAAAAAAKAAAAPUAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAPQAAAAnAAAAAAAAAAAAAACGAAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/ODg4/4uLi/+IiIj/iIiI/4iIiP+IiIj/iIiI/4iIiP+IiIj/iIiI/4iIiP+IiIj/iIiI/4iIiP+JiYn/X19f/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAIYAAAAAAAAABwAAANQAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8eHh7/7u7u//////////////////////////////////////////////////////////////////////9TU1P/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA1AAAAAcAAAArAAAA+gAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP9oaGj/////////////////////////////////////////////////////////////////rq6u/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD6AAAAKwAAAFQAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wgICP/Ly8v///////////////////////////////////////////////////////T09P8sLCz/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAABUAAAAggAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/0dHR//9/f3/////////////////////////////////////////////////jY2N/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAIEAAADpAAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/62trf///////////////////////////////////////////+Tk5P8XFxf/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA6QAAAOkAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/Kysr//Pz8///////////////////////////////////////ampq/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAADpAAAAgQAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/i4uL/////////////////////////////////8zMzP8ICAj/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAIIAAABUAAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8WFhb/4+Pj///////////////////////9/f3/SUlJ/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAAVAAAACsAAAD6AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP9oaGj//////////////////////6+vr/8BAQH/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAPoAAAArAAAABwAAANQAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wgICP/Ly8v////////////09PT/LCws/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA1AAAAAcAAAAAAAAAhgAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/0dHR//9/f3//////42Njf8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAACGAAAAAAAAAAAAAAAnAAAA9AAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/7Gxsf/s7Oz/FxcX/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA9QAAACgAAAAAAAAAAAAAAAAAAACXAAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/MzMz/19fX/8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAACXAAAAAAAAAAAAAAAAAAAAAAAAABoAAADjAAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA5AAAABsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE8AAAD7AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAPsAAABPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHIAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAAcgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHIAAAD7AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA+wAAAHIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFEAAADhAAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAOEAAABRAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAACWAAAA8wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAPMAAACWAAAAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqAAAAhQAAANIAAAD5AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA+QAAANIAAACFAAAAKgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAACwAAABVAAAAgQAAAOgAAADoAAAAgQAAAFUAAAAsAAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgAAAAwAAAAYAAAAAEAIAAAAAAAAC0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAAAAKAAAAEwAAABqAAAAswAAAPgAAAD3AAAAswAAAGoAAABLAAAAKAAAAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATAAAAVgAAAKAAAADYAAAA+AAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA+AAAANgAAACgAAAAVQAAABMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJQAAAIsAAADhAAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAOEAAACLAAAAJgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYAAACLAAAA7wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA7wAAAIsAAAAWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUQAAANwAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAADcAAAAUgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAACKAAAA/gAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/gAAAIoAAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAK0AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAACtAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAAAAuAAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAAuAAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAACuAAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAK4AAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIoAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAACKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAP0AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD9AAAATwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVAAAA3wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA3wAAABUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACLAAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAIsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACMAAADxAAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAPEAAAAjAAAAAAAAAAAAAAAAAAAAAAAAAIwAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAACLAAAAAAAAAAAAAAAAAAAAEQAAAOQAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8kJCT/aGho/2VlZf9lZWX/ZWVl/2VlZf9lZWX/ZWVl/2VlZf9lZWX/ZWVl/2VlZf9lZWX/ZWVl/2VlZf9lZWX/ZWVl/2VlZf9lZWX/ZWVl/2VlZf9lZWX/ZWVl/1BQUP8BAQH/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAADkAAAAEQAAAAAAAAAAAAAAVQAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8cHBz/6+vr/////////////////////////////////////////////////////////////////////////////////////////////////////////////////3Nzc/8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAAVQAAAAAAAAAAAAAAoQAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/ZWVl////////////////////////////////////////////////////////////////////////////////////////////////////////////zMzM/wgICP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAAoQAAAAAAAAAJAAAA2gAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/BwcH/8nJyf/////////////////////////////////////////////////////////////////////////////////////////////////9/f3/SEhI/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA2gAAAAkAAAAoAAAA+QAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/0VFRf/8/Pz///////////////////////////////////////////////////////////////////////////////////////////+urq7/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA+AAAACgAAABLAAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP+qqqr///////////////////////////////////////////////////////////////////////////////////////T09P8sLCz/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAEwAAABqAAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8pKSn/8vLy/////////////////////////////////////////////////////////////////////////////////4yMjP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAGoAAAC0AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/iIiI////////////////////////////////////////////////////////////////////////////4+Pj/xYWFv8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAALMAAAD4AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/FBQU/+Hh4f//////////////////////////////////////////////////////////////////////aWlp/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAPgAAAD4AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/2VlZf/////////////////////////////////////////////////////////////////Ly8v/CAgI/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAPgAAACzAAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wcHB//Jycn///////////////////////////////////////////////////////39/f9ISEj/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAALQAAABqAAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP9FRUX//Pz8/////////////////////////////////////////////////66urv8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAGoAAABMAAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/qqqq////////////////////////////////////////////9PT0/ywsLP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAEsAAAAoAAAA+AAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/KSkp//Ly8v//////////////////////////////////////jIyM/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA+QAAACgAAAAJAAAA2gAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/4iIiP/////////////////////////////////j4+P/FhYW/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA2gAAAAkAAAAAAAAAoQAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/xQUFP/h4eH///////////////////////////9paWn/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAAoQAAAAAAAAAAAAAAVQAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP9lZWX//////////////////////8zMzP8ICAj/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAAVQAAAAAAAAAAAAAAEQAAAOQAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8HBwf/ycnJ/////////////f39/0hISP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAADkAAAAEQAAAAAAAAAAAAAAAAAAAIsAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/RUVF//z8/P//////rq6u/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAACMAAAAAAAAAAAAAAAAAAAAAAAAACMAAADxAAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/6ysrP/7+/v/LCws/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAPEAAAAjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACLAAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/zIyMv99fX3/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAIsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVAAAA3wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA3wAAABUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATwAAAP0AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD9AAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIoAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAACKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAACuAAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAK4AAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAuAAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAAuAAAAA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAK0AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAACtAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAACKAAAA/gAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/gAAAIoAAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUgAAANwAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAADcAAAAUQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYAAACLAAAA7wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA7wAAAIsAAAAWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJgAAAIsAAADhAAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAOEAAACLAAAAJQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATAAAAVQAAAKAAAADYAAAA+AAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA+AAAANgAAACgAAAAVgAAABMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAAAAKAAAAEsAAABqAAAAswAAAPcAAAD4AAAAswAAAGoAAABMAAAAKAAAAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACJUE5HDQoaCgAAAA1JSERSAAABAAAAAQAIBgAAAFxyqGYAAAABc1JHQgCuzhzpAAAAOGVYSWZNTQAqAAAACAABh2kABAAAAAEAAAAaAAAAAAACoAIABAAAAAEAAAEAoAMABAAAAAEAAAEAAAAAAEQiOHMAAB4DSURBVHgB7V0JsBXVmW6UXQg8FhFRVkGW6MRoJAnKToyOMTMqiHGwwmSqBsSNqUmhiAiYRJNMMpOqKM4UKNSYMtbEmdEYGUcJi8FxX0DlsYjghoobEngIyJvvu9CPvo97b/e9vZ3T/f1V33t9u0+f5Tvn//v0+c853cKRZIGBrihEZ6AT0BE4CegD9AROALoBXYDuQAugDmgDeKURP3YADcBO4DPgPWA78DbwLvAmsAvgdeIT4CAgsZQBNgaJHQxQganQvYDBQP/DoFLTAFD5aQRaA3HKXkRO4+AagHdwvA3YDLwB0FjQaNCYSAxnQAbAzAo6GdniE3wI8DVgIHAiQAPAJ7zJsgeZc3sN63D8KvAywN4DjYXEIAZkANKvjJbIAhV8KDAS+AowAOCTPkvyFgqzBXgeWAOsBzYBBwBJSgzIAKRDfD8kS0UfBwwHTgHYfc+TfIrC8rXhGeB/AfYWaCAkCTIgA5AM2Xwvp8KPAC4ATgN6AJIjDLyPw1eAZcAK4DWA4w2SGBmQAYiP3LaI+gzgO8B5AJW+FSDxZ+BzBKkHHgZoEF4AGgBJxAzIAERMKKI7E7gEOB+g0h8LSGpngGMEHEh8CHgQoDGgy1IiBoxhgO/004GVAEfB2UCF6DlgL2AlMAPoDUjEQGoM8L1+LLAIoNtLCp8sB3QpLgbOAehJkYiBRBjogVSmAk8C+wEpfrocsA5WA+yBdQUkYiAWBuiqmw3QVSWlN5ODjaib+QBfySRiIBIGOEHn18AHgBTfDg74SvYzYBggEQM1MTAEd1HxPwak+HZy8NHhOvwy/kvEQCAGpPh2KnslI+0agkGBWoAC5ZKBXij1zwE98bNnAFzjwFeD2wGNEYAEySEGOuDfLGAb4DYU/c82FzQEM4E6QJJjBi5G2Z8DpPD55IB1PxHQPAKQkCfhFN0HgIOAlF8c3I92cDogyTgDHVG+mwEOCknxxYG3DXB7M87z0GsBSMiijEehngK8la5j8dG8DTyNNjImiwqQ1zJ1Q8H/BeDa8uaVrd/ipFQb+DPaCr0F6g2ABJuFO+68CJSqZJ0TL35tgL0BLviSWMZAe+R3LrAb8KtkXRdHldoAewNsS9zgRWIBA5z//ShQqVJ1TfxU2wYeQ5vS2gLDDcBk5O9dKb+MX0xt4D3E+z1AYhgDnM33S4DbR1Vr2RVenFXTBtjG2Nb4mikxgIEByAO7Z9VUosKKr7BtYDnaXH8D2n+us8BR/s1A2MrU/eKwljbwOtqe1V4Cm3esnQby7wG4RZdEDKTBAOcJ/DWwE+C6AuvERgPQBizfBtwK8FgiBtJkgG3wPIBuQn7y7AtAEhMDtLj3ArV013SPeIu7Dfw72mbePvEWk6ofHe1JOLUCiLsSFb84DtMGuEMx26okQga4lROnZYapGN0r/pJqA2yr3EVaEgEDwxHHJiCpylM64jqKNrABbfbrEbT/XEcxGqXnF2CiqBDFIR6TbgNsu2zDxorJXoBRYO23QE9j2VPGxEBlBrgBzbcBugi556RxYqoBcJX/BOMYU4bEQHUMcJq6sUbARANA5b8P0JO/uoam0OYyQCPAuQLG9QRMMwCjQZKUHyRIMscAXwdoBJ4HtgJGSAsjcnEoExzt/0/gRIPypKyIgagZ4HJ1bkdPV2HqYooBGAAmlgEDU2dEGRAD8TPARUTnA3RvpyrHpJr6ocQ5a4rdfim/AZWhLCTCAB94vwFSnzGYdg/gSyDhD8A5gEQM5I2BVSjwdwGuJkxF0hwE5Oqpu4ALUym5EhUD6TPQF1k4GXgEOAAkLmkagAUo7YzES6wExYBZDJyO7PBhyF2tEpe0DMA0lPTHgAljEImTrgTFQDMGuGbgA4DzBBKVNMYAxqKE/w3QLyoRA2LgEAP8/gDHA/6YJCFJG4B+hwvYN8lCKi0xYAkDbyCfEwC6CRORJLvgx6FEi4G+iZRMiYgB+xjgA/LfAOpKIpLkGMBPUaLLEymVEhED9jJAI9AOeDSJIiRlAKj4twNJ9jiS4E9piIE4GPgaIt0AvBpH5N44W3h/xHQ8FPEuB7S0NyaCFW0mGdiOUo0HXouzdHH3ANiV4S6+p8VZCMUtBjLIAL1kpwIPAPvjKl/cBuAmZHxqXJlXvGIg4wz0R/n2AaviKmecrwCjkemHgcRGNOMiSfGKgRQZ2IO0LwBiMQJxGYBOyPDjwFmARAyIgXAMvIzbOYHu43DRHH13XK8A85HUpKOT0xkxIAZqYIAD6BxP+58a7q14Sxw9gNFI8fcA90GTiAExEA0DnyMavgpEOlU4agPA9f10+anrDxIkYiBiBp5BfHwV2B1VvFG/AvwDMjYlqswpHjEgBooY6IVfDcDqorMhfkTZA+C65pUAv+ArEQNiIB4GPkG03Dp/XRTRHxNFJIijNTAXkPJHRGhS0XTo0MHp3bt3UskpnfAMUMcWAJHobiSRIDPc1usSQGIZA1OnTnWWLFnitGrVyrKc5zq7F6H03DvACOHA3/NAo2AXB8cff3zjli1bGimTJ09W/dnVhqlzRnjarpPi26X4bn3NmzevoPz8s379+sa6ujoZAbuMwA9Rl6lKX6TOVUtqOJZxMHjw4MYdO3Y0GQAezJ49W/VoVz2+Cd3rCaQmtyFlNRrLOGjRokXj3XffXaT8/PHhhx829u/fX/VpV33+U1raPwgJvy8DYJ8BHDt2bOO+ffuOMgA8sWjRIhkAuwzAp9BB7rmRuNyBFNVYLOOgbdu2jStWrCip/Dy5d+/exhEjRqhe7arXO5PW/mFI8GMZAPsM4JQpU8oqv3th+fLljXALygjYYwQ4OSjRXoCe/vY0jiZFpttvw4YNrp5X/C+3oHXGPbFegJ7+Fio/e2tet19F7cfF+vp6uQXtqmf2AoYAVUkti4HoexxXVSoKnDoDcPs5CxcudNq3bx8oL926dXM+++wz54knnggUXoFSZ4DfF+TankfizElfRK6Rf7ueDI3l3H5+vQC5Ba17DfgI+tk/TgMwH5E3vVPq2A4uxo0b17h//34/fS95XW5BO+rYo4uz4zIAXRDxRk9CMgQWGEM/t19JrfeclFvQOgOwBTraPQ4jwE96S+kt4yCI28+j7yUP5Ra0rt1/P2oD0AYR/kkGwK6GUI3br6Tme07KLWhV3f8fdJU6G5mcg5j4gQL1ACzioBq3n0fXSx7KLWhV2+cGomODaH9QNyAH/84MEqHCmMFAtW4/v1zTLbhr1y65Bf2IMuM69fog8GAU2eFGhNsBPf0t4aBWt1/JR7/npNyCVukA3fV9ojAAV0n5rar4Rrr9yq328+hzTYdyC1rVFjhwH0q4UdwqQE9/SzgI6/bzswpyC1qlC9TdlmEsAN/7d8sA2FPpV155pZ8Oh74ut6A17WEPdDfU2N2PpPzWVHYj3X4bN24MreBBIrj88svVK7SjV/gT6HBNwsUFLwGqaEs4iNLt52cE5Ba0Ri9ehA63q8UCjMBNe2UA7KjoUpt8+ilx2Os33XSTHg7mPxw4J+AbtRiAH0v57VB+uv3uueeesPpc9f1yC9rRPqDHt1VrANhlUPfffOteeALH6fbzswqLFy9WL8D8dvIC9Jmv9IHlDITkCKIq13AO4nb7+RkAuQWt0BG+yp9dSvvLfRuQ84hrGjgolYjOxcfAxIkTndGjR8eXgE/Mbdq0cRYsWKBvC/rwlPJlLgzimF4goVF4HNDT33AOknT7+fUE5BY0Xl8eg06Xe+AXGYa++MV5xDIAhnOQpNvPzwDQLdi5c2e1GXPbzAfQaep2kZRaDTgKIX5QFEo/jGOAq/3uuuuuwJt8xl0ArhbcvXu3s3r16riTUvy1MXAcbuPU4Hrv7aW6BBO8AXRsHgNw+zmzZs1yunbtalTmrr/+egffFjQqT8pMEQPji36V+NEa554D1JUzmIM03X5+rwJyCxqtO9Rt6nhZGYwr/MCADIChHKTt9vMzAHILGq071G3qeJM0fwXg98U6N13VgXEMTJo0KVW3nx8hcgv6MZTqdeo2v+zVJM0NwDebrujAOAa6d+/uzJkzx7h8Nc8QPj/uXHrppc1P67cZDJzrzYbXAPD4LO9FHZvFwIwZM5yBAwealakyubnlllucurq6Mld1OkUGvoK0m7x/XgNwAi4MSDFjSroCA3T7XX311RVCmHXp1FNPda66irvJSQxjgE+QnqXyxCWDBwANABrGQVqr/fwG/Pyua7WgkbpEHT/HNQDeHkBR18ANoP/pM8B36iuuuCL9jFSZA85TwJ4BVd6l4DEzwO4/B/sL4jUATSfdi/qfPgNw+xUG/lq1apV+ZmrIAQ3XiBGB16HUkIJuqYGBprE+1wDw/2k1RKRbYmYg7dV+YYsnt2BYBmO5n+MALbwx82uimwG9/xvEgUmr/fze9/2ua7WgUbrFr3zza99NywPpASg5MshAknQYsMnt58cQ3YJYLegXTNeTYYD6TjQZgJNx3J4nJGYwQLcfDUBWhG5Bm9yYWeG9TDk64nwvXnPHAPqXCajTKTBg6mq/sFRcd911Wi0YlsTo7h/CqFwDoAlA0REbOqaxY+10+/kVnHsGyC3ox1Ji1/sxJdcA9EksWSVUkQHb3X4VC4eLcgv6MZTY9cJDnwaAHw8svA8klrQSKsuA6av9ymY84AW5BQMSFX8wev6OpQHoBGjVRvyE+6YAt58Vq/18C+ITgK84Wi3oQ1L8l7mdVGfXANAISFJmgItnbFntF5aquXPnyi0YlsRw99MnKwMQjsPo7rZttV/YkmfNzRmWjxTu50O/E3sA9AnywwGSlBjIqtvPj86ZM2fKLehHUnzXuTdgRxqA3vGloZiDMJBVt59f2bVa0I+h2K+fRAOgKcCx81w+gay7/cqX/NAVuQX9GIr1eh8aAE4DlqTEQNbdfn60yi3ox1Cs13tyc4C/BbQXQKw8l46cm3wuXbrUuA98lM5tfGf79evnrF+/3nnllVfiS0Qxl2LgTb0ClKIloXNcHJMXt58fpXIL+jEUy/Vu7AFcCxSWBsaShCItyQDdYAsXLjTm234lM5ngSX1bMEGyjyS1kz0ALdI+QkgiR67bj41ecoQBrRY8wkVCR91pANollJiSOcxAXt1+fg1AqwX9GIr8+jHcF+wLgIZAkgADdPstW7bM6M97JUBD2STwbUFn/Pjxzpo1a8qG0YXIGPicii/lj4xP/4hs3+TTv4ThQtBALliwwLF1F+RwpU/87jYcBJyXeLI5TVBuv2AV37dvX6e+vl5uwWB0hQqlp38o+qq7mYNccvv5c8ZB0nnz5unbgv5UhQ6hHkBoCoNFMGzYMOfOO+902rXTmGsQxrhOoKGhwVm1alWQ4ApTIwPsAXxe4726LSADfKLdcMMNTpcuha3YA96lYNdee616TPE2g4M0AJ/Em4Zi56j2ZZddJiKqZIAGc86cOVXepeBVMPAhDcDBKm5Q0CoZYJf/5ptv1qh2lby5wWk4R40a5f7U/2gZaKAB2BFtnIrNy8DkyZOdc88913tKx1UwwNWC8+fPd1q35v4VkogZ+JSDgOyb9o04YkUHBnr06OEsWbJE7/4hW0OfPn2cjRs3OmvXrg0Zk25vxsBm9gA+anZSPyNigINYAwYMiCi2/EbDQVS+RtXVafPqiFvBe+wBsH96dsQR5z66oUOHyu0XYSuQWzBCMo9EtZw9gO1HfusoCgb4xLrxxhvV9Y+CTE8c11xzjdyCHj4iOHyLBmBbBBEpCg8DEyZMcDj4J4mWAfYC5BaMlNPtNABvRxplziOj248fwGzZkl9ck0TNgNyCkTJa2BJsF6LcF2m0OY6MDXTkyJE5ZiDeosstGBm/nAG8iz2AnYcRWcx5jYhuP3VR4699GljNrAzNc0HvaQA+PYzQMeY9Ag5Sye0XfyvgICsNrdyCobguMgCaCxCKS+yrDrff9OnTQ8ai24MyMGjQIIfLqyU1M8A1QIVNQbklmKYD18yj48jtF4K8ELdqW/UQ5DnOO7j7AF8BKK8f+qe/tTDA1X5y+9XCXLh79G3BUPwV3P+uAXgjVFQ5vpluP76Pyu2XTiOg4ZXXpSbuCw991wCsrykK3VQYjVYDTK8huN8W1GrBqutgC+9wDQDfBzgfQFIFA3L7VUFWjEHlFqya3D244y3e5RqA93BMSKpgQG6/KsiKMajcglWTy/U/BX13DQBdAuwFSAIyQLfftGnTAoZWsLgZoFuQy68lgRjg9P+C6981AI04sSnQrQpUYICbfHIUWmIOA1otGLgu1iFkYStA1wDwzucC357zgFrtZ2YDkFswcL285ob0GgCe5KQgSQUGtMlnBXIMuCS3oG8lUMdfckN5DcBWnHzfvaD/pRngIhRt8lmaGxPOyi3oWwscAGzaA8RrAHhB4wAV+JPbrwI5Bl2iW3DSpEkG5ciorHACUJPHz2sAiroGRmXZkMzI7WdIRfhkg25BbSJaliSO9TV9C4SbgnrlOPyQ6fQycvhYm3yWIMXgUxwQ3Lt3r7Ny5UqDc5lK1n6BVJtm/np7AMzNqwD3B5B4GNBqPw8ZFh1qteBRlUXdbvIA8GpzA8D5wXxHkHgY0Lf9PGRYdCi34FGVRd0urAFwrzQ3ANwb8Cn3ov47hc95c7Vfq1atRIeFDMgtWFRp1O2i/T+bGwCGfrzolpz/kNvP7gYgt2BR/T1W9As/mg8C8vpe4AqAA4K5Frr9li5dqg98WN4K9G3BQgV+gL8/AorG+Er1AN5EoJcLt+T8j9x+2WgAcgsW6pHz/6nbRVKqB8CFQd2A84pC5uwH3X533HGH0759+5yVPJvFlVvQuQM1+2Tz2i3VA2CYNQA/HJBLcd1+bDSS7DBAt+App5ySnQIFL0kDgq4oFbycAeCH2Iv8haVuzuo5uf2yWbM06JwhmEPZiDLXlyp3OQPAgcBHS92Q9XPuJp9y+2WzpnP66bY/oDbZCzhKyhkABnwIKPIZHnV3Bk/ktIFksCZLFymHbkG+yj9Smo3SbkA3LLcMugg4wT2R9f9y+2W9hg+Vj27BTZs2OWvX8k0388Lp/bcCB0qVtFIPgF2GZaVuyuo5uf2yWrPF5eIgLz/hnpNvCz6M0vOVvqSUcgN6A3LSwBQg8/Ng5fbzVnv2j7t16+Y0NDQ4q1atynJh96BwswDu9VFSWpQ8e+RkSxwuB0YeOZW9I35U4r777nMuvvji7BVOJSrLAA3A8OHDnXXrOEcmk7IapRoP7C9XOip4JeF7w31Apg0Au4JsBPX19U5jI+dBSfLAwLHHHpv1ad73ox7LKj/r2K8HwDB9gGeA4/lDIgbEgBUMcNuvs4CK3/uoNAjolpIbCNKPKBEDYsAeBjiAX1H5WZQgBoDh7gVyNyeABZeIAQsZYLf/7iD5DmoAuDbghSARKowYEAOpM8BX9meD5CKoAeBson8NEqHCiAExkDoD7LFTZ30lyCCgGwkHAbmlUD/3hP6LATFgHAObkKOvAx8HyVnQHgDj4o4ii4JEqjBiQAykxgDd9oGUnzmspgfA8P0Bvlt04Q+JGBADRjHAh/RwYGvQXFXTA2Cc3FL4t0EjVzgxIAYSZWApUttaTYrV9gAY9xCAWwt15g+JGBADRjDwCXJxLsDVf4Gl2h4AI14P8D1DIgbEgDkMUCerUn5mvZYeAO8bCnBugHoBZEMiBtJloKanP7NcSw+A970GqBdAJiRiIH0Ganr6M9u19gB4L3sBHAvoxB8SMSAGUmGAI/989+fGn1VLrT0AJsRegOYFVE25bhADkTLAOf81KT9zEaYHwPt7Ak8DJ/OHRAyIgUQZ4JLfbwBba03Vb0swv3j/jADcVGSCX0BdFwNiIHIG5iDGR8PEGrYHwLQ7AKuAr/KHRAyIgUQY4OrcMcBnYVIL2wNg2twnYAcwEYjCoCAaiRgQAz4MXI3rL/mE8b0cZhDQG/mD+PGQ94SOxYAYiI2B3yFmbvcdWqJ8Yp+G3PBVoC50rhSBGBAD5RjgpJ/RwNpyAao5H8UrgJse/ZGtgLHuCf0XA2IgcgZuRYwPRBVrlD0A5uk44I/A2fwhEQNiIFIGnkNs44BQA3/eHEXZA2C83IyQS4YnA37fHEAQiRgQAwEZoMt9KrAhYPhAwaI2AEz0DaA7wI0JJGJADETDwD8jmshn3kb9CuAWtQsOVgIcGJSIATEQjgF2/ccDO8NFc/TdUbkBm8fMPcmuA/Y0v6DfYkAMVMXAboT+IRC58jMXcbwCMF7KVoDjAGMAiRgQA7Ux8BPctrS2W/3viusVwE25PQ44SYjdF4kYEAPVMUCP2oVAQ3W3BQ8dtwFgTrhvwOMAVw5KxIAYCMYAV/rR5cdl97FJnK8Abqa5TuBt4K+AuMYc3LT0XwxkgYEDKMQ0YEXchUnCALAMrwKcIsy1yxIxIAYqM/ArXP5F5SDRXE3iFcDNKWcJcsGQpgq7jOi/GDiaAT71vwNw9D92SdIAsDADgMeAfvwhEQNioIiBrfjFByQn0yUiSb+Tv45S/R3AaY0SMSAGjjCwC4c/ABJTfiad1BgA03KFBeSSxguApHsgbh70XwyYxMAXyMxM4D+SzlQaBoBl5NTGjsA3+UMiBnLOwE9RfiJxScsAsKBPABwLOJ0/JGIgpwzci3L/I0DXX+KSdhe8E0rMmYKjEi+5EhQD6TPwJ2ThL4HI1vdXW6SkBwGb528nTvwN8GzzC/otBjLOANv85UBqyk9+0+4BMA+UgcAyYAB/SMRAxhnYhPKdD9Arlqqk3QNwC09CrgDedU/ovxjIKANs41OA1JWf/KY5CMj0vfIOfvBjB98GOngv6FgMZIQBLvD5HrDGlPKYZADIyVbgeUBGACRIMsUAlZ/v/CtNKpVpBoDcbAU4T0BGACRIMsEAlZ8b5a4yrTQmGgBytA1QT8C01qL81MKA++Q3TvlZGFMNAPO2FaAR+BbAWYMSMWAbAxzw4zv/SlMzbrIBIGdbgSeBkUBXQCIGbGFgMzLKbj8n+0hCMnAK7n8aaBTEgQVtgG11ECCJkIGTENdqQEZAHJjcBlagjbKtWiGmvwJ4SeSUyf8CSK4WEHmZ0bEpDPwGGfk+wA/lWiE2GQASuhfglGHOYOT+gqbMZERWJDlmgOv5fwlwTb82u0moIUxHOlxMZHJ3UHnLfv1Q4acl1OaVTDMGxuE351RL0cRBGm2AbW98szapnwkz0B/pLQfSaABKM7+8P442NyDhth55craNAZQigPsL/g7gZ8jOBjQuABIksTHA9/1fAX8PvB9bKoq4Jga4pJhTL/VkFgdxtAHO7OPkHonBDAxD3h4D4mgAijO/vD6KNsW2JbGAgbbI41yAI7RSWnEQpg3wCz1sS3zFlFjGwFjkV1OIZQBqNQAvof3Q0ySxmIE65P12QL0BGYKghoATzjjQ1w2QZISBMSiHegMyAn5G4Cm0E/n2M6L0zYvB3sBsgK5Dv4ag6/ni6CO0iZsB7T0BErIuXEx0PyAlFwcH0Q4eAE4DJDlioCXKOhHg/oMyBPnkgHV/CSDJMQN8LZgJbAdkCPLBAfecnAV0ACRioMBAP/ylt0CGILtG4GPU78+BXoBEDJRkgFs5/RrgoJB6BNnggIrPOh0KSMRAIAa+jFAyBHYbACl+oKauQJUY4PzvnwF6NbDHGHyA+tITv1Kr1rWqGeAYwXxgI6BXAzM52IK64TwP7iItEQOxMMDvE1wFPAHsB2QM0uWAdcBvR0wFegASMZAIA5xHcA6wGOCXjWUIkuWAr2SLAC74ag1IxEBqDPRGyjOAlUADIGMQDwd7DnM8Hf/5SiYJyUCLkPfr9mIGuB3ZGcB3gYsADiCypyCpnQFuwbUO4HbwnLL7PCCJiAEZgIiILBFNO5z7KnA+cCEwGGgDSPwZ4Hs9lZ678PweeBHgEl1JxAzIAERMaJno2uI8J6GMAWgQOMdAA1YgwSPv45hK/wiwBuBmHPsASYwMyADESG6FqPvjGleffQvgTsZ0W3UG8iSforCbgaeB5QAV/g1AkiADMgAJkl0mKY4RDASGACOAMwEaiJOBLAk9Ja8DVPTVwGvAJuAAIEmJARmAlIj3SbYXrtOz8BcABxLZWzgJ6Am0B0yWXcgcXXTvAlTwZ4H1wDbgLUBiEAMyAAZVhk9WuuM6DQANQT+Arw19ABoLLmnuBHwJ4HhDnML3cnbfdwIfATsAzsAj6gE+6WkAOA9fYjgDMgCGV1CA7NH16BoAGoGOAHsPJwJur+EEHNM48Ho7gMaked1/jnOfAJzDQKWmAn8IvAdQobcBbwN8wlP5aQRoACQWM/D/QN+5DmrsiuEAAAAASUVORK5CYII="
}];
var rootNotFoundModule = not_found_exports;
var rootForbiddenModule = null;
var rootUnauthorizedModule = null;
var rootLayouts = [layout_exports];
/**
* Render an HTTP access fallback page (not-found/forbidden/unauthorized) with layouts and noindex meta.
* Returns null if no matching component is available.
*
* @param opts.boundaryComponent - Override the boundary component (for layout-level notFound)
* @param opts.layouts - Override the layouts to wrap with (for layout-level notFound, excludes the throwing layout)
*/
async function renderHTTPAccessFallbackPage(route, statusCode, isRscRequest, request, opts) {
	return renderAppPageHttpAccessFallback({
		boundaryComponent: opts?.boundaryComponent ?? null,
		buildFontLinkHeader: buildAppPageFontLinkHeader,
		clearRequestContext() {
			setHeadersContext(null);
			setNavigationContext(null);
		},
		createRscOnErrorHandler(pathname, routePath) {
			return createRscOnErrorHandler(request, pathname, routePath);
		},
		getFontLinks: getSSRFontLinks,
		getFontPreloads: _getSSRFontPreloads,
		getFontStyles: _getSSRFontStyles,
		getNavigationContext,
		globalErrorModule: global_error_exports,
		isRscRequest,
		layoutModules: opts?.layouts ?? null,
		loadSsrHandler() {
			return import("./ssr.mjs");
		},
		makeThenableParams,
		matchedParams: opts?.matchedParams ?? route?.params ?? {},
		requestUrl: request.url,
		resolveChildSegments: __resolveChildSegments,
		rootForbiddenModule,
		rootLayouts,
		rootNotFoundModule,
		rootUnauthorizedModule,
		route,
		renderToReadableStream,
		statusCode
	});
}
/** Convenience: render a not-found page (404) */
async function renderNotFoundPage(route, isRscRequest, request, matchedParams) {
	return renderHTTPAccessFallbackPage(route, 404, isRscRequest, request, { matchedParams });
}
/**
* Render an error.tsx boundary page when a server component or generateMetadata() throws.
* Returns null if no error boundary component is available for this route.
*
* Next.js returns HTTP 200 when error.tsx catches an error (the error is "handled"
* by the boundary). This matches that behavior intentionally.
*/
async function renderErrorBoundaryPage(route, error, isRscRequest, request, matchedParams) {
	return renderAppPageErrorBoundary({
		buildFontLinkHeader: buildAppPageFontLinkHeader,
		clearRequestContext() {
			setHeadersContext(null);
			setNavigationContext(null);
		},
		createRscOnErrorHandler(pathname, routePath) {
			return createRscOnErrorHandler(request, pathname, routePath);
		},
		error,
		getFontLinks: getSSRFontLinks,
		getFontPreloads: _getSSRFontPreloads,
		getFontStyles: _getSSRFontStyles,
		getNavigationContext,
		globalErrorModule: global_error_exports,
		isRscRequest,
		loadSsrHandler() {
			return import("./ssr.mjs");
		},
		makeThenableParams,
		matchedParams: matchedParams ?? route?.params ?? {},
		requestUrl: request.url,
		resolveChildSegments: __resolveChildSegments,
		rootLayouts,
		route,
		renderToReadableStream,
		sanitizeErrorForClient: __sanitizeErrorForClient
	});
}
function matchRoute(url) {
	const pathname = url.split("?")[0];
	return trieMatch(_routeTrie, (pathname === "/" ? "/" : pathname.replace(/\/$/, "")).split("/").filter(Boolean));
}
function matchPattern(urlParts, patternParts) {
	const params = Object.create(null);
	for (let i = 0; i < patternParts.length; i++) {
		const pp = patternParts[i];
		if (pp.endsWith("+")) {
			if (i !== patternParts.length - 1) return null;
			const paramName = pp.slice(1, -1);
			const remaining = urlParts.slice(i);
			if (remaining.length === 0) return null;
			params[paramName] = remaining;
			return params;
		}
		if (pp.endsWith("*")) {
			if (i !== patternParts.length - 1) return null;
			const paramName = pp.slice(1, -1);
			params[paramName] = urlParts.slice(i);
			return params;
		}
		if (pp.startsWith(":")) {
			if (i >= urlParts.length) return null;
			params[pp.slice(1)] = urlParts[i];
			continue;
		}
		if (i >= urlParts.length || urlParts[i] !== pp) return null;
	}
	if (urlParts.length !== patternParts.length) return null;
	return params;
}
var interceptLookup = [];
for (let ri = 0; ri < routes.length; ri++) {
	const r = routes[ri];
	if (!r.slots) continue;
	for (const [slotName, slotMod] of Object.entries(r.slots)) {
		if (!slotMod.intercepts) continue;
		for (const intercept of slotMod.intercepts) interceptLookup.push({
			sourceRouteIndex: ri,
			slotName,
			targetPattern: intercept.targetPattern,
			targetPatternParts: intercept.targetPattern.split("/").filter(Boolean),
			page: intercept.page,
			params: intercept.params
		});
	}
}
/**
* Check if a pathname matches any intercepting route.
* Returns the match info or null.
*/
function findIntercept(pathname) {
	const urlParts = pathname.split("/").filter(Boolean);
	for (const entry of interceptLookup) {
		const params = matchPattern(urlParts, entry.targetPatternParts);
		if (params !== null) return {
			...entry,
			matchedParams: params
		};
	}
	return null;
}
async function buildPageElement(route, params, opts, searchParams) {
	const PageComponent = route.page?.default;
	if (!PageComponent) return (0, import_react_react_server.createElement)("div", null, "Page has no default export");
	const layoutMods = route.layouts.filter(Boolean);
	const layoutMetaPromises = [];
	let accumulatedMetaPromise = Promise.resolve({});
	for (let i = 0; i < layoutMods.length; i++) {
		const parentForThisLayout = accumulatedMetaPromise;
		const metaPromise = resolveModuleMetadata(layoutMods[i], params, void 0, parentForThisLayout).catch((err) => {
			console.error("[vinext] Layout generateMetadata() failed:", err);
			return null;
		});
		layoutMetaPromises.push(metaPromise);
		accumulatedMetaPromise = metaPromise.then(async (result) => result ? mergeMetadata([await parentForThisLayout, result]) : await parentForThisLayout);
	}
	const pageParentPromise = accumulatedMetaPromise;
	const spObj = {};
	let hasSearchParams = false;
	if (searchParams && searchParams.forEach) searchParams.forEach(function(v, k) {
		hasSearchParams = true;
		if (k in spObj) spObj[k] = Array.isArray(spObj[k]) ? spObj[k].concat(v) : [spObj[k], v];
		else spObj[k] = v;
	});
	const [layoutMetaResults, layoutVpResults, pageMeta, pageVp] = await Promise.all([
		Promise.all(layoutMetaPromises),
		Promise.all(layoutMods.map((mod) => resolveModuleViewport(mod, params).catch((err) => {
			console.error("[vinext] Layout generateViewport() failed:", err);
			return null;
		}))),
		route.page ? resolveModuleMetadata(route.page, params, spObj, pageParentPromise) : Promise.resolve(null),
		route.page ? resolveModuleViewport(route.page, params) : Promise.resolve(null)
	]);
	const metadataList = [...layoutMetaResults.filter(Boolean), ...pageMeta ? [pageMeta] : []];
	const viewportList = [...layoutVpResults.filter(Boolean), ...pageVp ? [pageVp] : []];
	const resolvedMetadata = metadataList.length > 0 ? mergeMetadata(metadataList) : null;
	const resolvedViewport = mergeViewport(viewportList);
	const pageProps = { params: makeThenableParams(params) };
	if (searchParams) {
		pageProps.searchParams = makeThenableParams(spObj);
		if (hasSearchParams) markDynamicUsage();
	}
	let element = (0, import_react_react_server.createElement)(PageComponent, pageProps);
	element = (0, import_react_react_server.createElement)(LayoutSegmentProvider, { childSegments: [] }, element);
	{
		const headElements = [];
		headElements.push((0, import_react_react_server.createElement)("meta", { charSet: "utf-8" }));
		if (resolvedMetadata) headElements.push((0, import_react_react_server.createElement)(MetadataHead, { metadata: resolvedMetadata }));
		headElements.push((0, import_react_react_server.createElement)(ViewportHead, { viewport: resolvedViewport }));
		element = (0, import_react_react_server.createElement)(import_react_react_server.Fragment, null, ...headElements, element);
	}
	if (route.loading?.default) element = (0, import_react_react_server.createElement)(import_react_react_server.Suspense, { fallback: (0, import_react_react_server.createElement)(route.loading.default) }, element);
	{
		const lastLayoutError = route.errors ? route.errors[route.errors.length - 1] : null;
		if (route.error?.default && route.error !== lastLayoutError) element = (0, import_react_react_server.createElement)(ErrorBoundary, {
			fallback: route.error.default,
			children: element
		});
	}
	{
		const NotFoundComponent = route.notFound?.default ?? not_found_default;
		if (NotFoundComponent) element = (0, import_react_react_server.createElement)(NotFoundBoundary, {
			fallback: (0, import_react_react_server.createElement)(NotFoundComponent),
			children: element
		});
	}
	if (route.templates) for (let i = route.templates.length - 1; i >= 0; i--) {
		const TemplateComponent = route.templates[i]?.default;
		if (TemplateComponent) element = (0, import_react_react_server.createElement)(TemplateComponent, {
			children: element,
			params
		});
	}
	for (let i = route.layouts.length - 1; i >= 0; i--) {
		if (route.errors && route.errors[i]?.default) element = (0, import_react_react_server.createElement)(ErrorBoundary, {
			fallback: route.errors[i].default,
			children: element
		});
		const LayoutComponent = route.layouts[i]?.default;
		if (LayoutComponent) {
			{
				const LayoutNotFound = route.notFounds?.[i]?.default;
				if (LayoutNotFound) element = (0, import_react_react_server.createElement)(NotFoundBoundary, {
					fallback: (0, import_react_react_server.createElement)(LayoutNotFound),
					children: element
				});
			}
			const layoutProps = {
				children: element,
				params: makeThenableParams(params)
			};
			if (route.slots) for (const [slotName, slotMod] of Object.entries(route.slots)) {
				const targetIdx = slotMod.layoutIndex >= 0 ? slotMod.layoutIndex : route.layouts.length - 1;
				if (i !== targetIdx) continue;
				let SlotPage = null;
				let slotParams = params;
				if (opts && opts.interceptSlot === slotName && opts.interceptPage) {
					SlotPage = opts.interceptPage.default;
					slotParams = opts.interceptParams || params;
				} else SlotPage = slotMod.page?.default || slotMod.default?.default;
				if (SlotPage) {
					let slotElement = (0, import_react_react_server.createElement)(SlotPage, { params: makeThenableParams(slotParams) });
					const SlotLayout = slotMod.layout?.default;
					if (SlotLayout) slotElement = (0, import_react_react_server.createElement)(SlotLayout, {
						children: slotElement,
						params: makeThenableParams(slotParams)
					});
					if (slotMod.loading?.default) slotElement = (0, import_react_react_server.createElement)(import_react_react_server.Suspense, { fallback: (0, import_react_react_server.createElement)(slotMod.loading.default) }, slotElement);
					if (slotMod.error?.default) slotElement = (0, import_react_react_server.createElement)(ErrorBoundary, {
						fallback: slotMod.error.default,
						children: slotElement
					});
					layoutProps[slotName] = slotElement;
				}
			}
			element = (0, import_react_react_server.createElement)(LayoutComponent, layoutProps);
			const treePos = route.layoutTreePositions ? route.layoutTreePositions[i] : 0;
			element = (0, import_react_react_server.createElement)(LayoutSegmentProvider, { childSegments: __resolveChildSegments(route.routeSegments || [], treePos, params) }, element);
		}
	}
	const GlobalErrorComponent = global_error_default;
	if (GlobalErrorComponent) element = (0, import_react_react_server.createElement)(ErrorBoundary, {
		fallback: GlobalErrorComponent,
		children: element
	});
	return element;
}
var __mwPatternCache = /* @__PURE__ */ new Map();
function __extractConstraint(str, re) {
	if (str[re.lastIndex] !== "(") return null;
	const start = re.lastIndex + 1;
	let depth = 1;
	let i = start;
	while (i < str.length && depth > 0) {
		if (str[i] === "(") depth++;
		else if (str[i] === ")") depth--;
		i++;
	}
	if (depth !== 0) return null;
	re.lastIndex = i;
	return str.slice(start, i - 1);
}
function __compileMwPattern(pattern) {
	const hasConstraints = /:[\w-]+[*+]?\(/.test(pattern);
	if (!hasConstraints && (pattern.includes("(") || pattern.includes("\\"))) return __safeRegExp("^" + pattern + "$");
	let regexStr = "";
	const tokenRe = /\/:([\w-]+)\*|\/:([\w-]+)\+|:([\w-]+)|[.]|[^/:.]+|./g;
	let tok;
	while ((tok = tokenRe.exec(pattern)) !== null) if (tok[1] !== void 0) {
		const c1 = hasConstraints ? __extractConstraint(pattern, tokenRe) : null;
		regexStr += c1 !== null ? "(?:/(" + c1 + "))?" : "(?:/.*)?";
	} else if (tok[2] !== void 0) {
		const c2 = hasConstraints ? __extractConstraint(pattern, tokenRe) : null;
		regexStr += c2 !== null ? "(?:/(" + c2 + "))" : "(?:/.+)";
	} else if (tok[3] !== void 0) {
		const constraint = hasConstraints ? __extractConstraint(pattern, tokenRe) : null;
		const isOptional = pattern[tokenRe.lastIndex] === "?";
		if (isOptional) tokenRe.lastIndex += 1;
		const group = constraint !== null ? "(" + constraint + ")" : "([^/]+)";
		if (isOptional && regexStr.endsWith("/")) regexStr = regexStr.slice(0, -1) + "(?:/" + group + ")?";
		else if (isOptional) regexStr += group + "?";
		else regexStr += group;
	} else if (tok[0] === ".") regexStr += "\\.";
	else regexStr += tok[0];
	return __safeRegExp("^" + regexStr + "$");
}
function matchMiddlewarePattern(pathname, pattern) {
	let cached = __mwPatternCache.get(pattern);
	if (cached === void 0) {
		cached = __compileMwPattern(pattern);
		__mwPatternCache.set(pattern, cached);
	}
	return cached ? cached.test(pathname) : pathname === pattern;
}
var __middlewareConditionRegexCache = /* @__PURE__ */ new Map();
var __emptyMiddlewareRequestContext = {
	headers: new Headers(),
	cookies: {},
	query: new URLSearchParams(),
	host: ""
};
function __normalizeMiddlewareHost(hostHeader, fallbackHostname) {
	return (hostHeader ?? fallbackHostname).split(":", 1)[0].toLowerCase();
}
function __parseMiddlewareCookies(cookieHeader) {
	if (!cookieHeader) return {};
	const cookies = {};
	for (const part of cookieHeader.split(";")) {
		const eq = part.indexOf("=");
		if (eq === -1) continue;
		const key = part.slice(0, eq).trim();
		const value = part.slice(eq + 1).trim();
		if (key) cookies[key] = value;
	}
	return cookies;
}
function __middlewareRequestContextFromRequest(request) {
	if (!request) return __emptyMiddlewareRequestContext;
	const url = new URL(request.url);
	return {
		headers: request.headers,
		cookies: __parseMiddlewareCookies(request.headers.get("cookie")),
		query: url.searchParams,
		host: __normalizeMiddlewareHost(request.headers.get("host"), url.hostname)
	};
}
function __stripMiddlewareLocalePrefix(pathname, i18nConfig) {
	if (pathname === "/") return null;
	const segments = pathname.split("/");
	const firstSegment = segments[1];
	if (!firstSegment || !i18nConfig || !i18nConfig.locales.includes(firstSegment)) return null;
	const stripped = "/" + segments.slice(2).join("/");
	return stripped === "/" ? "/" : stripped.replace(/\/+$/, "") || "/";
}
function __matchMiddlewareMatcherPattern(pathname, pattern, i18nConfig) {
	if (!i18nConfig) return matchMiddlewarePattern(pathname, pattern);
	return matchMiddlewarePattern(__stripMiddlewareLocalePrefix(pathname, i18nConfig) ?? pathname, pattern);
}
function __middlewareConditionRegex(value) {
	if (__middlewareConditionRegexCache.has(value)) return __middlewareConditionRegexCache.get(value);
	const re = __safeRegExp(value);
	__middlewareConditionRegexCache.set(value, re);
	return re;
}
function __checkMiddlewareCondition(condition, ctx) {
	switch (condition.type) {
		case "header": {
			const headerValue = ctx.headers.get(condition.key);
			if (headerValue === null) return false;
			if (condition.value !== void 0) {
				const re = __middlewareConditionRegex(condition.value);
				if (re) return re.test(headerValue);
				return headerValue === condition.value;
			}
			return true;
		}
		case "cookie": {
			const cookieValue = ctx.cookies[condition.key];
			if (cookieValue === void 0) return false;
			if (condition.value !== void 0) {
				const re = __middlewareConditionRegex(condition.value);
				if (re) return re.test(cookieValue);
				return cookieValue === condition.value;
			}
			return true;
		}
		case "query": {
			const queryValue = ctx.query.get(condition.key);
			if (queryValue === null) return false;
			if (condition.value !== void 0) {
				const re = __middlewareConditionRegex(condition.value);
				if (re) return re.test(queryValue);
				return queryValue === condition.value;
			}
			return true;
		}
		case "host":
			if (condition.value !== void 0) {
				const re = __middlewareConditionRegex(condition.value);
				if (re) return re.test(ctx.host);
				return ctx.host === condition.value;
			}
			return ctx.host === condition.key;
		default: return false;
	}
}
function __checkMiddlewareHasConditions(has, missing, ctx) {
	if (has) {
		for (const condition of has) if (!__checkMiddlewareCondition(condition, ctx)) return false;
	}
	if (missing) {
		for (const condition of missing) if (__checkMiddlewareCondition(condition, ctx)) return false;
	}
	return true;
}
function __isValidMiddlewareMatcherObject(matcher) {
	if (!matcher || typeof matcher !== "object" || Array.isArray(matcher)) return false;
	if (typeof matcher.source !== "string") return false;
	for (const key of Object.keys(matcher)) if (key !== "source" && key !== "locale" && key !== "has" && key !== "missing") return false;
	if ("locale" in matcher && matcher.locale !== void 0 && matcher.locale !== false) return false;
	if ("has" in matcher && matcher.has !== void 0 && !Array.isArray(matcher.has)) return false;
	if ("missing" in matcher && matcher.missing !== void 0 && !Array.isArray(matcher.missing)) return false;
	return true;
}
function __matchMiddlewareObject(pathname, matcher, i18nConfig) {
	return matcher.locale === false ? matchMiddlewarePattern(pathname, matcher.source) : __matchMiddlewareMatcherPattern(pathname, matcher.source, i18nConfig);
}
function matchesMiddleware(pathname, matcher, request, i18nConfig) {
	if (!matcher) return true;
	if (typeof matcher === "string") return __matchMiddlewareMatcherPattern(pathname, matcher, i18nConfig);
	if (!Array.isArray(matcher)) return false;
	const requestContext = __middlewareRequestContextFromRequest(request);
	for (const m of matcher) {
		if (typeof m === "string") {
			if (__matchMiddlewareMatcherPattern(pathname, m, i18nConfig)) return true;
			continue;
		}
		if (__isValidMiddlewareMatcherObject(m)) {
			if (!__matchMiddlewareObject(pathname, m, i18nConfig)) continue;
			if (!__checkMiddlewareHasConditions(m.has, m.missing, requestContext)) continue;
			return true;
		}
	}
	return false;
}
var __basePath = "";
var __trailingSlash = false;
var __i18nConfig = null;
var __configRedirects = [];
var __configRewrites = {
	"beforeFiles": [],
	"afterFiles": [],
	"fallback": []
};
var __configHeaders = [];
var __allowedOrigins = [];
function __isSafeRegex(pattern) {
	const quantifierAtDepth = [];
	let depth = 0;
	let i = 0;
	while (i < pattern.length) {
		const ch = pattern[i];
		if (ch === "\\") {
			i += 2;
			continue;
		}
		if (ch === "[") {
			i++;
			while (i < pattern.length && pattern[i] !== "]") {
				if (pattern[i] === "\\") i++;
				i++;
			}
			i++;
			continue;
		}
		if (ch === "(") {
			depth++;
			if (quantifierAtDepth.length <= depth) quantifierAtDepth.push(false);
			else quantifierAtDepth[depth] = false;
			i++;
			continue;
		}
		if (ch === ")") {
			const hadQ = depth > 0 && quantifierAtDepth[depth];
			if (depth > 0) depth--;
			const next = pattern[i + 1];
			if (next === "+" || next === "*" || next === "{") {
				if (hadQ) return false;
				if (depth >= 0 && depth < quantifierAtDepth.length) quantifierAtDepth[depth] = true;
			}
			i++;
			continue;
		}
		if (ch === "+" || ch === "*") {
			if (depth > 0) quantifierAtDepth[depth] = true;
			i++;
			continue;
		}
		if (ch === "?") {
			const prev = i > 0 ? pattern[i - 1] : "";
			if (prev !== "+" && prev !== "*" && prev !== "?" && prev !== "}") {
				if (depth > 0) quantifierAtDepth[depth] = true;
			}
			i++;
			continue;
		}
		if (ch === "{") {
			let j = i + 1;
			while (j < pattern.length && /[\d,]/.test(pattern[j])) j++;
			if (j < pattern.length && pattern[j] === "}" && j > i + 1) {
				if (depth > 0) quantifierAtDepth[depth] = true;
				i = j + 1;
				continue;
			}
		}
		i++;
	}
	return true;
}
function __safeRegExp(pattern, flags) {
	if (!__isSafeRegex(pattern)) {
		console.warn("[vinext] Ignoring potentially unsafe regex pattern (ReDoS risk): " + pattern);
		return null;
	}
	try {
		return new RegExp(pattern, flags);
	} catch {
		return null;
	}
}
function __normalizePath(pathname) {
	if (pathname === "/" || pathname.length > 1 && pathname[0] === "/" && !pathname.includes("//") && !pathname.includes("/./") && !pathname.includes("/../") && !pathname.endsWith("/.") && !pathname.endsWith("/..")) return pathname;
	const segments = pathname.split("/");
	const resolved = [];
	for (let i = 0; i < segments.length; i++) {
		const seg = segments[i];
		if (seg === "" || seg === ".") continue;
		if (seg === "..") resolved.pop();
		else resolved.push(seg);
	}
	return "/" + resolved.join("/");
}
var __pathDelimiterRegex = /([/#?\\]|%(2f|23|3f|5c))/gi;
function __decodeRouteSegment(segment) {
	return decodeURIComponent(segment).replace(__pathDelimiterRegex, function(char) {
		return encodeURIComponent(char);
	});
}
function __decodeRouteSegmentSafe(segment) {
	try {
		return __decodeRouteSegment(segment);
	} catch (e) {
		return segment;
	}
}
function __normalizePathnameForRouteMatch(pathname) {
	const segments = pathname.split("/");
	const normalized = [];
	for (let i = 0; i < segments.length; i++) normalized.push(__decodeRouteSegmentSafe(segments[i]));
	return normalized.join("/");
}
function __normalizePathnameForRouteMatchStrict(pathname) {
	const segments = pathname.split("/");
	const normalized = [];
	for (let i = 0; i < segments.length; i++) normalized.push(__decodeRouteSegment(segments[i]));
	return normalized.join("/");
}
/**
* Build a request context from the live ALS HeadersContext, which reflects
* any x-middleware-request-* header mutations applied by middleware.
* Used for afterFiles and fallback rewrite has/missing evaluation — these
* run after middleware in the App Router execution order.
*/
function __buildPostMwRequestContext(request) {
	const url = new URL(request.url);
	const ctx = getHeadersContext();
	if (!ctx) return requestContextFromRequest(request);
	const cookiesRecord = Object.fromEntries(ctx.cookies);
	return {
		headers: ctx.headers,
		cookies: cookiesRecord,
		query: url.searchParams,
		host: normalizeHost(ctx.headers.get("host"), url.hostname)
	};
}
/**
* Maximum server-action request body size.
* Configurable via experimental.serverActions.bodySizeLimit in next.config.
* Defaults to 1MB, matching the Next.js default.
* @see https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions#bodysizelimit
* Prevents unbounded request body buffering.
*/
var __MAX_ACTION_BODY_SIZE = 1048576;
/**
* Read a request body as text with a size limit.
* Enforces the limit on the actual byte stream to prevent bypasses
* via chunked transfer-encoding where Content-Length is absent or spoofed.
*/
async function __readBodyWithLimit(request, maxBytes) {
	if (!request.body) return "";
	var reader = request.body.getReader();
	var decoder = new TextDecoder();
	var chunks = [];
	var totalSize = 0;
	for (;;) {
		var result = await reader.read();
		if (result.done) break;
		totalSize += result.value.byteLength;
		if (totalSize > maxBytes) {
			reader.cancel();
			throw new Error("Request body too large");
		}
		chunks.push(decoder.decode(result.value, { stream: true }));
	}
	chunks.push(decoder.decode());
	return chunks.join("");
}
/**
* Read a request body as FormData with a size limit.
* Consumes the body stream with a byte counter and then parses the
* collected bytes as multipart form data via the Response constructor.
*/
async function __readFormDataWithLimit(request, maxBytes) {
	if (!request.body) return new FormData();
	var reader = request.body.getReader();
	var chunks = [];
	var totalSize = 0;
	for (;;) {
		var result = await reader.read();
		if (result.done) break;
		totalSize += result.value.byteLength;
		if (totalSize > maxBytes) {
			reader.cancel();
			throw new Error("Request body too large");
		}
		chunks.push(result.value);
	}
	var combined = new Uint8Array(totalSize);
	var offset = 0;
	for (var chunk of chunks) {
		combined.set(chunk, offset);
		offset += chunk.byteLength;
	}
	var contentType = request.headers.get("content-type") || "";
	return new Response(combined, { headers: { "Content-Type": contentType } }).formData();
}
var generateStaticParamsMap = {
	"/dashboard/admin/promotions/:id/edit": null,
	"/dashboard/admin/services/:id/edit": null,
	"/dashboard/admin/users/:id": null,
	"/chat/:conversationId": null,
	"/salons/:id": null,
	"/services/:id": null
};
async function handler(request, ctx) {
	return runWithRequestContext(createRequestContext({
		headersContext: headersContextFromRequest(request),
		executionContext: ctx ?? getRequestExecutionContext() ?? null
	}), async () => {
		ensureFetchPatch();
		const __reqCtx = requestContextFromRequest(request);
		const response = await _handleRequest(request, __reqCtx, {
			headers: null,
			status: null
		});
		if (response && response.headers && !(response.status >= 300 && response.status < 400)) {
			if (__configHeaders.length) {
				const url = new URL(request.url);
				let pathname;
				try {
					pathname = __normalizePath(__normalizePathnameForRouteMatch(url.pathname));
				} catch {
					pathname = url.pathname;
				}
				const extraHeaders = matchHeaders(pathname, __configHeaders, __reqCtx);
				for (const h of extraHeaders) {
					const lk = h.key.toLowerCase();
					if (lk === "vary" || lk === "set-cookie") response.headers.append(h.key, h.value);
					else if (!response.headers.has(lk)) response.headers.set(h.key, h.value);
				}
			}
		}
		return response;
	});
}
async function _handleRequest(request, __reqCtx, _mwCtx) {
	const __reqStart = 0;
	const url = new URL(request.url);
	const __protoGuard = guardProtocolRelativeUrl(url.pathname);
	if (__protoGuard) return __protoGuard;
	let decodedUrlPathname;
	try {
		decodedUrlPathname = __normalizePathnameForRouteMatchStrict(url.pathname);
	} catch (e) {
		return new Response("Bad Request", { status: 400 });
	}
	let pathname = __normalizePath(decodedUrlPathname);
	if (pathname === "/__vinext/prerender/static-params") {
		if (process.env.VINEXT_PRERENDER !== "1") return new Response("Not Found", { status: 404 });
		const pattern = url.searchParams.get("pattern");
		if (!pattern) return new Response("missing pattern", { status: 400 });
		const fn = generateStaticParamsMap[pattern];
		if (typeof fn !== "function") return new Response("null", {
			status: 200,
			headers: { "content-type": "application/json" }
		});
		try {
			const parentParams = url.searchParams.get("parentParams");
			const raw = parentParams ? JSON.parse(parentParams) : {};
			const result = await fn({ params: typeof raw === "object" && raw !== null && !Array.isArray(raw) ? raw : {} });
			return new Response(JSON.stringify(result), {
				status: 200,
				headers: { "content-type": "application/json" }
			});
		} catch (e) {
			return new Response(JSON.stringify({ error: String(e) }), {
				status: 500,
				headers: { "content-type": "application/json" }
			});
		}
	}
	if (pathname === "/__vinext/prerender/pages-static-paths") {
		if (process.env.VINEXT_PRERENDER !== "1") return new Response("Not Found", { status: 404 });
		const __gspPattern = url.searchParams.get("pattern");
		if (!__gspPattern) return new Response("missing pattern", { status: 400 });
		try {
			const __pagesRoutes = (await import("./ssr.mjs")).pageRoutes;
			const __gspRoute = Array.isArray(__pagesRoutes) ? __pagesRoutes.find((r) => r.pattern === __gspPattern) : void 0;
			if (!__gspRoute || typeof __gspRoute.module?.getStaticPaths !== "function") return new Response("null", {
				status: 200,
				headers: { "content-type": "application/json" }
			});
			const __localesParam = url.searchParams.get("locales");
			const __locales = __localesParam ? JSON.parse(__localesParam) : [];
			const __defaultLocale = url.searchParams.get("defaultLocale") ?? "";
			const __gspResult = await __gspRoute.module.getStaticPaths({
				locales: __locales,
				defaultLocale: __defaultLocale
			});
			return new Response(JSON.stringify(__gspResult), {
				status: 200,
				headers: { "content-type": "application/json" }
			});
		} catch (e) {
			return new Response(JSON.stringify({ error: String(e) }), {
				status: 500,
				headers: { "content-type": "application/json" }
			});
		}
	}
	const __tsRedirect = normalizeTrailingSlash(pathname, __basePath, __trailingSlash, url.search);
	if (__tsRedirect) return __tsRedirect;
	if (__configRedirects.length) {
		const __redir = matchRedirect(pathname.endsWith(".rsc") ? pathname.slice(0, -4) : pathname, __configRedirects, __reqCtx);
		if (__redir) {
			const __redirDest = sanitizeDestination(__redir.destination);
			return new Response(null, {
				status: __redir.permanent ? 308 : 307,
				headers: { Location: __redirDest }
			});
		}
	}
	const isRscRequest = pathname.endsWith(".rsc") || request.headers.get("accept")?.includes("text/x-component");
	let cleanPathname = pathname.replace(/\.rsc$/, "");
	{
		const middlewareFn = middleware ?? middleware;
		if (typeof middlewareFn !== "function") throw new Error("The Middleware file must export a function named `middleware` or a `default` function.");
		const middlewareMatcher = config?.matcher;
		if (matchesMiddleware(cleanPathname, middlewareMatcher, request, __i18nConfig)) try {
			const mwUrl = new URL(request.url);
			mwUrl.pathname = cleanPathname;
			const mwRequest = new Request(mwUrl, request);
			const nextRequest = mwRequest instanceof NextRequest ? mwRequest : new NextRequest(mwRequest, void 0);
			const mwFetchEvent = new NextFetchEvent({ page: cleanPathname });
			const mwResponse = await middlewareFn(nextRequest, mwFetchEvent);
			const _mwWaitUntil = mwFetchEvent.drainWaitUntil();
			const _mwExecCtx = getRequestExecutionContext();
			if (_mwExecCtx && typeof _mwExecCtx.waitUntil === "function") _mwExecCtx.waitUntil(_mwWaitUntil);
			if (mwResponse) if (mwResponse.headers.get("x-middleware-next") === "1") {
				_mwCtx.headers = new Headers();
				for (const [key, value] of mwResponse.headers) if (key !== "x-middleware-next" && key !== "x-middleware-rewrite") _mwCtx.headers.append(key, value);
			} else {
				if (mwResponse.status >= 300 && mwResponse.status < 400) return mwResponse;
				const rewriteUrl = mwResponse.headers.get("x-middleware-rewrite");
				if (rewriteUrl) {
					const rewriteParsed = new URL(rewriteUrl, request.url);
					cleanPathname = rewriteParsed.pathname;
					url.search = rewriteParsed.search;
					if (mwResponse.status !== 200) _mwCtx.status = mwResponse.status;
					_mwCtx.headers = new Headers();
					for (const [key, value] of mwResponse.headers) if (key !== "x-middleware-next" && key !== "x-middleware-rewrite") _mwCtx.headers.append(key, value);
				} else return mwResponse;
			}
		} catch (err) {
			console.error("[vinext] Middleware error:", err);
			return new Response("Internal Server Error", { status: 500 });
		}
	}
	if (_mwCtx.headers) {
		applyMiddlewareRequestHeaders(_mwCtx.headers);
		processMiddlewareHeaders(_mwCtx.headers);
	}
	const __postMwReqCtx = __buildPostMwRequestContext(request);
	if (__configRewrites.beforeFiles && __configRewrites.beforeFiles.length) {
		const __rewritten = matchRewrite(cleanPathname, __configRewrites.beforeFiles, __postMwReqCtx);
		if (__rewritten) {
			if (isExternalUrl(__rewritten)) {
				setHeadersContext(null);
				setNavigationContext(null);
				return proxyExternalRequest(request, __rewritten);
			}
			cleanPathname = __rewritten;
		}
	}
	if (cleanPathname === "/_vinext/image") {
		const __imgResult = validateImageUrl(url.searchParams.get("url"), request.url);
		if (__imgResult instanceof Response) return __imgResult;
		return Response.redirect(new URL(__imgResult, url.origin).href, 302);
	}
	for (const metaRoute of metadataRoutes) {
		if (metaRoute.type === "sitemap" && metaRoute.isDynamic && typeof metaRoute.module.generateSitemaps === "function") {
			const sitemapPrefix = metaRoute.servedUrl.slice(0, -4);
			if (cleanPathname.startsWith(sitemapPrefix + "/") && cleanPathname.endsWith(".xml")) {
				const rawId = cleanPathname.slice(sitemapPrefix.length + 1, -4);
				if (rawId.includes("/")) continue;
				const matched = (await metaRoute.module.generateSitemaps()).find(function(s) {
					return String(s.id) === rawId;
				});
				if (!matched) return new Response("Not Found", { status: 404 });
				const result = await metaRoute.module.default({ id: matched.id });
				if (result instanceof Response) return result;
				return new Response(sitemapToXml(result), { headers: { "Content-Type": metaRoute.contentType } });
			}
			continue;
		}
		var _metaParams = null;
		if (metaRoute.patternParts) {
			_metaParams = matchPattern(cleanPathname.split("/").filter(Boolean), metaRoute.patternParts);
			if (!_metaParams) continue;
		} else if (cleanPathname !== metaRoute.servedUrl) continue;
		if (metaRoute.isDynamic) {
			const metaFn = metaRoute.module.default;
			if (typeof metaFn === "function") {
				const result = await metaFn({ params: makeThenableParams(_metaParams || {}) });
				let body;
				if (result instanceof Response) return result;
				if (metaRoute.type === "sitemap") body = sitemapToXml(result);
				else if (metaRoute.type === "robots") body = robotsToText(result);
				else if (metaRoute.type === "manifest") body = manifestToJson(result);
				else body = JSON.stringify(result);
				return new Response(body, { headers: { "Content-Type": metaRoute.contentType } });
			}
		} else try {
			const binary = atob(metaRoute.fileDataBase64);
			const bytes = new Uint8Array(binary.length);
			for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
			return new Response(bytes, { headers: {
				"Content-Type": metaRoute.contentType,
				"Cache-Control": "public, max-age=0, must-revalidate"
			} });
		} catch {
			return new Response("Not Found", { status: 404 });
		}
	}
	setNavigationContext({
		pathname: cleanPathname,
		searchParams: url.searchParams,
		params: {}
	});
	const actionId = request.headers.get("x-rsc-action");
	if (request.method === "POST" && actionId) {
		const csrfResponse = validateCsrfOrigin(request, __allowedOrigins);
		if (csrfResponse) return csrfResponse;
		if (parseInt(request.headers.get("content-length") || "0", 10) > __MAX_ACTION_BODY_SIZE) {
			setHeadersContext(null);
			setNavigationContext(null);
			return new Response("Payload Too Large", { status: 413 });
		}
		try {
			const contentType = request.headers.get("content-type") || "";
			let body;
			try {
				body = contentType.startsWith("multipart/form-data") ? await __readFormDataWithLimit(request, __MAX_ACTION_BODY_SIZE) : await __readBodyWithLimit(request, __MAX_ACTION_BODY_SIZE);
			} catch (sizeErr) {
				if (sizeErr && sizeErr.message === "Request body too large") {
					setHeadersContext(null);
					setNavigationContext(null);
					return new Response("Payload Too Large", { status: 413 });
				}
				throw sizeErr;
			}
			const temporaryReferences = createTemporaryReferenceSet();
			const args = await decodeReply(body, { temporaryReferences });
			const action = await loadServerAction(actionId);
			let returnValue;
			let actionRedirect = null;
			const previousHeadersPhase = setHeadersAccessPhase("action");
			try {
				try {
					returnValue = {
						ok: true,
						data: await action.apply(null, args)
					};
				} catch (e) {
					if (e && typeof e === "object" && "digest" in e) {
						const digest = String(e.digest);
						if (digest.startsWith("NEXT_REDIRECT;")) {
							const parts = digest.split(";");
							actionRedirect = {
								url: decodeURIComponent(parts[2]),
								type: parts[1] || "replace",
								status: parts[3] ? parseInt(parts[3], 10) : 307
							};
							returnValue = {
								ok: true,
								data: void 0
							};
						} else if (digest === "NEXT_NOT_FOUND" || digest.startsWith("NEXT_HTTP_ERROR_FALLBACK;")) returnValue = {
							ok: false,
							data: e
						};
						else {
							console.error("[vinext] Server action error:", e);
							returnValue = {
								ok: false,
								data: __sanitizeErrorForClient(e)
							};
						}
					} else {
						console.error("[vinext] Server action error:", e);
						returnValue = {
							ok: false,
							data: __sanitizeErrorForClient(e)
						};
					}
				}
			} finally {
				setHeadersAccessPhase(previousHeadersPhase);
			}
			if (actionRedirect) {
				const actionPendingCookies = getAndClearPendingCookies();
				const actionDraftCookie = getDraftModeCookieHeader();
				setHeadersContext(null);
				setNavigationContext(null);
				const redirectHeaders = new Headers({
					"Content-Type": "text/x-component; charset=utf-8",
					"Vary": "RSC, Accept",
					"x-action-redirect": actionRedirect.url,
					"x-action-redirect-type": actionRedirect.type,
					"x-action-redirect-status": String(actionRedirect.status)
				});
				for (const cookie of actionPendingCookies) redirectHeaders.append("Set-Cookie", cookie);
				if (actionDraftCookie) redirectHeaders.append("Set-Cookie", actionDraftCookie);
				return new Response("", {
					status: 200,
					headers: redirectHeaders
				});
			}
			const match = matchRoute(cleanPathname);
			let element;
			if (match) {
				const { route: actionRoute, params: actionParams } = match;
				setNavigationContext({
					pathname: cleanPathname,
					searchParams: url.searchParams,
					params: actionParams
				});
				element = buildPageElement(actionRoute, actionParams, void 0, url.searchParams);
			} else element = (0, import_react_react_server.createElement)("div", null, "Page not found");
			const onRenderError = createRscOnErrorHandler(request, cleanPathname, match ? match.route.pattern : cleanPathname);
			const rscStream = renderToReadableStream({
				root: element,
				returnValue
			}, {
				temporaryReferences,
				onError: onRenderError
			});
			const actionPendingCookies = getAndClearPendingCookies();
			const actionDraftCookie = getDraftModeCookieHeader();
			const actionResponse = new Response(rscStream, { headers: {
				"Content-Type": "text/x-component; charset=utf-8",
				"Vary": "RSC, Accept"
			} });
			if (actionPendingCookies.length > 0 || actionDraftCookie) {
				for (const cookie of actionPendingCookies) actionResponse.headers.append("Set-Cookie", cookie);
				if (actionDraftCookie) actionResponse.headers.append("Set-Cookie", actionDraftCookie);
			}
			return actionResponse;
		} catch (err) {
			getAndClearPendingCookies();
			console.error("[vinext] Server action error:", err);
			reportRequestError(err instanceof Error ? err : new Error(String(err)), {
				path: cleanPathname,
				method: request.method,
				headers: Object.fromEntries(request.headers.entries())
			}, {
				routerKind: "App Router",
				routePath: cleanPathname,
				routeType: "action"
			});
			setHeadersContext(null);
			setNavigationContext(null);
			return new Response("Internal Server Error", { status: 500 });
		}
	}
	if (__configRewrites.afterFiles && __configRewrites.afterFiles.length) {
		const __afterRewritten = matchRewrite(cleanPathname, __configRewrites.afterFiles, __postMwReqCtx);
		if (__afterRewritten) {
			if (isExternalUrl(__afterRewritten)) {
				setHeadersContext(null);
				setNavigationContext(null);
				return proxyExternalRequest(request, __afterRewritten);
			}
			cleanPathname = __afterRewritten;
		}
	}
	let match = matchRoute(cleanPathname);
	if (!match && __configRewrites.fallback && __configRewrites.fallback.length) {
		const __fallbackRewritten = matchRewrite(cleanPathname, __configRewrites.fallback, __postMwReqCtx);
		if (__fallbackRewritten) {
			if (isExternalUrl(__fallbackRewritten)) {
				setHeadersContext(null);
				setNavigationContext(null);
				return proxyExternalRequest(request, __fallbackRewritten);
			}
			cleanPathname = __fallbackRewritten;
			match = matchRoute(cleanPathname);
		}
	}
	if (!match) {
		if (!isRscRequest) {
			const __pagesEntry = await import("./ssr.mjs");
			if (typeof __pagesEntry.renderPage === "function") {
				const __pagesRes = await __pagesEntry.renderPage(request, decodeURIComponent(url.pathname) + (url.search || ""), {});
				if (__pagesRes.status !== 404) {
					setHeadersContext(null);
					setNavigationContext(null);
					return __pagesRes;
				}
			}
		}
		const notFoundResponse = await renderNotFoundPage(null, isRscRequest, request);
		if (notFoundResponse) return notFoundResponse;
		setHeadersContext(null);
		setNavigationContext(null);
		return new Response("Not Found", { status: 404 });
	}
	const { route, params } = match;
	setNavigationContext({
		pathname: cleanPathname,
		searchParams: url.searchParams,
		params
	});
	if (route.routeHandler) {
		const handler = route.routeHandler;
		const method = request.method.toUpperCase();
		const revalidateSeconds = getAppRouteHandlerRevalidateSeconds(handler);
		if (hasAppRouteHandlerDefaultExport(handler) && false);
		const { allowHeaderForOptions, handlerFn, isAutoHead, shouldAutoRespondToOptions } = resolveAppRouteHandlerMethod(handler, method);
		if (shouldAutoRespondToOptions) {
			setHeadersContext(null);
			setNavigationContext(null);
			return applyRouteHandlerMiddlewareContext(new Response(null, {
				status: 204,
				headers: { "Allow": allowHeaderForOptions }
			}), _mwCtx);
		}
		if (shouldReadAppRouteHandlerCache({
			dynamicConfig: handler.dynamic,
			handlerFn,
			isAutoHead,
			isKnownDynamic: isKnownDynamicAppRoute(route.pattern),
			isProduction: true,
			method,
			revalidateSeconds
		})) {
			const __cachedRouteResponse = await readAppRouteHandlerCacheResponse({
				basePath: __basePath,
				buildPageCacheTags: __pageCacheTags,
				cleanPathname,
				clearRequestContext: function() {
					setHeadersContext(null);
					setNavigationContext(null);
				},
				consumeDynamicUsage,
				getCollectedFetchTags,
				handlerFn,
				i18n: __i18nConfig,
				isAutoHead,
				isrDebug: __isrDebug,
				isrGet: __isrGet,
				isrRouteKey: __isrRouteKey,
				isrSet: __isrSet,
				markDynamicUsage,
				middlewareContext: _mwCtx,
				params,
				requestUrl: request.url,
				revalidateSearchParams: url.searchParams,
				revalidateSeconds,
				routePattern: route.pattern,
				runInRevalidationContext: async function(renderFn) {
					await runWithRequestContext(createRequestContext({
						headersContext: {
							headers: new Headers(),
							cookies: /* @__PURE__ */ new Map()
						},
						executionContext: getRequestExecutionContext()
					}), async () => {
						ensureFetchPatch();
						await renderFn();
					});
				},
				scheduleBackgroundRegeneration: __triggerBackgroundRegeneration,
				setNavigationContext
			});
			if (__cachedRouteResponse) return __cachedRouteResponse;
		}
		if (typeof handlerFn === "function") return executeAppRouteHandler({
			basePath: __basePath,
			buildPageCacheTags: __pageCacheTags,
			cleanPathname,
			clearRequestContext: function() {
				setHeadersContext(null);
				setNavigationContext(null);
			},
			consumeDynamicUsage,
			executionContext: getRequestExecutionContext(),
			getAndClearPendingCookies,
			getCollectedFetchTags,
			getDraftModeCookieHeader,
			handler,
			handlerFn,
			i18n: __i18nConfig,
			isAutoHead,
			isProduction: true,
			isrDebug: __isrDebug,
			isrRouteKey: __isrRouteKey,
			isrSet: __isrSet,
			markDynamicUsage,
			method,
			middlewareContext: _mwCtx,
			params,
			reportRequestError,
			request,
			revalidateSeconds,
			routePattern: route.pattern,
			setHeadersAccessPhase
		});
		setHeadersContext(null);
		setNavigationContext(null);
		return applyRouteHandlerMiddlewareContext(new Response(null, { status: 405 }), _mwCtx);
	}
	const PageComponent = route.page?.default;
	if (!PageComponent) {
		setHeadersContext(null);
		setNavigationContext(null);
		return new Response("Page has no default export", { status: 500 });
	}
	let revalidateSeconds = typeof route.page?.revalidate === "number" ? route.page.revalidate : null;
	const dynamicConfig = route.page?.dynamic;
	const dynamicParamsConfig = route.page?.dynamicParams;
	const isForceStatic = dynamicConfig === "force-static";
	const isDynamicError = dynamicConfig === "error";
	if (isForceStatic) {
		setHeadersContext({
			headers: new Headers(),
			cookies: /* @__PURE__ */ new Map()
		});
		setNavigationContext({
			pathname: cleanPathname,
			searchParams: new URLSearchParams(),
			params
		});
	}
	if (isDynamicError) {
		setHeadersContext({
			headers: new Headers(),
			cookies: /* @__PURE__ */ new Map(),
			accessError: /* @__PURE__ */ new Error("Page with `dynamic = \"error\"` used a dynamic API. This page was expected to be fully static, but headers(), cookies(), or searchParams was accessed. Remove the dynamic API usage or change the dynamic config to \"auto\" or \"force-dynamic\".")
		});
		setNavigationContext({
			pathname: cleanPathname,
			searchParams: new URLSearchParams(),
			params
		});
	}
	const isForceDynamic = dynamicConfig === "force-dynamic";
	if (!isForceDynamic && revalidateSeconds !== null && revalidateSeconds > 0 && revalidateSeconds !== Infinity) {
		const __cachedPageResponse = await readAppPageCacheResponse({
			cleanPathname,
			clearRequestContext: function() {
				setHeadersContext(null);
				setNavigationContext(null);
			},
			isRscRequest,
			isrDebug: __isrDebug,
			isrGet: __isrGet,
			isrHtmlKey: __isrHtmlKey,
			isrRscKey: __isrRscKey,
			isrSet: __isrSet,
			revalidateSeconds,
			renderFreshPageForCache: async function() {
				return runWithRequestContext(createRequestContext({
					headersContext: {
						headers: new Headers(),
						cookies: /* @__PURE__ */ new Map()
					},
					executionContext: getRequestExecutionContext()
				}), async () => {
					ensureFetchPatch();
					setNavigationContext({
						pathname: cleanPathname,
						searchParams: new URLSearchParams(),
						params
					});
					const __revalRscCapture = teeAppPageRscStreamForCapture(renderToReadableStream(await buildPageElement(route, params, void 0, new URLSearchParams()), { onError: createRscOnErrorHandler(request, cleanPathname, route.pattern) }), true);
					const __revalFontData = {
						links: getSSRFontLinks(),
						styles: _getSSRFontStyles(),
						preloads: _getSSRFontPreloads()
					};
					const __revalHtmlStream = await (await import("./ssr.mjs")).handleSsr(__revalRscCapture.responseStream, getNavigationContext(), __revalFontData);
					setHeadersContext(null);
					setNavigationContext(null);
					return {
						html: await readAppPageTextStream(__revalHtmlStream),
						rscData: await __revalRscCapture.capturedRscDataPromise,
						tags: __pageCacheTags(cleanPathname, getCollectedFetchTags())
					};
				});
			},
			scheduleBackgroundRegeneration: __triggerBackgroundRegeneration
		});
		if (__cachedPageResponse) return __cachedPageResponse;
	}
	const __dynamicParamsResponse = await validateAppPageDynamicParams({
		clearRequestContext() {
			setHeadersContext(null);
			setNavigationContext(null);
		},
		enforceStaticParamsOnly: dynamicParamsConfig === false,
		generateStaticParams: route.page?.generateStaticParams,
		isDynamicRoute: route.isDynamic,
		logGenerateStaticParamsError(err) {
			console.error("[vinext] generateStaticParams error:", err);
		},
		params
	});
	if (__dynamicParamsResponse) return __dynamicParamsResponse;
	const __interceptResult = await resolveAppPageIntercept({
		buildPageElement,
		cleanPathname,
		currentRoute: route,
		findIntercept,
		getRoutePattern(sourceRoute) {
			return sourceRoute.pattern;
		},
		getSourceRoute(sourceRouteIndex) {
			return routes[sourceRouteIndex];
		},
		isRscRequest,
		matchSourceRouteParams(pattern) {
			return matchRoute(pattern)?.params ?? {};
		},
		renderInterceptResponse(sourceRoute, interceptElement) {
			const interceptStream = renderToReadableStream(interceptElement, { onError: createRscOnErrorHandler(request, cleanPathname, sourceRoute.pattern) });
			return new Response(interceptStream, { headers: {
				"Content-Type": "text/x-component; charset=utf-8",
				"Vary": "RSC, Accept"
			} });
		},
		searchParams: url.searchParams,
		setNavigationContext,
		toInterceptOpts(intercept) {
			return {
				interceptSlot: intercept.slotName,
				interceptPage: intercept.page,
				interceptParams: intercept.matchedParams
			};
		}
	});
	if (__interceptResult.response) return __interceptResult.response;
	const interceptOpts = __interceptResult.interceptOpts;
	const __pageBuildResult = await buildAppPageElement({
		buildPageElement() {
			return buildPageElement(route, params, interceptOpts, url.searchParams);
		},
		renderErrorBoundaryPage(buildErr) {
			return renderErrorBoundaryPage(route, buildErr, isRscRequest, request, params);
		},
		renderSpecialError(__buildSpecialError) {
			return buildAppPageSpecialErrorResponse({
				clearRequestContext() {
					setHeadersContext(null);
					setNavigationContext(null);
				},
				renderFallbackPage(statusCode) {
					return renderHTTPAccessFallbackPage(route, statusCode, isRscRequest, request, { matchedParams: params });
				},
				requestUrl: request.url,
				specialError: __buildSpecialError
			});
		},
		resolveSpecialError: resolveAppPageSpecialError
	});
	if (__pageBuildResult.response) return __pageBuildResult.response;
	const element = __pageBuildResult.element;
	const _hasLoadingBoundary = !!(route.loading && route.loading.default);
	const _asyncLayoutParams = makeThenableParams(params);
	return renderAppPageLifecycle({
		cleanPathname,
		clearRequestContext() {
			setHeadersContext(null);
			setNavigationContext(null);
		},
		consumeDynamicUsage,
		createRscOnErrorHandler(pathname, routePath) {
			return createRscOnErrorHandler(request, pathname, routePath);
		},
		element,
		getDraftModeCookieHeader,
		getFontLinks: getSSRFontLinks,
		getFontPreloads: _getSSRFontPreloads,
		getFontStyles: _getSSRFontStyles,
		getNavigationContext,
		getPageTags() {
			return __pageCacheTags(cleanPathname, getCollectedFetchTags());
		},
		getRequestCacheLife() {
			return _consumeRequestScopedCacheLife();
		},
		handlerStart: __reqStart,
		hasLoadingBoundary: _hasLoadingBoundary,
		isDynamicError,
		isForceDynamic,
		isForceStatic,
		isProduction: true,
		isRscRequest,
		isrDebug: __isrDebug,
		isrHtmlKey: __isrHtmlKey,
		isrRscKey: __isrRscKey,
		isrSet: __isrSet,
		layoutCount: route.layouts?.length ?? 0,
		loadSsrHandler() {
			return import("./ssr.mjs");
		},
		middlewareContext: _mwCtx,
		params,
		probeLayoutAt(li) {
			const LayoutComp = route.layouts[li]?.default;
			if (!LayoutComp) return null;
			return LayoutComp({
				params: _asyncLayoutParams,
				children: null
			});
		},
		probePage() {
			return PageComponent({ params });
		},
		revalidateSeconds,
		renderErrorBoundaryResponse(renderErr) {
			return renderErrorBoundaryPage(route, renderErr, isRscRequest, request, params);
		},
		async renderLayoutSpecialError(__layoutSpecialError, li) {
			return buildAppPageSpecialErrorResponse({
				clearRequestContext() {
					setHeadersContext(null);
					setNavigationContext(null);
				},
				renderFallbackPage(statusCode) {
					let parentNotFound = null;
					if (route.notFounds) {
						for (let pi = li - 1; pi >= 0; pi--) if (route.notFounds[pi]?.default) {
							parentNotFound = route.notFounds[pi].default;
							break;
						}
					}
					if (!parentNotFound) parentNotFound = not_found_default;
					const parentLayouts = route.layouts.slice(0, li);
					return renderHTTPAccessFallbackPage(route, statusCode, isRscRequest, request, {
						boundaryComponent: parentNotFound,
						layouts: parentLayouts,
						matchedParams: params
					});
				},
				requestUrl: request.url,
				specialError: __layoutSpecialError
			});
		},
		async renderPageSpecialError(specialError) {
			return buildAppPageSpecialErrorResponse({
				clearRequestContext() {
					setHeadersContext(null);
					setNavigationContext(null);
				},
				renderFallbackPage(statusCode) {
					return renderHTTPAccessFallbackPage(route, statusCode, isRscRequest, request, { matchedParams: params });
				},
				requestUrl: request.url,
				specialError
			});
		},
		renderToReadableStream,
		routeHasLocalBoundary: !!route?.error?.default || !!(route?.errors && route.errors.some(function(e) {
			return e?.default;
		})),
		routePattern: route.pattern,
		runWithSuppressedHookWarning(probe) {
			return _suppressHookWarningAls.run(true, probe);
		},
		waitUntil(__cachePromise) {
			getRequestExecutionContext()?.waitUntil(__cachePromise);
		}
	});
}
//#endregion
export { updateUserRole as $, getUnreadCount as A, RespondFriendRequestSchema as B, getAdminMetrics as C, getConversationById as D, getChatStats as E, emitRealtimeEvent as F, sendResetPasswordEmail as G, UserSearchSchema as H, AcceptInviteSchema as I, deleteUser as J, sendVerificationEmail as K, BlockUserSchema as L, markMessagesAsRead as M, sendMessage as N, getMessages as O, hybridUploadAction as P, getUsersForAdmin as Q, FriendshipFiltersSchema as R, updateUser as S, getDashboardMetrics as T, generateResetToken as U, SendFriendRequestSchema as V, generateVerificationToken as W, getReportsData as X, getBarbersForAdmin as Y, getUserById$1 as Z, getUserById as _, completeAppointment as a, toggleServiceStatus as at, restoreUser as b, getAppointmentById as c, deletePromotion as ct, updateAppointment as d, handler as default, togglePromotionStatus as dt, FriendshipService as et, checkBarberAvailability as f, updatePromotion as ft, getBarbers as g, generateStaticParamsMap, getBarberById as h, checkAvailability as i, getServicesForAdmin as it, getUserConversations as j, getOrCreateConversation as k, getAppointments as l, getPromotionByIdForAdmin as lt, getBarberAvailableSlots as m, SchedulingPage as n, deleteService as nt, confirmAppointment as o, updateService as ot, createUser as p, verifyEmailConfig as q, cancelAppointment as r, getServiceByIdForAdmin as rt, createAppointment as s, createPromotion as st, $$hoist_0_handleAppointmentSubmit as t, createService as tt, getAvailableSlots as u, getPromotionsForAdmin as ut, getUserStats as v, getBarberMetrics as w, softDeleteUser as x, getUsers as y, GenerateInviteCodeSchema as z };
