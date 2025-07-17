"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import useCart from "../../hooks/use-cart";
import { toast } from "sonner";
import { generateTenantUrl } from "@/lib/utils";
import CheckoutItem from "../components/checkout-item";
import CheckoutSidebar from "../components/checkout-sidebar";
import { ProductListEmpty } from "@/modules/products/ui/components/product-list";
import { LoaderIcon } from "lucide-react";

type Props = {
  tenantSlug: string;
};

const CheckoutView = ({ tenantSlug }: Props) => {
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

  useEffect(() => {
    if (error?.data?.code === "NOT_FOUND") {
      cart.clearAllCarts();
      toast.warning("Invalid products in the cart. Please update your cart.");
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="pt-4 lg:pt-16 px-4 lg:px-12">
        <div className="flex flex-col items-center justify-center gap-y-4 w-full rounded-lg bg-white border border-black border-dashed p-8">
          <LoaderIcon className="size-4 animate-spin" />
        </div>
      </div>
    );
  }

  if (products?.totalDocs === 0) {
    return (
      <div className="pt-4 lg:pt-16 px-4 lg:px-12">
        <ProductListEmpty />
      </div>
    );
  }

  return (
    <div className="pt-4 lg:pt-16 px-4 lg:px-12">
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="border rounded-md overflow-hidden bg-white">
            {products?.docs.map((product, index) => {
              return (
                <CheckoutItem
                  key={product.id}
                  isLast={index === products.docs.length - 1}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.image?.url}
                  productUrl={`${generateTenantUrl(product.tenant.slug)}/products/${product.id}`}
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
            isPending={false}
            isCanceled={false}
            onCheckout={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutView;
