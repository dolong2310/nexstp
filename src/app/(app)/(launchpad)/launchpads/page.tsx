import { LaunchpadsView } from "@/modules/launchpads/ui/launchpad-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Launchpads - Exclusive Early Access Deals",
  description:
    "Discover amazing products at launch prices. Limited time offers with special discounts before they go to regular price.",
  keywords: [
    "launchpad",
    "early access",
    "deals",
    "discounts",
    "new products",
    "limited time",
  ],
  openGraph: {
    title: "Launchpads - Exclusive Early Access Deals",
    description:
      "Get early access to amazing products at special launch prices",
    type: "website",
  },
};

export default function LaunchpadsPage() {
  return <LaunchpadsView />;
}
