import { formatName } from "@/lib/utils";
import { ChatUser } from "@prisma/client";
import { useMemo } from "react";
import useActiveList from "../../store/use-active-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  src?: string;
  user: ChatUser | null;
  className?: string;
  isOnline?: boolean | undefined;
};

const CustomAvatar = ({ src, user, className, isOnline }: Props) => {
  const { members } = useActiveList();

  const isActive = useMemo(() => {
    if (typeof isOnline === "boolean") {
      return isOnline;
    }
    return members.includes(user?.email || "");
  }, [members, user?.email, isOnline]);

  return (
    <Avatar className={className} isOnline={isActive}>
      <AvatarImage src={src || user?.image || "/images/default-avatar.png"} />
      <AvatarFallback>{formatName(user?.name || "User")}</AvatarFallback>
    </Avatar>
  );
};

export default CustomAvatar;
