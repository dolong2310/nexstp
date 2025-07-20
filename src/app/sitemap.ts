import { Tenant } from "@/payload-types";
import config from "@payload-config";
import { MetadataRoute } from "next";
import { getPayload } from "payload";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config });

  const [tenants, products, categories] = await Promise.all([
    payload.find({ collection: "tenants", pagination: false }),
    payload.find({ collection: "products", pagination: false, depth: 1 }),
    payload.find({ collection: "categories", pagination: false }),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...tenants.docs.map((tenant) => ({
      url: `${baseUrl}/tenants/${tenant.slug}`,
      lastModified: tenant.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.docs.map((product) => ({
      url: `${baseUrl}/tenants/${(product.tenant as Tenant).slug}/products/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...categories.docs.map((category) => ({
      url: `${baseUrl}/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
