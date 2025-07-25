import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useCart from "@/modules/checkout/hooks/use-cart";
import { LoaderIcon } from "lucide-react";
import Link from "next/link";

interface Props {
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
        className="flex-1 font-medium bg-background"
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
        "flex-1 bg-feature",
        cart.isProductInCart(productId) && "bg-background"
      )}
      onClick={() => cart.toggleProduct(productId)}
    >
      {cart.isProductInCart(productId) ? "Remove from Cart" : "Add to Cart"}
    </Button>
  );
};

export const CartButtonSkeleton = () => {
  return (
    <Button disabled variant="elevated" className="flex-1 bg-feature">
      <LoaderIcon className="size-4 animate-spin" />
    </Button>
  );
};

export default CartButton;
