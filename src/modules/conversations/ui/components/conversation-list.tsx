"use client";

import { Button } from "@/components/ui/button";
import { pusherClient } from "@/lib/pusher";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useConversation from "../../hooks/use-conversation";
import useSession from "../../hooks/use-session";
import { FullConversationType } from "../../types";
import { ConversationBoxSkeleton } from "./conversation-box";
import GroupConversationModal from "./modals/group-conversation-modal";

const ConversationBox = dynamic(() => import("./conversation-box"), {
  ssr: false,
});

const ConversationList = () => {
  const router = useRouter();
  const trpc = useTRPC();
  const { user } = useSession();
  const { conversationId, isOpen } = useConversation();

  const { data: users } = useSuspenseQuery(
    trpc.conversations.getUsers.queryOptions()
  );
  const { data: conversations } = useSuspenseQuery(
    trpc.conversations.getConversations.queryOptions()
  );

  const [items, setItems] = useState<FullConversationType[]>(conversations);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pusherKey = useMemo(() => {
    return user?.email || "";
  }, [user?.email]);

  useEffect(() => {
    if (pusherKey) {
      const channel = pusherClient.subscribe(pusherKey);

      const newMessageHandler = (newConversation: FullConversationType) => {
        setItems((current) => {
          if (current.find((item) => item.id === newConversation.id)) {
            return current;
          }
          return [newConversation, ...current];
        });
      };

      const updateMessageHandler = (
        updatedConversation: FullConversationType
      ) => {
        setItems((current) =>
          current.map((currentConversation) => {
            if (currentConversation.id === updatedConversation.id) {
              return {
                ...currentConversation,
                messages: updatedConversation.messages,
              };
            }
            return currentConversation;
          })
        );
      };

      const deleteMessageHandler = (
        deletedConversation: FullConversationType
      ) => {
        setItems((current) =>
          current.filter((item) => item.id !== deletedConversation.id)
        );

        if (deletedConversation.id === conversationId) {
          router.push("/conversations");
        }
      };

      channel.bind("conversation:new", newMessageHandler);
      channel.bind("conversation:update", updateMessageHandler);
      channel.bind("conversation:delete", deleteMessageHandler);

      return () => {
        pusherClient.unsubscribe(pusherKey);
        channel.unbind("conversation:new", newMessageHandler);
        channel.unbind("conversation:update", updateMessageHandler);
        channel.unbind("conversation:delete", deleteMessageHandler);
      };
    }
  }, [pusherKey, conversationId, router]);

  return (
    <>
      <aside
        className={cn(
          "mt-20 fixed inset-y-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto bg-back border-r",
          isOpen ? "hidden" : "block w-full left-0"
        )}
      >
        <div className="flex flex-col gap-y-3 px-5">
          <div className="flex justify-between py-4">
            <div className="text-2xl font-bold text-foreground">Messages</div>
            <Button
              variant="elevated"
              size="icon"
              onClick={() => setIsModalOpen(true)}
            >
              <UserPlus />
            </Button>
          </div>

          {items.map((item) => (
            <ConversationBox
              key={item.id}
              conversation={item}
              selected={item.id === conversationId}
            />
          ))}
        </div>
      </aside>
      <GroupConversationModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        users={users}
      />
    </>
  );
};

export const ConversationListSkeleton = () => {
  return (
    <aside className="mt-20 fixed inset-y-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto bg-back border-r block w-full left-0">
      <div className="flex flex-col gap-y-3 px-5">
        <div className="flex justify-between py-4">
          <div className="text-2xl font-bold text-foreground">Messages</div>
          <Button variant="elevated" size="icon" disabled>
            <UserPlus />
          </Button>
        </div>

        <div className="animate-pulse flex flex-col gap-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <ConversationBoxSkeleton key={index} />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default ConversationList;
