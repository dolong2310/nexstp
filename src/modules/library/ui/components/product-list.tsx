"use client";

import InfiniteScroll from "@/components/infinite-scroll";
import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/constants";
import { ProductListEmpty } from "@/modules/products/ui/components/product-list";
import { useTRPC } from "@/trpc/client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import ProductCard, { ProductCardSkeleton } from "./product-card";

const ProductList = () => {
  const trpc = useTRPC();
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(
      trpc.library.getMany.infiniteQueryOptions(
        {
          limit: DEFAULT_LIMIT,
        },
        {
          getNextPageParam: (lastPage) => {
            return lastPage.docs.length > 0 ? lastPage.nextPage : undefined;
          },
        }
      )
    );

  if (data.pages?.[0]?.totalDocs === 0) {
    return <ProductListEmpty />;
  }

  return (
    <section className="px-4 lg:px-12 py-6 lg:py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {data?.pages.flatMap((page) => {
          return page.docs.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              imageUrl={product.image?.url}
              authorUsername={product.tenant.slug}
              authorImageUrl={product.tenant.image?.url}
              reviewRating={product.reviewRating}
              reviewCount={product.reviewCount}
            />
          ));
        })}
      </div>

      <div className="flex justify-center pt-8">
        <InfiniteScroll
          hasMore={hasNextPage}
          isLoading={isFetchingNextPage}
          next={fetchNextPage}
          threshold={1}
        >
          {hasNextPage && (
            <Button
              className="text-base font-medium"
              variant="default"
              disabled
            >
              Load more <LoaderIcon className="size-8 animate-spin" />
            </Button>
          )}
        </InfiniteScroll>
      </div>
    </section>
  );
};

export const ProductListSkeleton = () => {
  return (
    <section className="px-4 lg:px-12 py-6 lg:py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {Array.from({ length: DEFAULT_LIMIT }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
};

export default ProductList;
