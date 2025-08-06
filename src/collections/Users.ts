import { IS_PRODUCTION } from "@/constants";
import { isSuperAdmin } from "@/lib/access";
import { User } from "@/payload-types";
import { tenantsArrayField } from "@payloadcms/plugin-multi-tenant/fields";
import type { CollectionConfig, CollectionAfterChangeHook } from "payload";

const defaultTenantField = tenantsArrayField({
  tenantsArrayFieldName: "tenants",
  tenantsCollectionSlug: "tenants",
  tenantsArrayTenantFieldName: "tenant",
  arrayFieldAccess: {
    read: () => true,
    create: ({ req }) => isSuperAdmin(req.user),
    update: ({ req }) => isSuperAdmin(req.user),
  },
  tenantFieldAccess: {
    read: () => true,
    create: ({ req }) => isSuperAdmin(req.user),
    update: ({ req }) => isSuperAdmin(req.user),
  },
});

const afterChangeHook: CollectionAfterChangeHook<User> = async ({
  doc,
  req,
  operation,
}) => {
  // Tự động tạo ChatUser khi tạo User mới
  if (operation === "create") {
    try {
      await req.payload.create({
        collection: "chat-users",
        data: {
          user: doc.id,
          email: doc.email,
          name: doc.username || doc.email,
          image: null, // Sẽ được cập nhật sau khi user upload avatar
        },
      });
    } catch (error) {
      console.error("Error creating ChatUser:", error);
    }
  }
};

export const Users: CollectionConfig = {
  slug: "users",
  access: {
    read: () => true,
    create: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
    update: ({ req, id }) => {
      if (isSuperAdmin(req.user)) return true;
      return req.user?.id === id; // Allow users to update their own profile
    },
  },
  admin: {
    useAsTitle: "email",
    hidden: ({ user }) => !isSuperAdmin(user),
  },
  auth: {
    tokenExpiration: 1000000, // for testing
    cookies: {
      ...(IS_PRODUCTION && {
        sameSite: "None",
        domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
        secure: true,
      }),
    },
  },
  fields: [
    {
      name: "username",
      required: true,
      unique: true,
      type: "text",
    },
    {
      name: "roles",
      type: "select",
      defaultValue: ["user"],
      hasMany: true,
      options: ["super-admin", "user"],
      admin: {
        position: "sidebar",
      },
      access: {
        update: ({ req }) => isSuperAdmin(req.user),
      },
    },
    {
      ...defaultTenantField,
      admin: {
        ...(defaultTenantField?.admin || {}),
        position: "sidebar",
      },
    },
  ],
  hooks: {
    afterChange: [afterChangeHook],
  },
};
