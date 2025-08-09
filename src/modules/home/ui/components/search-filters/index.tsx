"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/contexts/ThemeContext";
import useProductFilter from "@/modules/products/hooks/use-product-filter";
import { useTRPC } from "@/trpc/client";
import { ThemeMode } from "@/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import BreadcrumbNavigation from "./breadcrumb-navigation";
import Categories from "./categories";
import SearchInput from "./search-input";

const SearchFilters = () => {
  const params = useParams();
  const categoryParam = params.category as string | undefined;
  const activeSubcategory = params.subcategory as string | undefined;

  const { theme } = useTheme();
  const themeKey = theme as ThemeMode;
  const [filters, setFilters] = useProductFilter();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.categories.getMany.queryOptions());

  const activeCategory = categoryParam || "all";
  const activeCategoryData = data.find((cate) => cate.slug === activeCategory);

  const activeCategoryColor = activeCategoryData?.color?.[themeKey];

  const activeCategoryName = activeCategoryData?.name || null;
  const activeSubcategoryName =
    activeCategoryData?.subcategories?.find(
      (subcate) => subcate.slug === activeSubcategory
    )?.name || null;

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value });
  };

  return (
    <div className="px-4 lg:px-12 py-8">
      <div
        className="px-4 lg:px-8 py-4 sm:py-8 flex flex-col gap-4 w-full border-4 rounded-xl bg-secondary-background transition-colors duration-200"
        style={
          activeCategoryColor ? { backgroundColor: activeCategoryColor } : {}
        }
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
    </div>
  );
};

export const SearchFiltersSkeleton = () => {
  return (
    <div className="px-4 lg:px-12 py-8">
      <div className="px-4 lg:px-12 py-8 flex flex-col gap-4 w-full border-4 rounded-xl bg-secondary-background">
        <SearchInput disabled />
        <div className="hidden lg:block">
          <Skeleton className="h-11 animate-pulse bg-secondary-background rounded" />
        </div>
        <Skeleton className="h-6 animate-pulse bg-secondary-background rounded w-48" />
      </div>
    </div>
  );
};

// const SearchFilters = withClientTheme(SearchFiltersBase, {
//   fallback: SearchFiltersSkeleton,
// });

export default SearchFilters;
