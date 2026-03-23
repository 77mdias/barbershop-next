import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getUserById } from "@/server/adminActions";
import UserForm from "@/components/forms/UserForm";
import { UserTableActions } from "@/components/UserTableActions";
import { UserAvatar } from "@/components/UserAvatar";
import { PageHero } from "@/components/shared/PageHero";
import { User, Calendar, Star, Activity, DollarSign } from "lucide-react";

interface UserEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserEditPage({ params }: UserEditPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const userResult = await getUserById(id);

  if (!userResult.success || !userResult.data) {
    return (
      <main className="flex min-h-screen flex-col bg-background text-foreground">
        <PageHero
          badge="Administrador"
          title="Usuário não encontrado"
          subtitle={`O usuário com ID ${id} não existe ou foi removido.`}
          actions={[{ label: "Voltar para lista", href: "/dashboard/admin/users", variant: "outline" }]}
        />
      </main>
    );
  }

  const user = userResult.data;
  const userImage = "image" in user ? ((user as { image?: string | null }).image ?? null) : null;

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN": return "Admin";
      case "BARBER": return "Barbeiro";
      case "CLIENT": return "Cliente";
      default: return role;
    }
  };

  const getStatusLabel = () => {
    if (user.deletedAt) return { label: "Removido", cls: "bg-red-500/10 text-red-500" };
    if (!user.isActive) return { label: "Inativo", cls: "bg-border text-fg-muted" };
    return { label: "Ativo", cls: "bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]" };
  };

  const statusInfo = getStatusLabel();

  const totalAppointments = user.appointments?.length || 0;
  const appointmentsWithReviews = (user.appointments || []).filter(
    (apt) => apt.serviceHistory?.rating
  );
  const averageRating =
    appointmentsWithReviews.length > 0
      ? appointmentsWithReviews.reduce((acc, apt) => acc + (apt.serviceHistory?.rating || 0), 0) /
        appointmentsWithReviews.length
      : 0;
  const totalSpent = user.appointments.reduce((acc, apt) => {
    const price = apt.serviceHistory?.finalPrice;
    return acc + (price != null ? Number(price) : 0);
  }, 0);

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Administrador"
        title="Editar Usuário"
        subtitle="Gerencie as informações e permissões do usuário."
        actions={[{ label: "Voltar", href: "/dashboard/admin/users", variant: "outline" }]}
      />

      <section className="bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main content */}
              <div className="lg:col-span-2 space-y-6">
                <article className="rounded-2xl border border-border bg-surface-card p-6">
                  <h2 className="mb-4 font-display text-xl font-bold italic text-foreground flex items-center gap-2">
                    <User className="h-5 w-5 text-accent" />
                    Informações Básicas
                  </h2>
                  <div className="mb-5 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-semibold text-foreground">
                      {getRoleLabel(user.role)}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.cls}`}>
                      {statusInfo.label}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-semibold text-fg-muted">
                      Criado em{" "}
                      {new Date(user.createdAt).toLocaleDateString("pt-BR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
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
                </article>

                <article className="rounded-2xl border border-border bg-surface-card">
                  <div className="border-b border-border px-6 py-4">
                    <h2 className="font-display text-xl font-bold italic text-foreground flex items-center gap-2">
                      <Activity className="h-5 w-5 text-accent" />
                      Histórico de Agendamentos
                    </h2>
                  </div>
                  <div className="p-6">
                    {user.appointments && user.appointments.length > 0 ? (
                      <div className="overflow-hidden rounded-xl border border-border">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border hover:bg-surface-1">
                              <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                                Data
                              </TableHead>
                              <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                                Status
                              </TableHead>
                              <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                                Avaliação
                              </TableHead>
                              <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                                Valor
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {user.appointments.map((appointment) => (
                              <TableRow
                                key={appointment.id}
                                className="border-border hover:bg-surface-1"
                              >
                                <TableCell className="text-sm text-foreground">
                                  {new Date(appointment.createdAt).toLocaleDateString("pt-BR")}
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                      appointment.status === "COMPLETED"
                                        ? "bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]"
                                        : "bg-border text-fg-muted"
                                    }`}
                                  >
                                    {appointment.status}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {appointment.serviceHistory?.rating ? (
                                    <div className="flex items-center gap-1 text-sm text-foreground">
                                      <Star className="h-4 w-4 text-accent fill-accent" />
                                      {appointment.serviceHistory.rating}/5
                                    </div>
                                  ) : (
                                    <span className="text-xs text-fg-subtle">Sem avaliação</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-sm text-foreground">
                                  {(() => {
                                    const priceValue = appointment.serviceHistory?.finalPrice;
                                    const price =
                                      typeof priceValue === "number"
                                        ? priceValue
                                        : Number(priceValue ?? 25);
                                    return `R$ ${price.toFixed(2)}`;
                                  })()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-3 py-8 text-fg-muted">
                        <Activity className="h-8 w-8 opacity-40" />
                        <p className="text-sm">Nenhum agendamento encontrado</p>
                      </div>
                    )}
                  </div>
                </article>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <article className="rounded-2xl border border-border bg-surface-card p-6 text-center">
                  <UserAvatar
                    src={userImage ?? undefined}
                    name={user.name}
                    email={user.email}
                    size="xl"
                    className="mx-auto mb-4 h-20 w-20"
                  />
                  <h3 className="font-display text-xl font-bold italic text-foreground">
                    {user.name || "Sem nome"}
                  </h3>
                  <p className="mt-1 text-sm text-fg-muted">{user.email}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-semibold text-foreground">
                      {getRoleLabel(user.role)}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.cls}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-fg-subtle">ID: {user.id.slice(0, 8)}...</p>
                  <div className="mt-4">
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
                </article>

                <article className="rounded-2xl border border-border bg-surface-card p-6">
                  <h3 className="mb-4 font-display text-lg font-bold italic text-foreground">
                    Estatísticas
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-fg-muted">
                        <Calendar className="h-4 w-4 text-accent" />
                        Agendamentos
                      </div>
                      <span className="font-bold text-foreground">{totalAppointments}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-fg-muted">
                        <Star className="h-4 w-4 text-accent" />
                        Avaliação Média
                      </div>
                      <span className="font-bold text-foreground">
                        {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-fg-muted">
                        <DollarSign className="h-4 w-4 text-accent" />
                        Total Gasto
                      </div>
                      <span className="font-bold text-accent">R$ {totalSpent.toFixed(2)}</span>
                    </div>

                    <div className="border-t border-border pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-fg-muted">
                        <Activity className="h-4 w-4 text-accent" />
                        Reviews Feitas
                      </div>
                      <span className="font-bold text-foreground">{appointmentsWithReviews.length}</span>
                    </div>
                  </div>
                </article>

                <article className="rounded-2xl border border-border bg-surface-card p-6">
                  <h3 className="mb-4 font-display text-lg font-bold italic text-foreground">
                    Ações Rápidas
                  </h3>
                  <div className="flex flex-col gap-3">
                    <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent">
                      <span>Enviar Email</span>
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent">
                      <Calendar className="h-4 w-4" />
                      Ver Agendamentos
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent">
                      <Star className="h-4 w-4" />
                      Ver Avaliações
                    </button>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
