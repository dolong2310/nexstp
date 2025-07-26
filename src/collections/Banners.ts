import { isSuperAdmin } from "@/lib/access";
import type { CollectionConfig } from "payload";

export const Banners: CollectionConfig = {
  slug: "banners",
  access: {
    read: ({ req }) => {
      if (isSuperAdmin(req.user)) {
        return true;
      }

      // Nếu không có user hoặc user không có tenants thì không cho phép đọc
      if (!req.user || !req.user.tenants || req.user.tenants.length === 0) {
        return false;
      }

      // User chỉ có thể đọc banners của tenant mình
      const userTenantIds = req.user.tenants.map((tenant) => {
        if (typeof tenant === "string") return tenant;
        if (tenant?.tenant)
          return typeof tenant.tenant === "string"
            ? tenant.tenant
            : tenant.tenant.id;
        if (tenant?.id) return tenant.id;
        return tenant;
      });

      return {
        tenant: {
          in: userTenantIds,
        },
      };
    },
    create: ({ req }) => isSuperAdmin(req.user),
    update: ({ req }) => isSuperAdmin(req.user), // true,
    delete: ({ req }) => isSuperAdmin(req.user),
    // update: ({ req }) => {
    //   // Super admin có thể update tất cả
    //   if (isSuperAdmin(req.user)) {
    //     return true;
    //   }

    //   // User chỉ có thể update banner của tenant mình (nếu được phép)
    //   if (!req.user || !req.user.tenants || req.user.tenants.length === 0) {
    //     return false;
    //   }

    //   const userTenantIds = req.user.tenants.map((tenant) =>
    //     typeof tenant === "string" ? tenant : tenant.tenant
    //   );

    //   return {
    //     tenant: {
    //       in: userTenantIds,
    //     },
    //   };
    // },
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "tenant", "isActive", "priority", "createdAt"],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Banner Title",
      admin: {
        description: "Title for the banner (used for SEO and accessibility)",
      },
    },
    {
      name: "description",
      type: "textarea",
      label: "Banner Description",
      admin: {
        description: "Optional description for the banner",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      label: "Banner Image",
      admin: {
        description:
          "High-quality image for the banner (recommended: 1920x540px)",
      },
    },
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      required: true,
      label: "Target Tenant",
      admin: {
        description: "The tenant store this banner will link to",
      },
      // Chỉ cho phép chọn tenant mà user thuộc về (trừ super admin)
      // filterOptions: ({ req }) => {
      //   if (isSuperAdmin(req.user)) {
      //     return true; // Admin có thể chọn bất kỳ tenant nào
      //   }

      //   if (!req.user || !req.user.tenants || req.user.tenants.length === 0) {
      //     return false; // Không có tenant thì không hiển thị gì
      //   }

      //   const userTenantIds = req.user.tenants.map((tenant) =>
      //     typeof tenant === "string" ? tenant : tenant.tenant
      //   );

      //   return {
      //     id: {
      //       in: userTenantIds,
      //     },
      //   };
      // },
    },
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      label: "Featured Product (Optional)",
      admin: {
        description:
          "Optional: Link to a specific product instead of tenant homepage",
        condition: (data, siblingData) => !!siblingData.tenant,
      },
      filterOptions: ({ relationTo, data, req }) => {
        if (!data?.tenant) {
          return false; // Không có tenant thì không hiển thị products
        }

        // Chỉ hiển thị products thuộc về tenant đã chọn
        return {
          tenant: {
            equals: data.tenant,
          },
        };
      },
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
      label: "Active",
      admin: {
        description: "Whether this banner is currently active",
      },
    },
    {
      name: "priority",
      type: "number",
      defaultValue: 0,
      label: "Priority",
      admin: {
        description: "Higher numbers appear first (0 = lowest priority)",
      },
    },
    {
      name: "startDate",
      type: "date",
      label: "Start Date",
      admin: {
        description: "When this banner should start showing (optional)",
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "endDate",
      type: "date",
      label: "End Date",
      admin: {
        description: "When this banner should stop showing (optional)",
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "clickCount",
      type: "number",
      defaultValue: 0,
      label: "Click Count",
      admin: {
        readOnly: true,
        description: "Number of times this banner has been clicked",
      },
    },
    {
      name: "impressionCount",
      type: "number",
      defaultValue: 0,
      label: "Impression Count",
      admin: {
        readOnly: true,
        description: "Number of times this banner has been viewed",
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // Ensure priority is a valid number
        if (data && (data.priority === undefined || data.priority === null)) {
          data.priority = 0;
        }
        return data;
      },
    ],
  },
};
