// storage-adapter-import-placeholder
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { payloadCloudPlugin } from "@payloadcms/payload-cloud";
import { multiTenantPlugin } from "@payloadcms/plugin-multi-tenant";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import nodemailer from "nodemailer";
import path from "path";
import { buildConfig } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { Config } from "./payload-types";

import { isSuperAdmin } from "./lib/access";

import { Banners } from "@/collections/Banners";
import { Categories } from "./collections/Categories";
import { ChatUsers } from "./collections/ChatUsers";
import { Conversations } from "./collections/Conversations";
import { Launchpads } from "./collections/Launchpads";
import { Media } from "./collections/Media";
import { Messages } from "./collections/Messages";
import { Orders } from "./collections/Orders";
import { Products } from "./collections/Products";
import { Reviews } from "./collections/Reviews";
import { Tags } from "./collections/Tags";
import { Tenants } from "./collections/Tenants";
import { Users } from "./collections/Users";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      title: "Admin",
      titleSuffix: "| Nexstp",
      description: "Nexstp Admin Dashboard",
      icons: [
        {
          rel: "icon",
          type: "image/ico",
          url: "/favicon.ico",
        },
      ],
      robots: "noindex, nofollow",
    },
    avatar: {
      Component: "@/components/admin/ui/profile-info",
    },
    components: {
      beforeNavLinks: ["@/components/admin/ui/stripe-verify#StripeVerify"],
      graphics: {
        Logo: "@/components/admin/ui/logo",
        Icon: "@/components/admin/ui/logo",
      },
      logout: {
        Button: '@/components/admin/ui/logout-admin-button',
      },
    },
  },
  collections: [
    Users,
    Media,
    Categories,
    Products,
    Tags,
    Tenants,
    Orders,
    Reviews,
    ChatUsers,
    Conversations,
    Messages,
    Banners,
    Launchpads,
  ],
  email: nodemailerAdapter({
    defaultFromAddress: process.env.SMTP_FROM!,
    defaultFromName: process.env.SMTP_FROM_NAME!,
    transport: nodemailer.createTransport({
      service: "gmail",
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT!),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }),
  }),
  // cookiePrefix: "nexstp",
  editor: lexicalEditor(),
  // editor: lexicalEditor({
  //   features: ({ defaultFeatures }) => [
  //     ...defaultFeatures,
  //     UploadFeature({
  //       collections: {
  //         media: { fields: [{ name: "alt", type: "text" }] },
  //       },
  //     }),
  //   ],
  // }),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || "",
    // OPTIMIZATION: Connection pooling for better performance
    connectOptions: {
      maxPoolSize: 10, // Increase pool size for concurrent requests
      minPoolSize: 2, // Keep minimum connections alive
      maxIdleTimeMS: 10000, // Keep connections alive for 10s
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Socket timeout
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    multiTenantPlugin<Config>({
      collections: {
        products: {},
        // launchpads: {},
        // media: {},
      },
      tenantsArrayField: {
        includeDefaultField: false,
      },
      userHasAccessToAllTenants: (user) => isSuperAdmin(user),
    }),
    // storage-adapter-placeholder
    vercelBlobStorage({
      enabled: true,
      // clientUploads: true, // open true if upload large files because of Vercel limits (4.5MB)
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
});
