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
    tokenExpiration: 7 * 24 * 60 * 60 * 1000, // 7 days
    verify: {
      generateEmailHTML: ({ token, user }) => {
        const verifyURL = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
        console.log("Verify URL: ", verifyURL);

        return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email Address</h2>
          <p>Hello ${user.username || user.email},</p>
          <p>Thank you for signing up! Please click the link below to verify your email address:</p>
          <a href="${verifyURL}" style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
          <p>If you didn't create this account, please ignore this email.</p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `;
      },
      generateEmailSubject: () => "Please verify your email address",
    },
    forgotPassword: {
      expiration: 60 * 60 * 1000, // 1 hour
      generateEmailHTML: (params) => {
        const token = params?.token;
        const user = params?.user;
        const resetURL = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

        return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>Hello ${user.username || user.email},</p>
          <p>You requested to reset your password. Click the link below to reset it:</p>
          <a href="${resetURL}" style="background-color: #5294ff; color: black; padding: 12px 24px; text-decoration: none; border: 2px solid black; border-radius: 4px; display: inline-block;">Reset Password</a>
          <p>If you didn't request this, please ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
        </div>
      `;
      },
      generateEmailSubject: () => "Reset your password",
    },
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
