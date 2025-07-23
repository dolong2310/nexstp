"use client";

import useRoutes from "@/modules/chat/hooks/use-routes";
import { ChatUser } from "@prisma/client";
import Settings from "../Settings";
import DesktopItem from "./DesktopItem";
import ProfileModal from "./ProfileModal";

type Props = { currentUser: ChatUser };

const DesktopSidebar = ({ currentUser }: Props) => {
  const routes = useRoutes();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-20 xl:px-6 lg:overflow-auto lg:bg-background lg:border-r-[1px] lg:pb-4 lg:flex lg:flex-col justify-between">
      <nav className="mt-4 flex flex-col justify-between">
        <ul role="list" className="flex flex-col items-center space-y-1">
          {routes.map((item) => (
            <DesktopItem key={item.href} {...item} />
          ))}
        </ul>
      </nav>

      <div>
        <ProfileModal currentUser={currentUser} />

        <nav className="mt-4 flex flex-col justify-between items-center">
          <Settings />
        </nav>
      </div>
    </div>
  );
};

export default DesktopSidebar;
