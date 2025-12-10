import { z } from "zod";

const promotionTypeEnum = z.enum([
  "DISCOUNT_PERCENTAGE",
  "DISCOUNT_FIXED",
  "FREE_SERVICE",
  "CASHBACK",
  "LOYALTY_BONUS",
]);

const basePromotionSchema = {
  name: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(120, "Nome deve ter no máximo 120 caracteres"),
  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional(),
  type: promotionTypeEnum,
  value: z
    .number()
    .positive("Valor deve ser maior que zero"),
  validFrom: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      return typeof val === "string" ? new Date(val) : val;
    },
    z.date(),
  ),
  validUntil: z
    .preprocess(
      (val) => {
        if (val === "" || val === null || val === undefined) return undefined;
        return typeof val === "string" ? new Date(val) : val;
      },
      z.date().optional(),
    ),
  isGlobal: z.boolean().default(false),
  minFrequency: z
    .preprocess((val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      if (typeof val === "number" && Number.isNaN(val)) return undefined;
      return val;
    }, z.number()
      .int("Frequência mínima deve ser um número inteiro")
      .positive("Frequência mínima deve ser positiva")
      .optional()),
  active: z.boolean().default(true),
  serviceIds: z.array(z.string()).optional(),
  userIds: z.array(z.string()).optional(),
};

export const CreatePromotionSchema = z.object(basePromotionSchema).superRefine((val, ctx) => {
  if (val.type === "DISCOUNT_PERCENTAGE" && !(val.value > 0 && val.value <= 100)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Para porcentagem, o valor deve estar entre 0 e 100",
      path: ["value"],
    });
  }

  if (val.validUntil && val.validUntil < val.validFrom) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Data de término deve ser posterior à data de início",
      path: ["validUntil"],
    });
  }

  if (!val.isGlobal) {
    const hasTargets = (val.serviceIds?.length ?? 0) > 0 || (val.userIds?.length ?? 0) > 0;
    if (!hasTargets) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Promoções não globais devem ser vinculadas a serviços ou usuários",
        path: ["serviceIds"],
      });
    }
  }
});

export const UpdatePromotionSchema = CreatePromotionSchema.partial();

export const PromotionFiltersSchema = z.object({
  active: z.boolean().optional(),
  type: promotionTypeEnum.optional(),
  search: z.string().optional(),
  isGlobal: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(20),
});

export type PromotionType = z.infer<typeof promotionTypeEnum>;
export type CreatePromotionInput = z.infer<typeof CreatePromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof UpdatePromotionSchema>;
export type PromotionFiltersInput = z.infer<typeof PromotionFiltersSchema>;