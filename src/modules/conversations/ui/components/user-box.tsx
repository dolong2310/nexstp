"use client";

import { cn } from "@/lib/utils";
import { ChatUser } from "@/payload-types";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { CustomAvatarSkeleton } from "./custom-avatar";

const CustomAvatar = dynamic(() => import("./custom-avatar"), {
  ssr: false,
  loading: () => <CustomAvatarSkeleton />,
});

interface Props {
  user: ChatUser;
}

const UserBox = ({ user }: Props) => {
  const router = useRouter();
  const trpc = useTRPC();

  const createConversation = useMutation(
    trpc.conversations.createConversation.mutationOptions({
      onSuccess: (data) => {
        router.push(`/conversations/${data.id}`);
      },
      onError: (error) => {
        toast.error(error.message || "Something went wrong!");
      },
    })
  );

  const handleClick = useCallback(async () => {
    createConversation.mutate({
      userId: user.id,
    });
  }, [user.id, router]);

  return (
    <>
      {createConversation.isPending && <LoadingFullPage />}
      <div
        className={cn(
          "w-full relative flex items-center space-x-3 p-3 rounded-lg cursor-pointer border transition",
          "bg-background hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-x-[4px] hover:-translate-y-[4px]"
        )}
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

export const UserBoxSkeleton = () => {
  return (
    <div
      className={cn(
        "w-full relative flex items-center space-x-3 p-3 rounded-lg cursor-pointer border transition",
        "bg-background hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-x-[4px] hover:-translate-y-[4px]"
      )}
    >
      <CustomAvatarSkeleton />
      <div className="min-w-0 flex-1">
        <div className="focus:outline-none">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-foreground bg-muted w-full h-4 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingFullPage = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <LoaderIcon className="size-8 animate-spin text-white" />
    </div>
  );
};

export default UserBox;
