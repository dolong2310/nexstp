import { DEFAULT_LIMIT } from "@/constants";
import { loadLaunchpadFilters } from "@/modules/launchpads/search-params";
import LaunchpadsView, {
  LaunchpadsViewSkeleton,
} from "@/modules/launchpads/ui/views/launchpad-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

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
    title: `${t("Launchpads")} - ${t("Exclusive Early Access Deals")}`,
    description: t(
      "Discover amazing products at launch prices Limited time offers with special discounts before they go to regular price"
    ),
    keywords: [
      "launchpad",
      "early access",
      "deals",
      "discounts",
      "new products",
      "limited time",
    ],
    openGraph: {
      title: `${t("Launchpads")} - ${t("Exclusive Early Access Deals")}`,
      description: t(
        "Get early access to amazing products at special launch prices"
      ),
      type: "website",
    },
  };
}

const LaunchpadsPage = async ({ searchParams }: Props) => {
  const filters = await loadLaunchpadFilters(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    trpc.launchpads.getMany.infiniteQueryOptions({
      ...filters,
      limit: DEFAULT_LIMIT,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<LaunchpadsViewSkeleton />}>
        <LaunchpadsView />
      </Suspense>
    </HydrationBoundary>
  );
};

export default LaunchpadsPage;
