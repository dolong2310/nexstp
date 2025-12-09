"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "@/i18n/navigation";
import { ChatUser } from "@/payload-types";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
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
  const t = useTranslations();
  const router = useRouter();
  const trpc = useTRPC();

  const createConversation = useMutation(
    trpc.conversations.createConversation.mutationOptions({
      onSuccess: (data) => {
        router.push(`/conversations/${data.id}`);
      },
      onError: (error) => {
        toast.error(error.message || t("Something went wrong!"));
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
      <Card
        shadowTransition
        className="gap-0 flex-row w-full relative flex items-center space-x-3 p-3 transition cursor-pointer bg-main"
        onClick={handleClick}
      >
        <CustomAvatar user={user} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between focus:outline-none">
            <p className="text-sm font-medium text-main-foreground truncate overflow-hidden">
              {user.name}
            </p>
          </div>
        </div>
      </Card>
    </>
  );
};

export const UserBoxSkeleton = () => {
  return (
    <Card
      shadowTransition
      className="gap-0 flex-row w-full relative flex items-center space-x-3 p-3 transition cursor-pointer"
    >
      <CustomAvatarSkeleton />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between focus:outline-none">
          <Skeleton className="bg-secondary-background w-full h-4" />
        </div>
      </div>
    </Card>
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
