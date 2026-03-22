import { Suspense } from "react";
import ErrorContent from "./components/ErrorContent";

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
