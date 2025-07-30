import { Suspense } from "react";
import ProductFilters from "../components/product-filters";
import ProductGridToggle from "../components/product-grid-toggle";
import ProductList from "../components/product-list";
import { ProductListSkeleton } from "../components/product-list-card";
import { ProductListTableSkeleton } from "../components/product-list-table";
import ProductSort from "../components/product-sort";

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
    <div className="flex flex-col gap-4 px-4 lg:px-12 py-8">
      {/* <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-y-2 lg:gap-y-0"> */}
      <div className="hidden md:flex md:flex-row lg:items-center justify-between gap-y-2 lg:gap-y-0">
        <p className="text-2xl font-medium">Curated for you</p>
        <div className="flex items-center gap-x-6">
          <ProductSort />
          <ProductGridToggle />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 xl:grid-cols-8 gap-y-6 gap-x-12">
        <div className="lg:col-span-2 xl:col-span-2">
          <ProductFilters />
        </div>

        <div className="lg:col-span-4 xl:col-span-6">
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
