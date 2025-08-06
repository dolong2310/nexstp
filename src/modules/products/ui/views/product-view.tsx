"use client";

import { toast } from "@/components/custom-toast";
import Media from "@/components/media";
import StarRating from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, generateTenantUrl } from "@/lib/utils";
import { Tag } from "@/payload-types";
import { useTRPC } from "@/trpc/client";
import { RefundPolicy } from "@/types";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CheckIcon, LinkIcon, StarIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Fragment, useState } from "react";
import { CartButtonSkeleton } from "../components/cart-button";

const CartButton = dynamic(
  () => import("../components/cart-button").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <CartButtonSkeleton />,
  }
);

interface Props {
  productId: string;
  tenantSlug: string;
}

const ProductView = ({ productId, tenantSlug }: Props) => {
  const trpc = useTRPC();
  const { data: product } = useSuspenseQuery(
    trpc.products.getOne.queryOptions({ id: productId })
  );

  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    setIsCopied(true);
    navigator.clipboard.writeText(window.location.href);
    toast.custom("URL copied to clipboard", { duration: 1000 });

    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  return (
    <div className="px-4 lg:px-12 py-10">
      <div className="flex flex-col md:flex-row items-start gap-4 md:gap-8">
        <div className="w-full md:w-3/5 space-y-6">
          <div className="border rounded-sm bg-background overflow-hidden">
            <Media
              src={product.image?.url || "/placeholder-bg.jpg"}
              alt={product.name}
              fill
              containerClassName="aspect-square border-b"
              className="object-cover"
            />
          </div>

          <Tabs defaultValue="overview" className="gap-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="ratings">Ratings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="border rounded-sm bg-background overflow-hidden">
                <div className="p-6">
                  {product.description ? (
                    <p className="font-medium">{product.description}</p>
                  ) : (
                    <p className="font-medium text-muted-foreground italic">
                      No description available
                    </p>
                  )}

                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h3 className="font-semibold">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {(product.tags as Tag[]).map((tag) => (
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
                  {product.content ? (
                    <RichText data={product.content} />
                  ) : (
                    <p className="font-medium text-muted-foreground italic">
                      No content available
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="ratings">
              <div className="border rounded-sm bg-background overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-medium">Ratings</h3>
                    <div className="flex items-center gap-x-1 font-medium">
                      <StarIcon className="size-4 fill-black" />
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
            </TabsContent>
          </Tabs>
        </div>

        <div className="w-full md:w-2/5">
          <div className="border rounded-sm bg-background py-6 space-y-4 sticky top-4 right-0">
            <div className="px-6">
              <Link
                href={generateTenantUrl(tenantSlug)}
                className="flex items-center gap-2"
              >
                {product.tenant.image?.url && (
                  <Media
                    src={product.tenant.image?.url}
                    alt={product.tenant.name}
                    width={20}
                    height={20}
                    className="rounded-full border shrink-0 size-5"
                  />
                )}
                <p className="text-base underline font-medium">
                  {product.tenant.name}
                </p>
              </Link>
            </div>

            <div className="px-6">
              <h1 className="text-4xl font-medium">{product.name}</h1>
            </div>

            <div className="px-6">
              <div className="px-2 py-1 border bg-feature w-fit">
                <p className="text-base font-medium">
                  {formatCurrency(product.price)}
                </p>
              </div>
            </div>

            <div className="px-6">
              <div className="flex items-center gap-2">
                <StarRating rating={product.reviewRating} />
                <p className="text-base font-medium">
                  {product.reviewCount} ratings
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 px-6">
              <div className="flex flex-row items-center gap-2">
                <CartButton
                  tenantSlug={tenantSlug}
                  productId={productId}
                  isPurchased={product.isPurchased}
                />
                <Button
                  disabled={isCopied}
                  variant="elevated"
                  className="size-12"
                  onClick={handleCopy}
                >
                  {isCopied ? <CheckIcon /> : <LinkIcon />}
                </Button>
              </div>

              <p className="text-center font-medium">
                {product.refundPolicy === "no-refunds"
                  ? "No refunds"
                  : `${
                      RefundPolicy[product.refundPolicy!]
                    } money back guarantee`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductViewSkeleton = () => {
  return (
    <div className="px-4 lg:px-12 py-10">
      <div className="flex flex-col md:flex-row items-start gap-4 md:gap-8">
        <div className="w-full md:w-3/5 space-y-6">
          <div className="border rounded-sm bg-background overflow-hidden">
            <div className="aspect-square bg-muted animate-pulse" />
          </div>

          <Tabs defaultValue="overview" className="gap-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="ratings">Ratings</TabsTrigger>
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
            <TabsContent value="ratings">
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
              <p className="text-base font-medium bg-muted w-20 h-6 animate-pulse" />
            </div>

            <div className="px-6">
              <div className="flex items-center gap-2">
                <StarRating rating={0} />
                <p className="text-base font-medium bg-muted w-8 h-5 animate-pulse" />{" "}
                ratings
              </div>
            </div>

            <div className="flex flex-col gap-4 px-6">
              <div className="flex flex-row items-center gap-2">
                <CartButtonSkeleton />
                <Button
                  disabled={true}
                  variant="elevated"
                  className="size-12 bg-muted"
                >
                  <LinkIcon className="size-4" />
                </Button>
              </div>

              <p className="mx-auto text-center font-medium bg-muted w-3/4 h-5 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;
