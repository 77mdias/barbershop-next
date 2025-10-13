"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReviewForm } from '@/components/ReviewForm';
import { CheckCircle, Database, AlertCircle, Info } from 'lucide-react';

interface ReviewSystemManagerProps {
  userId: string;
}

export function ReviewSystemManager({ userId }: ReviewSystemManagerProps) {
  const [serviceHistoryId, setServiceHistoryId] = useState<string | null>(null);
  const [isCreatingTestData, setIsCreatingTestData] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasCheckedExisting, setHasCheckedExisting] = useState(false);

  // Verificar se já existe serviceHistory disponível
  useEffect(() => {
    checkExistingServiceHistory();
  }, []);

  const checkExistingServiceHistory = async () => {
    try {
      const response = await fetch('/api/test/create-review-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();
      
      if (result.success && result.data?.serviceHistoryId) {
        setServiceHistoryId(result.data.serviceHistoryId);
        setMessage("Você já possui um histórico de serviço disponível para avaliação!");
        setIsSuccess(true);
      }
    } catch (error) {
      console.log("Nenhum histórico encontrado, usuário precisará criar um.");
    } finally {
      setHasCheckedExisting(true);
    }
  };

  const createTestData = async () => {
    setIsCreatingTestData(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/test/create-review-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();
      
      if (result.success) {
        setServiceHistoryId(result.data.serviceHistoryId);
        setMessage(result.message);
        setIsSuccess(true);
      } else {
        setMessage(result.error || 'Erro ao criar dados de teste');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Erro:', error);
      setMessage('Erro de conexão com o servidor');
      setIsSuccess(false);
    } finally {
      setIsCreatingTestData(false);
    }
  };

  // Se ainda está verificando, mostra loading
  if (!hasCheckedExisting) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600">Verificando histórico de serviços...</span>
        </CardContent>
      </Card>
    );
  }

  // Se já tem serviceHistory, mostra direto o formulário
  if (serviceHistoryId) {
    return (
      <div className="space-y-6">
        {message && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <p className="font-medium">{message}</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Avaliar Serviço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewForm
              serviceHistoryId={serviceHistoryId}
              onSuccess={() => {
                setMessage('✅ Avaliação enviada com sucesso!');
                setServiceHistoryId(null); // Reset para permitir nova avaliação
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se não tem serviceHistory, mostra opção para criar
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          Sistema de Avaliações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Para fazer uma avaliação, você precisa ter um histórico de serviço concluído. 
            Como esta é uma demonstração, vamos criar um histórico de teste para você.
          </p>
        </div>
        
        <Button 
          onClick={createTestData}
          disabled={isCreatingTestData}
          className="w-full"
        >
          {isCreatingTestData ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Criando histórico de serviço...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Criar Histórico de Serviço para Demonstração
            </>
          )}
        </Button>

        {message && !isSuccess && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="font-medium text-red-800">{message}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}