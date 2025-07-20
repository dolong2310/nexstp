import Providers from "@/components/providers";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import {
  metadataKeywords,
  metadataOpenGraph,
  metadataRobots,
} from "./shared-metadata";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
  title: {
    default: "Nexstp",
    template: "%s | Nexstp",
  },
  description:
    "Discover amazing products from various stores in our multi-tenant marketplace",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.className} antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
