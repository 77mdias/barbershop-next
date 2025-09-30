"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LessonCategoryFormInput, LessonCategoryFormInputType } from "@/schemas/lessonCategory";
import { createLessonCategory, updateLessonCategory } from "@/server/lessonCategoryActions";
import { generateSlug } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface LessonCategoryFormProps {
  initialData?: Partial<LessonCategoryFormInputType> & { id?: string };
  onSuccess?: () => void;
}

export default function LessonCategoryForm({ initialData, onSuccess }: LessonCategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = !!initialData?.id;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LessonCategoryFormInputType>({
    resolver: zodResolver(LessonCategoryFormInput),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      icon: initialData?.icon || "",
      slug: initialData?.slug || "",
      level: initialData?.level || "INICIANTE",
    },
  });

  const watchedName = watch("name");
  const watchedLevel = watch("level");

  // Auto-gerar slug baseado no nome
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    setValue("name", name);
    
    if (!isEdit) {
      setValue("slug", generateSlug(name));
    }
  }

  async function onSubmit(data: LessonCategoryFormInputType) {
    setIsLoading(true);
    
    try {
      let result;
      
      if (isEdit) {
        result = await updateLessonCategory({ id: initialData!.id, ...data });
      } else {
        result = await createLessonCategory(data);
      }

      if (result.success) {
        toast.success(isEdit ? "Categoria atualizada com sucesso!" : "Categoria criada com sucesso!");
        onSuccess?.();
      } else {
        toast.error("Erro ao processar solicitação");
      }
    } catch (error) {
      toast.error("Erro inesperado ao processar solicitação");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            {...register("name")}
            onChange={handleNameChange}
            placeholder="Nome da categoria"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            {...register("slug")}
            placeholder="slug-da-categoria"
            disabled={isLoading}
          />
          {errors.slug && (
            <p className="text-sm text-red-500">{errors.slug.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Descrição da categoria..."
            disabled={isLoading}
            rows={3}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="icon">Ícone (URL ou nome)</Label>
          <Input
            id="icon"
            {...register("icon")}
            placeholder="BookOpen ou https://exemplo.com/icon.svg"
            disabled={isLoading}
          />
          {errors.icon && (
            <p className="text-sm text-red-500">{errors.icon.message}</p>
          )}
        </div>

        <div className="flex items-end space-y-2 gap-2">
          <Label htmlFor="level">Nível: </Label>
          <select
            id="level"
            {...register("level")}
            disabled={isLoading}
            className="input px-2 text-black"
          >
            <option value="INICIANTE">Iniciante</option>
            <option value="INTERMEDIARIO">Intermediário</option>
            <option value="AVANCADO">Avançado</option>
            <option value="IMORTAL">Imortal</option>
          </select>
          {errors.level && (
            <p className="text-sm text-red-500">{errors.level.message}</p>
          )}
        </div>
      </div>

      <div className="flex p-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? "Salvando..." : (isEdit ? "Atualizar" : "Criar")}
        </Button>
      </div>
    </form>
  );
}