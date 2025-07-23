import prisma from "@/lib/prisma-chat";
import getCurrentUser from "@/lib/server-actions/chat/getCurrentUser";
import { NextResponse } from "next/server";

// Cập nhật tên và ảnh đại diện cho user đang đăng nhập.
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    const { name, image } = await req.json();

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedUser = await prisma.chatUser.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name: name,
        image: image,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.log("PROFILE_ERROR: ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
