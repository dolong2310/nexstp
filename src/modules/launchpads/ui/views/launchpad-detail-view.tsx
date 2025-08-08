"use client";

import Media from "@/components/media";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_LIMIT } from "@/constants";
import useSession from "@/hooks/use-session";
import {
  formatCurrency,
  formatName,
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
import { LoaderIcon, Share2Icon, ShoppingCart, Timer } from "lucide-react";
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
        <span>Buy</span>
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
    <div className="px-4 lg:px-12 py-6 lg:py-10">
      <div className="flex flex-col md:flex-row md:flex-nowrap gap-4 md:gap-8">
        {/* Left Column */}
        <div className="w-full md:w-3/5 space-y-6">
          <div className="relative">
            <Media
              src={getCurrentImageUrl(launchpad.image) || "/placeholder-bg.jpg"}
              alt={launchpad.title}
              title={launchpad.title}
              fill
              shadow
              shadowTransition
              containerClassName="aspect-square"
              className="size-full object-cover"
            />

            <Badge className="absolute top-4 left-4">
              <p className="text-xs font-medium">-{discountPercentage}%</p>
            </Badge>

            <Button
              variant="default"
              size="icon"
              className="absolute top-4 right-4"
              onClick={handleShare}
            >
              <Share2Icon className="size-4" />
            </Button>
          </div>

          <Tabs defaultValue="overview" className="gap-4">
            <TabsList className="w-full shadow-shadow">
              <TabsTrigger className="w-full" value="overview">
                Overview
              </TabsTrigger>
              <TabsTrigger className="w-full" value="content">
                Content
              </TabsTrigger>
            </TabsList>

            <TabsContent
              className="shadow-shadow rounded-base"
              value="overview"
            >
              <div className="border-2 rounded-sm bg-background overflow-hidden">
                <div className="p-6">
                  {launchpad.description ? (
                    <p className="font-medium break-words">{launchpad.description}</p>
                  ) : (
                    <p className="font-medium text-foreground italic">
                      No description available
                    </p>
                  )}

                  {launchpad.tags && launchpad.tags.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h3 className="font-semibold">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {launchpad.tags.map((tag) => (
                          <Badge key={tag.id}>
                            <p className="text-xs font-medium">{tag.name}</p>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent className="shadow-shadow rounded-base" value="content">
              <div className="border-2 rounded-sm bg-background overflow-hidden">
                <div className="p-6">
                  {launchpad.content ? (
                    <RichText data={launchpad.content} />
                  ) : (
                    <p className="font-medium text-foreground italic">
                      No content available
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column */}
        <div className="w-full md:w-2/5">
          <div className="border-2 shadow-shadow rounded-base bg-background py-6 space-y-4 sticky top-4 right-0">
            <div className="px-6">
              <Link
                href={generateTenantUrl(launchpad.tenant.slug)}
                className="flex items-center gap-2"
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
                <p className="text-base underline font-medium truncate overflow-hidden">
                  {launchpad.tenant.slug}
                </p>
              </Link>
            </div>

            <div className="px-6">
              <h1 className="text-4xl font-medium line-clamp-2 break-words">
                {launchpad.title}
              </h1>
            </div>

            <div className="px-6 py-4 border-y-2">
              <div className="flex items-center gap-3">
                <Badge>
                  <p className="text-base font-medium">
                    {formatCurrency(launchpad.launchPrice)}
                  </p>
                </Badge>
                <p className="text-lg line-through text-foreground">
                  {formatCurrency(launchpad.originalPrice)}
                </p>
              </div>

              <p className="flex items-center gap-1 text-sm text-foreground mt-2">
                <span>Save</span>
                <span>
                  {formatCurrency(
                    launchpad.originalPrice - launchpad.launchPrice
                  )}
                </span>
                <span>({discountPercentage}% off)</span>
              </p>
            </div>

            <div className="px-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Timer className="size-4" />
                    Launch Progress
                  </span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
                <div className="flex items-center justify-between text-sm text-foreground">
                  <span>Ends {timeLeft}</span>
                  <span>{launchpad.soldCount || 0} sold</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-y-2">
              <Button
                variant="default"
                className="w-full space-x-1 text-lg font-semibold"
                onClick={handlePurchase}
                disabled={
                  (user?.id && launchpad.isOwner) || purchaseMutation.isPending
                }
              >
                {renderPurchaseLabel()}
              </Button>
            </div>

            <div className="px-6 pt-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Category</span>
                  <Badge>
                    <p className="text-xs font-medium">
                      {launchpad.category.name}
                    </p>
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Refund Policy</span>
                  <span className="text-sm font-medium">
                    {RefundPolicy[launchpad.refundPolicy!]}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Launch Date</span>
                  <span className="text-sm font-medium">
                    {format(new Date(launchpad.startTime!), "MMM dd, yyyy")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">End Date</span>
                  <span className="text-sm font-medium">
                    {format(new Date(launchpad.endTime!), "MMM dd, yyyy")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Duration</span>
                  <span className="text-sm font-medium">
                    {launchpad.duration} hours
                  </span>
                </div>
              </div>
            </div>

            {/* <div className="px-6">
              <div className="flex items-center justify-center border-t pt-4">
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
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export const LaunchpadDetailViewSkeleton = () => {
  return (
    <div className="px-4 lg:px-12 py-6 lg:py-10">
      <div className="flex flex-col md:flex-row md:flex-nowrap gap-4 md:gap-8">
        {/* Left Column */}
        <div className="w-full md:w-3/5 space-y-6">
          <div className="border-2 shadow-shadow rounded-base bg-background overflow-hidden">
            <Skeleton className="aspect-square bg-secondary-background animate-pulse border-0" />
          </div>

          <Tabs defaultValue="overview" className="gap-4">
            <TabsList className="w-full shadow-shadow">
              <TabsTrigger className="w-full" value="overview">
                Overview
              </TabsTrigger>
              <TabsTrigger className="w-full" value="content">
                Content
              </TabsTrigger>
            </TabsList>

            <TabsContent
              className="shadow-shadow rounded-base"
              value="overview"
            >
              <div className="border rounded-sm bg-background overflow-hidden p-6 space-y-2">
                <Skeleton className="text-base font-medium bg-secondary-background w-full h-5 animate-pulse" />
                <Skeleton className="text-base font-medium bg-secondary-background w-2/3 h-5 animate-pulse" />
              </div>
            </TabsContent>
            <TabsContent className="shadow-shadow rounded-base" value="content">
              <div className="border rounded-sm bg-background overflow-hidden p-6 space-y-2">
                <Skeleton className="text-base font-medium bg-secondary-background w-full h-5 animate-pulse" />
                <Skeleton className="text-base font-medium bg-secondary-background w-2/3 h-5 animate-pulse" />
              </div>
            </TabsContent>
            <TabsContent className="shadow-shadow rounded-base" value="ratings">
              <div className="border rounded-sm bg-background overflow-hidden p-6 space-y-4">
                <h3 className="text-xl font-medium animate-pulse">Ratings</h3>
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div
                    key={stars}
                    className="grid grid-cols-[auto_1fr_auto] gap-3 mt-4 animate-pulse"
                  >
                    <span>{stars} stars</span>
                    <Progress value={0} className="h-[1lh]" />
                    <span>0%</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column */}
        <div className="w-full md:w-2/5 space-y-4">
          <div className="border-2 shadow-shadow rounded-base bg-background py-6 space-y-4 sticky top-4 right-0">
            <div className="px-6 flex items-center gap-2">
              <Skeleton className="rounded-full border bg-secondary-background size-6 animate-pulse" />
              <Skeleton className="text-base underline font-medium bg-secondary-background w-24 h-5 animate-pulse" />
            </div>

            <div className="px-6">
              <Skeleton className="text-4xl font-medium bg-secondary-background w-3/4 h-8 animate-pulse" />
            </div>

            <div className="px-6 py-4 border-y-2">
              <Skeleton className="text-base font-medium bg-secondary-background w-20 h-6 animate-pulse" />
            </div>

            <div className="px-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
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
            </div>

            <div className="px-6 py-4 border-y-2">
              <Button
                variant="default"
                className="w-full"
                disabled
                onClick={() => {}}
              >
                <LoaderIcon className="size-5 animate-spin" />
              </Button>
            </div>

            <div className="px-6 pt-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Category</span>
                  <Skeleton className="bg-secondary-background w-24 h-4 animate-pulse rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Refund Policy</span>
                  <Skeleton className="bg-secondary-background w-24 h-4 animate-pulse rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Launch Date</span>
                  <Skeleton className="bg-secondary-background w-24 h-4 animate-pulse rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">End Date</span>
                  <Skeleton className="bg-secondary-background w-24 h-4 animate-pulse rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Duration</span>
                  <Skeleton className="bg-secondary-background w-24 h-4 animate-pulse rounded" />
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
