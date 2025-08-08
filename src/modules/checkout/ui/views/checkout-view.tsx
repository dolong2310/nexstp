"use client";

import { toast } from "sonner";
import { DEFAULT_LIMIT } from "@/constants";
import useSession from "@/hooks/use-session";
import { generateTenantUrl } from "@/lib/utils";
import { ProductListEmpty } from "@/modules/products/ui/components/product-list";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
  const cart = useCart();

  const trpc = useTRPC();
  const {
    data: products,
    isLoading,
    error,
  } = useQuery(
    trpc.checkout.getProducts.queryOptions({
      ids: cart.getProductIdsByTenant(tenantSlug),
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
      cart.clearCart(tenantSlug);

      // prefetch library products
      queryClient.invalidateQueries(
        trpc.library.getMany.infiniteQueryOptions({ limit: DEFAULT_LIMIT })
      );
      router.push("/library");
    }
  }, [
    states,
    cart.clearCart,
    router,
    setStates,
    queryClient,
    trpc.library.getMany,
  ]);

  useEffect(() => {
    if (error?.data?.code === "NOT_FOUND") {
      cart.clearCart(tenantSlug);
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

  const handleRemoveProduct = (productId: string, tenantSlug: string) => () => {
    cart.removeProduct(productId, tenantSlug);
  };

  const handlePurchase = () => {
    purchase.mutate({
      productIds: cart.getProductIdsByTenant(tenantSlug),
      tenantSlug,
    });
  };

  return (
    <div className="pt-4 lg:pt-16 px-4 lg:px-12">
      <div className="flex flex-wrap md:flex-nowrap gap-4 lg:gap-16">
        <div className="w-full md:w-5/7 lg:w-4/7 md:mb-8">
          <div className="flex flex-col gap-4 rounded-md">
            {products?.docs.map((product) => {
              return (
                <CheckoutItem
                  key={product.id}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.image?.url}
                  productUrl={`${generateTenantUrl(
                    product.tenant.slug
                  )}/products/${product.id}`}
                  tenantUrl={generateTenantUrl(product.tenant.slug)}
                  tenantName={product.tenant.name}
                  onRemove={handleRemoveProduct(
                    product.id,
                    product.tenant.slug
                  )}
                />
              );
            })}
          </div>
        </div>

        <div className="w-full md:w-2/7 lg:w-3/7 mb-8 md:mb-0">
          <div className="sticky top-4 right-0">
            <CheckoutSidebar
              totalPrice={products?.totalPrice || 0}
              isPending={purchase.isPending}
              isCanceled={states.cancel}
              onPurchase={handlePurchase}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutViewSkeleton = () => {
  return (
    <div className="pt-4 lg:pt-16 px-4 lg:px-12">
      <div className="flex flex-wrap md:flex-nowrap gap-4 lg:gap-16">
        <div className="w-full md:w-5/7 lg:w-4/7 md:mb-8">
          <div className="flex flex-col gap-4 rounded-md">
            {Array.from({ length: 3 }).map((_, index) => (
              <CheckoutItemSkeleton key={index} />
            ))}
          </div>
        </div>
        <div className="w-full md:w-2/7 lg:w-3/7 mb-8 md:mb-0">
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
