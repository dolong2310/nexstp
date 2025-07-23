import getConversations from "@/lib/server-actions/chat/getConversations";
import getUsers from "@/lib/server-actions/chat/getUsers";
import ConversationList from "@/modules/chat/ui/components/ConversationList";
import Sidebar from "@/modules/chat/ui/components/sidebar/Sidebar";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const ConversationsLayout = async ({ children }: Props) => {
  const conversations = await getConversations();
  const users = await getUsers();

  return (
    <Sidebar>
      <div className="h-full">
        <ConversationList initialItems={conversations} users={users} />
        {children}
      </div>
    </Sidebar>
  );
};

export default ConversationsLayout;
