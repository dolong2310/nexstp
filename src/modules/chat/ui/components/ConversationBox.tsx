"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import useOtherUser from "../../hooks/use-other-user";
import { FullConversationType } from "../../types";
import CustomAvatar from "./CustomAvatar";
import CustomAvatarGroup from "./CustomAvatarGroup";

type Props = {
  conversation: FullConversationType;
  selected?: boolean;
};

const ConversationBox = ({ conversation, selected }: Props) => {
  const router = useRouter();
  const otherUser = useOtherUser(conversation);
  // const session = useSession();

  const handleClick = useCallback(() => {
    router.push(`/conversations/${conversation.id}`);
  }, [router, conversation.id]);

  const lastMessage = useMemo(() => {
    const messages = conversation.messages || [];
    return messages[messages.length - 1];
  }, [conversation.messages]);

  const userEmail = useMemo(() => {
    return ""; // session.data?.user?.email;
  }, []);

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
      className={twMerge(
        "w-full relative flex items-center space-x-3 p-3 rounded-lg hover:bg-primary-foreground transition cursor-pointer"
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
              {conversation.name || otherUser.name || "User"}
            </p>
            {lastMessage?.createdAt && (
              <p className="text-xs text-gray-400 font-light">
                {format(new Date(lastMessage.createdAt), "p")}
              </p>
            )}
          </div>

          <p
            className={twMerge(
              "truncate text-sm",
              hasSeen ? "text-gray-500" : "text-foreground font-bold"
            )}
          >
            {lastMessageText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConversationBox;
