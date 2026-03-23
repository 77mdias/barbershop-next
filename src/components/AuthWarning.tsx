"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Clock, User, Lock } from 'lucide-react';

interface AuthWarningProps {
  /** Tempo em segundos para o redirecionamento automático */
  countdown?: number;
  /** Rota que o usuário tentou acessar */
  targetRoute?: string;
  /** URL para redirecionamento (padrão: /auth/signin) */
  redirectUrl?: string;
  /** Callback executado quando o countdown termina */
  onRedirect?: () => void;
  /** Permite cancelar o redirecionamento */
  allowCancel?: boolean;
}

export function AuthWarning({
  countdown = 10,
  targetRoute,
  redirectUrl = '/auth/signin',
  onRedirect,
  allowCancel = true
}: AuthWarningProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(countdown);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
      if (timeLeft <= 0) {
        // Executar redirecionamento
        onRedirect?.();
        router.push(redirectUrl);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(time => time - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isActive, redirectUrl, router, onRedirect]);

  const handleLoginNow = () => {
    setIsActive(false);
    router.push(redirectUrl);
  };

  const handleCancel = () => {
    setIsActive(false);
    router.back(); // Volta para a página anterior
  };

  const getRouteDisplayName = (route?: string) => {
    if (!route) return "esta área";
    
    const routeNames: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/profile': 'Perfil',
      '/scheduling': 'Agendamentos',
      '/admin': 'Área Administrativa',
      '/dashboard/appointments': 'Meus Agendamentos',
      '/dashboard/history': 'Histórico',
      '/dashboard/favorites': 'Favoritos'
    };
    
    return routeNames[route] || route;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface-card p-8 text-center">
        {/* Ícone e título */}
        <div className="space-y-3">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.1)] text-accent">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold italic text-foreground">
            Autenticação Necessária
          </h1>
        </div>

        {/* Mensagem principal */}
        <div className="mt-4 space-y-2">
          <p className="text-sm text-fg-muted">
            Para acessar <span className="font-semibold text-foreground">{getRouteDisplayName(targetRoute)}</span> você precisa estar autenticado.
          </p>
          <p className="text-sm text-fg-muted">
            Você será redirecionado para login automaticamente em:
          </p>
        </div>

        {/* Countdown */}
        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-1 p-4">
          <Clock className="h-5 w-5 text-accent" />
          <span className="text-2xl font-bold text-accent">
            {timeLeft}s
          </span>
        </div>

        {/* Ações */}
        <div className="mt-6 space-y-3">
          <Button
            onClick={handleLoginNow}
            className="gold-shimmer inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90"
          >
            <User className="h-4 w-4" />
            Fazer Login Agora
          </Button>

          {allowCancel && (
            <Button
              onClick={handleCancel}
              variant="outline"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
            >
              Voltar
            </Button>
          )}
        </div>

        {/* Informação adicional */}
        <div className="mt-6 border-t border-border pt-4">
          <p className="text-xs text-fg-muted">
            Não tem uma conta?{" "}
            <button
              onClick={() => router.push('/auth/signup')}
              className="text-accent underline transition-colors hover:text-accent/80"
            >
              Cadastre-se aqui
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}

export default AuthWarning;