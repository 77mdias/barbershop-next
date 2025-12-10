import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUsers } from "@/server/userActions";
import Link from "next/link";
import { Users, Search, Filter, Trash2, Plus, ArrowLeft, Calendar, Mail } from "lucide-react";
import { UserTableActions } from "@/components/UserTableActions";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Verificar se o usuário é administrador
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Buscar lista de usuários com removidos para restaurar
  const usersResult = await getUsers({
    status: "ALL",
    includeDeleted: true,
    limit: 50,
    page: 1,
  });
  const users = usersResult.success ? usersResult.data.users : [];
  const totalUsers = usersResult.success ? usersResult.data.pagination.total : users.length;
  const activeUsers = users.filter((u) => !u.deletedAt);
  const removedUsers = users.filter((u) => u.deletedAt);
  const clientsCount = activeUsers.filter((u) => u.role === "CLIENT").length;
  const barbersCount = activeUsers.filter((u) => u.role === "BARBER").length;
  const adminsCount = activeUsers.filter((u) => u.role === "ADMIN").length;

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive";
      case "BARBER":
        return "default";
      case "CLIENT":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "🛡️";
      case "BARBER":
        return "✂️";
      case "CLIENT":
        return "👤";
      default:
        return "❓";
    }
  };

  const renderStatusBadge = (user: (typeof users)[number]) => {
    if (user.deletedAt) {
      return (
        <Badge variant="destructive" className="bg-red-500">
          Removido
        </Badge>
      );
    }

    if (!user.isActive) {
      return (
        <Badge variant="outline" className="border-orange-300 text-orange-700">
          Inativo
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="bg-green-500">
        Ativo
      </Badge>
    );
  };

  return (
    <div className="container mt-20  mb-16 mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
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

        {/* Filtros e Busca */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Buscar por nome ou email..." className="pl-10" />
                </div>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os usuários</SelectItem>
                  <SelectItem value="CLIENT">Clientes</SelectItem>
                  <SelectItem value="BARBER">Barbeiros</SelectItem>
                  <SelectItem value="ADMIN">Administradores</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="active">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total (inclui removidos)</p>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                  <p className="text-xs text-gray-500">Admins ativos: {adminsCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-lg">👤</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Clientes ativos</p>
                  <p className="text-2xl font-bold">{clientsCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <span className="text-lg">✂️</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Barbeiros ativos</p>
                  <p className="text-2xl font-bold">{barbersCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Removidos</p>
                  <p className="text-2xl font-bold">{removedUsers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="w-8 h-8 text-gray-400" />
                          <p className="text-gray-600">Nenhum usuário encontrado</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium">{user.name?.charAt(0).toUpperCase() || "?"}</span>
                            </div>
                            <div>
                              <p className="font-medium">{user.name || "Sem nome"}</p>
                              <p className="text-sm text-gray-600">ID: {user.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {getRoleIcon(user.role)} {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                          </div>
                        </TableCell>
                        <TableCell>{renderStatusBadge(user)}</TableCell>
                        <TableCell className="text-right">
                          <UserTableActions user={user} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginação */}
            {users.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">
                  Mostrando {users.length} de {totalUsers} usuários
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Anterior
                  </Button>
                  <Badge variant="outline">1</Badge>
                  <Button variant="outline" size="sm" disabled>
                    Próximo
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
