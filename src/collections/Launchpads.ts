import { isSuperAdmin } from "@/lib/access";
import { Tenant } from "@/payload-types";
import type { CollectionConfig } from "payload";

export const Launchpads: CollectionConfig = {
  slug: "launchpads",
  access: {
    // @ts-ignore
    read: ({ req }) => {
      // Public có thể xem launchpads live
      if (!req.user) {
        return {
          status: {
            equals: "live",
          },
        };
      }

      // Super admin xem tất cả
      if (isSuperAdmin(req.user)) {
        return true;
      }

      // Tenant chỉ xem launchpads của mình
      const userTenantIds = (req.user.tenants || []).map((tenant) => {
        return (tenant.tenant as Tenant).id;
      });

      return {
        tenant: {
          in: userTenantIds,
        },
      };
    },
    create: ({ req }) => {
      if (isSuperAdmin(req.user)) return true;
      // Chỉ tenant có thể tạo
      const tenants = req.user?.tenants || [];
      if (!tenants.length) return false;
      // Check if tenant has submitted Stripe details
      return tenants.some((tenant) =>
        Boolean((tenant.tenant as Tenant).stripeDetailsSubmitted)
      );
      // return !!(req.user && req.user.tenants && req.user.tenants.length > 0);
    },
    update: ({ req, data, id }) => {
      // Super admin có thể update tất cả
      if (isSuperAdmin(req.user)) {
        return true;
      }

      // Cho phép tenant update khi tạo mới hoặc khi status = 'draft' hoặc 'rejected'
      if (!req.user?.tenants?.length) {
        return false;
      }

      // Nếu là operation create (không có id) thì cho phép
      if (!id) {
        return true;
      }

      // Nếu có data và status không phải draft hoặc rejected thì không cho phép
      if (data?.status && !["draft", "rejected"].includes(data.status)) {
        return false;
      }

      return true;
    },
    delete: ({ req, data, id }) => {
      // Super admin có thể xóa tất cả
      if (isSuperAdmin(req.user)) {
        return true;
      }

      // Chỉ có thể xóa khi status = 'draft' hoặc 'rejected'
      if (data?.status && !["draft", "rejected"].includes(data.status)) {
        return false;
      }

      return !!req.user?.tenants?.length;
    },
  },
  admin: {
    useAsTitle: "title",
    description: "You must verify your account before creating launchpads.",
    defaultColumns: ["title", "status", "tenant", "startTime", "endTime"],
    components: {
      edit: {
        beforeDocumentControls: [
          "@/components/admin/ui/launchpads/launchpad-actions#LaunchpadActions",
        ],
      },
    },
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      maxLength: 100,
    },
    {
      name: "description",
      type: "textarea",
      // required: true,
      maxLength: 500,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "originalPrice",
      type: "number",
      required: true,
      min: 0,
      admin: {
        description: "Original listed price",
      },
    },
    {
      name: "launchPrice",
      type: "number",
      required: true,
      min: 0,
      admin: {
        description: "Launch promotional price",
      },
    },
    {
      name: "duration",
      type: "number",
      required: true,
      min: 1,
      max: 720,
      admin: {
        description: "Live duration (in hours)",
      },
    },
    {
      name: "startTime",
      type: "date",
      admin: {
        description: "Start time (automatically set upon publishing)",
        readOnly: true,
      },
    },
    {
      name: "endTime",
      type: "date",
      admin: {
        description: "End time (automatically set upon publishing)",
        readOnly: true,
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Pending Approval", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Live", value: "live" },
        { label: "Ended", value: "ended" },
        { label: "Rejected", value: "rejected" },
      ],
      admin: {
        readOnly: true,
      },
    },
    {
      name: "priority",
      type: "number",
      defaultValue: 0,
      admin: {
        description: "Priority order (admin only)",
        condition: (data, siblingData, { user }) => isSuperAdmin(user),
      },
      access: {
        update: ({ req }) => isSuperAdmin(req.user),
      },
    },
    {
      name: "soldCount",
      type: "number",
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: "Quantity sold",
      },
    },
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      required: true,
      admin: {
        condition: (data, siblingData, { user }) => isSuperAdmin(user),
      },
      access: {
        update: ({ req }) => isSuperAdmin(req.user),
      },
      hooks: {
        beforeChange: [
          ({ req, operation, value }) => {
            // TODO: kiểm tra
            // Auto-assign tenant khi tạo launchpad mới
            if (operation === "create" && !value && req.user) {
              const userTenantIds = (req.user.tenants || []).map((tenant) => {
                return (tenant.tenant as Tenant).id;
              });
              if (userTenantIds.length > 0) {
                const tenantId = userTenantIds[0];
                return tenantId;
              }
            }
            return value;
          },
        ],
      },
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      required: true,
    },
    {
      name: "tags",
      type: "relationship",
      relationTo: "tags",
      hasMany: true,
    },
    {
      name: "content",
      type: "richText",
      required: false,
    },
    {
      name: "refundPolicy",
      type: "select",
      options: ["30-day", "14-day", "7-day", "3-day", "1-day", "no-refunds"],
      defaultValue: "30-day",
      admin: {
        description: "Refund policy",
      },
    },
    {
      name: "rejectionReason",
      type: "textarea",
      admin: {
        condition: (data) => data?.status === "rejected",
        description: "Rejection reason (admin only)",
      },
      access: {
        update: ({ req }) => isSuperAdmin(req.user),
      },
    },
    {
      name: "createdProduct",
      type: "relationship",
      relationTo: "products",
      admin: {
        condition: (data) => data?.status === "ended",
        description: "Product created when launchpad ended",
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        // console.log("beforeValidate hook - operation:", operation);
        // console.log("beforeValidate hook - data.tenant before:", data?.tenant);
        // console.log("beforeValidate hook - user tenants:", req.user?.tenants);

        // Auto-assign tenant cho create operation
        if (operation === "create" && !data?.tenant && req.user && data) {
          const userTenantIds = (req.user.tenants || []).map((tenant) => {
            return (tenant.tenant as Tenant).id;
          });
          if (userTenantIds.length > 0) {
            const tenantId = userTenantIds[0];
            // console.log("Auto-assigning tenant:", tenantId);
            data.tenant = tenantId;
          }
          // const tenantId = (req.user.tenants?.[0]?.tenant as Tenant).id;
          // console.log("Auto-assigning tenant:", tenantId);
          // if (tenantId) {
          //   data.tenant = tenantId;
          // }
        }

        // Validate launchPrice < originalPrice
        if (data?.launchPrice && data?.originalPrice) {
          if (data.launchPrice >= data.originalPrice) {
            throw new Error("Launch price must be less than original price");
          }
        }

        // console.log("beforeValidate hook - data.tenant after:", data?.tenant);
      },
    ],
    afterChange: [
      ({ doc, operation, previousDoc, req }) => {
        // console.log(`Launchpad operation: ${operation}`);
        // console.log(`Launchpad ID: ${doc.id}`);
        // console.log(`User ID: ${req.user?.id}`);

        if (operation === "update" && doc.status !== previousDoc?.status) {
          // console.log(
          //   `Launchpad ${doc.id} status changed from ${previousDoc?.status} to ${doc.status}`
          // );
        }
      },
    ],
  },
  timestamps: true,
};
