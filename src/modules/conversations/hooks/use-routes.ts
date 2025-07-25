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
        label: "Conversations",
        href: "/conversations",
        icon: MessageSquareIcon,
        active: pathname === "/conversations" || !!conversationId,
      },
      {
        label: "Users",
        href: "/conversations/users",
        icon: UsersIcon,
        active: pathname === "/conversations/users",
      },
    ];
  }, [pathname, conversationId]);

  return useMemo(() => routes, [routes]);
};

export default useRoutes;
