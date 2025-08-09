"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import useProductFilter from "../../hooks/use-product-filter";
import PriceFilter from "./price-filter";

const ProductFilterPrice = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [filters, setFilters] = useProductFilter();

  const hasPriceFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "minPrice" || key === "maxPrice") {
      return value !== "" && value !== null;
    }
  });

  const onChange = (key: keyof typeof filters, value: unknown) => {
    setFilters({ ...filters, [key]: value });
  };

  const onClear = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <CollapsibleTrigger asChild>
        <div className="rounded-base shadow-shadow flex items-center justify-between space-x-2 border-2 border-border text-main-foreground bg-main px-4 py-2">
          <div className="flex items-center justify-between flex-1">
            <h4 className="text-sm font-heading">Price</h4>
            {hasPriceFilters && (
              <button
                type="button"
                className="underline cursor-pointer"
                onClick={onClear}
              >
                Clear
              </button>
            )}
          </div>
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

      <CollapsibleContent className="rounded-base shadow-shadow space-y-2 text-main-foreground font-base">
        <div className="rounded-base border-2 border-border bg-main px-4 py-3 font-mono text-sm">
          <PriceFilter
            minPrice={filters.minPrice}
            maxPrice={filters.maxPrice}
            onMinPriceChange={(value) => onChange("minPrice", value)}
            onMaxPriceChange={(value) => onChange("maxPrice", value)}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ProductFilterPrice;
