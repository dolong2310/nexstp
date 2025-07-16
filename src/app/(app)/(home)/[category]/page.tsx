import { loadProductFilters } from "@/modules/products/search-params";
import ProductListView from "@/modules/products/views/product-list-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { SearchParams } from "nuqs/server";

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<SearchParams>;
};

const CategoryPage = async ({ params, searchParams }: Props) => {
  const { category } = await params;
  const filters = await loadProductFilters(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.products.getMany.queryOptions({
      category: category || null,
      ...filters,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListView category={category} />
    </HydrationBoundary>
  );
};

export default CategoryPage;
