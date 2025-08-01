import { THROTTLE_INTERVAL_MS } from "@/constants";
import { throttle } from "@/lib/utils";
import { RefObject, useCallback, useEffect, useState } from "react";

interface UseScrollHeightProps {
  ref: RefObject<HTMLDivElement | null> | RefObject<HTMLDivElement>;
  minHeight?: number;
  maxHeight?: number;
}

const useScrollHeight = ({
  ref,
  minHeight = 0,
  maxHeight = Infinity,
}: UseScrollHeightProps) => {
  const [dynamicHeight, setDynamicHeight] = useState<number | null>(null);

  const calculateDynamicHeight = useCallback(() => {
    if (ref.current) {
      const elementHeight = ref.current.clientHeight;
      const maxScroll = maxHeight - minHeight; // Ngưỡng tối đa để xử lý
      const scrollPosition = Math.min(window.scrollY, maxScroll); // Giới hạn scrollY
      const adjustedHeight = Math.max(
        minHeight,
        Math.min(maxHeight, elementHeight - scrollPosition)
      );
      setDynamicHeight(adjustedHeight);
    }
  }, [ref, minHeight, maxHeight]);

  useEffect(() => {
    calculateDynamicHeight();

    const throttledCalculate = throttle(
      calculateDynamicHeight,
      THROTTLE_INTERVAL_MS
    );

    window.addEventListener("scroll", throttledCalculate, {
      passive: true,
    });
    window.addEventListener("resize", throttledCalculate, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", throttledCalculate);
      window.removeEventListener("resize", throttledCalculate);
    };
  }, [calculateDynamicHeight]);

  return [dynamicHeight];
};

export default useScrollHeight;
