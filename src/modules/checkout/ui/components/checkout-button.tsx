"use client";

import { toast } from "@/components/custom-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useSession from "@/hooks/use-session";
import { cn, formatQuantityNumber, generateTenantUrl } from "@/lib/utils";
import { LoaderIcon, ShoppingCartIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useCart from "../../hooks/use-cart";

interface Props {
  className?: string;
  hide?: boolean;
  hideIfEmpty?: boolean;
  isSmallButton?: boolean;
  tenantSlug?: string;
}

const CheckoutButton = ({
  className,
  hide,
  hideIfEmpty,
  isSmallButton,
  tenantSlug,
}: Props) => {
  const router = useRouter();
  const cart = useCart();
  const { user } = useSession();
  const totalItems = cart.getTotalItems(tenantSlug);
  const tenantCarts = cart.tenantCarts;
  const tenantCartSlugs = Object.keys(tenantCarts);
  const Component = !user ? Button : Link;

  const handlePreventUser = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    if (!user) {
      e.preventDefault();
      e.stopPropagation();
      toast.info("Please sign in to proceed with checkout");
      setTimeout(() => router.push("/sign-in"), 2000);
    }
  };

  if (hide) return null;

  if (hideIfEmpty && totalItems === 0) return null;

  // If tenantSlug is provided, show the cart for that specific tenant
  // Otherwise, show a dropdown for all tenant carts
  if (!tenantSlug) {
    return (
      <>
        {tenantCartSlugs.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="elevated"
                size={isSmallButton ? "sm" : "default"}
                className={cn("bg-background ring-0 focus:ring-0", className)}
              >
                <ShoppingCartIcon />{" "}
                {totalItems > 0 ? formatQuantityNumber(totalItems) : ""}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              avoidCollisions
              align="end"
              className="flex flex-col gap-2 min-w-[200px]"
            >
              {tenantCartSlugs.map((tenantSlug) => {
                const totalItemsOfTenant = cart.getTotalItems(tenantSlug);
                return (
                  <DropdownMenuItem asChild key={tenantSlug}>
                    <Button
                      asChild
                      className="flex items-center justify-between gap-2 w-full cursor-pointer"
                      variant="elevated"
                      onClick={handlePreventUser}
                    >
                      <Link href={`${generateTenantUrl(tenantSlug)}/checkout`}>
                        <p className="truncate overflow-hidden whitespace-nowrap max-w-[300px]">
                          {tenantSlug}
                        </p>
                        <span>
                          ({formatQuantityNumber(totalItemsOfTenant, 99)})
                        </span>
                      </Link>
                    </Button>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            asChild
            variant="elevated"
            size={isSmallButton ? "sm" : "default"}
            className={cn("bg-background", className)}
          >
            <Link
              href={`${generateTenantUrl(
                tenantCartSlugs[0] as string
              )}/checkout`}
            >
              <ShoppingCartIcon />{" "}
              {totalItems > 0 ? formatQuantityNumber(totalItems) : ""}
            </Link>
          </Button>
        )}
      </>
    );
  }

  return (
    <Button
      asChild
      variant="elevated"
      size={isSmallButton ? "sm" : "default"}
      className={cn("bg-background", className)}
    >
      <Component
        href={`${generateTenantUrl(tenantSlug)}/checkout`}
        onClick={handlePreventUser}
      >
        <ShoppingCartIcon />{" "}
        {totalItems > 0 ? formatQuantityNumber(totalItems) : ""}
      </Component>
    </Button>
  );
};

export const CheckoutButtonSkeleton = () => {
  return (
    <Button disabled variant="elevated" className="bg-background">
      <ShoppingCartIcon className="fill-black" />
      <LoaderIcon className="size-4 animate-spin" />
    </Button>
  );
};

export default CheckoutButton;
