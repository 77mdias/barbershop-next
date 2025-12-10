"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PromotionForm from "@/components/PromotionForm";
import type { CreatePromotionInput } from "@/schemas/promotionSchemas";

type ServiceOption = {
  id: string;
  name: string;
  active: boolean;
};

interface PromotionFormDialogProps {
  trigger: React.ReactNode;
  initialData?: Partial<CreatePromotionInput> & { id?: string };
  availableServices: ServiceOption[];
  title?: string;
  description?: string;
  onSuccess?: () => void;
}

export default function PromotionFormDialog({
  trigger,
  initialData,
  availableServices,
  title,
  description,
  onSuccess,
}: PromotionFormDialogProps) {
  const [open, setOpen] = useState(false);

  const isEdit = !!initialData?.id;
  const defaultTitle = isEdit ? "Editar Promoção" : "Nova Promoção";
  const defaultDescription = isEdit
    ? "Atualize as informações da promoção"
    : "Preencha os dados para criar uma nova promoção";

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title || defaultTitle}</DialogTitle>
          <DialogDescription>
            {description || defaultDescription}
          </DialogDescription>
        </DialogHeader>
        <PromotionForm
          initialData={initialData}
          availableServices={availableServices}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}