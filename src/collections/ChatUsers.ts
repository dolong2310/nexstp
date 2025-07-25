import { isSuperAdmin } from "@/lib/access";
import type { CollectionConfig } from "payload";

export const ChatUsers: CollectionConfig = {
  slug: "chat-users",
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    useAsTitle: "name",
    hidden: ({ user }) => !isSuperAdmin(user),
  },
  fields: [
    {
      name: "user", // Liên kết với Users collection
      type: "relationship",
      relationTo: "users",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "name",
      type: "text",
    },
    {
      name: "email", // Thêm trường email
      type: "email",
      required: true,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media", // Liên kết với Media collection
      admin: {
        description: "Upload avatar cho user",
      },
    },
    {
      name: "conversations",
      type: "relationship",
      relationTo: "chat-conversations",
      hasMany: true,
    },
    {
      name: "seenMessages",
      type: "relationship",
      relationTo: "chat-messages",
      hasMany: true,
    },
  ],
};
