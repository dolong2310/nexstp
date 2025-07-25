import { ChatConversation, ChatMessage, ChatUser } from "@/payload-types";

export type FullMessageType = ChatMessage & {
  sender: ChatUser;
  seen: ChatUser[];
};

export type FullConversationType = ChatConversation & {
  users: ChatUser[];
  messages: FullMessageType[];
};

export type PreviewImageType = {
  url: string;
  file: File;
} | null;
