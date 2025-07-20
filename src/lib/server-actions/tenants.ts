// src/lib/server-actions/tenant.ts
import { Media } from "@/payload-types";
import config from "@payload-config";
import { getPayload } from "payload";

export async function getTenantForMetadata(slug: string) {
  const payload = await getPayload({ config });

  try {
    const tenantData = await payload.find({
      collection: "tenants",
      where: {
        slug: {
          equals: slug,
        },
      },
      depth: 1, // Populate image
      limit: 1,
    });

    if (!tenantData.docs[0]) return null;

    const tenant = tenantData.docs[0];

    return { ...tenant, image: tenant.image as Media | null };
  } catch (error) {
    console.error("Error fetching tenant:", error);
    return null;
  }
}
