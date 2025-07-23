"use client";

import { pusherClient } from "@/lib/pusher";
import axios from "axios";
import { find } from "lodash";
import { useEffect, useRef, useState } from "react";
import MessageBox from "./MessageBox";
import TypingBox from "./TypingBox";
import { FullMessageType } from "@/modules/chat/types";
import useConversation from "@/modules/chat/hooks/use-conversation";

export type UserProps = {
  email: string;
  name: string;
  image: string;
};

type Props = {
  initialMessages: FullMessageType[];
};

const ConversationContent = ({ initialMessages }: Props) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  const { conversationId } = useConversation();

  const [typingUsers, setTypingUsers] = useState<UserProps[]>([]);
  const [messages, setMessages] = useState<FullMessageType[]>(initialMessages);

  useEffect(() => {
    axios.post(`/api/conversations/${conversationId}/seen`);
  }, [conversationId]);

  useEffect(() => {
    pusherClient.subscribe(conversationId);
    bottomRef.current?.scrollIntoView();

    const messageHandler = (message: FullMessageType) => {
      axios.post(`/api/conversations/${conversationId}/seen`);

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

export default ConversationContent;
