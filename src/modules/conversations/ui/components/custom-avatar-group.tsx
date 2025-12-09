import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatName } from "@/lib/utils";
import { ChatUser, Media } from "@/payload-types";
import { useTranslations } from "next-intl";

interface Props {
  users: ChatUser[];
}

const MAX_DISPLAY = 3;

const CustomAvatarGroup = ({ users }: Props) => {
  const t = useTranslations();
  const showUsers =
    users.length > MAX_DISPLAY ? users.slice(0, MAX_DISPLAY - 1) : users;
  const remaining = users.length - (MAX_DISPLAY - 1);

  return (
    <div className="*:data-[slot=avatar]:ring-background flex -space-x-4 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
      {showUsers.map((user) => (
        <Button key={user.id} asChild variant="neutral" size="icon">
          <Avatar className="rounded-base! outline-none">
            <AvatarImage
              src={(user.image as Media)?.url || (user.image as string)}
              alt={user.name || t("Avatar")}
            />
            <AvatarFallback className="rounded-base! outline-none">
              {formatName(user.name || t("User"))}
            </AvatarFallback>
          </Avatar>
        </Button>
      ))}
      {users.length > MAX_DISPLAY && (
        <Badge className="flex items-center justify-center size-6 -mt-2 text-sm font-medium z-10">
          +{remaining}
        </Badge>
      )}
    </div>
  );
};

export const CustomAvatarGroupSkeleton = () => {
  const t = useTranslations();
  return (
    <Button asChild variant="default" size="icon">
      <Avatar>
        <AvatarImage alt="Avatar" />
        <AvatarFallback>{formatName(t("User"))}</AvatarFallback>
      </Avatar>
    </Button>
  );
};

export default CustomAvatarGroup;
