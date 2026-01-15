"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DebouncedSearchInput } from "@/components/admin/DebouncedSearchInput";
import { FilterSelect } from "@/components/admin/FilterSelect";
import { PaginationControls } from "@/components/admin/PaginationControls";
import { UserTableActions } from "@/components/UserTableActions";
import { getUsers } from "@/server/userActions";
import { Users, Filter, Trash2, Calendar, Mail, Loader2 } from "lucide-react";
import type { UserRole } from "@prisma/client";

type UserStatus = "ACTIVE" | "INACTIVE" | "ALL";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  createdAt: Date;
  deletedAt: Date | null;
  isActive: boolean;
}

interface UsersPageClientProps {
  initialUsers: User[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function UsersPageClient({ initialUsers, initialPagination }: UsersPageClientProps) {
  // Filters state
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<"all" | UserRole>("all");
  const [statusFilter, setStatusFilter] = React.useState<UserStatus>("ALL");
  const [page, setPage] = React.useState(1);

  // Data state
  const [users, setUsers] = React.useState<User[]>(initialUsers);
  const [pagination, setPagination] = React.useState(initialPagination);
  const [isLoading, setIsLoading] = React.useState(false);

  // Refetch users when filters change
  React.useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);

      try {
        const result = await getUsers({
          search: debouncedSearch.length >= 2 ? debouncedSearch : undefined,
          role: roleFilter !== "all" ? roleFilter : undefined,
          status: statusFilter,
          includeDeleted: true,
          page,
          limit: 20,
        });

        if (result.success && result.data) {
          setUsers(result.data.users);
          setPagination(result.data.pagination);
        }
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce aplicado no componente DebouncedSearchInput
    fetchUsers();
  }, [debouncedSearch, roleFilter, statusFilter, page]);

  // Reset page when filters change
  React.useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [roleFilter, statusFilter, debouncedSearch]); // Not including 'page' to avoid loop

  // Calculate statistics
  const activeUsers = users.filter((u) => !u.deletedAt);
  const removedUsers = users.filter((u) => u.deletedAt);
  const clientsCount = activeUsers.filter((u) => u.role === "CLIENT").length;
  const barbersCount = activeUsers.filter((u) => u.role === "BARBER").length;
  const adminsCount = activeUsers.filter((u) => u.role === "ADMIN").length;

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive" as const;
      case "BARBER":
        return "default" as const;
      case "CLIENT":
        return "secondary" as const;
      default:
        return "outline" as const;
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

  const renderStatusBadge = (user: User) => {
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
    <div className="space-y-6 sm:space-y-8">
      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <DebouncedSearchInput
                value={search}
                onChange={setSearch}
                onDebouncedChange={setDebouncedSearch}
                placeholder="Buscar por nome ou email..."
                delay={500}
              />
            </div>

            <FilterSelect
              value={roleFilter}
              onChange={(value) => setRoleFilter(value as typeof roleFilter)}
              options={[
                { value: "all", label: "Todos os usuários" },
                { value: "CLIENT", label: "Clientes" },
                { value: "BARBER", label: "Barbeiros" },
                { value: "ADMIN", label: "Administradores" },
              ]}
              className="w-full sm:w-[180px]"
            />

            <FilterSelect
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as UserStatus)}
              options={[
                { value: "ACTIVE", label: "Ativos" },
                { value: "INACTIVE", label: "Inativos" },
                { value: "ALL", label: "Todos" },
              ]}
              className="w-full sm:w-[180px]"
            />
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
                <p className="text-2xl font-bold">{pagination.total}</p>
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        <p className="text-gray-600">Carregando usuários...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
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
          {!isLoading && users.length > 0 && (
            <div className="mt-4">
              <PaginationControls
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                showPageNumbers
                showItemsCount
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
