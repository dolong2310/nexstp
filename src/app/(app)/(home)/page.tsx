import { DEFAULT_LIMIT } from "@/constants";
import { loadProductFilters } from "@/modules/products/search-params";
import ProductListView from "@/modules/products/views/product-list-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import {
  metadataKeywords,
  metadataRobots,
  metadataOpenGraph,
} from "../shared-metadata";

type Props = {
  searchParams: Promise<SearchParams>;
};

export const metadata: Metadata = {
  title: "Home",
  description:
    "Discover amazing products from various stores in our marketplace. Browse categories, find deals, and shop from trusted sellers.",
  openGraph: {
    ...metadataOpenGraph,
    title: "Home",
    description:
      "Discover amazing products from various stores in our marketplace",
  },
  twitter: {
    card: "summary_large_image",
    title: "Home",
    description:
      "Discover amazing products from various stores in our marketplace",
  },
  ...metadataKeywords,
  ...metadataRobots,
};

const HomePage = async ({ searchParams }: Props) => {
  const filters = await loadProductFilters(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    trpc.products.getMany.infiniteQueryOptions({
      ...filters,
      limit: DEFAULT_LIMIT,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListView />
    </HydrationBoundary>
  );
};

export default HomePage;
