"use client";

import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import React, { useState } from "react";
import PriceFilter from "./price-filter";
import useProductFilter from "../../hooks/use-product-filter";

type Props = {};

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

const ProductFilters = (props: Props) => {
  const [filters, setFilters] = useProductFilter();

  const onChange = (key: keyof typeof filters, value: unknown) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="border rounded-md bg-white">
      <div className="flex items-center justify-between border-b p-4">
        <p className="font-medium">Filters</p>
        <button type="button" className="underline" onClick={() => {}}>
          Clear
        </button>
      </div>

      <FilterItem title="Price" className="border-b-0">
        <PriceFilter
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onMinPriceChange={(value) => onChange("minPrice", value)}
          onMaxPriceChange={(value) => onChange("maxPrice", value)}
        />
      </FilterItem>
    </div>
  );
};

export default ProductFilters;
