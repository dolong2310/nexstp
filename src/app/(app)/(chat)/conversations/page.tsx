"use client";

import useConversation from "@/modules/chat/hooks/use-conversation";
import EmptyState from "@/modules/chat/ui/components/EmptyState";
import { twMerge } from "tailwind-merge";

const ConversationsPage = () => {
  const { isOpen } = useConversation();

  return (
    <div
      className={twMerge(
        "lg:pl-80 h-screen lg:block",
        isOpen ? "block" : "hidden"
      )}
    >
      <EmptyState />
    </div>
  );
};

export default ConversationsPage;
