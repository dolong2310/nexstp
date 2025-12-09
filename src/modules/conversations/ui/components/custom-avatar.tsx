import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatName } from "@/lib/utils";
import { ChatUser, Media } from "@/payload-types";
import { useMemo } from "react";
import useActiveList from "../../store/use-active-list";
import { useTranslations } from "next-intl";

interface Props {
  src?: string;
  user: ChatUser | null;
  className?: string;
  isOnline?: boolean | undefined;
}

const CustomAvatar = ({ src, user, className, isOnline }: Props) => {
  const t = useTranslations();
  const { members } = useActiveList();

  const isActive = useMemo(() => {
    if (typeof isOnline === "boolean") {
      return isOnline;
    }
    return members.includes(user?.email || "");
  }, [members, user?.email, isOnline]);

  return (
    <Button asChild variant="neutral" size="icon">
      <Avatar
        className={cn("rounded-base! outline-none", className)}
        isOnline={isActive}
      >
        <AvatarImage
          src={src || (user?.image as Media)?.url || (user?.image as string)}
        />
        <AvatarFallback className="rounded-base! outline-none">
          {formatName(user?.name || t("User"))}
        </AvatarFallback>
      </Avatar>
    </Button>
  );
};

export const CustomAvatarSkeleton = ({ className }: { className?: string }) => {
  return (
    <Button asChild variant="neutral" size="icon">
      <div className={cn("animate-pulse", className)}>
        <Skeleton className="size-9 rounded-base bg-secondary-background border-0" />
      </div>
    </Button>
  );
};

export default CustomAvatar;
