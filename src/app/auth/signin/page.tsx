import { Suspense } from "react";
import SignInForm from "./components/SignInForm";
import ProjectInfo from "@/components/ProjectInfo";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--all-black)]">
          <div className="text-white">Carregando...</div>
        </div>
      }
    >
      <SignInForm />
      <ProjectInfo />
    </Suspense>
  );
}
