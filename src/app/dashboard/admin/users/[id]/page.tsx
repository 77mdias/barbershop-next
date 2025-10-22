import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getUserById } from "@/server/adminActions";
import Link from "next/link";
import {
  User,
  ArrowLeft,
  Save,
  Trash2,
  Calendar,
  Mail,
  Shield,
  Star,
  Activity,
  DollarSign,
} from "lucide-react";

interface UserEditPageProps {
  params: {
    id: string;
  };
}

export default async function UserEditPage({ params }: UserEditPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Verificar se o usuário é administrador
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Buscar dados do usuário
  const userResult = await getUserById(params.id);
  const user = userResult.success ? userResult.data : null;

  if (!user) {
    return (
      <div className="container mt-12 mb-16 mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Usuário não encontrado</h2>
              <p className="text-gray-600 mb-4">
                O usuário com ID {params.id} não existe ou foi removido.
              </p>
              <Button asChild>
                <Link href="/dashboard/admin/users">
                  Voltar para lista de usuários
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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

  // Calcular estatísticas
  const totalAppointments = user.appointments?.length || 0;
  const appointmentsWithReviews = user.appointments?.filter(apt => apt.serviceHistory?.rating) || [];
  const averageRating = appointmentsWithReviews.length > 0 
    ? appointmentsWithReviews.reduce((acc, apt) => acc + (apt.serviceHistory?.rating || 0), 0) / appointmentsWithReviews.length
    : 0;
  const totalSpent = appointmentsWithReviews.reduce((acc, apt) => acc + (apt.serviceHistory?.finalPrice || 25), 0);

  return (
    <div className="container mt-8 sm:mt-12 mb-16 mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/admin/users">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Voltar</span>
                  <span className="sm:hidden">Voltar</span>
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  <span>Editar Usuário</span>
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-1">
                  Gerencie as informações e permissões do usuário
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button variant="outline" className="w-full sm:w-auto text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Inativar</span>
                <span className="sm:hidden">Inativar</span>
              </Button>
              <Button className="w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Salvar</span>
                <span className="sm:hidden">Salvar</span>
              </Button>
            </div>
          </div>
          <Separator />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Informações do Usuário */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados Básicos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      defaultValue={user.name || ""}
                      placeholder="Nome do usuário"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user.email}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Nível de Acesso</Label>
                    <Select defaultValue={user.role}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CLIENT">
                          <div className="flex items-center gap-2">
                            <span>👤</span>
                            Cliente
                          </div>
                        </SelectItem>
                        <SelectItem value="BARBER">
                          <div className="flex items-center gap-2">
                            <span>✂️</span>
                            Barbeiro
                          </div>
                        </SelectItem>
                        <SelectItem value="ADMIN">
                          <div className="flex items-center gap-2">
                            <span>🛡️</span>
                            Administrador
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status Atual</Label>
                    <div className="flex items-center gap-2 h-10">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleIcon(user.role)} {user.role}
                      </Badge>
                      <Badge variant="default" className="bg-green-500">
                        Ativo
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Data de Cadastro</Label>
                  <div className="flex items-center gap-2 h-10 px-3 bg-gray-50 rounded-md">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      {new Date(user.createdAt).toLocaleDateString("pt-BR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Agendamentos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Histórico de Agendamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.appointments && user.appointments.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Avaliação</TableHead>
                          <TableHead>Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {user.appointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              {new Date(appointment.createdAt).toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={appointment.status === "COMPLETED" ? "default" : "outline"}
                              >
                                {appointment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {appointment.serviceHistory?.rating ? (
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  <span>{appointment.serviceHistory.rating}/5</span>
                                </div>
                              ) : (
                                <span className="text-gray-400">Sem avaliação</span>
                              )}
                            </TableCell>
                            <TableCell>
                              R$ {(appointment.serviceHistory?.finalPrice || 25).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Nenhum agendamento encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar com Estatísticas */}
          <div className="space-y-6">
            {/* Avatar e Info Rápida */}
            <Card>
              <CardContent className="p-6 text-center">
                <UserAvatar
                  src={user.image}
                  name={user.name}
                  email={user.email}
                  size="xl"
                  className="w-20 h-20 mx-auto mb-4"
                />
                <h3 className="font-bold text-lg">{user.name || "Sem nome"}</h3>
                <p className="text-gray-600 text-sm mb-3">{user.email}</p>
                <Badge variant={getRoleBadgeVariant(user.role)} className="mb-2">
                  {getRoleIcon(user.role)} {user.role}
                </Badge>
                <p className="text-xs text-gray-500">
                  ID: {user.id.slice(0, 8)}...
                </p>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Agendamentos</span>
                  </div>
                  <span className="font-bold">{totalAppointments}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">Avaliação Média</span>
                  </div>
                  <span className="font-bold">
                    {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Total Gasto</span>
                  </div>
                  <span className="font-bold text-green-600">
                    R$ {totalSpent.toFixed(2)}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">Reviews Feitas</span>
                  </div>
                  <span className="font-bold">{appointmentsWithReviews.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Email
                </Button>
                <Button className="w-full" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Ver Agendamentos
                </Button>
                <Button className="w-full" variant="outline">
                  <Star className="w-4 h-4 mr-2" />
                  Ver Avaliações
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}