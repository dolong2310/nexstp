"use client";

import Media from "@/components/media";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/contexts/ThemeContext";
import { Link, useRouter } from "@/i18n/navigation";
import {
  cn,
  formatCurrency,
  formatName,
  generateTenantPathname,
  getCurrentImageUrl,
} from "@/lib/utils";
import { Launchpad, Media as MediaType, Tenant } from "@/payload-types";
import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { LaunchpadProgressSkeleton } from "./launchpad-progress";

const LaunchpadProgress = dynamic(
  () => import("../components/launchpad-progress"),
  {
    ssr: false,
    loading: () => <LaunchpadProgressSkeleton />,
  }
);

interface LaunchpadCardProps {
  launchpad: Launchpad & {
    image: MediaType;
    tenant: Tenant & { image: MediaType | null };
  };
}

export const LaunchpadCard = ({ launchpad }: LaunchpadCardProps) => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { theme } = useTheme();

  const isRefetched = useRef(false);

  const [timeLeft, setTimeLeft] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);

  // Calculate time remaining and progress
  useEffect(() => {
    if (!launchpad.endTime) return;

    const updateTimer = () => {
      const now = new Date();
      const endTime = new Date(launchpad.endTime || Date.now());
      const startTime = new Date(launchpad.startTime || Date.now());

      if (now >= endTime) {
        if (!isRefetched.current) {
          const queryKey = trpc.launchpads.getMany.queryKey();
          queryClient.refetchQueries({
            queryKey: [queryKey[0]],
          });
          isRefetched.current = true;
        }
        setTimeLeft("Ended");
        setProgress(100);
        return;
      }

      // Calculate time left
      const timeLeftText = formatDistanceToNow(endTime, { addSuffix: true });
      setTimeLeft(timeLeftText);

      // Calculate progress (0-100%)
      const totalDuration = endTime.getTime() - startTime.getTime();
      const elapsed = now.getTime() - startTime.getTime();
      const progressPercent = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(progressPercent);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [launchpad.endTime, launchpad.startTime]);

  const discountPercentage = useMemo(() => {
    if (!launchpad.originalPrice || !launchpad.launchPrice) return 0;
    return Math.round(
      ((launchpad.originalPrice - launchpad.launchPrice) /
        launchpad.originalPrice) *
        100
    );
  }, [launchpad.originalPrice, launchpad.launchPrice]);

  const handleUserClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    router.push(generateTenantPathname(launchpad.tenant.slug));
  };

  return (
    <Link href={`/launchpads/${launchpad.id}`}>
      <Card
        shadowTransition
        className={cn(
          "group relative flex flex-col border-2 rounded-base bg-background overflow-hidden h-full",
          "py-0 gap-0"
        )}
      >
        <div className="relative">
          {/* Image */}
          <Media
            src={getCurrentImageUrl(launchpad.image, theme)}
            alt={launchpad.title}
            fill
            className="object-cover"
          />

          {/* Discount Badge */}
          <Badge className="absolute top-2 right-2">
            <p className="text-xs font-medium">-{discountPercentage}%</p>
          </Badge>
        </div>

        <div className="flex flex-col gap-3 flex-1 border-y-2 py-4">
          {/* Tenant Info */}
          <div
            className="flex items-center gap-2 px-4"
            onClick={handleUserClick}
          >
            <Avatar className="size-6">
              <AvatarImage
                src={launchpad.tenant.image?.url!}
                alt={launchpad.tenant.slug}
              />
              <AvatarFallback>
                {formatName(launchpad.tenant.slug)}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm underline font-medium truncate overflow-hidden">
              {launchpad.tenant.slug}
            </p>
          </div>

          {/* Title */}
          <h2 className="text-lg font-medium line-clamp-2 px-4 break-words">
            {launchpad.title}
          </h2>

          {/* Description */}
          <p className="text-sm text-foreground mb-3 line-clamp-2 px-4 break-words">
            {launchpad.description}
          </p>

          {/* Pricing */}
          <div className="border-y-2 mt-auto">
            <div className="flex items-center gap-2 p-4">
              <Badge>
                <p className="text-sm font-medium">
                  {formatCurrency(launchpad.launchPrice)}
                </p>
              </Badge>
              <p className="text-sm line-through text-foreground">
                {formatCurrency(launchpad.originalPrice)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-4 mt-2">
            <LaunchpadProgress
              isCardLayout
              startTime={launchpad.startTime!}
              endTime={launchpad.endTime!}
              soldCount={launchpad.soldCount || 0}
            />
          </div>
        </div>
      </Card>
    </Link>
  );
};

export const LaunchpadCardSkeleton = () => {
  return (
    <article className="flex flex-col border-2 shadow-shadow rounded-base bg-background overflow-hidden h-full">
      <div className="relative aspect-square bg-secondary-background animate-pulse" />

      <div className="flex flex-col gap-3 flex-1 border-y-2 py-4">
        {/* Tenant Info */}
        <div className="flex items-center gap-2 px-4">
          <Skeleton className="rounded-full bg-secondary-background animate-pulse shrink-0 size-6" />
          <Skeleton className="h-3 bg-secondary-background animate-pulse w-24" />
        </div>

        {/* Title */}
        <div className="px-4">
          <Skeleton className="h-4 bg-secondary-background animate-pulse w-full" />
        </div>

        {/* Description */}
        <div className="space-y-2 px-4">
          <Skeleton className="h-3 bg-secondary-background animate-pulse w-full" />
          <Skeleton className="h-3 bg-secondary-background animate-pulse w-3/4 mb-3" />
        </div>

        {/* Pricing */}
        <div className="border-y-2 mt-auto px-4">
          <div className="p-4">
            <Skeleton className="h-6 bg-secondary-background animate-pulse w-16" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 mt-2">
          <LaunchpadProgressSkeleton isCardLayout />
        </div>
      </div>
    </article>
  );
};
