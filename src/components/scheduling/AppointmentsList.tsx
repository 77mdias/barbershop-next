"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  User, 
  Scissors, 
  DollarSign, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Filter,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { cancelAppointment } from "@/server/appointmentActions";
import { toast } from "sonner";
import { formatDate } from "@/lib/date-utils";

// Tipo baseado na estrutura real retornada pelo getUserAppointments
interface Appointment {
  id: string;
  date: Date;
  status: string;
  notes: string | null;
  appliedPromotion: {
    id: string;
    name: string;
    type: string;
    value: { toNumber(): number };
  } | null;
  barber: {
    id: string;
    name: string;
    image: string | null;
    phone: string | null;
  };
  service: {
    id: string;
    name: string;
    description: string | null;
    duration: number;
    price: { toNumber(): number };
  };
  voucher: {
    id: string;
    code: string;
    type: string;
    value: { toNumber(): number };
  } | null;
}

interface AppointmentsListProps {
  initialAppointments: Appointment[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

const statusConfig = {
  SCHEDULED: {
    label: "Agendado",
    color: "bg-blue-500",
    icon: Calendar,
    variant: "default" as const,
  },
  CONFIRMED: {
    label: "Confirmado", 
    color: "bg-green-500",
    icon: CheckCircle2,
    variant: "default" as const,
  },
  COMPLETED: {
    label: "Concluído",
    color: "bg-emerald-500", 
    icon: CheckCircle2,
    variant: "secondary" as const,
  },
  CANCELLED: {
    label: "Cancelado",
    color: "bg-red-500",
    icon: XCircle,
    variant: "destructive" as const,
  },
  NO_SHOW: {
    label: "Não Compareceu",
    color: "bg-orange-500",
    icon: AlertCircle,
    variant: "destructive" as const,
  },
};

/**
 * Lista de agendamentos do usuário
 * 
 * Exibe cards com informações detalhadas dos agendamentos,
 * permite filtrar por status e cancelar agendamentos válidos.
 */
export function AppointmentsList({
  initialAppointments,
  totalCount,
  currentPage,
  totalPages,
}: AppointmentsListProps) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [filter, setFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("Tem certeza que deseja cancelar este agendamento?")) {
      return;
    }

    try {
      setLoading(true);
      const result = await cancelAppointment(appointmentId);
      
      if (result.success) {
        // Atualizar o status local
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, status: "CANCELLED" }
              : apt
          )
        );
        
        toast.success("Agendamento cancelado com sucesso");
      } else {
        toast.error(result.error || "Erro ao cancelar agendamento");
      }
    } catch (error) {
      console.error("Erro ao cancelar:", error);
      toast.error("Erro ao cancelar agendamento");
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === "ALL") return true;
    return appointment.status === filter;
  });

  const canCancelAppointment = (appointment: Appointment) => {
    if (appointment.status !== "SCHEDULED" && appointment.status !== "CONFIRMED") {
      return false;
    }
    
    // Verificar se está dentro do prazo de cancelamento (2 horas)
    const appointmentDateTime = new Date(appointment.date);
    const now = new Date();
    const diffHours = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return diffHours >= 2;
  };

  // Calcular preço total considerando promoções
  const calculateTotalPrice = (appointment: Appointment) => {
    const basePrice = appointment.service.price.toNumber();
    
    if (!appointment.appliedPromotion) {
      return basePrice;
    }
    
    const promotionValue = appointment.appliedPromotion.value.toNumber();
    
    switch (appointment.appliedPromotion.type) {
      case 'DISCOUNT_PERCENTAGE':
        return basePrice * (1 - promotionValue / 100);
      case 'DISCOUNT_FIXED':
        return Math.max(0, basePrice - promotionValue);
      case 'FREE_SERVICE':
        return 0;
      default:
        return basePrice;
    }
  };

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum agendamento encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Você ainda não possui agendamentos. Que tal fazer o primeiro?
          </p>
          <Button asChild>
            <a href="/scheduling">Fazer Agendamento</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("ALL")}
            >
              Todos ({appointments.length})
            </Button>
            {Object.entries(statusConfig).map(([status, config]) => {
              const count = appointments.filter(a => a.status === status).length;
              if (count === 0) return null;
              
              return (
                <Button
                  key={status}
                  variant={filter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(status)}
                >
                  {config.label} ({count})
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista de agendamentos */}
      <div className="grid gap-4">
        {filteredAppointments.map((appointment) => {
          const config = statusConfig[appointment.status as keyof typeof statusConfig];
          const StatusIcon = config?.icon || Calendar;
          const totalPrice = calculateTotalPrice(appointment);
          
          return (
            <Card key={appointment.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Informações principais */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Scissors className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold">{appointment.service.name}</h3>
                        </div>
                        {appointment.service.description && (
                          <p className="text-sm text-muted-foreground">
                            {appointment.service.description}
                          </p>
                        )}
                      </div>
                      
                      <Badge variant={config?.variant || "default"} className="flex items-center gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {config?.label || appointment.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {/* Data e horário */}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {formatDate(new Date(appointment.date), "dd/MM/yyyy")}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {formatDate(new Date(appointment.date), "HH:mm")} • {appointment.service.duration} min
                        </span>
                      </div>

                      {/* Barbeiro */}
                      <div className="flex items-center gap-2">
                        <Avatar 
                          src={appointment.barber.image || undefined}
                          name={appointment.barber.name}
                          size="sm"
                        />
                        <span>{appointment.barber.name}</span>
                      </div>
                    </div>

                    {/* Preço e promoções */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          R$ {totalPrice.toFixed(2)}
                        </span>
                        {appointment.appliedPromotion && (
                          <span className="text-muted-foreground line-through ml-1">
                            R$ {appointment.service.price.toNumber().toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      {appointment.appliedPromotion && (
                        <Badge variant="secondary" className="text-xs">
                          {appointment.appliedPromotion.name}
                        </Badge>
                      )}
                      
                      {appointment.voucher && (
                        <Badge variant="outline" className="text-xs">
                          Voucher: {appointment.voucher.code}
                        </Badge>
                      )}
                    </div>

                    {/* Notas */}
                    {appointment.notes && (
                      <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                        {appointment.notes}
                      </p>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {canCancelAppointment(appointment) && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelAppointment(appointment.id)}
                        disabled={loading}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Paginação (placeholder) */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="flex items-center justify-center py-4">
            <p className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages} • {totalCount} agendamentos
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
