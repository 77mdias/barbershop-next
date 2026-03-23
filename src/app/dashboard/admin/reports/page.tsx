import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getReportsData } from "@/server/adminActions";
import { PageHero } from "@/components/shared/PageHero";
import { ReportsPageClient } from "./ReportsPageClient";

export default async function AdminReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const reportsResult = await getReportsData("30d");
  const reports = reportsResult.success ? reportsResult.data : null;

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Administrador"
        title="Relatórios e Analytics"
        subtitle="Visualize métricas detalhadas e exporte relatórios."
        actions={[{ label: "Voltar ao Dashboard", href: "/dashboard/admin", variant: "outline" }]}
      />

      <section className="bg-background py-12">
        <div className="container mx-auto px-4">
          <ReportsPageClient initialReports={reports} initialDateRange="30d" />
        </div>
      </section>
    </main>
  );
}
