import {
  metadataKeywords,
  metadataOpenGraph,
  metadataRobots,
} from "@/app/(app)/shared-metadata";
import { DEFAULT_LIMIT } from "@/constants";
import {
  getCategoryForMetadata,
  getSubcategoryForMetadata,
} from "@/lib/server-actions/categories";
import { loadProductFilters } from "@/modules/products/search-params";
import ProductListView from "@/modules/products/views/product-list-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { SearchParams } from "nuqs";

type Props = {
  params: Promise<{ category: string; subcategory: string }>;
  searchParams: Promise<SearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, subcategory } = await params;

  const subcategoryData = await getSubcategoryForMetadata(subcategory);
  const parentCategoryData = await getCategoryForMetadata(category);

  if (!subcategoryData || !parentCategoryData) {
    return {
      title: "Category Not Found",
      description: "The requested category could not be found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${subcategoryData.name} - ${parentCategoryData.name} Products`;
  const description = `Shop ${subcategoryData.name.toLowerCase()} products in ${parentCategoryData.name.toLowerCase()}. Find quality items from trusted sellers.`;

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
      title: `${subcategoryData.name} Products`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${subcategoryData.name} Products`,
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

  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    trpc.products.getMany.infiniteQueryOptions({
      ...filters,
      category: subcategory,
      limit: DEFAULT_LIMIT,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListView category={subcategory} />
    </HydrationBoundary>
  );
};

export default SubCategoryPage;
