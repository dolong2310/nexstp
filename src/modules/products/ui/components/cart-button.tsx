import { Button, buttonVariants } from "@/components/ui/button";
import useSession from "@/hooks/use-session";
import { Link } from "@/i18n/navigation";
import { cn, generateTenantPathname } from "@/lib/utils";
import useCart from "@/modules/checkout/hooks/use-cart";
import { VariantProps } from "class-variance-authority";
import {
  ArchiveIcon,
  CornerDownLeftIcon,
  LoaderIcon,
  ShoppingCartIcon,
  TrashIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { toast } from "sonner";

interface Props {
  className?: string;
  isIconButton?: boolean;
  tenantSlug: string;
  productId: string;
  isPurchased?: boolean;
  isOwner?: boolean;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  customLabel?: string;
  isDisabled?: boolean;
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
  isDisabled = false,
  customLabel = "",
}: Props) => {
  const t = useTranslations();
  const { user } = useSession();
  const cart = useCart();
  const isProductInCart = cart.isProductInCart(productId, tenantSlug);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info(t("Please sign in to add products to your cart"));
      return;
    }
    cart.toggleProduct(productId, tenantSlug);
  };

  const getVariant = useCallback(
    (isDefault?: boolean) => {
      if (variant) return variant;
      if (isIconButton) return isDefault ? "default" : "background";
      return isDefault ? "noShadowDefault" : "noShadowBackground";
    },
    [variant, isIconButton]
  );

  const getSize = useCallback(() => {
    if (size) return size;
    if (isIconButton) return "icon";
    return "default";
  }, [size, isIconButton]);

  if (isOwner) {
    return (
      <Button
        asChild={!isDisabled}
        variant={getVariant()}
        size={getSize()}
        className={cn("flex-1 font-medium", className)}
        disabled={isDisabled}
      >
        <Link href={`${generateTenantPathname(tenantSlug)}/products/${productId}`}>
          {isIconButton ? (
            <CornerDownLeftIcon className="size-4" />
          ) : (
            customLabel || t("View Product")
          )}
        </Link>
      </Button>
    );
  }

  if (isPurchased) {
    return (
      <Button
        asChild={!isDisabled}
        variant={getVariant()}
        size={getSize()}
        className={cn("flex-1 font-medium", className)}
        disabled={isDisabled}
      >
        <Link href="/library">
          {isIconButton ? (
            <ArchiveIcon className="size-4" />
          ) : (
            customLabel || t("View in Library")
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
        customLabel || t("Remove from Cart")
      );
    }
    return isIconButton ? (
      <ShoppingCartIcon className="size-4" />
    ) : (
      customLabel || t("Add to Cart")
    );
  };

  return (
    <Button
      variant={getVariant(true)}
      size={getSize()}
      className={cn("flex-1", className)}
      onClick={handleClick}
      disabled={isDisabled}
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
