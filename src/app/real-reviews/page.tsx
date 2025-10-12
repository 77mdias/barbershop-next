"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReviewForm } from '@/components/ReviewForm';
import { CheckCircle, Database, AlertCircle } from 'lucide-react';

export default function RealReviewSystem() {
  const [realServiceHistoryId, setRealServiceHistoryId] = useState<string | null>(null);
  const [isCreatingTestData, setIsCreatingTestData] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);

  const createTestData = async () => {
    setIsCreatingTestData(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/test/create-review-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setRealServiceHistoryId(result.data.serviceHistoryId);
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

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Sistema de Avaliações Real</h1>
          <p className="text-gray-600">
            Sistema completo com banco de dados funcionando
          </p>
        </div>

        {/* Criação de Dados de Teste */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              1. Criar Dados de Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Primeiro, vamos criar um histórico de serviço real no banco de dados para poder fazer uma avaliação verdadeira.
            </p>
            
            <Button 
              onClick={createTestData}
              disabled={isCreatingTestData || realServiceHistoryId !== null}
              className="w-full"
            >
              {isCreatingTestData ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando dados...
                </>
              ) : realServiceHistoryId ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Dados criados com sucesso!
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Criar Serviço, Agendamento e Histórico
                </>
              )}
            </Button>

            {message && (
              <div className={`p-4 rounded-lg ${isSuccess ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2">
                  {isSuccess ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <p className={`font-medium ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
                    {message}
                  </p>
                </div>
                {realServiceHistoryId && (
                  <p className="text-sm text-green-700 mt-2">
                    <strong>ServiceHistory ID:</strong> {realServiceHistoryId}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulário de Avaliação Real */}
        {realServiceHistoryId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                2. Fazer Avaliação Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-6">
                Agora você pode fazer uma avaliação real que será salva no banco de dados!
              </p>
              
              <ReviewForm
                serviceHistoryId={realServiceHistoryId}
                onSuccess={() => {
                  alert('✅ Avaliação salva com sucesso no banco de dados!');
                }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}