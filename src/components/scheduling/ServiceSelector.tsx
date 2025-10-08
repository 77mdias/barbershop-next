"use client";

import { useState, useEffect } from "react";
import { Check, Clock, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { getServices } from "@/server/serviceActions";
import { Decimal } from "@prisma/client/runtime/library";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ServiceSelectorProps {
  selectedServiceId?: string;
  onServiceSelect: (service: Service) => void;
  className?: string;
}

/**
 * Componente para selecionar serviços disponíveis
 * 
 * Exibe cards com informações dos serviços: nome, descrição, duração e preço.
 * Permite seleção única seguindo o design system da aplicação.
 */
export function ServiceSelector({
  selectedServiceId,
  onServiceSelect,
  className,
}: ServiceSelectorProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);
        const result = await getServices({ 
          page: 1, 
          limit: 50, 
          active: true 
        });
        
        if (result.success && result.data) {
          setServices(result.data.services);
        } else {
          setError(result.error || "Erro ao carregar serviços");
        }
      } catch (err) {
        setError("Erro ao carregar serviços");
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, []);

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <h3 className="text-lg font-semibold text-foreground">Selecione o Serviço</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <div className="h-5 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-3/4" />
                <div className="flex justify-between">
                  <div className="h-4 bg-muted rounded w-16" />
                  <div className="h-4 bg-muted rounded w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-muted-foreground">Nenhum serviço disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold text-foreground">Selecione o Serviço</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const isSelected = selectedServiceId === service.id;
          
          return (
            <button
              key={service.id}
              onClick={() => onServiceSelect(service)}
              className={cn(
                "group relative rounded-lg border p-4 text-left transition-all duration-200",
                "hover:shadow-md hover:border-primary/50",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:bg-accent/50"
              )}
            >
              {/* Indicador de seleção */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 rounded-full bg-primary p-1">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}

              <div className="space-y-3">
                {/* Nome do serviço */}
                <h4 className={cn(
                  "font-medium transition-colors",
                  isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
                )}>
                  {service.name}
                </h4>

                {/* Descrição */}
                {service.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                )}

                {/* Duração e Preço */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{service.duration} min</span>
                  </div>
                  
                  <div className={cn(
                    "flex items-center gap-1 font-medium",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    <DollarSign className="h-4 w-4" />
                    <span>R$ {Number(service.price).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Informação adicional */}
      {selectedServiceId && (
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-sm text-muted-foreground">
            ✓ Serviço selecionado. Agora escolha o barbeiro e horário.
          </p>
        </div>
      )}
    </div>
  );
}