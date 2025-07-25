import StatusProvider from "@/modules/chat/ui/components/providers/StatusProvider";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const ChatLayout = ({ children }: Props) => {
  return <StatusProvider>{children}</StatusProvider>;
};

export default ChatLayout;
