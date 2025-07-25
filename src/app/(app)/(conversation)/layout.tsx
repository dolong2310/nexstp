import ConversationStatusProvider from "@/modules/conversations/ui/components/providers/status-provider";
import React from "react";

interface Props {
  children: React.ReactNode;
};

const ConversationLayout = ({ children }: Props) => {
  return <ConversationStatusProvider>{children}</ConversationStatusProvider>;
};

export default ConversationLayout;
