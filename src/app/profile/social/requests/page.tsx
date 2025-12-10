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
  Users,
  Loader2,
  UserCheck,
  X,
  Inbox
} from "lucide-react";
import {
  getReceivedRequests,
  getSentRequests,
  respondFriendRequest,
  cancelFriendRequest,
} from "@/server/friendshipActions";
import { FriendRequestsPageSkeleton } from "@/components/social/SocialSkeleton";

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
  const [activeTab, setActiveTab] = React.useState<"received" | "sent">("received");
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [receivedRequests, setReceivedRequests] = React.useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = React.useState<FriendRequest[]>([]);
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
      const result = await respondFriendRequest({ requestId, action: "ACCEPT" });

      if (result.success) {
        toast.success("Solicitação aceita!");
        setReceivedRequests((prev) => prev.filter((r) => r.id !== requestId));
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
      const result = await respondFriendRequest({ requestId, action: "REJECT" });

      if (result.success) {
        toast.success("Solicitação rejeitada");
        setReceivedRequests((prev) => prev.filter((r) => r.id !== requestId));
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
    <div className="min-h-screen mt-16 mb-20 w-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="flex items-center justify-between px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Solicitações de Amizade</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Tabs */}
        <div className="flex border-t">
          <button
            onClick={() => setActiveTab("received")}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors border-b-2 relative",
              activeTab === "received"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <span>Recebidas</span>
              {receivedRequests.length > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {receivedRequests.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors border-b-2 relative",
              activeTab === "sent"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <span>Enviadas</span>
              {sentRequests.length > 0 && (
                <span className="bg-gray-400 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {sentRequests.length}
                </span>
              )}
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
            {/* Tab: Recebidas */}
            {activeTab === "received" && (
              <div className="space-y-3">
                {receivedRequests.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
                    <Inbox className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Nenhuma solicitação recebida
                    </h3>
                    <p className="text-sm text-gray-500">
                      Quando alguém te enviar uma solicitação de amizade, ela aparecerá aqui
                    </p>
                  </div>
                ) : (
                  receivedRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <UserAvatar
                          src={request.sender.image}
                          name={request.sender.name}
                          email=""
                          size="md"
                          className="w-12 h-12"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {request.sender.name}
                          </h3>
                          <p className="text-xs text-gray-500 capitalize">
                            {request.sender.role === "BARBER" ? "Barbeiro" : "Cliente"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleAccept(request.id)}
                          disabled={loadingActions[request.id]}
                        >
                          {loadingActions[request.id] ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <UserCheck className="h-4 w-4 mr-1" />
                          )}
                          Aceitar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600 hover:bg-red-50"
                          onClick={() => handleReject(request.id)}
                          disabled={loadingActions[request.id]}
                        >
                          {loadingActions[request.id] ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <X className="h-4 w-4 mr-1" />
                          )}
                          Rejeitar
                        </Button>
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
                  <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Nenhuma solicitação enviada
                    </h3>
                    <p className="text-sm text-gray-500">
                      Suas solicitações pendentes aparecerão aqui
                    </p>
                  </div>
                ) : (
                  sentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <UserAvatar
                            src={request.receiver.image}
                            name={request.receiver.name}
                            email=""
                            size="md"
                            className="w-12 h-12"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {request.receiver.name}
                            </h3>
                            <p className="text-xs text-gray-500 capitalize">
                              {request.receiver.role === "BARBER" ? "Barbeiro" : "Cliente"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-600"
                          onClick={() => handleCancel(request.id)}
                          disabled={loadingActions[request.id]}
                        >
                          {loadingActions[request.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Cancelar"
                          )}
                        </Button>
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
