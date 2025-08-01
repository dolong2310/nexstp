import { toast } from "@/components/custom-toast";
import { Button } from "@/components/ui/button";
import useSession from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import useCart from "@/modules/checkout/hooks/use-cart";
import {
  ArchiveIcon,
  LoaderIcon,
  ShoppingCartIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";

interface Props {
  className?: string;
  isDefaultButton?: boolean;
  isIconButton?: boolean;
  tenantSlug: string;
  productId: string;
  isPurchased?: boolean;
}

const CartButton = ({
  className,
  isDefaultButton = false,
  isIconButton = false,
  tenantSlug,
  productId,
  isPurchased,
}: Props) => {
  const { user } = useSession();
  const cart = useCart();
  const isProductInCart = cart.isProductInCart(productId, tenantSlug);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info("Please sign in to add products to your cart.");
      return;
    }
    cart.toggleProduct(productId, tenantSlug);
  };

  if (isPurchased) {
    return (
      <Button
        asChild
        variant={isDefaultButton ? "default" : "elevated"}
        size={isIconButton ? "icon" : "default"}
        className={cn("flex-1 font-medium bg-background", className)}
      >
        <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/library`}>
          {isIconButton ? (
            <ArchiveIcon className="size-4" />
          ) : (
            "View in Library"
          )}
        </Link>
      </Button>
    );
  }

  const renderLabel = () => {
    if (isProductInCart) {
      return isIconButton ? (
        <TrashIcon className="size-4" />
      ) : (
        "Remove from Cart"
      );
    }
    return isIconButton ? (
      <ShoppingCartIcon className="size-4" />
    ) : (
      "Add to Cart"
    );
  };

  return (
    <Button
      variant={isDefaultButton ? "default" : "elevated"}
      size={isIconButton ? "icon" : "default"}
      className={cn(
        "flex-1 bg-feature",
        isProductInCart && "bg-background",
        className
      )}
      onClick={handleClick}
    >
      {renderLabel()}
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
