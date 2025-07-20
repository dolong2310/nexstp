import { getPayload } from "payload";
import config from "@payload-config";

export async function getCategoryForMetadata(slug: string) {
  const payload = await getPayload({ config });

  try {
    const categoriesData = await payload.find({
      collection: "categories",
      limit: 1,
      pagination: false,
      where: {
        slug: { equals: slug },
      },
    });

    return categoriesData.docs[0] || null;
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
}

export async function getSubcategoryForMetadata(slug: string) {
  const payload = await getPayload({ config });

  try {
    const subcategoriesData = await payload.find({
      collection: "categories",
      limit: 1,
      pagination: false,
      depth: 1, // Populate parent category
      where: {
        slug: { equals: slug },
        parent: { exists: true }, // Chỉ lấy subcategories
      },
    });

    return subcategoriesData.docs[0] || null;
  } catch (error) {
    console.error("Error fetching subcategory:", error);
    return null;
  }
}
