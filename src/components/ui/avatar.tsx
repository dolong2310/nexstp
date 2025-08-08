"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";

import * as React from "react";

import { cn } from "@/lib/utils/index";

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
          "relative flex size-10 shrink-0 overflow-hidden rounded-full outline-2 outline-border",
          className
        )}
        {...props}
      />
      {isOnline && (
        <span
          className="absolute top-0 right-0 block h-4 w-4 rounded-full border-2 bg-green-500"
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
        "flex size-full items-center justify-center rounded-full bg-secondary-background text-foreground font-base",
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
