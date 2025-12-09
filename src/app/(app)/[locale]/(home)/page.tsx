import { DEFAULT_LIMIT, TABLE_LIMIT } from "@/constants";
import {
  loadProductFilters,
  loadProductLayout,
} from "@/modules/products/search-params";
import ProductListView from "@/modules/products/ui/views/product-list-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import {
  metadataKeywords,
  metadataOpenGraph,
  metadataOpenGraphDefaultImage,
  metadataRobots,
} from "../shared-metadata";
import { getTranslations } from "next-intl/server";
import { Locale } from "next-intl";

interface Props {
  searchParams: Promise<SearchParams>;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({
    locale: locale as Locale,
  });

  return {
    title: t("Home"),
    description:
      t("Discover amazing products from various stores in our marketplace Browse categories, find deals, and shop from trusted sellers"),
    openGraph: {
      ...metadataOpenGraph,
      title: t("Home"),
      description:
        t("Discover amazing products from various stores in our marketplace"),
      images: [
        {
          ...metadataOpenGraphDefaultImage,
          alt: `Nexstp`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("Home"),
      description:
        t("Discover amazing products from various stores in our marketplace"),
    },
    ...metadataKeywords,
    ...metadataRobots,
  };
}

const HomePage = async ({ searchParams }: Props) => {
  const filters = await loadProductFilters(searchParams);
  const { layout } = await loadProductLayout(searchParams);

  // TODO: detect isLayoutTable after change layout, error when toggle layout
  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    trpc.products.getMany.infiniteQueryOptions({
      ...filters,
      limit: layout === "table" ? TABLE_LIMIT : DEFAULT_LIMIT,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListView isLayoutTable={layout === "table"} />
    </HydrationBoundary>
  );
};

export default HomePage;
