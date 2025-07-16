import { formatCurrency, generateTenantUrl } from "@/lib/utils";
import { StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

type Props = {
  id: string;
  name: string;
  imageUrl?: string | null;
  authorUsername: string;
  authorImageUrl?: string | null;
  reviewRating: number;
  reviewCount: number;
  price: number;
};

const ProductCard = ({
  id,
  name,
  imageUrl,
  authorUsername,
  authorImageUrl,
  reviewRating,
  reviewCount,
  price,
}: Props) => {
  const router = useRouter();

  const handleUserClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    router.push(generateTenantUrl(authorUsername));
  };

  return (
    <Link
      href={`${generateTenantUrl(authorUsername)}/products/${id}`}
      className="no-underline"
    >
      <div className="flex flex-col border rounded-md bg-white overflow-hidden h-full transition-shadow hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="relative aspect-square">
          <Image
            src={imageUrl || "/placeholder-bg.jpg"}
            alt={name}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-3 flex-1 border-y p-4">
          <h2 className="text-lg font-medium line-clamp-4">{name}</h2>
          <div className="flex items-center gap-2" onClick={handleUserClick}>
            {authorImageUrl && (
              <Image
                src={authorImageUrl}
                alt={authorUsername}
                width={16}
                height={16}
                className="rounded-full border shrink-0 size-4"
              />
            )}
            <p className="text-sm underline font-medium">{authorUsername}</p>
          </div>

          {reviewCount > 0 && (
            <div className="flex items-center gap-1">
              <StarIcon className="size-3.5 fill-black" />
              <p className="text-sm font-medium">
                {reviewRating} ({reviewCount})
              </p>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="relative px-2 py-1 border bg-pink-400 w-fit">
            <p className="text-sm font-medium">{formatCurrency(price)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="w-full aspect-3/4 bg-neutral-200 rounded-lg animate-pulse" />
  );
};

export default ProductCard;
