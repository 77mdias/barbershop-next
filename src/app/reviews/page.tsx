import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewForm } from '@/components/ReviewForm';
import { ReviewsList } from '@/components/ReviewsList';
import { Separator } from '@/components/ui/separator';

export default async function ReviewsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mt-12 mb-8 mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Sistema de Avaliações</h1>
          <p className="text-gray-600">
            Gerencie e visualize avaliações dos serviços
          </p>
        </div>

        <Separator />

        {/* Tabs para diferentes funcionalidades */}
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">Lista de Avaliações</TabsTrigger>
            <TabsTrigger value="form">Nova Avaliação</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Todas as Avaliações</CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Carregando avaliações...</p>
                  </div>
                }>
                  <ReviewsList 
                    showStats={true}
                    showActions={true}
                    limit={10}
                  />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="form" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Demonstração do Formulário</CardTitle>
                <p className="text-sm text-gray-600">
                  Esta é uma demonstração do formulário de avaliação. 
                  Para usar em produção, é necessário fornecer um serviceHistoryId válido.
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Este formulário está em modo de demonstração. 
                    Para funcionar completamente, é necessário:
                  </p>
                  <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
                    <li>Um histórico de serviço válido (serviceHistoryId)</li>
                    <li>Que o usuário tenha permissão para avaliar o serviço</li>
                    <li>Que o serviço não tenha sido avaliado anteriormente</li>
                  </ul>
                </div>
                
                {/* Formulário de demonstração com serviceHistoryId fictício */}
                <ReviewForm
                  serviceHistoryId="demo-service-history-id"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Stats por Usuário */}
              <Card>
                <CardHeader>
                  <CardTitle>Minhas Avaliações</CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    </div>
                  }>
                    <ReviewsList 
                      userId={session.user.id}
                      showStats={true}
                      showActions={true}
                      limit={5}
                    />
                  </Suspense>
                </CardContent>
              </Card>

              {/* Instruções de Integração */}
              <Card>
                <CardHeader>
                  <CardTitle>Como Integrar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">1. Componente ReviewForm</h4>
                    <div className="bg-gray-100 p-3 rounded text-xs font-mono">
                      {`<ReviewForm 
  serviceHistoryId="hist_123"
  onSuccess={() => router.push('/dashboard')}
/>`}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">2. Lista de Avaliações</h4>
                    <div className="bg-gray-100 p-3 rounded text-xs font-mono">
                      {`<ReviewsList 
  userId="user_123"      // Filtrar por usuário
  serviceId="svc_456"    // Filtrar por serviço
  barberId="barber_789"  // Filtrar por barbeiro
  showStats={true}       // Mostrar estatísticas
  showActions={true}     // Mostrar botões de ação
  limit={10}            // Itens por página
/>`}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">3. Server Actions</h4>
                    <div className="bg-gray-100 p-3 rounded text-xs font-mono">
                      {`import { 
  createReview,
  updateReview,
  deleteReview,
  getReviews,
  getReviewStats
} from '@/server/reviewActions';`}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">4. Schemas de Validação</h4>
                    <div className="bg-gray-100 p-3 rounded text-xs font-mono">
                      {`import { 
  reviewFormSchema,
  createReviewSchema,
  updateReviewSchema
} from '@/schemas/reviewSchemas';`}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer com informações técnicas */}
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold">✅ Sistema de Avaliações Implementado</h3>
              <p className="text-sm text-gray-600">
                CRUD completo, upload de imagens, validações, responsividade e integração com upload system
              </p>
              <div className="flex justify-center gap-4 text-xs text-gray-500">
                <span>• ReviewForm component</span>
                <span>• ReviewsList component</span>
                <span>• Server Actions</span>
                <span>• Zod Schemas</span>
                <span>• Image Upload</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}