import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React, { Suspense } from "react";
import ChatDesktopSidebar, {
  ChatDesktopSidebarSkeleton,
} from "./chat-desktop-sidebar";
import ChatMobileFooter from "./chat-mobile-footer";

type Props = {
  children: React.ReactNode;
};

const ChatSidebar = async ({ children }: Props) => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.chat.getCurrentUser.queryOptions());

  return (
    <div className="h-full">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<ChatDesktopSidebarSkeleton />}>
          <ChatDesktopSidebar />
        </Suspense>
      </HydrationBoundary>

      <ChatMobileFooter />
      <main className="lg:pl-20 h-full">{children}</main>
    </div>
  );
};

export default ChatSidebar;
