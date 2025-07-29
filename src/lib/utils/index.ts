import { IS_DEVELOPMENT } from "@/constants";
import { Media } from "@/payload-types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTenantUrl(slug: string) {
  const enableSubdomainRouting =
    process.env.NEXT_PUBLIC_ENABLE_SUBDOMAIN_ROUTING === "true";

  // In development mode or subdomain routing disabled, use normal routing
  if (IS_DEVELOPMENT || !enableSubdomainRouting) {
    return `${process.env.NEXT_PUBLIC_APP_URL}/tenants/${slug}`;
  }

  const protocol = "https";
  const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN!;

  // In production, use the subdomain routing (e.g: "https://something.nexstp.com")
  return `${protocol}://${slug}.${domain}`;
}

export function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatName(name: string): string {
  if (!name) return "";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0]?.[0]?.toUpperCase() || "";
  const initials = (words[0]?.[0] || "") + (words[words.length - 1]?.[0] || "");
  return initials.toUpperCase();
}

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data:image/png;base64, prefix
      const base64Data = base64.split(",")[1];
      if (!base64Data) {
        reject(new Error("Invalid base64 format"));
        return;
      }
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const getCurrentImageUrl = (image: string | Media | undefined) => {
  const fallback = "/default-avatar.png";
  if (typeof image === "string" && image && image.startsWith("http")) {
    return image;
  }
  if (image && typeof image === "object" && "url" in image) {
    return process.env.NEXT_PUBLIC_APP_URL! + (image as Media)?.url || fallback;
  }
  return fallback;
};
