import { Prisma } from "@prisma/client";

/**
 * Utilitário para converter objetos Decimal do Prisma para números
 * para resolver problemas de serialização em componentes client
 */

/**
 * Converte Decimal para número de forma segura
 */
export function decimalToNumber(decimal: Prisma.Decimal | number): number {
  if (typeof decimal === "number") {
    return decimal;
  }
  return Number(decimal.toString());
}

/**
 * Serializa um serviço convertendo price para número
 */
export function serializeService(service: any) {
  return {
    ...service,
    price: decimalToNumber(service.price),
  };
}

/**
 * Serializa um agendamento convertendo preços para números
 */
export function serializeAppointment(appointment: any) {
  return {
    ...appointment,
    service: appointment.service ? serializeService(appointment.service) : null,
    voucher: appointment.voucher
      ? {
          ...appointment.voucher,
          value: decimalToNumber(appointment.voucher.value),
        }
      : null,
    appliedPromotion: appointment.appliedPromotion
      ? {
          ...appointment.appliedPromotion,
          value: decimalToNumber(appointment.appliedPromotion.value),
        }
      : null,
  };
}

/**
 * Serializa uma lista de serviços
 */
export function serializeServices(services: any[]) {
  return services.map(serializeService);
}

/**
 * Serializa uma lista de agendamentos
 */
export function serializeAppointments(appointments: any[]) {
  return appointments.map(serializeAppointment);
}

/**
 * Serializa resultado paginado de serviços
 */
export function serializeServicesResult(result: {
  services: any[];
  pagination: any;
}) {
  return {
    ...result,
    services: serializeServices(result.services),
  };
}

/**
 * Serializa resultado paginado de agendamentos
 */
export function serializeAppointmentsResult(result: {
  appointments: any[];
  pagination: any;
}) {
  return {
    ...result,
    appointments: serializeAppointments(result.appointments),
  };
}

/**
 * Serializa um histórico de serviço/review convertendo preços para números
 */
export function serializeServiceHistory(serviceHistory: any) {
  return {
    ...serviceHistory,
    finalPrice: decimalToNumber(serviceHistory.finalPrice),
    service: serviceHistory.service
      ? serializeService(serviceHistory.service)
      : null,
  };
}

/**
 * Serializa uma lista de históricos de serviço/reviews
 */
export function serializeServiceHistories(serviceHistories: any[]) {
  return serviceHistories.map(serializeServiceHistory);
}

/**
 * Serializa resultado paginado de reviews
 */
export function serializeReviewsResult(result: {
  reviews: any[];
  pagination: any;
}) {
  return {
    ...result,
    reviews: serializeServiceHistories(result.reviews),
  };
}
