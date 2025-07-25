"use client";

import { Button } from "@/components/ui/button";
import useOtherUser from "@/modules/chat/hooks/use-other-user";
import useActiveList from "@/modules/chat/store/use-active-list";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeftIcon, EllipsisVerticalIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CustomAvatarSkeleton } from "../custom-avatar";
import { CustomAvatarGroupSkeleton } from "../custom-avatar-group";
import ProfileDrawer from "./profile-drawer";

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
    trpc.chat.getConversation.queryOptions({ conversationId })
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
      <header className="bg-background w-full flex items-center justify-between border-b-[1px] sm:px-4 py-3 px-4 lg:px-6 shadow-sm">
        <div className="flex gap-3 items-center">
          <Button asChild variant="elevated" size="icon">
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
            <div>{conversation.name || otherUser.name}</div>
            <div className="text-sm font-light text-muted-foreground">
              {statusText}
            </div>
          </div>
        </div>

        <Button
          variant="elevated"
          size="icon"
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
    <div className="bg-background w-full flex items-center justify-between border-b-[1px] sm:px-4 py-3 px-4 lg:px-6 shadow-sm">
      <div className="flex gap-3 items-center">
        <Button
          variant="elevated"
          size="icon"
          className="lg:hidden block"
          disabled
        >
          <ChevronLeftIcon />
        </Button>

        <CustomAvatarSkeleton />

        <div className="flex flex-col gap-y-2">
          <div className="h-4 bg-muted rounded-md w-32" />
          <div className="h-3 bg-muted rounded-md w-24" />
        </div>
      </div>

      <Button variant="elevated" size="icon" disabled>
        <EllipsisVerticalIcon />
      </Button>
    </div>
  );
};

export default ConversationHeader;
