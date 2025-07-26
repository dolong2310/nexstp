"use client";

import { ImageIcon, LoaderIcon } from "lucide-react";
import Image, { ImageProps } from "next/image";
import { useState, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface MediaProps extends Omit<ImageProps, "onLoad" | "onError"> {
  containerClassName?: string;
  showLoading?: boolean;
  showError?: boolean;
  fallbackIcon?: React.ComponentType<{ className?: string }>;
  loadingClassName?: string;
  errorClassName?: string;
  errorLabel?: string;
  onLoadComplete?: () => void;
  onLoadError?: (error: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

const Media = forwardRef<HTMLImageElement, MediaProps>(
  (
    {
      src,
      alt = "Image",
      containerClassName,
      className,
      showLoading = true,
      showError = true,
      fallbackIcon: FallbackIcon = ImageIcon,
      loadingClassName,
      errorClassName,
      errorLabel,
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
            "flex items-center justify-center bg-muted rounded-lg",
            errorClassName,
            className
          )}
        >
          <div className="flex flex-col items-center justify-center p-4">
            <FallbackIcon className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground text-center">
              No image
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className={cn("relative aspect-square", containerClassName)}>
        {/* Loading State */}
        {imageLoading && showLoading && !imageError && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-muted rounded-lg z-10",
              loadingClassName
            )}
          >
            <LoaderIcon className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error/Fallback State */}
        {imageError && showError && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-muted rounded-lg z-10",
              errorClassName
            )}
          >
            <div className="flex flex-col items-center justify-center p-4">
              <FallbackIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground text-center">
                {errorLabel || "Failed to load"}
              </p>
            </div>
          </div>
        )}

        {/* Image */}
        <Image
          ref={ref}
          src={src}
          alt={alt}
          className={cn(
            "transition-opacity duration-200",
            imageLoading ? "opacity-0" : "opacity-100",
            imageError && "opacity-0",
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

export default Media;
