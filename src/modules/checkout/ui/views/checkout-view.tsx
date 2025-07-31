"use client";

import useSession from "@/hooks/use-session";
import { generateTenantUrl } from "@/lib/utils";
import { ProductListEmpty } from "@/modules/products/ui/components/product-list";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import useCart from "../../hooks/use-cart";
import useCheckoutState from "../../hooks/use-checkout-state";
import CheckoutItem, {
  CheckoutItemSkeleton,
} from "../components/checkout-item";
import CheckoutSidebar from "../components/checkout-sidebar";

interface Props {
  tenantSlug: string;
}

const CheckoutView = ({ tenantSlug }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [states, setStates] = useCheckoutState();

  const { user } = useSession();
  const cart = useCart(tenantSlug);

  const trpc = useTRPC();
  const {
    data: products,
    isLoading,
    error,
  } = useQuery(
    trpc.checkout.getProducts.queryOptions({
      ids: cart.productIds,
    })
  );

  const purchase = useMutation(
    trpc.checkout.purchase.mutationOptions({
      onMutate: () => {
        setStates({ success: false, cancel: false });
      },
      onSuccess: (data) => {
        window.location.href = data.url;
      },
      onError: (error) => {
        if (error.data?.code === "UNAUTHORIZED") {
          router.push("/sign-in");
        }
        toast.error(error.message);
      },
    })
  );

  useEffect(() => {
    if (states.success) {
      setStates({ success: false, cancel: false });
      cart.clearCart();

      // prefetch library products
      queryClient.invalidateQueries(
        trpc.library.getMany.infiniteQueryOptions({})
      );
      router.push("/library");
    }
  }, [
    states.success,
    cart.clearCart,
    router,
    setStates,
    queryClient,
    trpc.library.getMany,
  ]);

  useEffect(() => {
    if (error?.data?.code === "NOT_FOUND") {
      cart.clearCart();
      toast.warning("Invalid products in the cart. Please update your cart.");
    }
  }, [error, cart.clearCart]);

  if (isLoading) {
    return <CheckoutViewSkeleton />;
  }

  if (products?.totalDocs === 0) {
    return (
      <div className="pt-4 lg:pt-16 px-4 lg:px-12">
        <ProductListEmpty visibleLibraryButton={!!user} />
      </div>
    );
  }

  return (
    <div className="pt-4 lg:pt-16 px-4 lg:px-12">
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="border rounded-md overflow-hidden bg-background">
            {products?.docs.map((product, index) => {
              return (
                <CheckoutItem
                  key={product.id}
                  isLast={index === products.docs.length - 1}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.image?.url}
                  productUrl={`${generateTenantUrl(
                    product.tenant.slug
                  )}/products/${product.id}`}
                  tenantUrl={generateTenantUrl(product.tenant.slug)}
                  tenantName={product.tenant.name}
                  onRemove={() => cart.removeProduct(product.id)}
                />
              );
            })}
          </div>
        </div>
        <div className="lg:col-span-3">
          <CheckoutSidebar
            totalPrice={products?.totalPrice || 0}
            isPending={purchase.isPending}
            isCanceled={states.cancel}
            onPurchase={() =>
              purchase.mutate({ productIds: cart.productIds, tenantSlug })
            }
          />
        </div>
      </div>
    </div>
  );
};

const CheckoutViewSkeleton = () => {
  return (
    <div className="pt-4 lg:pt-16 px-4 lg:px-12">
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="border rounded-md overflow-hidden bg-background">
            {Array.from({ length: 3 }).map((_, index) => (
              <CheckoutItemSkeleton key={index} />
            ))}
          </div>
        </div>
        <div className="lg:col-span-3">
          <CheckoutSidebar
            totalPrice={0}
            isPending={true}
            onPurchase={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutView;
