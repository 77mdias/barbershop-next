import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/shared/PageHero";
import ServiceFormWrapper from "@/components/ServiceFormWrapper";

export default async function NewServicePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Administrador"
        title="Novo Serviço"
        subtitle="Preencha os dados para criar um novo serviço."
        actions={[
          { label: "Voltar para Serviços", href: "/dashboard/admin/services", variant: "outline" },
        ]}
      />

      <section className="bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
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
                <ServiceFormWrapper />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
