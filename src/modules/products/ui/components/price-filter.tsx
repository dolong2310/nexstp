"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"
import React, { ChangeEvent } from "react";

interface Props {
  minPrice?: string | null;
  maxPrice?: string | null;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
}

export const formatAsCurrency = (value: string) => {
  const numericValue = value.replace(/[^0-9.]/g, "");

  const parts = numericValue.split(".");
  const formattedValue =
    parts[0] + (parts.length > 1 ? "." + parts[1]?.slice(0, 2) : "");

  if (!formattedValue) return "";

  const numberValue = parseFloat(formattedValue);
  if (isNaN(numberValue)) return "";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numberValue);
};

const PriceFilter = ({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
}: Props) => {
  const handleMinimumPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Get the raw input value and extract only numeric values
    const numericValue = e.target.value.replace(/[^0-9.]/g, "");
    onMinPriceChange(numericValue);
  };

  const handleMaximumPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Get the raw input value and extract only numeric values
    const numericValue = e.target.value.replace(/[^0-9.]/g, "");
    onMaxPriceChange(numericValue);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="min-price">
          Minimum price
        </Label>
        <Input
          id="min-price"
          type="text"
          placeholder="$0"
          value={minPrice ? formatAsCurrency(minPrice) : ""}
          onChange={handleMinimumPriceChange}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="max-price">
          Maximum price
        </Label>
        <Input
          id="max-price"
          type="text"
          placeholder="∞"
          value={maxPrice ? formatAsCurrency(maxPrice) : ""}
          onChange={handleMaximumPriceChange}
        />
      </div>
    </div>
  );
};

export default PriceFilter;
