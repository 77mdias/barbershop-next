"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Edit, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { togglePromotionStatus } from "@/server/promotionAdminActions";
import PromotionDeleteDialog from "@/components/PromotionDeleteDialog";

interface PromotionTableActionsProps {
  promotion: {
    id: string;
    name: string;
    active: boolean;
    _count?: {
      appointments?: number;
    };
  };
}

export default function PromotionTableActions({ promotion }: PromotionTableActionsProps) {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);

  const hasUsage = (promotion._count?.appointments || 0) > 0;

  const handleToggleStatus = async () => {
    setIsToggling(true);

    try {
      const result = await togglePromotionStatus(promotion.id);

      if (result.success) {
        toast.success(result.message || "Status da promoção alterado com sucesso");
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao alterar status da promoção");
      }
    } catch (error) {
      console.error("Erro ao alterar status da promoção:", error);
      toast.error("Erro inesperado ao alterar status");
    } finally {
      setIsToggling(false);
    }
  };

  const handleDeleteSuccess = () => {
    router.refresh();
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href={`/dashboard/admin/promotions/${promotion.id}/edit`}>
          <Edit className="w-4 h-4" />
        </Link>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className={
          promotion.active
            ? "text-orange-600 hover:bg-orange-50"
            : "text-green-600 hover:bg-green-50"
        }
        onClick={handleToggleStatus}
        disabled={isToggling}
      >
        <Power className="w-4 h-4" />
      </Button>

      <PromotionDeleteDialog
        trigger={
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        }
        promotionId={promotion.id}
        promotionName={promotion.name}
        hasUsage={hasUsage}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}