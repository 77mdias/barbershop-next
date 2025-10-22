"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfile } from "@/server/profileActions";
import { ProfileSettingsSchema, type ProfileSettingsInput } from "@/schemas/profileSchemas";
import { useSession, signIn } from "next-auth/react";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  Camera, 
  User, 
  Phone, 
  Mail, 
  Edit3,
  Loader2
} from "lucide-react";

/**
 * Página de Configurações do Perfil - Design Minimalista
 * 
 * Permite ao usuário editar suas informações pessoais:
 * - Nome e apelido
 * - Email e telefone  
 * - Foto de perfil (com upload funcional)
 */
export default function ProfileSettings() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { update } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const [currentImage, setCurrentImage] = React.useState<string | null>(null);

  // Estado local para a imagem atual
  React.useEffect(() => {
    if (user?.image) {
      setCurrentImage(user.image);
    }
  }, [user?.image]);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<ProfileSettingsInput>({
    resolver: zodResolver(ProfileSettingsSchema),
    defaultValues: {
      name: "",
      nickname: "",
      phone: "",
      email: "",
    },
  });

  // Preencher formulário quando usuário carregar
  React.useEffect(() => {
    if (user) {
      setValue("name", user.name || "");
      setValue("nickname", user.nickname || "");
      setValue("phone", user.phone || "");
      setValue("email", user.email || "");
    }
  }, [user, setValue]);

  // Redirect se não autenticado
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = async (data: ProfileSettingsInput) => {
    console.log("Form submitted with data:", data); // Debug
    console.log("User ID:", user?.id); // Debug
    
    if (!user?.id) {
      toast.error("Usuário não encontrado");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await updateProfile({
        id: user.id,
        ...data,
      });

      console.log("Update result:", result); // Debug

      if (result.success) {
        toast.success("Perfil atualizado com sucesso!");
        
        // Força atualização da sessão através de re-autenticação silenciosa
        try {
          await update(); // Tenta atualizar primeiro
          
          // Se isso não funcionar, força reload completo
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } catch (error) {
          console.error("Erro ao atualizar sessão:", error);
          window.location.reload();
        }
        
      } else {
        toast.error(result.error || "Erro ao atualizar perfil");
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro inesperado ao atualizar perfil");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast.error("Apenas imagens são permitidas");
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
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

      console.log("Upload result:", result); // Debug

      if (response.ok && result.success) {
        toast.success("Foto de perfil atualizada!");
        
        console.log("Upload bem-sucedido, nova imagem URL:", result.file.url); // Debug
        
        // Atualizar a imagem localmente primeiro para feedback imediato
        setCurrentImage(result.file.url);
        
        // Atualizar sessão e recarregar
        try {
          await update();
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } catch (error) {
          console.error("Erro ao atualizar sessão:", error);
          window.location.reload();
        }
        
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

  if (isLoading) {
    return (
      <div className="min-h-screen mt-20 flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen mt-20 mb-8 min-w-full flex flex-col  bg-gray-50">
      {/* Header simples e moderno */}
      <div className=" border-b w-full">
        <div className="flex items-center justify-between px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Configurações</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className=" py-6 px-4 max-w-2xl ">
        {/* Avatar Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {currentImage || user.image ? (
                  <img 
                    src={currentImage || user.image} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback se a imagem não carregar
                      console.log("Erro ao carregar imagem:", currentImage || user.image);
                      setCurrentImage(null);
                    }}
                  />
                ) : (
                  <User className="h-10 w-10 text-gray-400" />
                )}
              </div>
              
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="avatar-upload"
                disabled={isUploadingImage}
              />
              <Label 
                htmlFor="avatar-upload" 
                className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer shadow-lg transition-colors disabled:opacity-50"
              >
                {isUploadingImage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Label>
            </div>
            
            <div className="text-center">
              <h2 className="font-semibold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            
            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-400" />
                Nome Completo
              </Label>
              <Input
                id="name"
                type="text"
                {...register("name")}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                placeholder="Digite seu nome completo"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Apelido */}
            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-sm font-medium text-gray-700 flex items-center">
                <Edit3 className="h-4 w-4 mr-2 text-gray-400" />
                Apelido
              </Label>
              <Input
                id="nickname"
                type="text"
                {...register("nickname")}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                placeholder="Como gosta de ser chamado?"
              />
              {errors.nickname && (
                <p className="text-xs text-red-500">{errors.nickname.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                Telefone
              </Label>
              <Input
                id="phone"
                type="tel"
                {...register("phone")}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                placeholder="(11) 99999-9999"
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                onClick={() => console.log("Button clicked, isDirty:", isDirty, "errors:", errors)} // Debug
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}