import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useCartStore } from "../store/use-cart-store";

const useCart = () => {
  const addProduct = useCartStore((state) => state.addProduct);
  const removeProduct = useCartStore((state) => state.removeProduct);
  const clearCart = useCartStore((state) => state.clearCart);
  const clearAllCarts = useCartStore((state) => state.clearAllCarts);
  const getCartByTenant = useCartStore((state) => state.getCartByTenant);
  const tenantCarts = useCartStore((state) => state.tenantCarts);

  // const productIds = useCartStore(
  //   useShallow((state) => state.tenantCarts[tenantSlug]?.productIds || [])
  // );

  const totalProducts = useCartStore(
    useShallow((state) => {
      return Object.values(state.tenantCarts).reduce(
        (total, cart) => total + cart.productIds.length,
        0
      );
    })
  );

  // useCallback must in use all these function because they depend on the useEffect
  const getTotalItems = useCallback(
    (tenantSlug?: string) => {
      if (!tenantSlug) return totalProducts;
      return getCartByTenant(tenantSlug).length;
    },
    [totalProducts]
  );

  const getProductIdsByTenant = useCallback(
    (tenantSlug?: string) => {
      if (!tenantSlug) return [];
      return getCartByTenant(tenantSlug);
    },
    [getCartByTenant]
  );

  const toggleProduct = useCallback(
    (productId: string, tenantSlug: string) => {
      const productIds = getCartByTenant(tenantSlug);
      if (productIds.includes(productId)) {
        removeProduct(tenantSlug, productId);
      } else {
        addProduct(tenantSlug, productId);
      }
    },
    [addProduct, removeProduct, getCartByTenant]
  );

  const isProductInCart = useCallback(
    (productId: string, tenantSlug: string) => {
      const productIds = getCartByTenant(tenantSlug);
      return productIds.includes(productId);
    },
    [getCartByTenant]
  );

  const clearTenantCart = useCallback(
    (tenantSlug: string) => {
      clearCart(tenantSlug);
    },
    [clearCart]
  );

  const handleAddProduct = useCallback(
    (productId: string, tenantSlug: string) => {
      addProduct(tenantSlug, productId);
    },
    [addProduct]
  );

  const handleRemoveProduct = useCallback(
    (productId: string, tenantSlug: string) => {
      removeProduct(tenantSlug, productId);
    },
    [removeProduct]
  );

  return {
    totalProducts,
    tenantCarts,

    addProduct: handleAddProduct,
    removeProduct: handleRemoveProduct,
    clearCart: clearTenantCart,
    clearAllCarts,
    toggleProduct,
    isProductInCart,
    getProductIdsByTenant,
    getTotalItems,
  };
};

export default useCart;
