import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React, { Suspense } from "react";
import DesktopSidebar, { DesktopSidebarSkeleton } from "./DesktopSidebar";
import MobileFooter from "./MobileFooter";

type Props = {
  children: React.ReactNode;
};

const Sidebar = async ({ children }: Props) => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.chat.getCurrentUser.queryOptions());

  return (
    <div className="h-full">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<DesktopSidebarSkeleton />}>
          <DesktopSidebar />
        </Suspense>
      </HydrationBoundary>

      <MobileFooter />
      <main className="lg:pl-20 h-full">{children}</main>
    </div>
  );
};

export default Sidebar;
