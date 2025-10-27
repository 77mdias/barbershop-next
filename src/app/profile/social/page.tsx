"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ArrowLeft,
  UserPlus,
  Users,
  Share2,
  Search,
  Loader2,
  MessageCircle,
  UserCheck,
  UserMinus,
  Copy,
  X
} from "lucide-react";
import styles from "./page.module.scss";
import {
  getFriends,
  getFriendSuggestions,
  sendFriendRequest,
  removeFriend,
  getSocialStats,
  generateInviteCode,
} from "@/server/friendshipActions";

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
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [friends, setFriends] = React.useState<any[]>([]);
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState({
    friendsCount: 0,
    pendingReceivedCount: 0,
    pendingSentCount: 0,
  });
  const [inviteCode, setInviteCode] = React.useState<string>("");
  const [loadingActions, setLoadingActions] = React.useState<Record<string, boolean>>({});

  // Redirect se não autenticado
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Carregar dados
  React.useEffect(() => {
    if (isAuthenticated && user) {
      loadData();
    }
  }, [isAuthenticated, user]);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const [friendsRes, suggestionsRes, statsRes] = await Promise.all([
        getFriends(),
        getFriendSuggestions(10),
        getSocialStats(),
      ]);

      if (friendsRes.success && friendsRes.data) {
        setFriends(friendsRes.data);
      }

      if (suggestionsRes.success && suggestionsRes.data) {
        setSuggestions(suggestionsRes.data);
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    setLoadingActions((prev) => ({ ...prev, [userId]: true }));
    try {
      const result = await sendFriendRequest({ receiverId: userId });

      if (result.success) {
        toast.success("Solicitação enviada com sucesso!");
        setSuggestions((prev) => prev.filter((s) => s.id !== userId));
      } else {
        toast.error(result.error || "Erro ao enviar solicitação");
      }
    } catch (error) {
      toast.error("Erro ao enviar solicitação");
    } finally {
      setLoadingActions((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm("Tem certeza que deseja remover este amigo?")) return;

    setLoadingActions((prev) => ({ ...prev, [friendId]: true }));
    try {
      const result = await removeFriend(friendId);

      if (result.success) {
        toast.success("Amigo removido com sucesso!");
        setFriends((prev) => prev.filter((f) => f.id !== friendId));
        setStats((prev) => ({ ...prev, friendsCount: prev.friendsCount - 1 }));
      } else {
        toast.error(result.error || "Erro ao remover amigo");
      }
    } catch (error) {
      toast.error("Erro ao remover amigo");
    } finally {
      setLoadingActions((prev) => ({ ...prev, [friendId]: false }));
    }
  };

  const handleGenerateInviteCode = async () => {
    try {
      const result = await generateInviteCode();

      if (result.success && result.data) {
        setInviteCode(result.data.inviteCode);
      } else {
        toast.error(result.error || "Erro ao gerar código de convite");
      }
    } catch (error) {
      toast.error("Erro ao gerar código de convite");
    }
  };

  const handleShareInvite = async () => {
    if (!inviteCode) {
      await handleGenerateInviteCode();
      return;
    }

    const shareUrl = `${window.location.origin}/profile/social?invite=${inviteCode}`;
    const shareText = `Junte-se a mim na plataforma! Use meu código de convite: ${inviteCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Convite - Barbershop",
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        handleCopyInvite(shareText);
      }
    } else {
      handleCopyInvite(shareText);
    }
  };

  const handleCopyInvite = (text?: string) => {
    const copyText = text || inviteCode;
    navigator.clipboard.writeText(copyText);
    toast.success("Código copiado para a área de transferência!");
  };

  const handleRemoveSuggestion = (userId: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== userId));
  };

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
        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Tab: Amigos */}
            {activeTab === "friends" && (
          <div className="space-y-4">
            {/* Stats Card */}
            <div className={cn("bg-white rounded-2xl p-6 shadow-sm border border-gray-100", styles.statsCard)}>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className={styles.statItem}>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.friendsCount}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Amigos</div>
                </div>
                <div className={styles.statItem}>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.pendingSentCount}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Enviadas</div>
                </div>
                <div className={styles.statItem}>
                  <div className="text-2xl font-bold text-teal-600">
                    {stats.pendingReceivedCount}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Recebidas</div>
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
              {inviteCode && (
                <div className="mb-3 flex items-center gap-2 bg-white/20 rounded-lg p-2">
                  <code className="flex-1 text-sm font-mono">{inviteCode}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyInvite()}
                    className="h-8 w-8 text-white hover:bg-white/20"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Button
                variant="secondary"
                className="w-full bg-white text-blue-600 hover:bg-blue-50"
                onClick={handleShareInvite}
              >
                Compartilhar Convite
              </Button>
            </div>

            {/* Friends List */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-700 px-1 flex items-center justify-between">
                <span>Meus Amigos</span>
                <span className="text-xs text-gray-500 font-normal">
                  {friends.length} amigos
                </span>
              </h2>

              {friends.length === 0 ? (
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
                  {friends.map((friend) => (
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
                            disabled
                          >
                            <MessageCircle className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleRemoveFriend(friend.id)}
                            disabled={loadingActions[friend.id]}
                          >
                            {loadingActions[friend.id] ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <UserMinus className="h-5 w-5" />
                            )}
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

            )

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
              {suggestions.map((suggestion) => (
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
                      {suggestion.mutualFriends > 0 && (
                        <p className="text-xs text-gray-500">
                          {suggestion.mutualFriends} amigos em comum
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleSendFriendRequest(suggestion.id)}
                      disabled={loadingActions[suggestion.id]}
                    >
                      {loadingActions[suggestion.id] ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <UserCheck className="h-4 w-4 mr-1" />
                      )}
                      Adicionar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleRemoveSuggestion(suggestion.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remover
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {suggestions.length === 0 && (
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
          </>
        )}
      </div>
    </div>
  );
}
