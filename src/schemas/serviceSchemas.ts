import { z } from "zod";

// Schema para buscar serviços
export const ServiceFiltersSchema = z.object({
  active: z.boolean().optional(),
  search: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  maxDuration: z.number().positive().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(10),
});

// Schema para serviço individual
export const ServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  duration: z.number().int().positive(),
  price: z.number().positive(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema para criar serviço (admin)
export const CreateServiceSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional(),
  duration: z
    .number()
    .int()
    .positive("Duração deve ser um número positivo")
    .min(15, "Duração mínima é 15 minutos")
    .max(480, "Duração máxima é 8 horas"),
  price: z
    .number()
    .positive("Preço deve ser positivo")
    .min(0.01, "Preço mínimo é R$ 0,01")
    .max(9999.99, "Preço máximo é R$ 9.999,99"),
  active: z.boolean().default(true),
});

// Schema para atualizar serviço
export const UpdateServiceSchema = CreateServiceSchema.partial();

// Schema para horário de funcionamento
export const WorkingHoursSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6), // 0 = domingo, 6 = sábado
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:MM)"),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:MM)"),
  isActive: z.boolean().default(true),
});

// Schema para barbeiro com horários
export const BarberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  image: z.string().nullable(),
  role: z.literal("BARBER"),
  isActive: z.boolean(),
  workingHours: z.array(WorkingHoursSchema).optional(),
});

// Schema para selecionar barbeiro
export const BarberSelectionSchema = z.object({
  barberId: z.string().optional(), // opcional para "qualquer barbeiro"
  serviceId: z.string(),
  date: z.date(),
});

// Types para componentes
export type ServiceFiltersInput = z.infer<typeof ServiceFiltersSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type CreateServiceInput = z.infer<typeof CreateServiceSchema>;
export type UpdateServiceInput = z.infer<typeof UpdateServiceSchema>;
export type WorkingHours = z.infer<typeof WorkingHoursSchema>;
export type Barber = z.infer<typeof BarberSchema>;
export type BarberSelectionInput = z.infer<typeof BarberSelectionSchema>;
