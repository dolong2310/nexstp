import React, { useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { UserProps } from "./ConversationContent";

type Props = {
  typingUsers: UserProps[];
};

const TypingBox = ({ typingUsers }: Props) => {
  // const session = useSession();
  const myEmail = ""; // session?.data?.user?.email;

  const othersTyping = useMemo(
    () => typingUsers.filter((user) => user.email !== myEmail),
    [typingUsers, myEmail]
  );

  const typingText = useMemo(() => {
    if (othersTyping.length === 0) return "You are typing...";
    if (othersTyping.length === 1)
      return `${othersTyping[0]?.name} is typing...`;
    return "Someone is typing...";
  }, [othersTyping]);

  if (typingUsers.length === 0) return null;

  return (
    <div
      className={twMerge(
        "text-xs text-gray-400 px-4 pb-2",
        othersTyping.length === 0 ? "text-right" : "text-left"
      )}
    >
      {typingText}
    </div>
  );
};

export default TypingBox;
