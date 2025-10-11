"use client";

import { useState, useEffect } from "react";
import { Check, Clock, DollarSign, Scissors } from "lucide-react";
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
      <div className="grid gap-3">
        {services.map((service) => {
          const isSelected = selectedServiceId === service.id;
          
          return (
            <button
              key={service.id}
              onClick={() => onServiceSelect(service)}
              className={cn(
                "group relative rounded-xl p-4 text-left transition-all duration-300",
                "hover:shadow-md hover:shadow-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
                "transform hover:scale-[1.02] active:scale-[0.98]",
                isSelected
                  ? "border-2 border-primary bg-gradient-to-br from-primary/10 to-accent/5 shadow-lg shadow-primary/20"
                  : "border border-border bg-gradient-to-br from-card to-card/80 hover:border-primary/30 hover:from-primary/5 hover:to-accent/5"
              )}
            >
              {/* Indicador de seleção moderno */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 rounded-full bg-gradient-to-br from-primary to-accent p-1.5 shadow-lg">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}

              <div className="space-y-3">
                {/* Nome do serviço com estilo melhorado */}
                <div className="flex items-start justify-between">
                  <h4 className={cn(
                    "font-semibold text-base transition-colors duration-200",
                    isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
                  )}>
                    {service.name}
                  </h4>
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors duration-200",
                    isSelected ? "bg-primary/20" : "bg-muted/50 group-hover:bg-primary/10"
                  )}>
                    <Scissors className={cn(
                      "w-4 h-4 transition-colors duration-200",
                      isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                    )} />
                  </div>
                </div>

                {/* Descrição com melhor tipografia */}
                {service.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                )}

                {/* Duração e Preço com design melhorado */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded bg-muted/50">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">{service.duration} min</span>
                  </div>
                  
                  <div className={cn(
                    "flex items-center gap-1.5 font-semibold text-lg transition-colors duration-200",
                    isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
                  )}>
                    <span className="text-sm">R$</span>
                    <span>{Number(service.price).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Informação de confirmação elegante */}
      {selectedServiceId && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          <div className="rounded-xl bg-gradient-to-r from-success/10 to-accent/10 border border-success/20 p-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-success/20">
                <Check className="w-3 h-3 text-success" />
              </div>
              <p className="text-sm text-success font-medium">
                Serviço selecionado! Agora escolha o barbeiro.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}