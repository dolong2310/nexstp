import prisma from "@/lib/prisma-chat";
import { pusherServer } from "@/lib/pusher";
import getCurrentUser from "@/lib/server-actions/chat/getCurrentUser";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Lấy user hiện tại
    const currentUser = await getCurrentUser();

    // 2. Lấy dữ liệu từ body request
    const { message, image, conversationId } = await req.json();

    // 3. Kiểm tra đăng nhập
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 4. Tạo message mới trong DB
    const newMessage = await prisma.message.create({
      data: {
        body: message,
        image: image,
        conversation: { connect: { id: conversationId } },
        sender: { connect: { id: currentUser.id } },
        seen: { connect: { id: currentUser.id } },
      },
      include: { sender: true, seen: true },
    });

    // 5. Cập nhật conversation: cập nhật thời gian và gắn message mới
    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        messages: { connect: { id: newMessage.id } },
      },
      include: {
        users: true,
        messages: { include: { seen: true } },
      },
    });

    // 6. Gửi realtime event "messages:new" tới kênh conversationId
    await pusherServer.trigger(conversationId, "messages:new", newMessage);

    // 7. Lấy message cuối cùng (vừa gửi)
    const lastMessage =
      updatedConversation.messages[updatedConversation.messages.length - 1];

    // 8. Gửi realtime event "conversation:update" tới từng user trong conversation
    updatedConversation.users.forEach((user: any) => {
      pusherServer.trigger(user.email!, "conversation:update", {
        id: conversationId,
        messages: [lastMessage],
      });
    });

    // 9. Trả về message vừa tạo
    return NextResponse.json(newMessage);
  } catch (error) {
    console.log("MESSAGES_ERROR: ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
