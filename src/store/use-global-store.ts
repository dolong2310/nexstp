import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface GlobalState {
  loadingGlobal: boolean;
  setLoadingGlobal: (state: boolean) => void;
}

const notPersistStates: string[] = ["loadingGlobal"];

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      loadingGlobal: false,
      setLoadingGlobal: (state) => {
        set({
          loadingGlobal: state,
        });
      },
    }),
    {
      name: "nexstp-global",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        return Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !notPersistStates.includes(key)
          )
        );
      },
    }
  )
);
