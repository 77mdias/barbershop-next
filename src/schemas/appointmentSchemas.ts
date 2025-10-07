import { z } from "zod";

// Enum de status de agendamento conforme schema.prisma
export const AppointmentStatusEnum = z.enum([
  "SCHEDULED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
]);

// Schema para criar um novo agendamento
export const CreateAppointmentSchema = z.object({
  date: z.date().min(new Date(), "Data deve ser no futuro"),
  serviceId: z.string().min(1, "Serviço é obrigatório"),
  barberId: z.string().min(1, "Barbeiro é obrigatório"),
  notes: z
    .string()
    .max(500, "Observações devem ter no máximo 500 caracteres")
    .optional(),
  voucherId: z.string().optional(),
  appliedPromotionId: z.string().optional(),
});

// Schema para atualizar agendamento
export const UpdateAppointmentSchema = z.object({
  date: z.date().min(new Date(), "Data deve ser no futuro").optional(),
  status: AppointmentStatusEnum.optional(),
  notes: z
    .string()
    .max(500, "Observações devem ter no máximo 500 caracteres")
    .optional(),
  barberId: z.string().min(1, "Barbeiro é obrigatório").optional(),
});

// Schema para filtros de busca
export const AppointmentFiltersSchema = z.object({
  status: AppointmentStatusEnum.optional(),
  serviceId: z.string().optional(),
  barberId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(10),
});

// Schema para verificar disponibilidade
export const CheckAvailabilitySchema = z.object({
  date: z.date(),
  serviceId: z.string(),
  barberId: z.string().optional(),
});

// Schema para reagendar
export const RescheduleAppointmentSchema = z.object({
  appointmentId: z.string(),
  newDate: z.date().min(new Date(), "Nova data deve ser no futuro"),
  newBarberId: z.string().optional(),
});

// Schema para cancelar agendamento
export const CancelAppointmentSchema = z.object({
  appointmentId: z.string(),
  reason: z
    .string()
    .min(10, "Motivo deve ter pelo menos 10 caracteres")
    .max(200, "Motivo deve ter no máximo 200 caracteres")
    .optional(),
});

// Schema para horários disponíveis
export const AvailableTimesSchema = z.object({
  date: z.date(),
  serviceId: z.string(),
  barberId: z.string().optional(),
});

// Types para usar em componentes
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof UpdateAppointmentSchema>;
export type AppointmentFiltersInput = z.infer<typeof AppointmentFiltersSchema>;
export type CheckAvailabilityInput = z.infer<typeof CheckAvailabilitySchema>;
export type RescheduleAppointmentInput = z.infer<
  typeof RescheduleAppointmentSchema
>;
export type CancelAppointmentInput = z.infer<typeof CancelAppointmentSchema>;
export type AvailableTimesInput = z.infer<typeof AvailableTimesSchema>;
export type AppointmentStatus = z.infer<typeof AppointmentStatusEnum>;
