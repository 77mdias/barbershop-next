import { t as db } from "./prisma-uKWGIJ7B.mjs";
//#region node_modules/.nitro/vite/services/rsc/assets/serviceService-CVWnM_eC.js
var ServiceService = class {
	/**
	* Buscar todos os serviços com filtros
	*/
	static async findMany(filters = {}) {
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
		const page = filters.page || 1;
		const limit = filters.limit || 50;
		const [services, total] = await Promise.all([db.service.findMany({
			where,
			include: { _count: { select: { appointments: true } } },
			orderBy: [{ active: "desc" }, { name: "asc" }],
			skip: (page - 1) * limit,
			take: limit
		}), db.service.count({ where })]);
		return {
			services,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		};
	}
	/**
	* Buscar serviço por ID
	*/
	static async findById(id) {
		return await db.service.findUnique({
			where: { id },
			include: { _count: { select: { appointments: true } } }
		});
	}
	/**
	* Buscar apenas serviços ativos (para formulários de agendamento)
	*/
	static async findActive() {
		return (await this.findMany({
			active: true,
			limit: 100,
			page: 1
		})).services;
	}
	/**
	* Verificar se serviço existe e está ativo
	*/
	static async isActive(id) {
		return !!await db.service.findUnique({
			where: {
				id,
				active: true
			},
			select: { id: true }
		});
	}
	/**
	* Calcular estatísticas do serviço
	*/
	static async getServiceStats(serviceId) {
		const [totalAppointments, completedAppointments, cancelledAppointments, averageRating, recentAppointments] = await Promise.all([
			db.appointment.count({ where: { serviceId } }),
			db.appointment.count({ where: {
				serviceId,
				status: "COMPLETED"
			} }),
			db.appointment.count({ where: {
				serviceId,
				status: "CANCELLED"
			} }),
			db.serviceHistory.aggregate({
				where: { serviceId },
				_avg: { rating: true }
			}),
			db.appointment.findMany({
				where: { serviceId },
				include: {
					user: { select: {
						id: true,
						name: true,
						image: true
					} },
					barber: { select: {
						id: true,
						name: true,
						image: true
					} }
				},
				orderBy: { createdAt: "desc" },
				take: 5
			})
		]);
		const completionRate = totalAppointments > 0 ? completedAppointments / totalAppointments * 100 : 0;
		const cancellationRate = totalAppointments > 0 ? cancelledAppointments / totalAppointments * 100 : 0;
		return {
			totalAppointments,
			completedAppointments,
			cancelledAppointments,
			completionRate: Math.round(completionRate * 100) / 100,
			cancellationRate: Math.round(cancellationRate * 100) / 100,
			averageRating: averageRating._avg.rating ? Math.round(averageRating._avg.rating * 100) / 100 : null,
			recentAppointments
		};
	}
	/**
	* Buscar serviços mais populares
	*/
	static async findPopular(limit = 5) {
		return await db.service.findMany({
			where: { active: true },
			include: { _count: { select: { appointments: { where: {
				status: "COMPLETED",
				date: { gte: /* @__PURE__ */ new Date(Date.now() - 720 * 60 * 60 * 1e3) }
			} } } } },
			orderBy: { appointments: { _count: "desc" } },
			take: limit
		});
	}
	/**
	* Verificar disponibilidade do serviço para uma data
	*/
	static async checkAvailabilityForDate(serviceId, date) {
		return (await db.user.findMany({
			where: {
				role: "BARBER",
				isActive: true
			},
			include: { servicesProvided: {
				where: {
					serviceId,
					date: {
						gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
						lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
					},
					status: { in: ["SCHEDULED", "CONFIRMED"] }
				},
				include: { service: { select: { duration: true } } }
			} }
		})).map((barber) => {
			const appointments = barber.servicesProvided;
			const workStart = new Date(date);
			workStart.setHours(8, 0, 0, 0);
			const workEnd = new Date(date);
			workEnd.setHours(18, 0, 0, 0);
			const slots = [];
			let currentTime = new Date(workStart);
			while (currentTime < workEnd) {
				if (!appointments.some((appointment) => {
					const appointmentEnd = new Date(appointment.date.getTime() + appointment.service.duration * 6e4);
					return currentTime >= appointment.date && currentTime < appointmentEnd;
				})) slots.push(new Date(currentTime));
				currentTime.setMinutes(currentTime.getMinutes() + 30);
			}
			return {
				barberId: barber.id,
				barberName: barber.name,
				availableSlots: slots
			};
		});
	}
	/**
	* Buscar serviços com promoções ativas
	*/
	static async findWithActivePromotions() {
		const now = /* @__PURE__ */ new Date();
		return await db.service.findMany({
			where: {
				active: true,
				promotionServices: { some: { promotion: {
					active: true,
					validFrom: { lte: now },
					OR: [{ validUntil: null }, { validUntil: { gte: now } }]
				} } }
			},
			include: { promotionServices: {
				where: { promotion: {
					active: true,
					validFrom: { lte: now },
					OR: [{ validUntil: null }, { validUntil: { gte: now } }]
				} },
				include: { promotion: true }
			} }
		});
	}
};
//#endregion
//#region node_modules/.nitro/vite/services/rsc/assets/serializers-Cj6TKp0M.js
/**
* Utilitário para converter objetos Decimal do Prisma para números
* para resolver problemas de serialização em componentes client
*/
/**
* Converte Decimal para número de forma segura
*/
function decimalToNumber(decimal) {
	if (typeof decimal === "number") return decimal;
	return Number(decimal.toString());
}
/**
* Serializa um serviço convertendo price para número
*/
function serializeService(service) {
	return {
		...service,
		price: decimalToNumber(service.price)
	};
}
/**
* Serializa um agendamento convertendo preços para números
*/
function serializeAppointment(appointment) {
	return {
		...appointment,
		service: appointment.service ? serializeService(appointment.service) : null,
		voucher: appointment.voucher ? {
			...appointment.voucher,
			value: decimalToNumber(appointment.voucher.value)
		} : null,
		appliedPromotion: appointment.appliedPromotion ? {
			...appointment.appliedPromotion,
			value: decimalToNumber(appointment.appliedPromotion.value)
		} : null
	};
}
/**
* Serializa uma lista de serviços
*/
function serializeServices(services) {
	return services.map(serializeService);
}
/**
* Serializa uma lista de agendamentos
*/
function serializeAppointments(appointments) {
	return appointments.map(serializeAppointment);
}
/**
* Serializa resultado paginado de serviços
*/
function serializeServicesResult(result) {
	return {
		...result,
		services: serializeServices(result.services)
	};
}
/**
* Serializa resultado paginado de agendamentos
*/
function serializeAppointmentsResult(result) {
	return {
		...result,
		appointments: serializeAppointments(result.appointments)
	};
}
/**
* Serializa um histórico de serviço/review convertendo preços para números
*/
function serializeServiceHistory(serviceHistory) {
	return {
		...serviceHistory,
		finalPrice: decimalToNumber(serviceHistory.finalPrice),
		service: serviceHistory.service ? serializeService(serviceHistory.service) : null
	};
}
/**
* Serializa uma lista de históricos de serviço/reviews
*/
function serializeServiceHistories(serviceHistories) {
	return serviceHistories.map(serializeServiceHistory);
}
/**
* Serializa resultado paginado de reviews
*/
function serializeReviewsResult(result) {
	return {
		...result,
		reviews: serializeServiceHistories(result.reviews)
	};
}
//#endregion
export { serializeService as a, serializeServicesResult as c, serializeReviewsResult as i, ServiceService as l, serializeAppointment as n, serializeServiceHistory as o, serializeAppointmentsResult as r, serializeServices as s, decimalToNumber as t };
