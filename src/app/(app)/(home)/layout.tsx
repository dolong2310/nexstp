import Footer from "@/modules/home/ui/components/footer";
import HomeBanner, {
  HomeBannerSkeleton,
} from "@/modules/home/ui/components/home-banner";
import Navbar from "@/modules/home/ui/components/navbar";
import SearchFilters, {
  SearchFiltersSkeleton,
} from "@/modules/home/ui/components/search-filters";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React, { Suspense } from "react";

interface Props {
  children: React.ReactNode;
}

const HomeLayout = async ({ children }: Props) => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.categories.getMany.queryOptions());
  void queryClient.prefetchQuery(
    trpc.home.getBannerActive.queryOptions({
      limit: 5,
    })
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<HomeBannerSkeleton />}>
          <HomeBanner />
        </Suspense>
        <Suspense fallback={<SearchFiltersSkeleton />}>
          <SearchFilters />
        </Suspense>
      </HydrationBoundary>
      <div className="flex-1 bg-secondary-background">{children}</div>
      <Footer />
    </div>
  );
};

export default HomeLayout;
