"use client";

import { cn } from "@/lib/utils";
import useConversation from "@/modules/conversations/hooks/use-conversation";
import EmptyState from "@/modules/conversations/ui/components/empty-state";

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
