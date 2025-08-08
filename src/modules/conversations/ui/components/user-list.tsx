"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import UserBox, { UserBoxSkeleton } from "./user-box";

const UserList = () => {
  const trpc = useTRPC();
  const { data: users = [] } = useSuspenseQuery(
    trpc.conversations.getUsers.queryOptions()
  );

  return (
    <aside className="mt-18 fixed inset-y-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto bg-secondary-background border-r-4 block w-full left-0">
      <div className="flex flex-col gap-y-3 px-5">
        <div className="text-2xl font-bold text-foreground py-4">Users</div>

        {users.map((user) => (
          <UserBox key={user.id} user={user} />
        ))}
      </div>
    </aside>
  );
};

export const UserListSkeleton = () => {
  return (
    <aside className="mt-18 fixed inset-y-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto bg-secondary-background border-r-4 block w-full left-0">
      <div className="flex flex-col gap-y-3 px-5">
        <div className="text-2xl font-bold text-foreground py-4">Users</div>

        <div className="animate-pulse flex flex-col space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <UserBoxSkeleton key={index} />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default UserList;
