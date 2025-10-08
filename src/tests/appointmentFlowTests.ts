/**
 * Conjunto de testes para validar o fluxo completo de agendamento
 *
 * Este arquivo contém funções de teste que validam:
 * 1. Criação de agendamentos
 * 2. Verificação de disponibilidade
 * 3. Cancelamento de agendamentos
 * 4. Listagem de agendamentos
 * 5. Validações de regras de negócio
 */

import { AppointmentService } from "@/server/services/appointmentService";
import { ServiceService } from "@/server/services/serviceService";
import { UserService } from "@/server/services/userService";

export class AppointmentFlowTests {
  /**
   * Teste 1: Verificar se os serviços estão funcionando
   */
  static async testServicesAvailability() {
    console.log("🔍 Testando disponibilidade de serviços...");

    try {
      const services = await ServiceService.findActive();
      console.log(`✅ Encontrados ${services.length} serviços ativos`);

      if (services.length === 0) {
        console.log(
          "⚠️  Aviso: Nenhum serviço ativo encontrado. Execute o seed do banco."
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("❌ Erro ao buscar serviços:", error);
      return false;
    }
  }

  /**
   * Teste 2: Verificar se há barbeiros disponíveis
   */
  static async testBarbersAvailability() {
    console.log("🔍 Testando disponibilidade de barbeiros...");

    try {
      const barbers = await UserService.findBarbers();
      console.log(`✅ Encontrados ${barbers.length} barbeiros ativos`);

      if (barbers.length === 0) {
        console.log(
          "⚠️  Aviso: Nenhum barbeiro ativo encontrado. Execute o seed do banco."
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("❌ Erro ao buscar barbeiros:", error);
      return false;
    }
  }

  /**
   * Teste 3: Criar um agendamento de teste
   */
  static async testCreateAppointment(userId: string) {
    console.log("🔍 Testando criação de agendamento...");

    try {
      // Buscar serviços e barbeiros
      const [services, barbers] = await Promise.all([
        ServiceService.findActive(),
        UserService.findBarbers(),
      ]);

      if (services.length === 0 || barbers.length === 0) {
        console.log("❌ Não há serviços ou barbeiros disponíveis para teste");
        return false;
      }

      const service = services[0];
      const barber = barbers[0];

      // Data para amanhã às 10h
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      // Verificar disponibilidade
      const isAvailable = await AppointmentService.checkAvailability(
        barber.id,
        tomorrow,
        service.id
      );

      if (!isAvailable) {
        console.log("❌ Horário não disponível para teste");
        return false;
      }

      // Criar agendamento
      const appointment = await AppointmentService.create(userId, {
        serviceId: service.id,
        barberId: barber.id,
        date: tomorrow,
        notes: "Agendamento de teste automático",
      });

      console.log(`✅ Agendamento criado com sucesso! ID: ${appointment.id}`);
      return appointment.id;
    } catch (error) {
      console.error("❌ Erro ao criar agendamento:", error);
      return false;
    }
  }

  /**
   * Teste 4: Verificar disponibilidade de horários
   */
  static async testAvailabilityCheck() {
    console.log("🔍 Testando verificação de disponibilidade...");

    try {
      const barbers = await UserService.findBarbers();
      const services = await ServiceService.findActive();

      if (barbers.length === 0 || services.length === 0) {
        console.log("❌ Dados insuficientes para teste");
        return false;
      }

      const barber = barbers[0];
      const service = services[0];

      // Teste para hoje às 14h
      const testDate = new Date();
      testDate.setHours(14, 0, 0, 0);

      const isAvailable = await AppointmentService.checkAvailability(
        barber.id,
        testDate,
        service.id
      );

      console.log(
        `✅ Verificação de disponibilidade funcionando. Disponível: ${isAvailable}`
      );
      return true;
    } catch (error) {
      console.error("❌ Erro ao verificar disponibilidade:", error);
      return false;
    }
  }

  /**
   * Teste 5: Listar agendamentos de um usuário
   */
  static async testListUserAppointments(userId: string) {
    console.log("🔍 Testando listagem de agendamentos...");

    try {
      const result = await AppointmentService.findUserAppointments(userId, {
        page: 1,
        limit: 10,
      });

      console.log(
        `✅ Listagem funcionando. Encontrados ${result.appointments.length} agendamentos`
      );
      console.log(
        `📊 Total: ${result.pagination.total}, Páginas: ${result.pagination.totalPages}`
      );

      return true;
    } catch (error) {
      console.error("❌ Erro ao listar agendamentos:", error);
      return false;
    }
  }

  /**
   * Teste 6: Cancelar agendamento
   */
  static async testCancelAppointment(appointmentId: string) {
    console.log("🔍 Testando cancelamento de agendamento...");

    try {
      const appointment = await AppointmentService.cancel(appointmentId);

      if (appointment.status === "CANCELLED") {
        console.log("✅ Cancelamento funcionando corretamente");
        return true;
      } else {
        console.log("❌ Agendamento não foi cancelado");
        return false;
      }
    } catch (error) {
      console.error("❌ Erro ao cancelar agendamento:", error);
      return false;
    }
  }

  /**
   * Teste 7: Verificar slots disponíveis
   */
  static async testAvailableSlots() {
    console.log("🔍 Testando busca de slots disponíveis...");

    try {
      const barbers = await UserService.findBarbers();
      const services = await ServiceService.findActive();

      if (barbers.length === 0 || services.length === 0) {
        console.log("❌ Dados insuficientes para teste");
        return false;
      }

      const barber = barbers[0];
      const service = services[0];

      // Amanhã
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const slots = await UserService.getBarberAvailableSlots(
        barber.id,
        tomorrow,
        service.duration
      );

      console.log(
        `✅ Slots disponíveis funcionando. Encontrados ${slots.length} slots`
      );
      return true;
    } catch (error) {
      console.error("❌ Erro ao buscar slots:", error);
      return false;
    }
  }

  /**
   * Executar todos os testes
   */
  static async runAllTests(userId: string) {
    console.log("🚀 Iniciando testes do fluxo de agendamento...\n");

    const results: Record<string, boolean> = {
      services: await this.testServicesAvailability(),
      barbers: await this.testBarbersAvailability(),
      availability: await this.testAvailabilityCheck(),
      userAppointments: await this.testListUserAppointments(userId),
      availableSlots: await this.testAvailableSlots(),
    };

    // Se todos os testes básicos passaram, testar criação e cancelamento
    if (results.services && results.barbers) {
      console.log("\n🔄 Testando operações de criação e cancelamento...");

      const appointmentId = await this.testCreateAppointment(userId);
      if (appointmentId && typeof appointmentId === "string") {
        results.createAppointment = true;
        results.cancelAppointment = await this.testCancelAppointment(
          appointmentId
        );
      } else {
        results.createAppointment = false;
        results.cancelAppointment = false;
      }
    }

    // Relatório final
    console.log("\n📊 RELATÓRIO FINAL DOS TESTES:");
    console.log("================================");
    Object.entries(results).forEach(([test, passed]) => {
      const status = passed ? "✅" : "❌";
      const testName = test.replace(/([A-Z])/g, " $1").toLowerCase();
      console.log(`${status} ${testName}`);
    });

    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;

    console.log(`\n🎯 Resultado: ${passedTests}/${totalTests} testes passaram`);

    if (passedTests === totalTests) {
      console.log(
        "🎉 Todos os testes passaram! Sistema de agendamento funcionando corretamente."
      );
    } else {
      console.log(
        "⚠️  Alguns testes falharam. Verifique os logs acima para mais detalhes."
      );
    }

    return results;
  }
}

/**
 * Função utilitária para executar os testes
 *
 * Para usar em desenvolvimento:
 * 1. Importe esta função
 * 2. Chame com um userId válido
 * 3. Verifique os logs no console
 */
export async function runAppointmentTests(userId: string) {
  return await AppointmentFlowTests.runAllTests(userId);
}

/**
 * Script de exemplo para executar os testes
 *
 * Você pode usar isto em uma API route para testar:
 *
 * ```typescript
 * // app/api/test-appointments/route.ts
 * import { runAppointmentTests } from '@/tests/appointmentFlowTests';
 * import { getServerSession } from 'next-auth';
 * import { authOptions } from '@/lib/auth';
 *
 * export async function GET() {
 *   const session = await getServerSession(authOptions);
 *   if (!session?.user?.id) {
 *     return new Response('Unauthorized', { status: 401 });
 *   }
 *
 *   const results = await runAppointmentTests(session.user.id);
 *   return Response.json(results);
 * }
 * ```
 */
