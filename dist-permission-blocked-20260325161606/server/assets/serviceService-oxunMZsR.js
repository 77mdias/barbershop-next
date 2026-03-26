import { t as db } from "./prisma-CFYhdy0e.js";
//#region src/server/services/serviceService.ts
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
export { ServiceService as t };
