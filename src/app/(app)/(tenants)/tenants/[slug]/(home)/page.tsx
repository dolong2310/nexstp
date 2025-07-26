import {
  metadataOpenGraphDefaultImage,
  metadataKeywords,
  metadataOpenGraph,
  metadataRobots,
} from "@/app/(app)/shared-metadata";
import { DEFAULT_LIMIT } from "@/constants";
import { getTenantForMetadata } from "@/lib/server-actions/tenants";
import { generateTenantUrl } from "@/lib/utils";
import Banner, { BannerSkeleton } from "@/modules/home/ui/components/banner";
import { loadProductFilters } from "@/modules/products/search-params";
import ProductListView from "@/modules/products/ui/views/product-list-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<SearchParams>;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const tenant = await getTenantForMetadata(slug);

  if (!tenant) {
    return {
      title: "Store Not Found",
      description: "The requested store could not be found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${tenant.name} - Store`;
  const description = `Shop amazing products from ${tenant.name}. Discover our curated collection of high-quality items.`;

  return {
    title,
    description,
    keywords: [...metadataKeywords.keywords, tenant.name],
    openGraph: {
      ...metadataOpenGraph,
      title: tenant.name,
      description,
      siteName: tenant.name,
      images: tenant.image?.url
        ? [
            {
              url: tenant.image.url,
              width: 1200,
              height: 630,
              alt: `${tenant.name} store logo`,
            },
          ]
        : [
            {
              ...metadataOpenGraphDefaultImage,
              alt: `${tenant.name} store`,
            },
          ],
      url: generateTenantUrl(slug),
    },
    twitter: {
      card: "summary_large_image",
      title: tenant.name,
      description,
      images: tenant.image?.url ? [tenant.image.url] : [],
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

  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    trpc.products.getMany.infiniteQueryOptions({
      ...filters,
      tenantSlug: slug,
      limit: DEFAULT_LIMIT,
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
        <Suspense fallback={<BannerSkeleton />}>
          <Banner tenantSlug={slug} />
        </Suspense>
        <Suspense fallback={<ProductListView tenantSlug={slug} narrowView />}>
          <ProductListView tenantSlug={slug} narrowView />
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default TenantsPage;
