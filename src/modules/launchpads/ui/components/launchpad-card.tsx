"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getCurrentImageUrl } from "@/lib/utils";
import { Launchpad, Media, Tenant } from "@/payload-types";
import { formatDistanceToNow } from "date-fns";
import { Clock, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface LaunchpadCardProps {
  launchpad: Launchpad & {
    image: Media;
    tenant: Tenant & { image: Media | null };
  };
}

export const LaunchpadCard = ({ launchpad }: LaunchpadCardProps) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);

  // Calculate time remaining and progress
  useEffect(() => {
    if (!launchpad.endTime) return;

    const updateTimer = () => {
      const now = new Date();
      const endTime = new Date(launchpad.endTime!);
      const startTime = new Date(launchpad.startTime!);

      if (now >= endTime) {
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

  const discountPercentage = Math.round(
    ((launchpad.originalPrice - launchpad.launchPrice) /
      launchpad.originalPrice) *
      100
  );

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="relative">
        {/* Main Image */}
        <div className="aspect-[4/3] relative overflow-hidden">
          <img
            src={getCurrentImageUrl(launchpad.image)}
            alt={launchpad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />

          {/* Discount Badge */}
          <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
            -{discountPercentage}%
          </Badge>

          {/* Status Badge */}
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 bg-green-500 text-white"
          >
            <Zap className="w-3 h-3 mr-1" />
            Live
          </Badge>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {/* Tenant Info */}
          <div className="flex items-center gap-2 mb-2">
            <img
              src={getCurrentImageUrl(launchpad.image)}
              alt={launchpad.tenant.name}
              className="w-5 h-5 rounded-full"
            />
            <span className="text-sm text-muted-foreground">
              {launchpad.tenant.name}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {launchpad.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {launchpad.description}
          </p>

          {/* Pricing */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-bold text-green-600">
              ${launchpad.launchPrice}
            </span>
            <span className="text-sm line-through text-muted-foreground">
              ${launchpad.originalPrice}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Launch Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{launchpad.soldCount || 0} sold</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{timeLeft}</span>
            </div>
          </div>

          {/* CTA Button */}
          <Link href={`/launchpads/${launchpad.id}`}>
            <Button className="w-full" size="sm">
              Get Early Access
            </Button>
          </Link>
        </CardContent>
      </div>
    </Card>
  );
};

export const LaunchpadCardSkeleton = () => {
  return (
    <Card className="animate-pulse">
      <div className="aspect-[4/3] bg-gray-200"></div>
      <CardContent className="p-4">
        <div className="h-5 bg-gray-300 mb-2 w-3/4"></div>
        <div className="h-4 bg-gray-300 mb-3 w-full"></div>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 bg-gray-300 w-1/3"></div>
          <div className="h-6 bg-gray-300 w-1/3"></div>
        </div>
        <Button className="w-full h-8 bg-gray-300" />
      </CardContent>
    </Card>
  );
};
