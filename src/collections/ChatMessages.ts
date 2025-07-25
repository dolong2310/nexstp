import { isSuperAdmin } from "@/lib/access";
import type { CollectionConfig } from "payload";

export const ChatMessages: CollectionConfig = {
  slug: "chat-messages",
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    useAsTitle: "body",
    hidden: ({ user }) => !isSuperAdmin(user),
  },
  fields: [
    {
      name: "body",
      type: "text",
    },
    {
      name: "image",
      type: "text",
    },
    {
      name: "conversation",
      type: "relationship",
      relationTo: "chat-conversations",
      required: true,
    },
    {
      name: "sender",
      type: "relationship",
      relationTo: "chat-users",
      required: true,
    },
    {
      name: "seen",
      type: "relationship",
      relationTo: "chat-users",
      hasMany: true,
    },
  ],
};
