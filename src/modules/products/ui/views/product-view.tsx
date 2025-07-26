"use client";

import Media from "@/components/media";
import StarRating from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, generateTenantUrl } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CheckIcon, LinkIcon, StarIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Fragment, useState } from "react";
import { toast } from "sonner";
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
    toast.success("URL copied to clipboard");

    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  return (
    <div className="px-4 lg:px-12 py-10">
      <div className="border rounded-sm bg-background overflow-hidden">
        <Media
          src={product.cover?.url || "/placeholder-bg.jpg"}
          alt={product.name}
          fill
          containerClassName="aspect-[3.9] border-b"
          className="object-cover"
        />

        <div className="grid grid-cols-1 lg:grid-cols-6">
          <div className="col-span-4">
            <div className="p-6">
              <h1 className="text-4xl font-medium">{product.name}</h1>
            </div>

            <div className="flex border-y">
              <div className="flex items-center justify-center border-r px-6 py-4">
                <div className="px-2 py-1 border bg-feature w-fit">
                  <p className="text-base font-medium">
                    {formatCurrency(product.price)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center lg:border-r px-6 py-4">
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

              <div className="hidden lg:flex items-center justify-center px-6 py-4">
                <div className="flex items-center gap-2">
                  <StarRating rating={product.reviewRating} />
                  <p className="text-base font-medium">
                    {product.reviewCount} ratings
                  </p>
                </div>
              </div>
            </div>

            <div className="flex lg:hidden items-center justify-center border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <StarRating rating={product.reviewRating} />
                <p className="text-base font-medium">
                  {product.reviewCount} ratings
                </p>
              </div>
            </div>

            <div className="p-6">
              {product.description ? (
                <RichText data={product.description} />
              ) : (
                <p className="font-medium text-muted-foreground italic">
                  No description available
                </p>
              )}
            </div>
          </div>

          <div className="col-span-2">
            <div className="border-t lg:border-t-0 lg:border-l h-full">
              <div className="flex flex-col gap-4 p-6 border-b">
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
                    : `${product.refundPolicy} money back guarantee`}
                </p>
              </div>

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
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductViewSkeleton = () => {
  return (
    <div className="px-4 lg:px-12 py-10">
      <div className="border rounded-sm bg-background overflow-hidden">
        <div className="relative aspect-[3.9] border-b bg-gray-200 animate-pulse" />

        <div className="grid grid-cols-1 lg:grid-cols-6">
          <div className="col-span-4">
            <div className="p-6">
              <div className="h-8 bg-gray-200 animate-pulse w-full mb-2" />
            </div>

            <div className="flex border-y">
              <div className="flex items-center justify-center border-r px-6 py-4">
                <div className="px-2 py-1 border bg-feature w-fit">
                  <div className="bg-gray-200 animate-pulse w-16 h-6" />
                </div>
              </div>

              <div className="flex items-center justify-center lg:border-r px-6 py-4">
                <div className="bg-gray-200 animate-pulse w-24 h-6" />
              </div>

              <div className="hidden lg:flex items-center justify-center px-6 py-4">
                <div className="bg-gray-200 animate-pulse w-20 h-6" />
              </div>
            </div>

            <div className="flex lg:hidden items-center justify-center border-b px-6 py-4">
              <div className="bg-gray-200 animate-pulse w-20 h-6" />
            </div>

            <div className="p-6">
              <div className="bg-gray-200 animate-pulse w-full h-[1.5em]" />
            </div>
          </div>

          <div className="col-span-2">
            <div className="border-t lg:border-t-0 lg:border-l h-full">
              <div className="flex flex-col gap-4 p-6 border-b">
                <div className="flex flex-row items-center gap-2">
                  <CartButtonSkeleton />
                  <Button disabled variant="elevated" className="size-12">
                    <LinkIcon />
                  </Button>
                </div>

                <div className="bg-gray-200 animate-pulse w-full h-[1.5em]" />
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-medium">Ratings</h3>
                  <div className="flex items-center gap-x-1 font-medium">
                    <StarIcon className="size-4 fill-black" />
                    <div className="bg-gray-200 animate-pulse w-24 h-4" />
                  </div>
                </div>

                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 mt-4">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <Fragment key={stars}>
                      <div className="font-medium">
                        {stars} {stars === 1 ? "star" : "stars"}
                      </div>
                      <Progress value={0} className="h-[1lh]" />
                      <div className="bg-gray-200 animate-pulse w-8 h-4" />
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
// ...existing code...

export default ProductView;
