"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CategoriesGetManyOutput } from "@/modules/categories/types";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";

const SubcategoryMenu = dynamic(() => import("./subcategory-menu"), {
  ssr: false,
});

type Props = {
  category: CategoriesGetManyOutput[1];
  isActive?: boolean;
  isNavigationHovered?: boolean;
};

const CategoryDropdown = ({
  category,
  isActive,
  isNavigationHovered,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const onMouseEnter = () => {
    if (category.subcategories) {
      setIsOpen(true);
    }
  };

  const onMouseLeave = () => setIsOpen(false);

  // TODO: Potentially improve mobile
  const toggleDropdown = () => {
    // @ts-ignore
    if (category.subcategories?.docs?.length) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={toggleDropdown}
    >
      <div className="relative">
        <Button
          asChild
          variant="elevated"
          className={cn(
            "h-11 px-4 bg-transparent border-transparent rounded-full hover:bg-background hover:border-primary text-foreground",
            isActive && !isNavigationHovered && "bg-background border-primary",
            isOpen &&
              "bg-background border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] -translate-x-[4px] -translate-y-[4px]"
          )}
        >
          <Link href={`/${category.slug === "all" ? "" : category.slug}`}>
            {category.name}
          </Link>
        </Button>
        {category.subcategories && category.subcategories.length > 0 && (
          <div
            className={cn(
              "opacity-0 absolute -bottom-3 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[10px] border-l-transparent border-r-transparent border-b-border left-1/2 -translate-x-1/2",
              isOpen && "opacity-100"
            )}
          />
        )}
      </div>

      <SubcategoryMenu category={category} isOpen={isOpen} />
    </div>
  );
};

export default CategoryDropdown;
