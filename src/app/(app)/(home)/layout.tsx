import React from "react";
import Footer from "./footer";
import Navbar from "./navbar";
import SearchFilters from "./search-filters";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import { Category } from "@/payload-types";

type Props = {
  children: React.ReactNode;
};

const HomeLayout = async ({ children }: Props) => {
  const payload = await getPayload({
    config: configPromise,
  });

  const data = await payload.find({
    collection: "categories",
    depth: 1, // Populate one level deep (subcategories), subcategories.[0] will be a type of Category
    pagination: false,
    where: {
      parent: {
        exists: false, // Only fetch top-level categories
      },
    },
  });

  const formattedData = data.docs.map((doc) => ({
    ...doc,
    subcategories: (doc.subcategories?.docs || []).map((subDoc) => ({
      // Because of "depth: 1" we are confident "doc" will be a type of Category
      ...(subDoc as Category),
      subcategories: undefined, // Prevent further nesting
    })),
  }));

  console.log({ data, formattedData });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <SearchFilters data={formattedData} />
      <div className="flex-1 bg-[#F4F4F0]">{children}</div>
      <Footer />
    </div>
  );
};

export default HomeLayout;
