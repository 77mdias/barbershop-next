import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { getPromotionByIdForAdmin } from "@/server/promotionAdminActions";
import PromotionFormWrapper from "@/components/PromotionFormWrapper";
import { PageHero } from "@/components/shared/PageHero";
import { Calendar, Target } from "lucide-react";

interface EditPromotionPageProps {
  params: {
    id: string;
  };
}

export default async function EditPromotionPage({ params }: EditPromotionPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [promotionResult, services] = await Promise.all([
    getPromotionByIdForAdmin(params.id),
    db.service.findMany({
      select: { id: true, name: true, active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!promotionResult.success || !promotionResult.data) {
    notFound();
  }

  const promotion = promotionResult.data;
  const initialData = {
    id: promotion.id,
    name: promotion.name,
    description: promotion.description || "",
    type: promotion.type,
    value: Number(promotion.value),
    validFrom: promotion.validFrom ? new Date(promotion.validFrom) : new Date(),
    validUntil: promotion.validUntil ? new Date(promotion.validUntil) : undefined,
    isGlobal: promotion.isGlobal,
    minFrequency: promotion.minFrequency ?? undefined,
    active: promotion.active,
    serviceIds: promotion.servicePromotions?.map((ps) => ps.serviceId) || [],
  };

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Administrador"
        title="Editar Promoção"
        subtitle="Atualize as informações da promoção."
        actions={[
          { label: "Voltar para Promoções", href: "/dashboard/admin/promotions", variant: "outline" },
        ]}
      />

      <section className="bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl space-y-5">
            {promotion._count && (
              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-surface-card p-6 sm:grid-cols-4">
                {[
                  { label: "Agendamentos", value: promotion._count.appointments || 0 },
                  { label: "Serviços", value: promotion._count.servicePromotions || 0 },
                  { label: "Usuários", value: promotion._count.userPromotions || 0 },
                  { label: "Status", value: promotion.active ? "Ativa" : "Inativa" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                      {stat.label}
                    </p>
                    <p className="mt-2 font-display text-4xl font-bold italic text-accent">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-2xl border border-border bg-surface-card p-6">
              <h2 className="mb-6 font-display text-xl font-bold italic text-foreground">
                Informações da Promoção
              </h2>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-8">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
                  </div>
                }
              >
                <PromotionFormWrapper initialData={initialData} availableServices={services} />
              </Suspense>
            </div>

            <div className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface-card px-6 py-4 text-sm text-fg-muted sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Criada em{" "}
                  {promotion.createdAt
                    ? new Date(promotion.createdAt).toLocaleDateString("pt-BR")
                    : "--"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>{promotion.isGlobal ? "Promoção global" : "Promoção específica"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
