"use client";

import Media from "@/components/media";
import { SocialsShareButtonSkeleton } from "@/components/socials-share-button";
import StarRating from "@/components/star-rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/contexts/ThemeContext";
import { Link } from "@/i18n/navigation";
import {
  fallbackImageUrl,
  formatCurrency,
  formatName,
  generateTenantPathname,
} from "@/lib/utils";
import useCart from "@/modules/checkout/hooks/use-cart";
import CheckoutButton from "@/modules/checkout/ui/components/checkout-button";
import { Tag } from "@/payload-types";
import { useTRPC } from "@/trpc/client";
import { RefundPolicy } from "@/types";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CheckIcon, LinkIcon, StarIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { CartButtonSkeleton } from "../components/cart-button";
import { ProductReviewsSkeleton } from "../components/product-reviews";
import { TenantProductsCarouselSkeleton } from "../components/product-tenant-carousel";

const PreviewImageModal = dynamic(
  () => import("@/components/preview-image-modal"),
  {
    ssr: false,
  }
);

const CartButton = dynamic(
  () => import("../components/cart-button").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <CartButtonSkeleton />,
  }
);

const SocialsShareButton = dynamic(
  () => import("@/components/socials-share-button"),
  {
    ssr: false,
    loading: () => <SocialsShareButtonSkeleton />,
  }
);

const ProductReviews = dynamic(() => import("../components/product-reviews"), {
  ssr: false,
  loading: () => <ProductReviewsSkeleton />,
});

const TenantProductsCarousel = dynamic(
  () => import("../components/product-tenant-carousel"),
  {
    ssr: false,
    loading: () => <TenantProductsCarouselSkeleton />,
  }
);

interface Props {
  productId: string;
  tenantSlug: string;
}

const TabOptions = [
  { value: "overview", label: "Overview" },
  { value: "content", label: "Content" },
  { value: "ratings", label: "Ratings" },
];

const ProductView = ({ productId, tenantSlug }: Props) => {
  const t = useTranslations();
  const { theme } = useTheme();
  const cart = useCart();
  const isProductInCart = cart.isProductInCart(productId, tenantSlug);
  const trpc = useTRPC();
  const { data: product } = useSuspenseQuery(
    trpc.products.getOne.queryOptions({ id: productId })
  );

  const [isCopied, setIsCopied] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleCopy = () => {
    setIsCopied(true);
    navigator.clipboard.writeText(window.location.href);
    toast.message(t("URL copied to clipboard"), { duration: 1000 });

    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

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
              containerClassName="aspect-square cursor-pointer"
              className="object-cover"
              onClick={() => setIsPreviewOpen(true)}
            />
            <PreviewImageModal
              src={fallbackImageUrl(product.image?.url, theme)}
              alt={product.name}
              isOpen={isPreviewOpen}
              onOpenChange={setIsPreviewOpen}
            />

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
                  {t(tab.label)}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview">
              <div className="border-2 shadow-shadow rounded-base bg-background overflow-hidden">
                <div className="p-6">
                  {product.description ? (
                    <p className="font-medium break-words">
                      {product.description}
                    </p>
                  ) : (
                    <p className="font-medium text-foreground italic">
                      {t("No description available")}
                    </p>
                  )}

                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h3 className="font-semibold">{t("Tags")}</h3>
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
                      {t("No content available")}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent className="space-y-4" value="ratings">
              <div className="border-2 shadow-shadow rounded-base bg-background overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-medium">{t("Ratings")}</h3>
                    <div className="flex items-center gap-x-1 font-medium">
                      <StarIcon className="size-4 fill-black dark:fill-white" />
                      <p>({product.reviewRating})</p>
                      <p className="text-base">
                        {product.reviewCount} {t("ratings")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-[auto_1fr_auto] gap-3 mt-4">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <Fragment key={stars}>
                        <div className="font-medium">
                          {stars} {stars === 1 ? t("star") : t("stars")}
                        </div>
                        <Progress
                          value={product.ratingDistribution[stars]}
                          className="h-[1lh]"
                        />
                        <div className="font-medium">
                          {product.ratingDistribution[stars]}%
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>

              <ProductReviews productId={productId} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column */}
        <div className="w-full md:w-2/5">
          <div className="border-2 shadow-shadow rounded-base bg-background py-6 space-y-4 sticky top-4 right-0">
            <div className="px-6">
              <Link
                href={generateTenantPathname(tenantSlug)}
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
              <h1 className="text-4xl font-medium line-clamp-2 break-words">
                {product.name}
              </h1>
            </div>

            <div className="px-6">
              <Badge>
                <p className="text-base font-medium">
                  {formatCurrency(product.price)}
                </p>
              </Badge>
            </div>

            <div className="px-6">
              <div className="flex items-center gap-2">
                <StarRating rating={product.reviewRating} />
                <p className="text-base font-medium">
                  {product.reviewCount} {t("ratings")}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 px-6">
              <div className="flex flex-row items-center gap-2">
                <CartButton
                  variant="default"
                  size="lg"
                  tenantSlug={tenantSlug}
                  productId={productId}
                  isPurchased={product.isPurchased}
                  isOwner={product.isOwner}
                  isDisabled={product.isOwner}
                  customLabel={product.isOwner ? t("You own this product") : ""}
                />
                {isProductInCart && (
                  <CheckoutButton
                    tenantSlug={tenantSlug}
                    className="h-11"
                    hasTotalLabel={false}
                  />
                )}
                <Button
                  disabled={isCopied}
                  variant="default"
                  className="size-11"
                  onClick={handleCopy}
                >
                  {isCopied ? <CheckIcon /> : <LinkIcon />}
                </Button>
              </div>

              <p className="text-center font-medium">
                {product.refundPolicy === "no-refunds"
                  ? t("No refunds")
                  : `${t(RefundPolicy[product.refundPolicy!])} ${t("money back guarantee")}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8">
        <TenantProductsCarousel
          tenantSlug={tenantSlug}
          currentProductId={productId}
          tenantName={product.tenant.name}
        />
      </div>
    </div>
  );
};

export const ProductViewSkeleton = () => {
  const t = useTranslations();
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
                  {t(tab.label)}
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
                <h3 className="text-xl font-medium animate-pulse">
                  {t("Ratings")}
                </h3>
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div
                    key={stars}
                    className="grid grid-cols-[auto_1fr_auto] gap-3 mt-4 animate-pulse"
                  >
                    <span>
                      {stars} {t("stars")}
                    </span>
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

            <div className="px-6">
              <Skeleton className="text-base font-medium bg-secondary-background w-20 h-6 animate-pulse" />
            </div>

            <div className="px-6">
              <div className="flex items-center gap-2">
                <StarRating rating={0} />
                <Skeleton className="text-base font-medium bg-secondary-background w-8 h-5 animate-pulse" />{" "}
                {t("ratings")}
              </div>
            </div>

            <div className="flex flex-col gap-4 px-6">
              <div className="flex flex-row items-center gap-2">
                <CartButtonSkeleton variant="default" size="lg" />
                <Button
                  disabled
                  variant="default"
                  className="size-11 bg-secondary-background"
                >
                  <LinkIcon className="size-4" />
                </Button>
              </div>

              <Skeleton className="mx-auto text-center font-medium bg-secondary-background w-3/4 h-5 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;
