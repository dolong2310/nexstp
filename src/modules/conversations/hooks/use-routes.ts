import { usePathname } from "@/i18n/navigation";
import { useMemo } from "react";
import useConversation from "./use-conversation";
import { MessageSquareIcon, UsersIcon } from "lucide-react";
import { useTranslations } from "next-intl";

const useRoutes = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const { conversationId } = useConversation();

  const routes = useMemo(() => {
    return [
      {
        label: t("Conversations"),
        href: "/conversations",
        icon: MessageSquareIcon,
        active: pathname === "/conversations" || !!conversationId,
      },
      {
        label: t("Users"),
        href: "/conversations/users",
        icon: UsersIcon,
        active: pathname === "/conversations/users",
      },
    ];
  }, [pathname, conversationId]);

  return useMemo(() => routes, [routes]);
};

export default useRoutes;
