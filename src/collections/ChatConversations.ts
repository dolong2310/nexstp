import { isSuperAdmin } from "@/lib/access";
import type { CollectionConfig } from "payload";

export const ChatConversations: CollectionConfig = {
  slug: "chat-conversations",
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
      name: "name",
      type: "text",
    },
    {
      name: "isGroup",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "lastMessageAt",
      type: "date",
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: "users",
      type: "relationship",
      relationTo: "chat-users",
      hasMany: true,
      required: true,
    },
    {
      name: "messages",
      type: "relationship",
      relationTo: "chat-messages",
      hasMany: true,
    },
  ],
};
