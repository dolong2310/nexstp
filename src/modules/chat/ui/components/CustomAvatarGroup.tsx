import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatName } from "@/lib/utils";
import { ChatUser, Media } from "@/payload-types";

type Props = {
  users: ChatUser[];
};

const MAX_DISPLAY = 3;

const CustomAvatarGroup = ({ users }: Props) => {
  const showUsers =
    users.length > MAX_DISPLAY ? users.slice(0, MAX_DISPLAY - 1) : users;
  const remaining = users.length - (MAX_DISPLAY - 1);

  return (
    <div className="*:data-[slot=avatar]:ring-background flex -space-x-4 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
      {showUsers.map((user) => (
        <Button key={user.id} asChild variant="outline" size="icon">
          <Avatar>
            <AvatarImage
              src={
                (user.image as Media)?.url ||
                (user.image as string) ||
                "/images/default-avatar.png"
              }
              alt={user.name || "Avatar"}
            />
            <AvatarFallback>{formatName(user.name || "User")}</AvatarFallback>
          </Avatar>
        </Button>
      ))}
      {users.length > MAX_DISPLAY && (
        <div className="flex items-center justify-center border size-6 -mt-2 rounded-md bg-feature text-white text-sm font-medium z-10">
          +{remaining}
        </div>
      )}
    </div>
  );
};

export const CustomAvatarGroupSkeleton = () => {
  return (
    <Button asChild variant="outline" size="icon">
      <Avatar>
        <AvatarImage src="/images/default-avatar.png" alt="Avatar" />
        <AvatarFallback>{formatName("User")}</AvatarFallback>
      </Avatar>
    </Button>
  );
};

export default CustomAvatarGroup;
