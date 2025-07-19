"use client";

import { DEFAULT_BG_COLOR } from "@/modules/home/constants";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Categories from "./categories";
import SearchInput from "./search-input";
import BreadcrumbNavigation from "./breadcrumb-navigation";
import useProductFilter from "@/modules/products/hooks/use-product-filter";

const SearchFilters = () => {
  const params = useParams();
  const categoryParam = params.category as string | undefined;
  const activeSubcategory = params.subcategory as string | undefined;

  const [filters, setFilters] = useProductFilter();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.categories.getMany.queryOptions());

  const activeCategory = categoryParam || "all";

  const activeCategoryData = data.find((cate) => cate.slug === activeCategory);
  const activeCategoryColor = activeCategoryData?.color || DEFAULT_BG_COLOR;
  const activeCategoryName = activeCategoryData?.name || null;
  const activeSubcategoryName =
    activeCategoryData?.subcategories?.find(
      (subcate) => subcate.slug === activeSubcategory
    )?.name || null;

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value });
  };

  return (
    <div
      className="px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full"
      style={{ backgroundColor: activeCategoryColor }}
    >
      <SearchInput value={filters.search} onChange={handleSearchChange} />
      <div className="hidden lg:block">
        <Categories data={data} />
      </div>
      <BreadcrumbNavigation
        activeCategory={activeCategory}
        activeCategoryName={activeCategoryName}
        activeSubcategoryName={activeSubcategoryName}
      />
    </div>
  );
};

export const SearchFiltersSkeleton = () => {
  return (
    <div
      className="px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full"
      style={{ backgroundColor: "#F5F5F5" }}
    >
      <SearchInput disabled />
      <div className="hidden lg:block">
        <div className="h-11" />
      </div>
    </div>
  );
};

export default SearchFilters;
