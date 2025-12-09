"use client";

import { cn } from "@/lib/utils";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleXIcon,
  InfoIcon,
  XIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";
import { toast as sonnerToast } from "sonner";
import { Button } from "./ui/button";

interface ToastProps {
  id: string | number;
  message: React.ReactNode;
  type?: "success" | "error" | "info" | "warning" | "none";
  title?: React.ReactNode;
  description?: React.ReactNode;
  duration?: number;
  button?: {
    label?: string;
    onClick?: () => void;
  };
}

export const toast = {
  success: (
    message: React.ReactNode,
    options?: Omit<ToastProps, "id" | "message">
  ) => toaster(message, { type: "success", ...options }),
  error: (
    message: React.ReactNode,
    options?: Omit<ToastProps, "id" | "message">
  ) => toaster(message, { type: "error", ...options }),
  info: (
    message: React.ReactNode,
    options?: Omit<ToastProps, "id" | "message">
  ) => toaster(message, { type: "info", ...options }),
  warning: (
    message: React.ReactNode,
    options?: Omit<ToastProps, "id" | "message">
  ) => toaster(message, { type: "warning", ...options }),
  custom: (
    message: React.ReactNode,
    options?: Omit<ToastProps, "id" | "message">
  ) => toaster(message, { type: "none", ...options }),
};

function toaster(
  message: React.ReactNode,
  toast?: Omit<ToastProps, "id" | "message">
) {
  return sonnerToast.custom(
    (id) => (
      <NexstpToast
        id={id}
        type={toast?.type}
        message={message}
        title={toast?.title}
        description={toast?.description}
        button={{
          label: toast?.button?.label,
          onClick: toast?.button?.onClick,
        }}
      />
    ),
    {
      duration: toast?.duration || 5000,
    }
  );
}

const NexstpToast = (props: ToastProps) => {
  const { type = "none", message, title, description, button, id } = props;

  const titleTxt = useMemo(() => {
    if (title) {
      if (typeof title === "string") {
        return <p className="text-md font-medium text-foreground">{title}</p>;
      }
      return title;
    }
    if (typeof message === "string") {
      return <p className="text-md font-medium text-foreground">{message}</p>;
    }
    return message;
  }, [title, message]);

  const descriptionTxt = useMemo(() => {
    if (typeof description === "string") {
      return <p className="mt-1 text-sm text-foreground">{description}</p>;
    }
    return description;
  }, [description]);

  const Icon = useMemo(() => {
    switch (type) {
      case "success":
        return <CircleCheckIcon className="size-5 stroke-green-500/80" />;
      case "error":
        return <CircleXIcon className="size-5 stroke-red-500/80" />;
      case "info":
        return <InfoIcon className="size-5 stroke-foreground/80" />;
      case "warning":
        return <CircleAlertIcon className="size-5 stroke-yellow-500/80" />;
      default:
        return null;
    }
  }, [type]);

  return (
    <div
      className={cn(
        "flex items-center rounded-lg bg-secondary-background border w-full md:max-w-[364px] p-4",
        "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] -translate-x-[4px] -translate-y-[4px]"
      )}
    >
      <div
        className={cn(
          "flex flex-1 items-center gap-2",
          description && "items-start"
        )}
      >
        <div className={cn("shrink-0", description && "mt-1")}>{Icon}</div>
        <div className="w-full">
          {titleTxt}
          {descriptionTxt}
        </div>
      </div>
      {typeof button?.onClick === "function" && (
        <div className="ml-5 shrink-0">
          <Button
            variant="default"
            size={button?.label ? "sm" : "icon"}
            className="text-sm font-medium"
            onClick={() => {
              button?.onClick?.();
              sonnerToast.dismiss(id);
            }}
          >
            {button?.label || <XIcon className="size-4" />}
          </Button>
        </div>
      )}
    </div>
  );
};

export default function CustomToast() {
  const t = useTranslations();
  return (
    <>
      <Button
        variant="default"
        onClick={() => toast.success("This is a success toast")}
      >
        {t("Success")}
      </Button>
      <Button
        variant="default"
        onClick={() => toast.error("This is a error toast")}
      >
        {t("Error")}
      </Button>
      <Button
        variant="default"
        onClick={() => toast.warning("This is a warning toast")}
      >
        {t("Warning")}
      </Button>
      <Button
        variant="default"
        onClick={() => toast.info("This is a info toast")}
      >
        {t("Info")}
      </Button>
      <Button
        variant="default"
        onClick={() => toast.custom("This is a custom toast")}
      >
        {t("Custom")}
      </Button>
    </>
  );
}
