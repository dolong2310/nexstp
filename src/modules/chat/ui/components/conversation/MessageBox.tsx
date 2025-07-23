"use client";

import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import CustomAvatar from "../CustomAvatar";
import { format } from "date-fns";
import Image from "next/image";
import ImageModal from "../ImageModal";
import { FullMessageType } from "@/modules/chat/types";
import { fa } from "zod/v4/locales";

type Props = {
  message: FullMessageType;
  isLast: boolean;
};

const MessageBox = ({ message, isLast }: Props) => {
  // const session = useSession();

  const [imageModalOpen, setImageModalOpen] = useState(false);

  const isOwn = false; // session?.data?.user?.email === message.sender.email;
  const seenList = (message.seen || [])
    .filter((user) => user.email !== message.sender.email)
    .map((user) => user.name)
    .join(", ");

  const container = twMerge(
    "flex p-2",
    isOwn ? "justify-end" : "justify-start"
  );
  const content = twMerge(
    "flex gap-3 p-4",
    isOwn ? "flex-row" : "flex-row-reverse"
  );
  const avatar = twMerge("w-8 h-8 rounded-full", isOwn ? "order-2" : "order-1");
  const body = twMerge(
    "flex flex-col gap-2",
    isOwn ? "items-end" : "items-start"
  );
  const messageText = twMerge(
    "text-sm w-fit overflow-hidden",
    isOwn ? "bg-sky-500 text-white" : "bg-neutral-100 text-black",
    message.image ? "rounded-md p-0" : "rounded-full py-2 px-3"
  );

  return (
    <div className={container}>
      <div className={content}>
        <div className={avatar}>
          <CustomAvatar user={message.sender} isOnline={false} />
        </div>
        <div className={body}>
          <div className="flex items-center gap-1">
            <div className="text-sm text-gray-500">{message.sender.name}</div>
            <div className="text-xs text-gray-400">
              {format(new Date(message.createdAt), "p")}
            </div>
          </div>

          <div className={messageText}>
            {message.image ? (
              <>
                <Image
                  onClick={() => setImageModalOpen(true)}
                  src={message.image}
                  alt="Image"
                  width={288}
                  height={288}
                  className="object-cover cursor-pointer hover:scale-110 transition translate-0"
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
            <div className="text-xs font-light text-gray-500 mt-1">
              Seen by {seenList}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
