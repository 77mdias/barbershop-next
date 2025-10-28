import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Skeleton para um card de notificação individual
 */
export function NotificationCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-5 w-5 rounded-full flex-shrink-0 mt-1" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton para lista de notificações
 */
export function NotificationsListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <NotificationCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton completo para a página de notificações
 */
export function NotificationsPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-9 w-48 rounded" />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-2 p-1 bg-muted rounded-lg">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-center gap-2 h-10">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <NotificationsListSkeleton count={5} />
    </div>
  );
}
