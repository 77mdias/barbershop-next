import { Suspense } from "react";
import SignInForm from "./components/SignInForm";
import { CortesGallerySection } from "@/components/cortes-gallery";
import ReviewPublic from "@/components/reviewPublic";


export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--all-black)]">
          <div className="text-white">Carregando...</div>
        </div>
      }
    >
      <div className="w-full h-full flex flex-col mt-16 items-center  justify-start py-4">
        <div className="container mx-auto flex flex-col gap-8">
          <SignInForm />
          <ReviewPublic />
          <CortesGallerySection />
        </div>
      </div>
    </Suspense>
  );
}
