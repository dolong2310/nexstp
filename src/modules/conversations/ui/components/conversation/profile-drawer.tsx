"use client";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import useOtherUser from "@/modules/conversations/hooks/use-other-user";
import useActiveList from "@/modules/conversations/store/use-active-list";
import { ChatUser, Conversation } from "@/payload-types";
import { format } from "date-fns";
import { XIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { CustomAvatarSkeleton } from "../custom-avatar";
import { CustomAvatarGroupSkeleton } from "../custom-avatar-group";

const ConfirmModal = dynamic(() => import("../modals/confirm-modal"), {
  ssr: false,
});

const CustomAvatar = dynamic(() => import("../custom-avatar"), {
  ssr: false,
  loading: () => <CustomAvatarSkeleton className="size-16" />,
});

const CustomAvatarGroup = dynamic(() => import("../custom-avatar-group"), {
  ssr: false,
  loading: () => <CustomAvatarGroupSkeleton />,
});

interface Props {
  conversation: Conversation & { users: ChatUser[] };
  isOpen: boolean;
  onClose: () => void;
}

const ProfileDrawer = ({ conversation, isOpen, onClose }: Props) => {
  const otherUser = useOtherUser(conversation);
  const { members } = useActiveList();
  const isOnline = members.includes(otherUser?.email || "");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const joinedDate = useMemo(() => {
    return format(new Date(otherUser.createdAt), "PP");
  }, [otherUser.createdAt]);

  const title = useMemo(() => {
    return conversation.name || otherUser.name;
  }, [conversation.name, otherUser.name]);

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
    <div>
      <Drawer direction="right" open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="py-3 px-4 sm:px-6 bg-secondary-background">
          <DrawerTitle className="sr-only"></DrawerTitle>
          <div className="flex items-start justify-end mt-2">
            <Button variant="default" size="icon" onClick={onClose}>
              <span className="sr-only">Close panel</span>
              <XIcon />
            </Button>
          </div>

          <div className="relative mt-6 flex-1 px-4 sm:px-6">
            <div className="flex flex-col items-center">
              <div className="mb-2">
                {conversation.isGroup ? (
                  <CustomAvatarGroup users={conversation.users} />
                ) : (
                  <CustomAvatar user={otherUser} className="size-16" />
                )}
              </div>
              <p className="text-center w-full line-clamp-2 wrap-break-word">
                {title}
              </p>
              <p className="text-sm mt-1">{statusText}</p>
              <div className="flex gap-10 my-8">
                <ConfirmModal
                  isOpen={isConfirmOpen}
                  onOpenChange={setIsConfirmOpen}
                />
              </div>

              <div className="w-full pb-5 pt-5 sm:px-0 sm:pt-0">
                <dl className="space-y-8 px-4 sm:space-y-6">
                  {conversation.isGroup && (
                    <div>
                      <dt className="text-sm font-medium text-foreground sm:w-40 sm:shrink-0">
                        Emails
                      </dt>
                      <dd className="mt-1 text-sm text-foreground sm:col-span-2">
                        {conversation.users.map((user: ChatUser) => (
                          <p key={user.name}> - {user.email}</p>
                        ))}
                      </dd>
                    </div>
                  )}
                  {!conversation.isGroup && (
                    <div>
                      <dt className="text-sm font-medium text-foreground sm:w-40 sm:shrink-0">
                        Email
                      </dt>
                      <dd className="mt-1 text-sm text-foreground sm:col-span-2">
                        {otherUser.email}
                      </dd>
                    </div>
                  )}
                  {!conversation.isGroup && (
                    <>
                      <hr className="border-1" />
                      <div>
                        <dt className="text-sm font-medium text-foreground sm:w-40 sm:shrink-0">
                          Joined
                        </dt>
                        <dd className="mt-1 text-sm text-foreground sm:col-span-2">
                          <time dateTime={joinedDate}>{joinedDate}</time>
                        </dd>
                      </div>
                    </>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default ProfileDrawer;
