"use client";

import Media from "@/components/media";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { DEFAULT_LIMIT } from "@/constants";
import useSession from "@/hooks/use-session";
import {
  cn,
  formatCurrency,
  generateTenantUrl,
  getCurrentImageUrl,
} from "@/lib/utils";
import useCheckoutState from "@/modules/checkout/hooks/use-checkout-state";
import { useTRPC } from "@/trpc/client";
import { RefundPolicy } from "@/types";
import { RichText } from "@payloadcms/richtext-lexical/react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import {
  Heart,
  LoaderIcon,
  Share2,
  ShoppingCart,
  Star,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  launchpadId: string;
}

const LaunchpadDetailView = ({ launchpadId }: Props) => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { user } = useSession();

  const [states, setStates] = useCheckoutState();

  const [timeLeft, setTimeLeft] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Fetch launchpad data
  const { data: launchpad } = useSuspenseQuery(
    trpc.launchpads.getOne.queryOptions({
      id: launchpadId,
    })
  );

  // Purchase mutation
  const purchaseMutation = useMutation(
    trpc.launchpads.purchase.mutationOptions({
      onMutate: () => {
        setStates({ success: false, cancel: false });
      },
      onSuccess: (data) => {
        // toast.success("Purchase successful! Check your library.");
        window.location.href = data.url;
      },
      onError: (error) => {
        if (error.data?.code === "UNAUTHORIZED") {
          router.push("/sign-in");
        }
        toast.error(error.message || "Purchase failed");
      },
    })
  );

  useEffect(() => {
    if (states.success) {
      setStates({ success: false, cancel: false });

      // prefetch library products
      queryClient.invalidateQueries(
        trpc.library.getMany.infiniteQueryOptions({ limit: DEFAULT_LIMIT })
      );
      router.push("/library");
    }

    if (states.cancel) {
      setStates({ success: false, cancel: false });
      toast.error("Checkout failed. Please try again.");
    }
  }, [
    states.success,
    states.cancel,
    router,
    setStates,
    queryClient,
    trpc.library.getMany,
  ]);

  // Calculate time remaining and progress
  useEffect(() => {
    if (!launchpad.endTime || !launchpad.startTime) return;

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

  const renderPurchaseLabel = () => {
    if (user?.id && launchpad.isOwner) return "You own this launchpad";
    return (
      <>
        {purchaseMutation.isPending ? (
          <LoaderIcon className="size-5 animate-spin" />
        ) : (
          <ShoppingCart className="size-5" />
        )}
        <span className="ml-2">Buy</span>
      </>
    );
  };

  const handlePurchase = () => {
    purchaseMutation.mutate({ launchpadId: launchpad.id });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: launchpad.title,
          text: launchpad.description || `Check out ${launchpad.title}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="px-4 lg:px-12 py-10">
      <div className="flex flex-col md:flex-row flex-wrap md:flex-nowrap gap-8">
        {/* Left Column */}
        <div className="w-full md:w-2/3 border rounded-sm bg-background overflow-hidden">
          {/* Hero Image */}
          <div className="relative aspect-square rounded-tl-sm rounded-tr-sm overflow-hidden">
            <Media
              src={getCurrentImageUrl(launchpad.image) || "/placeholder-bg.jpg"}
              alt={launchpad.title}
              fill
              // containerClassName="aspect-video"
              className="size-full object-cover"
            />

            {/* Status Badge */}
            <div className="absolute top-4 left-4 px-2 py-0.5 border bg-feature w-fit rounded-sm">
              <p className="text-xs font-medium">-{discountPercentage}%</p>
            </div>

            {/* Share Button */}
            <Button
              variant="elevated"
              size="icon"
              className="absolute top-4 right-4"
              onClick={handleShare}
            >
              <Share2 className="size-4" />
            </Button>
          </div>

          <div className="py-4 px-6 space-y-4">
            {/* Title & Description */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2 md:mb-4">
                    {launchpad.title}
                  </h1>
                  {launchpad.description && (
                    <p className="text-md text-muted-foreground">
                      {launchpad.description}
                    </p>
                  )}
                </div>

                <Button
                  variant="elevated"
                  size="icon"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart
                    className={cn(
                      "size-5",
                      isWishlisted && "fill-red-500 text-red-500"
                    )}
                  />
                </Button>
              </div>

              {/* Tenant Info */}
              <Link href={generateTenantUrl(launchpad.tenant.slug)}>
                <div className="flex items-center gap-4">
                  <Media
                    src={launchpad.tenant.image?.url || "/default-avatar.png"}
                    alt={launchpad.tenant.slug}
                    width={40}
                    height={40}
                    sizeFallbackIcon="md"
                    className="rounded-full border shrink-0 size-10"
                  />
                  <div className="">
                    <p className="text-md font-medium">
                      {launchpad.tenant.slug}
                    </p>
                    <p className="text-sm text-muted-foreground">Creator</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Content */}
            {launchpad.content && (
              <div className="space-y-2">
                <h3 className="font-semibold">About This Launch</h3>
                <div className="prose prose-sm max-w-none dark:prose-invert border rounded-sm p-4">
                  <RichText data={launchpad.content} />
                </div>
              </div>
            )}

            {/* Tags */}
            {launchpad.tags && launchpad.tags.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {launchpad.tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="px-2 py-0.5 border bg-feature w-fit rounded-sm"
                    >
                      <p className="text-xs font-medium">{tag.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full md:w-1/3">
          <div className="py-4 px-6 space-y-4 border rounded-sm bg-background sticky top-4 right-0">
            <div className="space-y-4">
              {/* Pricing */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-feature">
                    {formatCurrency(launchpad.launchPrice)}
                  </span>
                  <span className="text-lg line-through text-muted-foreground">
                    {formatCurrency(launchpad.originalPrice)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Save{" "}
                  {formatCurrency(
                    launchpad.originalPrice - launchpad.launchPrice
                  )}{" "}
                  ({discountPercentage}% off)
                </p>
              </div>

              {/* Timer */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Timer className="size-4" />
                    Launch Progress
                  </span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Ends {timeLeft}</span>
                  <span>{launchpad.soldCount || 0} sold</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Purchase Button */}
              <Button
                variant="elevated"
                className="w-full bg-feature text-lg font-semibold"
                onClick={handlePurchase}
                disabled={
                  (user?.id && launchpad.isOwner) || purchaseMutation.isPending
                }
              >
                {renderPurchaseLabel()}
              </Button>

              <Separator />

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Category
                  </span>
                  <div className="px-2 py-0.5 border bg-feature w-fit rounded-sm">
                    <p className="text-xs font-medium">
                      {launchpad.category.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Refund Policy
                  </span>
                  <span className="text-sm font-medium">
                    {RefundPolicy[launchpad.refundPolicy!]}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Launch Date
                  </span>
                  <span className="text-sm font-medium">
                    {format(new Date(launchpad.startTime!), "MMM dd, yyyy")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    End Date
                  </span>
                  <span className="text-sm font-medium">
                    {format(new Date(launchpad.endTime!), "MMM dd, yyyy")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Duration
                  </span>
                  <span className="text-sm font-medium">
                    {launchpad.duration} hours
                  </span>
                </div>
              </div>

              {/* Guarantee */}
              {/* <div className="flex items-center justify-center border-t pt-4">
                <div className="flex flex-col items-center w-full border border-green-400 bg-green-100 font-medium px-4 py-3 rounded">
                  <div className="flex items-start justify-between">
                    <Star className="size-6 fill-green-500 mr-1" />
                    <span className="text-black">Early Access Guarantee</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Get exclusive early access at launch price. Price increases
                    to
                    {formatCurrency(launchpad.originalPrice)} after launch ends.
                  </p>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LaunchpadDetailViewSkeleton = () => {
  return (
    <div className="px-4 lg:px-12 py-10">
      <div className="flex flex-col md:flex-row flex-wrap md:flex-nowrap gap-8">
        {/* Left Column */}
        <div className="w-full md:w-2/3 border rounded-sm bg-background overflow-hidden">
          <div className="relative aspect-square rounded-tl-sm rounded-tr-sm overflow-hidden bg-gray-200 animate-pulse" />
          <div className="py-4 px-6 space-y-4">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2 md:mb-4 bg-gray-200 animate-pulse h-8 w-full" />
                  <p className="text-md text-muted-foreground bg-gray-200 animate-pulse h-6 w-full" />
                </div>
                <Button variant="elevated" size="icon" disabled>
                  <Heart className="size-5 fill-red-500 text-red-500" />
                </Button>
              </div>
              <Link href="/">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-gray-200 animate-pulse shrink-0 size-10" />
                  <div>
                    <p className="text-md font-medium bg-gray-200 animate-pulse h-6 w-full" />
                    <p className="text-sm text-muted-foreground bg-gray-200 animate-pulse h-4 w-full" />
                  </div>
                </div>
              </Link>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold bg-gray-200 animate-pulse h-6 w-full" />
              <div className="prose prose-sm max-w-none dark:prose-invert border rounded-sm p-4 bg-gray-200 animate-pulse h-[100px]" />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full md:w-1/3">
          <div className="py-4 px-6 space-y-4 border rounded-sm sticky top-4 right-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-feature bg-gray-200 animate-pulse h-8 w-24" />
                  <span className="text-lg line-through text-muted-foreground bg-gray-200 animate-pulse h-6 w-20" />
                </div>
                <p className="text-sm text-muted-foreground bg-gray-200 animate-pulse h-4 w-full" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Timer className="size-4" />
                    Launch Progress
                  </span>
                  <span className="font-medium bg-gray-200 animate-pulse h-4 w-16" />
                </div>
                <Progress
                  value={50}
                  className="h-3 bg-gray-200 animate-pulse"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Ends in 2 days</span>
                  <span>0 sold</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaunchpadDetailView;
