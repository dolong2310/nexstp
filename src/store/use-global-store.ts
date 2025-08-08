import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface GlobalState {
  forceLogout: boolean;
  setForceLogout: (state: boolean) => void;
  loadingGlobal: boolean;
  setLoadingGlobal: (state: boolean) => void;
}

const notPersistStates: string[] = ["forceLogout", "loadingGlobal"];

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      forceLogout: false,
      setForceLogout: (state) => {
        set({
          forceLogout: state,
        });
      },
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
