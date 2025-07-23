import prisma from "@/lib/prisma-chat";
import getSession from "./getSession";

export default async function getUsers() {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return [];
    }

    const users = await prisma.chatUser.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        NOT: {
          email: session.user.email,
        },
      },
    });

    if (!users) {
      return [];
    }

    return users;
  } catch (error) {
    return [];
  }
}
