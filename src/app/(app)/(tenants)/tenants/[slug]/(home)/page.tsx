import {
  metadataKeywords,
  metadataOpenGraph,
  metadataOpenGraphDefaultImage,
  metadataRobots,
} from "@/app/(app)/shared-metadata";
import { DEFAULT_LIMIT, TABLE_LIMIT } from "@/constants";
import { generateTenantUrl } from "@/lib/utils";
import {
  loadProductFilters,
  loadProductLayout,
} from "@/modules/products/search-params";
import ProductListView from "@/modules/products/ui/views/product-list-view";
import TenantBanner, {
  TenantBannerSkeleton,
} from "@/modules/tenants/ui/components/tenant-banner";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<SearchParams>;
  params: Promise<{ slug: string }>;
}

const prefetchTenantData = async (slug: string) => {
  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery(trpc.tenants.getOne.queryOptions({ slug }));

    const tenant = queryClient.getQueryData(
      trpc.tenants.getOne.queryOptions({ slug }).queryKey
    );

    return { queryClient, tenant };
  } catch (error) {
    redirect("/");
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const { tenant } = await prefetchTenantData(slug);

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

  const image = tenant.image?.url;
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
      images: image
        ? [
            {
              url: image,
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

  const { queryClient } = await prefetchTenantData(slug);

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
