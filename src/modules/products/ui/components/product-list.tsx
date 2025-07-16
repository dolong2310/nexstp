"use client";

import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/constants";
import { useTRPC } from "@/trpc/client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import useProductFilter from "../../hooks/use-product-filter";
import ProductCard, { ProductCardSkeleton } from "./product-card";
import { InboxIcon } from "lucide-react";

type Props = {
  category?: string | null;
};

const ProductList = ({ category }: Props) => {
  const [filters] = useProductFilter();
  const trpc = useTRPC();
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(
      trpc.products.getMany.infiniteQueryOptions(
        {
          ...filters,
          category,
          limit: DEFAULT_LIMIT,
        },
        {
          getNextPageParam: (lastPage) => {
            return lastPage.docs.length > 0 ? lastPage.nextPage : undefined;
          },
        }
      )
    );

  if (data.pages?.[0]?.docs.length === 0) {
    return <ProductListEmpty />;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {data?.pages.flatMap((page) => {
          return page.docs.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              imageUrl={product.image?.url}
              authorUsername={"john doe"}
              authorImageUrl={undefined}
              reviewRating={5}
              reviewCount={3}
              price={product.price}
            />
          ));
        })}
      </div>

      <div className="flex justify-center pt-8">
        {hasNextPage && (
          <Button
            className="text-base font-medium bg-white disabled:opacity-50"
            variant="elevated"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            Load more
          </Button>
        )}
      </div>
    </>
  );
};

const ProductListEmpty = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-y-4 w-full rounded-lg bg-white border border-black border-dashed p-8">
      <InboxIcon />
      <p className="text-base font-medium">No products found</p>
    </div>
  );
};

export const ProductListSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {Array.from({ length: DEFAULT_LIMIT }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default ProductList;
