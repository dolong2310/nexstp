import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface TenantCart {
  productIds: string[];
}

interface CartState {
  tenantCarts: Record<string, TenantCart>;
  addProduct: (tenantSlug: string, productId: string) => void;
  removeProduct: (tenantSlug: string, productId: string) => void;
  clearCart: (tenantSlug: string) => void;
  clearAllCarts: () => void;
  removeTenantByTenantSlug: (tenantSlug: string) => void;
  getCartByTenant: (tenantSlug: string) => string[];
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      tenantCarts: {},

      addProduct: (tenantSlug, productId) =>
        set((state) => ({
          tenantCarts: {
            ...state.tenantCarts,
            [tenantSlug]: {
              productIds: [
                ...(state.tenantCarts[tenantSlug]?.productIds || []),
                productId,
              ],
            },
          },
        })),
      removeProduct: (tenantSlug, productId) =>
        set((state) => {
          const productIds =
            state.tenantCarts[tenantSlug]?.productIds.filter(
              (id) => id !== productId
            ) || [];

          if (productIds.length === 0) {
            const { [tenantSlug]: _, ...rest } = state.tenantCarts;
            return { tenantCarts: rest };
          }

          return {
            tenantCarts: {
              ...state.tenantCarts,
              [tenantSlug]: { productIds },
            },
          };
        }),
      clearCart: (tenantSlug) =>
        set((state) => ({
          tenantCarts: {
            ...state.tenantCarts,
            [tenantSlug]: {
              productIds: [],
            },
          },
        })),
      clearAllCarts: () => set({ tenantCarts: {} }),
      // xoá tenant khỏi tenantSlug theo tenantSlug
      removeTenantByTenantSlug: (tenantSlug: string) =>
        set((state) => {
          const { [tenantSlug]: _, ...rest } = state.tenantCarts;
          return { tenantCarts: rest };
        }),
      // lấy danh sách productIds của tenant theo tenantSlug
      getCartByTenant: (tenantSlug) =>
        get().tenantCarts[tenantSlug]?.productIds || [],
    }),
    {
      name: "nexstp-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
