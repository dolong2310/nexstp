"use client";

import InfiniteScroll from "@/components/infinite-scroll";
import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/constants";
import { cn } from "@/lib/utils";
import { useGlobalStore } from "@/store/use-global-store";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { LoaderIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProductsGetManyOutput } from "../../types";
import ProductCard, { ProductCardSkeleton } from "./product-card";

export enum MediaQuerySizes {
  XS = 416,
  SM = 640,
  MD = 768,
  LG = 1024,
  XL = 1280,
  "2XL" = 1536,
}

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
  const loadingGlobal = useGlobalStore((state) => state.loadingGlobal);

  const [columns, setColumns] = useState<number>(4);
  const parentRef = useRef<HTMLDivElement>(null);
  const rowsLength = Math.ceil(productData.length / columns);

  const rowVirtualizer = useWindowVirtualizer({
    count: rowsLength,
    estimateSize: () => 340,
    overscan: 5,
    scrollMargin: parentRef.current?.offsetTop ?? 0,
    gap: 16,
    // initialOffset: savedOffsets.get(pathname) ?? 0,
    // initialMeasurementsCache: measurementsCaches.get(pathname),
    // onChange: (virtualizer) => {
    //   if (!virtualizer.isScrolling) {
    //     savedOffsets.set(pathname, virtualizer.scrollOffset ?? 0);
    //     measurementsCaches.set(pathname, virtualizer.measurementsCache);
    //   }
    // },
  });

  const columnVirtualizer = useWindowVirtualizer({
    horizontal: true,
    count: columns,
    estimateSize: () => 250,
    overscan: 1,
    gap: 16,
  });

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (narrowView) {
        switch (true) {
          case width >= MediaQuerySizes["2XL"]:
          case width >= MediaQuerySizes.XL:
            setColumns(3);
            break;
          case width >= MediaQuerySizes.LG:
          case width >= MediaQuerySizes.MD:
          case width >= MediaQuerySizes.SM:
          case width >= MediaQuerySizes.XS:
            setColumns(2);
            break;
          default:
            setColumns(1);
            break;
        }
        return;
      }

      switch (true) {
        case width >= MediaQuerySizes["2XL"]:
          setColumns(5);
          break;
        case width >= MediaQuerySizes.XL:
          setColumns(4);
          break;
        case width >= MediaQuerySizes.LG:
          setColumns(3);
          break;
        case width >= MediaQuerySizes.MD:
        case width >= MediaQuerySizes.SM:
        case width >= MediaQuerySizes.XS:
          setColumns(2);
          break;
        default:
          setColumns(1);
          break;
      }
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, [narrowView]);

  if (loadingGlobal) {
    return <ProductListSkeleton narrowView={narrowView} />;
  }

  return (
    <>
      <div ref={parentRef} className="w-full">
        <div
          className="w-full relative will-change-transform"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className={cn(
                  "grid gap-4 w-full absolute top-0 left-0 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
                  narrowView &&
                    "md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3"
                )}
                style={{
                  transform: `translateY(${
                    virtualRow.start - rowVirtualizer.options.scrollMargin
                  }px)`,
                }}
              >
                {columnVirtualizer.getVirtualItems().map((virtualColumn) => {
                  const productIndex =
                    virtualRow.index * columns + virtualColumn.index;
                  const product = productData[productIndex];

                  if (!product) return null;

                  // Priority loading cho images above the fold (first 8 products)
                  const isPriority = productIndex < 8;

                  return (
                    <div
                      key={virtualColumn.key}
                      data-index={virtualColumn.index}
                      ref={columnVirtualizer.measureElement}
                    >
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
                        tenantSlug={product.tenant.slug}
                        isPurchased={product.isPurchased}
                        isOwner={product.isOwner}
                        priority={isPriority}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
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
    </>
  );
};

export const ProductListSkeleton = (props: { narrowView?: boolean }) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4",
        props.narrowView &&
          "md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3"
      )}
    >
      {Array.from({ length: DEFAULT_LIMIT }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default ProductListCard;
