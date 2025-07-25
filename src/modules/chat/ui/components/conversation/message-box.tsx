"use client";

import Media from "@/components/media";
import { cn } from "@/lib/utils";
import useSession from "@/modules/chat/hooks/use-session";
import { FullMessageType } from "@/modules/chat/types";
import { ChatUser, User } from "@/payload-types";
import { format } from "date-fns";
import dynamic from "next/dynamic";
import { useState } from "react";
import { CustomAvatarSkeleton } from "../custom-avatar";
import ImageModal from "../modals/image-modal";

const CustomAvatar = dynamic(() => import("../custom-avatar"), {
  ssr: false,
  loading: () => <CustomAvatarSkeleton />,
});

interface Props {
  message: FullMessageType;
  isLast: boolean;
};

const MessageBox = ({ message, isLast }: Props) => {
  const { session } = useSession();

  const [imageModalOpen, setImageModalOpen] = useState(false);

  const senderUser = message.sender.user as User;
  const isOwn = session?.user?.id === senderUser.id;
  const seenList = (message.seen || [])
    .filter((user: ChatUser) => user.id !== message.sender.id)
    .map((user) => user.name)
    .join(", ");

  const container = cn("flex p-2", isOwn ? "justify-end" : "justify-start");
  const content = cn("flex gap-3 p-4", isOwn ? "flex-row" : "flex-row-reverse");
  const avatar = cn("w-8 h-8 rounded-full", isOwn ? "order-2" : "order-1");
  const body = cn("flex flex-col gap-2", isOwn ? "items-end" : "items-start");
  const messageText = cn(
    "text-sm w-fit rounded-md overflow-hidden border",
    isOwn ? "bg-feature text-white" : "bg-background text-primary",
    message.image ? "p-0" : "py-2 px-3"
  );

  return (
    <div className={container}>
      <div className={content}>
        <div className={avatar}>
          <CustomAvatar user={message.sender} isOnline={false} />
        </div>
        <div className={body}>
          <div className="flex items-center gap-1">
            <div className="text-sm text-muted-foreground">
              {message.sender.name}
            </div>
            <div className="text-xs text-muted-foreground/80">
              {format(new Date(message.createdAt), "p")}
            </div>
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
                <ImageModal
                  src={message.image}
                  isOpen={imageModalOpen}
                  onOpenChange={setImageModalOpen}
                />
              </>
            ) : (
              <div>{message.body}</div>
            )}
          </div>

          {isLast && isOwn && seenList.length > 0 && (
            <div className="text-xs font-light text-muted-foreground mt-1">
              Seen by {seenList}
            </div>
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
        <div className="w-8 h-8 rounded-full">
          <CustomAvatarSkeleton />
        </div>
        <div
          className={cn(
            "flex flex-col gap-2 items-start",
            isReverse && "items-end"
          )}
        >
          <div className="flex items-center gap-1">
            <div className="h-4 bg-muted rounded-md w-20" />
          </div>
          <div className="text-sm w-48 rounded-md overflow-hidden bg-muted text-primary py-2 px-3">
            <div className="h-4 bg-muted rounded-md w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
