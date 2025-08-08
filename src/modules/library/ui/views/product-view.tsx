"use client";

import { useTRPC } from "@/trpc/client";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ReviewFormSkeleton } from "../components/review-form";
import ReviewSidebar from "../components/review-sidebar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface Props {
  productId: string;
}

const ProductView = ({ productId }: Props) => {
  const trpc = useTRPC();
  const { data: product } = useSuspenseQuery(
    trpc.library.getOne.queryOptions({
      productId,
    })
  );

  return (
    <div className="min-h-screen bg-secondary-background bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:70px_70px]">
      <nav className="w-full p-4 border-b-2 bg-secondary-background">
        <Link prefetch href="/library" className="flex items-center gap-2">
          <ArrowLeftIcon className="size-4" />
          <span className="text font-medium">Back to Library</span>
        </Link>
      </nav>

      <header className="py-8 border-b-2 bg-background">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-12">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-medium">{product.name}</h1>
            {product.isFromLaunchpad && (
              <Badge>
                <p className="text-xs font-medium">Launchpad</p>
              </Badge>
            )}
          </div>
          {/* <h1 className="text-4xl font-medium">{product.name}</h1> */}
          <p className="font-medium">Your purchased and reviews</p>
          {product.isFromLaunchpad && product.originalPrice && (
            <p className="text-sm text-foreground mt-1">
              You saved ${product.originalPrice - product.price} from launch
              price!
            </p>
          )}
        </div>
      </header>

      <section className="max-w-screen-xl mx-auto px-4 lg:px-12 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-16">
          <div className="lg:col-span-2">
            <Card className="p-4 gap-0">
              <Suspense fallback={<ReviewFormSkeleton />}>
                <ReviewSidebar productId={productId} />
              </Suspense>
            </Card>
          </div>
          <div className="lg:col-span-5">
            {product?.content ? (
              <RichText data={product?.content} />
            ) : (
              <p className="font-medium italic text-foreground">
                No special content
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export const ProductViewSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="w-full p-4 border-b bg-secondary-background">
        <div className="flex items-center gap-2">
          <ArrowLeftIcon className="size-4" />
          <span className="text font-medium">Back to Library</span>
        </div>
      </nav>

      <header className="py-8 border-b bg-secondary-background">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-12">
          <h1 className="text-4xl font-medium animate-pulse bg-secondary-background h-8 w-1/3 mb-2"></h1>
          <p className="font-medium animate-pulse bg-secondary-background h-6 w-1/4"></p>
        </div>
      </header>

      <section className="max-w-screen-xl mx-auto px-4 lg:px-12 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-16">
          <div className="lg:col-span-2">
            <div className="p-4 bg-background rounded-md border gap-4">
              <ReviewFormSkeleton />
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="animate-pulse bg-secondary-background h-12 w-full mb-4"></div>
            <p className="font-medium italic text-foreground animate-pulse bg-secondary-background h-6 w-1/3"></p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductView;
