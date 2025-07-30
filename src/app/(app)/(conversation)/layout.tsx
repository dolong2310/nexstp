import ConversationNavbar from "@/modules/conversations/ui/components/conversation-navbar";
import ConversationStatusProvider from "@/modules/conversations/ui/components/providers/status-provider";
import React from "react";

interface Props {
  children: React.ReactNode;
}

const ConversationLayout = ({ children }: Props) => {
  return (
    <ConversationStatusProvider>
      <ConversationNavbar />
      {children}
    </ConversationStatusProvider>
  );
};

export default ConversationLayout;
