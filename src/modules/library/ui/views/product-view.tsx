"use client";

import Media from "@/components/media";
import { SocialsShareButtonSkeleton } from "@/components/socials-share-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/contexts/ThemeContext";
import { fallbackImageUrl, formatName, generateTenantUrl } from "@/lib/utils";
import ProductReviews, {
  ProductReviewsSkeleton,
} from "@/modules/products/ui/components/product-reviews";
import { Tag } from "@/payload-types";
import { useTRPC } from "@/trpc/client";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { StarIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Fragment, Suspense, useState } from "react";
import ReviewForm, { ReviewFormSkeleton } from "../components/review-form";

const PreviewImageModal = dynamic(
  () => import("@/components/preview-image-modal"),
  {
    ssr: false,
  }
);

const SocialsShareButton = dynamic(
  () => import("@/components/socials-share-button"),
  {
    ssr: false,
    loading: () => <SocialsShareButtonSkeleton />,
  }
);

interface Props {
  productId: string;
}

const TabOptions = [
  { value: "overview", label: "Overview" },
  { value: "content", label: "Content" },
  { value: "ratings", label: "Ratings" },
];

const ProductView = ({ productId }: Props) => {
  const { theme } = useTheme();
  const trpc = useTRPC();
  const { data: product, refetch: refetchProduct } = useSuspenseQuery(
    trpc.library.getOne.queryOptions({
      productId,
    })
  );

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <div className="px-4 lg:px-12 py-6 lg:py-10">
      <div className="flex flex-col md:flex-row md:flex-nowrap gap-4 md:gap-8">
        {/* Left Column */}
        <div className="w-full md:w-3/5 space-y-6">
          <div className="relative">
            <Media
              src={fallbackImageUrl(product.image?.url, theme)}
              alt={product.name}
              title={product.name}
              fill
              shadow
              shadowTransition
              containerClassName="aspect-square"
              className="object-cover"
              onClick={() => setIsPreviewOpen(true)}
            />
            <PreviewImageModal
              src={fallbackImageUrl(product.image?.url, theme)}
              alt={product.name}
              isOpen={isPreviewOpen}
              onOpenChange={setIsPreviewOpen}
            />

            {product.isFromLaunchpad && (
              <Badge className="absolute top-4 left-4">
                <p className="text-xs font-medium">Launchpad</p>
              </Badge>
            )}

            <SocialsShareButton />
          </div>

          <Tabs defaultValue="overview" className="gap-4">
            <TabsList className="w-full shadow-shadow">
              {TabOptions.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  className="w-full"
                  value={tab.value}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview">
              <div className="border-2 shadow-shadow rounded-base bg-background overflow-hidden">
                <div className="p-6">
                  {product.description ? (
                    <p className="font-medium wrap-break-word">
                      {product.description}
                    </p>
                  ) : (
                    <p className="font-medium text-foreground italic">
                      No description available
                    </p>
                  )}

                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h3 className="font-semibold">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {(product.tags as Tag[]).map((tag) => (
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
            <TabsContent value="content">
              <div className="border-2 shadow-shadow rounded-base bg-background overflow-hidden">
                <div className="p-6">
                  {product.content ? (
                    <RichText data={product.content} />
                  ) : (
                    <p className="font-medium text-foreground italic">
                      No content available
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent className="space-y-4" value="ratings">
              <div className="border-2 shadow-shadow rounded-base bg-background overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-medium">Ratings</h3>
                    <div className="flex items-center gap-x-1 font-medium">
                      <StarIcon className="size-4 fill-black dark:fill-white" />
                      <p>({product.reviewRating})</p>
                      <p className="text-base">{product.reviewCount} ratings</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-[auto_1fr_auto] gap-3 mt-4">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <Fragment key={stars}>
                        <div className="font-medium">
                          {stars} {stars === 1 ? "star" : "stars"}
                        </div>
                        <Progress
                          value={product.ratingDistribution[stars]}
                          className="h-lh"
                        />
                        <div className="font-medium">
                          {product.ratingDistribution[stars]}%
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>

              <Suspense fallback={<ProductReviewsSkeleton />}>
                <ProductReviews productId={productId} />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column */}
        <div className="w-full md:w-2/5 sticky top-4 right-0 space-y-6">
          <div className="border-2 shadow-shadow rounded-base bg-background py-6 space-y-4">
            <div className="px-6">
              <Link
                href={generateTenantUrl(product.tenant.slug)}
                className="flex items-center gap-2"
              >
                <Avatar className="size-6">
                  <AvatarImage
                    src={product.tenant.image?.url!}
                    alt={product.tenant.name}
                  />
                  <AvatarFallback>
                    {formatName(product.tenant.name)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-base underline font-medium truncate overflow-hidden">
                  {product.tenant.name}
                </p>
              </Link>
            </div>

            <div className="px-6">
              <h1 className="text-4xl font-medium line-clamp-2 wrap-break-word">
                {product.name}
              </h1>
            </div>
          </div>

          <Card className="p-4 gap-0">
            <Suspense fallback={<ReviewFormSkeleton />}>
              <ReviewForm productId={productId} onRefetch={refetchProduct} />
            </Suspense>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const ProductViewSkeleton = () => {
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
              {TabOptions.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  className="w-full"
                  value={tab.value}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
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
                    <Progress value={0} className="h-lh" />
                    <span>0%</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column */}
        <div className="w-full md:w-2/5 sticky top-4 right-0 space-y-6">
          <div className="border-2 shadow-shadow rounded-base bg-background py-6 space-y-4">
            <div className="px-6 flex items-center gap-2">
              <Skeleton className="rounded-full border bg-secondary-background size-6 animate-pulse" />
              <Skeleton className="text-base underline font-medium bg-secondary-background w-24 h-5 animate-pulse" />
            </div>

            <div className="px-6">
              <Skeleton className="text-4xl font-medium bg-secondary-background w-3/4 h-8 animate-pulse" />
            </div>
          </div>

          <div className="p-4 bg-background rounded-base shadow-shadow border-2 gap-4">
            <ReviewFormSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;
