"use client";

import InfiniteScroll from "@/components/infinite-scroll";
import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/constants";
import { useGlobalStore } from "@/store/use-global-store";
import { useTRPC } from "@/trpc/client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { InboxIcon, LoaderIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import useLaunchpadFilter from "../../hooks/use-launchpad-filter";
import { LaunchpadCard, LaunchpadCardSkeleton } from "./launchpad-card";

const LaunchpadList = () => {
  const t = useTranslations();
  const loadingGlobal = useGlobalStore((state) => state.loadingGlobal);
  const trpc = useTRPC();
  const [filters] = useLaunchpadFilter();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(
      trpc.launchpads.getMany.infiniteQueryOptions(
        {
          ...filters,
          limit: DEFAULT_LIMIT,
        },
        {
          getNextPageParam: (lastPage) => {
            return lastPage.docs.length > 0 ? lastPage.nextPage : undefined;
          },
        }
      )
    );

  const launchpads = data?.pages.flatMap((page) => page.docs) ?? [];

  if (loadingGlobal) {
    return <LaunchpadListSkeleton />;
  }

  if (data.pages?.[0]?.totalDocs === 0) {
    return <LaunchpadListEmpty />;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {launchpads.map((launchpad) => (
          <LaunchpadCard key={launchpad.id} launchpad={launchpad} />
        ))}
      </div>

      {/* Load More Button */}
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
              {t("Load more")} <LoaderIcon className="size-8 animate-spin" />
            </Button>
          )}
        </InfiniteScroll>
      </div>
    </>
  );
};

export const LaunchpadListSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
      {Array.from({ length: DEFAULT_LIMIT }).map((_, i) => (
        <LaunchpadCardSkeleton key={i} />
      ))}
    </div>
  );
};

const LaunchpadListEmpty = () => {
  const t = useTranslations();
  return (
    <div className="flex flex-col items-center justify-center gap-y-4 w-full rounded-base bg-background border-4 p-8">
      <InboxIcon />
      <p className="text-base font-medium">{t("No launchpads found")}</p>
    </div>
  );
};

export default LaunchpadList;
