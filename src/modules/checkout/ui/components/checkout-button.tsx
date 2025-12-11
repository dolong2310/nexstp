"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useSession from "@/hooks/use-session";
import { Link, useRouter } from "@/i18n/navigation";
import { cn, formatQuantityNumber, generateTenantPathname } from "@/lib/utils";
import { LoaderIcon, ShoppingCartIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import useCart from "../../hooks/use-cart";
import { useCartStore } from "../../store/use-cart-store";

interface Props {
  className?: string;
  tenantSlug?: string;
}

const CheckoutButton = ({ className, tenantSlug }: Props) => {
  const t = useTranslations();
  const router = useRouter();
  const hasHydrated = useCartStore((state) => state._hasHydrated);
  const cart = useCart();
  const { user } = useSession();
  const totalItems = cart.getTotalItems(tenantSlug);
  const tenantCarts = cart.tenantCarts;
  const tenantCartSlugs = Object.keys(tenantCarts);
  const Component = !user || totalItems === 0 ? Button : Link;
  const totalLabel = totalItems > 0 ? formatQuantityNumber(totalItems) : 0;

  const handlePreventUser = (
    e: React.MouseEvent<HTMLDivElement | HTMLButtonElement | HTMLAnchorElement>
  ) => {
    if (!user) {
      e.preventDefault();
      e.stopPropagation();
      toast.info(t("Please sign in to proceed with checkout"));
      setTimeout(() => router.push("/sign-in"), 2000);
    }
  };

  if (!hasHydrated) return <CheckoutButtonSkeleton />;

  // if (totalItems === 0) return null;
  if (!user) return null;

  // If tenantSlug is provided, show the cart for that specific tenant
  // Otherwise, show a dropdown for all tenant carts
  if (!tenantSlug) {
    return (
      <div
        className={cn(
          "fixed bottom-4 left-1/2 -translate-x-1/2",
          totalItems > 0 ? "animate-raw-slide-up" : "animate-raw-slide-down"
        )}
      >
        {tenantCartSlugs.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className={cn("h-10 shrink-0", className)}
                disabled={totalItems === 0}
              >
                <ShoppingCartIcon /> {t("Checkout")} ({totalLabel})
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              avoidCollisions
              align="end"
              className="flex flex-col gap-1 p-2 min-w-[200px] space-y-2 py-3 px-0"
            >
              {tenantCartSlugs.map((tenantSlug) => {
                const totalItemsOfTenant = cart.getTotalItems(tenantSlug);
                return (
                  <div
                    key={tenantSlug}
                    className="px-4"
                    onClick={handlePreventUser}
                  >
                    <Link
                      href={`${generateTenantPathname(tenantSlug)}/checkout`}
                      className="flex items-center justify-between gap-2 text-sm font-heading cursor-pointer"
                    >
                      <p className="truncate overflow-hidden whitespace-nowrap max-w-[300px]">
                        {tenantSlug}
                      </p>
                      <span>
                        ({formatQuantityNumber(totalItemsOfTenant, 99)})
                      </span>
                    </Link>
                  </div>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            asChild
            variant="default"
            size="sm"
            className={cn("h-10 shrink-0", className)}
            disabled={totalItems === 0}
          >
            <Component
              href={`${generateTenantPathname(
                tenantCartSlugs[0] as string
              )}/checkout`}
            >
              <ShoppingCartIcon /> {t("Checkout")} ({totalLabel})
            </Component>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2",
        totalItems > 0 ? "animate-raw-slide-up" : "animate-raw-slide-down"
      )}
    >
      <Button
        asChild
        variant="default"
        size="sm"
        className={cn("h-10 shrink-0", className)}
        disabled={totalItems === 0}
      >
        <Component
          href={`${generateTenantPathname(tenantSlug)}/checkout`}
          onClick={handlePreventUser}
        >
          <ShoppingCartIcon /> {t("Checkout")} ({totalLabel})
        </Component>
      </Button>
    </div>
  );
};

export const CheckoutButtonSkeleton = () => {
  return (
    <Button
      disabled
      variant="default"
      size="sm"
      className="bg-background h-10 shrink-0"
    >
      <ShoppingCartIcon className="fill-black" />
      <LoaderIcon className="size-4 animate-spin" />
    </Button>
  );
};

export default CheckoutButton;
