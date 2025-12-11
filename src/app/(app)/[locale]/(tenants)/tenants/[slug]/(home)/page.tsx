import {
  metadataKeywords,
  metadataOpenGraph,
  metadataOpenGraphDefaultImage,
  metadataRobots,
} from "@/app/(app)/[locale]/shared-metadata";
import { DEFAULT_LIMIT, TABLE_LIMIT } from "@/constants";
import { routing } from "@/i18n/routing";
import { prefetchApi } from "@/lib/prefetch-helpers";
import { generateTenantUrl } from "@/lib/utils";
import {
  loadProductFilters,
  loadProductLayout,
} from "@/modules/products/search-params";
import ProductListView from "@/modules/products/ui/views/product-list-view";
import TenantBanner, {
  TenantBannerSkeleton,
} from "@/modules/tenants/ui/components/tenant-banner";
import { trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

// Force dynamic rendering to support useParams() in client components
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<SearchParams>;
  params: Promise<{ slug: string; locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;

  const [{ tenant }, t] = await Promise.all([
    prefetchApi.tenant(slug),
    getTranslations({
      locale: locale as Locale,
    }),
  ]);

  if (!tenant) {
    return {
      title: t("Store Not Found"),
      description: t("The requested store could not be found"),
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const image = tenant.image?.url;
  const title = `${tenant.name} - ${t("Store")}`;
  const description = t("Shop amazing products from {tenantName} Discover our curated collection of high-quality items", {
    tenantName: tenant.name,
  });

  return {
    title,
    description,
    keywords: [...metadataKeywords.keywords, tenant.name],
    openGraph: {
      ...metadataOpenGraph,
      title: tenant.name,
      description,
      siteName: tenant.name,
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: `${tenant.name} ${t("store logo")}`,
            },
          ]
        : [
            {
              ...metadataOpenGraphDefaultImage,
              alt: `${tenant.name} ${t("store")}`,
            },
          ],
      url: generateTenantUrl(slug),
    },
    twitter: {
      card: "summary_large_image",
      title: tenant.name,
      description,
      images: image ? [image] : [],
    },
    alternates: {
      canonical: generateTenantUrl(slug),
    },
    ...metadataRobots,
  };
}

const TenantsPage = async ({ params, searchParams }: Props) => {
  const { slug } = await params;
  const filters = await loadProductFilters(searchParams);
  const { layout } = await loadProductLayout(searchParams);

  const { queryClient } = await prefetchApi.tenant(slug);

  void queryClient.prefetchInfiniteQuery(
    trpc.products.getMany.infiniteQueryOptions({
      ...filters,
      tenantSlug: slug,
      limit: layout === "table" ? TABLE_LIMIT : DEFAULT_LIMIT,
    })
  );
  void queryClient.prefetchQuery(
    trpc.home.getBannerActive.queryOptions({
      tenantSlug: slug,
      limit: 5,
    })
  );

  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<TenantBannerSkeleton />}>
          <TenantBanner tenantSlug={slug} />
        </Suspense>

        <ProductListView
          tenantSlug={slug}
          narrowView
          isLayoutTable={layout === "table"}
        />
      </HydrationBoundary>
    </>
  );
};

export default TenantsPage;
