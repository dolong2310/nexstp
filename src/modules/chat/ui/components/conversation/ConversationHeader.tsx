"use client";

import useOtherUser from "@/modules/chat/hooks/use-other-user";
import useActiveList from "@/modules/chat/store/use-active-list";
import { Conversation, ChatUser } from "@prisma/client";
import { ChevronLeftIcon, EllipsisVerticalIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import CustomAvatar from "../CustomAvatar";
import CustomAvatarGroup from "../CustomAvatarGroup";
import ProfileDrawer from "./ProfileDrawer";

type Props = {
  conversation: Conversation & { users: ChatUser[] };
};

const ConversationHeader = ({ conversation }: Props) => {
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
          <Link
            href="/conversations"
            className="lg:hidden block text-sky-500 hover:text-sky-600 transition"
          >
            <ChevronLeftIcon />
          </Link>

          {conversation.isGroup ? (
            <CustomAvatarGroup users={conversation.users} />
          ) : (
            <CustomAvatar user={otherUser} />
          )}
          <div className="flex flex-col">
            <div>{conversation.name || otherUser.name}</div>
            <div className="text-sm font-light text-neutral-500">
              {statusText}
            </div>
          </div>
          {/* <ModeToggle /> */}
        </div>

        <EllipsisVerticalIcon
          size={32}
          onClick={() => setDrawerOpen(true)}
          className="text-sky-500 cursor-pointer hover:text-sky-600 transition"
        />
      </header>
    </>
  );
};

export default ConversationHeader;
