import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ReviewsList } from "@/components/ReviewsList";
import { ReviewSystemManager } from "@/components/ReviewSystemManager";
import { Reviews } from "@/components/home/Reviews";
import { PageHero } from "@/components/shared/PageHero";
import { getHomePageData } from "@/server/home/getHomePageData";
import { BarChart3, Camera, Plus, Star } from "lucide-react";

export default async function ReviewsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const homeData = await getHomePageData();
  const publicReviews = homeData.reviews.items;
  const totalReviews = publicReviews.length;
  const averageRating = totalReviews
    ? (publicReviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews).toFixed(1)
    : "0.0";
  const maxRatingCount = publicReviews.filter((review) => review.rating === 5).length;

  return (
    <main className="min-h-screen bg-background pb-16">
      <PageHero
        badge="Experiência Real"
        title="Avaliações"
        subtitle="Acompanhe feedbacks da comunidade, publique sua experiência e veja estatísticas dos serviços em um único lugar."
      />

      <div className="container mx-auto mt-10 px-4">
        <div className="mx-auto max-w-6xl space-y-8">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-2xl border border-border bg-surface-card p-6 card-hover">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">Nota Média</p>
              <p className="mt-3 font-display text-4xl font-bold italic text-accent">{averageRating}</p>
              <p className="mt-2 text-sm text-fg-muted">Baseado nas avaliações mais recentes</p>
            </article>
            <article className="rounded-2xl border border-border bg-surface-card p-6 card-hover">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">Total de Reviews</p>
              <p className="mt-3 font-display text-4xl font-bold italic text-accent">{totalReviews}</p>
              <p className="mt-2 text-sm text-fg-muted">Comentários da comunidade BarberKings</p>
            </article>
            <article className="rounded-2xl border border-border bg-surface-card p-6 card-hover sm:col-span-2 lg:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">5 Estrelas</p>
              <p className="mt-3 font-display text-4xl font-bold italic text-accent">{maxRatingCount}</p>
              <p className="mt-2 text-sm text-fg-muted">Atendimentos com excelência máxima</p>
            </article>
          </section>

          <Separator className="bg-border" />

          <Tabs defaultValue="gallery" className="w-full">
            <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl border border-border bg-surface-card p-1 md:grid-cols-4">
            <TabsTrigger
              value="gallery"
              className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-fg-muted transition-all duration-300 hover:text-foreground data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none sm:text-sm"
            >
              <Camera className="h-4 w-4" />
              <span>Galeria</span>
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-fg-muted transition-all duration-300 hover:text-foreground data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none sm:text-sm"
            >
              <Star className="h-4 w-4" />
              <span>Minhas</span>
            </TabsTrigger>
            <TabsTrigger
              value="form"
              className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-fg-muted transition-all duration-300 hover:text-foreground data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none sm:text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Nova</span>
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-fg-muted transition-all duration-300 hover:text-foreground data-[state=active]:bg-accent data-[state=active]:text-on-accent data-[state=active]:shadow-none sm:text-sm"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Stats</span>
            </TabsTrigger>
          </TabsList>

            <TabsContent value="gallery" className="mt-8 space-y-6">
              <Reviews
                title="Histórias da Comunidade"
                subtitle="Resultado real de quem passa pelas nossas cadeiras todos os dias."
                reviews={publicReviews}
                className="rounded-3xl border border-border !bg-surface-1 !py-14"
              />
            </TabsContent>

            <TabsContent value="list" className="mt-8 space-y-6">
              <Card className="rounded-2xl border border-border bg-surface-card">
                <CardHeader className="border-b border-border bg-surface-card">
                  <CardTitle className="font-display text-2xl font-semibold italic text-foreground">
                    Minhas Avaliações
                  </CardTitle>
                  <p className="text-sm text-fg-muted">Gerencie seus comentários e acompanhe interações.</p>
                </CardHeader>
                <CardContent className="p-6">
                  <Suspense
                    fallback={
                      <div className="py-8 text-center">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
                        <p className="mt-3 text-sm text-fg-muted">Carregando avaliações...</p>
                      </div>
                    }
                  >
                    <ReviewsList userId={session.user.id} showStats={true} showActions={true} limit={10} />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="form" className="mt-8 space-y-6">
              <ReviewSystemManager userId={session.user.id} />
            </TabsContent>

            <TabsContent value="stats" className="mt-8 space-y-6">
              <Card className="rounded-2xl border border-border bg-surface-card">
                <CardHeader className="border-b border-border bg-surface-card">
                  <CardTitle className="font-display text-2xl font-semibold italic text-foreground">
                    Estatísticas Detalhadas
                  </CardTitle>
                  <p className="text-sm text-fg-muted">Números atualizados sobre avaliações e desempenho.</p>
                </CardHeader>
                <CardContent className="p-6">
                  <Suspense
                    fallback={
                      <div className="py-4 text-center">
                        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
                      </div>
                    }
                  >
                    <ReviewsList userId={session.user.id} showStats={true} showActions={true} limit={5} />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="rounded-2xl border border-border bg-surface-1">
            <CardContent className="pt-6">
              <div className="space-y-3 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.08)] px-4 py-2">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  <span className="text-sm font-semibold text-accent">Sistema de Reviews Ativo</span>
                </div>
                <p className="mx-auto max-w-2xl text-sm text-fg-muted">
                  Fluxo completo com upload de imagens, validações e integração em tempo real.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
