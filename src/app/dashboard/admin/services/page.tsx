import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getServicesForAdmin } from "@/server/serviceAdminActions";
import Link from "next/link";
import {
  Scissors,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Power,
  Clock,
  DollarSign,
  Calendar,
  TrendingUp,
} from "lucide-react";

export default async function AdminServicesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Verificar se o usuário é administrador
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Buscar lista de serviços
  const servicesResult = await getServicesForAdmin();
  const services = servicesResult.success ? servicesResult.data : [];

  // Calcular estatísticas
  const totalServices = services.length;
  const activeServices = services.filter((s: any) => s.active).length;
  const inactiveServices = services.filter((s: any) => !s.active).length;
  const totalAppointments = services.reduce(
    (acc: number, s: any) => acc + (s._count?.appointments || 0),
    0
  );
  const avgPrice =
    services.length > 0
      ? services.reduce((acc: number, s: any) => acc + Number(s.price), 0) /
        services.length
      : 0;

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
                  <Scissors className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                  <span>Gerenciar Serviços</span>
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-1">
                  Crie, edite e gerencie todos os serviços da barbearia
                </p>
              </div>
            </div>
            <Button asChild className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">
              <Link href="/dashboard/admin/services/new">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Novo Serviço</span>
                <span className="sm:hidden">Novo</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Scissors className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{totalServices}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Power className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {activeServices}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Power className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Inativos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {inactiveServices}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Agendamentos</p>
                  <p className="text-2xl font-bold">{totalAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Preço Médio</p>
                  <p className="text-lg font-bold">R$ {avgPrice.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Serviços */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Agendamentos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Scissors className="w-8 h-8 text-gray-400" />
                          <p className="text-gray-600">
                            Nenhum serviço encontrado
                          </p>
                          <Button asChild variant="outline" size="sm">
                            <Link href="/dashboard/admin/services/new">
                              Criar primeiro serviço
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    services.map((service: any) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                              <Scissors className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">{service.name}</p>
                              {service.description && (
                                <p className="text-sm text-gray-600 truncate max-w-xs">
                                  {service.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{service.duration} min</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">
                              R$ {Number(service.price).toFixed(2)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{service._count?.appointments || 0}</span>
                            {(service._count?.appointments || 0) > 10 && (
                              <Badge variant="outline" className="text-xs">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Popular
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={service.active ? "default" : "secondary"}
                            className={
                              service.active ? "bg-green-500" : "bg-gray-400"
                            }
                          >
                            {service.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link
                                href={`/dashboard/admin/services/${service.id}/edit`}
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={
                                service.active
                                  ? "text-orange-600 hover:bg-orange-50"
                                  : "text-green-600 hover:bg-green-50"
                              }
                            >
                              <Power className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginação */}
            {services.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">
                  Mostrando {services.length} serviços
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
