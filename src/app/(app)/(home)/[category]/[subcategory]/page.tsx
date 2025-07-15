import React from "react";

type Props = {
  params: Promise<{ category: string; subcategory: string }>;
};

const SubCategoryPage = async ({ params }: Props) => {
  const { category, subcategory } = await params;
  console.log("category:", category);
  console.log("SubCategory:", subcategory);

  return <div>SubCategoryPage</div>;
};

export default SubCategoryPage;
