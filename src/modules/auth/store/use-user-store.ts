import { User } from "@/payload-types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UserState {
  user: User | null;
  add: (user: User) => void;
  remove: () => void;

  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      add: (user: User) => set({ user }),
      remove: () => set({ user: null }),

      _hasHydrated: false,
      setHasHydrated: (state) => {
        set({
          _hasHydrated: state,
        });
      },
    }),
    {
      name: "nexstp-user",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      },
    }
  )
);
