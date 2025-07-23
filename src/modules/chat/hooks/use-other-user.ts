import { ChatUser } from "@prisma/client";
import { useMemo } from "react";
import { FullConversationType } from "../types";

const useOtherUser = (
  conversation: FullConversationType | { users: ChatUser[] }
) => {
  // const session = useSession();

  const otherUser = useMemo(() => {
    // lấy user khác với user hiện tại
    const currentUserEmail = ""; // session.data?.user?.email;
    const otherUser = conversation.users.filter(
      (user) => user.email !== currentUserEmail
    );
    return otherUser[0]; // trả về user khác đầu tiên (vì conversation chỉ có 2 user)
  }, [conversation.users]);

  // TODO: remove as ChatUser after check useSession
  return useMemo(() => otherUser as ChatUser, [otherUser]);
};

export default useOtherUser;
