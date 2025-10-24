"use client";

import React, { useState } from 'react';
import { ReviewForm } from '@/components/ReviewForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestReviewPage() {
  const [serviceHistoryId, setServiceHistoryId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<string>('');

  const createTestData = async () => {
    setIsCreating(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/test/create-review-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const result = await response.json();
      
      if (result.success && result.data?.serviceHistoryId) {
        setServiceHistoryId(result.data.serviceHistoryId);
        setMessage(`✅ ServiceHistory criado: ${result.data.serviceHistoryId}`);
      } else {
        setMessage(`❌ Erro: ${result.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      setMessage(`❌ Erro na requisição: ${error}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleReviewSuccess = () => {
    setMessage('🎉 Avaliação criada com sucesso!');
    setServiceHistoryId(null); // Reset para permitir nova avaliação
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">🧪 Teste do Sistema de Reviews</h1>
      
      {message && (
        <div className="mb-6 p-4 rounded-lg bg-gray-100 border">
          <p>{message}</p>
        </div>
      )}

      {!serviceHistoryId ? (
        <Card>
          <CardHeader>
            <CardTitle>Criar Dados de Teste</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Primeiro, vamos criar um ServiceHistory para que você possa fazer uma avaliação.
            </p>
            <Button 
              onClick={createTestData} 
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? 'Criando...' : 'Criar Dados de Teste'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Criar Avaliação com Imagens</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewForm
              serviceHistoryId={serviceHistoryId}
              onSuccess={handleReviewSuccess}
            />
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Instruções</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>1. <strong>Criar dados de teste</strong> - Cria um ServiceHistory disponível para avaliação</p>
          <p>2. <strong>Fazer upload de imagens</strong> - Use o componente de upload para adicionar fotos</p>
          <p>3. <strong>Preencher avaliação</strong> - Adicione rating e comentário</p>
          <p>4. <strong>Submeter</strong> - As imagens devem ser salvas no banco junto com a avaliação</p>
          <p>5. <strong>Verificar no Prisma Studio</strong> - Abra o banco para confirmar que as URLs estão salvas</p>
        </CardContent>
      </Card>
    </div>
  );
}