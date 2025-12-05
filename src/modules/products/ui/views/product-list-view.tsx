import RefreshButton, { RefreshQueryKeys } from "@/components/refresh-button";
import { cn } from "@/lib/utils";
import CheckoutButton from "@/modules/checkout/ui/components/checkout-button";
import { Suspense } from "react";
import ProductFilterPrice from "../components/product-filter-price";
import ProductFilterTag from "../components/product-filter-tag";
import ProductFiltersButton from "../components/product-filters-button";
import ProductGridToggle from "../components/product-grid-toggle";
import ProductList from "../components/product-list";
import { ProductListSkeleton } from "../components/product-list-card";
import { ProductListTableSkeleton } from "../components/product-list-table";
import ProductSorts from "../components/product-sorts";
import ProductSortsButton from "../components/product-sorts-button";

interface Props {
  category?: string | null;
  tenantSlug?: string;
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
    <div
      className={cn(
        "flex flex-col gap-8 px-4 lg:px-12 pt-8 pb-8",
        !narrowView &&
          "bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:70px_70px]"
      )}
    >
      {/* Product Navbar */}
      <div
        className={cn(
          "flex items-center justify-end flex-wrap md:justify-between gap-y-2 lg:gap-y-0 shadow-shadow border-2 rounded-base px-4",
          "sticky top-0 right-0 z-20 bg-secondary-background py-2",
          "px-4 lg:px-8"
          // tenantSlug ? "top-[calc(40px+16px)]" : "top-0"
        )}
      >
        <h3 className="hidden md:block text-2xl font-medium">
          Curated for you
        </h3>
        <div className="w-full md:w-auto flex items-center gap-x-4">
          <div className="mr-auto md:mr-0">
            <ProductGridToggle />
          </div>
          <ProductSortsButton />
          <ProductFiltersButton />
          <RefreshButton
            queryKey={"products" as RefreshQueryKeys}
            size="icon"
          />
          <CheckoutButton tenantSlug={tenantSlug} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-x-8 gap-y-6">
        {/* Product Filters */}
        <div className={cn("hidden md:block w-full md:w-2/6 lg:w-2/8 xl:w-2/8", !tenantSlug && "2xl:w-2/10")}>
          <div
            className={cn(
              "sticky top-[calc(72px_+_16px)] left-0"
              // tenantSlug ? "top-[calc(124px+_16px)]" : "top-[calc(72px_+_16px)]"
            )}
          >
            <ProductSorts />
            <div className="my-2" />
            <ProductFilterPrice />
            <div className="my-2" />
            <ProductFilterTag />
          </div>
        </div>

        {/* Product List */}
        <div className={cn("w-full md:w-4/6 lg:w-6/8 xl:w-6/8", !tenantSlug && "2xl:w-8/10")}>
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
