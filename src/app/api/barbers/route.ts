import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

/**
 * GET /api/barbers
 * Lista barbeiros ativos
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");
    const date = searchParams.get("date");

    const barbers = await db.user.findMany({
      where: {
        role: "BARBER",
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        image: true,
        phone: true,
        email: true,
      },
      orderBy: {
        name: "asc",
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
            barberId: { in: barbers.map((b) => b.id) },
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
        const barbersWithAvailability = barbers.map((barber) => {
          const barberAppointments = appointments.filter((app) => app.barberId === barber.id);

          // Calcular slots ocupados (simplificado)
          const occupiedSlots = barberAppointments.length;
          const maxSlotsPerDay = 16; // 8 horas * 2 slots por hora
          const availabilityPercentage = Math.max(0, ((maxSlotsPerDay - occupiedSlots) / maxSlotsPerDay) * 100);

          return {
            ...barber,
            availability: {
              percentage: Math.round(availabilityPercentage),
              appointmentsCount: occupiedSlots,
              hasAvailability: availabilityPercentage > 0,
            },
          };
        });

        return NextResponse.json(barbersWithAvailability);
      }
    }

    return NextResponse.json(barbers);
  } catch (error) {
    console.error("Erro ao buscar barbeiros:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
