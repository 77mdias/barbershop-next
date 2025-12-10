import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getBarbersForAdmin } from "@/server/adminActions";
import Link from "next/link";
import {
  UserCog,
  Search,
  Filter,
  Edit,
  Plus,
  ArrowLeft,
  Star,
  Calendar,
  Mail,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react";

export default async function AdminBarbersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Verificar se o usuário é administrador
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Buscar lista de barbeiros
  const barbersResult = await getBarbersForAdmin();
  const barbers = barbersResult.success ? barbersResult.data : [];

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
                  <UserCog className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                  <span>Gerenciar Barbeiros</span>
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-1">
                  Visualize e gerencie todos os barbeiros da plataforma
                </p>
              </div>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/dashboard/admin/barbers/new">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Promover a Barbeiro</span>
                <span className="sm:hidden">Promover</span>
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
                  <Input
                    placeholder="Buscar por nome ou email..."
                    className="pl-10"
                  />
                </div>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Performance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="top">Top performers</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="new">Novos</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="recent">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mais recentes</SelectItem>
                  <SelectItem value="rating">Melhor avaliação</SelectItem>
                  <SelectItem value="reviews">Mais reviews</SelectItem>
                  <SelectItem value="name">Nome A-Z</SelectItem>
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
                <div className="p-2 bg-orange-100 rounded-lg">
                  <UserCog className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Barbeiros</p>
                  <p className="text-2xl font-bold">{barbers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold">
                    {barbers.filter(b => b.totalAppointments > 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Média Geral</p>
                  <p className="text-2xl font-bold">
                    {barbers.length > 0 
                      ? (barbers.reduce((acc, b) => acc + (b.averageRating || 0), 0) / barbers.length).toFixed(1)
                      : "0.0"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Top Performer</p>
                  <p className="text-lg font-bold">
                    {barbers.length > 0 
                      ? barbers.reduce((prev, current) => 
                          (prev.averageRating || 0) > (current.averageRating || 0) ? prev : current
                        ).name?.split(' ')[0] || "N/A"
                      : "N/A"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Barbeiros */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Barbeiros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barbeiro</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Avaliação</TableHead>
                    <TableHead>Total Reviews</TableHead>
                    <TableHead>Agendamentos</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {barbers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <UserCog className="w-8 h-8 text-gray-400" />
                          <p className="text-gray-600">Nenhum barbeiro encontrado</p>
                          <Button asChild variant="outline" size="sm">
                            <Link href="/dashboard/admin/barbers/new">
                              Promover primeiro barbeiro
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    barbers.map((barber) => (
                      <TableRow key={barber.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {barber.name?.charAt(0).toUpperCase() || "?"}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{barber.name || "Sem nome"}</p>
                              <Badge variant="outline" className="mt-1">
                                ✂️ Barbeiro
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {barber.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium">
                              {barber.averageRating ? barber.averageRating.toFixed(1) : "0.0"}
                            </span>
                            {(barber.averageRating || 0) >= 4.5 && (
                              <Badge variant="default" className="bg-yellow-500 text-xs">
                                ⭐ Top
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>{barber.totalReviews || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{barber.totalAppointments || 0}</span>
                            {(barber.totalAppointments || 0) > 20 && (
                              <Badge variant="outline" className="text-xs">
                                📈 Ativo
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(barber.createdAt).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/dashboard/admin/barbers/${barber.id}`}>
                                <Edit className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/dashboard/barber?barberId=${barber.id}`}>
                                <TrendingUp className="w-4 h-4" />
                              </Link>
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
            {barbers.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">
                  Mostrando {barbers.length} barbeiros
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

        {/* Top Performers */}
        {barbers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Performers do Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {barbers
                  .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
                  .slice(0, 3)
                  .map((barber, index) => (
                    <Card key={barber.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            variant={index === 0 ? "default" : "outline"}
                            className={index === 0 ? "bg-yellow-500" : ""}
                          >
                            #{index + 1}
                          </Badge>
                          {index === 0 && <span className="text-2xl">🏆</span>}
                        </div>
                        <div className="space-y-2">
                          <p className="font-medium">{barber.name}</p>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-bold">
                              {barber.averageRating?.toFixed(1) || "0.0"}
                            </span>
                            <span className="text-gray-600 text-sm">
                              ({barber.totalReviews || 0} reviews)
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}