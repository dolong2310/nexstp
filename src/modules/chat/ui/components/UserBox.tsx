"use client";

import { ChatUser } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import CustomAvatar from "./CustomAvatar";
import LoadingModal from "./LoadingModal";

type Props = {
  user: ChatUser;
};

const UserBox = ({ user }: Props) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(async () => {
    setIsLoading(true);
    axios
      .post("/api/conversations", {
        userId: user.id,
      })
      .then((data) => {
        router.push(`/conversations/${data.data.id}`);
      })
      .catch((error) => {
        console.error("Failed to create conversation:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user.id, router]);

  return (
    <>
      {isLoading && <LoadingModal />}
      <div
        className="w-full relative flex items-center space-x-3 bg-background p-3 hover:bg-primary-foreground rounded-lg transition cursor-pointer"
        onClick={handleClick}
      >
        <CustomAvatar user={user} />
        <div className="min-w-0 flex-1">
          <div className="focus:outline-none">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserBox;
