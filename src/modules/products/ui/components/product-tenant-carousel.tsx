"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_LIMIT } from "@/constants";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import ProductCard, { ProductCardSkeleton } from "./product-card";

interface TenantProductsCarouselProps {
  tenantSlug: string;
  currentProductId: string;
  tenantName: string;
}

const AUTOPLAY_CONFIG = {
  delay: 5000,
  stopOnInteraction: true,
  stopOnMouseEnter: true,
} as const;

const TenantProductsCarousel = ({
  tenantSlug,
  currentProductId,
  tenantName,
}: TenantProductsCarouselProps) => {
  const plugin = useRef(Autoplay(AUTOPLAY_CONFIG));

  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.products.getMany.queryOptions({
      tenantSlug,
      limit: DEFAULT_LIMIT,
    })
  );

  // Lọc bỏ sản phẩm hiện tại
  const filteredProducts =
    data?.docs?.filter((product) => product.id !== currentProductId) || [];

  if (filteredProducts.length === 0) return null;

  return (
    <div className="py-6">
      <Carousel
        plugins={[plugin.current]}
        className="relative space-y-4"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xl font-medium truncate overflow-hidden">
            More from {tenantName}
          </h3>
          <div className="flex items-center gap-2">
            <CarouselPrevious className="relative top-auto right-auto left-auto bottom-auto translate-y-0 animate-in fade-in-0 duration-200" />
            <CarouselNext className="relative top-auto right-auto left-auto bottom-auto translate-y-0 animate-in fade-in-0 duration-200" />
          </div>
        </div>

        <CarouselContent>
          {filteredProducts.map((product) => (
            <CarouselItem
              key={product.id}
              className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4 pb-1.5 pr-1.5"
            >
              <ProductCard
                id={product.id}
                name={product.name}
                imageUrl={product.image?.url}
                authorUsername={product.tenant.slug}
                authorImageUrl={product.tenant.image?.url}
                reviewRating={product.reviewRating}
                reviewCount={product.reviewCount}
                price={product.price}
                tenantSlug={product.tenant.slug}
                isPurchased={product.isPurchased}
                isOwner={product.isOwner}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export const TenantProductsCarouselSkeleton = () => {
  return (
    <div className="py-6">
      <Carousel className="relative space-y-4" opts={{ align: "start" }}>
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-xl font-medium whitespace-nowrap">
            More from <Skeleton className="shrink-0 h-6 w-full" />
          </h3>
          <div className="flex items-center gap-2">
            <CarouselPrevious
              disabled
              className="relative top-auto right-auto left-auto bottom-auto translate-y-0 animate-in fade-in-0 duration-200"
            />
            <CarouselNext
              disabled
              className="relative top-auto right-auto left-auto bottom-auto translate-y-0 animate-in fade-in-0 duration-200"
            />
          </div>
        </div>

        <CarouselContent>
          {Array.from({ length: 4 }).map((_, index) => (
            <CarouselItem
              key={index}
              className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4 pb-1.5 pr-1.5"
            >
              <ProductCardSkeleton />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default TenantProductsCarousel;
