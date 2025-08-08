import useSession from "@/hooks/use-session";
import { pusherClient } from "@/lib/pusher";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FullConversationType } from "../types";

const useConversationNotifications = () => {
  const trpc = useTRPC();
  const { user } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  const { data: initialCount } = useQuery(
    trpc.conversations.getUnreadCount.queryOptions(undefined, {
      enabled: !!user,
      refetchOnWindowFocus: false,
    })
  );

  useEffect(() => {
    if (initialCount !== undefined) {
      setUnreadCount(initialCount);
    }
  }, [initialCount]);

  useEffect(() => {
    if (!user?.email) return;

    // Subscribe to user's private channel
    pusherClient.subscribe(user.email);

    // Handler for new messages
    const handleNewMessage = (data: FullConversationType) => {
      console.log("handleNewMessage called:", data);
      // Chỉ tăng count nếu có tin nhắn mới
      if (data?.messages && data?.messages.length > 0) {
        const newMessage = data?.messages[0];
        // Kiểm tra tin nhắn không phải từ chính user hiện tại
        if (newMessage?.sender?.email !== user.email) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    };

    // Handler for conversation updates (when user reads messages)
    const handleConversationUpdate = (
      updatedConversation: FullConversationType
    ) => {
      console.log("handleConversationUpdate called:", updatedConversation);
      // Chỉ giảm count khi user đã đọc tin nhắn (seen)
      if (
        updatedConversation.messages &&
        updatedConversation.messages.length > 0
      ) {
        const message = updatedConversation.messages[0];
        const seenUsers = message?.seen || [];
        const currentUserSeen = seenUsers.some(
          (seenUser: any) => seenUser.email === user.email
        );

        // Nếu current user đã seen message thì giảm count
        if (currentUserSeen && message?.sender?.email !== user.email) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    };

    // Bind events
    pusherClient.bind("conversation:new_message", handleNewMessage);
    pusherClient.bind("conversation:update", handleConversationUpdate);

    return () => {
      pusherClient.unsubscribe(user.email);
      pusherClient.unbind("conversation:new_message", handleNewMessage);
      pusherClient.unbind("conversation:update", handleConversationUpdate);
    };
  }, [user?.email]);

  const resetUnreadCount = () => {
    setUnreadCount(0);
  };

  return { unreadCount, setUnreadCount, resetUnreadCount };
};

export default useConversationNotifications;
