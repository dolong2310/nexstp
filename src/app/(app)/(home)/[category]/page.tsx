import React from "react";

type Props = {
  params: Promise<{ category: string }>;
};

const CategoryPage = async ({ params }: Props) => {
  const { category } = await params;
  console.log("Category:", category);

  return <div>CategoryPage</div>;
};

export default CategoryPage;
