import { z } from "zod";

// Schema para criação de avaliação
export const createReviewSchema = z.object({
  serviceHistoryId: z
    .string()
    .min(1, "ID do histórico de serviço é obrigatório"),
  rating: z
    .number()
    .min(1, "Avaliação deve ser no mínimo 1 estrela")
    .max(5, "Avaliação deve ser no máximo 5 estrelas")
    .int("Avaliação deve ser um número inteiro"),
  feedback: z
    .string()
    .min(10, "Comentário deve ter pelo menos 10 caracteres")
    .max(1000, "Comentário deve ter no máximo 1000 caracteres")
    .optional()
    .or(z.literal("")),
  images: z
    .array(z.string().url("URL da imagem inválida"))
    .max(5, "Máximo 5 imagens por avaliação")
    .optional()
    .default([]),
});

// Schema para atualização de avaliação
export const updateReviewSchema = z.object({
  id: z.string().min(1, "ID da avaliação é obrigatório"),
  rating: z
    .number()
    .min(1, "Avaliação deve ser no mínimo 1 estrela")
    .max(5, "Avaliação deve ser no máximo 5 estrelas")
    .int("Avaliação deve ser um número inteiro")
    .optional(),
  feedback: z
    .string()
    .min(10, "Comentário deve ter pelo menos 10 caracteres")
    .max(1000, "Comentário deve ter no máximo 1000 caracteres")
    .optional()
    .or(z.literal("")),
  images: z
    .array(z.string().url("URL da imagem inválida"))
    .max(5, "Máximo 5 imagens por avaliação")
    .optional(),
});

// Schema para busca de avaliações
export const getReviewsSchema = z.object({
  userId: z.string().optional(),
  serviceId: z.string().optional(),
  barberId: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
  sortBy: z.enum(["createdAt", "rating", "completedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Schema para deletar avaliação
export const deleteReviewSchema = z.object({
  id: z.string().min(1, "ID da avaliação é obrigatório"),
});

// Tipos TypeScript derivados dos schemas
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type GetReviewsInput = z.infer<typeof getReviewsSchema>;
export type DeleteReviewInput = z.infer<typeof deleteReviewSchema>;

// Schema para validação de dados do formulário (frontend)
export const reviewFormSchema = z.object({
  rating: z.number().min(1, "Selecione uma avaliação").max(5),
  feedback: z.string().default(""),
  images: z.array(z.string()).default([]),
});

export type ReviewFormData = z.infer<typeof reviewFormSchema>;

// Schema para resposta de avaliação (incluindo dados relacionados)
export const reviewResponseSchema = z.object({
  id: z.string(),
  rating: z.number(),
  feedback: z.string().nullable(),
  images: z.array(z.string()),
  completedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    image: z.string().nullable(),
  }),
  service: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    price: z.number(),
  }),
  serviceHistory: z.object({
    id: z.string(),
    finalPrice: z.number(),
    completedAt: z.date(),
  }),
});

export type ReviewResponse = z.infer<typeof reviewResponseSchema>;
