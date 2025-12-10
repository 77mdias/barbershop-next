import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/UserAvatar";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getUserById } from "@/server/adminActions";
import Link from "next/link";
import UserForm from "@/components/forms/UserForm";
import { UserTableActions } from "@/components/UserTableActions";
import { User, ArrowLeft, Calendar, Mail, Star, Activity, DollarSign } from "lucide-react";

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

  if (!userResult.success || !userResult.data) {
    return (
      <div className="container mt-12 mb-16 mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Usuário não encontrado</h2>
              <p className="text-gray-600 mb-4">O usuário com ID {params.id} não existe ou foi removido.</p>
              <Button asChild>
                <Link href="/dashboard/admin/users">Voltar para lista de usuários</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const user = userResult.data;
  const userImage = "image" in user ? ((user as { image?: string | null }).image ?? null) : null;

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

  const renderStatusBadge = () => {
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

  // Calcular estatísticas
  const totalAppointments = user.appointments?.length || 0;
  const appointmentsWithReviews = (user.appointments || []).filter((apt) => apt.serviceHistory?.rating);
  const averageRating =
    appointmentsWithReviews.length > 0
      ? appointmentsWithReviews.reduce((acc, apt) => acc + (apt.serviceHistory?.rating || 0), 0) /
        appointmentsWithReviews.length
      : 0;
  const totalSpent = appointmentsWithReviews.reduce((acc, apt) => {
    const price = apt.serviceHistory?.finalPrice;
    return acc + (typeof price === "number" ? price : Number(price ?? 25));
  }, 0);

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
              <UserTableActions
                user={{
                  id: user.id,
                  name: user.name || user.email,
                  role: user.role,
                  isActive: user.isActive,
                  deletedAt: user.deletedAt ?? null,
                }}
                showEditButton={false}
              />
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
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleIcon(user.role)} {user.role}
                  </Badge>
                  {renderStatusBadge()}
                  <Badge variant="outline" className="border-gray-200 text-gray-700">
                    Criado em{" "}
                    {new Date(user.createdAt).toLocaleDateString("pt-BR", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Badge>
                </div>

                <UserForm
                  initialData={{
                    id: user.id,
                    name: user.name || "",
                    nickname: user.nickname || "",
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                    phone: user.phone || "",
                  }}
                />
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
                            <TableCell>{new Date(appointment.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                            <TableCell>
                              <Badge variant={appointment.status === "COMPLETED" ? "default" : "outline"}>
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
                              {(() => {
                                const priceValue = appointment.serviceHistory?.finalPrice;
                                const price = typeof priceValue === "number" ? priceValue : Number(priceValue ?? 25);
                                return `R$ ${price.toFixed(2)}`;
                              })()}
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
                  src={userImage ?? undefined}
                  name={user.name}
                  email={user.email}
                  size="xl"
                  className="w-20 h-20 mx-auto mb-4"
                />
                <h3 className="font-bold text-lg">{user.name || "Sem nome"}</h3>
                <p className="text-gray-600 text-sm mb-3">{user.email}</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleIcon(user.role)} {user.role}
                  </Badge>
                  {renderStatusBadge()}
                </div>
                <p className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</p>
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
                  <span className="font-bold">{averageRating > 0 ? averageRating.toFixed(1) : "N/A"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Total Gasto</span>
                  </div>
                  <span className="font-bold text-green-600">R$ {totalSpent.toFixed(2)}</span>
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
