import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import TestReviewFormClient from "./TestReviewFormClient";

export default async function TestReviewFormPage() {
  // Verificar autenticação
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  // Buscar ServiceHistory do usuário que ainda não tem avaliação
  const serviceHistoriesWithoutReview = await db.serviceHistory.findMany({
    where: {
      userId: session.user.id,
      rating: null, // Não tem avaliação ainda
    },
    include: {
      service: true,
    },
    orderBy: {
      completedAt: 'desc'
    },
    take: 5
  });

  // Buscar ServiceHistory do usuário que já tem avaliação (para editar)
  const serviceHistoriesWithReview = await db.serviceHistory.findMany({
    where: {
      userId: session.user.id,
      rating: { not: null }, // Já tem avaliação
    },
    include: {
      service: true,
    },
    orderBy: {
      completedAt: 'desc'
    },
    take: 5
  });

  return (
    <TestReviewFormClient
      session={session}
      serviceHistoriesWithoutReview={serviceHistoriesWithoutReview}
      serviceHistoriesWithReview={serviceHistoriesWithReview}
    />
  );
}