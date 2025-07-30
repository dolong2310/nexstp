"use client";

import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/constants";
import { cn } from "@/lib/utils";
import InfiniteScroll from "@/components/infinite-scroll";
import { LoaderIcon } from "lucide-react";
import { ProductsGetManyOutput } from "./modules/products/types";
import ProductCard, {
  ProductCardSkeleton,
} from "./modules/products/ui/components/product-card";

interface Props {
  productData: ProductsGetManyOutput;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  narrowView?: boolean;
  fetchNextPage: () => void;
}

const ProductListCard = ({
  productData,
  hasNextPage,
  isFetchingNextPage,
  narrowView,
  fetchNextPage,
}: Props) => {
  return (
    <>
      <div
        className={cn(
          // "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4",
          "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4",
          narrowView && "lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3"
        )}
      >
        {productData.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            imageUrl={product.image?.url}
            authorUsername={product.tenant.slug}
            authorImageUrl={product.tenant.image?.url}
            reviewRating={product.reviewRating}
            reviewCount={product.reviewCount}
            price={product.price}
          />
        ))}
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
              className="text-base font-medium bg-background disabled:opacity-50"
              variant="elevated"
              disabled
            >
              Load more <LoaderIcon className="my-4 h-8 w-8 animate-spin" />
            </Button>
          )}
        </InfiniteScroll>
      </div>
    </>
  );
};

export const ProductListSkeleton = (props: { narrowView?: boolean }) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4",
        props.narrowView && "lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3"
      )}
    >
      {Array.from({ length: DEFAULT_LIMIT }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default ProductListCard;
