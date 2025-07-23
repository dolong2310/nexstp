import prisma from "@/lib/prisma-chat";
import { pusherServer } from "@/lib/pusher";
import getCurrentUser from "@/lib/server-actions/chat/getCurrentUser";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Lấy thông tin user hiện tại
    const currentUser = await getCurrentUser();
    const body = await req.json();
    const { userId, isGroup, members, name } = body;

    // Nếu chưa đăng nhập, trả về lỗi
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Nếu là nhóm, kiểm tra dữ liệu hợp lệ (Có đủ thành viên, ít nhất 3 người: 2 thành viên + bạn)
    if (isGroup && (!members || members.length < 2 || !name)) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    // Xử lý tạo nhóm chat
    if (isGroup) {
      const newConversation = await prisma.conversation.create({
        data: {
          name,
          isGroup,
          users: {
            connect: [
              ...members.map((member: { value: string }) => ({
                id: member.value,
              })),
              { id: currentUser.id },
            ],
          },
        },
        include: {
          users: true,
        },
      });

      newConversation.users.forEach((user: any) => {
        // Gửi thông báo realtime tới từng user trong nhóm
        if (user.email) {
          pusherServer.trigger(user.email, "conversation:new", newConversation);
        }
      });

      return NextResponse.json(newConversation);
    }

    // Xử lý tạo hoặc lấy cuộc trò chuyện 1-1
    const existingConversation = await prisma.conversation.findMany({
      where: {
        OR: [
          {
            userIds: {
              equals: [currentUser.id, userId],
            },
          },
          {
            userIds: {
              equals: [userId, currentUser.id],
            },
          },
        ],
      },
    });

    const singleConversation = existingConversation[0];

    // Nếu đã có conversation 1-1, trả về luôn
    if (singleConversation) {
      return NextResponse.json(singleConversation);
    }

    // Nếu chưa có, tạo mới
    const newConversation = await prisma.conversation.create({
      data: {
        users: {
          connect: [{ id: currentUser.id }, { id: userId }],
        },
      },
      include: {
        users: true,
      },
    });

    // Gửi thông báo realtime tới cả hai người dùng
    newConversation.users.forEach((user: any) => {
      if (user.email) {
        pusherServer.trigger(user.email, "conversation:new", newConversation);
      }
    });

    return NextResponse.json(newConversation);
  } catch (error) {
    console.log("CONVERSATIONS_ERROR: ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
