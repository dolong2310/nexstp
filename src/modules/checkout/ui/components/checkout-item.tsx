import Media from "@/components/media";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/contexts/ThemeContext";
import { fallbackImageUrl, formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface Props {
  name: string;
  price: number;
  imageUrl?: string | null;
  productUrl: string;
  tenantUrl: string;
  tenantName: string;
  onRemove: () => void;
}

const CheckoutItem = ({
  name,
  price,
  imageUrl,
  productUrl,
  tenantUrl,
  tenantName,
  onRemove,
}: Props) => {
  const { theme } = useTheme();
  return (
    <div className="grid grid-cols-[8.5rem_1fr_auto] gap-4 pr-4 bg-background border-2 rounded-base shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all">
      <Media
        src={fallbackImageUrl(imageUrl, theme)}
        alt={name}
        fill
        className="object-cover border-r-2 rounded-tl-base rounded-bl-base"
      />

      <div className="flex flex-col justify-between py-4">
        <div className="">
          <Link href={productUrl}>
            <h4 className="font-bold underline">{name}</h4>
          </Link>
          <Link href={tenantUrl}>
            <p className="font-medium underline mt-2">{tenantName}</p>
          </Link>
        </div>
      </div>

      <div className="flex flex-col justify-between py-4">
        <p className="font-medium">{formatCurrency(price)}</p>
        <button
          type="button"
          className="font-medium underline cursor-pointer"
          onClick={onRemove}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export const CheckoutItemSkeleton = () => {
  return (
    <div className="grid grid-cols-[8.5rem_1fr_auto] gap-4 pr-4 bg-background border-2 rounded-base shadow-shadow">
      <div className="border-r-2 rounded-tl-base rounded-bl-base overflow-hidden">
        <Skeleton className="aspect-square size-full animate-pulse border-0 rounded-none" />
      </div>

      <div className="flex flex-col justify-between py-4">
        <div className="space-y-2">
          <Skeleton className="w-3/4 h-4 bg-secondary-background animate-pulse" />
          <Skeleton className="w-1/2 h-4 bg-secondary-background animate-pulse mt-2" />
        </div>
      </div>

      <div className="flex flex-col justify-between py-4">
        <Skeleton className="w-full h-4 bg-secondary-background animate-pulse" />
        <p className="font-medium underline cursor-not-allowed">Remove</p>
      </div>
    </div>
  );
};

export default CheckoutItem;
