"use client";

import Media from "@/components/media";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import useScrollDynamicSize, {
  MAX_SIZE_AVATAR,
  MIN_SIZE_AVATAR,
} from "../../hooks/use-scroll-dynamic-size";

interface Props {
  tenantSlug: string;
}

// const mockBanners = [
//   { id: 1, image: { url: "/auth-bg.jpg" } },
//   { id: 2, image: { url: "/placeholder-bg.jpg" } },
//   { id: 3, image: { url: "/testbanner.jpg" } },
// ];

const formatBannerUrl = (url?: string) =>
  url ? process.env.NEXT_PUBLIC_APP_URL! + url : "/auth-bg.jpg";

const AUTOPLAY_CONFIG = {
  delay: 2000,
} as const;

const TenantBanner = ({ tenantSlug }: Props) => {
  const plugin = useRef(Autoplay(AUTOPLAY_CONFIG));
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.tenants.getOne.queryOptions({
      slug: tenantSlug,
    })
  );

  const { data: banners = [] } = useSuspenseQuery(
    trpc.home.getBannerActive.queryOptions({
      tenantSlug,
      limit: 5,
    })
  );

  const [containerHeight, avatarSize, translateY] = useScrollDynamicSize({});

  return (
    <div className="sticky top-0 left-0 px-4 lg:px-12 py-4 mt-4 z-20 bg-third">
      <div
        className="p-6 overflow-hidden relative z-10 border rounded-xl bg-default-filter"
        style={{
          maxHeight: containerHeight,
          transition: "max-height 0.1s ease-out",
        }}
      >
        {banners.length === 0 ? (
          <div
            className="rounded-xl absolute top-0 right-0 left-0 bottom-0 bg-cover bg-no-repeat opacity-15 z-[-1]"
            style={{
              backgroundImage: `url(${formatBannerUrl(
                banners[0]?.image?.url as string
              )})`,
            }}
          />
        ) : (
          <Carousel
            plugins={[plugin.current]}
            className="rounded-xl absolute top-0 right-0 left-0 bottom-0 opacity-15 z-[-1]"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent
              containerClassName="size-full"
              className="size-full m-0 p-0"
            >
              {banners.map((banner) => (
                <CarouselItem key={banner.id} className="m-0 p-0">
                  <div
                    className="bg-cover bg-no-repeat size-full"
                    style={{
                      backgroundImage: `url(${formatBannerUrl(
                        banner?.image?.url as string
                      )})`,
                    }}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}

        <div
          className="flex gap-4"
          style={{ transform: `translateY(-${translateY}px)` }}
        >
          <Media
            src={data.image?.url || "/default-avatar.png"}
            alt={data.name}
            width={90}
            height={90}
            sizeFallbackIcon="sm"
            containerClassName="shrink-0"
            containerStyle={{
              height: "100%", // TODO: fix this if image get error (hardcode for show error image state for debug)
              minHeight: MIN_SIZE_AVATAR,
              minWidth: MIN_SIZE_AVATAR,
              maxHeight: MAX_SIZE_AVATAR,
              maxWidth: MAX_SIZE_AVATAR,
            }}
            className="rounded-md object-cover w-auto"
            style={{
              width: avatarSize,
              height: avatarSize,
              transition: "height 0.1s ease-out, width 0.1s ease-out",
            }}
          />
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold mt-0.5">{data.name}</h1>
            <p className="line-clamp-2 overflow-hidden">
              quis excepturi esse? Eveniet, quam sit pariatur quaerat est
              laborum iusto ducimus? Aperiam ipsa odio nemo totam accusamus
              reiciendis sit tempore? Unde error iste voluptas adipisci deserunt
              provident? quis excepturi esse? Eveniet, quam sit pariatur quaerat
              est laborum iusto ducimus? Aperiam ipsa odio nemo totam accusamus
              reiciendis sit tempore? Unde error iste voluptas adipisci deserunt
              provident?
            </p>
          </div>
        </div>

        <p className="flex mt-4 text-sm text-muted-foreground">
          {"Description available."}
        </p>
      </div>
    </div>
  );
};

export const TenantBannerSkeleton = () => {
  const [containerHeight, avatarSize, translateY] = useScrollDynamicSize({});

  return (
    <div className="sticky top-0 left-0 px-4 lg:px-12 pt-4 mt-4 z-20 bg-third">
      <div
        className="p-6 overflow-hidden relative z-10 border rounded-xl bg-default-filter"
        style={{
          maxHeight: containerHeight,
          transition: "max-height 0.1s ease-out",
        }}
      >
        <div className="rounded-xl absolute top-0 right-0 left-0 bottom-0 bg-gray-200 animate-pulse" />
        <div
          className="flex gap-4"
          style={{ transform: `translateY(-${translateY}px)` }}
        >
          <div
            className="w-[90px] h-[90px] shrink-0 bg-gray-300 animate-pulse rounded-md"
            style={{
              width: avatarSize,
              height: avatarSize,
              transition: "height 0.1s ease-out, width 0.1s ease-out",
            }}
          />
          <div className="flex flex-col gap-2 w-full">
            <div className="h-[24px] bg-gray-300 animate-pulse w-1/3 rounded-md my-1" />
            <div className="h-[16px] bg-gray-300 animate-pulse w-full rounded-md" />
            <div className="h-[16px] bg-gray-300 animate-pulse w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantBanner;
