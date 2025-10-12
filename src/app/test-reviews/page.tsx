"use client";

import { useState, useEffect } from 'react';
import { ReviewForm } from '@/components/ReviewForm';
import { ReviewsList } from '@/components/ReviewsList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { getReviews, createReview } from '@/server/reviewActions';

export default function TestReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Simular dados para teste
  const mockServiceHistoryId = "test-service-history-id";

  const loadReviews = async () => {
    setLoading(true);
    try {
      const result = await getReviews();
      if (result.success) {
        setReviews(result.data?.reviews || []);
      }
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestData = async () => {
    try {
      // Tentar criar uma avaliação de teste
      const result = await createReview({
        serviceHistoryId: mockServiceHistoryId,
        rating: 5,
        feedback: "Avaliação de teste criada automaticamente",
        images: []
      });
      
      console.log('Resultado da criação:', result);
      
      if (result.success) {
        alert('Dados de teste criados com sucesso!');
        loadReviews();
      } else {
        alert('Erro ao criar dados de teste: ' + result.error);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao criar dados de teste');
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  return (
    <div className="min-h-screen mt-12 bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Teste do Sistema de Avaliações
          </h1>
          <p className="text-gray-600 mb-4">
            Esta página testa todas as funcionalidades de avaliação do sistema.
          </p>
          
          <div className="flex gap-4 justify-center mb-6">
            <Button onClick={loadReviews} disabled={loading}>
              {loading ? 'Carregando...' : 'Recarregar Avaliações'}
            </Button>
            <Button onClick={handleCreateTestData} variant="outline">
              Criar Dados de Teste
            </Button>
          </div>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">Lista de Avaliações</TabsTrigger>
            <TabsTrigger value="form">Formulário de Avaliação</TabsTrigger>
            <TabsTrigger value="debug">Debug/Info</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>📋 Lista de Avaliações</CardTitle>
              </CardHeader>
              <CardContent>
                <ReviewsList 
                  showActions={true}
                  showStats={true}
                  limit={10}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="form" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>✍️ Formulário de Avaliação</CardTitle>
              </CardHeader>
              <CardContent>
                <ReviewForm
                  serviceHistoryId={mockServiceHistoryId}
                  onSuccess={() => {
                    alert('Avaliação criada com sucesso!');
                    loadReviews();
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="debug" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🔍 Informações de Debug</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Status dos Componentes:</h3>
                  <ul className="space-y-1 text-sm">
                    <li>✅ ReviewForm - Carregado</li>
                    <li>✅ ReviewsList - Carregado</li>
                    <li>✅ Server Actions - Importados</li>
                    <li>✅ Upload de Imagens - Disponível</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Dados Carregados:</h3>
                  <p className="text-sm">
                    Total de avaliações: <span className="font-mono">{reviews.length}</span>
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Links para Teste:</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <a href="/reviews" className="text-blue-600 hover:underline">
                        /reviews - Página principal de avaliações
                      </a>
                    </div>
                    <div>
                      <a href="/test-upload" className="text-blue-600 hover:underline">
                        /test-upload - Teste de upload de imagens
                      </a>
                    </div>
                    <div>
                      <a href="/client-review-demo" className="text-blue-600 hover:underline">
                        /client-review-demo - Demo do componente ClientReview
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Para funcionar completamente, você precisa estar logado no sistema.
                    Use as credenciais: <code>carlos@email.com / cliente123</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}