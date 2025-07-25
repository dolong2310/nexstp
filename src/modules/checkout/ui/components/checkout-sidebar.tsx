import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { CircleXIcon } from "lucide-react";
import React from "react";

interface Props {
  totalPrice: number;
  isPending?: boolean;
  isCanceled?: boolean;
  onPurchase: () => void;
};

const CheckoutSidebar = ({
  totalPrice,
  isPending,
  isCanceled,
  onPurchase,
}: Props) => {
  return (
    <div className="flex flex-col rounded-md border overflow-hidden bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <h4 className="font-medium text-lg">Total</h4>
        <p className="font-medium text-lg">{formatCurrency(totalPrice)}</p>
      </div>
      <div className="flex items-center justify-between p-4">
        <Button
          variant="elevated"
          size="lg"
          disabled={isPending}
          className="text-base w-full text-secondary bg-primary hover:bg-feature hover:text-primary"
          onClick={onPurchase}
        >
          Checkout
        </Button>
      </div>

      {isCanceled && (
        <div className="flex items-center justify-center border-t p-4">
          <div className="flex items-center w-full border border-red-400 bg-red-100 font-medium px-4 py-3 rounded">
            <div className="flex items-center">
              <CircleXIcon className="size-6 mr-2 fill-red-500 text-red-100" />
              <span className="text-black">Checkout failed. Please try again.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutSidebar;
