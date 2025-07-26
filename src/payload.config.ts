// storage-adapter-import-placeholder
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { payloadCloudPlugin } from "@payloadcms/payload-cloud";
import { multiTenantPlugin } from "@payloadcms/plugin-multi-tenant";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
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
    components: {
      beforeNavLinks: ["@/components/stripe-verify#StripeVerify"],
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
  ],
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
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    multiTenantPlugin<Config>({
      collections: {
        products: {},
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
