"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useProductFilter from "../../hooks/use-product-filter";

const ProductSort = () => {
  const [filters, setFilters] = useProductFilter();

  return (
    <div className="flex items-center gap-2 mt-2 md:mt-0">
      <Button
        variant="secondary"
        size="sm"
        className={cn(
          "rounded-full bg-background hover:bg-background",
          filters.sort !== "curated" &&
            "bg-transparent border-transparent hover:border-border hover:bg-transparent"
        )}
        onClick={() => setFilters({ ...filters, sort: "curated" })}
      >
        Curated
      </Button>

      <Button
        variant="secondary"
        size="sm"
        className={cn(
          "rounded-full bg-background hover:bg-background",
          filters.sort !== "trending" &&
            "bg-transparent border-transparent hover:border-border hover:bg-transparent"
        )}
        onClick={() => setFilters({ ...filters, sort: "trending" })}
      >
        Trending
      </Button>

      <Button
        variant="secondary"
        size="sm"
        className={cn(
          "rounded-full bg-background hover:bg-background",
          filters.sort !== "hot_and_new" &&
            "bg-transparent border-transparent hover:border-border hover:bg-transparent"
        )}
        onClick={() => setFilters({ ...filters, sort: "hot_and_new" })}
      >
        Hot & New
      </Button>
    </div>
  );
};

export default ProductSort;
