"use client";

import useRoutes from "@/modules/conversations/hooks/use-routes";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useState } from "react";
import { CustomAvatarSkeleton } from "../custom-avatar";
import ConversationDesktopItem, {
  ConversationDesktopItemSkeleton,
} from "./conversation-desktop-item";

const ProfileModal = dynamic(() => import("../modals/profile-modal"), {
  ssr: false,
});

const CustomAvatar = dynamic(() => import("../custom-avatar"), {
  ssr: false,
  loading: () => <CustomAvatarSkeleton />,
});

const ConversationDesktopSidebar = () => {
  const routes = useRoutes();
  const trpc = useTRPC();
  const { data: currentUser } = useSuspenseQuery(
    trpc.conversations.getCurrentUser.queryOptions()
  );

  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <aside className="mt-18 hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-20 xl:px-6 lg:overflow-auto lg:bg-secondary-background lg:border-r-4 lg:pb-4 lg:flex lg:flex-col justify-between">
      <nav className="mt-4 flex flex-col justify-between">
        <div role="list" className="flex flex-col items-center space-y-3">
          {routes.map((item) => (
            <ConversationDesktopItem key={item.href} {...item} />
          ))}
        </div>
      </nav>

      <nav className="mt-4 flex flex-col justify-between items-center gap-y-3">
        <div
          className="cursor-pointer hover:opacity-75 transition"
          onClick={() => {
            setIsOpen(true);
            // setTimeout(() => (document.body.style.pointerEvents = ""), 0);
          }}
        >
          <CustomAvatar user={currentUser!} isOnline />
        </div>
        <ProfileModal
          currentUser={currentUser!}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
        />
      </nav>
    </aside>
  );
};

export const ConversationDesktopSidebarSkeleton = () => {
  return (
    <aside className="mt-18 hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-20 xl:px-6 lg:overflow-auto lg:bg-secondary-background lg:border-r-4 lg:pb-4 lg:flex lg:flex-col justify-between">
      <nav className="mt-4 flex flex-col justify-between">
        <div role="list" className="flex flex-col items-center space-y-3">
          <ConversationDesktopItemSkeleton />
          <ConversationDesktopItemSkeleton />
        </div>
      </nav>

      <nav className="mt-4 flex flex-col justify-between items-center gap-y-3">
        <CustomAvatarSkeleton />
      </nav>
    </aside>
  );
};

export default ConversationDesktopSidebar;
