import { Conversation, Message, ChatUser } from "@/payload-types";

export type FullMessageType = Message & {
  sender: ChatUser;
  seen: ChatUser[];
};

export type FullConversationType = Conversation & {
  users: ChatUser[];
  messages: FullMessageType[];
};

export type PreviewImageType = {
  url: string;
  file: File;
} | null;
