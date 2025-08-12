"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_LIMIT } from "@/constants";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { LoaderIcon, StarIcon } from "lucide-react";
import { useState } from "react";

interface Props {
  productId: string;
}

type TSort = "-createdAt" | "+createdAt" | "-rating" | "+rating";
type TSortOption = { label: string; value: TSort };

const sortOptions: TSortOption[] = [
  { label: "Newest", value: "-createdAt" },
  { label: "Oldest", value: "+createdAt" },
  { label: "Highest", value: "-rating" },
  { label: "Lowest", value: "+rating" },
];

const ProductReviews = ({ productId }: Props) => {
  const trpc = useTRPC();

  const [sort, setSort] = useState<TSort>(
    sortOptions[0]?.value ?? "-createdAt"
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useSuspenseInfiniteQuery(
      trpc.products.getReviews.infiniteQueryOptions(
        {
          productId,
          sort,
          limit: DEFAULT_LIMIT,
        },
        {
          getNextPageParam: (lastPage) => {
            return lastPage.docs.length > 0 ? lastPage.nextPage : undefined;
          },
        }
      )
    );

  const reviews = data?.pages.flatMap((page) => page.docs) || [];

  const handleSort = (value: TSort) => () => {
    setSort(value);
  };

  if (reviews.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {sortOptions.map((option) => (
          <Button
            key={option.value}
            variant="background"
            className={cn({
              "bg-main text-main-foreground": sort === option.value,
            })}
            onClick={handleSort(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {reviews.map((review) => (
        <div
          key={review.id}
          className="border-2 shadow-shadow rounded-base bg-background space-y-2 p-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={cn(
                      "size-4",
                      i < review.rating && "fill-black dark:fill-white"
                    )}
                  />
                ))}
              </div>
              <span className="font-medium">{review.user.username}</span>
            </div>

            <span className="text-sm text-muted-foreground">
              {format(new Date(review.createdAt), "dd/MM/yyyy HH:mm")}
            </span>
          </div>

          <p className="text-base">{review.description}</p>
        </div>
      ))}

      <div className="flex justify-center">
        {hasNextPage && (
          <Button
            variant="default"
            className="text-base font-medium"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            Load more
            {isFetchingNextPage && (
              <LoaderIcon className="size-8 animate-spin" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export const ProductReviewsSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {sortOptions.map((option) => (
          <Button
            key={option.value}
            variant="background"
            className="pointer-events-none"
          >
            {option.label}
          </Button>
        ))}
      </div>

      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="border-2 shadow-shadow rounded-base bg-background space-y-4 p-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="size-4 fill-muted-foreground" />
                ))}
              </div>
              <Skeleton className="shrink-0 h-4 w-full" />
            </div>

            <Skeleton className="shrink-0 h-4 w-24" />
          </div>

          <div className="space-y-2">
            <Skeleton className="shrink-0 h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductReviews;
