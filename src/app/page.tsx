"use client";

import * as React from "react";
import { Header } from "@/components/header";
import { SearchBar } from "@/components/search-bar";
import { ServiceCard } from "@/components/service-card";
import { OfferCard } from "@/components/offer-card";
import { SalonCard } from "@/components/salon-card";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useAuth } from "@/hooks/useAuth";

/**
 * Página principal da aplicação Barbershop
 *
 * Implementa o layout completo baseado na imagem de referência:
 * - Header com saudação e avatar
 * - Barra de busca
 * - Seção de serviços (Haircuts, Nail, Facial)
 * - Ofertas especiais (Eid offers)
 * - Salões próximos (Nearby salons)
 * - Navegação inferior
 */
export default function Home() {
  const { user, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedService, setSelectedService] = React.useState("haircuts");

  // Dados dos serviços disponíveis
  const services = [
    {
      id: "haircuts",
      name: "Haircuts",
      icon: "✂️",
    },
    {
      id: "nail",
      name: "Nail",
      icon: "💅",
    },
    {
      id: "facial",
      name: "Facial",
      icon: "🧴",
    },
  ];

  // Dados das ofertas especiais
  const offers = [
    {
      id: "haircut-offer",
      title: "Haircut",
      discount: "30% Free",
      period: "Aug 12-Aug 27",
    },
  ];

  // Dados dos salões próximos
  const nearbySalons = [
    {
      id: "salon-1",
      name: "Premium Barbershop",
      image: "/images/salon1.svg",
      rating: 4.8,
      reviewCount: 127,
      location: "Centro, São Paulo",
      distance: "1.2 km",
    },
    {
      id: "salon-2",
      name: "Classic Cuts",
      image: "/images/salon2.svg",
      rating: 4.6,
      reviewCount: 89,
      location: "Vila Madalena, São Paulo",
      distance: "2.1 km",
    },
  ];

  // Exibe loading enquanto carrega dados do usuário
  if (isLoading) {
    return (
      <div className="min-h-screen flex ">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mt-12 min-h-screen bg-[--background]">
      {/* Header */}
      <Header
        userName={user?.name || user?.email?.split('@')[0] || "Usuário"}
        onFilterClick={() => {
          /* TODO: Implement filter functionality */
        }}
      />

      {/* Conteúdo principal */}
      <main className="px-6 py-6 space-y-8">
        {/* Barra de busca */}
        <SearchBar
          placeholder="Search..."
          value={searchTerm}
          onChange={setSearchTerm}
          onSubmit={(_value) => {
            /* TODO: Implement search functionality */
          }}
        />

        {/* Seção de serviços */}
        <section>
          <div className="flex justify-center gap-8">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                name={service.name}
                icon={service.icon}
                isActive={selectedService === service.id}
                onClick={() => setSelectedService(service.id)}
              />
            ))}
          </div>
        </section>

        {/* Ofertas especiais */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[--text]">Eid offers</h2>
            <button className="text-primary-600 text-sm font-medium">
              See all
            </button>
          </div>

          <div className="space-y-4">
            {offers.map((offer) => (
              <OfferCard
                key={offer.id}
                title={offer.title}
                discount={offer.discount}
                period={offer.period}
                onGetOffer={() => {
                  /* TODO: Implement get offer functionality */
                }}
              />
            ))}
          </div>
        </section>

        {/* Salões próximos */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[--text]">Nearby salons</h2>
            <button className="text-primary-600 text-sm font-medium">
              See all
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {nearbySalons.map((salon) => (
              <SalonCard
                key={salon.id}
                name={salon.name}
                image={salon.image}
                rating={salon.rating}
                reviewCount={salon.reviewCount}
                location={salon.location}
                distance={salon.distance}
                onClick={() => {
                  /* TODO: Implement salon details navigation */
                }}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
