import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReviewsList } from '@/components/ReviewsList';
import { StarIcon, PlusIcon, TrendingUpIcon, MessageSquareIcon } from 'lucide-react';
import Link from 'next/link';

interface ReviewSectionProps {
  userId?: string;
  barberId?: string;
  userRole?: 'CLIENT' | 'BARBER' | 'ADMIN';
  showActions?: boolean;
  limit?: number;
}

export function ReviewSection({ 
  userId, 
  barberId, 
  userRole = 'CLIENT',
  showActions = true,
  limit = 3 
}: ReviewSectionProps) {
  const isBarber = userRole === 'BARBER';
  const title = isBarber ? 'Reviews dos Seus Serviços' : 'Suas Últimas Avaliações';
  const description = isBarber 
    ? 'Feedback dos clientes sobre seus atendimentos' 
    : 'Avaliações que você fez dos serviços';

  return (
    <div className="space-y-6">
      
      {/* Header da seção */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <StarIcon className="w-6 h-6" />
                {title}
              </CardTitle>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
            
            {showActions && (
              <div className="flex gap-2">
                {!isBarber && (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/reviews?tab=form">
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Nova Avaliação
                    </Link>
                  </Button>
                )}
                <Button asChild variant="default" size="sm">
                  <Link href="/reviews">
                    Ver Todas
                  </Link>
                </Button>
              </div>
            )}
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
              userId={userId}
              barberId={barberId}
              showStats={false}
              showActions={false}
              limit={limit}
            />
          </Suspense>
        </CardContent>
      </Card>

      {/* Stats rápidos para barbeiros */}
      {isBarber && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <TrendingUpIcon className="w-8 h-8 mx-auto text-green-600" />
                <p className="text-2xl font-bold">--</p>
                <p className="text-sm text-gray-600">Avaliação Média</p>
                <Badge variant="secondary">⭐ Este Mês</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <MessageSquareIcon className="w-8 h-8 mx-auto text-blue-600" />
                <p className="text-2xl font-bold">--</p>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <Badge variant="secondary">📝 Todas</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <StarIcon className="w-8 h-8 mx-auto text-yellow-600" />
                <p className="text-2xl font-bold">--</p>
                <p className="text-sm text-gray-600">Reviews 5 ⭐</p>
                <Badge variant="secondary">🏆 Excelência</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats rápidos para clientes */}
      {!isBarber && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <MessageSquareIcon className="w-8 h-8 mx-auto text-blue-600" />
                <p className="text-2xl font-bold">--</p>
                <p className="text-sm text-gray-600">Reviews Feitas</p>
                <Badge variant="secondary">📝 Total</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <StarIcon className="w-8 h-8 mx-auto text-yellow-600" />
                <p className="text-2xl font-bold">--</p>
                <p className="text-sm text-gray-600">Média Dada</p>
                <Badge variant="secondary">⭐ Suas Notas</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Call to action */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="font-semibold">
              {isBarber ? '🌟 Melhore Seus Serviços' : '💬 Compartilhe Sua Experiência'}
            </h3>
            <p className="text-sm text-gray-600">
              {isBarber 
                ? 'Use o feedback dos clientes para aprimorar seus atendimentos'
                : 'Suas avaliações ajudam outros clientes e melhoram nossos serviços'
              }
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/reviews">
                  <StarIcon className="w-4 h-4 mr-2" />
                  Ver Sistema Completo
                </Link>
              </Button>
              {!isBarber && (
                <Button asChild size="sm">
                  <Link href="/reviews?tab=form">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Avaliar Serviço
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}