import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import ServiceFormWrapper from "@/components/ServiceFormWrapper";
import { getServiceByIdForAdmin } from "@/server/serviceAdminActions";
import { PageHero } from "@/components/shared/PageHero";

interface EditServicePageProps {
  params: {
    id: string;
  };
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const result = await getServiceByIdForAdmin(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const service = result.data;

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Administrador"
        title="Editar Serviço"
        subtitle="Atualize as informações do serviço."
        actions={[
          { label: "Voltar para Serviços", href: "/dashboard/admin/services", variant: "outline" },
        ]}
      />

      <section className="bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl space-y-5">
            {service._count && (
              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-surface-card p-6 sm:grid-cols-4">
                {[
                  { label: "Agendamentos", value: service._count.appointments || 0 },
                  { label: "Histórico", value: service._count.serviceHistory || 0 },
                  { label: "Promoções", value: service._count.promotionServices || 0 },
                  { label: "Vouchers", value: service._count.vouchers || 0 },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                      {stat.label}
                    </p>
                    <p className="mt-2 font-display text-3xl font-bold italic text-accent">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-2xl border border-border bg-surface-card p-6">
              <h2 className="mb-6 font-display text-xl font-bold italic text-foreground">
                Informações do Serviço
              </h2>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-8">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
                  </div>
                }
              >
                <ServiceFormWrapper
                  initialData={{
                    id: service.id,
                    name: service.name,
                    description: service.description || "",
                    duration: service.duration,
                    price: Number(service.price),
                    active: service.active,
                  }}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
