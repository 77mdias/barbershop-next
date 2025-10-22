"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/UserAvatar";
import { Camera, Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileSettingsSchema, type ProfileSettingsInput } from "@/schemas/profileSchemas";
import { updateProfile } from "@/server/profileActions";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface User {
  id: string;
  name?: string;
  nickname?: string;
  email: string;
  phone?: string;
  image?: string;
}

interface EditProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function EditProfileModal({ user, isOpen, onClose, onUpdate }: EditProfileModalProps) {
  const { update } = useSession();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const [currentImage, setCurrentImage] = React.useState<string | null>(user.image || null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    reset,
  } = useForm<ProfileSettingsInput>({
    resolver: zodResolver(ProfileSettingsSchema),
    defaultValues: {
      name: user.name || "",
      nickname: user.nickname || "",
      phone: user.phone || "",
      email: user.email || "",
    },
  });

  // Reset form when user changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: user.name || "",
        nickname: user.nickname || "",
        phone: user.phone || "",
        email: user.email || "",
      });
      setCurrentImage(user.image || null);
    }
  }, [user, isOpen, reset]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Apenas imagens são permitidas");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Imagem muito grande. Máximo 5MB");
      return;
    }

    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/profile", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setCurrentImage(result.file.url);
        toast.success("Imagem atualizada com sucesso!");
      } else {
        toast.error(result.error || "Erro ao fazer upload da imagem");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao fazer upload da imagem");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = async (data: ProfileSettingsInput) => {
    setIsSubmitting(true);

    try {
      const result = await updateProfile({
        ...data,
        id: user.id,
      });

      if (result.success) {
        toast.success("Perfil atualizado com sucesso!");
        
        // Atualizar sessão
        try {
          await update();
        } catch (error) {
          console.error("Erro ao atualizar sessão:", error);
        }
        
        onUpdate?.();
        onClose();
      } else {
        toast.error(result.error || "Erro ao atualizar perfil");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao atualizar perfil");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Editar Perfil
            
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <UserAvatar
                src={currentImage}
                name={user.name}
                email={user.email}
                size="xl"
                className="w-20 h-20"
              />
              
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="modal-avatar-upload"
                disabled={isUploadingImage}
              />
              <Label 
                htmlFor="modal-avatar-upload" 
                className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer shadow-lg transition-colors"
              >
                {isUploadingImage ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Camera className="h-3 w-3" />
                )}
              </Label>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Clique no ícone para alterar sua foto
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Seu nome completo"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="nickname">Apelido</Label>
              <Input
                id="nickname"
                {...register("nickname")}
                placeholder="Como prefere ser chamado"
              />
              {errors.nickname && (
                <p className="text-sm text-red-500 mt-1">{errors.nickname.message}</p>
              )}
            </div>

            

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="(11) 99999-9999"
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isDirty || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}