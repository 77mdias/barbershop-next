import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewsList } from "@/components/ReviewsList";
import { ReviewSystemManager } from "@/components/ReviewSystemManager";
import { 
  PhotoIcon, 
  StarIcon, 
  PlusIcon, 
  ChartBarIcon 
} from "@heroicons/react/24/outline";

export default async function ReviewsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-8 mt-12 mb-16">
        <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Sistema de Avaliações</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Gerencie e visualize avaliações dos serviços de forma simples e eficiente
          </p>
        </div>

        <Separator />

        {/* Tabs para diferentes funcionalidades */}
        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-11 p-0.5 bg-card rounded-lg">
            <TabsTrigger
              value="gallery"
              className="flex items-center justify-center gap-1 px-1 py-2 text-xs font-medium rounded-md transition-all duration-200  text-foreground hover:text-foreground"
            >
              <PhotoIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Galeria</span>
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="flex items-center justify-center gap-1 px-1 py-2 text-xs font-medium rounded-md transition-all duration-200  text-foreground hover:text-foreground"
            >
              <StarIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Minhas</span>
            </TabsTrigger>
            <TabsTrigger
              value="form"
              className="flex items-center justify-center gap-1 px-1 py-2 text-xs font-medium rounded-md transition-all duration-200  text-foreground hover:text-foreground"
            >
              <PlusIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Nova</span>
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="flex items-center justify-center gap-1 px-1 py-2 text-xs font-medium rounded-md transition-all duration-200  text-foreground"
            >
              <ChartBarIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="space-y-6 mt-8">
            <Card className="border border-border">
              <CardHeader className="border-b border-border bg-card">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <PhotoIcon className="w-5 h-5" />
                  Galeria Pública
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Veja as avaliações de todos os clientes da barbearia
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <Suspense
                  fallback={
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-600 mx-auto"></div>
                      <p className="mt-3 text-gray-500 text-sm">Carregando avaliações...</p>
                    </div>
                  }
                >
                  <ReviewsList
                    showStats={true}
                    showActions={false}
                    limit={10}
                    showAllReviews={true}
                  />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="space-y-6 mt-8">
            <Card className="border border-border">
              <CardHeader className="border-b border-border bg-card">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <StarIcon className="w-5 h-5" />
                  Minhas Avaliações
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Gerencie suas próprias avaliações
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <Suspense
                  fallback={
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-600 mx-auto"></div>
                      <p className="mt-3 text-gray-500 text-sm">Carregando avaliações...</p>
                    </div>
                  }
                >
                  <ReviewsList
                    userId={session.user.id}
                    showStats={true}
                    showActions={true}
                    limit={10}
                  />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="form" className="space-y-6 mt-8">
            <Card className="border border-border">
              <CardHeader className="border-b border-border bg-card">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <PlusIcon className="w-5 h-5" />
                  Nova Avaliação
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Crie uma nova avaliação para um serviço
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <ReviewSystemManager userId={session.user.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stats por Usuário */}
              <Card className="border border-border">
                <CardHeader className="border-b border-border bg-card">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <StarIcon className="w-5 h-5" />
                    Estatísticas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Suspense
                    fallback={
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600 mx-auto"></div>
                      </div>
                    }
                  >
                    <ReviewsList
                      userId={session.user.id}
                      showStats={true}
                      showActions={true}
                      limit={5}
                    />
                  </Suspense>
                </CardContent>
              </Card>

              {/* {/* Guia de Uso */}
              {/* <Card className="border border-border">
                <CardHeader className="border-b border-border bg-card">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <ChartBarIcon className="w-5 h-5" />
                    Guia de Uso
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-foreground">
                      1. Componente ReviewForm
                    </h4>
                    <div className="bg-card p-3 rounded border text-xs font-mono text-foreground">
                      {`<ReviewForm 
  serviceHistoryId="hist_123"
  onSuccess={() => router.push('/dashboard')}
/>`}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2 text-foreground">
                      2. Lista de Avaliações
                    </h4>
                    <div className="bg-card p-3 rounded border text-xs font-mono text-foreground">
                      {`<ReviewsList 
  userId="user_123"
  showStats={true}
  limit={10}
/>`}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2 text-foreground">
                      3. Server Actions
                    </h4>
                    <div className="bg-card p-3 rounded border text-xs font-mono text-foreground">
                      {`import { 
  createReview,
  getReviews
} from '@/server/reviewActions';`}
                    </div>
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer com informações técnicas */}
        <Card className="border border-border bg-card">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-foreground rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="font-medium text-sm">Sistema Implementado</span>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
                CRUD completo, upload de imagens, validações e integração
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                <span className="px-3 py-1 bg-foreground border border-border rounded-md text-background">ReviewForm</span>
                <span className="px-3 py-1 bg-foreground border border-border rounded-md text-background">ReviewsList</span>
                <span className="px-3 py-1 bg-foreground border border-border rounded-md text-background">Server Actions</span>
                <span className="px-3 py-1 bg-foreground border border-border rounded-md text-background">Validações</span>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
