import ChatStatusProvider from "@/modules/chat/ui/components/providers/status-provider";
import React from "react";

interface Props {
  children: React.ReactNode;
};

const ChatLayout = ({ children }: Props) => {
  return <ChatStatusProvider>{children}</ChatStatusProvider>;
};

export default ChatLayout;
