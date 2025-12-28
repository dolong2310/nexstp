import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { defaultConfigTopLoader } from "@/constants";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Script from "next/script";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import {
  metadataKeywords,
  metadataOpenGraph,
  metadataRobots,
} from "./shared-metadata";

import { routing } from "@/i18n/routing";
import { hasLocale, Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap", // Prevent FOIT (Flash of Invisible Text)
  preload: true, // Preload font for better performance
  fallback: ["system-ui", "arial", "sans-serif"], // Fallback fonts
  adjustFontFallback: true, // Adjust fallback font metrics to minimize layout shift
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allow zoom for accessibility
  userScalable: true,
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({
    locale: locale as Locale,
  });

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
    title: {
      default: "Nexstp",
      template: "%s | Nexstp",
    },
    description: t(
      "Discover amazing products from various stores in our multi-tenant marketplace"
    ),
    authors: [{ name: "Nexstp" }],
    creator: "Nexstp",
    publisher: "Nexstp",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      siteName: "Nexstp",
      ...metadataOpenGraph,
    },
    twitter: {
      card: "summary_large_image",
      creator: "@Nexstp",
    },
    verification: {
      google: "your-google-verification-code",
    },
    ...metadataKeywords,
    ...metadataRobots,
  };
}

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ children, params }: Props) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const getTheme = async () => {
    const cookieStore = await cookies();
    return cookieStore.get("theme")?.value || "light";
  };
  const defaultTheme = await getTheme();

  return (
    <html lang={locale} className={defaultTheme} suppressHydrationWarning>
      <body className={`${dmSans.className} antialiased`}>
        <Providers locale={locale}>
          <NextTopLoader {...defaultConfigTopLoader} />
          {children}
          <Toaster />
        </Providers>

      {/* Emo Widget - AI support widget */}
        <Script
          src="https://emo-widget.vercel.app/widget.js"
          data-organization-id="org_37UHOLo4xEgdB2TTplXOQGMSXD7"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
