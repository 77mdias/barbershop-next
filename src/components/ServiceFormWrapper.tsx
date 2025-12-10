"use client";

import { useRouter } from "next/navigation";
import ServiceForm from "@/components/ServiceForm";
import type { CreateServiceInput } from "@/schemas/serviceSchemas";

interface ServiceFormWrapperProps {
  initialData?: Partial<CreateServiceInput> & { id?: string };
  redirectPath?: string;
}

export default function ServiceFormWrapper({
  initialData,
  redirectPath = "/dashboard/admin/services",
}: ServiceFormWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    router.push(redirectPath);
    router.refresh();
  };

  const handleCancel = () => {
    router.push(redirectPath);
  };

  return (
    <ServiceForm
      initialData={initialData}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
