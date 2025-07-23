import { ChatUser } from "@prisma/client";
import UserBox from "./UserBox";

type Props = { users: ChatUser[] };

const UserList = ({ users }: Props) => {
  return (
    <aside className="fixed inset-y-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto bg-background border-r block w-full left-0">
      <div className="px-5">
        <div className="flex-col">
          <div className="text-2xl font-bold text-foreground py-4">Users</div>
        </div>

        {users.map((user) => (
          <UserBox key={user.id} user={user} />
        ))}
      </div>
    </aside>
  );
};

export default UserList;
