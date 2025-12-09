"use client";

import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "@/i18n/navigation";
import { CategoriesGetManyOutput } from "@/modules/categories/types";
import { useTRPC } from "@/trpc/client";
import { ThemeMode } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CategoriesSidebar = ({ open, onOpenChange }: Props) => {
  const t = useTranslations();
  const router = useRouter();
  const trpc = useTRPC();
  const { data } = useQuery(trpc.categories.getMany.queryOptions());

  const [parentCategories, setParentCategories] =
    useState<CategoriesGetManyOutput | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    CategoriesGetManyOutput[1] | null
  >(null);

  // If we have parent categories, show those, otherwise show root categories
  const currentCategories = parentCategories ?? data ?? [];

  const { theme } = useTheme();
  const themeKey = theme as ThemeMode;
  const backgroundColor = selectedCategory?.color?.[themeKey];

  const handleOpenChange = (open: boolean) => {
    setSelectedCategory(null);
    setParentCategories(null);
    onOpenChange(open);
  };

  const handleCategoryClick = (category: CategoriesGetManyOutput[1]) => {
    if (category.subcategories && category.subcategories.length > 0) {
      setParentCategories(category.subcategories as CategoriesGetManyOutput);
      setSelectedCategory(category);
    } else {
      // This is a leaf category (no subcategories)
      if (parentCategories && selectedCategory) {
        // This is a subcategory - navigate to /category/subcategory
        router.push(`/${selectedCategory.slug}/${category.slug}`);
      } else {
        // This is a main category - navigate to /category
        if (category.slug === "all") {
          router.push("/");
        } else {
          router.push(`/${category.slug}`);
        }
      }

      handleOpenChange(false);
    }
  };

  const handleBackClick = () => {
    if (parentCategories) {
      setParentCategories(null);
      setSelectedCategory(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="left"
        noCloseButton
        className="p-0 transition-none bg-secondary-background"
        style={backgroundColor ? { backgroundColor } : {}}
      >
        <SheetHeader className="flex flex-row items-center justify-between p-4 border-b">
          <SheetTitle className="w-fit">
            <Logo />
          </SheetTitle>
          <SheetClose asChild>
            <Button variant="neutral" size="icon" className="size-8">
              <XIcon />
              <span className="sr-only">{t("Close panel")}</span>
            </Button>
          </SheetClose>
        </SheetHeader>

        <ScrollArea className="flex flex-col overflow-auto h-full pb-2">
          {parentCategories && (
            <button
              className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium cursor-pointer"
              onClick={handleBackClick}
            >
              <ChevronLeftIcon className="size-4 mr-2" />
              {t("Back")}
            </button>
          )}

          {currentCategories.map((category) => (
            <button
              key={category.slug}
              className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center justify-between text-base font-medium cursor-pointer"
              onClick={() => handleCategoryClick(category)}
            >
              {t(category.name)}
              {category.subcategories && category.subcategories.length > 0 && (
                <ChevronRightIcon className="size-4" />
              )}
            </button>
          ))}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default CategoriesSidebar;
