"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import useProductFilter from "../../hooks/use-product-filter";
import { Label } from "@/components/ui/label";

type SortType = "curated" | "trending" | "hot_and_new" | "newest" | "oldest";

const sortList = [
  { label: "Curated", value: "curated" },
  { label: "Trending", value: "trending" },
  { label: "Hot & New", value: "hot_and_new" },
];

const ProductSorts = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [filters, setFilters] = useProductFilter();
  const getSortLabel = (sort: SortType) => {
    const found = sortList.find((s) => s.value === sort);
    return found ? found.label : "Unknown";
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <CollapsibleTrigger asChild>
        <div className="rounded-base flex items-center justify-between space-x-4 border-2 border-border text-main-foreground bg-main px-4 py-2">
          <h4 className="text-sm font-heading">
            Sort ({getSortLabel(filters.sort)})
          </h4>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 text-main-foreground"
          >
            <ChevronDownIcon
              className={isOpen ? "size-4 rotate-180" : "size-4"}
            />
            <span className="sr-only">Toggle</span>
          </Button>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-2 text-main-foreground font-base">
        <div className="rounded-base border-2 border-border bg-main px-4 py-3 font-mono text-sm">
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
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ProductSorts;
