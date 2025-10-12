"use client";

import * as React from "react";
import { Header } from "@/components/header";
import { SearchBar } from "@/components/search-bar";
import { ServiceCard } from "@/components/service-card";
import { OfferCard } from "@/components/offer-card";
import { SalonCard } from "@/components/salon-card";
import { ClientReview } from "@/components/ClientReview";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useAuth } from "@/hooks/useAuth";
import { getPublicReviews } from "@/server/reviewActions";
import { useState, useEffect } from "react";

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
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Carregar avaliações reais do banco
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setReviewsLoading(true);
        const result = await getPublicReviews(6);
        
        if (result.success && result.data) {
          // Os dados já vêm formatados da função getPublicReviews
          const clientReviewData = result.data.map((review: any) => ({
            id: review.id,
            mainImage: review.images[0] || "/images/salon1.svg",
            overlayImage: review.images[1] || "/images/salon2.svg", 
            testimonial: review.comment || "Excelente serviço!",
            clientName: review.name,
            clientTitle: "Cliente",
            clientCompany: review.service,
            rating: review.rating,
            serviceDate: review.date,
            serviceType: review.service
          }));
          
          setReviews(clientReviewData);
        } else {
          console.error('Erro ao carregar avaliações:', result.error);
          setReviews([]);
        }
      } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
        // Em caso de erro, usar dados fallback vazios
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    loadReviews();
  }, []);

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
    <div className="mt-16 mb-12 flex flex-col justify-center px-4 w-full bg-[--background]">
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

          {/* CTA para usuários não autenticados */}
          {!isAuthenticated && (
            <section className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6 border border-primary-200">
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

          {/* Avaliações dos Clientes - Modo Público */}
          {!reviewsLoading && reviews.length > 0 && (
            <section className="my-8 -mx-4 sm:-mx-6">
              {/* Header da seção */}
              <div className="px-4 sm:px-6 mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[--text]">💬 Avaliações dos Clientes</h2>
                  <a 
                    href="/client-review-demo"
                    className="text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors"
                  >
                    Ver demo
                  </a>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {reviews.length > 0 ? 
                    `${reviews.length} avaliações reais de nossos clientes` :
                    "Veja o que nossos clientes estão falando"
                  }
                </p>
              </div>
              
              {/* Componente ClientReview */}
              <ClientReview reviews={reviews} />
            </section>
          )}

          {/* Estado vazio para avaliações */}
          {!reviewsLoading && reviews.length === 0 && (
            <section className="my-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[--text]">💬 Avaliações dos Clientes</h2>
                <a 
                  href="/client-review-demo"
                  className="text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors"
                >
                  Ver demo
                </a>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 text-center border border-blue-100">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 text-xl">⭐</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Primeiras avaliações em breve!</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Seja um dos primeiros a deixar sua opinião sobre nossos serviços.
                </p>
                <a 
                  href="/client-review-demo"
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Ver demonstração →
                </a>
              </div>
            </section>
          )}

          {/* Loading state para avaliações */}
          {reviewsLoading && (
            <section className="my-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[--text]">Avaliações dos Clientes</h2>
              </div>
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <div className="animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            </section>
          )}

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
          </section>
      </div>

  </div>
  );
}
