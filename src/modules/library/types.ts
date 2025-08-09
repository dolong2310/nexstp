import { Launchpad, Media, Product } from "@/payload-types";

export type LaunchpadProduct = Omit<
  Launchpad,
  | "title"
  | "launchPrice"
  | "createdProduct"
  | "duration"
  | "startTime"
  | "endTime"
  | "priority"
  | "rejectionReason"
  | "soldCount"
  | "status"
> & {
  name: string;
  price: number;
  cover?: Media | null;
  originalPrice: number;
};

export type LaunchpadProductWithSource = LaunchpadProduct & {
  originalPrice: number;
  sourceType: "launchpad" | "manual";
  sourceLaunchpad: string;
  isFromLaunchpad: boolean;
};

export type ProductWithSource = Product & {
  originalPrice: number;
  sourceType: "launchpad" | "manual";
  isFromLaunchpad: boolean;
};
