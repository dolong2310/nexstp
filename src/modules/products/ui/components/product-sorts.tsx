"use client";

import { Checkbox } from "@/components/ui/checkbox";
import useProductFilter from "../../hooks/use-product-filter";
import FilterItem from "./product-filter-item";

type SortType = "curated" | "trending" | "hot_and_new" | "newest" | "oldest";

const sortList = [
  { label: "Curated", value: "curated" },
  { label: "Trending", value: "trending" },
  { label: "Hot & New", value: "hot_and_new" },
];

const ProductSorts = () => {
  const [filters, setFilters] = useProductFilter();
  const getSortLabel = (sort: SortType) => {
    const found = sortList.find((s) => s.value === sort);
    return found ? found.label : "Unknown";
  };

  return (
    <div className="border rounded-md bg-background">
      <div className="flex items-center justify-between border-b p-4">
        <p className="font-medium">Sorts</p>
      </div>

      <FilterItem
        title={getSortLabel(filters.sort)}
        className="flex border-b-0"
      >
        <div className="flex flex-col gap-2 p-4">
          {sortList.map((sort) => (
            <div
              key={sort.value}
              className="flex items-center justify-between cursor-pointer"
              onClick={() =>
                setFilters({ ...filters, sort: sort.value as SortType })
              }
            >
              <p className="font-medium">{sort.label}</p>
              <Checkbox
                checked={filters.sort === sort.value}
                onCheckedChange={() =>
                  setFilters({ ...filters, sort: sort.value as SortType })
                }
              />
            </div>
          ))}
        </div>
      </FilterItem>
    </div>
  );
};

export default ProductSorts;
