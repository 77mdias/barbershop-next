/**
 * Componentes de agendamento
 *
 * Exporta todos os componentes relacionados ao sistema de agendamento
 * para facilitar as importações em outras partes da aplicação.
 */

export { ServiceSelector } from "./ServiceSelector";
export { BarberSelector } from "./BarberSelector";
export { DatePicker } from "./DatePicker";
export { TimePicker } from "./TimePicker";
export { AppointmentWizard } from "./AppointmentWizard";
export { AppointmentsList } from "./AppointmentsList";
export { SchedulingClient } from "./SchedulingClient";

// Tipos compartilhados
export interface AppointmentFormData {
  serviceId?: string;
  barberId?: string;
  date?: Date;
  time?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Barber {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
