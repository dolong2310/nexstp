"use client";

import InfiniteScroll from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { useScrollControl } from "@/hooks/use-scroll-control";
import { pusherClient } from "@/lib/pusher";
import useConversation from "@/modules/conversations/hooks/use-conversation";
import { FullMessageType } from "@/modules/conversations/types";
import { useTRPC } from "@/trpc/client";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
} from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import find from "lodash-es/find";
import { LoaderIcon } from "lucide-react";
import { PaginatedDocs } from "payload";
import { useCallback, useEffect, useRef, useState } from "react";
import MessageBox, { MessageBoxSkeleton } from "./message-box";
import TypingBox from "./typing-box";

export type UserProps = {
  email: string;
  name: string;
  image: string;
};

const formatData = (
  data: InfiniteData<PaginatedDocs<FullMessageType>, number | null>
) => {
  return data.pages.flatMap((page) => page.docs).reverse();
};

const ConversationContent = ({
  initialData,
}: {
  initialData: InfiniteData<PaginatedDocs<FullMessageType>, number | null>;
}) => {
  const scrollAnchorRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    containerRef,
    isUserScrolling,
    isInitialized,
    markAsInitialized,
    setIsUserScrolling,
    setScrollAnchor,
    maintainScrollPosition,
  } = useScrollControl();

  const trpc = useTRPC();
  const { conversationId } = useConversation();
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteQuery(
      trpc.conversations.getMessages.infiniteQueryOptions(
        {
          conversationId,
          limit: DEFAULT_LIMIT,
        },
        {
          getNextPageParam: (lastPage) => {
            return lastPage.docs.length > 0 ? lastPage.nextPage : undefined;
          },
          initialData,
          enabled: isInitialized,
        }
      )
    );

  const pages = data.pages.map((page) => page.docs);
  const lastestPage = pages[pages.length - 1];

  const [typingUsers, setTypingUsers] = useState<UserProps[]>([]);
  const [messages, setMessages] = useState<FullMessageType[]>(() =>
    formatData(initialData)
  );

  const markMessageSeen = useMutation(
    trpc.conversations.markMessageSeen.mutationOptions({})
  );

  useEffect(() => {
    markMessageSeen.mutate({
      conversationId,
    });
  }, [conversationId]);

  useEffect(() => {
    pusherClient.subscribe(conversationId);
    bottomRef.current?.scrollIntoView();
    markAsInitialized();

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

  useEffect(() => {
    if (!lastestPage || lastestPage.length === 0) return;
    setIsUserScrolling(false); // Đánh dấu scroll không phải do người dùng
    // Lưu ID tin nhắn đầu tiên của danh sách hiện tại làm anchor
    if (messages.length > 0 && !scrollAnchorRef.current) {
      setScrollAnchor(messages[0]?.id || null);
    }

    setMessages((current) => {
      // Nếu message đầu tiên của lastestPage đã có trong current thì không nối nữa
      if (current.length > 0 && lastestPage[0]?.id === current[0]?.id) {
        return current;
      }
      // Lọc bỏ những message đã có để tránh trùng
      const newMessages = lastestPage
        .filter((msg) => !current.some((m) => m.id === msg.id))
        .reverse();
      return [...newMessages, ...current];
    });

    // Khôi phục vị trí scroll sau khi cập nhật DOM
    setTimeout(
      !isInitialized
        ? () => bottomRef.current?.scrollIntoView()
        : maintainScrollPosition,
      0
    );
  }, [
    lastestPage,
    maintainScrollPosition,
    setIsUserScrolling,
    setScrollAnchor,
  ]);

  // Chỉ fetch khi người dùng scroll lên đầu
  const handleFetchNextPage = useCallback(() => {
    if (isUserScrolling && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isUserScrolling, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 114,
    overscan: 10,
  });

  return (
    <div className="flex-1 overflow-y-auto" ref={containerRef}>
      <div className="flex justify-center pb-4">
        <InfiniteScroll
          reverse
          hasMore={hasNextPage}
          isLoading={isFetchingNextPage}
          next={handleFetchNextPage}
          threshold={1}
        >
          {hasNextPage && <LoaderIcon className="my-4 h-8 w-8 animate-spin" />}
        </InfiniteScroll>
      </div>

      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow, index) => {
          const message = messages[virtualRow.index] as FullMessageType;
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index} //needed for dynamic row height measurement
              ref={(node) => rowVirtualizer.measureElement(node)} //measure dynamic row height
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                // height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                // transform: `translateY(${
                //   virtualRow.start - rowVirtualizer.options.scrollMargin
                // }px)`,
              }}
            >
              <MessageBox
                message={message}
                isLast={index === messages.length - 1}
                id={message.id}
              />
            </div>
          );
        })}
      </div>

      <TypingBox typingUsers={typingUsers} />
      <div ref={bottomRef} className="pt-10 md:pt-20" />
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
