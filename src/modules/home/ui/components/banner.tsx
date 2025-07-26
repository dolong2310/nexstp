"use client";

import Media from "@/components/media";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";

const BANNER_IMAGES = [
  {
    src: "/auth-bg.jpg",
    alt: "Featured Collection - Summer Sale",
    href: "/collections/summer-sale",
    title: "Summer Sale - Up to 50% Off",
  },
  {
    src: "/auth-bg.jpg",
    alt: "New Arrivals - Spring Collection",
    href: "/collections/new-arrivals",
    title: "New Spring Collection",
  },
  {
    src: "/auth-bg.jpg",
    alt: "Best Sellers - Top Products",
    href: "/collections/best-sellers",
    title: "Best Selling Products",
  },
  {
    src: "/auth-bg.jpg",
    alt: "Special Offer - Limited Time",
    href: "/collections/special-offers",
    title: "Limited Time Special Offers",
  },
  {
    src: "/auth-bg.jpg",
    alt: "Premium Collection - Luxury Items",
    href: "/collections/premium",
    title: "Premium Luxury Collection",
  },
] as const;

const AUTOPLAY_CONFIG = {
  delay: 4000,
  stopOnInteraction: true,
  stopOnMouseEnter: true,
} as const;

interface Props {
  containerClassName?: string;
}

const Banner = ({ containerClassName }: Props) => {
  const plugin = useRef(Autoplay(AUTOPLAY_CONFIG));
  const [showControls, setShowControls] = useState(false);

  const handleMouseEnter = useCallback(() => {
    plugin.current.stop();
    setShowControls(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    plugin.current.reset();
    setShowControls(false);
  }, []);

  const shouldShowControls = BANNER_IMAGES.length > 1 && showControls;

  return (
    <div className={cn("px-4 lg:px-12 py-4 lg:py-6", containerClassName)}>
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <div className="border rounded-xl overflow-hidden relative">
          <CarouselContent className="-ml-1">
            {BANNER_IMAGES.map((banner, index) => (
              <CarouselItem key={index} className="pl-1">
                <Link
                  href={banner.href}
                  className="block w-full h-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl"
                  title={banner.title}
                >
                  <Media
                    src={banner.src}
                    alt={banner.alt}
                    fill
                    containerClassName="aspect-[16/9] sm:aspect-[20/9] lg:aspect-[40/9] group-hover:scale-105 transition-transform duration-300"
                    className="object-cover"
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                  />
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>

          {shouldShowControls && (
            <>
              <CarouselPrevious className="left-4 z-10 animate-in fade-in-0 duration-200" />
              <CarouselNext className="right-4 z-10 animate-in fade-in-0 duration-200" />
            </>
          )}
        </div>
      </Carousel>
    </div>
  );
};

export default Banner;
