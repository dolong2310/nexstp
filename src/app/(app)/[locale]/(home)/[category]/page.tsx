import { DEFAULT_LIMIT, TABLE_LIMIT } from "@/constants";
import { prefetchApi } from "@/lib/prefetch-helpers";
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
} from "../../shared-metadata";
import { getTranslations } from "next-intl/server";
import { Locale } from "next-intl";
import { routing } from "@/i18n/routing";

// Force dynamic rendering to support useParams() in client components
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ category: string; locale: string }>;
  searchParams: Promise<SearchParams>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, locale } = await params;

  const [{ categoryData }, t] = await Promise.all([
    prefetchApi.category(category),
    getTranslations({
      locale: locale as Locale,
    }),
  ]);

  if (!categoryData) {
    return {
      title: t("Category Not Found"),
      description: t("The requested category could not be found"),
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${categoryData.name} - ${t("Browse Products")}`;
  // const description2 = `Discover amazing ${categoryData.name.toLowerCase()} products from various stores. Shop the best deals and quality items.`;
  const description = t(
    "Discover amazing {category} products from various stores Shop the best deals and quality items",
    {
      category: categoryData.name.toLowerCase(),
    }
  );

  return {
    title,
    description,
    keywords: [...metadataKeywords.keywords, categoryData.name],
    openGraph: {
      ...metadataOpenGraph,
      title: `${categoryData.name} ${t("Products")}`,
      description,
      images: [
        {
          ...metadataOpenGraphDefaultImage,
          alt: `${categoryData.name} ${t("category")}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryData.name} ${t("Products")}`,
      description,
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/${category}`,
    },
    ...metadataRobots,
  };
}

const CategoryPage = async ({ params, searchParams }: Props) => {
  const { category } = await params;
  const filters = await loadProductFilters(searchParams);
  const { layout } = await loadProductLayout(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    trpc.products.getMany.infiniteQueryOptions({
      ...filters,
      category: category,
      limit: layout === "table" ? TABLE_LIMIT : DEFAULT_LIMIT,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListView category={category} isLayoutTable={layout === "table"} />
    </HydrationBoundary>
  );
};

export default CategoryPage;
