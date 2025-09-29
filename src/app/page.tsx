"use client"

import * as React from "react"
import { Header } from "@/components/header"
import { SearchBar } from "@/components/search-bar"
import { ServiceCard } from "@/components/service-card"
import { OfferCard } from "@/components/offer-card"
import { SalonCard } from "@/components/salon-card"
import { BottomNavigation } from "@/components/bottom-navigation"

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
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedService, setSelectedService] = React.useState("haircuts")

  // Dados dos serviços disponíveis
  const services = [
    {
      id: "haircuts",
      name: "Haircuts",
      icon: "✂️"
    },
    {
      id: "nail",
      name: "Nail",
      icon: "💅"
    },
    {
      id: "facial",
      name: "Facial",
      icon: "🧴"
    }
  ]

  // Dados das ofertas especiais
  const offers = [
    {
      id: "haircut-offer",
      title: "Haircut",
      discount: "30% Free",
      period: "Aug 12-Aug 27"
    }
  ]

  // Dados dos salões próximos
  const nearbySalons = [
    {
      id: "salon-1",
      name: "Premium Barbershop",
      image: "/images/salon1.svg",
      rating: 4.8,
      reviewCount: 127,
      location: "Centro, São Paulo",
      distance: "1.2 km"
    },
    {
      id: "salon-2", 
      name: "Classic Cuts",
      image: "/images/salon2.svg",
      rating: 4.6,
      reviewCount: 89,
      location: "Vila Madalena, São Paulo",
      distance: "2.1 km"
    }
  ]

  // Itens da navegação inferior
  const navigationItems = [
    {
      id: "home",
      label: "Home",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      )
    },
    {
      id: "search",
      label: "Search", 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      id: "bookings",
      label: "Bookings",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: "profile",
      label: "Profile",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <Header
        userName="smith"
        onFilterClick={() => console.log("Filter clicked")}
      />

      {/* Conteúdo principal */}
      <main className="px-6 py-6 space-y-8">
        {/* Barra de busca */}
        <SearchBar
          placeholder="Search..."
          value={searchTerm}
          onChange={setSearchTerm}
          onSubmit={(value) => console.log("Search:", value)}
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
            <h2 className="text-xl font-bold text-gray-900">Eid offers</h2>
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
                onGetOffer={() => console.log("Get offer:", offer.id)}
              />
            ))}
          </div>
        </section>

        {/* Salões próximos */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Nearby salons</h2>
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
                onClick={() => console.log("Salon clicked:", salon.id)}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Navegação inferior */}
      <BottomNavigation
        items={navigationItems}
        activeItem="home"
      />
    </div>
  )
}
