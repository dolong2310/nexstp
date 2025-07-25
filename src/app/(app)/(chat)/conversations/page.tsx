"use client";

import { cn } from "@/lib/utils";
import useConversation from "@/modules/chat/hooks/use-conversation";
import EmptyState from "@/modules/chat/ui/components/EmptyState";

const ConversationsPage = () => {
  const { isOpen } = useConversation();

  return (
    <div
      className={cn("lg:pl-80 h-screen lg:block", isOpen ? "block" : "hidden")}
    >
      <EmptyState />
    </div>
  );
};

export default ConversationsPage;
