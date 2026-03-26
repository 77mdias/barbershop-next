import { d as registerServerReference, o as __toESM } from "./encryption-runtime-LT6HXFPw.mjs";
import { n as authOptions, y as require_next_auth } from "./auth-D37wSDgg.mjs";
import { t as db } from "./prisma-uKWGIJ7B.mjs";
import { i as revalidatePath } from "./cache-Ne6hcaFU.mjs";
import { a as boolean, c as number, f as string, i as array, l as object, n as _enum, o as date } from "../_libs/zod.mjs";
import { i as serializeReviewsResult, o as serializeServiceHistory } from "./serializers-Cj6TKp0M.mjs";
import { F as emitRealtimeEvent } from "./rsc.mjs";
import { UserRole } from "@prisma/client";
//#region node_modules/.nitro/vite/services/rsc/assets/reviewActions-CUOWTsRH.js
var import_next_auth = /* @__PURE__ */ __toESM(require_next_auth());
var createReviewSchema = object({
	serviceHistoryId: string().min(1, "ID do histórico de serviço é obrigatório"),
	rating: number().min(1, "Avaliação deve ser no mínimo 1 estrela").max(5, "Avaliação deve ser no máximo 5 estrelas").int("Avaliação deve ser um número inteiro"),
	feedback: string().optional().transform((val) => {
		if (!val || val.trim() === "") return void 0;
		if (val.length < 10) throw new Error("Comentário deve ter pelo menos 10 caracteres");
		if (val.length > 1e3) throw new Error("Comentário deve ter no máximo 1000 caracteres");
		return val;
	}),
	images: array(string()).max(5, "Máximo 5 imagens por avaliação").optional().default([]).transform((images) => {
		return (images?.filter((img) => img && img.trim() !== "") || []).filter((img) => {
			if (img.startsWith("/")) return true;
			try {
				new URL(img);
				return true;
			} catch {
				return false;
			}
		});
	})
});
var updateReviewSchema = object({
	id: string().min(1, "ID da avaliação é obrigatório"),
	rating: number().min(1, "Avaliação deve ser no mínimo 1 estrela").max(5, "Avaliação deve ser no máximo 5 estrelas").int("Avaliação deve ser um número inteiro").optional(),
	feedback: string().optional().transform((val) => {
		if (!val || val.trim() === "") return void 0;
		if (val.length < 10) throw new Error("Comentário deve ter pelo menos 10 caracteres");
		if (val.length > 1e3) throw new Error("Comentário deve ter no máximo 1000 caracteres");
		return val;
	}),
	images: array(string()).max(5, "Máximo 5 imagens por avaliação").optional().transform((images) => {
		return (images?.filter((img) => img && img.trim() !== "") || []).filter((img) => {
			try {
				new URL(img);
				return true;
			} catch {
				return false;
			}
		});
	})
});
var getReviewsSchema = object({
	userId: string().optional(),
	serviceId: string().optional(),
	barberId: string().optional(),
	rating: number().min(1).max(5).optional(),
	page: number().min(1).default(1),
	limit: number().min(1).max(50).default(10),
	sortBy: _enum([
		"createdAt",
		"rating",
		"completedAt"
	]).default("createdAt"),
	sortOrder: _enum(["asc", "desc"]).default("desc"),
	showAllReviews: boolean().optional().default(false)
});
var deleteReviewSchema = object({ id: string().min(1, "ID da avaliação é obrigatório") });
object({
	rating: number().min(1, "Selecione uma avaliação").max(5),
	feedback: string().default(""),
	images: array(string()).default([]).transform((images) => {
		return images?.filter((img) => img && img.trim() !== "") || [];
	})
});
object({
	id: string(),
	rating: number(),
	feedback: string().nullable(),
	images: array(string()),
	completedAt: date(),
	createdAt: date(),
	updatedAt: date(),
	user: object({
		id: string(),
		name: string(),
		image: string().nullable()
	}),
	service: object({
		id: string(),
		name: string(),
		description: string().nullable(),
		price: number()
	}),
	serviceHistory: object({
		id: string(),
		finalPrice: number(),
		completedAt: date()
	})
});
/**
* Criar uma nova avaliação
*/
async function createReview(input) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		console.log("🔍 Dados recebidos no createReview:", JSON.stringify(input, null, 2));
		try {
			const validatedInput = createReviewSchema.parse(input);
			console.log("✅ Dados validados:", JSON.stringify(validatedInput, null, 2));
		} catch (validationError) {
			console.error("❌ Erro de validação:", validationError);
			return {
				success: false,
				error: `Erro de validação: ${validationError.message}`
			};
		}
		const validatedInput = createReviewSchema.parse(input);
		const serviceHistory = await db.serviceHistory.findFirst({
			where: {
				id: validatedInput.serviceHistoryId,
				userId: session.user.id
			},
			include: {
				appointments: true,
				service: true
			}
		});
		if (!serviceHistory) return {
			success: false,
			error: "Histórico de serviço não encontrado ou não autorizado"
		};
		if (serviceHistory.rating !== null) return {
			success: false,
			error: "Este serviço já foi avaliado"
		};
		const updateData = {
			rating: validatedInput.rating,
			feedback: validatedInput.feedback || null,
			updatedAt: /* @__PURE__ */ new Date()
		};
		if (validatedInput.images && validatedInput.images.length > 0) {
			console.log("💾 Saving images to database:", validatedInput.images);
			updateData.images = { set: validatedInput.images };
		} else console.log("📝 No images to save");
		const updatedServiceHistory = await db.serviceHistory.update({
			where: { id: validatedInput.serviceHistoryId },
			data: updateData,
			include: {
				user: { select: {
					id: true,
					name: true,
					image: true
				} },
				service: { select: {
					id: true,
					name: true,
					description: true,
					price: true
				} }
			}
		});
		revalidatePath("/dashboard");
		revalidatePath("/reviews");
		revalidatePath(`/services/${serviceHistory.service.id}`);
		const barberId = serviceHistory.appointments[0]?.barberId ?? null;
		try {
			emitRealtimeEvent({
				type: "review:updated",
				payload: {
					reviewId: updatedServiceHistory.id,
					rating: updatedServiceHistory.rating,
					barberId,
					userId: session.user.id,
					serviceHistoryId: updatedServiceHistory.id
				},
				target: {
					users: [session.user.id, barberId].filter(Boolean),
					roles: ["ADMIN"]
				}
			});
			emitRealtimeEvent({
				type: "analytics:updated",
				payload: {
					scope: "reviews",
					reason: "created"
				},
				target: { roles: ["ADMIN"] }
			});
		} catch (error) {
			console.error("Erro ao emitir evento de review:", error);
		}
		return {
			success: true,
			data: serializeServiceHistory(updatedServiceHistory),
			message: "Avaliação criada com sucesso!"
		};
	} catch (error) {
		console.error("Erro ao criar avaliação:", error);
		if (error instanceof Error) return {
			success: false,
			error: error.message
		};
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Atualizar uma avaliação existente
*/
async function updateReview(input) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const validatedInput = updateReviewSchema.parse(input);
		console.log("📝 Updating review:", {
			id: validatedInput.id,
			rating: validatedInput.rating,
			feedback: validatedInput.feedback,
			images: validatedInput.images,
			imagesCount: validatedInput.images?.length || 0
		});
		const serviceHistory = await db.serviceHistory.findFirst({
			where: {
				id: validatedInput.id,
				userId: session.user.id,
				rating: { not: null }
			},
			include: { appointments: true }
		});
		if (!serviceHistory) return {
			success: false,
			error: "Avaliação não encontrada ou não autorizada"
		};
		const updateData = { updatedAt: /* @__PURE__ */ new Date() };
		if (validatedInput.rating !== void 0) updateData.rating = validatedInput.rating;
		if (validatedInput.feedback !== void 0) updateData.feedback = validatedInput.feedback || null;
		if (validatedInput.images !== void 0) updateData.images = { set: validatedInput.images };
		const updatedServiceHistory = await db.serviceHistory.update({
			where: { id: validatedInput.id },
			data: updateData,
			include: {
				user: { select: {
					id: true,
					name: true,
					image: true
				} },
				service: { select: {
					id: true,
					name: true,
					description: true,
					price: true
				} }
			}
		});
		revalidatePath("/dashboard");
		revalidatePath("/reviews");
		revalidatePath(`/services/${updatedServiceHistory.service.id}`);
		const barberId = serviceHistory?.appointments?.[0]?.barberId ?? null;
		try {
			emitRealtimeEvent({
				type: "review:updated",
				payload: {
					reviewId: updatedServiceHistory.id,
					rating: updatedServiceHistory.rating,
					barberId,
					userId: session.user.id,
					serviceHistoryId: updatedServiceHistory.id
				},
				target: {
					users: [session.user.id, barberId].filter(Boolean),
					roles: ["ADMIN"]
				}
			});
			emitRealtimeEvent({
				type: "analytics:updated",
				payload: {
					scope: "reviews",
					reason: "updated"
				},
				target: { roles: ["ADMIN"] }
			});
		} catch (error) {
			console.error("Erro ao emitir evento de atualização de review:", error);
		}
		return {
			success: true,
			data: serializeServiceHistory(updatedServiceHistory),
			message: "Avaliação atualizada com sucesso!"
		};
	} catch (error) {
		console.error("Erro ao atualizar avaliação:", error);
		if (error instanceof Error) return {
			success: false,
			error: error.message
		};
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Buscar avaliações públicas (sem autenticação) para exibição na homepage
*/
async function getPublicReviews(limit = 6) {
	try {
		return {
			success: true,
			data: (await db.serviceHistory.findMany({
				where: {
					rating: { not: null },
					feedback: { not: null }
				},
				orderBy: [{ rating: "desc" }, { updatedAt: "desc" }],
				take: limit,
				include: {
					user: { select: {
						id: true,
						name: true,
						image: true
					} },
					service: { select: {
						id: true,
						name: true,
						description: true,
						price: true
					} }
				}
			})).map((review) => ({
				id: review.id,
				name: review.user.name || "Cliente",
				service: review.service.name,
				rating: review.rating,
				comment: review.feedback,
				image: review.user.image || void 0,
				images: review.images || [],
				date: review.updatedAt
			}))
		};
	} catch (error) {
		console.error("Erro ao buscar avaliações públicas:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Buscar avaliações com filtros e paginação
*/
async function getReviews(input = {}) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const validatedInput = getReviewsSchema.parse(input);
		const whereConditions = { rating: { not: null } };
		if (!validatedInput.showAllReviews) {
			if (session.user.role === UserRole.CLIENT) whereConditions.userId = session.user.id;
			else if (session.user.role === UserRole.BARBER) whereConditions.appointments = { some: { barberId: session.user.id } };
		}
		if (validatedInput.userId) whereConditions.userId = validatedInput.userId;
		if (validatedInput.serviceId) whereConditions.serviceId = validatedInput.serviceId;
		if (validatedInput.barberId) whereConditions.appointments = { some: { barberId: validatedInput.barberId } };
		if (validatedInput.rating) whereConditions.rating = validatedInput.rating;
		const offset = (validatedInput.page - 1) * validatedInput.limit;
		const [reviews, totalCount] = await Promise.all([db.serviceHistory.findMany({
			where: whereConditions,
			include: {
				user: { select: {
					id: true,
					name: true,
					image: true
				} },
				service: { select: {
					id: true,
					name: true,
					description: true,
					price: true
				} },
				appointments: {
					select: { barber: { select: {
						id: true,
						name: true,
						image: true
					} } },
					take: 1
				}
			},
			orderBy: { [validatedInput.sortBy]: validatedInput.sortOrder },
			skip: offset,
			take: validatedInput.limit
		}), db.serviceHistory.count({ where: whereConditions })]);
		const totalPages = Math.ceil(totalCount / validatedInput.limit);
		const hasNextPage = validatedInput.page < totalPages;
		const hasPreviousPage = validatedInput.page > 1;
		return {
			success: true,
			data: serializeReviewsResult({
				reviews,
				pagination: {
					currentPage: validatedInput.page,
					totalPages,
					totalCount,
					hasNextPage,
					hasPreviousPage,
					limit: validatedInput.limit
				}
			})
		};
	} catch (error) {
		console.error("Erro ao buscar avaliações:", error);
		if (error instanceof Error) return {
			success: false,
			error: error.message
		};
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Deletar uma avaliação
*/
async function deleteReview(input) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const validatedInput = deleteReviewSchema.parse(input);
		const serviceHistory = await db.serviceHistory.findFirst({
			where: {
				id: validatedInput.id,
				...session.user.role !== UserRole.ADMIN && { userId: session.user.id },
				rating: { not: null }
			},
			include: { service: true }
		});
		if (!serviceHistory) return {
			success: false,
			error: "Avaliação não encontrada ou não autorizada"
		};
		await db.serviceHistory.update({
			where: { id: validatedInput.id },
			data: {
				rating: null,
				feedback: null,
				images: { set: [] },
				updatedAt: /* @__PURE__ */ new Date()
			}
		});
		revalidatePath("/dashboard");
		revalidatePath("/reviews");
		revalidatePath(`/services/${serviceHistory.service.id}`);
		return {
			success: true,
			message: "Avaliação removida com sucesso!"
		};
	} catch (error) {
		console.error("Erro ao deletar avaliação:", error);
		if (error instanceof Error) return {
			success: false,
			error: error.message
		};
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Obter estatísticas de avaliações
*/
async function getReviewStats(serviceId, barberId) {
	try {
		if (!(await (0, import_next_auth.getServerSession)(authOptions))?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const whereConditions = { rating: { not: null } };
		if (serviceId) whereConditions.serviceId = serviceId;
		if (barberId) whereConditions.appointments = { some: { barberId } };
		const stats = await db.serviceHistory.aggregate({
			where: whereConditions,
			_avg: { rating: true },
			_count: { rating: true }
		});
		const ratingDistribution = await db.serviceHistory.groupBy({
			by: ["rating"],
			where: whereConditions,
			_count: { rating: true },
			orderBy: { rating: "desc" }
		});
		return {
			success: true,
			data: {
				averageRating: Number(stats._avg.rating?.toFixed(1)) || 0,
				totalReviews: stats._count.rating || 0,
				ratingDistribution: ratingDistribution.map((item) => ({
					rating: item.rating,
					count: item._count.rating
				}))
			}
		};
	} catch (error) {
		console.error("Erro ao buscar estatísticas de avaliações:", error);
		if (error instanceof Error) return {
			success: false,
			error: error.message
		};
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
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
		if (session.user.role !== UserRole.ADMIN && session.user.id !== barberId) return {
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
		return {
			success: true,
			data: {
				averageRating: Number(reviewsMetrics._avg.rating?.toFixed(1)) || 0,
				totalReviews: reviewsMetrics._count.rating || 0,
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
					percentage: reviewsMetrics._count.rating > 0 ? Math.round(item._count.rating / reviewsMetrics._count.rating * 100) : 0
				})),
				goals: {
					averageRating: {
						target: 4.5,
						current: Number(monthlyReviews._avg.rating?.toFixed(1)) || 0
					},
					monthlyReviews: {
						target: 20,
						current: monthlyReviews._count.rating || 0
					},
					monthlyClients: {
						target: 100,
						current: monthlyClients.length || 0
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
		if (session.user.role !== UserRole.ADMIN && session.user.id !== userId) return {
			success: false,
			error: "Não autorizado"
		};
		const userRole = session.user.role;
		const startOfMonth = new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1);
		if (userRole === UserRole.CLIENT) {
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
		} else if (userRole === UserRole.BARBER) return await getBarberMetrics(userId);
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
createReview = /* @__PURE__ */ registerServerReference(createReview, "f71271ac11de", "createReview");
updateReview = /* @__PURE__ */ registerServerReference(updateReview, "f71271ac11de", "updateReview");
getPublicReviews = /* @__PURE__ */ registerServerReference(getPublicReviews, "f71271ac11de", "getPublicReviews");
getReviews = /* @__PURE__ */ registerServerReference(getReviews, "f71271ac11de", "getReviews");
deleteReview = /* @__PURE__ */ registerServerReference(deleteReview, "f71271ac11de", "deleteReview");
getReviewStats = /* @__PURE__ */ registerServerReference(getReviewStats, "f71271ac11de", "getReviewStats");
getBarberMetrics = /* @__PURE__ */ registerServerReference(getBarberMetrics, "f71271ac11de", "getBarberMetrics");
getDashboardMetrics = /* @__PURE__ */ registerServerReference(getDashboardMetrics, "f71271ac11de", "getDashboardMetrics");
//#endregion
export { createReview, deleteReview, getBarberMetrics, getDashboardMetrics, getPublicReviews, getReviewStats, getReviews, updateReview };
