import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useCart from "@/modules/checkout/hooks/use-cart";
import { LoaderIcon } from "lucide-react";
import Link from "next/link";

type Props = {
  tenantSlug: string;
  productId: string;
  isPurchased?: boolean;
};

const CartButton = ({ tenantSlug, productId, isPurchased }: Props) => {
  const cart = useCart(tenantSlug);

  if (isPurchased) {
    return (
      <Button
        asChild
        variant="elevated"
        className="flex-1 font-medium bg-white"
      >
        <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/library/${productId}`}>
          View in Library
        </Link>
      </Button>
    );
  }

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
