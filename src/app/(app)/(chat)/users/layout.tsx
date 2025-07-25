import Sidebar from "@/modules/chat/ui/components/sidebar/Sidebar";
import UserList, {
  UserListSkeleton,
} from "@/modules/chat/ui/components/UserList";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React, { Suspense } from "react";

type Props = { children: React.ReactNode };

export const dynamic = "force-dynamic";

const UsersLayout = async ({ children }: Props) => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.chat.getUsers.queryOptions());

  return (
    <Sidebar>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<UserListSkeleton />}>
          <UserList />
        </Suspense>
      </HydrationBoundary>
      <div className="h-full">{children}</div>
    </Sidebar>
  );
};

export default UsersLayout;
