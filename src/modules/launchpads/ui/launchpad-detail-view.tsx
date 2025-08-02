"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { DEFAULT_LIMIT } from "@/constants";
import { formatName, getCurrentImageUrl } from "@/lib/utils";
import useCheckoutState from "@/modules/checkout/hooks/use-checkout-state";
import { useTRPC } from "@/trpc/client";
import { RichText } from "@payloadcms/richtext-lexical/react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeftIcon,
  Heart,
  Share2,
  ShoppingCart,
  Star,
  Timer,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  launchpadId: string;
}

export const LaunchpadDetailView = ({ launchpadId }: Props) => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

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
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <nav className="w-full p-4 border-b bg-third">
        <Link href="/launchpads" className="flex items-center gap-2">
          <ArrowLeftIcon className="size-4" />
          <span className="text font-medium">Back to Launchpads</span>
        </Link>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img
                src={getCurrentImageUrl(launchpad.image)}
                alt={launchpad.title}
                className="w-full h-full object-cover"
              />

              {/* Status Badge */}
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className="bg-green-500 hover:bg-green-600 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  Live
                </Badge>
                <Badge className="bg-red-500 hover:bg-red-600 text-white">
                  -{discountPercentage}% OFF
                </Badge>
              </div>

              {/* Share Button */}
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-4 right-4"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Title & Description */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{launchpad.title}</h1>
                  {launchpad.description && (
                    <p className="text-lg text-muted-foreground">
                      {launchpad.description}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isWishlisted ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </Button>
              </div>

              {/* Tenant Info */}
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={getCurrentImageUrl(launchpad.image)}
                    alt={launchpad.tenant.name}
                  />
                  <AvatarFallback>
                    {formatName(launchpad.tenant.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{launchpad.tenant.name}</p>
                  <p className="text-sm text-muted-foreground">Creator</p>
                </div>
              </div>
            </div>

            {/* Content */}
            {launchpad.content && (
              <Card>
                <CardHeader>
                  <CardTitle>About This Launch</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <RichText data={launchpad.content} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {launchpad.tags && launchpad.tags.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {launchpad.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Refund Policy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Refund Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {launchpad.refundPolicy}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Purchase Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Card className="border-2">
                <CardHeader className="pb-4">
                  <div className="space-y-4">
                    {/* Pricing */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-green-600">
                          ${launchpad.launchPrice}
                        </span>
                        <span className="text-lg line-through text-muted-foreground">
                          ${launchpad.originalPrice}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Save ${launchpad.originalPrice - launchpad.launchPrice}{" "}
                        ({discountPercentage}% off)
                      </p>
                    </div>

                    {/* Timer */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Timer className="w-4 h-4" />
                          Launch Progress
                        </span>
                        <span className="font-medium">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-3" />
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Ends {timeLeft}</span>
                        <span>{launchpad.soldCount || 0} sold</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Purchase Button */}
                  <Button
                    className="w-full h-12 text-lg font-semibold"
                    onClick={handlePurchase}
                    disabled={purchaseMutation.isPending}
                  >
                    {purchaseMutation.isPending ? (
                      "Processing..."
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Get Early Access
                      </>
                    )}
                  </Button>

                  <Separator />

                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Category
                      </span>
                      <Badge variant="outline">{launchpad.category.name}</Badge>
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
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">
                        Early Access Guarantee
                      </span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                      Get exclusive early access at launch price. Price
                      increases to ${launchpad.originalPrice} after launch ends.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
