"use client";

import { Button } from "@/components/ui/button";
import useOtherUser from "@/modules/conversations/hooks/use-other-user";
import useActiveList from "@/modules/conversations/store/use-active-list";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeftIcon, EllipsisVerticalIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CustomAvatarSkeleton } from "../custom-avatar";
import { CustomAvatarGroupSkeleton } from "../custom-avatar-group";
import { Skeleton } from "@/components/ui/skeleton";

const ProfileDrawer = dynamic(() => import("./profile-drawer"), {
  ssr: false,
});

const CustomAvatar = dynamic(() => import("../custom-avatar"), {
  ssr: false,
  loading: () => <CustomAvatarSkeleton />,
});

const CustomAvatarGroup = dynamic(() => import("../custom-avatar-group"), {
  ssr: false,
  loading: () => <CustomAvatarGroupSkeleton />,
});

const ConversationHeader = () => {
  const params = useParams();
  const conversationId = params.conversationId as string;
  const trpc = useTRPC();
  const { data: conversation } = useSuspenseQuery(
    trpc.conversations.getConversation.queryOptions({ conversationId })
  );

  const otherUser = useOtherUser(conversation);
  const { members } = useActiveList();
  const isOnline = members.includes(otherUser?.email || "");

  const [drawerOpen, setDrawerOpen] = useState(false);

  const statusText = useMemo(() => {
    if (conversation.isGroup) {
      return `${conversation.users.length} members`;
    }
    if (isOnline) {
      return "Online";
    }
    return "Offline";
  }, [conversation, isOnline]);

  return (
    <>
      <ProfileDrawer
        conversation={conversation}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <header className="mt-18 bg-secondary-background w-full flex items-center justify-between border-b-4 sm:px-4 py-3 px-4 lg:px-6">
        <div className="flex gap-3 items-center">
          <Button asChild variant="default" size="icon">
            <Link href="/conversations" className="lg:hidden block">
              <ChevronLeftIcon />
            </Link>
          </Button>

          {conversation.isGroup ? (
            <CustomAvatarGroup users={conversation.users} />
          ) : (
            <CustomAvatar user={otherUser} />
          )}
          <div className="flex flex-col">
            <p className="max-w-[500px] truncate overflow-hidden">
              {conversation.name || otherUser.name}
            </p>
            <p className="text-sm font-light text-foreground">
              {statusText}
            </p>
          </div>
        </div>

        <Button
          variant="default"
          size="icon"
          className="shrink-0"
          onClick={() => setDrawerOpen(true)}
        >
          <EllipsisVerticalIcon />
        </Button>
      </header>
    </>
  );
};

export const ConversationHeaderSkeleton = () => {
  return (
    <div className="mt-18 bg-secondary-background w-full flex items-center justify-between border-b-4 sm:px-4 py-3 px-4 lg:px-6 shadow-sm">
      <div className="flex gap-3 items-center">
        <Button
          variant="default"
          size="icon"
          className="lg:hidden block"
          disabled
        >
          <ChevronLeftIcon />
        </Button>

        <CustomAvatarSkeleton />

        <div className="flex flex-col gap-y-2">
          <Skeleton className="h-4 bg-background rounded-base w-32" />
          <Skeleton className="h-3 bg-background rounded-base w-24" />
        </div>
      </div>

      <Button variant="default" size="icon" disabled>
        <EllipsisVerticalIcon />
      </Button>
    </div>
  );
};

export default ConversationHeader;
