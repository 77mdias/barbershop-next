import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ReviewsList } from '@/components/ReviewsList';
import Link from 'next/link';
import { 
  CalendarIcon, 
  ClockIcon, 
  StarIcon, 
  PlusIcon,
  UserIcon,
  ScissorsIcon,
  HeartIcon,
  EyeIcon
} from 'lucide-react';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  const userRole = session.user.role;
  const isBarber = userRole === 'BARBER';
  const isAdmin = userRole === 'ADMIN';

  return (
    <div className="container mt-12 mb-16 mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header com saudação */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Olá, {session.user.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-gray-600">
                {isBarber ? 'Gerencie seus clientes e serviços' : 'Gerencie seus agendamentos e avaliações'}
              </p>
            </div>
            <Badge variant={isBarber ? "default" : "secondary"} className="px-3 py-1">
              {isBarber ? 'Barbeiro' : isAdmin ? 'Administrador' : 'Cliente'}
            </Badge>
          </div>
          <Separator />
        </div>

        {/* Cards de ações rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Agendamentos */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Agendamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  {isBarber ? 'Próximos atendimentos' : 'Seus próximos horários'}
                </p>
                <Button asChild className="w-full">
                  <Link href="/scheduling/manage">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    Ver Agendamentos
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Avaliações */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <StarIcon className="w-5 h-5" />
                Avaliações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  {isBarber ? 'Reviews dos seus serviços' : 'Suas avaliações de serviços'}
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/reviews">
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Ver Reviews
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Perfil */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Configurações da conta
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/profile">
                    <UserIcon className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Galeria ou Barbeiro específico */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {isBarber ? <ScissorsIcon className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                {isBarber ? 'Portfólio' : 'Galeria'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  {isBarber ? 'Seus trabalhos' : 'Trabalhos da barbearia'}
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/gallery">
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Ver Galeria
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Reviews Recentes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <StarIcon className="w-6 h-6" />
                {isBarber ? 'Reviews Recebidas' : 'Suas Últimas Avaliações'}
              </CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/reviews">
                  Ver Todas
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Suspense fallback={
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando avaliações...</p>
              </div>
            }>
              <ReviewsList 
                userId={isBarber ? undefined : session.user.id}
                barberId={isBarber ? session.user.id : undefined}
                showStats={false}
                showActions={false}
                limit={3}
              />
            </Suspense>
          </CardContent>
        </Card>

        {/* Dashboard específico para barbeiros */}
        {isBarber && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ScissorsIcon className="w-6 h-6" />
                  Dashboard do Barbeiro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">--</p>
                    <p className="text-sm text-gray-600">Atendimentos Hoje</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">--</p>
                    <p className="text-sm text-gray-600">Avaliação Média</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">--</p>
                    <p className="text-sm text-gray-600">Total de Reviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acesso Rápido - Barbeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button asChild className="h-16">
                    <Link href="/dashboard/barber">
                      <ScissorsIcon className="w-6 h-6 mr-2" />
                      Dashboard Avançado
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-16">
                    <Link href="/reviews?view=barber">
                      <StarIcon className="w-6 h-6 mr-2" />
                      Gerenciar Reviews
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer informativo */}
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold">✅ Sistema Integrado</h3>
              <p className="text-sm text-gray-600">
                Dashboard personalizado por tipo de usuário com acesso completo ao sistema de reviews
              </p>
              <div className="flex justify-center gap-4 text-xs text-gray-500">
                <span>• Agendamentos</span>
                <span>• Reviews</span>
                <span>• Perfil</span>
                <span>• Galeria</span>
                {isBarber && <span>• Dashboard Barbeiro</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}