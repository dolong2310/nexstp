import ChatSidebar from "@/modules/chat/ui/components/sidebar/chat-sidebar";
import UserList, {
  UserListSkeleton,
} from "@/modules/chat/ui/components/user-list";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React, { Suspense } from "react";

type Props = { children: React.ReactNode };

export const dynamic = "force-dynamic";

const UsersLayout = async ({ children }: Props) => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.chat.getUsers.queryOptions());

  return (
    <ChatSidebar>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<UserListSkeleton />}>
          <UserList />
        </Suspense>
      </HydrationBoundary>
      <div className="h-full">{children}</div>
    </ChatSidebar>
  );
};

export default UsersLayout;
