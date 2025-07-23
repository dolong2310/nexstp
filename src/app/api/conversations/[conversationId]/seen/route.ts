import prisma from "@/lib/prisma-chat";
import { pusherServer } from "@/lib/pusher";
import getCurrentUser from "@/lib/server-actions/chat/getCurrentUser";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    // 1. Lấy user hiện tại
    const currentUser = await getCurrentUser();
    const { conversationId } = await params;

    // 2. Kiểm tra đăng nhập
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 3. Lấy conversation theo id, kèm users và messages (có seen)
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        users: true,
        messages: {
          include: { seen: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // 4. Nếu không tìm thấy conversation, trả về lỗi
    if (!conversation) {
      return new NextResponse("Conversation not found", { status: 404 });
    }

    // 5. Lấy tin nhắn cuối cùng
    const lastMessage = conversation.messages[conversation.messages.length - 1];

    // 6. Nếu chưa có tin nhắn nào, trả về conversation
    if (!lastMessage) {
      return NextResponse.json(conversation);
    }

    // 7. Đánh dấu đã xem: thêm user hiện tại vào seen của message cuối
    const updatedMessage = await prisma.message.update({
      where: { id: lastMessage.id },
      data: {
        seen: {
          connect: { id: currentUser.id },
        },
      },
      include: {
        seen: true,
        sender: true,
      },
    });

    // 8. Gửi realtime event "conversation:update" tới user hiện tại
    await pusherServer.trigger(currentUser.email, "conversation:update", {
      id: conversationId,
      messages: [updatedMessage],
    });

    // 9. Nếu user chưa từng seen trước đó, trả về conversation (không gửi event cho cả nhóm)
    // if (lastMessage.seenIds.indexOf(currentUser.id) === -1) {
    //   return NextResponse.json(conversation);
    // }

    // 10. Gửi realtime event "message:update" tới cả conversation
    await pusherServer.trigger(
      conversationId,
      "message:update",
      updatedMessage
    );

    // 11. Trả về message đã cập nhật
    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.log("MESSAGES_SEEN_ERROR: ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
