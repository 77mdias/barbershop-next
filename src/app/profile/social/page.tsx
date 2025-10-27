"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  UserPlus,
  Users,
  Share2,
  Search,
  Loader2,
  MessageCircle,
  MoreVertical,
  UserCheck
} from "lucide-react";
import styles from "./page.module.scss";

/**
 * Página Friend & Social - Mobile First
 *
 * Permite ao usuário:
 * - Ver lista de amigos
 * - Buscar e adicionar novos amigos
 * - Compartilhar convites
 * - Interagir socialmente
 */
export default function FriendSocial() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"friends" | "suggestions">("friends");

  // Redirect se não autenticado
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen mt-20 flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Mock data - substituir com dados reais da API
  const mockFriends = [
    { id: "1", name: "João Silva", nickname: "João", image: null, role: "CLIENT" },
    { id: "2", name: "Maria Santos", nickname: "Maria", image: null, role: "CLIENT" },
    { id: "3", name: "Pedro Costa", nickname: "Pedro", image: null, role: "BARBER" },
  ];

  const mockSuggestions = [
    { id: "4", name: "Carlos Mendes", nickname: "Carlos", image: null, role: "CLIENT", mutualFriends: 3 },
    { id: "5", name: "Ana Paula", nickname: "Ana", image: null, role: "CLIENT", mutualFriends: 2 },
    { id: "6", name: "Roberto Lima", nickname: "Roberto", image: null, role: "BARBER", mutualFriends: 5 },
  ];

  return (
    <div className="min-h-screen mt-16 mb-20 w-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className={cn("bg-white border-b sticky top-16 z-10", styles.socialHeader)}>
        <div className="flex items-center justify-between px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Friend & Social</h1>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-600 hover:text-gray-900"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-t">
          <button
            onClick={() => setActiveTab("friends")}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
              activeTab === "friends"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="h-4 w-4" />
              <span>Amigos</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("suggestions")}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
              activeTab === "suggestions"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>Sugestões</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 max-w-2xl w-full mx-auto">
        {/* Tab: Amigos */}
        {activeTab === "friends" && (
          <div className="space-y-4">
            {/* Stats Card */}
            <div className={cn("bg-white rounded-2xl p-6 shadow-sm border border-gray-100", styles.statsCard)}>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className={styles.statItem}>
                  <div className="text-2xl font-bold text-blue-600">
                    {mockFriends.length}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Amigos</div>
                </div>
                <div className={styles.statItem}>
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-xs text-gray-600 mt-1">Seguindo</div>
                </div>
                <div className={styles.statItem}>
                  <div className="text-2xl font-bold text-teal-600">0</div>
                  <div className="text-xs text-gray-600 mt-1">Seguidores</div>
                </div>
              </div>
            </div>

            {/* Invite Card */}
            <div className={cn("bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg", styles.inviteCard)}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    Convide seus amigos!
                  </h3>
                  <p className="text-sm text-blue-100 opacity-90">
                    Compartilhe com amigos e ganhe benefícios exclusivos
                  </p>
                </div>
                <Share2 className="h-6 w-6 flex-shrink-0 ml-2" />
              </div>
              <Button
                variant="secondary"
                className="w-full bg-white text-blue-600 hover:bg-blue-50"
              >
                Compartilhar Convite
              </Button>
            </div>

            {/* Friends List */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-700 px-1 flex items-center justify-between">
                <span>Meus Amigos</span>
                <span className="text-xs text-gray-500 font-normal">
                  {mockFriends.length} amigos
                </span>
              </h2>

              {mockFriends.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Nenhum amigo ainda
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Comece a conectar com outras pessoas da comunidade
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("suggestions")}
                    className="mx-auto"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Ver Sugestões
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {mockFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className={cn(
                        "bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition-all hover:shadow-md",
                        styles.friendCard
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <UserAvatar
                            src={friend.image}
                            name={friend.name}
                            email=""
                            size="md"
                            className="w-12 h-12 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {friend.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span className="capitalize text-xs">
                                {friend.role === "BARBER" ? "Barbeiro" : "Cliente"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <MessageCircle className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Sugestões */}
        {activeTab === "suggestions" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <UserPlus className="h-4 w-4" />
                <span>Pessoas que você pode conhecer</span>
              </div>
            </div>

            <div className="space-y-2">
              {mockSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={cn(
                    "bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition-all hover:shadow-md",
                    styles.suggestionCard
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <UserAvatar
                      src={suggestion.image}
                      name={suggestion.name}
                      email=""
                      size="md"
                      className="w-12 h-12"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {suggestion.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {suggestion.mutualFriends} amigos em comum
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {mockSuggestions.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
                <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Nenhuma sugestão no momento
                </h3>
                <p className="text-sm text-gray-500">
                  Volte mais tarde para ver novas sugestões de amigos
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
