"use client";

import Media from "@/components/media";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_LIMIT } from "@/constants";
import useSession from "@/hooks/use-session";
import {
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
import { LoaderIcon, Share2, ShoppingCart, Timer } from "lucide-react";
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
      <div className="flex flex-col md:flex-row md:flex-nowrap gap-4 md:gap-8">
        {/* Left Column */}
        <div className="w-full md:w-3/5 space-y-6">
          <div className="border rounded-sm bg-background overflow-hidden">
            {/* Hero Image */}
            <div className="relative aspect-square rounded-tl-sm rounded-tr-sm overflow-hidden">
              <Media
                src={
                  getCurrentImageUrl(launchpad.image) || "/placeholder-bg.jpg"
                }
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
          </div>

          <Tabs defaultValue="overview" className="gap-4">
            <TabsList className="w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="border rounded-sm bg-background overflow-hidden">
                <div className="p-6">
                  {launchpad.description ? (
                    <p className="font-medium">{launchpad.description}</p>
                  ) : (
                    <p className="font-medium text-muted-foreground italic">
                      No description available
                    </p>
                  )}

                  {launchpad.tags && launchpad.tags.length > 0 && (
                    <div className="mt-4 space-y-2">
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
            </TabsContent>
            <TabsContent value="content">
              <div className="border rounded-sm bg-background overflow-hidden">
                <div className="p-6">
                  {launchpad.content ? (
                    <RichText data={launchpad.content} />
                  ) : (
                    <p className="font-medium text-muted-foreground italic">
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
          <div className="border rounded-sm bg-background py-6 space-y-4 sticky top-4 right-0">
            <div className="px-6">
              <Link
                href={generateTenantUrl(launchpad.tenant.slug)}
                className="flex items-center gap-2"
              >
                {launchpad.tenant.image?.url && (
                  <Media
                    src={launchpad.tenant.image?.url}
                    alt={launchpad.tenant.slug}
                    width={20}
                    height={20}
                    className="rounded-full border shrink-0 size-5"
                  />
                )}
                <p className="text-base underline font-medium">
                  {launchpad.tenant.slug}
                </p>
              </Link>
            </div>

            <div className="px-6">
              <h1 className="text-4xl font-medium">{launchpad.title}</h1>
            </div>

            <div className="px-6">
              <div className="flex items-center gap-3">
                <div className="px-2 py-1 border bg-feature w-fit">
                  <p className="text-base font-medium">
                    {formatCurrency(launchpad.launchPrice)}
                  </p>
                </div>
                <p className="text-lg line-through text-muted-foreground">
                  {formatCurrency(launchpad.originalPrice)}
                </p>
              </div>
              <p className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
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
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Ends {timeLeft}</span>
                  <span>{launchpad.soldCount || 0} sold</span>
                </div>
              </div>
            </div>

            <div className="px-6">
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
            </div>

            <div className="px-6 pt-2">
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
    <div className="px-4 lg:px-12 py-10">
      <div className="flex flex-col md:flex-row md:flex-nowrap gap-4 md:gap-8">
        <div className="w-full md:w-3/5 space-y-6">
          <div className="border rounded-sm bg-background overflow-hidden">
            <div className="relative aspect-square rounded-tl-sm rounded-tr-sm overflow-hidden">
              <div className="size-full bg-gray-200 animate-pulse" />
            </div>
          </div>

          <Tabs defaultValue="overview" className="gap-4">
            <TabsList className="w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="border rounded-sm bg-background overflow-hidden p-6 space-y-2">
                <p className="text-base font-medium bg-muted w-full h-5 animate-pulse" />
                <p className="text-base font-medium bg-muted w-2/3 h-5 animate-pulse" />
              </div>
            </TabsContent>
            <TabsContent value="content">
              <div className="border rounded-sm bg-background overflow-hidden p-6 space-y-2">
                <p className="text-base font-medium bg-muted w-full h-5 animate-pulse" />
                <p className="text-base font-medium bg-muted w-2/3 h-5 animate-pulse" />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="w-full md:w-2/5 space-y-4">
          <div className="border rounded-sm bg-background py-6 space-y-4 sticky top-4 right-0">
            <div className="px-6 flex items-center gap-2 animate-pulse">
              <div className="rounded-full border bg-muted size-5" />
              <p className="text-base underline font-medium bg-muted w-24 h-5 animate-pulse" />
            </div>

            <div className="px-6">
              <h1 className="text-4xl font-medium bg-muted w-3/4 h-8 animate-pulse" />
            </div>

            <div className="px-6">
              <div className="flex items-center gap-3">
                <div className="px-2 py-1 border bg-muted w-20 h-7 animate-pulse rounded" />
                <p className="text-lg line-through text-muted-foreground bg-muted w-16 h-6 animate-pulse rounded" />
              </div>
              <p className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                <span className="bg-muted w-10 h-4 animate-pulse rounded" />
                <span className="bg-muted w-12 h-4 animate-pulse rounded" />
                <span className="bg-muted w-14 h-4 animate-pulse rounded" />
              </p>
            </div>

            <div className="px-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <div className="bg-muted rounded-full w-4 h-4 animate-pulse" />
                    <span className="bg-muted w-24 h-4 animate-pulse rounded" />
                  </span>
                  <span className="bg-muted w-8 h-4 animate-pulse rounded" />
                </div>
                <div className="h-3 bg-muted rounded animate-pulse" />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="bg-muted w-24 h-4 animate-pulse rounded" />
                  <span className="bg-muted w-12 h-4 animate-pulse rounded" />
                </div>
              </div>
            </div>

            <div className="px-6">
              <div className="w-full h-11 bg-muted animate-pulse rounded" />
            </div>

            <div className="px-6 pt-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground bg-muted w-20 h-4 animate-pulse rounded" />
                  <div className="px-2 py-0.5 border bg-muted w-16 h-5 animate-pulse rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground bg-muted w-24 h-4 animate-pulse rounded" />
                  <span className="text-sm font-medium bg-muted w-16 h-4 animate-pulse rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground bg-muted w-20 h-4 animate-pulse rounded" />
                  <span className="text-sm font-medium bg-muted w-20 h-4 animate-pulse rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground bg-muted w-16 h-4 animate-pulse rounded" />
                  <span className="text-sm font-medium bg-muted w-20 h-4 animate-pulse rounded" />
                </div>

                <div className="flex items-center justify-between"></div>
                <span className="text-sm text-muted-foreground bg-muted w-16 h-4 animate-pulse rounded" />
                <span className="text-sm font-medium bg-muted w-16 h-4 animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaunchpadDetailView;
