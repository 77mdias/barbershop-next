"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangePasswordSchema, type ChangePasswordInput } from "@/schemas/profileSchemas";
import { changePassword } from "@/server/profileActions";
import { ArrowLeft, Lock, Save, Eye, EyeOff } from "lucide-react";
import { ChangePasswordSkeleton } from "@/components/profile/ProfileSkeleton";

/**
 * Página de Alteração de Senha
 */
export default function ChangePasswordPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showPasswords, setShowPasswords] = React.useState({
    current: false,
    new: false,
    confirm: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(ChangePasswordSchema),
  });

  // Redirect se não autenticado
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const toggleShowPassword = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const onSubmit = async (data: ChangePasswordInput) => {
    if (!user?.id) {
      toast.error("Usuário não encontrado");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await changePassword(data);

      if (result.success) {
        toast.success("Senha alterada com sucesso!");
        reset();
        router.back();
      } else {
        toast.error(result.error || "Erro ao alterar senha");
      }
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      toast.error("Erro inesperado ao alterar senha");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <ChangePasswordSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header com gradiente similar à página principal */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
        <div className="relative z-10">
          {/* Barra de Status */}
          <div className="flex justify-between items-center px-6 pt-12 pb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <span className="text-white font-semibold">Alterar Senha</span>
            <div className="w-10"></div>
          </div>

          {/* Info do Header */}
          <div className="flex flex-col items-center px-6 pb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/5 rounded-full flex items-center justify-center border-4 border-white/20 backdrop-blur-sm mb-4">
              <Lock className="h-8 w-8 text-white/70" />
            </div>
            <h1 className="text-white text-xl font-bold text-center">Segurança da Conta</h1>
            <p className="text-white/80 text-sm text-center">Mantenha sua conta segura</p>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 px-6 py-6">
        <div className="max-w-lg mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Seção Principal */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200/80 hover:border-blue-200 hover:shadow-md transition-all">
              <div className="space-y-6">
                {/* Senha Atual */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                    Senha Atual *
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      {...register("currentPassword")}
                      className="pr-12 border-2 border-gray-200 rounded-lg p-3 focus:border-blue-500 focus:ring-blue-500/20"
                      placeholder="Digite sua senha atual"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 hover:bg-gray-100"
                      onClick={() => toggleShowPassword("current")}
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-xs text-red-500">{errors.currentPassword.message}</p>
                  )}
                </div>

                {/* Nova Senha */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                    Nova Senha *
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      {...register("newPassword")}
                      className="pr-12 border-2 border-gray-200 rounded-lg p-3 focus:border-blue-500 focus:ring-blue-500/20"
                      placeholder="Digite sua nova senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 hover:bg-gray-100"
                      onClick={() => toggleShowPassword("new")}
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-xs text-red-500">{errors.newPassword.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    A senha deve ter pelo menos 6 caracteres.
                  </p>
                </div>

                {/* Confirmar Nova Senha */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirmar Nova Senha *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      {...register("confirmPassword")}
                      className="pr-12 border-2 border-gray-200 rounded-lg p-3 focus:border-blue-500 focus:ring-blue-500/20"
                      placeholder="Confirme sua nova senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 hover:bg-gray-100"
                      onClick={() => toggleShowPassword("confirm")}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="flex-1 border-2 border-gray-200 hover:border-gray-300"
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Alterando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Alterar Senha
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}