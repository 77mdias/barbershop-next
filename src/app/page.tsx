import { HeroSearch } from "@/components/home/HeroSearch";
import { HeroServices } from "@/components/home/HeroServices";
import { PromoSection } from "@/components/home/PromoSection";
import { SalonGrid } from "@/components/home/SalonGrid";
import { BookingCTA } from "@/components/home/BookingCTA";
import { Reviews } from "@/components/home/Reviews";
import { Footer } from "@/components/home/Footer";
import { getHomePageData } from "@/server/home/getHomePageData";

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <main className="flex min-h-screen min-w-full flex-col bg-background text-foreground">
      <HeroSearch {...data.hero} />
      <HeroServices
        title={data.services.title}
        subtitle={data.services.subtitle}
        services={data.services.items}
      />
      <PromoSection
        title={data.promotions.title}
        ctaLabel={data.promotions.ctaLabel}
        ctaHref={data.promotions.ctaHref}
        promotions={data.promotions.items}
      />
      <SalonGrid
        title={data.salons.title}
        ctaLabel={data.salons.ctaLabel}
        ctaHref={data.salons.ctaHref}
        salons={data.salons.items}
      />
      <BookingCTA {...data.bookingCta} />
      <Reviews
        title={data.reviews.title}
        subtitle={data.reviews.subtitle}
        reviews={data.reviews.items}
      />
      <Footer {...data.footer} />
    </main>
  );
}
