import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import PromotionFormWrapper from "@/components/PromotionFormWrapper";
import { PageHero } from "@/components/shared/PageHero";

export default async function NewPromotionPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const services = await db.service.findMany({
    select: {
      id: true,
      name: true,
      active: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Administrador"
        title="Nova Promoção"
        subtitle="Preencha os dados para criar uma nova promoção."
        actions={[
          { label: "Voltar para Promoções", href: "/dashboard/admin/promotions", variant: "outline" },
        ]}
      />

      <section className="bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
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
                <PromotionFormWrapper availableServices={services} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
