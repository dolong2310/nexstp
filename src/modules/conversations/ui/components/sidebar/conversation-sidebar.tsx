import { getQueryClient, trpc } from "@/trpc/server";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";
import ConversationDesktopSidebar, {
  ConversationDesktopSidebarSkeleton,
} from "./conversation-desktop-sidebar";
import ConversationMobileFooter from "./conversation-mobile-footer";

interface Props {
  children: React.ReactNode;
}

const handleGetCurrentUser = async (queryClient: QueryClient) => {
  try {
    const currentUser = await queryClient.fetchQuery(
      trpc.conversations.getCurrentUser.queryOptions()
    );
    return currentUser;
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    redirect("/sign-in");
  }
};

const ConversationSidebar = async ({ children }: Props) => {
  const queryClient = getQueryClient();
  const currentUser = await handleGetCurrentUser(queryClient);

  if (!currentUser?.user) {
    redirect("/sign-in");
  }

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
