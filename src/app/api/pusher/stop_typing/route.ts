import { pusherServer } from "@/lib/pusher";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { conversationId, user } = await req.json();
  await pusherServer.trigger(conversationId, "stop_typing", { user });
  return NextResponse.json({ success: true });
}
