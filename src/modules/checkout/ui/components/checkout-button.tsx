import { Button } from "@/components/ui/button";
import { cn, generateTenantUrl } from "@/lib/utils";
import { LoaderIcon, ShoppingCartIcon } from "lucide-react";
import Link from "next/link";
import useCart from "../../hooks/use-cart";

type Props = {
  className?: string;
  hideIfEmpty?: boolean;
  tenantSlug: string;
};

const CheckoutButton = ({ className, hideIfEmpty, tenantSlug }: Props) => {
  const cart = useCart(tenantSlug);
  const totalItems = cart.totalItems;

  if (hideIfEmpty && totalItems === 0) {
    return null;
  }

  return (
    <Button asChild variant="elevated" className={cn("bg-white", className)}>
      <Link href={`${generateTenantUrl(tenantSlug)}/checkout`}>
        <ShoppingCartIcon /> {totalItems > 0 ? totalItems : ""}
      </Link>
    </Button>
  );
};

export const CheckoutButtonSkeleton = () => {
  return (
    <Button disabled variant="elevated" className="bg-white">
      <ShoppingCartIcon className="fill-black" />
      <LoaderIcon className="size-4 animate-spin" />
    </Button>
  );
};

export default CheckoutButton;
