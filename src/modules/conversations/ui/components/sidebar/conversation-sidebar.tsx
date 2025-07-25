import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React, { Suspense } from "react";
import ConversationDesktopSidebar, {
  ConversationDesktopSidebarSkeleton,
} from "./conversation-desktop-sidebar";
import ConversationMobileFooter from "./conversation-mobile-footer";

interface Props {
  children: React.ReactNode;
}

const ConversationSidebar = async ({ children }: Props) => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.conversations.getCurrentUser.queryOptions());

  return (
    <div className="h-full">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<ConversationDesktopSidebarSkeleton />}>
          <ConversationDesktopSidebar />
        </Suspense>
      </HydrationBoundary>

      <ConversationMobileFooter />
      <main className="lg:pl-20 h-full">{children}</main>
    </div>
  );
};

export default ConversationSidebar;
