import { isSuperAdmin } from "@/lib/access";
import type { CollectionConfig } from "payload";

export const Tenants: CollectionConfig = {
  slug: "tenants",
  access: {
    // read: () => true,
    create: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
    // update is default for user can update their own profile
    // update: ({ req, id }) => {
    //   if (isSuperAdmin(req.user)) return true;
    //   return req.user?.id === id; // Allow users to update their own profile
    // },
  },
  admin: {
    useAsTitle: "slug",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "Store Name",
      admin: {
        description: "This is the name of the store (e.g. [Your name] Store)",
      },
    },
    {
      name: "slug",
      type: "text",
      index: true,
      unique: true,
      required: true,
      access: {
        update: ({ req }) => isSuperAdmin(req.user), // Only super admins can update the slug, because it is used as a subdomain, avoid conflicts and spam...
      },
      admin: {
        description:
          "This is the subdomain for the store (e.g. [slug].nexstp.com)",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "description",
      type: "textarea",
      maxLength: 500,
    },
    {
      name: "stripeAccountId",
      type: "text",
      required: true,
      access: {
        update: ({ req }) => isSuperAdmin(req.user),
      },
      admin: {
        description: "Stripe Account ID associated with your store",
      },
    },
    {
      name: "stripeDetailsSubmitted",
      type: "checkbox",
      access: {
        update: ({ req }) => isSuperAdmin(req.user),
      },
      admin: {
        description:
          "You cannot create products until you submit your Stripe details",
      },
    },
  ],
};
