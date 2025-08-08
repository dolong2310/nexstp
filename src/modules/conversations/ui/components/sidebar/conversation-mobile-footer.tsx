"use client";

import useConversation from "@/modules/conversations/hooks/use-conversation";
import useRoutes from "@/modules/conversations/hooks/use-routes";
import ConversationMobileItem from "./conversation-mobile-item";

const ConversationMobileFooter = () => {
  const routes = useRoutes();
  const { isOpen } = useConversation();

  if (isOpen) {
    return null;
  }

  return (
    <div className="fixed justify-between w-full bottom-0 z-40 flex items-center bg-secondary-background lg:hidden">
      {routes.map((item) => (
        <ConversationMobileItem key={item.href} {...item} />
      ))}
    </div>
  );
};

export default ConversationMobileFooter;
