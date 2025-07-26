"use client";

import { DEFAULT_BG_COLOR, ThemeMode } from "@/modules/home/constants";
import useProductFilter from "@/modules/products/hooks/use-product-filter";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import withClientTheme from "../../providers/with-client-theme";
import BreadcrumbNavigation from "./breadcrumb-navigation";
import Categories from "./categories";
import SearchInput from "./search-input";

const SearchFiltersBase = () => {
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

  const activeCategoryColor =
    activeCategoryData?.color?.[themeKey] || DEFAULT_BG_COLOR[themeKey];

  const activeCategoryName = activeCategoryData?.name || null;
  const activeSubcategoryName =
    activeCategoryData?.subcategories?.find(
      (subcate) => subcate.slug === activeSubcategory
    )?.name || null;

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value });
  };

  return (
    <div className="px-4 lg:px-12 pb-8">
      <div
        className="border rounded-xl flex flex-col gap-4 w-full transition-colors duration-200 px-4 lg:px-12 py-8"
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
    </div>
  );
};

export const SearchFiltersSkeleton = () => {
  return (
    <div
      className="px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full"
      style={{ backgroundColor: DEFAULT_BG_COLOR.dark }}
    >
      <SearchInput disabled />
      <div className="hidden lg:block">
        <div className="h-11 animate-pulse bg-neutral-200 rounded" />
      </div>
      <div className="h-6 animate-pulse bg-neutral-200 rounded w-48" />
    </div>
  );
};

const SearchFilters = withClientTheme(SearchFiltersBase, {
  fallback: SearchFiltersSkeleton,
});

export default SearchFilters;
