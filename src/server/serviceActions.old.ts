"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { ServiceFiltersSchema, type ServiceFiltersInput } from "@/schemas/serviceSchemas";
import { ServiceService } from "./services/serviceService";

/**
 * Server Action para buscar serviços disponíveis
 */
export async function getServices(filters?: Partial<ServiceFiltersInput>) {
  try {
    const validatedFilters = filters ? ServiceFiltersSchema.parse(filters) : {
      active: true,
      page: 1,
      limit: 50
    };

    const result = await ServiceService.findMany(validatedFilters);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para buscar barbeiros disponíveis
 */
export async function getBarbers(serviceId?: string, date?: string) {
  try {
    const barbers = await db.user.findMany({
      where: {
        role: "BARBER",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        image: true,
        phone: true,
        email: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Se fornecido serviceId e date, verificar disponibilidade
    if (serviceId && date) {
      const service = await db.service.findUnique({
        where: { id: serviceId },
        select: { duration: true },
      });

      if (service) {
        const targetDate = new Date(date);
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Buscar agendamentos dos barbeiros no dia
        const appointments = await db.appointment.findMany({
          where: {
            barberId: { in: barbers.map(b => b.id) },
            date: {
              gte: startOfDay,
              lte: endOfDay,
            },
            status: {
              in: ["SCHEDULED", "CONFIRMED"],
            },
          },
          select: {
            barberId: true,
            date: true,
            service: {
              select: { duration: true },
            },
          },
        });

        // Adicionar informação de disponibilidade
        const barbersWithAvailability = barbers.map(barber => {
          const barberAppointments = appointments.filter(
            app => app.barberId === barber.id
          );

          // Calcular slots ocupados (simplificado)
          const occupiedSlots = barberAppointments.length;
          const maxSlotsPerDay = 16; // 8 horas * 2 slots por hora
          const availabilityPercentage = Math.max(0, (maxSlotsPerDay - occupiedSlots) / maxSlotsPerDay * 100);

          return {
            ...barber,
            availability: {
              percentage: Math.round(availabilityPercentage),
              appointmentsCount: occupiedSlots,
              hasAvailability: availabilityPercentage > 0,
            },
          };
        });

        return {
          success: true,
          data: barbersWithAvailability,
        };
      }
    }

    return {
      success: true,
      data: barbers,
    };

  } catch (error) {
    console.error("Erro ao buscar barbeiros:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Server Action para verificar disponibilidade de horários
 */
export async function getAvailableTimes(
  date: Date,
  serviceId: string,
  barberId?: string
) {
  try {
    // Buscar o serviço para saber a duração
    const service = await db.service.findUnique({
      where: { id: serviceId, active: true },
    });

    if (!service) {
      return {
        success: false,
        error: "Serviço não encontrado",
      };
    }

    // Buscar barbeiros disponíveis (se não especificado)
    let barberIds: string[] = [];
    if (barberId) {
      barberIds = [barberId];
    } else {
      const availableBarbers = await db.user.findMany({
        where: {
          role: "BARBER",
          isActive: true,
        },
        select: { id: true },
      });
      barberIds = availableBarbers.map(b => b.id);
    }

    // Buscar agendamentos existentes para o dia
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await db.appointment.findMany({
      where: {
        barberId: { in: barberIds },
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["SCHEDULED", "CONFIRMED"],
        },
      },
      include: {
        service: {
          select: { duration: true },
        },
      },
    });

    // Gerar horários disponíveis
    const workingHours = {
      start: 9, // 9h
      end: 18,  // 18h
      intervalMinutes: 30, // Intervalos de 30 minutos
    };

    const availableSlots: Array<{
      time: string;
      barberId: string;
      barberName: string;
      available: boolean;
    }> = [];

    // Para cada barbeiro
    for (const currentBarberId of barberIds) {
      const barber = await db.user.findUnique({
        where: { id: currentBarberId },
        select: { name: true },
      });

      if (!barber) continue;

      // Buscar agendamentos deste barbeiro no dia
      const barberAppointments = existingAppointments.filter(
        app => app.barberId === currentBarberId
      );

      // Gerar slots de horário
      for (let hour = workingHours.start; hour < workingHours.end; hour++) {
        for (let minute = 0; minute < 60; minute += workingHours.intervalMinutes) {
          const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          
          // Criar data/hora completa para verificação
          const slotDateTime = new Date(date);
          slotDateTime.setHours(hour, minute, 0, 0);

          // Verificar se não passa do horário limite (considerando duração do serviço)
          const slotEndTime = new Date(slotDateTime.getTime() + (service.duration * 60 * 1000));
          const workingEndTime = new Date(date);
          workingEndTime.setHours(workingHours.end, 0, 0, 0);

          if (slotEndTime > workingEndTime) {
            continue; // Slot passaria do horário de trabalho
          }

          // Verificar se há conflito com agendamentos existentes
          const hasConflict = barberAppointments.some(appointment => {
            const appointmentStart = new Date(appointment.date);
            const appointmentEnd = new Date(
              appointmentStart.getTime() + (appointment.service.duration * 60 * 1000)
            );

            return (
              slotDateTime < appointmentEnd && 
              slotEndTime > appointmentStart
            );
          });

          // Verificar se não é no passado
          const now = new Date();
          const isInPast = slotDateTime <= now;

          availableSlots.push({
            time: slotTime,
            barberId: currentBarberId,
            barberName: barber.name,
            available: !hasConflict && !isInPast,
          });
        }
      }
    }

    // Agrupar por horário
    const groupedSlots = availableSlots.reduce((acc, slot) => {
      if (!acc[slot.time]) {
        acc[slot.time] = [];
      }
      acc[slot.time].push(slot);
      return acc;
    }, {} as Record<string, typeof availableSlots>);

    // Converter para formato final
    const availableTimes = Object.entries(groupedSlots).map(([time, slots]) => ({
      time,
      slots: slots.map(slot => ({
        barberId: slot.barberId,
        barberName: slot.barberName,
        available: slot.available,
      })),
      hasAvailable: slots.some(slot => slot.available),
    })).sort((a, b) => a.time.localeCompare(b.time));

    return {
      success: true,
      data: {
        date,
        service: {
          id: service.id,
          name: service.name,
          duration: service.duration,
        },
        availableTimes,
      },
    };

  } catch (error) {
    console.error("Erro ao buscar disponibilidade:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}