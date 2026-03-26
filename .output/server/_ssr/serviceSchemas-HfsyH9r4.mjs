import { r as __exportAll } from "./encryption-runtime-LT6HXFPw.mjs";
import { a as boolean, c as number, f as string, i as array, l as object, o as date, s as literal } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/rsc/assets/serviceSchemas-HfsyH9r4.js
var serviceSchemas_exports = /* @__PURE__ */ __exportAll({
	CreateServiceSchema: () => CreateServiceSchema,
	ServiceFiltersSchema: () => ServiceFiltersSchema,
	UpdateServiceSchema: () => UpdateServiceSchema,
	WorkingHoursSchema: () => WorkingHoursSchema
});
var ServiceFiltersSchema = object({
	active: boolean().optional(),
	search: string().optional(),
	minPrice: number().positive().optional(),
	maxPrice: number().positive().optional(),
	maxDuration: number().positive().optional(),
	page: number().int().positive().default(1),
	limit: number().int().positive().max(50).default(10)
});
object({
	id: string(),
	name: string(),
	description: string().nullable(),
	duration: number().int().positive(),
	price: number().positive(),
	active: boolean(),
	createdAt: date(),
	updatedAt: date()
});
var CreateServiceSchema = object({
	name: string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome deve ter no máximo 100 caracteres"),
	description: string().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
	duration: number().int().positive("Duração deve ser um número positivo").min(15, "Duração mínima é 15 minutos").max(480, "Duração máxima é 8 horas"),
	price: number().positive("Preço deve ser positivo").min(.01, "Preço mínimo é R$ 0,01").max(9999.99, "Preço máximo é R$ 9.999,99"),
	active: boolean().default(true)
});
var UpdateServiceSchema = CreateServiceSchema.partial();
var WorkingHoursSchema = object({
	dayOfWeek: number().int().min(0).max(6),
	startTime: string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:MM)"),
	endTime: string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:MM)"),
	isActive: boolean().default(true)
});
object({
	id: string(),
	name: string(),
	email: string().email(),
	phone: string().nullable(),
	image: string().nullable(),
	role: literal("BARBER"),
	isActive: boolean(),
	workingHours: array(WorkingHoursSchema).optional()
});
object({
	barberId: string().optional(),
	serviceId: string(),
	date: date()
});
//#endregion
export { serviceSchemas_exports as i, ServiceFiltersSchema as n, UpdateServiceSchema as r, CreateServiceSchema as t };
