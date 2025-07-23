import prisma from "@/lib/prisma-chat";
import getCurrentUser from "./getCurrentUser";

export default async function getConversationById(conversationId: string) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.email) {
      return null;
    }

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        users: true, // Lấy thông tin các thành viên trong cuộc trò chuyện
      },
    });

    return conversation;
  } catch (error) {
    return null;
  }
}
