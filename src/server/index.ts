// Centralizando exportações dos serviços
export { AppointmentService } from "./services/appointmentService";
export { ServiceService } from "./services/serviceService";
export { UserService } from "./services/userService";

// Centralizando exportações das actions
export * from "./appointmentActions";
export * from "./serviceActions";
export * from "./userActions";

// Re-exportando tipos úteis
export type { AppointmentWithDetails } from "./services/appointmentService";
export type { ServiceWithStats } from "./services/serviceService";
export type { UserWithStats } from "./services/userService";
