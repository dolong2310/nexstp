import getUsers from "@/lib/server-actions/chat/getUsers";
import Sidebar from "@/modules/chat/ui/components/sidebar/Sidebar";
import UserList from "@/modules/chat/ui/components/UserList";
import React from "react";

type Props = { children: React.ReactNode };

const UsersLayout = async ({ children }: Props) => {
  const users = await getUsers();

  return (
    <Sidebar>
      <UserList users={users} />
      <div className="h-full">{children}</div>
    </Sidebar>
  );
};

export default UsersLayout;
