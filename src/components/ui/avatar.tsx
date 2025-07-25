"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

function Avatar({
  className,
  isOnline = false,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & { isOnline?: boolean }) {
  return (
    <div className="relative inline-block">
      <AvatarPrimitive.Root
        data-slot="avatar"
        className={cn(
          "relative flex size-8 shrink-0 overflow-hidden rounded-md",
          className
        )}
        {...props}
      />
      {isOnline && (
        <span
          className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white"
          style={{ transform: "translate(25%,-25%)" }}
        />
      )}
    </div>
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-md",
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
