"use client";

import Media from "@/components/media";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import useScrollHeight from "@/hooks/use-scroll-height";
import { cn, generateTenantUrl } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const AUTOPLAY_CONFIG = {
  delay: 5000,
  stopOnInteraction: true,
  stopOnMouseEnter: true,
} as const;

interface Props {
  tenantSlug?: string;
  containerClassName?: string;
}

const HomeBanner = ({ tenantSlug, containerClassName }: Props) => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const plugin = useRef(Autoplay(AUTOPLAY_CONFIG));

  const trpc = useTRPC();
  const [bannerHeight] = useScrollHeight({ ref: bannerRef });

  const [showControls, setShowControls] = useState(false);
  const [viewedBanners, setViewedBanners] = useState<Set<string>>(new Set());

  const { data: banners = [] } = useSuspenseQuery(
    trpc.home.getBannerActive.queryOptions({
      tenantSlug,
      limit: 5,
    })
  );

  const shouldShowControls = banners.length > 1 && showControls;

  const incrementImpressionMutation = useMutation(
    trpc.home.incrementBannerImpression.mutationOptions({})
  );

  const incrementMutation = useMutation(
    trpc.home.incrementBannerClick.mutationOptions({})
  );

  const handleMouseEnter = useCallback(() => {
    plugin.current.stop();
    setShowControls(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    plugin.current.reset();
    setShowControls(false);
  }, []);

  const handleBannerClick = useCallback(
    (bannerId: string) => () => {
      incrementMutation.mutate({ bannerId });
    },
    [incrementMutation]
  );

  const generateBannerUrl = useCallback((banner: (typeof banners)[0]) => {
    if (banner.product) {
      // Link to specific product
      return `${generateTenantUrl(
        typeof banner.tenant === "string" ? "" : banner.tenant.slug
      )}/products/${banner.product.id}`;
    }
    // Link to tenant homepage
    return generateTenantUrl(
      typeof banner.tenant === "string" ? "" : banner.tenant.slug
    );
  }, []);

  // Track impressions khi banner hiển thị
  useEffect(() => {
    if (banners.length > 0) {
      banners.forEach((banner) => {
        if (!viewedBanners.has(banner.id)) {
          incrementImpressionMutation.mutate({ bannerId: banner.id });
          setViewedBanners((prev) => new Set([...prev, banner.id]));
        }
      });
    }
  }, [banners, viewedBanners, incrementImpressionMutation]);

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className={cn("px-4 lg:px-12 pt-8", containerClassName)}>
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
        <div
          className="border rounded-xl overflow-hidden relative"
          style={{ height: bannerHeight ?? "auto" }}
        >
          <div ref={bannerRef}>
            <CarouselContent className="-ml-1">
              {banners.map((banner, index) => (
                <CarouselItem key={banner.id} className="pl-1">
                  <Link
                    href={generateBannerUrl(banner)}
                    className="relative block w-full h-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl group"
                    title={banner.title}
                    onClick={handleBannerClick(banner.id)}
                  >
                    <Media
                      src={banner.image.url || ""}
                      alt={banner.title}
                      fill
                      containerClassName="aspect-[16/9] sm:aspect-[20/9] lg:aspect-[40/9] group-hover:scale-105 transition-transform duration-300"
                      className="object-cover"
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-lg font-semibold">
                          {banner.title}
                        </h3>
                        {banner.description && (
                          <p className="text-sm opacity-90">
                            {banner.description}
                          </p>
                        )}
                        <p className="text-xs opacity-75 mt-1">
                          Visit{" "}
                          {typeof banner.tenant === "string"
                            ? "Store"
                            : banner.tenant.name}
                        </p>
                      </div>
                    </div>
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
        </div>
      </Carousel>
    </div>
  );
};

export const HomeBannerSkeleton = ({ containerClassName }: Props) => {
  return (
    <div className={cn("px-4 lg:px-12 py-4 lg:py-6", containerClassName)}>
      <div className="border rounded-xl overflow-hidden aspect-[16/9] sm:aspect-[20/9] lg:aspect-[40/9] bg-muted animate-pulse" />
    </div>
  );
};

export default HomeBanner;
