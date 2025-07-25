import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

const useSession = () => {
  const trpc = useTRPC();
  const { data: session, isFetching: isLoading } = useQuery(
    trpc.auth.session.queryOptions()
  );
  return { session, isLoading };
};

export default useSession;
