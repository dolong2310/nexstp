import { getPayload } from "payload";
import config from "@/payload.config";

export async function monitorExpiredLaunchpads() {
  try {
    const payload = await getPayload({ config });
    const now = new Date();

    console.log(`[${now.toISOString()}] Checking for expired launchpads...`);

    // Tìm các launchpads đã hết hạn
    const expiredLaunchpads = await payload.find({
      collection: "launchpads",
      where: {
        and: [
          {
            status: {
              equals: "live",
            },
          },
          {
            endTime: {
              less_than: now.toISOString(),
            },
          },
        ],
      },
      pagination: false,
    });

    console.log(`Found ${expiredLaunchpads.docs.length} expired launchpads`);

    // Process từng launchpad đã hết hạn
    for (const launchpad of expiredLaunchpads.docs) {
      try {
        console.log(`Processing expired launchpad: ${launchpad.id}`);

        // 1. Cập nhật status thành 'ended'
        await payload.update({
          collection: "launchpads",
          id: launchpad.id,
          data: {
            status: "ended",
          },
        });

        // 2. Tạo product tương ứng với originalPrice
        const productData = {
          id: launchpad.id, // Giữ nguyên ID để dễ dàng liên kết
          name: launchpad.title,
          price: launchpad.originalPrice,
          category: launchpad.category,
          tags: launchpad.tags,
          image: launchpad.image,
          content: launchpad.content,
          description: launchpad.description,
          tenant: launchpad.tenant,
          refundPolicy: launchpad.refundPolicy,
          cover: launchpad.image, // Sử dụng cùng image cho cover
          sourceType: "launchpad" as const,
          sourceLaunchpad: launchpad.id,
          isArchived: false,
          isPrivate: false,
        };

        const newProduct = await payload.create({
          collection: "products",
          data: productData,
        });

        console.log(
          `Created product ${newProduct.id} from launchpad ${launchpad.id}`
        );

        // 3. Cập nhật launchpad với reference đến product mới tạo
        await payload.update({
          collection: "launchpads",
          id: launchpad.id,
          data: {
            createdProduct: newProduct.id,
          },
        });

        console.log(`Successfully processed launchpad ${launchpad.id}`);
      } catch (error) {
        console.error(`Error processing launchpad ${launchpad.id}:`, error);
      }
    }

    return {
      success: true,
      processedCount: expiredLaunchpads.docs.length,
    };
  } catch (error) {
    console.error("Error in monitorExpiredLaunchpads:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Function để check và xử lý launchpads sắp hết hạn (warning)
export async function checkUpcomingExpiry() {
  try {
    const payload = await getPayload({ config });
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 giờ nữa

    // Tìm launchpads sẽ hết hạn trong 1 giờ tới
    const upcomingExpiry = await payload.find({
      collection: "launchpads",
      where: {
        and: [
          {
            status: {
              equals: "live",
            },
          },
          {
            endTime: {
              greater_than: now.toISOString(),
            },
          },
          {
            endTime: {
              less_than: oneHourFromNow.toISOString(),
            },
          },
        ],
      },
      pagination: false,
    });

    if (upcomingExpiry.docs.length > 0) {
      console.log(
        `Warning: ${upcomingExpiry.docs.length} launchpads will expire within 1 hour`
      );

      // Có thể gửi notification, email, webhook, etc.
      for (const launchpad of upcomingExpiry.docs) {
        console.log(
          `Launchpad "${launchpad.title}" (${launchpad.id}) expires at ${launchpad.endTime}`
        );
      }
    }

    return {
      success: true,
      upcomingCount: upcomingExpiry.docs.length,
    };
  } catch (error) {
    console.error("Error in checkUpcomingExpiry:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
