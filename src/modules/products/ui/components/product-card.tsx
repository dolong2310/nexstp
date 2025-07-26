import Media from "@/components/media";
import { formatCurrency, generateTenantUrl } from "@/lib/utils";
import { StarIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

interface Props {
  id: string;
  name: string;
  imageUrl?: string | null;
  authorUsername: string;
  authorImageUrl?: string | null;
  reviewRating: number;
  reviewCount: number;
  price: number;
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
      <div className="flex flex-col border rounded-md bg-background overflow-hidden h-full hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-x-[4px] hover:-translate-y-[4px] transition-all">
        <Media
          src={imageUrl || "/placeholder-bg.jpg"}
          alt={name}
          fill
          className="object-cover"
        />

        <div className="flex flex-col gap-3 flex-1 border-y p-4">
          <h2 className="text-lg font-medium line-clamp-4">{name}</h2>
          <div className="flex items-center gap-2" onClick={handleUserClick}>
            {authorImageUrl && (
              <Media
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
          <div className="relative px-2 py-1 border bg-feature w-fit">
            <p className="text-sm font-medium">{formatCurrency(price)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="flex flex-col border rounded-md bg-background overflow-hidden h-full">
      <div className="relative aspect-square bg-gray-200 animate-pulse" />
      <div className="flex flex-col gap-3 flex-1 border-y p-4">
        <div className="h-5 bg-gray-200 animate-pulse w-full mb-2" />
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
        <div className="relative px-2 py-1 border bg-feature w-fit">
          <div className="h-4 bg-gray-200 animate-pulse w-16" />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
