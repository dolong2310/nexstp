"use client";

import LogoutButton from "@/components/logout-button";
import ThemeButton from "@/components/theme-button";
import useRoutes from "@/modules/chat/hooks/use-routes";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useState } from "react";
import { CustomAvatarSkeleton } from "../CustomAvatar";
import ProfileModal from "../modals/ProfileModal";
import DesktopItem from "./DesktopItem";

const CustomAvatar = dynamic(() => import("../CustomAvatar"), {
  ssr: false,
  loading: () => <CustomAvatarSkeleton />,
});

const DesktopSidebar = () => {
  const routes = useRoutes();
  const trpc = useTRPC();
  const { data: currentUser } = useSuspenseQuery(
    trpc.chat.getCurrentUser.queryOptions()
  );

  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-20 xl:px-6 lg:overflow-auto lg:bg-background lg:border-r-[1px] lg:pb-4 lg:flex lg:flex-col justify-between">
      <nav className="mt-4 flex flex-col justify-between">
        <div role="list" className="flex flex-col items-center space-y-3">
          {routes.map((item) => (
            <DesktopItem key={item.href} {...item} />
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
        <ThemeButton />
        <LogoutButton iconClassName="rotate-180" />
      </nav>
    </div>
  );
};

export const DesktopSidebarSkeleton = () => {
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-20 xl:px-6 lg:overflow-auto lg:bg-background lg:border-r-[1px] lg:pb-4 lg:flex lg:flex-col justify-between">
      <nav className="mt-4 flex flex-col justify-between">
        <div role="list" className="flex flex-col items-center space-y-3">
          <div className="size-9 bg-muted rounded-md" />
          <div className="size-9 bg-muted rounded-md" />
          <div className="size-9 bg-muted rounded-md" />
        </div>
      </nav>

      <nav className="mt-4 flex flex-col justify-between items-center gap-y-3">
        <div className="cursor-pointer hover:opacity-75 transition">
          <div className="h-10 w-10 bg-muted rounded-full" />
        </div>
        <div className="size-9 bg-muted rounded-md" />
        <div className="size-9 bg-muted rounded-md" />
        <div className="size-9 bg-muted rounded-md" />
      </nav>
    </div>
  );
};

export default DesktopSidebar;
