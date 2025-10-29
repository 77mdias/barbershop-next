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
  const { user, isLoading, isAuthenticated } = useAuth();

  return (
    <div className="w-full h-full flex flex-col mt-16  items-center  justify-start py-4">
      <div className="container mx-auto mb-20 flex flex-col w-full justify-center ">
        {/* Header da aplicação */}
        <Header
          userName={isAuthenticated ? (user?.name || user?.email?.split('@')[0] || "Usuário") : "Visitante"}
          userImage={isAuthenticated ? user?.image : undefined}
          onFilterClick={() => {
            /* TODO: Implement filter functionality */
          }}
        />
        
        {/* Espaçamento para compensar o header fixo */}
        <div>
          {/* Seção principal da galeria */}
          <CortesGallerySection />
        </div>
      </div>
    </div>
  );
}