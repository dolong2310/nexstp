"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FunnelIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import useProductFilter from "../../hooks/use-product-filter";
import PriceFilter from "./price-filter";
import TagsFilter from "./tags-filter";

const ProductFiltersButton = () => {
  const t = useTranslations();
  const [filters, setFilters] = useProductFilter();

  const hasPriceFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "minPrice" || key === "maxPrice") {
      return value !== "" && value !== null;
    }
  });

  const hasTagFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "tags") {
      return value.length > 0;
    }
  });

  const onChange = (key: keyof typeof filters, value: unknown) => {
    setFilters({ ...filters, [key]: value });
  };

  const onClear = (filterType: "price" | "tags") => () => {
    setFilters((prev) => {
      if (filterType === "price") {
        return {
          ...prev,
          minPrice: "",
          maxPrice: "",
        };
      }
      if (filterType === "tags") {
        return {
          ...prev,
          tags: [],
        };
      }
      return prev;
    });
  };

  return (
    <div className="block md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size="sm" className="h-10 shrink-0">
            <FunnelIcon />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          avoidCollisions
          align="end"
          className="flex flex-col gap-1 p-2 min-w-[200px] py-3 px-0"
        >
          <div className="flex flex-col gap-y-4 gap-2">
            <div className="px-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-md font-heading">{t("Price")}</h4>
                {hasPriceFilters && (
                  <button
                    type="button"
                    className="underline cursor-pointer"
                    onClick={onClear("price")}
                  >
                    {t("Clear")}
                  </button>
                )}
              </div>
              <PriceFilter
                minPrice={filters.minPrice}
                maxPrice={filters.maxPrice}
                onMinPriceChange={(value) => onChange("minPrice", value)}
                onMaxPriceChange={(value) => onChange("maxPrice", value)}
              />
            </div>

            <div className="border-b-2" />

            <div className="px-4 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-md font-heading">{t("Tags")}</h4>
                {hasTagFilters && (
                  <button
                    type="button"
                    className="underline cursor-pointer"
                    onClick={onClear("tags")}
                  >
                    {t("Clear")}
                  </button>
                )}
              </div>
              <TagsFilter
                values={filters.tags}
                onChange={(value) => onChange("tags", value)}
              />
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProductFiltersButton;
