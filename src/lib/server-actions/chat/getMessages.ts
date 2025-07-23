import prisma from "@/lib/prisma-chat";

export default async function getMessages(conversationId: string) {
  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
      },
      include: {
        sender: true, // Lấy thông tin người gửi
        seen: true, // Lấy thông tin những người đã xem tin nhắn
      },
      orderBy: {
        createdAt: "asc", // Sắp xếp theo thời gian tạo
      },
    });

    return messages;
  } catch (error) {
    return [];
  }
}
