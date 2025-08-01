import useSession from "@/hooks/use-session";
import { ChatUser } from "@/payload-types";
import { useMemo } from "react";
import { FullConversationType } from "../types";

const useOtherUser = (
  conversation: FullConversationType | { users: ChatUser[] }
) => {
  const { user } = useSession();

  const otherUser = useMemo(() => {
    // lấy user khác với user hiện tại
    const currentUserEmail = user?.email || "";
    const otherUser = conversation.users.filter(
      (user) => user.email !== currentUserEmail
    );
    return otherUser[0] as ChatUser; // trả về user khác đầu tiên (vì conversation chỉ có 2 user)
  }, [conversation.users, user?.email]);

  return useMemo(() => otherUser, [otherUser]);
};

export default useOtherUser;
