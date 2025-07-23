import { ChatUser, Conversation, Message } from "@prisma/client";

export type FullMessageType = Message & {
  sender: ChatUser;
  seen: ChatUser[];
};

export type FullConversationType = Conversation & {
  users: ChatUser[];
  messages: FullMessageType[];
};
