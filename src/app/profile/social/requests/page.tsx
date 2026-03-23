"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Users, Loader2, UserCheck, X, Inbox } from "lucide-react";
import {
  getReceivedRequests,
  getSentRequests,
  respondFriendRequest,
  cancelFriendRequest,
} from "@/server/friendshipActions";
import { FriendRequestsPageSkeleton } from "@/components/social/SocialSkeleton";
import { PageHero } from "@/components/shared/PageHero";

interface FriendRequest {
  id: string;
  status: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    nickname: string | null;
    image: string | null;
    role: string;
  };
  receiver: {
    id: string;
    name: string;
    nickname: string | null;
    image: string | null;
    role: string;
  };
}

export default function FriendRequestsPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"received" | "sent">(
    "received"
  );
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [receivedRequests, setReceivedRequests] = React.useState<
    FriendRequest[]
  >([]);
  const [sentRequests, setSentRequests] = React.useState<FriendRequest[]>([]);
  const [loadingActions, setLoadingActions] = React.useState<
    Record<string, boolean>
  >({});

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
    if (!user) {
      setIsLoadingData(false);
      return;
    }
    try {
      const [receivedRes, sentRes] = await Promise.all([
        getReceivedRequests(),
        getSentRequests(),
      ]);

      if (receivedRes.success && receivedRes.data) {
        const receiverInfo = {
          id: user.id,
          name: user.name ?? "",
          nickname: (user as any).nickname ?? null,
          image: user.image ?? null,
          role: (user as any).role ?? "CLIENT",
        };

        setReceivedRequests(
          receivedRes.data.map((request: any) => ({
            ...request,
            receiver: request.receiver ?? receiverInfo,
          }))
        );
      }

      if (sentRes.success && sentRes.data) {
        const senderInfo = {
          id: user.id,
          name: user.name ?? "",
          nickname: (user as any).nickname ?? null,
          image: user.image ?? null,
          role: (user as any).role ?? "CLIENT",
        };

        setSentRequests(
          sentRes.data.map((request: any) => ({
            ...request,
            sender: request.sender ?? senderInfo,
          }))
        );
      }
    } catch (error) {
      console.error("Erro ao carregar solicitações:", error);
      toast.error("Erro ao carregar solicitações");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    setLoadingActions((prev) => ({ ...prev, [requestId]: true }));
    try {
      const result = await respondFriendRequest({
        requestId,
        action: "ACCEPT",
      });

      if (result.success) {
        toast.success("Solicitação aceita!");
        setReceivedRequests((prev) =>
          prev.filter((r) => r.id !== requestId)
        );
      } else {
        toast.error(result.error || "Erro ao aceitar solicitação");
      }
    } catch (error) {
      toast.error("Erro ao aceitar solicitação");
    } finally {
      setLoadingActions((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleReject = async (requestId: string) => {
    setLoadingActions((prev) => ({ ...prev, [requestId]: true }));
    try {
      const result = await respondFriendRequest({
        requestId,
        action: "REJECT",
      });

      if (result.success) {
        toast.success("Solicitação rejeitada");
        setReceivedRequests((prev) =>
          prev.filter((r) => r.id !== requestId)
        );
      } else {
        toast.error(result.error || "Erro ao rejeitar solicitação");
      }
    } catch (error) {
      toast.error("Erro ao rejeitar solicitação");
    } finally {
      setLoadingActions((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleCancel = async (requestId: string) => {
    setLoadingActions((prev) => ({ ...prev, [requestId]: true }));
    try {
      const result = await cancelFriendRequest(requestId);

      if (result.success) {
        toast.success("Solicitação cancelada");
        setSentRequests((prev) => prev.filter((r) => r.id !== requestId));
      } else {
        toast.error(result.error || "Erro ao cancelar solicitação");
      }
    } catch (error) {
      toast.error("Erro ao cancelar solicitação");
    } finally {
      setLoadingActions((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  if (isLoading) {
    return <FriendRequestsPageSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="mb-20 min-h-screen w-full flex-col bg-background">
      {/* Hero */}
      <PageHero
        badge="Solicitações"
        title="Solicitações de Amizade"
        subtitle="Gerencie as solicitações recebidas e enviadas"
        actions={[
          { label: "Voltar", href: "/profile/social", variant: "outline" },
        ]}
      />

      {/* Tabs */}
      <div className="sticky top-16 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-2xl">
          <button
            onClick={() => setActiveTab("received")}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors",
              activeTab === "received"
                ? "border-accent text-accent"
                : "border-transparent text-fg-muted hover:text-foreground"
            )}
          >
            <span>Recebidas</span>
            {receivedRequests.length > 0 && (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs text-on-accent">
                {receivedRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors",
              activeTab === "sent"
                ? "border-accent text-accent"
                : "border-transparent text-fg-muted hover:text-foreground"
            )}
          >
            <span>Enviadas</span>
            {sentRequests.length > 0 && (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.2)] text-xs text-accent">
                {sentRequests.length}
              </span>
            )}
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
            {/* Tab: Recebidas */}
            {activeTab === "received" && (
              <div className="space-y-3">
                {receivedRequests.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-surface-card p-8 text-center">
                    <Inbox className="mx-auto mb-3 h-12 w-12 text-fg-subtle" />
                    <h3 className="mb-2 font-semibold text-foreground">
                      Nenhuma solicitação recebida
                    </h3>
                    <p className="text-sm text-fg-muted">
                      Quando alguém te enviar uma solicitação de amizade, ela
                      aparecerá aqui
                    </p>
                  </div>
                ) : (
                  receivedRequests.map((request) => (
                    <div
                      key={request.id}
                      className="card-hover rounded-2xl border border-border bg-surface-card p-4 transition-all duration-300 hover:border-[hsl(var(--accent)/0.3)]"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <UserAvatar
                          src={request.sender.image}
                          name={request.sender.name}
                          email=""
                          size="md"
                          className="h-12 w-12"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-semibold text-foreground">
                            {request.sender.name}
                          </h3>
                          <p className="text-xs capitalize text-fg-muted">
                            {request.sender.role === "BARBER"
                              ? "Barbeiro"
                              : "Cliente"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="gold-shimmer flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90 disabled:opacity-50"
                          onClick={() => handleAccept(request.id)}
                          disabled={loadingActions[request.id]}
                        >
                          {loadingActions[request.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                          Aceitar
                        </button>
                        <button
                          className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.08)] px-4 py-2 text-sm font-semibold text-destructive transition-all duration-300 hover:bg-[hsl(var(--destructive)/0.15)] disabled:opacity-50"
                          onClick={() => handleReject(request.id)}
                          disabled={loadingActions[request.id]}
                        >
                          {loadingActions[request.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          Rejeitar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Enviadas */}
            {activeTab === "sent" && (
              <div className="space-y-3">
                {sentRequests.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-surface-card p-8 text-center">
                    <Users className="mx-auto mb-3 h-12 w-12 text-fg-subtle" />
                    <h3 className="mb-2 font-semibold text-foreground">
                      Nenhuma solicitação enviada
                    </h3>
                    <p className="text-sm text-fg-muted">
                      Suas solicitações pendentes aparecerão aqui
                    </p>
                  </div>
                ) : (
                  sentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="card-hover rounded-2xl border border-border bg-surface-card p-4 transition-all duration-300 hover:border-[hsl(var(--accent)/0.3)]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <UserAvatar
                            src={request.receiver.image}
                            name={request.receiver.name}
                            email=""
                            size="md"
                            className="h-12 w-12"
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-semibold text-foreground">
                              {request.receiver.name}
                            </h3>
                            <p className="text-xs capitalize text-fg-muted">
                              {request.receiver.role === "BARBER"
                                ? "Barbeiro"
                                : "Cliente"}
                            </p>
                          </div>
                        </div>
                        <button
                          className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent disabled:opacity-50"
                          onClick={() => handleCancel(request.id)}
                          disabled={loadingActions[request.id]}
                        >
                          {loadingActions[request.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Cancelar"
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
