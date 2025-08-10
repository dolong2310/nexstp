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
      <TabsList className="shadow-shadow">
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
