import { RefObject, useEffect, useState, useCallback } from "react";

interface UseScrollHeightProps {
  ref: RefObject<HTMLDivElement | null> | RefObject<HTMLDivElement>;
  minHeight?: number;
}

const useScrollHeight = ({ ref, minHeight = 0 }: UseScrollHeightProps) => {
  const [dynamicHeight, setDynamicHeight] = useState<number | null>(null);

  const calculateDynamicHeight = useCallback(() => {
    if (ref.current) {
      const elementHeight = ref.current.clientHeight;
      const scrollPosition = window.scrollY;
      const adjustedHeight = Math.max(
        minHeight,
        elementHeight - scrollPosition
      );
      setDynamicHeight(adjustedHeight);
    }
  }, [ref, minHeight]);

  useEffect(() => {
    calculateDynamicHeight();

    window.addEventListener("scroll", calculateDynamicHeight, {
      passive: true,
    });
    window.addEventListener("resize", calculateDynamicHeight, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", calculateDynamicHeight);
      window.removeEventListener("resize", calculateDynamicHeight);
    };
  }, [calculateDynamicHeight]);

  return [dynamicHeight];
};

export default useScrollHeight;
