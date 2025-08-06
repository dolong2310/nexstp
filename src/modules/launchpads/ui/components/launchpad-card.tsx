"use client";

import Media from "@/components/media";
import { Progress } from "@/components/ui/progress";
import {
  formatCurrency,
  generateTenantUrl,
  getCurrentImageUrl,
} from "@/lib/utils";
import { Launchpad, Media as MediaType, Tenant } from "@/payload-types";
import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Clock, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

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

    router.push(generateTenantUrl(launchpad.tenant.slug));
  };

  return (
    <Link href={`/launchpads/${launchpad.id}`}>
      <article className="group relative flex flex-col border rounded-md bg-background overflow-hidden h-full hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-x-[4px] hover:-translate-y-[4px] transition-all">
        <div className="relative">
          {/* Image */}
          <Media
            src={getCurrentImageUrl(launchpad.image) || "/placeholder-bg.jpg"}
            alt={launchpad.title}
            fill
            className="object-cover"
          />

          {/* Discount Badge */}
          <div className="absolute top-2 right-2 px-2 py-0.5 border bg-feature w-fit rounded-sm">
            <p className="text-xs font-medium">-{discountPercentage}%</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 flex-1 border-y py-4">
          {/* Title */}
          <h2 className="text-lg font-medium line-clamp-2 px-4">
            {launchpad.title}
          </h2>

          {/* Tenant Info */}
          <div
            className="flex items-center gap-2 px-4"
            onClick={handleUserClick}
          >
            {launchpad.tenant.image?.url && (
              <Media
                src={launchpad.tenant.image?.url}
                alt={launchpad.tenant.slug}
                width={16}
                height={16}
                sizeFallbackIcon="sm"
                className="rounded-full border shrink-0 size-4"
              />
            )}
            <p className="text-sm underline font-medium">
              {launchpad.tenant.slug}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 px-4">
            {launchpad.description}
          </p>

          {/* Pricing */}
          <div className="border-t mt-auto">
            <div className="flex items-center gap-2 px-4 pt-4">
              <div className="relative px-2 py-1 border bg-feature w-fit">
                <p className="text-sm font-medium">
                  {formatCurrency(launchpad.launchPrice)}
                </p>
              </div>
              <p className="text-sm line-through text-muted-foreground">
                {formatCurrency(launchpad.originalPrice)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Launch Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-4">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{launchpad.soldCount || 0} sold</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{timeLeft}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export const LaunchpadCardSkeleton = () => {
  return (
    <article className="flex flex-col border rounded-md bg-background overflow-hidden h-full">
      <div className="relative aspect-square bg-gray-200 animate-pulse" />

      <div className="flex flex-col gap-3 flex-1 border-y p-4">
        {/* Title */}
        <div className="h-4 bg-gray-200 animate-pulse w-full" />

        {/* Tenant Info */}
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-gray-200 animate-pulse shrink-0 size-4" />
          <div className="h-3 bg-gray-200 animate-pulse w-24" />
        </div>

        {/* Description */}
        <div className="h-3 bg-gray-200 animate-pulse w-full" />
        <div className="h-3 bg-gray-200 animate-pulse w-3/4 mb-3" />

        {/* Pricing */}
        <div className="flex items-center gap-2">
          <div className="h-6 bg-gray-200 animate-pulse w-16" />
        </div>

        {/* Progress Bar */}
        <div className="mt-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Launch Progress</span>
            <span className="h-3 bg-gray-200 animate-pulse w-8" />
          </div>
          <Progress value={0} className="h-3" />
          {/* <div className="bg-gray-200 h-3 w-full animate-pulse" /> */}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span className="h-3 bg-gray-200 animate-pulse w-12" />
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span className="h-3 bg-gray-200 animate-pulse w-16" />
          </div>
        </div>
      </div>
    </article>
  );
};
