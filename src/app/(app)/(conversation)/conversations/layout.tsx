import ConversationList, {
  ConversationListSkeleton,
} from "@/modules/conversations/ui/components/conversation-list";
import ConversationSidebar from "@/modules/conversations/ui/components/sidebar/conversation-sidebar";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";

interface Props {
  children: React.ReactNode;
}

export const dynamic = "force-dynamic";

const ConversationsLayout = async ({ children }: Props) => {
  const queryClient = getQueryClient();
  const session = await queryClient.fetchQuery(
    trpc.auth.session.queryOptions()
  );

  if (!session?.user) {
    redirect("/sign-in");
  }

  void queryClient.prefetchQuery(trpc.conversations.getUsers.queryOptions());
  void queryClient.prefetchQuery(
    trpc.conversations.getConversations.queryOptions()
  );

  return (
    <ConversationSidebar>
      <div className="h-full">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<ConversationListSkeleton />}>
            <ConversationList />
          </Suspense>
        </HydrationBoundary>
        {children}
      </div>
    </ConversationSidebar>
  );
};

export default ConversationsLayout;
