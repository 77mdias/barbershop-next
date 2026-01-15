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
import ServiceTableActions from "@/components/ServiceTableActions";
import { getServicesForAdmin } from "@/server/serviceAdminActions";
import {
  Calendar,
  Clock,
  DollarSign,
  Filter as FilterIcon,
  Loader2,
  Scissors,
  TrendingUp,
} from "lucide-react";

type Service = {
  id: string;
  name: string;
  description?: string | null;
  duration: number;
  price: number | string;
  active: boolean;
  _count?: {
    appointments?: number;
    serviceHistory?: number;
  };
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ServiceStats = {
  activeCount: number;
  inactiveCount: number;
};

interface ServicesPageClientProps {
  initialServices: Service[];
  initialPagination: Pagination;
  initialStats?: ServiceStats;
}

export function ServicesPageClient({
  initialServices,
  initialPagination,
  initialStats,
}: ServicesPageClientProps) {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [statusFilter, setStatusFilter] =
    React.useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = React.useState(1);
  const [services, setServices] = React.useState<Service[]>(initialServices);
  const [pagination, setPagination] =
    React.useState<Pagination>(initialPagination);
  const [stats, setStats] = React.useState<ServiceStats>(
    initialStats || {
      activeCount: initialServices.filter((service) => service.active).length,
      inactiveCount: initialServices.filter((service) => !service.active)
        .length,
    }
  );
  const [isLoading, setIsLoading] = React.useState(false);

  const itemsPerPage = initialPagination.limit || 20;

  React.useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);

      try {
        const result = await getServicesForAdmin({
          search:
            debouncedSearch.length >= 2 ? debouncedSearch.trim() : undefined,
          active:
            statusFilter === "all"
              ? undefined
              : statusFilter === "active"
                ? true
                : false,
          page,
          limit: itemsPerPage,
        });

        if (result.success && Array.isArray(result.data)) {
          setServices(result.data as Service[]);
          setPagination(
            result.pagination || {
              page,
              limit: itemsPerPage,
              total: result.data.length,
              totalPages: 1,
            }
          );

          const fallbackStats: ServiceStats = {
            activeCount: (result.data as Service[]).filter(
              (svc) => svc.active
            ).length,
            inactiveCount: (result.data as Service[]).filter(
              (svc) => !svc.active
            ).length,
          };

          setStats(result.stats || fallbackStats);
        }
      } catch (error) {
        console.error("Erro ao buscar serviços:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [debouncedSearch, statusFilter, page, itemsPerPage]);

  React.useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [debouncedSearch, statusFilter]);

  const totalAppointmentsOnPage = services.reduce(
    (acc, service) => acc + (service._count?.appointments || 0),
    0
  );

  const averagePrice =
    services.length > 0
      ? services.reduce(
          (acc, service) => acc + Number(service.price || 0),
          0
        ) / services.length
      : 0;

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
                placeholder="Buscar por nome ou descrição..."
                delay={500}
                isSearching={isLoading}
              />
            </div>

            <FilterSelect
              value={statusFilter}
              onChange={(value) =>
                setStatusFilter(value as "all" | "active" | "inactive")
              }
              options={[
                { value: "all", label: "Todos" },
                { value: "active", label: "Ativos" },
                { value: "inactive", label: "Inativos" },
              ]}
              className="w-full sm:w-[180px]"
              showReset
              resetLabel="Limpar"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Scissors className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{pagination.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.activeCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Inativos</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.inactiveCount}
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
                <p className="text-sm text-gray-600">Agendamentos (página)</p>
                <p className="text-2xl font-bold">{totalAppointmentsOnPage}</p>
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
                <p className="text-sm text-gray-600">Preço Médio (página)</p>
                <p className="text-lg font-bold">
                  R$ {averagePrice.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                        <p className="text-sm text-gray-600">
                          Carregando serviços...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : services.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Scissors className="w-8 h-8 text-gray-400" />
                        <p className="text-gray-600">
                          Nenhum serviço encontrado
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((service) => {
                    const serializedService = {
                      id: service.id,
                      name: service.name,
                      active: service.active,
                      _count: service._count,
                    };

                    return (
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
                            variant={
                              service.active ? "default" : "secondary"
                            }
                            className={
                              service.active
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }
                          >
                            {service.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <ServiceTableActions service={serializedService} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {!isLoading && services.length > 0 && (
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
    </div>
  );
}
