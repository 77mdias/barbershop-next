"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DebouncedSearchInput } from "@/components/admin/DebouncedSearchInput";
import { FilterSelect } from "@/components/admin/FilterSelect";
import { PaginationControls } from "@/components/admin/PaginationControls";
import { getBarbersForAdmin } from "@/server/adminActions";
import Link from "next/link";
import {
  Activity,
  Calendar,
  Filter as FilterIcon,
  Loader2,
  Mail,
  Star,
  TrendingUp,
  UserCog,
  Users,
} from "lucide-react";

type Barber = {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date | string;
  totalReviews: number;
  averageRating: number | null;
  totalAppointments: number;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type BarberMetrics = {
  averageRating: number;
  activeCount: number;
  totalReviews: number;
  topPerformer: string | null;
};

interface BarbersPageClientProps {
  initialBarbers: Barber[];
  initialPagination: Pagination;
  initialMetrics?: BarberMetrics;
}

const DEFAULT_METRICS: BarberMetrics = {
  averageRating: 0,
  activeCount: 0,
  totalReviews: 0,
  topPerformer: null,
};

export function BarbersPageClient({
  initialBarbers,
  initialPagination,
  initialMetrics,
}: BarbersPageClientProps) {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [performanceFilter, setPerformanceFilter] =
    React.useState<"all" | "3" | "4" | "4.5" | "5">("all");
  const [sortBy, setSortBy] =
    React.useState<"name" | "rating" | "appointments">("name");
  const [page, setPage] = React.useState(1);
  const [barbers, setBarbers] = React.useState<Barber[]>(initialBarbers);
  const [pagination, setPagination] =
    React.useState<Pagination>(initialPagination);
  const [metrics, setMetrics] = React.useState<BarberMetrics>(
    initialMetrics || DEFAULT_METRICS
  );
  const [isLoading, setIsLoading] = React.useState(false);

  const itemsPerPage = initialPagination.limit || 20;

  const calculateMetrics = React.useCallback((data: Barber[]): BarberMetrics => {
    const ratedBarbers = data.filter((barber) => barber.averageRating !== null);

    const averageRating =
      ratedBarbers.length > 0
        ? Number(
            (
              ratedBarbers.reduce(
                (acc, barber) => acc + (barber.averageRating || 0),
                0
              ) / ratedBarbers.length
            ).toFixed(2)
          )
        : 0;

    const activeCount = data.filter(
      (barber) => (barber.totalAppointments || 0) > 0
    ).length;

    const totalReviews = data.reduce(
      (acc, barber) => acc + (barber.totalReviews || 0),
      0
    );

    const topPerformer = data
      .filter((barber) => barber.averageRating !== null)
      .sort(
        (a, b) => (b.averageRating || 0) - (a.averageRating || 0)
      )[0]?.name;

    return {
      averageRating,
      activeCount,
      totalReviews,
      topPerformer: topPerformer || null,
    };
  }, []);

  React.useEffect(() => {
    const fetchBarbers = async () => {
      setIsLoading(true);

      try {
        const performanceMin =
          performanceFilter === "all" ? undefined : Number(performanceFilter);

        const result = await getBarbersForAdmin({
          search:
            debouncedSearch.length >= 2 ? debouncedSearch.trim() : undefined,
          performanceMin,
          sortBy,
          page,
          limit: itemsPerPage,
        });

        if (result.success && Array.isArray(result.data)) {
          const data = result.data as Barber[];
          setBarbers(data);
          setPagination(
            result.pagination || {
              page,
              limit: itemsPerPage,
              total: data.length,
              totalPages: 1,
            }
          );

          setMetrics(
            result.metrics ||
              calculateMetrics(
                performanceMin
                  ? data.filter(
                      (barber) =>
                        (barber.averageRating || 0) >= performanceMin
                    )
                  : data
              )
          );
        }
      } catch (error) {
        console.error("Erro ao buscar barbeiros:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBarbers();
  }, [
    debouncedSearch,
    performanceFilter,
    sortBy,
    page,
    itemsPerPage,
    calculateMetrics,
  ]);

  React.useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [debouncedSearch, performanceFilter, sortBy]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="w-5 h-5" />
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
                isSearching={isLoading}
              />
            </div>

            <FilterSelect
              value={performanceFilter}
              onChange={(value) =>
                setPerformanceFilter(
                  value as "all" | "3" | "4" | "4.5" | "5"
                )
              }
              options={[
                { value: "all", label: "Performance (todas)" },
                { value: "3", label: "3.0 ★+" },
                { value: "4", label: "4.0 ★+" },
                { value: "4.5", label: "4.5 ★+" },
                { value: "5", label: "5.0 ★" },
              ]}
              className="w-full sm:w-[180px]"
              showReset
              resetLabel="Limpar"
            />

            <FilterSelect
              value={sortBy}
              onChange={(value) =>
                setSortBy(value as "name" | "rating" | "appointments")
              }
              options={[
                { value: "name", label: "Nome (A-Z)" },
                { value: "rating", label: "Melhor avaliação" },
                { value: "appointments", label: "Mais agendamentos" },
              ]}
              className="w-full sm:w-[180px]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <UserCog className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Barbeiros</p>
                <p className="text-2xl font-bold">{pagination.total}</p>
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
                <p className="text-2xl font-bold">{metrics.activeCount}</p>
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
                  {metrics.averageRating.toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold">{metrics.totalReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                        <p className="text-gray-600 text-sm">
                          Carregando barbeiros...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : barbers.length === 0 ? (
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
                            {barber.averageRating
                              ? barber.averageRating.toFixed(1)
                              : "0.0"}
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
                              Ver perfil
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

          {!isLoading && barbers.length > 0 && (
            <div className="mt-4">
              <PaginationControls
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                showPageNumbers
                showItemsCount
                showFirstLast
              />
            </div>
          )}
        </CardContent>
      </Card>

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
                .slice()
                .sort(
                  (a, b) => (b.averageRating || 0) - (a.averageRating || 0)
                )
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
  );
}
