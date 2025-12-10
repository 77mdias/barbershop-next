"use client";

import { useEffect, useMemo, useState } from "react";
import { type FieldErrors, type SubmitHandler, type Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CreatePromotionSchema,
  type CreatePromotionInput,
  type PromotionType,
} from "@/schemas/promotionSchemas";
import {
  createPromotion,
  updatePromotion,
} from "@/server/promotionAdminActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Tag, Percent } from "lucide-react";

type PromotionFormValues = z.infer<typeof CreatePromotionSchema>;

type ServiceOption = {
  id: string;
  name: string;
  active: boolean;
};

interface PromotionFormProps {
  initialData?: Partial<CreatePromotionInput> & { id?: string };
  availableServices: ServiceOption[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

const promotionTypeLabels: Record<PromotionType, string> = {
  DISCOUNT_PERCENTAGE: "% Desconto",
  DISCOUNT_FIXED: "Desconto Fixo",
  FREE_SERVICE: "Serviço Grátis",
  CASHBACK: "Cashback",
  LOYALTY_BONUS: "Bônus Fidelidade",
};

const coerceDate = (value: unknown): Date | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }
  return undefined;
};

export default function PromotionForm({
  initialData,
  availableServices,
  onSuccess,
  onCancel,
}: PromotionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = !!initialData?.id;

  const defaultValidFrom = coerceDate(initialData?.validFrom) ?? new Date();
  const defaultValidUntil = coerceDate(initialData?.validUntil);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PromotionFormValues>({
    resolver: zodResolver(CreatePromotionSchema) as Resolver<PromotionFormValues>,
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      type: initialData?.type || "DISCOUNT_PERCENTAGE",
      value: initialData?.value || 10,
      validFrom: defaultValidFrom,
      validUntil: defaultValidUntil,
      isGlobal: initialData?.isGlobal ?? true,
      minFrequency: initialData?.minFrequency,
      active: initialData?.active ?? true,
      serviceIds: initialData?.serviceIds || [],
      userIds: initialData?.userIds || [],
    },
  });

  const watchedType = watch("type");
  const watchedIsGlobal = watch("isGlobal");
  const selectedServiceIds = watch("serviceIds") || [];

  useEffect(() => {
    if (watchedIsGlobal) {
      setValue("serviceIds", []);
    }
  }, [watchedIsGlobal, setValue]);

  const toggleServiceSelection = (serviceId: string) => {
    const current = watch("serviceIds") || [];
    const next = current.includes(serviceId)
      ? current.filter((id) => id !== serviceId)
      : [...current, serviceId];
    setValue("serviceIds", next, { shouldValidate: true });
  };

  const availableServiceCount = useMemo(
    () => availableServices.length,
    [availableServices],
  );

  const sanitizePayload = (data: CreatePromotionInput): CreatePromotionInput => {
    const validFrom = coerceDate(data.validFrom);
    const validUntil = coerceDate(data.validUntil);

    const sanitized: CreatePromotionInput = {
      ...data,
      validFrom: validFrom ?? new Date(),
      validUntil,
      serviceIds: data.serviceIds?.filter(Boolean) || [],
      minFrequency:
        data.minFrequency !== undefined && !Number.isNaN(data.minFrequency)
          ? data.minFrequency
          : undefined,
    };
    return sanitized;
  };

  const onSubmit: SubmitHandler<PromotionFormValues> = async (rawData) => {
    setIsLoading(true);

    try {
      const payload = sanitizePayload(rawData);

      let result;

      if (isEdit) {
        if (!initialData?.id) {
          toast.error("ID da promoção não encontrado para edição");
          return;
        }
        result = await updatePromotion(initialData.id, payload);
      } else {
        result = await createPromotion(payload);
      }

      if (result.success) {
        toast.success(
          result.message ||
            (isEdit
              ? "Promoção atualizada com sucesso!"
              : "Promoção criada com sucesso!"),
        );
        onSuccess?.();
      } else {
        toast.error(result.error || "Erro ao processar promoção");
      }
    } catch (error) {
      console.error("Erro ao processar promoção:", error);
      toast.error("Erro inesperado ao processar promoção");
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidationError = (formErrors: FieldErrors<PromotionFormValues>) => {
    console.error("Erros de validação no formulário de promoção:", formErrors);
    toast.error("Revise os campos obrigatórios da promoção");
  };

  const renderServiceSelector = () => {
    if (watchedIsGlobal) {
      return (
        <div className="rounded-md border border-dashed border-gray-200 p-4 text-sm text-gray-600">
          Promoção global: aplicada para todos os serviços.
        </div>
      );
    }

    if (!availableServiceCount) {
      return (
        <div className="rounded-md border border-dashed border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Nenhum serviço disponível para vincular. Cadastre serviços antes de criar uma promoção específica.
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-600">Selecione os serviços elegíveis</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {availableServices.map((service) => {
            const checked = selectedServiceIds.includes(service.id);
            return (
              <label
                key={service.id}
                className="flex items-start gap-3 rounded-md border p-3 hover:border-gray-300 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500"
                  checked={checked}
                  onChange={() => toggleServiceSelection(service.id)}
                  disabled={isLoading}
                />
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{service.name}</span>
                  <span className="text-xs text-gray-500 flex items-center gap-2">
                    <Badge variant={service.active ? "default" : "secondary"}>
                      {service.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </span>
                </div>
              </label>
            );
          })}
        </div>
        {errors.serviceIds && (
          <p className="text-sm text-red-500">{errors.serviceIds.message as string}</p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, handleValidationError)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            Nome da Promoção <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Ex: Semana do Cliente 20% OFF"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Detalhes sobre a promoção..."
            disabled={isLoading}
            rows={3}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Tipo <span className="text-red-500">*</span></Label>
            <Select
              disabled={isLoading}
              value={watchedType}
              onValueChange={(value) => setValue("type", value as PromotionType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(promotionTypeLabels) as PromotionType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {promotionTypeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">
              Valor <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="value"
                type="number"
                step="0.01"
                min={0.01}
                {...register("value", { valueAsNumber: true })}
                placeholder="Ex: 20"
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                {watchedType === "DISCOUNT_PERCENTAGE" ? <Percent className="h-4 w-4" /> : <Tag className="h-4 w-4" />}
              </div>
            </div>
            {errors.value && (
              <p className="text-sm text-red-500">{errors.value.message}</p>
            )}
            {watchedType === "DISCOUNT_PERCENTAGE" && (
              <p className="text-xs text-gray-500">Use valores entre 0 e 100 para descontos percentuais.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="minFrequency">Frequência mínima (opcional)</Label>
            <Input
              id="minFrequency"
              type="number"
              min={1}
              {...register("minFrequency", { valueAsNumber: true })}
              placeholder="Ex: 3"
              disabled={isLoading}
            />
            {errors.minFrequency && (
              <p className="text-sm text-red-500">{errors.minFrequency.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="validFrom">
              Início <span className="text-red-500">*</span>
            </Label>
            <Input
              id="validFrom"
              type="date"
              {...register("validFrom", { valueAsDate: true })}
              disabled={isLoading}
            />
            {errors.validFrom && (
              <p className="text-sm text-red-500">{errors.validFrom.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="validUntil">Término (opcional)</Label>
            <Input
              id="validUntil"
              type="date"
              {...register("validUntil", { valueAsDate: true })}
              disabled={isLoading}
            />
            {errors.validUntil && (
              <p className="text-sm text-red-500">{errors.validUntil.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="isGlobal"
              checked={watchedIsGlobal}
              onCheckedChange={(checked: boolean) => setValue("isGlobal", checked)}
              disabled={isLoading}
            />
            <Label htmlFor="isGlobal" className="cursor-pointer">
              Promoção global (todos os serviços)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={watch("active")}
              onCheckedChange={(checked: boolean) => setValue("active", checked)}
              disabled={isLoading}
            />
            <Label htmlFor="active" className="cursor-pointer">
              Promoção ativa
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Serviços vinculados {watchedIsGlobal ? "(não necessário)" : ""}</Label>
          {renderServiceSelector()}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isLoading} className="min-w-[140px]">
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