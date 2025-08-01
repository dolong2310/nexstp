import { THROTTLE_INTERVAL_MS } from "@/constants";
import { throttle } from "@/lib/utils";
import { RefObject, useCallback, useEffect, useState } from "react";

interface Props {
  containerRef?: RefObject<HTMLDivElement | null> | RefObject<HTMLDivElement>;
  contentRef?: RefObject<HTMLDivElement | null> | RefObject<HTMLDivElement>;
  avatarRef?: RefObject<HTMLImageElement | null> | RefObject<HTMLImageElement>;
}

export const MAX_HEIGHT_CONTAINER = 162; // 162px
export const MIN_HEIGHT_CONTAINER = 50; // 50px
export const MAX_SIZE_AVATAR = 90; // 90px
export const MIN_SIZE_AVATAR = 34; // 34px
export const MAX_TRANSLATE_Y = 16; // -16px

const useScrollDynamicSize = ({}: Props) => {
  const [heightAvatar, setHeightAvatar] = useState(MAX_SIZE_AVATAR);
  const [heightContainer, setHeightContainer] = useState(MAX_HEIGHT_CONTAINER);
  const [translateY, setTranslateY] = useState(0);

  const calculateDynamicSize = useCallback(() => {
    const maxScroll = MAX_HEIGHT_CONTAINER - MIN_HEIGHT_CONTAINER; // Ngưỡng tối đa để xử lý

    const scrollY = Math.min(window.scrollY, maxScroll); // Giới hạn scrollY
    const avatarHeight = Math.max(MAX_SIZE_AVATAR - scrollY, MIN_SIZE_AVATAR);
    const containerHeight = Math.max(
      MAX_HEIGHT_CONTAINER - scrollY,
      MIN_HEIGHT_CONTAINER
    );
    const translateY = Math.min(
      (scrollY / maxScroll) * MAX_TRANSLATE_Y,
      MAX_TRANSLATE_Y
    );
    setHeightAvatar(avatarHeight);
    setHeightContainer(containerHeight);
    setTranslateY(translateY);

    // if (avatarRef.current) {
    //   avatarRef.current.style.height = `${avatarHeight}px`;
    //   avatarRef.current.style.width = `${avatarHeight}px`;
    // }
    // if (containerRef.current) {
    //   containerRef.current.style.maxHeight = `${containerHeight}px`;
    // }
    // if (contentRef.current) {
    //   const translateY = Math.min(
    //     (scrollY / maxScroll) * MAX_TRANSLATE_Y,
    //     MAX_TRANSLATE_Y
    //   );
    //   contentRef.current.style.transform = `translateY(-${translateY}px)`;
    // }
  }, []);

  useEffect(() => {
    calculateDynamicSize();

    const throttledCalculate = throttle(
      calculateDynamicSize,
      THROTTLE_INTERVAL_MS
    );

    window.addEventListener("scroll", throttledCalculate, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", throttledCalculate);
    };
  }, [calculateDynamicSize]);

  return [heightContainer, heightAvatar, translateY] as const;
};

export default useScrollDynamicSize;
