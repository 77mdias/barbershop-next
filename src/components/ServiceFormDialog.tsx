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
import ServiceForm from "@/components/ServiceForm";
import type { CreateServiceInput } from "@/schemas/serviceSchemas";

interface ServiceFormDialogProps {
  trigger: React.ReactNode;
  initialData?: Partial<CreateServiceInput> & { id?: string };
  title?: string;
  description?: string;
  onSuccess?: () => void;
}

export default function ServiceFormDialog({
  trigger,
  initialData,
  title,
  description,
  onSuccess,
}: ServiceFormDialogProps) {
  const [open, setOpen] = useState(false);

  const isEdit = !!initialData?.id;
  const defaultTitle = isEdit ? "Editar Serviço" : "Novo Serviço";
  const defaultDescription = isEdit
    ? "Atualize as informações do serviço"
    : "Preencha os dados para criar um novo serviço";

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title || defaultTitle}</DialogTitle>
          <DialogDescription>
            {description || defaultDescription}
          </DialogDescription>
        </DialogHeader>
        <ServiceForm
          initialData={initialData}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
