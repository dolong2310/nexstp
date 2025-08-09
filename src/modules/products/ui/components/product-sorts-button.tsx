"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { ArrowDownNarrowWideIcon } from "lucide-react";
import useProductFilter from "../../hooks/use-product-filter";

type SortType = "curated" | "trending" | "hot_and_new" | "newest" | "oldest";

const sortList = [
  { label: "Curated", value: "curated" },
  { label: "Trending", value: "trending" },
  { label: "Hot & New", value: "hot_and_new" },
];

const ProductSortsButton = () => {
  const [filters, setFilters] = useProductFilter();

  return (
    <div className="block sm:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size="sm" className="h-10 shrink-0">
            <ArrowDownNarrowWideIcon />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          avoidCollisions
          align="end"
          className="flex flex-col gap-1 p-2 min-w-[200px] px-4 py-3"
        >
          <div className="flex flex-col gap-y-4 gap-2">
            {sortList.map((sort) => (
              <div
                key={sort.value}
                className="flex items-center justify-between gap-2"
                onClick={() =>
                  setFilters({ ...filters, sort: sort.value as SortType })
                }
              >
                <Label
                  htmlFor={sort.value}
                  className="truncate overflow-hidden"
                >
                  {sort.label}
                </Label>
                <Checkbox
                  id={sort.value}
                  checked={filters.sort === sort.value}
                  onCheckedChange={() =>
                    setFilters({ ...filters, sort: sort.value as SortType })
                  }
                />
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProductSortsButton;
