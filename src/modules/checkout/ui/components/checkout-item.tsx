import Media from "@/components/media";
import { formatCurrency } from "@/lib/utils";
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
  return (
    <div className="grid grid-cols-[8.5rem_1fr_auto] gap-4 pr-4 border bg-background rounded-md">
      <div className="overflow-hidden border-r">
        <Media
          src={imageUrl || "/placeholder-bg.jpg"}
          alt={name}
          fill
          className="object-cover rounded-md"
        />
      </div>

      <div className="flex flex-col justify-between py-4">
        <div className="">
          <Link href={productUrl}>
            <h4 className="font-bold underline">{name}</h4>
          </Link>
          <Link href={tenantUrl}>
            <h4 className="font-medium underline">{tenantName}</h4>
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
    <div className="grid grid-cols-[8.5rem_1fr_auto] gap-4 pr-4 border bg-background rounded-md">
      <div className="overflow-hidden border-r">
        <div className="aspect-square w-full h-full bg-gray-200 animate-pulse rounded-md" />
      </div>

      <div className="flex flex-col justify-between py-4">
        <div className="space-y-2">
          <div className="w-3/4 h-4 bg-gray-200 animate-pulse" />
          <div className="w-1/2 h-4 bg-gray-200 animate-pulse" />
        </div>
      </div>

      <div className="flex flex-col justify-between py-4">
        <div className="w-1/2 h-4 bg-gray-200 animate-pulse" />
        <div className="w-1/3 h-4 bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
};

export default CheckoutItem;
