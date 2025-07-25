"use client";

import { pusherClient } from "@/lib/pusher";
import useConversation from "@/modules/chat/hooks/use-conversation";
import { FullMessageType } from "@/modules/chat/types";
import { useTRPC } from "@/trpc/client";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { find } from "lodash";
import { useEffect, useRef, useState } from "react";
import MessageBox, { MessageBoxSkeleton } from "./MessageBox";
import TypingBox from "./TypingBox";

export type UserProps = {
  email: string;
  name: string;
  image: string;
};

const ConversationContent = () => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const trpc = useTRPC();
  const { conversationId } = useConversation();
  const { data: initialMessages } = useSuspenseQuery(
    trpc.chat.getMessages.queryOptions({ conversationId })
  );

  const [typingUsers, setTypingUsers] = useState<UserProps[]>([]);
  const [messages, setMessages] = useState<FullMessageType[]>(initialMessages);

  const markMessageSeen = useMutation(
    trpc.chat.markMessageSeen.mutationOptions({})
  );

  useEffect(() => {
    markMessageSeen.mutate({
      conversationId,
    });
  }, [conversationId]);

  useEffect(() => {
    pusherClient.subscribe(conversationId);
    bottomRef.current?.scrollIntoView();

    const messageHandler = (message: FullMessageType) => {
      markMessageSeen.mutate({
        conversationId,
      });

      setMessages((current) => {
        if (find(current, { id: message.id })) {
          return current;
        }
        return [...current, message];
      });
      bottomRef.current?.scrollIntoView();
    };

    const updateMessageHandler = (newMessage: FullMessageType) => {
      setMessages((current) =>
        current.map((currentMessage) =>
          currentMessage.id === newMessage.id ? newMessage : currentMessage
        )
      );
    };

    const typingHandler = ({ user }: { user: UserProps }) => {
      setTypingUsers((current) =>
        current.some((u) => u.email === user.email)
          ? current
          : [...current, user]
      );
    };

    const stopTypingHandler = ({ user }: { user: UserProps }) => {
      setTypingUsers((current) =>
        current.filter((u) => u.email !== user.email)
      );
    };

    pusherClient.bind("messages:new", messageHandler);
    pusherClient.bind("message:update", updateMessageHandler);
    pusherClient.bind("typing", typingHandler);
    pusherClient.bind("stop_typing", stopTypingHandler);

    return () => {
      pusherClient.unsubscribe(conversationId);
      pusherClient.unbind("messages:new", messageHandler);
      pusherClient.unbind("message:update", updateMessageHandler);
      pusherClient.unbind("typing", typingHandler);
      pusherClient.unbind("stop_typing", stopTypingHandler);
    };
  }, [conversationId]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, index) => (
        <MessageBox
          key={message.id}
          message={message}
          isLast={index === messages.length - 1}
        />
      ))}
      <TypingBox typingUsers={typingUsers} />
      <div ref={bottomRef} className="pt-24" />
    </div>
  );
};

export const ConversationContentSkeleton = () => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="animate-pulse flex flex-col gap-4 p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <MessageBoxSkeleton key={index} isReverse={index % 2 === 0} />
        ))}
      </div>
    </div>
  );
};

export default ConversationContent;
