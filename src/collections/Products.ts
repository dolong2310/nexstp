import { isSuperAdmin } from "@/lib/access";
import { Tenant } from "@/payload-types";
import type { CollectionConfig } from "payload";

export const Products: CollectionConfig = {
  slug: "products",
  access: {
    read: () => true,
    create: ({ req }) => {
      if (isSuperAdmin(req.user)) return true;
      const tenants = req.user?.tenants || [];
      if (!tenants.length) return false;
      // Check if tenant has submitted Stripe details
      if (
        tenants.some((tenant) =>
          Boolean((tenant.tenant as Tenant).stripeDetailsSubmitted)
        )
      ) {
        return true;
      }
      return false;
      // const tenant = req.user?.tenants?.[0]?.tenant as Tenant;
      // return Boolean(tenant?.stripeDetailsSubmitted);
    },
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  admin: {
    useAsTitle: "name",
    description: "You must verify your account before creating products.",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "textarea",
      maxLength: 500,
    },
    {
      name: "price",
      type: "number",
      required: true,
      admin: {
        description: "Price in USD",
      },
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      hasMany: false,
    },
    {
      name: "tags",
      type: "relationship",
      relationTo: "tags",
      hasMany: true,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "refundPolicy",
      type: "select",
      options: ["30-day", "14-day", "7-day", "3-day", "1-day", "no-refunds"],
      defaultValue: "30-day",
    },
    {
      name: "content",
      type: "richText",
      admin: {
        description:
          "Protected content only visible to customers after purchase. Add product documentation, downloadable files, getting started guides, and bonus materials. Supports Markdown formatting.",
      },
    },
    {
      name: "isPrivate",
      label: "Private",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "If checked, this product will not be shown on the public storefront.",
      },
    },
    {
      name: "isArchived",
      label: "Archive",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "If checked, this product will be archived and not visible to customers.",
      },
    },
    {
      name: "sourceType",
      type: "select",
      options: [
        { label: "Manual", value: "manual" },
        { label: "From Launchpad", value: "launchpad" },
      ],
      defaultValue: "manual",
      admin: {
        description: "How this product was created",
        readOnly: true,
      },
    },
    {
      name: "sourceLaunchpad",
      type: "relationship",
      relationTo: "launchpads",
      admin: {
        condition: (data) => data?.sourceType === "launchpad",
        description: "The launchpad this product was created from",
        readOnly: true,
      },
    },
  ],
};
