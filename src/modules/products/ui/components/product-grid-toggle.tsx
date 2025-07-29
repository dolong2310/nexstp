"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, TableOfContents } from "lucide-react";
import useProductGridLayout from "../../hooks/use-product-grid-layout";

const ProductGridToggle = () => {
  const [{ layout }, setLayout] = useProductGridLayout();

  const handleTabChange = (value: string) => {
    setLayout({ layout: value as "grid" | "table" });
  };

  return (
    <Tabs defaultValue="grid" value={layout} onValueChange={handleTabChange}>
      <TabsList className="hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-x-[4px] hover:-translate-y-[4px] transition-all">
        <TabsTrigger value="grid">
          <LayoutGrid className="size-5" />
        </TabsTrigger>
        <TabsTrigger value="table">
          <TableOfContents className="size-5" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default ProductGridToggle;
