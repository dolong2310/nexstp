"use client";

import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import React, { useState } from "react";
import useProductFilter from "../../hooks/use-product-filter";
import PriceFilter from "./price-filter";
import ProductSort from "./product-sort";
import TagsFilter from "./tags-filter";

type FilterItemProps = {
  title: string;
  className?: string;
  children: React.ReactNode;
};

const FilterItem = ({ title, className, children }: FilterItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const Icon = isOpen ? ChevronDownIcon : ChevronRightIcon;

  return (
    <div className={cn("flex flex-col gap-2 border-b p-4", className)}>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <p className="font-medium">{title}</p>
        <Icon className="size-5" />
      </div>
      {isOpen && children}
    </div>
  );
};

const ProductFilters = () => {
  const [filters, setFilters] = useProductFilter();

  const hasAnyFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "sort") {
      return false;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (typeof value === "string") {
      return value !== "";
    }

    return value !== null;
  });

  const onChange = (key: keyof typeof filters, value: unknown) => {
    setFilters({ ...filters, [key]: value });
  };

  const onClear = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      tags: [],
    });
  };

  return (
    <div className="border rounded-md bg-background">
      <div className="flex items-center justify-between border-b p-4">
        <p className="font-medium">Filters</p>
        {hasAnyFilters && (
          <button
            type="button"
            className="underline cursor-pointer"
            onClick={onClear}
          >
            Clear
          </button>
        )}
      </div>

      <FilterItem title="Price">
        <PriceFilter
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onMinPriceChange={(value) => onChange("minPrice", value)}
          onMaxPriceChange={(value) => onChange("maxPrice", value)}
        />
      </FilterItem>

      <FilterItem title="Tags" className="md:border-b-0">
        <TagsFilter
          values={filters.tags}
          onChange={(value) => onChange("tags", value)}
        />
      </FilterItem>

      <FilterItem title="Sorts" className="flex md:hidden border-b-0">
        <ProductSort />
      </FilterItem>
    </div>
  );
};

export default ProductFilters;
