import Media from "@/components/media";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency, formatName, generateTenantUrl } from "@/lib/utils";
import useCart from "@/modules/checkout/hooks/use-cart";
import { StarIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { CartButtonSkeleton } from "../components/cart-button";

const CartButton = dynamic(
  () => import("../components/cart-button").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <CartButtonSkeleton className="py-8 rounded-none rounded-bl-md rounded-br-md border-b-0 border-x-0" />
    ),
  }
);

interface Props {
  id: string;
  name: string;
  imageUrl?: string | null;
  authorUsername: string;
  authorImageUrl?: string | null;
  reviewRating: number;
  reviewCount: number;
  price: number;
  tenantSlug: string;
  isPurchased?: boolean;
  isOwner?: boolean;
}

const ProductCard = ({
  id,
  name,
  imageUrl,
  authorUsername,
  authorImageUrl,
  reviewRating,
  reviewCount,
  price,
  tenantSlug,
  isPurchased,
  isOwner,
}: Props) => {
  const cart = useCart();
  const isCartButtonVisible =
    cart.isProductInCart(id, tenantSlug) || isPurchased || isOwner;

  return (
    <Card
      shadowTransition
      className={cn(
        "group relative flex flex-col border-2 rounded-md bg-background overflow-hidden h-full",
        "py-0 gap-0"
      )}
    >
      <Link href={`${generateTenantUrl(authorUsername)}/products/${id}`}>
        <Media
          src={imageUrl || "/placeholder-bg.jpg"}
          alt={name}
          fill
          className="object-cover"
        />
      </Link>

      <div className="flex flex-col gap-3 flex-1 border-y-2 p-4">
        <Link href={`${generateTenantUrl(authorUsername)}/products/${id}`}>
          <h2 className="text-lg font-medium line-clamp-4">{name}</h2>
        </Link>

        <Link href={generateTenantUrl(authorUsername)}>
          <div className="flex items-center gap-2">
            <Avatar className="size-4">
              <AvatarImage src={authorImageUrl!} alt={authorUsername} />
              <AvatarFallback className="text-xs">
                {formatName(authorUsername)}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm underline font-medium">{authorUsername}</p>
          </div>
        </Link>

        {reviewCount > 0 && (
          <div className="flex items-center gap-1">
            <StarIcon className="size-3.5 fill-black dark:fill-white" />
            <p className="text-sm font-medium">
              {reviewRating} ({reviewCount})
            </p>
          </div>
        )}
      </div>

      <div
        className={cn(
          "p-4 opacity-100 group-hover:opacity-0 transition-all",
          isCartButtonVisible && "opacity-0 pointer-events-none"
        )}
      >
        <Badge>
          <p className="text-sm font-medium">{formatCurrency(price)}</p>
        </Badge>
      </div>

      <div
        className={cn(
          "absolute -bottom-10 left-0 right-0 flex items-center justify-center opacity-0 transition-all pointer-events-none",
          "group-hover:opacity-100 group-hover:bottom-0 group-hover:pointer-events-auto",
          isCartButtonVisible && "opacity-100 bottom-0 pointer-events-auto"
        )}
      >
        <CartButton
          className="py-8 rounded-none rounded-bl-md rounded-br-md border-b-0 border-x-0"
          tenantSlug={tenantSlug}
          productId={id}
          isPurchased={isPurchased}
          isOwner={isOwner}
        />
      </div>
    </Card>
  );
};

export const ProductCardSkeleton = () => {
  return (
    <Card
      className={cn(
        "relative flex flex-col border rounded-md bg-background overflow-hidden h-full",
        "py-0 gap-0"
      )}
    >
      <Skeleton className="w-full aspect-square bg-secondary-background animate-pulse rounded-bl-none rounded-br-none" />

      <div className="flex flex-col gap-3 flex-1 border-y p-4">
        <Skeleton className="h-6 bg-secondary-background animate-pulse w-full" />
        <Skeleton className="h-4 bg-secondary-background animate-pulse w-3/4" />
        <Skeleton className="h-4 bg-secondary-background animate-pulse w-1/2" />
      </div>

      <div className="p-4">
        <Skeleton className="h-6 bg-secondary-background animate-pulse w-1/3" />
      </div>
    </Card>
  );
};

export default ProductCard;
