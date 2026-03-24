import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { canAccessDebugEndpoints } from "@/lib/security/debug-access";

/**
 * Endpoint para criar dados de teste para o sistema de avaliações
 * Cria: User, Service, Appointment, ServiceHistory
 */
export async function POST(request: NextRequest) {
  if (!canAccessDebugEndpoints(request.headers)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Usuário não autenticado" }, { status: 401 });
    }

    console.log("🔧 Criando dados de teste para avaliações...");

    // Verificar se já existe um serviceHistory para este usuário
    const existingServiceHistory = await db.serviceHistory.findFirst({
      where: {
        userId: session.user.id,
        rating: null, // Ainda não avaliado
      },
      include: {
        service: true,
        appointments: true,
      },
    });

    if (existingServiceHistory) {
      console.log("✅ ServiceHistory já existe:", existingServiceHistory.id);
      return NextResponse.json({
        success: true,
        message: "Dados de teste já existem",
        data: {
          serviceHistoryId: existingServiceHistory.id,
          service: existingServiceHistory.service,
          appointment: existingServiceHistory.appointments[0] || null,
        },
      });
    }

    // Buscar ou criar um serviço
    let service = await db.service.findFirst({
      where: {
        active: true,
      },
    });

    if (!service) {
      // Criar múltiplos serviços para demo mais rica
      const services = await db.service.createMany({
        data: [
          {
            name: "Corte de Cabelo Clássico",
            description: "Corte de cabelo tradicional com acabamento profissional",
            price: 25.0,
            duration: 30,
            active: true,
          },
          {
            name: "Barba + Bigode",
            description: "Aparação e modelagem de barba e bigode",
            price: 20.0,
            duration: 25,
            active: true,
          },
          {
            name: "Corte + Barba Completo",
            description: "Pacote completo com corte de cabelo e barba",
            price: 40.0,
            duration: 50,
            active: true,
          },
        ],
      });

      // Buscar o primeiro serviço criado
      service = await db.service.findFirst({
        where: { active: true },
      });
      console.log("✅ Serviços criados para demo");
    }

    if (!service) {
      throw new Error("Não foi possível criar ou encontrar serviços");
    }

    // Buscar ou criar um barbeiro
    let barber = await db.user.findFirst({
      where: {
        role: "BARBER",
      },
    });

    if (!barber) {
      barber = await db.user.create({
        data: {
          name: "João Silva",
          email: "joao.barbeiro@email.com",
          role: "BARBER",
          isActive: true,
        },
      });
      console.log("✅ Barbeiro criado:", barber.id);
    }

    // Criar agendamento
    const appointment = await db.appointment.create({
      data: {
        userId: session.user.id,
        barberId: barber.id,
        serviceId: service.id,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Ontem
        status: "COMPLETED",
        notes: "Agendamento de teste para avaliações",
      },
    });
    console.log("✅ Agendamento criado:", appointment.id);

    // Criar histórico de serviço
    const serviceHistory = await db.serviceHistory.create({
      data: {
        userId: session.user.id,
        serviceId: service.id,
        finalPrice: service.price,
        paymentMethod: "CARD",
        completedAt: new Date(Date.now() - 23 * 60 * 60 * 1000), // Ontem à tarde
        rating: null, // Ainda não avaliado
        feedback: null,
        images: [],
        notes: "Histórico de teste para avaliações",
      },
    });
    console.log("✅ ServiceHistory criado:", serviceHistory.id);

    // Atualizar appointment para conectar com serviceHistory
    await db.appointment.update({
      where: { id: appointment.id },
      data: { serviceHistoryId: serviceHistory.id },
    });

    return NextResponse.json({
      success: true,
      message: "Dados de teste criados com sucesso!",
      data: {
        serviceHistoryId: serviceHistory.id,
        service: service,
        appointment: appointment,
        barber: barber,
      },
    });
  } catch (error: any) {
    console.error("❌ Erro ao criar dados de teste:", error);
    console.error("❌ Stack trace:", error.stack);
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
