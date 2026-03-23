"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/ReviewForm";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

interface ReviewSystemManagerProps {
  userId: string;
}

export function ReviewSystemManager({ userId }: ReviewSystemManagerProps) {
  const [serviceHistoryId, setServiceHistoryId] = useState<string | null>(null);
  const [isCreatingTestData, setIsCreatingTestData] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasCheckedExisting, setHasCheckedExisting] = useState(false);

  // Verificar se já existe serviceHistory disponível
  useEffect(() => {
    checkExistingServiceHistory();
  }, []);

  const checkExistingServiceHistory = async () => {
    try {
      const response = await fetch("/api/test/create-review-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (result.success && result.data?.serviceHistoryId) {
        setServiceHistoryId(result.data.serviceHistoryId);
        setMessage(
          "Você já possui um histórico de serviço disponível para avaliação!"
        );
        setIsSuccess(true);
      }
    } catch (error) {
      console.log("Nenhum histórico encontrado, usuário precisará criar um.");
    } finally {
      setHasCheckedExisting(true);
    }
  };

  const createTestData = async () => {
    setIsCreatingTestData(true);
    setMessage("");

    try {
      const response = await fetch("/api/test/create-review-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (result.success) {
        setServiceHistoryId(result.data.serviceHistoryId);
        setMessage(result.message);
        setIsSuccess(true);
      } else {
        setMessage(result.error || "Erro ao criar dados de teste");
        setIsSuccess(false);
      }
    } catch (error) {
      console.error("Erro:", error);
      setMessage("Erro de conexão com o servidor");
      setIsSuccess(false);
    } finally {
      setIsCreatingTestData(false);
    }
  };

  // Se ainda está verificando, mostra loading
  if (!hasCheckedExisting) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
        <span className="ml-3 text-sm text-fg-muted">Verificando histórico de serviços...</span>
      </div>
    );
  }

  // Se já tem serviceHistory, mostra direto o formulário
  if (serviceHistoryId) {
    return (
      <div className="space-y-6">
        {message && (
          <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--success)/0.3)] bg-[hsl(var(--success)/0.08)] px-4 py-3">
            <CheckCircle className="h-5 w-5 shrink-0 text-[hsl(var(--success))]" />
            <p className="text-sm font-medium text-foreground">{message}</p>
          </div>
        )}

        <ReviewForm
          serviceHistoryId={serviceHistoryId}
          onSuccess={() => {
            setMessage("Avaliação enviada com sucesso!");
            setServiceHistoryId(null);
          }}
        />
      </div>
    );
  }

  // Se não tem serviceHistory, mostra opção para criar
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-card p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
        <div>
          <h4 className="font-semibold text-foreground">Nenhum Serviço Pendente</h4>
          <p className="mt-1 text-sm text-fg-muted">
            Você só pode avaliar serviços concluídos. Complete um atendimento para deixar sua avaliação.
          </p>
        </div>
      </div>

      <Button onClick={createTestData} disabled={isCreatingTestData} className="w-full">
        {isCreatingTestData ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Verificando serviços...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Verificar Serviços Concluídos
          </>
        )}
      </Button>

      {message && !isSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          <p className="text-sm font-medium text-foreground">{message}</p>
        </div>
      )}
    </div>
  );
}
