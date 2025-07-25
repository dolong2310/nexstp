"use client";

import useConversation from "@/modules/chat/hooks/use-conversation";
import useRoutes from "@/modules/chat/hooks/use-routes";
import ChatMobileItem from "./chat-mobile-item";

const ChatMobileFooter = () => {
  const routes = useRoutes();
  const { isOpen } = useConversation();

  if (isOpen) {
    return null;
  }

  return (
    <div className="fixed justify-between w-full bottom-0 z-40 flex items-center bg-background lg:hidden">
      {routes.map((item) => (
        <ChatMobileItem key={item.href} {...item} />
      ))}
    </div>
  );
};

export default ChatMobileFooter;
