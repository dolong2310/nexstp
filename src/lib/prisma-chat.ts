import { PrismaClient } from "@prisma/client";

declare global {
  var prismaChat: PrismaClient | undefined;
}

const client = globalThis.prismaChat || new PrismaClient({
  datasources: {
    db: {
      url: process.env.CHAT_DATABASE_URI,
    },
  },
});

if (process.env.NODE_ENV !== "production") globalThis.prismaChat = client;

export default client;