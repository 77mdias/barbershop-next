"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit, RotateCcw, Trash2 } from "lucide-react";
import { restoreUser, softDeleteUser } from "@/server/userActions";
import { toast } from "sonner";

interface UserTableActionsProps {
  user: {
    id: string;
    name: string;
    role: string;
    isActive: boolean;
    deletedAt: Date | string | null;
  };
  showEditButton?: boolean;
}

export function UserTableActions({ user, showEditButton = true }: UserTableActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isDeleted = Boolean(user.deletedAt);

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Deseja remover o usuário "${user.name}"? A conta será desativada e poderá ser restaurada depois.`,
    );

    if (!confirmed) return;

    startTransition(async () => {
      const result = await softDeleteUser({ id: user.id });

      if (result.success) {
        toast.success(result.message || "Usuário removido com sucesso");
        router.refresh();
      } else {
        toast.error(result.error || "Não foi possível remover o usuário");
      }
    });
  };

  const handleRestore = () => {
    startTransition(async () => {
      const result = await restoreUser({ id: user.id });

      if (result.success) {
        toast.success(result.message || "Usuário restaurado");
        router.refresh();
      } else {
        toast.error(result.error || "Não foi possível restaurar o usuário");
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {showEditButton && (
        <Button asChild variant="outline" size="sm" disabled={isPending}>
          <Link href={`/dashboard/admin/users/${user.id}`}>
            <Edit className="w-4 h-4" />
          </Link>
        </Button>
      )}

      {isDeleted ? (
        <Button
          variant="outline"
          size="sm"
          className="text-green-600 hover:bg-green-50"
          onClick={handleRestore}
          disabled={isPending}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 hover:bg-red-50"
          onClick={handleDelete}
          disabled={isPending}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
