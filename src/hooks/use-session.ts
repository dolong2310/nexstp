import { useUserStore } from "@/modules/checkout/store/use-user-store";

const useSession = () => {
  const user = useUserStore((state) => state.user);
  const hasHydrated = useUserStore((state) => state._hasHydrated);
  return { user, isLoading: !hasHydrated };
};

export default useSession;
