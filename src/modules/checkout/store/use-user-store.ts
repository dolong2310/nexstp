import { User } from "payload";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UserState {
  user: User | null;
  add: (user: User) => void;
  remove: () => void;

  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

const notPersistStates: string[] = [];

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
      partialize: (state) => {
        return Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !notPersistStates.includes(key)
          )
        );
      },
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      },
    }
  )
);
