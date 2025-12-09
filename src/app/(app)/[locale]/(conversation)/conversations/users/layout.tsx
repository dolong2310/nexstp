import ConversationSidebar from "@/modules/conversations/ui/components/sidebar/conversation-sidebar";
import UserList, {
  UserListSkeleton,
} from "@/modules/conversations/ui/components/user-list";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React, { Suspense } from "react";

interface Props { children: React.ReactNode };

export const dynamic = "force-dynamic";

const UsersLayout = async ({ children }: Props) => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.conversations.getUsers.queryOptions());

  return (
    <ConversationSidebar>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<UserListSkeleton />}>
          <UserList />
        </Suspense>
      </HydrationBoundary>
      <div className="h-full">{children}</div>
    </ConversationSidebar>
  );
};

export default UsersLayout;
