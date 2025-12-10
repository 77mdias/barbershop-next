"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateServiceSchema,
  type CreateServiceInput,
} from "@/schemas/serviceSchemas";
import { createService, updateService } from "@/server/serviceAdminActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ServiceFormProps {
  initialData?: Partial<CreateServiceInput> & { id?: string };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ServiceForm({
  initialData,
  onSuccess,
  onCancel,
}: ServiceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = !!initialData?.id;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreateServiceSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      duration: initialData?.duration || 30,
      price: initialData?.price || 0,
      active: initialData?.active ?? true,
    },
  });

  const watchedActive = watch("active");

  async function onSubmit(data: any) {
    setIsLoading(true);

    try {
      let result;

      if (isEdit) {
        if (!initialData?.id) {
          toast.error("ID do serviço não encontrado para edição");
          return;
        }
        result = await updateService(initialData.id, data);
      } else {
        result = await createService(data);
      }

      if (result.success) {
        toast.success(
          result.message ||
            (isEdit
              ? "Serviço atualizado com sucesso!"
              : "Serviço criado com sucesso!")
        );
        onSuccess?.();
      } else {
        toast.error(result.error || "Erro ao processar solicitação");
      }
    } catch (error) {
      console.error("Erro ao processar serviço:", error);
      toast.error("Erro inesperado ao processar solicitação");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Nome do Serviço <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Ex: Corte de Cabelo"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Descreva o serviço..."
            disabled={isLoading}
            rows={3}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        {/* Duração e Preço */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration">
              Duração (minutos) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="duration"
              type="number"
              {...register("duration", { valueAsNumber: true })}
              placeholder="30"
              disabled={isLoading}
              min={15}
              max={480}
            />
            {errors.duration && (
              <p className="text-sm text-red-500">{errors.duration.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">
              Preço (R$) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register("price", { valueAsNumber: true })}
              placeholder="50.00"
              disabled={isLoading}
              min={0.01}
              max={9999.99}
            />
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price.message}</p>
            )}
          </div>
        </div>

        {/* Status Ativo */}
        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={watchedActive}
            onCheckedChange={(checked: boolean) => setValue("active", checked)}
            disabled={isLoading}
          />
          <Label htmlFor="active" className="cursor-pointer">
            Serviço ativo
          </Label>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isLoading} className="min-w-[120px]">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Salvando..." : isEdit ? "Atualizar" : "Criar"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
