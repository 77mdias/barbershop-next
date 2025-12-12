import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getUsers } from "@/server/userActions";
import Link from "next/link";
import { Users, Plus, ArrowLeft } from "lucide-react";
import { UsersPageClient } from "./UsersPageClient";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Verificar se o usuário é administrador
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Buscar lista de usuários inicial
  const usersResult = await getUsers({
    status: "ALL",
    includeDeleted: true,
    limit: 20,
    page: 1,
  });

  const initialUsers = usersResult.success ? usersResult.data.users : [];
  const initialPagination = usersResult.success
    ? usersResult.data.pagination
    : { page: 1, limit: 20, total: 0, totalPages: 0 };

  return (
    <div className="container mt-20 mb-16 mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/admin">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Voltar ao Dashboard</span>
                  <span className="sm:hidden">Voltar</span>
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  <span>Gerenciar Usuários</span>
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-1">
                  Visualize, edite e gerencie todos os usuários da plataforma
                </p>
              </div>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/dashboard/admin/users/new">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Novo Usuário</span>
                <span className="sm:hidden">Novo</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Client Component with filters and pagination */}
        <UsersPageClient
          initialUsers={initialUsers}
          initialPagination={initialPagination}
        />
      </div>
    </div>
  );
}
