"use client";

import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface PaymentStatusProps {
  status: "success" | "error" | "processing" | "canceled";
  title: string;
  description: string;
  planType?: string;
  sessionId?: string;
}

export function PaymentStatus({
  status,
  title,
  description,
  planType,
  sessionId,
}: PaymentStatusProps) {
  const router = useRouter();

  const statusIcons = {
    success: (
      <CheckCircle className="h-12 w-12 text-green-500 animate-in fade-in-50" />
    ),
    error: <XCircle className="h-12 w-12 text-red-500 animate-in fade-in-50" />,
    canceled: (
      <AlertCircle className="h-12 w-12 text-yellow-500 animate-in fade-in-50" />
    ),
    processing: (
      <Loader2 className="h-12 w-12 animate-spin text-purple-500 animate-in fade-in-50" />
    ),
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <div className="max-w-2xl space-y-6">
        {statusIcons[status]}
        <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl md:text-5xl">
          {title}
        </h1>
        <p className="mx-auto max-w-[600px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          {description}
        </p>
        {planType && (
          <div className="text-sm text-gray-400">Plano: {planType}</div>
        )}
        {sessionId && (
          <div className="text-sm text-gray-400">
            ID da Sessão: {sessionId.slice(0, 8)}...
          </div>
        )}
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          {/*<button
            onClick={() => router.push("/dashboard")}
            className="inline-flex h-10 items-center justify-center rounded-md bg-purple-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-700 disabled:pointer-events-none disabled:opacity-50"
          >
            Ir para Dashboard
          </button>*/}
          <button
            onClick={() => router.push("/prices")}
            className="inline-flex h-10 items-center justify-center rounded-md border border-gray-700 px-8 text-sm font-medium text-gray-300 shadow-sm transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-700 disabled:pointer-events-none disabled:opacity-50"
          >
            Ver Planos
          </button>
        </div>
      </div>
    </div>
  );
}
