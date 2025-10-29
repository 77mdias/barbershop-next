import { Suspense } from "react";
import SignUpForm from "./components/SignUpForm";
import { CortesGallerySection } from "@/components/cortes-gallery";


export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--all-black)]">
          <div className="text-white">Carregando...</div>
        </div>
      }
    >
      <div className="w-full h-full flex flex-col mt-16 justify-start py-4">
        <div className="container mx-auto flex flex-col gap-8">
          <SignUpForm />
          <CortesGallerySection />
        </div>
      </div>
    </Suspense>
  );
}
