import prisma from "@/lib/prisma-chat";
import { pusherServer } from "@/lib/pusher";
import getCurrentUser from "@/lib/server-actions/chat/getCurrentUser";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    // Lấy user hiện tại
    const currentUser = await getCurrentUser();
    const { conversationId } = await params;

    // Nếu chưa đăng nhập, trả về lỗi
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Kiểm tra conversation có tồn tại không
    const existingConversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        users: true,
      },
    });

    // Nếu không tìm thấy, trả về lỗi
    if (!existingConversation) {
      return new NextResponse("Conversation not found", { status: 404 });
    }

    // Xóa conversation nếu user hiện tại là thành viên
    const deletedConversation = await prisma.conversation.deleteMany({
      where: {
        id: conversationId,
        userIds: {
          hasSome: [currentUser.id],
        },
      },
    });

    existingConversation.users.forEach((user: any) => {
      // Gửi thông báo realtime tới từng user trong conversation
      if (user.email) {
        pusherServer.trigger(user.email, "conversation:delete", existingConversation);
      }
    });

    // Trả về kết quả xóa
    return NextResponse.json(deletedConversation);
  } catch (error) {
    console.log("CONVERSATION_DELETE_ERROR: ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
