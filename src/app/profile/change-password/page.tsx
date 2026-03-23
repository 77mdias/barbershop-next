"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangePasswordSchema, type ChangePasswordInput } from "@/schemas/profileSchemas";
import { changePassword } from "@/server/profileActions";
import { Lock, Save, Eye, EyeOff, Loader2 } from "lucide-react";
import { ChangePasswordSkeleton } from "@/components/profile/ProfileSkeleton";
import { PageHero } from "@/components/shared/PageHero";

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

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const toggleShowPassword = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
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
    <div className="mb-16 min-h-screen flex-col bg-background">
      <PageHero
        badge="Segurança"
        title="Alterar Senha"
        subtitle="Mantenha sua conta segura com uma senha forte"
        actions={[{ label: "Voltar", href: "/profile/settings", variant: "outline" }]}
      />

      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Icon info card */}
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-border bg-surface-card p-5">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-accent">
            <Lock className="h-6 w-6" />
          </span>
          <div>
            <h2 className="font-semibold text-foreground">Segurança da Conta</h2>
            <p className="text-sm text-fg-muted">
              Sua senha deve ter pelo menos 6 caracteres
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-border bg-surface-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
            {/* Senha Atual */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-medium text-foreground">
                Senha Atual
              </Label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  {...register("currentPassword")}
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 pr-12 text-sm text-foreground placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/0.18)]"
                  placeholder="Digite sua senha atual"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword("current")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted transition-colors hover:text-foreground"
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
              )}
            </div>

            {/* Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium text-foreground">
                Nova Senha
              </Label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  {...register("newPassword")}
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 pr-12 text-sm text-foreground placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/0.18)]"
                  placeholder="Digite sua nova senha"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword("new")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted transition-colors hover:text-foreground"
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-destructive">{errors.newPassword.message}</p>
              )}
              <p className="text-xs text-fg-subtle">A senha deve ter pelo menos 6 caracteres.</p>
            </div>

            {/* Confirmar Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirmar Nova Senha
              </Label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  {...register("confirmPassword")}
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 pr-12 text-sm text-foreground placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/0.18)]"
                  placeholder="Confirme sua nova senha"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword("confirm")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted transition-colors hover:text-foreground"
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="gold-shimmer flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Alterando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Alterar Senha
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
