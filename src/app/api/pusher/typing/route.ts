import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  const { conversationId, user } = await req.json();
  await pusherServer.trigger(conversationId, "typing", {
    conversationId,
    user,
  });
  return NextResponse.json({ success: true });
}
