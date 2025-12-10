"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteService } from "@/server/serviceAdminActions";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteConfirmDialogProps {
  trigger: React.ReactNode;
  serviceId: string;
  serviceName: string;
  hasHistory?: boolean;
  onSuccess?: () => void;
}

export default function DeleteConfirmDialog({
  trigger,
  serviceId,
  serviceName,
  hasHistory = false,
  onSuccess,
}: DeleteConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteService(serviceId);

      if (result.success) {
        toast.success(
          result.message || "Serviço processado com sucesso"
        );
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "Erro ao deletar serviço");
      }
    } catch (error) {
      console.error("Erro ao deletar serviço:", error);
      toast.error("Erro inesperado ao deletar serviço");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Confirmar Exclusão
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <p>
              Tem certeza que deseja deletar o serviço{" "}
              <strong>&quot;{serviceName}&quot;</strong>?
            </p>

            {hasHistory ? (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Aviso:</strong> Este serviço possui histórico de
                  agendamentos. Ele será marcado como inativo em vez de ser
                  deletado permanentemente.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Aviso:</strong> Esta ação não pode ser desfeita. O
                  serviço será deletado permanentemente.
                </p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting
              ? "Deletando..."
              : hasHistory
              ? "Desativar Serviço"
              : "Deletar Permanentemente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
