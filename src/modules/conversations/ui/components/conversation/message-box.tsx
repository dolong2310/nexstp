"use client";

import Media from "@/components/media";
import PreviewImageModal from "@/components/preview-image-modal";
import { Skeleton } from "@/components/ui/skeleton";
import useSession from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { FullMessageType } from "@/modules/conversations/types";
import { ChatUser, User } from "@/payload-types";
import { format } from "date-fns";
import dynamic from "next/dynamic";
import { useState } from "react";
import { CustomAvatarSkeleton } from "../custom-avatar";

const CustomAvatar = dynamic(() => import("../custom-avatar"), {
  ssr: false,
  loading: () => <CustomAvatarSkeleton />,
});

interface Props {
  message: FullMessageType;
  isLast: boolean;
  id: string;
}

const MessageBox = ({ message, isLast, id }: Props) => {
  const { user } = useSession();

  const [imageModalOpen, setImageModalOpen] = useState(false);

  const senderUser = message.sender.user as User;
  const isOwn = user?.id === senderUser.id;
  const seenList = (message.seen || [])
    .filter((user: ChatUser) => user.id !== message.sender.id)
    .map((user) => user.name)
    .join(", ");

  const container = cn("flex p-2", isOwn ? "justify-end" : "justify-start");
  const content = cn("flex gap-3 p-4", isOwn ? "flex-row" : "flex-row-reverse");
  const avatar = cn(isOwn ? "order-2" : "order-1");
  const body = cn("flex flex-col gap-2", isOwn ? "items-end" : "items-start");
  const messageText = cn(
    "text-sm w-fit max-w-[500px] break-words rounded-base overflow-hidden shadow-shadow border-2",
    isOwn ? "bg-main text-white" : "bg-secondary-background",
    message.image ? "p-0" : "py-2 px-3"
  );

  return (
    <div id={id} className={container}>
      <div className={content}>
        <div className={avatar}>
          <CustomAvatar user={message.sender} isOnline={false} />
        </div>
        <div className={body}>
          <div className="flex items-center gap-1">
            <p className="text-sm text-foreground truncate overflow-hidden max-w-[500px]">
              {message.sender.name}
            </p>
            <time className="text-xs text-foreground/80">
              {format(new Date(message.createdAt), "p")}
            </time>
          </div>

          <div className={messageText}>
            {message.image ? (
              <>
                <Media
                  src={message.image}
                  alt={message.body || "Image"}
                  width={288}
                  height={288}
                  className="object-cover cursor-pointer hover:scale-110 transition translate-0"
                  onClick={() => setImageModalOpen(true)}
                />
                <PreviewImageModal
                  src={message.image}
                  isOpen={imageModalOpen}
                  onOpenChange={setImageModalOpen}
                />
              </>
            ) : (
              <p>{message.body}</p>
            )}
          </div>

          {isLast && isOwn && seenList.length > 0 && (
            <p className="text-xs font-light text-foreground mt-1">
              Seen by {seenList}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const MessageBoxSkeleton = ({ isReverse }: { isReverse?: boolean }) => {
  return (
    <div className={cn("flex p-2 justify-start", isReverse && "justify-end")}>
      <div className={cn("flex gap-3 p-4", isReverse && "flex-row-reverse")}>
        <CustomAvatarSkeleton />

        <div
          className={cn(
            "flex flex-col gap-2 items-start",
            isReverse && "items-end"
          )}
        >
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 bg-secondary-background rounded-base w-20" />
          </div>
          <Skeleton className="text-sm h-8 w-48 rounded-base overflow-hidden bg-secondary-background py-2 px-3 shadow-shadow" />
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
