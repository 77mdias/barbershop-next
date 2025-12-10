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
import { deletePromotion } from "@/server/promotionAdminActions";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";

interface PromotionDeleteDialogProps {
  trigger: React.ReactNode;
  promotionId: string;
  promotionName: string;
  hasUsage?: boolean;
  onSuccess?: () => void;
}

export default function PromotionDeleteDialog({
  trigger,
  promotionId,
  promotionName,
  hasUsage = false,
  onSuccess,
}: PromotionDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deletePromotion(promotionId);

      if (result.success) {
        toast.success(result.message || "Promoção processada com sucesso");
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "Erro ao deletar promoção");
      }
    } catch (error) {
      console.error("Erro ao deletar promoção:", error);
      toast.error("Erro inesperado ao deletar promoção");
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
              Tem certeza que deseja deletar a promoção {" "}
              <strong>&quot;{promotionName}&quot;</strong>?
            </p>

            {hasUsage ? (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Aviso:</strong> Esta promoção já foi utilizada em agendamentos. Ela será marcada como inativa em vez de ser deletada permanentemente.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Aviso:</strong> Esta ação não pode ser desfeita. A promoção será deletada permanentemente.
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
              ? "Processando..."
              : hasUsage
              ? "Desativar Promoção"
              : "Deletar Permanentemente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}