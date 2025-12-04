"use client";

import { cn } from "@/lib/utils";
import { ImageIcon, LoaderIcon } from "lucide-react";
import Image, { ImageProps } from "next/image";
import { forwardRef, memo, useState } from "react";

interface MediaProps extends Omit<ImageProps, "onLoad" | "onError"> {
  containerRef?: React.Ref<HTMLDivElement>;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  showLoading?: boolean;
  showError?: boolean;
  fallbackIcon?: React.ComponentType<{ className?: string }>;
  sizeFallbackIcon?: "sm" | "md" | "lg";
  loadingClassName?: string;
  errorClassName?: string;
  isBordered?: boolean;
  shadow?: boolean;
  shadowTransition?: boolean;
  onLoadComplete?: () => void;
  onLoadError?: (error: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

const sizeIcon = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
};

const Media = forwardRef<HTMLImageElement, MediaProps>(
  (
    {
      src,
      alt = "Image",
      containerRef,
      containerClassName,
      containerStyle,
      className,
      showLoading = true,
      showError = true,
      fallbackIcon: FallbackIcon = ImageIcon,
      sizeFallbackIcon = "md",
      loadingClassName,
      errorClassName,
      isBordered,
      shadow,
      shadowTransition,
      onLoadComplete,
      onLoadError,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const handleImageLoad = () => {
      setImageLoading(false);
      setImageError(false);
      onLoadComplete?.();
    };

    const handleImageError = (
      error: React.SyntheticEvent<HTMLImageElement, Event>
    ) => {
      setImageLoading(false);
      setImageError(true);
      onLoadError?.(error);
    };

    // If no src provided, show fallback immediately
    if (!src) {
      if (!showError) return null;

      return (
        <div
          className={cn(
            "flex items-center justify-center bg-secondary-background rounded-base aspect-square",
            isBordered && "border-2 border-border",
            errorClassName,
            className
          )}
        >
          <div className="flex flex-col items-center justify-center p-4">
            <FallbackIcon
              className={cn("text-foreground mb-2", sizeIcon[sizeFallbackIcon])}
            />
          </div>
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative aspect-square",
          shadow && "shadow-shadow rounded-base border-2 overflow-hidden",
          shadow &&
            shadowTransition &&
            "hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all",
          containerClassName
        )}
        style={containerStyle}
      >
        {/* Loading State */}
        {imageLoading && showLoading && !imageError && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-secondary-background rounded-base z-10",
              isBordered && "border-2 border-border",
              loadingClassName
            )}
          >
            <LoaderIcon className="size-4 animate-spin text-foreground" />
          </div>
        )}

        {/* Error/Fallback State */}
        {imageError && showError && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-secondary-background rounded-base z-10",
              isBordered && "border-2 border-border",
              errorClassName
            )}
          >
            <div className="flex flex-col gap-2 items-center justify-center p-4">
              <FallbackIcon
                className={cn("text-foreground", sizeIcon[sizeFallbackIcon])}
              />
            </div>
          </div>
        )}

        {/* Image */}
        <Image
          ref={ref}
          src={src}
          alt={alt}
          className={cn(
            "transition-opacity duration-200 bg-secondary-background",
            imageLoading ? "opacity-0" : "opacity-100",
            imageError && "opacity-0",
            isBordered && "border-2 border-border",
            className
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          {...props}
        />
      </div>
    );
  }
);

Media.displayName = "Media";

export default memo(Media, (prev, next) => {
  return (
    prev.src === next.src &&
    prev.className === next.className &&
    prev.alt === next.alt &&
    prev.fill === next.fill &&
    prev.priority === next.priority
  );
});
