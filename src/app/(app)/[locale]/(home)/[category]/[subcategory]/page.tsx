import {
  metadataKeywords,
  metadataOpenGraph,
  metadataOpenGraphDefaultImage,
  metadataRobots,
} from "@/app/(app)/[locale]/shared-metadata";
import { DEFAULT_LIMIT, TABLE_LIMIT } from "@/constants";
import { routing } from "@/i18n/routing";
import { prefetchApi } from "@/lib/prefetch-helpers";
import {
  loadProductFilters,
  loadProductLayout,
} from "@/modules/products/search-params";
import ProductListView from "@/modules/products/ui/views/product-list-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { SearchParams } from "nuqs";

// Force dynamic rendering to support useParams() in client components
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ category: string; subcategory: string; locale: string }>;
  searchParams: Promise<SearchParams>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, subcategory, locale } = await params;

  const [{ categoryData: parentCategoryData, subcategoryData }, t] =
    await Promise.all([
      prefetchApi.categoryAndSubCategory(category, subcategory),
      getTranslations({
        locale: locale as Locale,
      }),
    ]);

  if (!subcategoryData || !parentCategoryData) {
    return {
      title: t("Category Not Found"),
      description: t("The requested category could not be found"),
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${subcategoryData.name} - ${parentCategoryData.name} ${t(
    "Products"
  )}`;
  // const description = `Shop ${subcategoryData.name.toLowerCase()} products in ${parentCategoryData.name.toLowerCase()}. Find quality items from trusted sellers.`;
  const description = t(
    "Shop {subcategory} products in {parentCategory} Find quality items from trusted sellers",
    {
      subcategory: subcategoryData.name,
      parentCategory: parentCategoryData.name,
    }
  );

  return {
    title,
    description,
    keywords: [
      subcategoryData.name,
      parentCategoryData.name,
      ...metadataKeywords.keywords,
    ],
    openGraph: {
      ...metadataOpenGraph,
      title: `${subcategoryData.name} ${t("Products")}`,
      description,
      images: [
        {
          ...metadataOpenGraphDefaultImage,
          alt: `${subcategoryData.name} ${t("products")}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${subcategoryData.name} ${t("Products")}`,
      description,
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/${category}/${subcategory}`,
    },
    ...metadataRobots,
  };
}

const SubCategoryPage = async ({ params, searchParams }: Props) => {
  const { subcategory } = await params;
  const filters = await loadProductFilters(searchParams);
  const { layout } = await loadProductLayout(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    trpc.products.getMany.infiniteQueryOptions({
      ...filters,
      category: subcategory,
      limit: layout === "table" ? TABLE_LIMIT : DEFAULT_LIMIT,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListView
        category={subcategory}
        isLayoutTable={layout === "table"}
      />
    </HydrationBoundary>
  );
};

export default SubCategoryPage;
