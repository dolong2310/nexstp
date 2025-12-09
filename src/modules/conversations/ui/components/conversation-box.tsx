"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import useSession from "@/hooks/use-session";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useCallback, useMemo } from "react";
import useOtherUser from "../../hooks/use-other-user";
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
}

const ConversationBox = ({ conversation }: Props) => {
  const t = useTranslations();
  const router = useRouter();
  const { user } = useSession();
  const otherUser = useOtherUser(conversation);

  const handleClick = useCallback(() => {
    router.push(`/conversations/${conversation.id}`);
  }, [router, conversation.id]);

  const lastMessage = useMemo(() => {
    const messages = conversation.messages || [];
    return messages[messages.length - 1];
  }, [conversation.messages]);

  const userEmail = useMemo(() => {
    return user?.email || "";
  }, [user?.email]);

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
      return t("Sent an image");
    }
    if (lastMessage?.body) {
      return lastMessage.body;
    }
    return t("Started a conversation");
  }, [lastMessage]);

  return (
    <Card
      shadowTransition
      className={cn(
        "gap-0 flex-row w-full relative flex items-center space-x-3 p-3 rounded-base border-2 shadow-shadow bg-main cursor-pointer",
        hasSeen && "bg-background text-foreground"
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
          <div className="flex items-center justify-between gap-2 mb-1">
            <p
              className={cn(
                "text-md font-medium text-main-foreground truncate overflow-hidden",
                hasSeen && "text-foreground"
              )}
            >
              {conversation?.name || otherUser?.name || t("User")}
            </p>
            {lastMessage?.createdAt && (
              <time
                className={cn(
                  "shrink-0 text-xs text-main-foreground/80 font-light",
                  hasSeen && "text-foreground/80"
                )}
              >
                {format(new Date(lastMessage.createdAt), "p")}
              </time>
            )}
          </div>

          <p
            className={cn(
              "truncate text-sm",
              hasSeen ? "text-foreground" : "text-main-foreground font-bold"
            )}
          >
            {lastMessageText}
          </p>
        </div>
      </div>
    </Card>
  );
};

export const ConversationBoxSkeleton = () => {
  return (
    <div className="w-full relative flex items-center space-x-3 p-3 rounded-lg cursor-pointer border bg-background shadow-shadow">
      <CustomAvatarSkeleton />
      <div className="min-w-0 flex-1">
        <div className="focus:outline-none">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-5 bg-secondary-background w-32" />
            <Skeleton className="h-3 bg-secondary-background w-16" />
          </div>
          <Skeleton className="h-5 bg-secondary-background w-full" />
        </div>
      </div>
    </div>
  );
};

export default ConversationBox;
