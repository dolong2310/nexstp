import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatUser } from "@prisma/client";
import { formatName } from "@/lib/utils";

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
        <Avatar key={user.id}>
          <AvatarImage
            src={user.image || "/images/default-avatar.png"}
            alt={user.name || "Avatar"}
          />
          <AvatarFallback>{formatName(user.name || "User")}</AvatarFallback>
        </Avatar>
      ))}
      {users.length > MAX_DISPLAY && (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-600 text-sm font-medium z-10">
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default CustomAvatarGroup;
