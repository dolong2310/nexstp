import { useUserStore } from "@/modules/auth/store/use-user-store";
import { useGlobalStore } from "@/store/use-global-store";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const useSession = () => {
  const forceLogout = useGlobalStore((state) => state.forceLogout);
  const user = useUserStore((state) => state.user);
  const addUser = useUserStore((state) => state.add);
  const hasHydrated = useUserStore((state) => state._hasHydrated);

  const trpc = useTRPC();
  const { data: session, isFetching: isSessionLoading } = useQuery(
    trpc.auth.session.queryOptions(void 0, {
      enabled: hasHydrated && !Boolean(user),
    })
  );
  const sessionUser = session?.user;

  useEffect(() => {
    if (!forceLogout && hasHydrated && !Boolean(user) && sessionUser) {
      addUser(sessionUser);
    }
  }, [user, sessionUser, forceLogout]);

  return { user, isLoading: !hasHydrated || isSessionLoading };
};

export default useSession;
