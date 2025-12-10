"use client";

import { useRouter } from "next/navigation";
import PromotionForm from "@/components/PromotionForm";
import type { CreatePromotionInput } from "@/schemas/promotionSchemas";

type ServiceOption = {
  id: string;
  name: string;
  active: boolean;
};

interface PromotionFormWrapperProps {
  initialData?: Partial<CreatePromotionInput> & { id?: string };
  availableServices: ServiceOption[];
  redirectPath?: string;
}

export default function PromotionFormWrapper({
  initialData,
  availableServices,
  redirectPath = "/dashboard/admin/promotions",
}: PromotionFormWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    router.push(redirectPath);
    router.refresh();
  };

  const handleCancel = () => {
    router.push(redirectPath);
  };

  return (
    <PromotionForm
      initialData={initialData}
      availableServices={availableServices}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}