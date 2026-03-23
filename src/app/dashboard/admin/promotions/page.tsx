import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getPromotionsForAdmin } from "@/server/promotionAdminActions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Gift,
  Plus,
  Power,
  Calendar,
  Percent,
  Globe2,
  Target,
} from "lucide-react";
import PromotionTableActions from "@/components/PromotionTableActions";
import { type PromotionFiltersInput } from "@/schemas/promotionSchemas";
import { PageHero } from "@/components/shared/PageHero";

function formatValue(promotion: any) {
  const value = Number(promotion.value);
  if (promotion.type === "DISCOUNT_PERCENTAGE") {
    return `${value.toFixed(0)}%`;
  }
  return `R$ ${value.toFixed(2)}`;
}

function formatDate(date?: Date | string | null) {
  if (!date) return "Sem término";
  const parsed = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(parsed.getTime())) return "Sem término";
  return parsed.toLocaleDateString("pt-BR");
}

type AdminPromotionsPageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

function buildStatusHref(status: "all" | "active" | "inactive") {
  const params = new URLSearchParams();
  if (status !== "all") {
    params.set("status", status);
  }
  const query = params.toString();
  return query ? `/dashboard/admin/promotions?${query}` : "/dashboard/admin/promotions";
}

export default async function AdminPromotionsPage({ searchParams }: AdminPromotionsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { status: statusFilter } = await (searchParams ?? Promise.resolve({} as { status?: string }));

  const filters: PromotionFiltersInput = { page: 1, limit: 20 };

  if (statusFilter === "active") {
    filters.active = true;
  } else if (statusFilter === "inactive") {
    filters.active = false;
  }

  const promotionsResult = await getPromotionsForAdmin(filters);
  const promotions = promotionsResult.success ? promotionsResult.data : [];

  const totalPromotions = promotions.length;
  const activePromotions = promotions.filter((p: any) => p.active).length;
  const inactivePromotions = promotions.filter((p: any) => !p.active).length;
  const globalPromotions = promotions.filter((p: any) => p.isGlobal).length;
  const targetedPromotions = totalPromotions - globalPromotions;

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Administrador"
        title="Gerenciar Promoções"
        subtitle="Crie, edite e acompanhe promoções e campanhas especiais."
        actions={[
          { label: "Voltar ao Dashboard", href: "/dashboard/admin", variant: "outline" },
          { label: "Nova Promoção", href: "/dashboard/admin/promotions/new", variant: "primary" },
        ]}
      />

      <section className="bg-background py-12">
        <div className="container mx-auto px-4 space-y-6">
          {/* Stats cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                icon: Gift,
                label: "Total",
                value: totalPromotions,
                cls: "text-accent",
              },
              {
                icon: Power,
                label: "Ativas",
                value: activePromotions,
                cls: "text-[hsl(var(--success))]",
              },
              {
                icon: Power,
                label: "Inativas",
                value: inactivePromotions,
                cls: "text-fg-muted",
              },
              {
                icon: Globe2,
                label: "Globais",
                value: globalPromotions,
                cls: "text-accent",
              },
              {
                icon: Target,
                label: "Específicas",
                value: targetedPromotions,
                cls: "text-accent",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <article
                  key={stat.label}
                  className="card-hover rounded-2xl border border-border bg-surface-card p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                        {stat.label}
                      </p>
                      <p className={`font-display text-2xl font-bold italic ${stat.cls}`}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Promotions table */}
          <div className="rounded-2xl border border-border bg-surface-card">
            <div className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-xl font-bold italic text-foreground">
                Lista de Promoções
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-fg-muted">Status:</span>
                <Link
                  href={buildStatusHref("all")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    statusFilter === undefined || statusFilter === "all"
                      ? "bg-accent text-on-accent"
                      : "border border-border text-fg-muted hover:border-accent hover:text-accent"
                  }`}
                >
                  Todas
                </Link>
                <Link
                  href={buildStatusHref("active")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    statusFilter === "active"
                      ? "bg-accent text-on-accent"
                      : "border border-border text-fg-muted hover:border-accent hover:text-accent"
                  }`}
                >
                  Ativas
                </Link>
                <Link
                  href={buildStatusHref("inactive")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    statusFilter === "inactive"
                      ? "bg-accent text-on-accent"
                      : "border border-border text-fg-muted hover:border-accent hover:text-accent"
                  }`}
                >
                  Inativas
                </Link>
              </div>
            </div>

            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                      Promoção
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                      Tipo / Valor
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                      Validade
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                      Alcance
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                      Status
                    </TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-3 text-fg-muted">
                          <Gift className="h-10 w-10 opacity-30" />
                          <p className="text-sm">Nenhuma promoção encontrada</p>
                          <Link
                            href="/dashboard/admin/promotions/new"
                            className="inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-4 py-2 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
                          >
                            <Plus className="h-4 w-4" />
                            Criar primeira promoção
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    promotions.map((promotion: any) => {
                      const serializedPromotion = {
                        id: promotion.id,
                        name: promotion.name,
                        active: promotion.active,
                        _count: promotion._count,
                      };

                      return (
                        <TableRow
                          key={promotion.id}
                          className="border-border hover:bg-surface-1"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.1)] text-accent">
                                <Gift className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{promotion.name}</p>
                                {promotion.description && (
                                  <p className="max-w-xs truncate text-xs text-fg-muted">
                                    {promotion.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-foreground">
                              {promotion.type === "DISCOUNT_PERCENTAGE" ? (
                                <Percent className="h-4 w-4 text-fg-subtle" />
                              ) : (
                                <Gift className="h-4 w-4 text-fg-subtle" />
                              )}
                              <span className="font-medium">{formatValue(promotion)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-fg-muted">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {formatDate(promotion.validFrom)}
                                {" - "}
                                {formatDate(promotion.validUntil)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {promotion.isGlobal ? (
                              <span className="inline-flex items-center rounded-full bg-[hsl(var(--accent)/0.1)] px-2.5 py-0.5 text-xs font-semibold text-accent">
                                Global
                              </span>
                            ) : (
                              <div className="flex flex-col gap-1">
                                <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold text-fg-muted">
                                  Serviços: {promotion._count?.servicePromotions || 0}
                                </span>
                                <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold text-fg-muted">
                                  Usuários: {promotion._count?.userPromotions || 0}
                                </span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                promotion.active
                                  ? "bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]"
                                  : "bg-border text-fg-subtle"
                              }`}
                            >
                              {promotion.active ? "Ativa" : "Inativa"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <PromotionTableActions promotion={serializedPromotion} />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {promotions.length > 0 && (
              <div className="flex items-center justify-between border-t border-border px-6 py-4">
                <p className="text-xs text-fg-muted">
                  Mostrando {promotions.length} promoções
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-fg-subtle opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-accent text-xs font-semibold text-accent">
                    1
                  </span>
                  <button
                    disabled
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-fg-subtle opacity-50"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
