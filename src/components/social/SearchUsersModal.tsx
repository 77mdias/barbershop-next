"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Search,
  Loader2,
  UserPlus,
  UserCheck,
  Users,
  X,
  Clock
} from "lucide-react";
import { searchUsers, sendFriendRequest } from "@/server/friendshipActions";

type UserRole = "CLIENT" | "BARBER" | "ADMIN";

type FilterType = "all" | "clients" | "barbers";

interface SearchResult {
  id: string;
  name: string;
  nickname: string | null;
  image: string | null;
  role: UserRole;
}

interface SearchUsersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFriends?: string[];
  pendingRequests?: string[];
}

export function SearchUsersModal({
  open,
  onOpenChange,
  currentFriends = [],
  pendingRequests = [],
}: SearchUsersModalProps) {
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<FilterType>("all");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [loadingActions, setLoadingActions] = React.useState<Record<string, boolean>>({});
  const [hasSearched, setHasSearched] = React.useState(false);

  // Debounced search
  React.useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      await performSearch(query);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, filter]);

  const performSearch = async (searchQuery: string) => {
    try {
      const result = await searchUsers({
        query: searchQuery,
        excludeFriends: true,
        page: 1,
        limit: 20,
      });

      if (result.success && result.data) {
        // Aplicar filtro de role
        let filteredResults = result.data;
        if (filter === "clients") {
          filteredResults = result.data.filter((u) => u.role === "CLIENT");
        } else if (filter === "barbers") {
          filteredResults = result.data.filter((u) => u.role === "BARBER");
        }

        setResults(filteredResults);
        setHasSearched(true);
      } else {
        toast.error(result.error || "Erro ao buscar usuários");
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      toast.error("Erro ao buscar usuários");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    setLoadingActions((prev) => ({ ...prev, [userId]: true }));
    try {
      const result = await sendFriendRequest({ receiverId: userId });

      if (result.success) {
        toast.success("Solicitação enviada com sucesso!");
        // Atualizar lista local
        setResults((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, hasPendingRequest: true } : user
          )
        );
      } else {
        toast.error(result.error || "Erro ao enviar solicitação");
      }
    } catch (error) {
      toast.error("Erro ao enviar solicitação");
    } finally {
      setLoadingActions((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const getUserStatus = (userId: string) => {
    if (currentFriends.includes(userId)) return "friend";
    if (pendingRequests.includes(userId)) return "pending";
    return "none";
  };

  const getStatusBadge = (userId: string) => {
    const status = getUserStatus(userId);

    if (status === "friend") {
      return (
        <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <UserCheck className="h-3 w-3" />
          <span>Amigo</span>
        </div>
      );
    }

    if (status === "pending") {
      return (
        <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
          <Clock className="h-3 w-3" />
          <span>Pendente</span>
        </div>
      );
    }

    return null;
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Buscar Usuários</DialogTitle>
        </DialogHeader>

        <div className="px-6 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10"
              autoFocus
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className="flex-1"
            >
              <Users className="h-4 w-4 mr-1" />
              Todos
            </Button>
            <Button
              variant={filter === "clients" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("clients")}
              className="flex-1"
            >
              Clientes
            </Button>
            <Button
              variant={filter === "barbers" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("barbers")}
              className="flex-1"
            >
              Barbeiros
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {isSearching && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}

          {!isSearching && query.length < 2 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">
                Digite pelo menos 2 caracteres para buscar
              </p>
            </div>
          )}

          {!isSearching && hasSearched && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-900 font-medium mb-1">
                Nenhum resultado encontrado
              </p>
              <p className="text-xs text-gray-500">
                Tente buscar por outro nome ou email
              </p>
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div className="space-y-2 mt-4">
              {results.map((user) => {
                const status = getUserStatus(user.id);
                const canSendRequest = status === "none";

                return (
                  <div
                    key={user.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all",
                      "hover:border-blue-200 hover:bg-blue-50/50"
                    )}
                  >
                    <UserAvatar
                      src={user.image}
                      name={user.name}
                      email=""
                      size="md"
                      className="w-12 h-12 flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {user.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500 capitalize">
                          {user.role === "BARBER" ? "Barbeiro" : "Cliente"}
                        </span>
                        {getStatusBadge(user.id)}
                      </div>
                    </div>

                    {canSendRequest ? (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleSendRequest(user.id)}
                        disabled={loadingActions[user.id]}
                        className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                      >
                        {loadingActions[user.id] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-1" />
                            Adicionar
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="w-[100px]" /> // Spacer para manter alinhamento
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
