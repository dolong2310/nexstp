import Media from "@/components/media";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/contexts/ThemeContext";
import { Link, useRouter } from "@/i18n/navigation";
import {
  cn,
  fallbackImageUrl,
  formatName,
  generateTenantPathname,
} from "@/lib/utils";
import { StarIcon } from "lucide-react";
import { MouseEvent } from "react";

interface Props {
  id: string;
  name: string;
  imageUrl?: string | null;
  authorUsername: string;
  authorImageUrl?: string | null;
  reviewRating: number;
  reviewCount: number;
}

const ProductCard = ({
  id,
  name,
  imageUrl,
  authorUsername,
  authorImageUrl,
  reviewRating,
  reviewCount,
}: Props) => {
  const { theme } = useTheme();
  const router = useRouter();

  const handleUserClick = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    router.push(generateTenantPathname(authorUsername));
  };

  return (
    <Link prefetch href={`/library/${id}`}>
      <Card
        shadowTransition
        className={cn(
          "group relative flex flex-col border-2 rounded-base bg-background overflow-hidden h-full",
          "py-0 gap-0"
        )}
      >
        <Media
          src={fallbackImageUrl(imageUrl, theme)}
          alt={name}
          fill
          className="object-cover"
        />

        <div className="flex flex-col gap-3 flex-1 border-y-2 p-4">
          <h2 className="text-lg font-medium line-clamp-2 break-words">
            {name}
          </h2>

          <div className="flex items-center gap-2" onClick={handleUserClick}>
            <Avatar className="size-4">
              <AvatarImage src={authorImageUrl!} alt={authorUsername} />
              <AvatarFallback className="text-xs">
                {formatName(authorUsername)}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm underline font-medium truncate overflow-hidden">
              {authorUsername}
            </p>
          </div>

          {reviewCount > 0 && (
            <div className="flex items-center gap-1">
              <StarIcon className="size-3.5 fill-black dark:fill-white" />
              <p className="text-sm font-medium">
                {reviewRating} ({reviewCount})
              </p>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export const ProductCardSkeleton = () => {
  return (
    <Card
      className={cn(
        "relative flex flex-col border-2 rounded-base bg-background overflow-hidden h-full",
        "py-0 gap-0"
      )}
    >
      <Skeleton className="w-full aspect-square bg-secondary-background animate-pulse border-0 border-b-2 rounded-bl-none rounded-br-none" />

      <div className="flex flex-col gap-3 flex-1 border-y p-4">
        <Skeleton className="h-6 bg-secondary-background animate-pulse w-full" />
        <Skeleton className="h-4 bg-secondary-background animate-pulse w-3/4" />
        <Skeleton className="h-4 bg-secondary-background animate-pulse w-1/2" />
      </div>
    </Card>
  );
};

export default ProductCard;
