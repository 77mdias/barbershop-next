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
  X,
} from "lucide-react";
import {
  getFriends,
  getFriendSuggestions,
  sendFriendRequest,
  removeFriend,
  getSocialStats,
  generateInviteCode,
  getReceivedRequests,
  getSentRequests,
} from "@/server/friendshipActions";
import { getOrCreateConversation } from "@/server/chatActions";
import { SearchUsersModal } from "@/components/social/SearchUsersModal";
import { SocialPageSkeleton } from "@/components/social/SocialSkeleton";
import { PageHero } from "@/components/shared/PageHero";

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
  const [activeTab, setActiveTab] = React.useState<"friends" | "suggestions">(
    "friends"
  );
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [friends, setFriends] = React.useState<any[]>([]);
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState({
    friendsCount: 0,
    pendingReceivedCount: 0,
    pendingSentCount: 0,
  });
  const [inviteCode, setInviteCode] = React.useState<string>("");
  const [loadingActions, setLoadingActions] = React.useState<
    Record<string, boolean>
  >({});
  const [isSearchModalOpen, setIsSearchModalOpen] = React.useState(false);
  const [pendingRequestIds, setPendingRequestIds] = React.useState<string[]>(
    []
  );

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
      const [
        friendsRes,
        suggestionsRes,
        statsRes,
        receivedRes,
        sentRes,
      ] = await Promise.all([
        getFriends(),
        getFriendSuggestions(10),
        getSocialStats(),
        getReceivedRequests(),
        getSentRequests(),
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

      const pendingIds: string[] = [];
      if (receivedRes.success && receivedRes.data) {
        pendingIds.push(...receivedRes.data.map((r: any) => r.sender.id));
      }
      if (sentRes.success && sentRes.data) {
        pendingIds.push(...sentRes.data.map((r: any) => r.receiver.id));
      }
      setPendingRequestIds(pendingIds);
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
        setStats((prev) => ({
          ...prev,
          friendsCount: prev.friendsCount - 1,
        }));
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

  const handleOpenChat = async (friendId: string) => {
    setLoadingActions((prev) => ({ ...prev, [`chat-${friendId}`]: true }));
    try {
      const result = await getOrCreateConversation({ friendId });

      if (result.success && result.data) {
        router.push(`/chat/${result.data.id}`);
      } else {
        toast.error(result.error || "Erro ao abrir chat");
      }
    } catch (error) {
      toast.error("Erro ao abrir chat");
    } finally {
      setLoadingActions((prev) => ({
        ...prev,
        [`chat-${friendId}`]: false,
      }));
    }
  };

  if (isLoading) {
    return <SocialPageSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="mb-20 min-h-screen w-full flex-col">
      {/* Hero */}
      <PageHero
        badge="Social"
        title="Amigos & Conexões"
        subtitle="Conecte-se com barbeiros e clientes da comunidade"
        actions={[{ label: "Voltar", href: "/profile", variant: "outline" }]}
      />

      {/* Tabs */}
      <div className="sticky top-16 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex flex-1">
            <button
              onClick={() => setActiveTab("friends")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 border-b-2 py-2 text-sm font-medium transition-colors",
                activeTab === "friends"
                  ? "border-accent text-accent"
                  : "border-transparent text-fg-muted hover:text-foreground"
              )}
            >
              <Users className="h-4 w-4" />
              <span>Amigos</span>
            </button>
            <button
              onClick={() => setActiveTab("suggestions")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 border-b-2 py-2 text-sm font-medium transition-colors",
                activeTab === "suggestions"
                  ? "border-accent text-accent"
                  : "border-transparent text-fg-muted hover:text-foreground"
              )}
            >
              <UserPlus className="h-4 w-4" />
              <span>Sugestões</span>
            </button>
          </div>
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="ml-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-fg-muted transition-colors hover:border-accent hover:text-accent"
            title="Buscar usuários"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
          </div>
        ) : (
          <>
            {/* Tab: Amigos */}
            {activeTab === "friends" && (
              <div className="space-y-4">
                {/* Stats Card */}
                <div className="rounded-2xl border border-border bg-surface-card p-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="font-display text-2xl font-bold italic text-accent">
                        {stats.friendsCount}
                      </div>
                      <div className="mt-1 text-xs text-fg-subtle">Amigos</div>
                    </div>
                    <button
                      onClick={() =>
                        router.push("/profile/social/requests")
                      }
                      className="rounded-lg px-1 transition-colors hover:bg-[hsl(var(--accent)/0.05)]"
                    >
                      <div className="font-display text-2xl font-bold italic text-accent">
                        {stats.pendingSentCount}
                      </div>
                      <div className="mt-1 text-xs text-fg-subtle">
                        Enviadas
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        router.push("/profile/social/requests")
                      }
                      className="relative rounded-lg px-1 transition-colors hover:bg-[hsl(var(--accent)/0.05)]"
                    >
                      <div className="relative inline-flex font-display text-2xl font-bold italic text-accent">
                        {stats.pendingReceivedCount}
                        {stats.pendingReceivedCount > 0 && (
                          <span className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-destructive" />
                        )}
                      </div>
                      <div className="mt-1 text-xs text-fg-subtle">
                        Recebidas
                      </div>
                      {stats.pendingReceivedCount > 0 && (
                        <div className="absolute right-1 top-1">
                          <span className="relative flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Invite Card */}
                <div className="rounded-2xl border border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.08)] p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="mb-2 font-semibold text-foreground">
                        Convide seus amigos!
                      </h3>
                      <p className="text-sm text-fg-muted">
                        Compartilhe com amigos e ganhe benefícios exclusivos
                      </p>
                    </div>
                    <Share2 className="ml-2 h-6 w-6 shrink-0 text-accent" />
                  </div>
                  {inviteCode && (
                    <div className="mb-3 flex items-center gap-2 rounded-xl border border-border bg-background p-2">
                      <code className="flex-1 font-mono text-sm text-foreground">
                        {inviteCode}
                      </code>
                      <button
                        onClick={() => handleCopyInvite()}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted transition-colors hover:text-accent"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={handleShareInvite}
                    className="gold-shimmer w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90"
                  >
                    Compartilhar Convite
                  </button>
                </div>

                {/* Friends List */}
                <div className="space-y-3">
                  <h2 className="flex items-center justify-between px-1 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                    <span>Meus Amigos</span>
                    <span className="normal-case tracking-normal font-normal text-fg-subtle">
                      {friends.length} amigos
                    </span>
                  </h2>

                  {friends.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-surface-card p-8 text-center">
                      <Users className="mx-auto mb-3 h-12 w-12 text-fg-subtle" />
                      <h3 className="mb-2 font-semibold text-foreground">
                        Nenhum amigo ainda
                      </h3>
                      <p className="mb-4 text-sm text-fg-muted">
                        Comece a conectar com outras pessoas da comunidade
                      </p>
                      <button
                        onClick={() => setActiveTab("suggestions")}
                        className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
                      >
                        <UserPlus className="h-4 w-4" />
                        Ver Sugestões
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {friends.map((friend) => (
                        <div
                          key={friend.id}
                          className="card-hover rounded-2xl border border-border bg-surface-card p-4 transition-all duration-300 hover:border-[hsl(var(--accent)/0.3)]"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              <UserAvatar
                                src={friend.image}
                                name={friend.name}
                                email=""
                                size="md"
                                className="h-12 w-12 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <h3 className="truncate font-semibold text-foreground">
                                  {friend.name}
                                </h3>
                                <div className="text-xs text-fg-muted">
                                  <span className="capitalize">
                                    {friend.role === "BARBER"
                                      ? "Barbeiro"
                                      : "Cliente"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <button
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-accent transition-colors hover:bg-[hsl(var(--accent)/0.1)] disabled:opacity-50"
                                onClick={() => handleOpenChat(friend.id)}
                                disabled={
                                  loadingActions[`chat-${friend.id}`]
                                }
                                title="Enviar mensagem"
                              >
                                {loadingActions[`chat-${friend.id}`] ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <MessageCircle className="h-5 w-5" />
                                )}
                              </button>
                              <button
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-destructive transition-colors hover:bg-[hsl(var(--destructive)/0.1)] disabled:opacity-50"
                                onClick={() => handleRemoveFriend(friend.id)}
                                disabled={loadingActions[friend.id]}
                                title="Remover amigo"
                              >
                                {loadingActions[friend.id] ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <UserMinus className="h-5 w-5" />
                                )}
                              </button>
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
                <div className="rounded-2xl border border-border bg-surface-card p-4">
                  <div className="flex items-center gap-2 text-sm text-fg-muted">
                    <UserPlus className="h-4 w-4 text-accent" />
                    <span>Pessoas que você pode conhecer</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="card-hover rounded-2xl border border-border bg-surface-card p-4 transition-all duration-300 hover:border-[hsl(var(--accent)/0.3)]"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <UserAvatar
                          src={suggestion.image}
                          name={suggestion.name}
                          email=""
                          size="md"
                          className="h-12 w-12"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-semibold text-foreground">
                            {suggestion.name}
                          </h3>
                          {suggestion.mutualFriends > 0 && (
                            <p className="text-xs text-fg-muted">
                              {suggestion.mutualFriends} amigos em comum
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="gold-shimmer flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90 disabled:opacity-50"
                          onClick={() =>
                            handleSendFriendRequest(suggestion.id)
                          }
                          disabled={loadingActions[suggestion.id]}
                        >
                          {loadingActions[suggestion.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                          Adicionar
                        </button>
                        <button
                          className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
                          onClick={() =>
                            handleRemoveSuggestion(suggestion.id)
                          }
                        >
                          <X className="h-4 w-4" />
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {suggestions.length === 0 && (
                  <div className="rounded-2xl border border-border bg-surface-card p-8 text-center">
                    <UserPlus className="mx-auto mb-3 h-12 w-12 text-fg-subtle" />
                    <h3 className="mb-2 font-semibold text-foreground">
                      Nenhuma sugestão no momento
                    </h3>
                    <p className="text-sm text-fg-muted">
                      Volte mais tarde para ver novas sugestões de amigos
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Search Modal */}
      <SearchUsersModal
        open={isSearchModalOpen}
        onOpenChange={setIsSearchModalOpen}
        currentFriends={friends.map((f) => f.id)}
        pendingRequests={pendingRequestIds}
      />
    </div>
  );
}
