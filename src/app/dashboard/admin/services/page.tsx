import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getServicesForAdmin } from "@/server/serviceAdminActions";
import { PageHero } from "@/components/shared/PageHero";
import { ServicesPageClient } from "./ServicesPageClient";

export default async function AdminServicesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const servicesResult = await getServicesForAdmin({
    page: 1,
    limit: 20,
  });

  const services = servicesResult.success ? servicesResult.data : [];
  const initialPagination = servicesResult.success
    ? servicesResult.pagination
    : { page: 1, limit: 20, total: services.length, totalPages: 1 };
  const initialStats = servicesResult.success
    ? servicesResult.stats
    : {
        activeCount: services.filter((service: any) => service.active).length,
        inactiveCount: services.filter((service: any) => !service.active).length,
      };

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Administrador"
        title="Gerenciar Serviços"
        subtitle="Crie, edite e gerencie todos os serviços da barbearia."
        actions={[
          { label: "Voltar ao Dashboard", href: "/dashboard/admin", variant: "outline" },
          { label: "Novo Serviço", href: "/dashboard/admin/services/new", variant: "primary" },
        ]}
      />

      <section className="bg-background py-12">
        <div className="container mx-auto px-4">
          <ServicesPageClient
            initialServices={services}
            initialPagination={initialPagination}
            initialStats={initialStats}
          />
        </div>
      </section>
    </main>
  );
}
