import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { AvailableTimesSchema } from "@/schemas/appointmentSchemas";

/**
 * GET /api/appointments/availability
 * Retorna horários disponíveis para um dia/serviço/barbeiro específico
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryData = AvailableTimesSchema.parse({
      date: new Date(searchParams.get("date")!),
      serviceId: searchParams.get("serviceId")!,
      barberId: searchParams.get("barberId") || undefined,
    });

    // Buscar o serviço para saber a duração
    const service = await db.service.findUnique({
      where: { id: queryData.serviceId, active: true },
    });

    if (!service) {
      return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
    }

    // Buscar barbeiros disponíveis (se não especificado)
    let barberIds: string[] = [];
    if (queryData.barberId) {
      barberIds = [queryData.barberId];
    } else {
      const availableBarbers = await db.user.findMany({
        where: {
          role: "BARBER",
          isActive: true,
          deletedAt: null,
        },
        select: { id: true },
      });
      barberIds = availableBarbers.map((b) => b.id);
    }

    // Buscar agendamentos existentes para o dia
    const startOfDay = new Date(queryData.date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(queryData.date);
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
      end: 18, // 18h
      intervalMinutes: 30, // Intervalos de 30 minutos
    };

    const availableSlots: Array<{
      time: string;
      barberId: string;
      barberName: string;
      available: boolean;
    }> = [];

    // Para cada barbeiro
    for (const barberId of barberIds) {
      const barber = await db.user.findFirst({
        where: { id: barberId, deletedAt: null },
        select: { name: true },
      });

      if (!barber) continue;

      // Buscar agendamentos deste barbeiro no dia
      const barberAppointments = existingAppointments.filter((app) => app.barberId === barberId);

      // Gerar slots de horário
      for (let hour = workingHours.start; hour < workingHours.end; hour++) {
        for (let minute = 0; minute < 60; minute += workingHours.intervalMinutes) {
          const slotTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

          // Criar data/hora completa para verificação
          const slotDateTime = new Date(queryData.date);
          slotDateTime.setHours(hour, minute, 0, 0);

          // Verificar se não passa do horário limite (considerando duração do serviço)
          const slotEndTime = new Date(slotDateTime.getTime() + service.duration * 60 * 1000);
          const workingEndTime = new Date(queryData.date);
          workingEndTime.setHours(workingHours.end, 0, 0, 0);

          if (slotEndTime > workingEndTime) {
            continue; // Slot passaria do horário de trabalho
          }

          // Verificar se há conflito com agendamentos existentes
          const hasConflict = barberAppointments.some((appointment) => {
            const appointmentStart = new Date(appointment.date);
            const appointmentEnd = new Date(appointmentStart.getTime() + appointment.service.duration * 60 * 1000);

            return slotDateTime < appointmentEnd && slotEndTime > appointmentStart;
          });

          // Verificar se não é no passado
          const now = new Date();
          const isInPast = slotDateTime <= now;

          availableSlots.push({
            time: slotTime,
            barberId,
            barberName: barber.name,
            available: !hasConflict && !isInPast,
          });
        }
      }
    }

    // Agrupar por horário
    const groupedSlots = availableSlots.reduce(
      (acc, slot) => {
        if (!acc[slot.time]) {
          acc[slot.time] = [];
        }
        acc[slot.time].push(slot);
        return acc;
      },
      {} as Record<string, typeof availableSlots>,
    );

    // Converter para formato final
    const availableTimes = Object.entries(groupedSlots)
      .map(([time, slots]) => ({
        time,
        slots: slots.map((slot) => ({
          barberId: slot.barberId,
          barberName: slot.barberName,
          available: slot.available,
        })),
        hasAvailable: slots.some((slot) => slot.available),
      }))
      .sort((a, b) => a.time.localeCompare(b.time));

    return NextResponse.json({
      date: queryData.date,
      service: {
        id: service.id,
        name: service.name,
        duration: service.duration,
      },
      availableTimes,
    });
  } catch (error) {
    console.error("Erro ao buscar disponibilidade:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
