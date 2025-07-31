import RefreshButton, { RefreshQueryKeys } from "@/components/refresh-button";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import ProductFilters from "../components/product-filters";
import ProductGridToggle from "../components/product-grid-toggle";
import ProductList from "../components/product-list";
import { ProductListSkeleton } from "../components/product-list-card";
import { ProductListTableSkeleton } from "../components/product-list-table";
import ProductSorts from "../components/product-sorts";

interface Props {
  category?: string | null;
  tenantSlug?: string | null;
  narrowView?: boolean;
  isLayoutTable: boolean;
}

const ProductListView = ({
  category,
  tenantSlug,
  narrowView,
  isLayoutTable,
}: Props) => {
  return (
    <div className="flex flex-col gap-4 px-4 lg:px-12 pt-4 pb-8">
      <div
        className={cn(
          "hidden md:flex md:flex-row lg:items-center justify-between gap-y-2 lg:gap-y-0",
          "sticky right-0 z-20 bg-third py-4 -mr-[1px]",
          tenantSlug ? "top-[calc(50px_+_16px)]" : "top-0"
        )}
      >
        <p className="text-2xl font-medium">Curated for you</p>
        <div className="flex items-center gap-x-4">
          <ProductGridToggle />
          <RefreshButton queryKey={"products" as RefreshQueryKeys} />
        </div>
        <div className="absolute -bottom-2 left-0 right-0 h-2 bg-gradient-to-t from-transparent to-third pointer-events-none" />
      </div>

      <div className="flex flex-col md:flex-row gap-x-12 gap-y-6">
        <div className="w-full md:w-2/6 lg:w-2/8 xl:w-2/8">
          <div
            className={cn(
              "sticky left-0",
              tenantSlug
                ? "top-[calc(138px_+_16px)]"
                : "top-[calc(72px_+_16px)]"
            )}
          >
            <ProductSorts />
            <div className="my-4" />
            <ProductFilters />
          </div>
        </div>

        <div className="w-full md:w-4/6 lg:w-6/8 xl:w-6/8">
          <Suspense
            fallback={
              isLayoutTable ? (
                <ProductListTableSkeleton />
              ) : (
                <ProductListSkeleton narrowView={narrowView} />
              )
            }
          >
            <ProductList
              category={category}
              tenantSlug={tenantSlug}
              narrowView={narrowView}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default ProductListView;
