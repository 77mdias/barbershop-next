import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getPromotionsForAdmin } from "@/server/promotionAdminActions";
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
import {
  Gift,
  Plus,
  Power,
  Calendar,
  Percent,
  Globe2,
  Target,
  ArrowLeft,
} from "lucide-react";
import PromotionTableActions from "@/components/PromotionTableActions";
import { type PromotionFiltersInput } from "@/schemas/promotionSchemas";

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
  searchParams?: {
    status?: string;
  };
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

  const statusFilter = searchParams?.status;

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
    <div className="container mt-20 mb-16 mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
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
                  <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                  <span>Gerenciar Promoções</span>
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-1">
                  Crie, edite e acompanhe promoções e campanhas especiais
                </p>
              </div>
            </div>
            <Button asChild className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">
              <Link href="/dashboard/admin/promotions/new">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Nova Promoção</span>
                <span className="sm:hidden">Nova</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Gift className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{totalPromotions}</p>
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
                  <p className="text-sm text-gray-600">Ativas</p>
                  <p className="text-2xl font-bold text-green-600">{activePromotions}</p>
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
                  <p className="text-sm text-gray-600">Inativas</p>
                  <p className="text-2xl font-bold text-red-600">{inactivePromotions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Globe2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Globais</p>
                  <p className="text-2xl font-bold text-blue-600">{globalPromotions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Target className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Específicas</p>
                  <p className="text-2xl font-bold text-amber-600">{targetedPromotions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Promoções</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <Button
                  asChild
                  size="sm"
                  variant={statusFilter === undefined || statusFilter === "all" ? "default" : "outline"}
                >
                  <Link href={buildStatusHref("all")}>Todas</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant={statusFilter === "active" ? "default" : "outline"}
                >
                  <Link href={buildStatusHref("active")}>Ativas</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant={statusFilter === "inactive" ? "default" : "outline"}
                >
                  <Link href={buildStatusHref("inactive")}>Inativas</Link>
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                {statusFilter === "active" && "Mostrando apenas promoções ativas"}
                {statusFilter === "inactive" && "Mostrando apenas promoções inativas"}
                {(statusFilter === undefined || statusFilter === "all") && "Mostrando todas as promoções"}
              </p>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Promoção</TableHead>
                    <TableHead>Tipo / Valor</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Alcance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Gift className="w-8 h-8 text-gray-400" />
                          <p className="text-gray-600">Nenhuma promoção encontrada</p>
                          <Button asChild variant="outline" size="sm">
                            <Link href="/dashboard/admin/promotions/new">Criar primeira promoção</Link>
                          </Button>
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
                        <TableRow key={promotion.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                                <Gift className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium">{promotion.name}</p>
                                {promotion.description && (
                                  <p className="text-sm text-gray-600 truncate max-w-xs">
                                    {promotion.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {promotion.type === "DISCOUNT_PERCENTAGE" ? (
                                <Percent className="w-4 h-4 text-gray-400" />
                              ) : (
                                <Gift className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="font-medium">{formatValue(promotion)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>
                                {formatDate(promotion.validFrom)}
                                {" - "}
                                {formatDate(promotion.validUntil)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {promotion.isGlobal ? (
                              <Badge className="bg-blue-600">Global</Badge>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  Serviços: {promotion._count?.servicePromotions || 0}
                                </Badge>
                                <Badge variant="outline">
                                  Usuários: {promotion._count?.userPromotions || 0}
                                </Badge>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={promotion.active ? "default" : "secondary"}
                              className={promotion.active ? "bg-green-500" : "bg-gray-400"}
                            >
                              {promotion.active ? "Ativa" : "Inativa"}
                            </Badge>
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
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">Mostrando {promotions.length} promoções</p>
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