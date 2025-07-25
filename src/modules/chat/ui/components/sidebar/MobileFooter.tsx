"use client";

import useConversation from "@/modules/chat/hooks/use-conversation";
import useRoutes from "@/modules/chat/hooks/use-routes";
import MobileItem from "./MobileItem";

const MobileFooter = () => {
  const routes = useRoutes();
  const { isOpen } = useConversation();

  if (isOpen) {
    return null;
  }

  return (
    <div className="fixed justify-between w-full bottom-0 z-40 flex items-center bg-background lg:hidden">
      {routes.map((item) => (
        <MobileItem key={item.href} {...item} />
      ))}
    </div>
  );
};

export default MobileFooter;
