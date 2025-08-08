import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import useSession from "@/hooks/use-session";
import { cn, generateTenantUrl } from "@/lib/utils";
import useCart from "@/modules/checkout/hooks/use-cart";
import { VariantProps } from "class-variance-authority";
import {
  ArchiveIcon,
  CornerDownLeftIcon,
  LoaderIcon,
  ShoppingCartIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";

interface Props {
  className?: string;
  isIconButton?: boolean;
  tenantSlug: string;
  productId: string;
  isPurchased?: boolean;
  isOwner?: boolean;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
}

const CartButton = ({
  className,
  isIconButton = false,
  tenantSlug,
  productId,
  isPurchased,
  isOwner,
  variant,
  size,
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

  if (isOwner) {
    return (
      <Button
        asChild
        variant={
          variant ? variant : isIconButton ? "background" : "noShadowBackground"
        }
        size={size ? size : isIconButton ? "icon" : "default"}
        className={cn("flex-1 font-medium", className)}
      >
        <Link href={`${generateTenantUrl(tenantSlug)}/products/${productId}`}>
          {isIconButton ? (
            <CornerDownLeftIcon className="size-4" />
          ) : (
            "View Product"
          )}
        </Link>
      </Button>
    );
  }

  if (isPurchased) {
    return (
      <Button
        asChild
        variant={
          variant ? variant : isIconButton ? "background" : "noShadowBackground"
        }
        size={size ? size : isIconButton ? "icon" : "default"}
        className={cn("flex-1 font-medium", className)}
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
      variant={variant ? variant : isIconButton ? "default" : "noShadowDefault"}
      size={size ? size : isIconButton ? "icon" : "default"}
      className={cn("flex-1", className)}
      onClick={handleClick}
    >
      {renderLabel()}
    </Button>
  );
};

export const CartButtonSkeleton = ({
  className,
  isIconButton,
  variant,
  size,
}: {
  className?: string;
  isIconButton?: boolean;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
}) => {
  return (
    <Button
      disabled
      variant={variant ? variant : isIconButton ? "default" : "noShadowDefault"}
      size={size ? size : isIconButton ? "icon" : "default"}
      className={cn("flex-1 disabled:opacity-100", className)}
    >
      <LoaderIcon className="size-4 animate-spin" />
    </Button>
  );
};

export default CartButton;
