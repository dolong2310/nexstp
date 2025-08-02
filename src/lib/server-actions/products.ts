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
    // Step 1: Thử tìm trong collection "products" trước
    let product = null;
    let isFromLaunchpad = false;

    try {
      product = await payload.findByID({
        collection: "products",
        id: productId,
        depth: 2,
      });
    } catch (error) {
      // Nếu không tìm thấy trong products, thử tìm trong launchpads
      try {
        const launchpad = await payload.findByID({
          collection: "launchpads",
          id: productId,
          depth: 2,
        });

        if (launchpad) {
          // Convert launchpad to product format
          product = {
            id: launchpad.id,
            name: launchpad.title,
            description: launchpad.description,
            price: launchpad.launchPrice,
            originalPrice: launchpad.originalPrice,
            image: launchpad.image,
            tenant: launchpad.tenant,
            category: launchpad.category,
            tags: launchpad.tags,
            content: launchpad.content,
            refundPolicy: launchpad.refundPolicy,
          };
          isFromLaunchpad = true;
        }
      } catch (launchpadError) {
        console.error("Error fetching launchpad:", launchpadError);
      }
    }

    if (!product) return null;

    // Step 2: Lấy reviews data (sử dụng productId cho cả products và launchpads)
    const reviewsData = await payload.find({
      collection: "reviews",
      pagination: false,
      where: {
        product: { equals: productId }, // Sử dụng productId gốc
      },
    });

    let reviewRating = 0;
    if (reviewsData.docs.length > 0) {
      reviewRating =
        reviewsData.docs.reduce((acc, review) => acc + review.rating, 0) /
        reviewsData.totalDocs;
    }

    // Step 3: Convert rich text description to plain text
    const plainTextDescription = product.description
      ? extractTextFromRichText(product.description)
      : "";

    return {
      ...product,
      image: product.image as Media | null,
      reviewRating,
      reviewCount: reviewsData.totalDocs,
      plainTextDescription,
      isFromLaunchpad, // Add flag để biết đây là launchpad hay product
    };
  } catch (error) {
    console.error("Error fetching product/launchpad:", error);
    return null;
  }
}

// Thêm function riêng cho launchpad metadata
export async function getLaunchpadForMetadata(launchpadId: string) {
  const payload = await getPayload({ config });

  try {
    const launchpad = await payload.findByID({
      collection: "launchpads",
      id: launchpadId,
      depth: 2,
    });

    if (!launchpad) return null;

    // Lấy reviews data
    const reviewsData = await payload.find({
      collection: "reviews",
      pagination: false,
      where: {
        product: { equals: launchpad.id }, // Reviews cho launchpad sử dụng launchpad ID
      },
    });

    let reviewRating = 0;
    if (reviewsData.docs.length > 0) {
      reviewRating =
        reviewsData.docs.reduce((acc, review) => acc + review.rating, 0) /
        reviewsData.totalDocs;
    }

    // Convert rich text description to plain text
    const plainTextDescription = launchpad.description || "";

    return {
      id: launchpad.id,
      name: launchpad.title,
      description: launchpad.description,
      plainTextDescription,
      image: launchpad.image as Media | null,
      reviewRating,
      reviewCount: reviewsData.totalDocs,
      price: launchpad.launchPrice,
      originalPrice: launchpad.originalPrice,
      isFromLaunchpad: true,
    };
  } catch (error) {
    console.error("Error fetching launchpad:", error);
    return null;
  }
}
