import { cn } from "@/lib/utils";
import useSession from "@/modules/chat/hooks/use-session";
import { useMemo } from "react";
import { UserProps } from "./ConversationContent";

type Props = {
  typingUsers: UserProps[];
};

const TypingBox = ({ typingUsers }: Props) => {
  const { session } = useSession();
  const myEmail = session?.user?.email;

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
      className={cn(
        "text-xs text-muted-foreground/80 px-4 pb-2",
        othersTyping.length === 0 ? "text-right" : "text-left"
      )}
    >
      {typingText}
    </div>
  );
};

export default TypingBox;
