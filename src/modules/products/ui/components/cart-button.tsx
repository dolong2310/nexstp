import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useCart from "@/modules/checkout/hooks/use-cart";
import { LoaderIcon } from "lucide-react";

type Props = {
  tenantSlug: string;
  productId: string;
};

const CartButton = ({ tenantSlug, productId }: Props) => {
  const cart = useCart(tenantSlug);

  return (
    <Button
      variant="elevated"
      className={cn(
        "flex-1 bg-pink-400",
        cart.isProductInCart(productId) && "bg-white"
      )}
      onClick={() => cart.toggleProduct(productId)}
    >
      {cart.isProductInCart(productId) ? "Remove from Cart" : "Add to Cart"}
    </Button>
  );
};

export const CartButtonSkeleton = () => {
  return (
    <Button disabled variant="elevated" className="flex-1 bg-pink-400">
      <LoaderIcon className="size-4 animate-spin" />
    </Button>
  );
};

export default CartButton;
