import { o as __toESM } from "./chunk-D3zDcpJC.js";
import { i as registerServerReference } from "./encryption-runtime-CBVwOrRm.js";
import { n as require_next_auth, t as authOptions } from "./auth-Ps0x5MHh.js";
import { r as revalidatePath } from "./cache-GjtwqY6K.js";
import { t as db } from "./prisma-CFYhdy0e.js";
import { c as object, d as string, f as ZodError, i as boolean, o as literal } from "./schemas-nKToptUp.js";
//#region src/schemas/profileSchemas.ts
var import_next_auth = /* @__PURE__ */ __toESM(require_next_auth());
var ProfileSettingsSchema = object({
	name: string().min(2, "Nome deve ter pelo menos 2 caracteres").max(50, "Nome muito longo"),
	nickname: string().max(30, "Apelido muito longo").optional(),
	phone: string().regex(/^(\+55\s?)?(\(\d{2}\)\s?|\d{2}\s?)?\d{4,5}-?\d{4}$/, "Formato de telefone inválido").optional().or(literal("")),
	email: string().email("Email inválido").max(255, "Email muito longo")
});
object({ image: string().url("URL da imagem inválida") });
object({
	currentPassword: string().min(1, "Senha atual é obrigatória"),
	newPassword: string().min(6, "Nova senha deve ter pelo menos 6 caracteres").max(128, "Nova senha muito longa"),
	confirmPassword: string().min(1, "Confirmação de senha é obrigatória")
}).refine((data) => data.newPassword === data.confirmPassword, {
	message: "As senhas não coincidem",
	path: ["confirmPassword"]
});
object({
	emailNotifications: boolean().default(true),
	smsNotifications: boolean().default(false),
	appointmentReminders: boolean().default(true),
	promotionAlerts: boolean().default(true)
});
//#endregion
//#region src/server/profileActions.ts
var UpdateProfileSchema = ProfileSettingsSchema.extend({ id: string() });
/**
* Server Action para atualizar perfil do usuário
*/
async function updateProfile(data) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		if (session.user.id !== data.id && session.user.role !== "ADMIN") return {
			success: false,
			error: "Você não tem permissão para editar este perfil"
		};
		const validatedData = UpdateProfileSchema.parse(data);
		if (validatedData.email) {
			if (await db.user.findFirst({ where: {
				email: validatedData.email,
				deletedAt: null,
				NOT: { id: validatedData.id }
			} })) return {
				success: false,
				error: "Este email já está sendo usado por outro usuário"
			};
		}
		if (!await db.user.findFirst({
			where: {
				id: validatedData.id,
				deletedAt: null
			},
			select: { id: true }
		})) return {
			success: false,
			error: "Usuário não encontrado ou removido"
		};
		const updatedUser = await db.user.update({
			where: { id: validatedData.id },
			data: {
				name: validatedData.name,
				nickname: validatedData.nickname || null,
				phone: validatedData.phone || null,
				email: validatedData.email,
				updatedAt: /* @__PURE__ */ new Date()
			},
			select: {
				id: true,
				name: true,
				nickname: true,
				email: true,
				phone: true,
				image: true,
				role: true,
				updatedAt: true
			}
		});
		revalidatePath("/profile");
		revalidatePath("/profile/settings");
		return {
			success: true,
			data: updatedUser,
			message: "Perfil atualizado com sucesso"
		};
	} catch (error) {
		console.error("Erro ao atualizar perfil:", error);
		if (error instanceof ZodError) return {
			success: false,
			error: error.issues[0]?.message || "Dados inválidos"
		};
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Server Action para obter dados do perfil do usuário atual
*/
async function getCurrentProfile() {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const user = await db.user.findFirst({
			where: {
				id: session.user.id,
				deletedAt: null
			},
			select: {
				id: true,
				name: true,
				nickname: true,
				email: true,
				phone: true,
				image: true,
				role: true,
				isActive: true,
				deletedAt: true,
				createdAt: true,
				updatedAt: true,
				_count: { select: {
					appointments: true,
					vouchers: true,
					serviceHistory: true
				} }
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
		console.error("Erro ao buscar perfil:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Server Action para atualizar apenas a imagem de perfil
*/
async function updateProfileImage(imageUrl) {
	try {
		console.log("🖼️ updateProfileImage called with URL:", imageUrl);
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		console.log("📋 Session info:", {
			hasSession: !!session,
			userId: session?.user?.id,
			userEmail: session?.user?.email
		});
		if (!session?.user?.id) {
			console.log("❌ No authenticated user session");
			return {
				success: false,
				error: "Usuário não autenticado"
			};
		}
		if (!await db.user.findFirst({
			where: {
				id: session.user.id,
				deletedAt: null
			},
			select: { id: true }
		})) return {
			success: false,
			error: "Usuário removido ou não encontrado"
		};
		console.log("🔄 Updating user image in database...");
		const updatedUser = await db.user.update({
			where: { id: session.user.id },
			data: {
				image: imageUrl,
				updatedAt: /* @__PURE__ */ new Date()
			},
			select: {
				id: true,
				image: true
			}
		});
		console.log("✅ User image updated successfully:", updatedUser);
		revalidatePath("/profile");
		revalidatePath("/profile/settings");
		return {
			success: true,
			data: updatedUser,
			message: "Foto de perfil atualizada com sucesso"
		};
	} catch (error) {
		console.error("💥 Erro ao atualizar imagem de perfil:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
/**
* Server Action para alterar senha do usuário
*/
async function changePassword(data) {
	try {
		const session = await (0, import_next_auth.getServerSession)(authOptions);
		if (!session?.user?.id) return {
			success: false,
			error: "Usuário não autenticado"
		};
		const currentUser = await db.user.findFirst({
			where: {
				id: session.user.id,
				deletedAt: null
			},
			select: {
				id: true,
				password: true
			}
		});
		if (!currentUser) return {
			success: false,
			error: "Usuário não encontrado"
		};
		if (!currentUser.password) return {
			success: false,
			error: "Esta conta foi criada via login social e não possui senha. Entre em contato com o suporte."
		};
		const bcrypt = await import("./bcryptjs-ZbfoOrmW.js").then((n) => n.n);
		if (!await bcrypt.compare(data.currentPassword, currentUser.password)) return {
			success: false,
			error: "Senha atual incorreta"
		};
		if (await bcrypt.compare(data.newPassword, currentUser.password)) return {
			success: false,
			error: "A nova senha deve ser diferente da senha atual"
		};
		const hashedNewPassword = await bcrypt.hash(data.newPassword, 12);
		await db.user.update({
			where: { id: session.user.id },
			data: {
				password: hashedNewPassword,
				updatedAt: /* @__PURE__ */ new Date()
			}
		});
		return {
			success: true,
			message: "Senha alterada com sucesso"
		};
	} catch (error) {
		console.error("Erro ao alterar senha:", error);
		return {
			success: false,
			error: "Erro interno do servidor"
		};
	}
}
updateProfile = /* @__PURE__ */ registerServerReference(updateProfile, "951d574f9bf1", "updateProfile");
getCurrentProfile = /* @__PURE__ */ registerServerReference(getCurrentProfile, "951d574f9bf1", "getCurrentProfile");
updateProfileImage = /* @__PURE__ */ registerServerReference(updateProfileImage, "951d574f9bf1", "updateProfileImage");
changePassword = /* @__PURE__ */ registerServerReference(changePassword, "951d574f9bf1", "changePassword");
//#endregion
export { changePassword, getCurrentProfile, updateProfile, updateProfileImage };
