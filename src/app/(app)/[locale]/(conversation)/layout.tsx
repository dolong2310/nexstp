import ConversationStatusProvider from "@/modules/conversations/ui/components/providers/status-provider";
import Navbar from "@/modules/home/ui/components/navbar";
import React from "react";

interface Props {
  children: React.ReactNode;
}

const ConversationLayout = ({ children }: Props) => {
  return (
    <ConversationStatusProvider>
      <Navbar fixed />
      {children}
    </ConversationStatusProvider>
  );
};

export default ConversationLayout;
