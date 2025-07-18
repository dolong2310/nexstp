import { cn } from "@/lib/utils";
import { StarIcon } from "lucide-react";
import React, { useState } from "react";

type Props = {
  value?: number;
  disabled?: boolean;
  className?: string;
  onChange?: (value: number) => void;
};

const StarPicker = ({ value = 0, disabled, className, onChange }: Props) => {
  const [hoverValue, setHoverValue] = useState(0);

  const handleChange = (star: number) => {
    onChange?.(star);
  };

  return (
    <div
      className={cn(
        "flex items-center",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            className={cn(
              "p-0.5 hover:scale-110 transition",
              !disabled && "cursor-pointer hover:scale-none"
            )}
            onClick={() => handleChange(star)}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
          >
            <StarIcon
              className={cn(
                "size-5",
                (hoverValue || value) >= star
                  ? "fill-black stroke-black"
                  : "stroke-black" // stroke: màu viền, fill: màu nền
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarPicker;
