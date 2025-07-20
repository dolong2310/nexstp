import { getPayload } from "payload";
import config from "@payload-config";
import { Media } from "@/payload-types";

// Utility function để extract text từ rich text
function extractTextFromRichText(richText: any): string {
  if (!richText || !richText.root || !richText.root.children) {
    return "";
  }

  const extractTextFromNode = (node: any): string => {
    if (typeof node === "string") {
      return node;
    }

    if (node.text) {
      return node.text;
    }

    if (node.children && Array.isArray(node.children)) {
      return node.children.map(extractTextFromNode).join("");
    }

    return "";
  };

  return richText.root.children
    .map(extractTextFromNode)
    .join(" ")
    .trim()
    .substring(0, 160); // Giới hạn cho meta description
}

export async function getProductForMetadata(productId: string) {
  const payload = await getPayload({ config });

  try {
    const product = await payload.findByID({
      collection: "products",
      id: productId,
      depth: 2,
    });

    if (!product) return null;

    // Lấy reviews data
    const reviewsData = await payload.find({
      collection: "reviews",
      pagination: false,
      where: {
        product: { equals: product.id },
      },
    });

    let reviewRating = 0;
    if (reviewsData.docs.length > 0) {
      reviewRating =
        reviewsData.docs.reduce((acc, review) => acc + review.rating, 0) /
        reviewsData.totalDocs;
    }

    // Convert rich text description to plain text
    const plainTextDescription = product.description
      ? extractTextFromRichText(product.description)
      : "";

    return {
      ...product,
      image: product.image as Media | null,
      reviewRating,
      reviewCount: reviewsData.totalDocs,
      plainTextDescription, // Thêm field này
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}
