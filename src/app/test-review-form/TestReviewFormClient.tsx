"use client";

import { ReviewForm } from "@/components/ReviewForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TestReviewFormClientProps {
  session: any;
  serviceHistoriesWithoutReview: any[];
  serviceHistoriesWithReview: any[];
}

export default function TestReviewFormClient({
  session,
  serviceHistoriesWithoutReview,
  serviceHistoriesWithReview
}: TestReviewFormClientProps) {
  
  const handleSuccess = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen mt-12 bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📝 Teste de Formulário de Avaliação
          </h1>
          <p className="text-gray-600">
            Testando com dados reais do ServiceHistory do usuário {session.user?.name}
          </p>
        </div>

        {/* Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Serviços Sem Avaliação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">{serviceHistoriesWithoutReview.length}</p>
              <p className="text-sm text-gray-500">Disponíveis para avaliar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Serviços Já Avaliados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{serviceHistoriesWithReview.length}</p>
              <p className="text-sm text-gray-500">Podem ser editados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-bold">{session.user?.name}</p>
              <p className="text-sm text-gray-500">{session.user?.role}</p>
            </CardContent>
          </Card>
        </div>

        {/* Formulário para Criar Nova Avaliação */}
        {serviceHistoriesWithoutReview.length > 0 ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>✨ Criar Nova Avaliação</CardTitle>
              <p className="text-sm text-gray-600">
                Avaliando: {serviceHistoriesWithoutReview[0].service.name} - 
                Concluído em {new Date(serviceHistoriesWithoutReview[0].completedAt).toLocaleDateString('pt-BR')}
              </p>
            </CardHeader>
            <CardContent>
              <ReviewForm
                serviceHistoryId={serviceHistoriesWithoutReview[0].id}
                onSuccess={handleSuccess}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>⚠️ Nenhum Serviço Disponível para Avaliação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Todos os seus serviços já foram avaliados ou não há histórico de serviços.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Para testar:</strong> Acesse <a href="/test-system" className="underline">/test-system</a> para criar um ServiceHistory sem avaliação.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulário para Editar Avaliação Existente */}
        {serviceHistoriesWithReview.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>✏️ Editar Avaliação Existente</CardTitle>
              <p className="text-sm text-gray-600">
                Editando: {serviceHistoriesWithReview[0].service.name} - 
                Avaliação atual: {serviceHistoriesWithReview[0].rating}/5 ⭐
              </p>
            </CardHeader>
            <CardContent>
              <ReviewForm
                serviceHistoryId={serviceHistoriesWithReview[0].id}
                existingReview={{
                  id: serviceHistoriesWithReview[0].id,
                  rating: serviceHistoriesWithReview[0].rating || 5,
                  feedback: serviceHistoriesWithReview[0].feedback || "",
                  images: serviceHistoriesWithReview[0].images || []
                }}
                onSuccess={handleSuccess}
              />
            </CardContent>
          </Card>
        )}

        {/* Debug Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🔍 Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">ServiceHistory Sem Avaliação:</h3>
                <div className="bg-gray-100 p-3 rounded text-xs">
                  <pre>{JSON.stringify(serviceHistoriesWithoutReview.map(sh => ({
                    id: sh.id,
                    service: sh.service.name,
                    completedAt: sh.completedAt,
                    rating: sh.rating
                  })), null, 2)}</pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">ServiceHistory Com Avaliação:</h3>
                <div className="bg-gray-100 p-3 rounded text-xs">
                  <pre>{JSON.stringify(serviceHistoriesWithReview.map(sh => ({
                    id: sh.id,
                    service: sh.service.name,
                    rating: sh.rating,
                    feedback: sh.feedback
                  })), null, 2)}</pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}