"use client";

import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT, TABLE_LIMIT } from "@/constants";
import { useTRPC } from "@/trpc/client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { InboxIcon } from "lucide-react";
import Link from "next/link";
import useProductFilter from "../../hooks/use-product-filter";
import useProductGridLayout from "../../hooks/use-product-grid-layout";
import { ProductsGetManyOutput } from "../../types";
import ProductListCard from "./product-list-card";
import ProductListTable from "./product-list-table";

interface Props {
  category?: string | null;
  tenantSlug?: string | null;
  narrowView?: boolean;
}

const ProductList = ({ category, tenantSlug, narrowView }: Props) => {
  const [filters] = useProductFilter();
  const [{ layout }] = useProductGridLayout();

  const trpc = useTRPC();
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(
      trpc.products.getMany.infiniteQueryOptions(
        {
          ...filters,
          category,
          tenantSlug,
          limit: layout === "table" ? TABLE_LIMIT : DEFAULT_LIMIT,
        },
        {
          getNextPageParam: (lastPage) => {
            return lastPage.docs.length > 0 ? lastPage.nextPage : undefined;
          },
        }
      )
    );

  if (data.pages?.[0]?.totalDocs === 0) {
    return <ProductListEmpty />;
  }

  const productData: ProductsGetManyOutput = data?.pages.flatMap(
    (page) => page.docs
  );

  if (layout === "table") {
    return (
      <ProductListTable
        productData={productData}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      />
    );
  }

  return (
    <ProductListCard
      productData={productData}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      narrowView={narrowView}
    />
  );
};

export const ProductListEmpty = ({
  visibleLibraryButton = false,
}: {
  visibleLibraryButton?: boolean;
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-y-4 w-full rounded-base bg-background border-4 p-8">
      <InboxIcon />
      <p className="text-base font-medium">No products found</p>
      {visibleLibraryButton && (
        <Button asChild variant="default" size="sm" className="mt-2">
          <Link href="/library">Library</Link>
        </Button>
      )}
    </div>
  );
};

export default ProductList;
