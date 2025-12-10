"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Power, Trash2 } from "lucide-react";
import Link from "next/link";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { toggleServiceStatus } from "@/server/serviceAdminActions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ServiceTableActionsProps {
  service: {
    id: string;
    name: string;
    active: boolean;
    _count?: {
      appointments?: number;
      serviceHistory?: number;
    };
  };
}

export default function ServiceTableActions({
  service,
}: ServiceTableActionsProps) {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);

  const hasHistory =
    (service._count?.appointments || 0) > 0 ||
    (service._count?.serviceHistory || 0) > 0;

  const handleToggleStatus = async () => {
    setIsToggling(true);

    try {
      const result = await toggleServiceStatus(service.id);

      if (result.success) {
        toast.success(
          result.message || "Status do serviço alterado com sucesso"
        );
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao alterar status do serviço");
      }
    } catch (error) {
      console.error("Erro ao alterar status:", error);
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
      {/* Botão Editar */}
      <Button asChild variant="outline" size="sm">
        <Link href={`/dashboard/admin/services/${service.id}/edit`}>
          <Edit className="w-4 h-4" />
        </Link>
      </Button>

      {/* Botão Toggle Status */}
      <Button
        variant="outline"
        size="sm"
        className={
          service.active
            ? "text-orange-600 hover:bg-orange-50"
            : "text-green-600 hover:bg-green-50"
        }
        onClick={handleToggleStatus}
        disabled={isToggling}
      >
        <Power className="w-4 h-4" />
      </Button>

      {/* Botão Deletar */}
      <DeleteConfirmDialog
        trigger={
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        }
        serviceId={service.id}
        serviceName={service.name}
        hasHistory={hasHistory}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
