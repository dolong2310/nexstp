import prisma from "@/lib/prisma-chat";
import getCurrentUser from "./getCurrentUser";

export default async function getConversations() {
  try {
    // Lấy thông tin user hiện tại
    const currentUser = await getCurrentUser();

    // Nếu chưa đăng nhập, trả về mảng rỗng
    if (!currentUser?.id) {
      return [];
    }

    // Truy vấn các conversation mà user hiện tại tham gia
    const conversations = await prisma.conversation.findMany({
      orderBy: {
        lastMessageAt: "desc", // Sắp xếp theo thời gian tin nhắn cuối cùng (mới nhất trước)
      },
      where: {
        userIds: {
          has: currentUser.id, // Chỉ lấy conversation có user hiện tại là thành viên
        },
      },
      include: {
        users: true, // Lấy thông tin các thành viên
        messages: {
          include: {
            sender: true, // Lấy thông tin người gửi từng tin nhắn
            seen: true,   // Lấy thông tin những ai đã xem tin nhắn
          },
        },
      },
    });

    return conversations;
  } catch (error) {
    // Nếu có lỗi, trả về mảng rỗng
    return [];
  }
}