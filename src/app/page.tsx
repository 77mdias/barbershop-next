"use client";

import * as React from "react";
import { Header } from "@/components/header";
import { SearchBar } from "@/components/search-bar";
import { ServiceCard } from "@/components/service-card";
import { OfferCard } from "@/components/offer-card";
import { SalonCard } from "@/components/salon-card";
import ReviewPublic from "@/components/reviewPublic";
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
 * - Avaliações reais dos clientes
 * - Salões próximos (Nearby salons)
 * - Navegação inferior
 */
export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth();
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

  // Exibe loading apenas enquanto está verificando a autenticação inicialmente
  // Se usuário não autenticado, permitir acesso à homepage
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br mt-16 from-blue-50 via-white to-purple-50 items-center  justify-start py-4">
      <div className="container mx-auto  mb-20 flex flex-col justify-center  w-full">
        {/* Header */}
        <Header
          userName={isAuthenticated ? (user?.name || user?.email?.split('@')[0] || "Usuário") : "Visitante"}
          onFilterClick={() => {
            /* TODO: Implement filter functionality */
          }}
        />

        {/* Conteúdo principal */}
        <div>
          <section className="space-y-8">
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

            <ReviewPublic />

            {/* CTA para usuários não autenticados */}
            {!isAuthenticated && (
              <section className="bg-gradient-to-r mx-4 from-primary-50 to-primary-100 rounded-lg p-6 border border-primary-200">
                <div className="text-center">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">
                    🚀 Faça seu primeiro agendamento!
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Crie sua conta e agende seus serviços com os melhores barbeiros da cidade
                  </p>
                  <div className="flex gap-3 justify-center">
                    <a 
                      href="/auth/signup"
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                      Criar Conta
                    </a>
                    <a 
                      href="/auth/signin"
                      className="border border-primary-600 text-primary-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors"
                    >
                      Entrar
                    </a>
                  </div>
                </div>
              </section>
            )}

            {/* Ofertas especiais */}
            <section className="mx-4">
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
            <section className="mx-4">
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
            </section>
        </div>

      </div>
    </div>
  );
}
