"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import useOtherUser from "../../hooks/use-other-user";
import useSession from "../../hooks/use-session";
import { FullConversationType } from "../../types";
import { CustomAvatarSkeleton } from "./custom-avatar";
import { CustomAvatarGroupSkeleton } from "./custom-avatar-group";

const CustomAvatar = dynamic(() => import("./custom-avatar"), {
  ssr: false,
  loading: () => <CustomAvatarSkeleton />,
});
const CustomAvatarGroup = dynamic(() => import("./custom-avatar-group"), {
  ssr: false,
  loading: () => <CustomAvatarGroupSkeleton />,
});

interface Props {
  conversation: FullConversationType;
  selected?: boolean;
};

const ConversationBox = ({ conversation, selected }: Props) => {
  const router = useRouter();
  const { session } = useSession();
  const otherUser = useOtherUser(conversation);

  const handleClick = useCallback(() => {
    router.push(`/conversations/${conversation.id}`);
  }, [router, conversation.id]);

  const lastMessage = useMemo(() => {
    const messages = conversation.messages || [];
    return messages[messages.length - 1];
  }, [conversation.messages]);

  const userEmail = useMemo(() => {
    return session?.user?.email || "";
  }, [session?.user?.email]);

  const hasSeen = useMemo(() => {
    if (!lastMessage) return false;
    if (!userEmail) return false;
    const seenArray = lastMessage.seen || [];
    return (
      seenArray.filter((user: any) => user.email === userEmail).length !== 0
    );
  }, [lastMessage, userEmail]);

  const lastMessageText = useMemo(() => {
    if (lastMessage?.image) {
      return "Sent an image";
    }
    if (lastMessage?.body) {
      return lastMessage.body;
    }
    return "Started a conversation";
  }, [lastMessage]);

  return (
    <div
      className={cn(
        "w-full relative flex items-center space-x-3 p-3 rounded-lg cursor-pointer border transition",
        "bg-background hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-x-[4px] hover:-translate-y-[4px]"
      )}
      onClick={handleClick}
    >
      {conversation.isGroup ? (
        <CustomAvatarGroup users={conversation.users} />
      ) : (
        <CustomAvatar user={otherUser} />
      )}
      <div className="min-w-0 flex-1">
        <div className="focus:outline-none">
          <div className="flex items-center justify-between mb-1">
            <p className="text-md font-medium text-foreground">
              {conversation?.name || otherUser?.name || "User"}
            </p>
            {lastMessage?.createdAt && (
              <p className="text-xs text-muted-foreground/80 font-light">
                {format(new Date(lastMessage.createdAt), "p")}
              </p>
            )}
          </div>

          <p
            className={cn(
              "truncate text-sm",
              hasSeen ? "text-muted-foreground" : "text-foreground font-bold"
            )}
          >
            {lastMessageText}
          </p>
        </div>
      </div>
    </div>
  );
};

export const ConversationBoxSkeleton = () => {
  return (
    <div className="w-full relative flex items-center space-x-3 p-3 rounded-lg cursor-pointer border bg-background">
      <CustomAvatarSkeleton />
      <div className="min-w-0 flex-1">
        <div className="focus:outline-none">
          <div className="flex items-center justify-between mb-2">
            <div className="h-5 bg-muted rounded-md w-32" />
            <div className="h-3 bg-muted rounded-md w-16" />
          </div>
          <div className="h-5 bg-muted rounded-md w-full" />
        </div>
      </div>
    </div>
  );
};

export default ConversationBox;
