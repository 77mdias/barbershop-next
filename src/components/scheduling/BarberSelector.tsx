"use client";

import { useState, useEffect } from "react";
import { Check, Star, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Barber {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BarberSelectorProps {
  selectedBarberId?: string;
  onBarberSelect: (barber: Barber) => void;
  className?: string;
}

/**
 * Componente para selecionar barbeiro
 * 
 * Exibe cards com informações dos barbeiros: foto, nome, avaliação.
 * Permite seleção única seguindo o design system da aplicação.
 */
export function BarberSelector({
  selectedBarberId,
  onBarberSelect,
  className,
}: BarberSelectorProps) {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBarbers() {
      try {
        setLoading(true);
        // Mock data - substituir pela chamada real da API
        const mockBarbers: Barber[] = [
          {
            id: "1",
            name: "João Silva",
            email: "joao@barbershop.com",
            image: null,
            role: "BARBER",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "2", 
            name: "Pedro Santos",
            email: "pedro@barbershop.com",
            image: null,
            role: "BARBER",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "3",
            name: "Carlos Lima",
            email: "carlos@barbershop.com", 
            image: null,
            role: "BARBER",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        setBarbers(mockBarbers);
      } catch (err) {
        setError("Erro ao carregar barbeiros");
      } finally {
        setLoading(false);
      }
    }

    loadBarbers();
  }, []);

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <h3 className="text-lg font-semibold text-foreground">Selecione o Barbeiro</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
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

  if (barbers.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-muted-foreground">Nenhum barbeiro disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold text-foreground">Selecione o Barbeiro</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {barbers.map((barber) => {
          const isSelected = selectedBarberId === barber.id;
          
          return (
            <button
              key={barber.id}
              onClick={() => onBarberSelect(barber)}
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
                {/* Informações do barbeiro */}
                <div className="flex items-center gap-3">
                  <Avatar 
                    src={barber.image || undefined}
                    name={barber.name || "Barbeiro"}
                    size="lg"
                    className="ring-2 ring-transparent transition-all group-hover:ring-primary/20"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      "font-medium transition-colors truncate",
                      isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
                    )}>
                      {barber.name || "Barbeiro"}
                    </h4>
                    
                    {/* Badge de status */}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="secondary" 
                        className="text-xs px-2 py-0.5"
                      >
                        Disponível
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Avaliação e experiência (mock) */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-medium">4.8</span>
                    <span className="text-muted-foreground">(125)</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>5+ anos</span>
                  </div>
                </div>

                {/* Especialidades (mock) */}
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    Corte Clássico
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Barba
                  </Badge>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Informação adicional */}
      {selectedBarberId && (
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-sm text-muted-foreground">
            ✓ Barbeiro selecionado. Agora escolha a data e horário.
          </p>
        </div>
      )}
    </div>
  );
}