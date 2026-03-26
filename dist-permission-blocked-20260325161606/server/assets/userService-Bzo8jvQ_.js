import { t as logger } from "./logger-LhUDQoFP.js";
import { t as db } from "./prisma-CFYhdy0e.js";
//#region src/server/services/userService.ts
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
export { UserService as t };
