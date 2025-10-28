import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Skeleton para o header da página social (tabs + botões)
 */
export function SocialHeaderSkeleton() {
  return (
    <div className="bg-white border-b sticky top-16 z-10">
      <div className="flex items-center justify-between px-4 py-4">
        <Skeleton className="h-10 w-10 rounded" />
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-10 w-10 rounded" />
      </div>

      {/* Tabs */}
      <div className="flex border-t">
        <div className="flex-1 py-3 flex items-center justify-center">
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex-1 py-3 flex items-center justify-center">
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton para o card de estatísticas sociais
 */
export function SocialStatsCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="grid grid-cols-3 gap-4 text-center">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-8 w-12 mx-auto" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton para o card de convite
 */
export function InviteCardSkeleton() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-40 bg-white/30" />
          <Skeleton className="h-4 w-56 bg-white/20" />
        </div>
        <Skeleton className="h-6 w-6 bg-white/30" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg bg-white/30" />
    </div>
  );
}

/**
 * Skeleton para um card de amigo
 */
export function FriendCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-10 w-10 rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton para lista de amigos
 */
export function FriendsListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <FriendCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton para um card de sugestão de amigo
 */
export function SuggestionCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1 rounded" />
        <Skeleton className="h-9 flex-1 rounded" />
      </div>
    </div>
  );
}

/**
 * Skeleton para lista de sugestões
 */
export function SuggestionsListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <SuggestionCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton para um card de solicitação de amizade
 */
export function FriendRequestSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1 rounded" />
        <Skeleton className="h-9 flex-1 rounded" />
      </div>
    </div>
  );
}

/**
 * Skeleton para lista de solicitações de amizade recebidas
 */
export function ReceivedRequestsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <FriendRequestSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton para um card de solicitação enviada
 */
export function SentRequestSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-9 w-20 rounded" />
      </div>
    </div>
  );
}

/**
 * Skeleton para lista de solicitações enviadas
 */
export function SentRequestsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SentRequestSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton completo para a página social (aba Amigos)
 */
export function SocialPageFriendsSkeleton() {
  return (
    <div className="flex-1 px-4 py-6 max-w-2xl w-full mx-auto">
      <div className="space-y-4">
        <SocialStatsCardSkeleton />
        <InviteCardSkeleton />
        <FriendsListSkeleton count={5} />
      </div>
    </div>
  );
}

/**
 * Skeleton completo para a página social (aba Sugestões)
 */
export function SocialPageSuggestionsSkeleton() {
  return (
    <div className="flex-1 px-4 py-6 max-w-2xl w-full mx-auto">
      <SuggestionsListSkeleton count={5} />
    </div>
  );
}

/**
 * Skeleton completo para a página social (geral - pode ser usado no loading.tsx)
 */
export function SocialPageSkeleton() {
  return (
    <div className="min-h-screen mt-16 mb-20 w-full flex flex-col bg-gray-50">
      <SocialHeaderSkeleton />
      <SocialPageFriendsSkeleton />
    </div>
  );
}

/**
 * Skeleton completo para a página de solicitações de amizade
 */
export function FriendRequestsPageSkeleton() {
  return (
    <div className="min-h-screen mt-16 mb-20 w-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="flex items-center justify-between px-4 py-4">
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-6 w-56" />
          <div className="w-10"></div>
        </div>

        {/* Tabs */}
        <div className="flex border-t">
          <div className="flex-1 py-3 flex items-center justify-center gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          <div className="flex-1 py-3 flex items-center justify-center gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 max-w-2xl w-full mx-auto">
        <ReceivedRequestsListSkeleton count={3} />
      </div>
    </div>
  );
}
