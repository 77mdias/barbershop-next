import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { runAppointmentTests } from "@/tests/appointmentFlowTests";

/**
 * API route para testar o fluxo completo de agendamento
 *
 * GET /api/test-appointments
 *
 * Executa uma bateria de testes para verificar se todo o sistema
 * de agendamento está funcionando corretamente.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Executar todos os testes
    const results = await runAppointmentTests(session.user.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Testes executados com sucesso",
        results,
        timestamp: new Date().toISOString(),
        userId: session.user.id,
        userEmail: session.user.email,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro ao executar testes de agendamento:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Erro interno ao executar testes",
        details: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Método POST para executar testes específicos
 *
 * POST /api/test-appointments
 * Body: { tests: string[] } - Lista de testes específicos para executar
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await request.json();
    const { tests = [] } = body;

    // Por enquanto, apenas executar todos os testes
    // No futuro, pode ser implementada a execução seletiva
    const results = await runAppointmentTests(session.user.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Testes executados: ${
          tests.length > 0 ? tests.join(", ") : "todos"
        }`,
        results,
        timestamp: new Date().toISOString(),
        userId: session.user.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro ao executar testes específicos:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Erro interno ao executar testes",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
