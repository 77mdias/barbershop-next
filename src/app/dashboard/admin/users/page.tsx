import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUsers } from "@/server/userActions";
import { UsersPageClient } from "./UsersPageClient";
import { PageHero } from "@/components/shared/PageHero";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const usersResult = await getUsers({
    status: "ALL",
    includeDeleted: true,
    limit: 20,
    page: 1,
  });

  const initialUsers = usersResult.success ? (usersResult.data?.users ?? []) : [];
  const initialPagination = usersResult.success
    ? (usersResult.data?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 })
    : { page: 1, limit: 20, total: 0, totalPages: 0 };

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Administrador"
        title="Gerenciar Usuários"
        subtitle="Visualize, edite e gerencie todos os usuários da plataforma."
        actions={[
          { label: "Voltar ao Dashboard", href: "/dashboard/admin", variant: "outline" },
          { label: "Novo Usuário", href: "/dashboard/admin/users/new", variant: "primary" },
        ]}
      />

      <section className="bg-background py-12">
        <div className="container mx-auto px-4">
          <UsersPageClient
            initialUsers={initialUsers}
            initialPagination={initialPagination}
          />
        </div>
      </section>
    </main>
  );
}
