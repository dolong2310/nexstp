import { DEFAULT_LIMIT } from "@/constants";
import LibraryView from "@/modules/library/ui/views/library-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";

const LibraryPage = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    trpc.library.getMany.infiniteQueryOptions({
      limit: DEFAULT_LIMIT,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <LibraryView />
      </Suspense>
    </HydrationBoundary>
  );
};

export default LibraryPage;
