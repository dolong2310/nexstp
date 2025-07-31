import { toast } from "@/components/custom-toast";
import { Button } from "@/components/ui/button";
import useSession from "@/hooks/use-session";
import { cn, generateTenantUrl } from "@/lib/utils";
import { LoaderIcon, ShoppingCartIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useCart from "../../hooks/use-cart";

interface Props {
  className?: string;
  hideIfEmpty?: boolean;
  tenantSlug: string;
}

const CheckoutButton = ({ className, hideIfEmpty, tenantSlug }: Props) => {
  const router = useRouter();
  const cart = useCart(tenantSlug);
  const { user } = useSession();
  const totalItems = cart.totalItems;

  const Component = !user ? "button" : Link;

  const handleClick = () => {
    if (!user) {
      toast.info("Please sign in to proceed with checkout");
      setTimeout(() => router.push("/sign-in"), 2000);
    }
  };

  if (hideIfEmpty && totalItems === 0) {
    return null;
  }

  return (
    <Button
      asChild
      variant="elevated"
      className={cn("bg-background", className)}
    >
      <Component
        href={`${generateTenantUrl(tenantSlug)}/checkout`}
        onClick={handleClick}
      >
        <ShoppingCartIcon /> {totalItems > 0 ? totalItems : ""}
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
