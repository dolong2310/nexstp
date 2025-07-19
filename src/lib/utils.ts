import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTenantUrl(slug: string) {
  // In development mode, use normal routing
  if (process.env.NODE_ENV === "development") {
    return `${process.env.NEXT_PUBLIC_APP_URL}/tenants/${slug}`;
  }

  const protocol = "https";
  const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN!;

  // if (process.env.NODE_ENV === "development") {
  //   protocol = "http";
  // }

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
