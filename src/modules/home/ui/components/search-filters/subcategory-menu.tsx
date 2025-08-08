"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { CategoriesGetManyOutput } from "@/modules/categories/types";
import { Category } from "@/payload-types";
import { ThemeMode } from "@/types";
import Link from "next/link";

interface Props {
  category: CategoriesGetManyOutput[1];
  isOpen: boolean;
}

const SubcategoryMenu = ({ category, isOpen }: Props) => {
  if (
    !isOpen ||
    !category.subcategories ||
    category.subcategories.length === 0
  ) {
    return null; // Don't render if not open or no subcategories
  }

  const { theme } = useTheme();
  const themeKey = theme as ThemeMode;
  const backgroundColor = category.color?.[themeKey];

  return (
    <div className="absolute z-100" style={{ top: "100%", left: 0 }}>
      {/* Invisible bridge to maintain hover */}
      <div className="h-3 w-60" />
      <div
        className="w-60 text-black dark:text-white bg-main rounded-md overflow-hidden border-2"
        style={backgroundColor ? { backgroundColor } : {}}
      >
        <div className="">
          {category.subcategories?.map((subcategory: Category) => (
            <Link
              key={subcategory.slug}
              href={`/${category.slug}/${subcategory.slug}`}
              className="w-full text-left p-4 hover:bg-black hover:text-white flex justify-between items-center underline font-medium"
            >
              {subcategory.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubcategoryMenu;
