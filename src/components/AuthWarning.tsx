"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, User, Lock } from 'lucide-react';

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
    <div className="w-full h-screen flex flex-col mt-16  items-center  justify-start p-4">
      <Card className="w-full mt-12 max-w-md shadow-xl border-0 bg-card backdrop-blur-sm">
        <CardContent className="p-6 text-center space-y-6">
          {/* Ícone e título */}
          <div className="space-y-3">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-text">
              Autenticação Necessária
            </h1>
          </div>

          {/* Mensagem principal */}
          <div className="space-y-2">
            <p className="text-foreground">
              Para acessar <span className="font-semibold text-text">{getRouteDisplayName(targetRoute)}</span> você precisa estar autenticado.
            </p>
            <p className="text-sm text-muted-foreground">
              Você será redirecionado para login automaticamente em:
            </p>
          </div>

          {/* Countdown */}
          <div className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-blue-700">
              {timeLeft}s
            </span>
          </div>

          {/* Ações */}
          <div className="space-y-3 pt-4">
            <Button 
              onClick={handleLoginNow}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              size="lg"
            >
              <User className="w-4 h-4 mr-2" />
              Fazer Login Agora
            </Button>
            
            {allowCancel && (
              <Button 
                onClick={handleCancel}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Voltar
              </Button>
            )}
          </div>

          {/* Informação adicional */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-muted-foreground">
              Não tem uma conta? 
              <button 
                onClick={() => router.push('/auth/signup')}
                className="ml-1 text-blue-600 hover:text-blue-700 underline"
              >
                Cadastre-se aqui
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AuthWarning;