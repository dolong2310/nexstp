import Media from "@/components/media";
import { cn, formatCurrency } from "@/lib/utils";
import Link from "next/link";

type Props = {
  isLast?: boolean;
  name: string;
  price: number;
  imageUrl?: string | null;
  productUrl: string;
  tenantUrl: string;
  tenantName: string;
  onRemove: () => void;
};

const CheckoutItem = ({
  isLast,
  name,
  price,
  imageUrl,
  productUrl,
  tenantUrl,
  tenantName,
  onRemove,
}: Props) => {
  return (
    <div
      className={cn(
        "grid grid-cols-[8.5rem_1fr_auto] gap-4 pr-4 border-b",
        isLast && "border-b-0"
      )}
    >
      <div className="overflow-hidden border-r">
        <div className="relative aspect-square h-full">
          <Media
            src={imageUrl || "/placeholder-bg.jpg"}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
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

export default CheckoutItem;
