"use client";

import * as React from "react";
import { Header } from "@/components/header";
import { CortesGallerySection } from "@/components/cortes-gallery";
import { useAuth } from "@/hooks/useAuth";

/**
 * Página dedicada à galeria de cortes da barbershop
 * 
 * Exibe uma coleção organizada de trabalhos realizados,
 * seguindo o padrão de design da aplicação.
 */
export default function GalleryPage() {
  const { user, isLoading } = useAuth();

  return (
    <div className="container mx-auto mt-16 mb-12 flex flex-col w-full justify-center px-4 bg-background">
      {/* Header da aplicação */}
      <Header userName={user?.name || user?.email?.split('@')[0] || 'User'} />
      
      {/* Espaçamento para compensar o header fixo */}
      <div>
        {/* Seção principal da galeria */}
        <CortesGallerySection />
      </div>
    </div>
  );
}