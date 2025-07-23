import { usePathname } from "next/navigation";
import { useMemo } from "react";
import useConversation from "./use-conversation";
import { MessageSquareIcon, UsersIcon } from "lucide-react";

const useRoutes = () => {
  const pathname = usePathname();
  const { conversationId } = useConversation();

  const routes = useMemo(() => {
    return [
      {
        label: "Chat",
        href: "/conversations",
        icon: MessageSquareIcon,
        active: pathname === "/conversations" || !!conversationId,
      },
      {
        label: "Users",
        href: "/users",
        icon: UsersIcon,
        active: pathname === "/users",
      },
    ];
  }, [pathname, conversationId]);

  return useMemo(() => routes, [routes]);
};

export default useRoutes;
