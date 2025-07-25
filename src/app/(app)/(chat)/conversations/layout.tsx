import ConversationList, {
  ConversationListSkeleton,
} from "@/modules/chat/ui/components/ConversationList";
import Sidebar from "@/modules/chat/ui/components/sidebar/Sidebar";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React, { Suspense } from "react";

type Props = {
  children: React.ReactNode;
};

export const dynamic = "force-dynamic";

const ConversationsLayout = async ({ children }: Props) => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.chat.getUsers.queryOptions());
  void queryClient.prefetchQuery(trpc.chat.getConversations.queryOptions());

  return (
    <Sidebar>
      <div className="h-full">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<ConversationListSkeleton />}>
            <ConversationList />
          </Suspense>
        </HydrationBoundary>
        {children}
      </div>
    </Sidebar>
  );
};

export default ConversationsLayout;
