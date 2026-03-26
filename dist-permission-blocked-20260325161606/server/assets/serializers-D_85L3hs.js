//#region src/lib/serializers.ts
/**
* Utilitário para converter objetos Decimal do Prisma para números
* para resolver problemas de serialização em componentes client
*/
/**
* Converte Decimal para número de forma segura
*/
function decimalToNumber(decimal) {
	if (typeof decimal === "number") return decimal;
	return Number(decimal.toString());
}
/**
* Serializa um serviço convertendo price para número
*/
function serializeService(service) {
	return {
		...service,
		price: decimalToNumber(service.price)
	};
}
/**
* Serializa um agendamento convertendo preços para números
*/
function serializeAppointment(appointment) {
	return {
		...appointment,
		service: appointment.service ? serializeService(appointment.service) : null,
		voucher: appointment.voucher ? {
			...appointment.voucher,
			value: decimalToNumber(appointment.voucher.value)
		} : null,
		appliedPromotion: appointment.appliedPromotion ? {
			...appointment.appliedPromotion,
			value: decimalToNumber(appointment.appliedPromotion.value)
		} : null
	};
}
/**
* Serializa uma lista de serviços
*/
function serializeServices(services) {
	return services.map(serializeService);
}
/**
* Serializa uma lista de agendamentos
*/
function serializeAppointments(appointments) {
	return appointments.map(serializeAppointment);
}
/**
* Serializa resultado paginado de serviços
*/
function serializeServicesResult(result) {
	return {
		...result,
		services: serializeServices(result.services)
	};
}
/**
* Serializa resultado paginado de agendamentos
*/
function serializeAppointmentsResult(result) {
	return {
		...result,
		appointments: serializeAppointments(result.appointments)
	};
}
/**
* Serializa um histórico de serviço/review convertendo preços para números
*/
function serializeServiceHistory(serviceHistory) {
	return {
		...serviceHistory,
		finalPrice: decimalToNumber(serviceHistory.finalPrice),
		service: serviceHistory.service ? serializeService(serviceHistory.service) : null
	};
}
/**
* Serializa uma lista de históricos de serviço/reviews
*/
function serializeServiceHistories(serviceHistories) {
	return serviceHistories.map(serializeServiceHistory);
}
/**
* Serializa resultado paginado de reviews
*/
function serializeReviewsResult(result) {
	return {
		...result,
		reviews: serializeServiceHistories(result.reviews)
	};
}
//#endregion
export { serializeService as a, serializeServicesResult as c, serializeReviewsResult as i, serializeAppointment as n, serializeServiceHistory as o, serializeAppointmentsResult as r, serializeServices as s, decimalToNumber as t };
