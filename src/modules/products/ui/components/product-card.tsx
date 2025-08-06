import Media from "@/components/media";
import { cn, formatCurrency, generateTenantUrl } from "@/lib/utils";
import { StarIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { CartButtonSkeleton } from "../components/cart-button";
import useCart from "@/modules/checkout/hooks/use-cart";

const CartButton = dynamic(
  () => import("../components/cart-button").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <CartButtonSkeleton />,
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
  const isCartButtonVisible = cart.isProductInCart(id, tenantSlug) || isPurchased || isOwner;

  return (
    <article className="group relative flex flex-col border rounded-md bg-background overflow-hidden h-full hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-x-[4px] hover:-translate-y-[4px] transition-all">
      <Link href={`${generateTenantUrl(authorUsername)}/products/${id}`}>
        <Media
          src={imageUrl || "/placeholder-bg.jpg"}
          alt={name}
          fill
          className="object-cover"
        />
      </Link>

      <div className="flex flex-col gap-3 flex-1 border-y p-4">
        <Link href={`${generateTenantUrl(authorUsername)}/products/${id}`}>
          <h2 className="text-lg font-medium line-clamp-4">{name}</h2>
        </Link>

        <Link href={generateTenantUrl(authorUsername)}>
          <div className="flex items-center gap-2">
            {authorImageUrl && (
              <Media
                src={authorImageUrl}
                alt={authorUsername}
                width={16}
                height={16}
                sizeFallbackIcon="sm"
                className="rounded-full border shrink-0 size-4"
              />
            )}
            <p className="text-sm underline font-medium">{authorUsername}</p>
          </div>
        </Link>

        {reviewCount > 0 && (
          <div className="flex items-center gap-1">
            <StarIcon className="size-3.5 fill-black" />
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
        <div className="relative px-2 py-1 border bg-feature w-fit">
          <p className="text-sm font-medium">{formatCurrency(price)}</p>
        </div>
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
          isDefaultButton
          tenantSlug={tenantSlug}
          productId={id}
          isPurchased={isPurchased}
          isOwner={isOwner}
        />
      </div>
    </article>
  );
};

export const ProductCardSkeleton = () => {
  return (
    <article className="flex flex-col border rounded-md bg-background overflow-hidden h-full">
      <div className="relative aspect-square bg-gray-200 animate-pulse" />
      <div className="flex flex-col gap-3 flex-1 border-y p-4">
        <div className="h-4 bg-gray-200 animate-pulse w-full" />
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-gray-200 animate-pulse shrink-0 size-4" />
          <div className="h-3 bg-gray-200 animate-pulse w-24" />
        </div>
        <div className="flex items-center gap-1">
          <StarIcon className="size-3.5 fill-gray-300" />
          <div className="h-3 bg-gray-200 animate-pulse w-16" />
        </div>
      </div>
      <div className="p-4">
        <div className="h-4 bg-gray-200 animate-pulse w-16" />
      </div>
    </article>
  );
};

export default ProductCard;
