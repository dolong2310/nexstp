import { DEFAULT_LIMIT } from "@/constants";
import { getCategoryForMetadata } from "@/lib/server-actions/categories";
import { loadProductFilters } from "@/modules/products/search-params";
import ProductListView from "@/modules/products/views/product-list-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import {
  metadataOpenGraphDefaultImage,
  metadataKeywords,
  metadataOpenGraph,
  metadataRobots,
} from "../../shared-metadata";

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<SearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;

  // Lấy thông tin category thực từ database
  const categoryData = await getCategoryForMetadata(category);

  if (!categoryData) {
    return {
      title: "Category Not Found",
      description: "The requested category could not be found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${categoryData.name} - Browse Products`;
  const description = `Discover amazing ${categoryData.name.toLowerCase()} products from various stores. Shop the best deals and quality items.`;

  return {
    title,
    description,
    keywords: [...metadataKeywords.keywords, categoryData.name],
    openGraph: {
      ...metadataOpenGraph,
      title: `${categoryData.name} Products`,
      description,
      images: [
        {
          ...metadataOpenGraphDefaultImage,
          alt: `${categoryData.name} category`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryData.name} Products`,
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

  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    trpc.products.getMany.infiniteQueryOptions({
      ...filters,
      category: category,
      limit: DEFAULT_LIMIT,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListView category={category} />
    </HydrationBoundary>
  );
};

export default CategoryPage;
