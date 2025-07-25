import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatName } from "@/lib/utils";
import { ChatUser, Media } from "@/payload-types";
import { useMemo } from "react";
import useActiveList from "../../store/use-active-list";
import { Button } from "@/components/ui/button";

interface Props {
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
    <Button asChild variant="outline" size="icon">
      <Avatar className={className} isOnline={isActive}>
        <AvatarImage
          src={
            src ||
            (user?.image as Media)?.url ||
            (user?.image as string) ||
            "/images/default-avatar.png"
          }
        />
        <AvatarFallback>{formatName(user?.name || "User")}</AvatarFallback>
      </Avatar>
    </Button>
  );
};

export const CustomAvatarSkeleton = ({ className }: { className?: string }) => {
  return (
    <Button asChild variant="outline" size="icon">
      <Avatar className={className}>
        <AvatarImage src="/images/default-avatar.png" />
        <AvatarFallback>{formatName("User")}</AvatarFallback>
      </Avatar>
    </Button>
  );
};

export default CustomAvatar;
