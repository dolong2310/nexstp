import { useCallback, useEffect, useRef, useState } from "react";

export const useScrollControl = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAnchorRef = useRef<string | null>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Hàm giữ vị trí scroll
  const maintainScrollPosition = useCallback(() => {
    if (!containerRef.current || !scrollAnchorRef.current) return;

    const anchorElement = document.getElementById(scrollAnchorRef.current);
    if (anchorElement) {
      anchorElement.scrollIntoView({ block: "center" });
    }
  }, []);

  // Hàm để lưu anchor
  const setScrollAnchor = useCallback((elementId: string | null) => {
    scrollAnchorRef.current = elementId;
  }, []);

  // Theo dõi sự kiện scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsUserScrolling(true);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Hàm đánh dấu component đã khởi tạo
  const markAsInitialized = useCallback(() => {
    setIsInitialized(true);
  }, []);

  return {
    containerRef,
    isUserScrolling,
    setIsUserScrolling,
    isInitialized,
    markAsInitialized,
    setScrollAnchor,
    maintainScrollPosition,
  };
};
