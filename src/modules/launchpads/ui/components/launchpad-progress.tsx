import Countdown from "@/components/countdown";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Clock, Timer, Users } from "lucide-react";
import React, { useEffect, useState } from "react";

interface Props {
  isCardLayout?: boolean;
  startTime: string;
  endTime: string;
  soldCount: number;
}

const LaunchpadProgress = ({ isCardLayout, soldCount, ...props }: Props) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);

  // Calculate time remaining and progress
  useEffect(() => {
    if (!props.endTime || !props.startTime) return;

    const updateTimer = () => {
      const now = new Date();
      const endTime = new Date(props.endTime);
      const startTime = new Date(props.startTime);

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
  }, [props.endTime, props.startTime]);

  if (isCardLayout) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between text-xs text-foreground">
          <p className="flex items-center gap-2">
            <Timer className="size-4" />
            <span>Launch Progress</span>
          </p>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-3" />
        <div className="flex items-center justify-between text-xs text-foreground">
          <div className="flex items-center gap-1">
            <Users className="size-3" />
            <span>{soldCount} sold</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="size-3" />
            <span>{timeLeft}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          <Timer className="size-4" />
          <Countdown targetDate={props.endTime} />
        </span>
        <span className="font-medium">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-3" />
      <div className="flex items-center justify-between text-sm text-foreground">
        <span>Ends {timeLeft}</span>
        <span>{soldCount} sold</span>
      </div>
    </div>
  );
};

export const LaunchpadProgressSkeleton = ({
  isCardLayout,
}: {
  isCardLayout?: boolean;
}) => {
  if (isCardLayout) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between text-xs text-foreground">
          <p className="flex items-center gap-2">
            <Timer className="size-4" />
            <span>Launch Progress</span>
          </p>
          <Skeleton className="h-3 bg-secondary-background animate-pulse w-8" />
        </div>
        <Progress value={0} className="h-3" />
        <div className="flex items-center justify-between text-xs text-foreground">
          <div className="flex items-center gap-1">
            <Users className="size-3" />
            <Skeleton className="h-3 bg-secondary-background animate-pulse w-12" />
          </div>
          <div className="flex items-center gap-1">
            <Clock className="size-3" />
            <Skeleton className="h-3 bg-secondary-background animate-pulse w-16" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          <Timer className="size-4" />
          Launch Progress
        </span>
        <span className="font-medium">0%</span>
      </div>
      <Progress value={0} className="h-3 animate-pulse" />
      <div className="flex items-center justify-between text-sm text-foreground">
        <Skeleton className="bg-secondary-background w-24 h-4 animate-pulse rounded" />
        <Skeleton className="bg-secondary-background w-12 h-4 animate-pulse rounded" />
      </div>
    </div>
  );
};

export default LaunchpadProgress;
